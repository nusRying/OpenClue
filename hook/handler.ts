import type { HookHandler } from "openclaw/sdk/hooks";
import 'dotenv/config'

const N8N_URL = "https://agents.kutraa.com/webhook";
const AGENT_TOKEN = process.env.MISSION_CONTROL_AGENT_TOKEN || process.env.AGENT_TOKEN_STRING || "string-secret";

const TELEGRAM_AGENT_MAP: Record<string, string> = {
  "8423315067": "Mehzam",
  "6993398322": "KUT",
};

function getAgentNameFromMetadata(metadata?: Record<string, unknown>): string | null {
  const senderId = metadata?.senderId as string | number | undefined;
  if (senderId) {
    const agent = TELEGRAM_AGENT_MAP[String(senderId)];
    if (agent) return agent;
  }
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
    to?: string;
    channelId?: string;
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

async function sendToBackend(payload: WebhookPayload): Promise<void> {
  try {
    await fetch(`${N8N_URL}/mission-control-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Token": AGENT_TOKEN,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Swallow errors
  }
}

export const handler: HookHandler = {
  name: "mission-control",

  onSessionStart(event: any) {
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

  onSessionEnd(event: any) {
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

  onSessionError(event: any) {
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

  onMessageReceived(event: any) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    const messageContent = (event as any).bodyForAgent || event.context?.content || (event as any).messages?.[0] || "";
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

  onMessagePreprocessed(event: any) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    void sendToBackend({
      event_type: "message:preprocessed",
      message: (event as any).bodyForAgent || event.context?.content || "",
      context: {
        content: (event as any).bodyForAgent,
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

  onMessageSent(event: any) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    const messageContent = (event as any).bodyForAgent || event.context?.content || (event as any).messages?.[0] || "";
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
