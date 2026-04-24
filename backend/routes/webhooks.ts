import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import getSupabase from '../lib/supabase.js';
import { sendTelegramMessage, eventPriority } from '../lib/telegram.js';

const AGENT_TOKENS = new Map<string, string>([
  ['string', process.env.AGENT_TOKEN_STRING || 'string-secret'],
  ['digit', process.env.AGENT_TOKEN_DIGIT || 'digit-secret'],
  ['promo', process.env.AGENT_TOKEN_PROMO || 'promo-secret'],
  ['main', process.env.AGENT_TOKEN_MAIN || 'main-secret'],
]);

function verifyAgentToken(request: FastifyRequest): string | null {
  const token = request.headers['x-agent-token'] as string | undefined;
  if (!token) return null;
  for (const [agentId, secret] of AGENT_TOKENS) {
    if (secret === token) return agentId;
  }
  return null;
}

// Resolve agent name (e.g. "string") to UUID from agents table
async function resolveAgentUuid(supabase: ReturnType<typeof getSupabase>, agentName: string): Promise<string | null> {
  const { data } = await supabase
    .from('agents')
    .select('id')
    .ilike('name', agentName)
    .maybeSingle();
  return data?.id ?? null;
}

async function insertActivityLog(
  supabase: ReturnType<typeof getSupabase>,
  payload: Record<string, unknown>
) {
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await supabase
      .from('activity_log')
      .insert(currentPayload)
      .select()
      .single();

    if (!result.error) return result;
    if (result.error.code !== 'PGRST204') return result;

    const match = String(result.error.message || '').match(/'([^']+)'/);
    const missingColumn = match?.[1];
    if (!missingColumn) return result;

    // If message doesn't exist but description does, map to description.
    if (missingColumn === 'message' && typeof currentPayload.message === 'string') {
      currentPayload = {
        ...currentPayload,
        description: currentPayload.message,
      };
    }

    delete currentPayload[missingColumn];
  }

  return {
    data: null,
    error: { code: 'PGRST204', message: 'Failed to insert activity_log after fallback attempts' },
  };
}

// Extract agent name from sessionKey (format: agent:mehzam:telegram:group:...)
function extractAgentFromSessionKey(sessionKey: string): string | null {
  const parts = sessionKey.split(':');
  if (parts.length >= 2 && parts[0] === 'agent') {
    return parts[1];
  }
  return null;
}

type ConversationRole = 'user' | 'agent' | 'system';
type ConversationChannel = 'telegram' | 'whatsapp' | 'web';
type ConversationStatus = 'active' | 'archived';

