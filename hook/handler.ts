/**
 * Mission Control Hook — OpenClaw Session + Message Events
 *
 * Fires on session lifecycle events AND message events.
 * For message events, extracts the real sender identity from context.metadata.
 */

import type { HookHandler } from "openclaw/sdk/hook";

const BACKEND_URL = process.env.MISSION_CONTROL_BACKEND_URL || "http://mission-control-backend:3001";
const AGENT_TOKEN = process.env.MISSION_CONTROL_AGENT_TOKEN || process.env.AGENT_TOKEN_STRING || "string-secret";

// Map Telegram user IDs to agent names
// Key: Telegram user ID (as string), Value: agent name
const TELEGRAM_AGENT_MAP: Record<string, string> = {
  // Mehzam (CEO)
  "8423315067": "Mehzam",
  // KUT
  "6993398322": "KUT",
  // Add other known Telegram IDs here
};

function getAgentNameFromMetadata(metadata?: Record<string, unknown>): string | null {
  // Try to get agent name from Telegram sender ID
  const senderId = metadata?.senderId as string | number | undefined;
  if (senderId) {
    const agent = TELEGRAM_AGENT_MAP[String(senderId)];
    if (agent) return agent;
  }
  // Fallback: try sender name
  const senderName = metadata?.senderName as string | undefined;
  if (senderName) {
    const lower = senderName.toLowerCase();
    if (lower.includes("mehzam")) return "Mehzam";
    if (lower.includes("kut") || lower.includes("mc1aaz")) return "KUT";
    if (lower.includes("digit")) return "Digit";
    if (lower.includes("promo")) return "Promo";
    if (lower.includes("string")) return "String";
  }
  return null;
}

interface WebhookPayload {
  event_type: string;
  message: string;
  context?: {
    content?: string;
    from?: string;
    channelId?: string;
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

async function sendToBackend(payload: WebhookPayload): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/webhook/openclaw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Token": AGENT_TOKEN,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Swallow errors — don't crash the gateway
  }
}

// ─── Session Lifecycle Events ───────────────────────────────────────────────

export const handler: HookHandler = {
  name: "mission-control",

  onSessionStart(event) {
    void sendToBackend({
      event_type: "session_start",
      message: `Session started`,
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        duration: event.metadata?.duration,
      },
    });
  },

  onSessionEnd(event) {
    void sendToBackend({
      event_type: "session_end",
      message: `Session ended`,
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        duration: event.metadata?.duration,
      },
    });
  },

  onSessionError(event) {
    void sendToBackend({
      event_type: "session_error",
      message: `Session error: ${event.metadata?.error || "unknown"}`,
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        error: event.metadata?.error,
      },
    });
  },

  // ─── Message Events ────────────────────────────────────────────────────────

  onMessageReceived(event) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    // Try bodyForAgent first (preprocessed), then content, then first message
    const messageContent = (event as any).bodyForAgent || event.context?.content || (event.messages?.[0] as string) || "";
    void sendToBackend({
      event_type: "message:received",
      message: messageContent,
      context: {
        content: messageContent,
        from: event.context?.from,
        channelId: event.context?.channelId,
        metadata: event.context?.metadata,
      },
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        senderId: event.context?.metadata?.senderId,
        senderName: event.context?.metadata?.senderName,
        resolvedAgent: agentName,
      },
    });
  },

  onMessagePreprocessed(event) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    void sendToBackend({
      event_type: "message:preprocessed",
      message: event.context?.bodyForAgent || event.context?.content || "",
      context: {
        content: event.context?.bodyForAgent,
        from: event.context?.from,
        channelId: event.context?.channelId,
        metadata: event.context?.metadata,
      },
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        senderId: event.context?.metadata?.senderId,
        senderName: event.context?.metadata?.senderName,
        resolvedAgent: agentName,
      },
    });
  },

  onMessageSent(event) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    const messageContent = (event as any).bodyForAgent || event.context?.content || (event.messages?.[0] as string) || "";
    void sendToBackend({
      event_type: "message:sent",
      message: messageContent,
      context: {
        content: messageContent,
        to: (event.context as any)?.to,
        channelId: event.context?.channelId,
        metadata: event.context?.metadata,
      },
      metadata: {
        sessionKey: event.sessionKey,
        agentId: event.agentId,
        senderId: event.context?.metadata?.senderId,
        senderName: event.context?.metadata?.senderName,
        resolvedAgent: agentName,
      },
    });
  },
};
