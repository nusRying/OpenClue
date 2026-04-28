import type { HookHandler } from "openclaw/sdk/hooks";
import * as dotenv from 'dotenv';
dotenv.config();

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

const DEFAULT_BACKEND_URL = "http://mission-control-backend:3001";
const DEFAULT_N8N_WEBHOOK_PATH = "webhook/OpenCluePulse";
const N8N_URL = process.env.N8N_URL || process.env.N8N_API_URL;
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  process.env.OPENCLUE_PULSE_URL ||
  (N8N_URL ? `${trimTrailingSlash(N8N_URL)}/${DEFAULT_N8N_WEBHOOK_PATH}` : undefined);
const MISSION_CONTROL_WEBHOOK_URL =
  process.env.MISSION_CONTROL_WEBHOOK_URL ||
  N8N_WEBHOOK_URL ||
  (process.env.MISSION_CONTROL_BACKEND_URL
    ? `${trimTrailingSlash(process.env.MISSION_CONTROL_BACKEND_URL)}/api/webhook/openclaw`
    : `${DEFAULT_BACKEND_URL}/api/webhook/openclaw`);
const USING_LEGACY_N8N_WEBHOOK =
  !process.env.MISSION_CONTROL_WEBHOOK_URL &&
  Boolean(N8N_WEBHOOK_URL);

const AGENT_TOKEN = process.env.MISSION_CONTROL_AGENT_TOKEN || process.env.AGENT_TOKEN_STRING || "string-secret";

const TELEGRAM_AGENT_MAP: Record<string, string> = {
  "8423315067": "mehzam",
  "6993398322": "kut",
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
    if (lower.includes("mehzam")) return "mehzam";
    if (lower.includes("kut") || lower.includes("mc1aaz")) return "kut";
    if (lower.includes("digit")) return "digit";
    if (lower.includes("promo")) return "promo";
    if (lower.includes("string")) return "string";
  }
  return null;
}

function coerceMessageContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((entry) => coerceMessageContent(entry))
      .filter(Boolean)
      .join("\n");
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
}

function extractMessageContent(event: any): string {
  return coerceMessageContent(
    (event as any).bodyForAgent ??
    event.context?.content ??
    (event as any).messages?.[0] ??
    "",
  );
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
    if (USING_LEGACY_N8N_WEBHOOK) {
      console.warn(`[mission-control hook] Forwarding session events to n8n OpenCluePulse webhook: ${MISSION_CONTROL_WEBHOOK_URL}`);
    }

    const response = await fetch(MISSION_CONTROL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Token": AGENT_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        `[mission-control hook] Backend rejected ${payload.event_type} with ${response.status} ${response.statusText}: ${errorBody}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mission-control hook] Failed to deliver ${payload.event_type} to ${MISSION_CONTROL_WEBHOOK_URL}: ${message}`);
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
    const messageContent = extractMessageContent(event);
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
    const messageContent = extractMessageContent(event);
    void sendToBackend({
      event_type: "message:preprocessed",
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

  onMessageSent(event: any) {
    const agentName = getAgentNameFromMetadata(event.context?.metadata);
    const messageContent = extractMessageContent(event);
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