interface WebhookBody {
  agent_id?: string;
  event_type?: string;
  message?: string;
  tool_name?: string;
  session_id?: string;
  success?: boolean;
  error_message?: string;
  started_at?: string;
  context?: {
    content?: string;
    from?: string;
    to?: string;
    channelId?: string;
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ConversationMessage {
  role: ConversationRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

function inferConversationRole(eventType?: string): ConversationRole | null {
  switch (eventType) {
    case 'message:received':
      return 'user';
    case 'message:sent':
      return 'agent';
    case 'session_start':
    case 'session_end':
    case 'session_error':
      return 'system';
    default:
      return null;
  }
}

function inferConversationStatus(eventType?: string): ConversationStatus {
  if (eventType === 'session_end' || eventType === 'session_error') {
    return 'archived';
  }
  return 'active';
}

function inferConversationChannel(sessionKey: string, context?: WebhookBody['context']): ConversationChannel {
  const haystack = `${sessionKey} ${context?.channelId || ''}`.toLowerCase();
  if (haystack.includes('whatsapp')) return 'whatsapp';
  if (haystack.includes('web')) return 'web';
  return 'telegram';
}

function resolveClientName(eventType: string | undefined, body: WebhookBody): string | null {
  const contextMetadata = body.context?.metadata;
  const metadata = body.metadata;

  if (eventType === 'message:sent') {
    const recipient = body.context?.to?.trim();
    return recipient || null;
  }

  const senderName = contextMetadata?.senderName ?? metadata?.senderName;
  if (typeof senderName === 'string' && senderName.trim()) {
    return senderName.trim();
  }

  const sender = body.context?.from?.trim();
  if (sender) return sender;

  return null;
}

function resolveClientId(eventType: string | undefined, body: WebhookBody): string | null {
  const contextMetadata = body.context?.metadata;
  const metadata = body.metadata;

  if (eventType === 'message:sent') {
    const recipient = body.context?.to?.trim();
    return recipient || null;
  }

  const senderId = contextMetadata?.senderId ?? metadata?.senderId;
  if (typeof senderId === 'string' || typeof senderId === 'number') {
    return String(senderId);
  }

  const sender = body.context?.from?.trim();
  if (sender) return sender;

  return null;
}

function buildConversationMessage(
  body: WebhookBody,
  agentName: string,
  messageText: string,
): ConversationMessage | null {
  const role = inferConversationRole(body.event_type);
  const content = messageText.trim();

  if (!role || !content) return null;

  return {
    role,
    content,
    timestamp: new Date().toISOString(),
    metadata: {
      ...(body.metadata || {}),
      ...(body.context?.metadata || {}),
      agent_name: agentName,
      event_type: body.event_type || 'session_event',
    },
  };
}

async function syncConversation(
  supabase: ReturnType<typeof getSupabase>,
  params: {
    sessionKey: string;
    agentUuid: string | null;
    clientId: string | null;
    clientName: string | null;
    channel: ConversationChannel;
    status: ConversationStatus;
    message: ConversationMessage;
  },
) {
  const { error: appendError } = await supabase.rpc('append_conversation_message', {
    p_session_key: params.sessionKey,
    p_message: params.message,
    p_agent_id: params.agentUuid,
    p_client_name: params.clientName || 'Client',
  });

  if (appendError) return appendError;

  const updates: Record<string, unknown> = {
    channel: params.channel,
    status: params.status,
    last_message_at: params.message.timestamp,
    updated_at: params.message.timestamp,
  };

  if (params.agentUuid) updates.agent_id = params.agentUuid;
  if (params.clientId) updates.client_id = params.clientId;
  if (params.clientName) updates.client_name = params.clientName;

  const { error: updateError } = await supabase
    .from('conversations')
    .update(updates)
    .eq('session_key', params.sessionKey);

  return updateError;
}

export async function webhooksRouter(fastify: FastifyInstance) {
  const supabase = getSupabase();

  // ─── POST /api/webhook/openclaw ─────────────────────────────────────────────
  // Receives session events from OpenClaw hooks
  fastify.post('/openclaw', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    console.log('[Webhook] Raw body:', JSON.stringify(request.body, null, 2));

    const agentId = verifyAgentToken(request);
    if (!agentId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { event_type, message, metadata, context } = request.body as WebhookBody;

    // Use sessionKey to identify the agent (authoritative), fall back to token
    const sessionKey = (metadata?.sessionKey as string) || '';
    const sessionAgent = extractAgentFromSessionKey(sessionKey);
    // resolvedAgent from hook's metadata takes priority (hook resolves Telegram ID → agent name)
    const resolvedAgent = metadata?.resolvedAgent as string | null;
    const agentName = resolvedAgent || sessionAgent || agentId;

    // Use context.content (actual message) if available, otherwise hook's message field
    const messageText = context?.content || message || `Session event from ${agentName}`;

    // Resolve agent name to UUID for database
    const agentUuid = await resolveAgentUuid(supabase, agentName);
    const conversationMessage = buildConversationMessage(request.body, agentName, messageText);
    const clientName = resolveClientName(event_type, request.body);
    const clientId = resolveClientId(event_type, request.body);
    const channel = inferConversationChannel(sessionKey, context);
    const status = inferConversationStatus(event_type);

    // Update agent's last_seen_at
    if (agentUuid) {
      await supabase
        .from('agents')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', agentUuid);
    }

    if (sessionKey && conversationMessage) {
      const conversationError = await syncConversation(supabase, {
        sessionKey,
        agentUuid,
        clientId,
        clientName,
        channel,
        status,
        message: conversationMessage,
      });

      if (conversationError) {
        console.error('[Webhook] Failed to sync conversation:', conversationError);
        return reply.status(500).send({ error: 'Failed to sync conversation' });
      }
    }

    // Log to activity_log
    const { data: activity, error: activityError } = await insertActivityLog(supabase, {
      event_type: event_type || 'session_event',
      message: messageText,
      agent_id: agentUuid || null,
      project_id: metadata?.project_id as string,
      task_id: metadata?.task_id as string,
      metadata: { ...(metadata || {}), agent_name: agentName },
    });

    if (activityError) {
      console.error('[Webhook] Failed to insert activity_log:', activityError);
      return reply.status(500).send({ error: 'Failed to log event' });
    }

    // Send to Telegram if high priority
    if (event_type) {
      const priority = eventPriority(event_type, metadata);
      if (priority !== 'low') {
        await sendTelegramMessage({ message: `[${agentName}] ${messageText}`, priority, metadata: { ...metadata, agentName } });
      }
    }

    return { success: true, activity };
  });

  // ─── POST /api/webhook/tool_start ────────────────────────────────────────────
  // Records when a tool call starts
  fastify.post('/tool_start', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const agentId = verifyAgentToken(request);
    if (!agentId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { tool_name, session_id, metadata } = request.body as WebhookBody;
    const sessionKey = (metadata?.sessionKey as string) || '';
    const sessionAgent = extractAgentFromSessionKey(sessionKey);
    const agentName = sessionAgent || agentId;

    const agentUuid = await resolveAgentUuid(supabase, agentName);

    const { data: toolCall, error } = await supabase
      .from('tool_calls')
      .insert({
        agent_id: agentUuid || agentName,
        session_id: session_id as string || 'unknown',
        tool_name: tool_name as string || 'unknown',
        started_at: new Date().toISOString(),
        success: true,
        metadata: { ...(metadata || {}), agent_name: agentName },
      })
      .select()
      .single();

    if (error) {
      console.error('[Webhook] Failed to insert tool_start:', error);
      return reply.status(500).send({ error: 'Failed to record tool start' });
    }

    return { success: true, tool_call: toolCall };
  });

  // ─── POST /api/webhook/tool_end ─────────────────────────────────────────────
  // Records when a tool call ends
  fastify.post('/tool_end', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const agentId = verifyAgentToken(request);
    if (!agentId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { tool_name, session_id, success, error_message, started_at, metadata } = request.body as WebhookBody;
    const sessionKey = (metadata?.sessionKey as string) || '';
    const sessionAgent = extractAgentFromSessionKey(sessionKey);
    const agentName = sessionAgent || agentId;

    const agentUuid = await resolveAgentUuid(supabase, agentName);

    // Find matching tool_start record
    const { data: existing } = await supabase
      .from('tool_calls')
      .select('id, started_at')
      .eq('agent_id', agentUuid || agentName)
      .eq('tool_name', tool_name as string)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    const startedAt = (started_at as string) || (existing?.[0]?.started_at as string) || new Date().toISOString();
    const endedAt = new Date().toISOString();
    const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();

    if (existing?.[0]?.id) {
      const { data: updated, error } = await supabase
        .from('tool_calls')
        .update({
          ended_at: endedAt,
          duration_ms: durationMs,
          success: success !== false,
          error_message: error_message as string,
        })
        .eq('id', existing[0].id)
        .select()
        .single();

      if (error) {
        console.error('[Webhook] Failed to update tool_end:', error);
        return reply.status(500).send({ error: 'Failed to record tool end' });
      }

      // Log activity for failed tools
      if (success === false) {
        const { error: logError } = await insertActivityLog(supabase, {
          event_type: 'tool_end',
          message: `❌ Tool *${tool_name}* failed: ${error_message || 'unknown error'}`,
          agent_id: agentUuid || null,
          metadata: { tool_name, duration_ms: durationMs, error_message, agentName },
        });

        if (!logError) {
          await sendTelegramMessage({
            message: `🔴 Agent *${agentName}* — tool *${tool_name}* failed after ${durationMs}ms`,
            priority: 'high',
            metadata: { tool_name, durationMs, error_message, agentName },
          });
        }
      }

      return { success: true, tool_call: updated };
    }

    // No matching start found — insert as new record
    const { data: toolCall, error } = await supabase
      .from('tool_calls')
      .insert({
        agent_id: agentUuid || agentName,
        session_id: session_id as string || 'unknown',
        tool_name: tool_name as string || 'unknown',
        started_at: startedAt,
        ended_at: endedAt,
        duration_ms: durationMs,
        success: success !== false,
        error_message: error_message as string,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[Webhook] Failed to insert tool_end:', error);
      return reply.status(500).send({ error: 'Failed to record tool end' });
    }

    return { success: true, tool_call: toolCall };
  });
}
