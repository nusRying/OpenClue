/**
 * Kutraa Mission Control Plugin
 *
 * Intercepts before_tool_call and after_tool_call to track:
 * - Which tool is being called
 * - Which skill triggered it
 * - How long it took
 * - Success or failure
 *
 * Forwards all data to Mission Control backend via HTTP.
 */

import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const BACKEND_URL = 'http://mission-control-backend:3001/api/webhook';

// Track pending calls to match start/end and calculate duration
const pendingCalls = new Map<string, PendingCall>();

interface PendingCall {
  toolName: string;
  sessionKey: string;
  skillName?: string;
  startTime: number;
  params: Record<string, unknown>;
}

interface ToolCallContext {
  block: boolean;
  toolName: string;
  params: Record<string, unknown>;
  sessionKey: string;
  agentId?: string;
}

interface ToolResultContext {
  toolName: string;
  result: unknown;
  sessionKey: string;
  error?: {
    message?: string;
    code?: string;
  };
}

/**
 * Extract skill name from tool call context
 * Skills are typically identified by workspace path or sessionKey
 */
function extractSkillName(sessionKey: string, params: Record<string, unknown>): string | undefined {
  const workdir = params?.workdir as string | undefined;
  if (workdir) {
    if (workdir.includes('/workspace-string/')) return 'string-workspace';
    if (workdir.includes('/workspace-digit/')) return 'digit-workspace';
    if (workdir.includes('/workspace-promo/')) return 'promo-workspace';
    if (workdir.includes('/workspace/')) return 'mehzam-workspace';
  }

  const path = params?.path as string | undefined;
  if (path) {
    if (path.includes('/workspace-string/')) return 'string-workspace';
    if (path.includes('/workspace-digit/')) return 'digit-workspace';
    if (path.includes('/workspace-promo/')) return 'promo-workspace';
    if (path.includes('/workspace/')) return 'mehzam-workspace';
  }

  if (sessionKey.includes('string')) return 'string';
  if (sessionKey.includes('digit')) return 'digit';
  if (sessionKey.includes('promo')) return 'promo';

  return undefined;
}

/**
 * Sanitize params to remove sensitive fields
 */
function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  if (!params) return {};

  const sanitized: Record<string, unknown> = {};
  const sensitive = ['password', 'token', 'key', 'secret', 'authorization', 'api_key', 'apikey'];

  for (const [k, v] of Object.entries(params)) {
    if (sensitive.some(s => k.toLowerCase().includes(s))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'string' && v.length > 500) {
      sanitized[k] = v.substring(0, 500) + '...[truncated]';
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

/**
 * Send data to backend — fire and forget
 */
async function sendToBackend(path: string, data: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Swallow errors — don't crash the gateway
  }
}

export default definePluginEntry({
  id: 'kutraa-mission-control',
  name: 'Kutraa Mission Control Plugin',
  description: 'Tracks all tool calls and skill usage for Mission Control dashboard',

  register(api) {
    api.on('before_tool_call', (ctx: ToolCallContext) => {
      const callId = `${ctx.sessionKey}:${Date.now()}:${ctx.toolName}`;
      const skillName = extractSkillName(ctx.sessionKey, ctx.params);

      pendingCalls.set(callId, {
        toolName: ctx.toolName,
        sessionKey: ctx.sessionKey,
        skillName,
        startTime: Date.now(),
        params: sanitizeParams(ctx.params),
      });

      void sendToBackend('/tool_start', {
        callId,
        toolName: ctx.toolName,
        skillName,
        sessionKey: ctx.sessionKey,
        params: sanitizeParams(ctx.params),
        timestamp: new Date().toISOString(),
      });

      return { block: false };
    });

    api.on('after_tool_call', (ctx: ToolResultContext) => {
      let matchedCall: PendingCall | undefined;
      let matchedKey: string | undefined;

      for (const [key, call] of pendingCalls) {
        if (call.sessionKey === ctx.sessionKey && call.toolName === ctx.toolName) {
          matchedCall = call;
          matchedKey = key;
          break;
        }
      }

      if (matchedKey && matchedCall) {
        pendingCalls.delete(matchedKey);
      }

      const callId = matchedKey || `${ctx.sessionKey}:${Date.now()}:${ctx.toolName}`;
      const duration = matchedCall ? Date.now() - matchedCall.startTime : 0;
      const errorMessage = ctx.error?.message;

      void sendToBackend('/tool_end', {
        callId,
        toolName: ctx.toolName,
        sessionKey: ctx.sessionKey,
        skillName: matchedCall?.skillName,
        params: matchedCall?.params || {},
        duration,
        success: !ctx.error,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    });
  },
});
