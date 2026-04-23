// Telegram sender for high-priority Mission Control events
// Uses the Kutraa CEO bot (@Mehzambot) to send alerts to the Kutraa group

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003728720677'; // Kutraa-Team group

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TelegramMessage {
  message: string;
  priority: PriorityLevel;
  metadata?: Record<string, unknown>;
}

const PRIORITY_EMOJI: Record<PriorityLevel, string> = {
  low: 'ℹ️',
  medium: '📌',
  high: '🚨',
  critical: '🔴',
};

export async function sendTelegramMessage(msg: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[Telegram] No bot token configured — skipping send');
    return false;
  }

  const emoji = PRIORITY_EMOJI[msg.priority];
  const text = `${emoji} *Mission Control*\n\n${msg.message}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('[Telegram] Send failed:', response.status, await response.text());
      return false;
    }

    console.log('[Telegram] Message sent successfully');
    return true;
  } catch (err) {
    console.error('[Telegram] Error:', err);
    return false;
  }
}

// Determine priority based on event type
export function eventPriority(eventType: string, metadata?: Record<string, unknown>): PriorityLevel {
  if (eventType === 'agent_status' && metadata?.status === 'offline') return 'high';
  if (eventType === 'task_updated' && metadata?.status === 'blocked') return 'high';
  if (eventType === 'tool_end' && metadata?.success === false) return 'high';
  if (eventType === 'session_event' && metadata?.event_type === 'error') return 'critical';
  if (eventType === 'broadcast') return 'high';
  return 'low';
}
