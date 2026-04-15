import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import getSupabase from '../lib/supabase.js';
import { sendTelegramMessage, eventPriority } from '../lib/telegram.js';
import type { ActivityEvent, ToolCall, SessionEvent } from '../src/types.js';

const AGENT_TOKENS = new Map<string, string>([
  ['string', process.env.AGENT_TOKEN_STRING || 'string-secret'],
  ['digit', process.env.AGENT_TOKEN_DIGIT || 'digit-secret'],
  ['promo', process.env.AGENT_TOKEN_PROMO || 'promo-secret'],
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

interface WebhookBody {
  agent_id?: string;
  event_type?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function webhooksRouter(fastify: FastifyInstance) {
  const supabase = getSupabase();

  // ─── POST /api/webhook/openclaw ─────────────────────────────────────────────
  // Receives session events from OpenClaw hooks
  fastify.post('/openclaw', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const agentId = verifyAgentToken(request);
    if (!agentId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { event_type, message, metadata, context } = request.body as WebhookBody;
    const messageText = context?.content || message || `Session event from ${agentId}`;

    // Resolve agent name to UUID for database
    const agentUuid = await resolveAgentUuid(supabase, agentId);

    // Update agent's last_seen_at
    if (agentUuid) {
      await supabase
        .from('agents')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', agentUuid);
    }

    // Log to activity_log
    const { data: activity, error: activityError } = await supabase
      .from('activity_log')
      .insert({
        event_type: event_type || 'session_event',
        message: messageText,
        agent_id: agentUuid || agentId,
        project_id: metadata?.project_id as string,
        task_id: metadata?.task_id as string,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (activityError) {
      console.error('[Webhook] Failed to insert activity_log:', activityError);
      return reply.status(500).send({ error: 'Failed to log event' });
    }

    // Send to Telegram if high priority
    if (event_type) {
      const priority = eventPriority(event_type, metadata);
      if (priority !== 'low') {
        await sendTelegramMessage({ message: messageText, priority, metadata });
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

    const agentUuid = await resolveAgentUuid(supabase, agentId);

    const { data: toolCall, error } = await supabase
      .from('tool_calls')
      .insert({
        agent_id: agentUuid || agentId,
        session_id: session_id as string || 'unknown',
        tool_name: tool_name as string || 'unknown',
        started_at: new Date().toISOString(),
        success: true,
        metadata: metadata || {},
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

    const agentUuid = await resolveAgentUuid(supabase, agentId);

    // Find matching tool_start record
    const { data: existing } = await supabase
      .from('tool_calls')
      .select('id, started_at')
      .eq('agent_id', agentUuid || agentId)
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
        const { error: logError } = await supabase.from('activity_log').insert({
          event_type: 'tool_end',
          message: `❌ Tool *${tool_name}* failed: ${error_message || 'unknown error'}`,
          agent_id: agentUuid || agentId,
          metadata: { tool_name, duration_ms: durationMs, error_message },
        });

        if (!logError) {
          await sendTelegramMessage({
            message: `🔴 Agent *${agentId}* — tool *${tool_name}* failed after ${durationMs}ms`,
            priority: 'high',
            metadata: { tool_name, durationMs, error_message },
          });
        }
      }

      return { success: true, tool_call: updated };
    }

    // No matching start found — insert as new record
    const { data: toolCall, error } = await supabase
      .from('tool_calls')
      .insert({
        agent_id: agentUuid || agentId,
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
