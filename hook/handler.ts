/**
 * Mission Control Hook — OpenClaw Session Events
 *
 * Fires on session lifecycle events (start, end, message, etc.)
 * Forwards event data to the Mission Control backend.
 */

import type { HookHandler } from "openclaw/sdk/hook";

const BACKEND_URL = process.env.MISSION_CONTROL_BACKEND_URL || "http://mission-control-backend:3001";
const AGENT_TOKEN = process.env.MISSION_CONTROL_AGENT_TOKEN || process.env.AGENT_TOKEN_STRING || "string-secret";

interface SessionEvent {
  sessionKey: string;
  agentId?: string;
  event: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

async function sendToBackend(event: SessionEvent): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/webhook/openclaw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Token": AGENT_TOKEN,
      },
      body: JSON.stringify({
        agent_id: event.agentId,
        event_type: event.event,
        message: formatEventMessage(event),
        metadata: event.metadata || {},
      }),
    });
  } catch {
    // Swallow errors — don't crash the gateway
  }
}

function formatEventMessage(event: SessionEvent): string {
  const agent = event.agentId || "unknown";
  switch (event.event) {
    case "session_start":
      return `Agent ${agent} session started`;
    case "session_end":
      return `Agent ${agent} session ended`;
    case "session_error":
      return `Agent ${agent} session error: ${event.metadata?.error || "unknown"}`;
    case "message_sent":
      return `Agent ${agent} sent message`;
    case "message_received":
      return `Agent ${agent} received message`;
    default:
      return `Agent ${agent}: ${event.event}`;
  }
}

export const handler: HookHandler = {
  name: "mission-control",

  onSessionStart(event) {
    void sendToBackend({
      sessionKey: event.sessionKey,
      agentId: event.agentId,
      event: "session_start",
      timestamp: new Date().toISOString(),
    });
  },

  onSessionEnd(event) {
    void sendToBackend({
      sessionKey: event.sessionKey,
      agentId: event.agentId,
      event: "session_end",
      timestamp: new Date().toISOString(),
      metadata: { duration_ms: event.metadata?.duration },
    });
  },

  onSessionError(event) {
    void sendToBackend({
      sessionKey: event.sessionKey,
      agentId: event.agentId,
      event: "session_error",
      timestamp: new Date().toISOString(),
      metadata: { error: event.metadata?.error },
    });
  },
};
