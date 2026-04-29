import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Conversation } from '@/types'

type ConversationMessage = Conversation['messages'][number]

function normalizeIsoDate(value: string | undefined, fallback: string): string {
  if (!value) return fallback

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString()
}

function normalizeMessages(
  rawMessages: Conversation['messages'] | ConversationMessage | null | undefined,
  fallbackTimestamp: string,
): Conversation['messages'] {
  const source = Array.isArray(rawMessages)
    ? rawMessages.flat(5) // Support deep nesting from inconsistent RPC/webhook payloads
    : rawMessages && typeof rawMessages === 'object'
      ? [rawMessages]
      : []

  return source
    .filter((message): message is ConversationMessage => Boolean(message && typeof message === 'object'))
    .map((message) => {
      // If the message itself is stringified JSON, we'll handle it in cleanMessageContent later.
      // But if it's a nested object with content inside, let's try to extract it now.
      const content = typeof message.content === 'string'
        ? message.content
        : typeof message.content === 'object' && message.content !== null
          ? JSON.stringify(message.content)
          : JSON.stringify(message.content ?? '')

      return {
        ...message,
        role: message.role || 'system',
        content,
        timestamp: normalizeIsoDate(message.timestamp, fallbackTimestamp),
      }
    })
}

function dedupeMessages(messages: Conversation['messages']): Conversation['messages'] {
  const seen = new Set<string>()

  return messages.filter((message) => {
    const key = `${message.role}|${message.timestamp}|${message.content}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeConversation(conversation: Conversation): Conversation {
  const raw = conversation as Conversation & {
    last_message_at?: string
    updated_at?: string
    channel?: 'telegram' | 'whatsapp' | 'web'
    messages?: Conversation['messages'] | ConversationMessage
  }

  const fallbackTimestamp = raw.updated_at || raw.last_message_at || raw.created_at || new Date().toISOString()

  return {
    ...raw,
    channel: raw.channel || 'telegram',
    messages: normalizeMessages(raw.messages, fallbackTimestamp),
    updated_at: normalizeIsoDate(
      fallbackTimestamp,
      new Date().toISOString(),
    ),
  }
}

function mergeConversationsBySession(conversations: Conversation[]): Conversation[] {
  const merged = new Map<string, Conversation>()

  for (const conversation of conversations) {
    const existing = merged.get(conversation.session_key)
    if (!existing) {
      merged.set(conversation.session_key, conversation)
      continue
    }

    const combinedMessages = dedupeMessages(
      [...existing.messages, ...conversation.messages]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    )

    const existingUpdatedAt = new Date(existing.updated_at).getTime()
    const incomingUpdatedAt = new Date(conversation.updated_at).getTime()
    const latest = incomingUpdatedAt >= existingUpdatedAt ? conversation : existing

    merged.set(conversation.session_key, {
      ...latest,
      messages: combinedMessages,
      client_name: latest.client_name || existing.client_name || conversation.client_name,
      channel: latest.channel || existing.channel || conversation.channel,
      updated_at: normalizeIsoDate(
        latest.updated_at || existing.updated_at || conversation.updated_at,
        new Date().toISOString(),
      ),
    })
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
      if (error) throw error
      const normalized = ((data || []) as Conversation[]).map(normalizeConversation)
      return { conversations: mergeConversationsBySession(normalized) }
    },
  })
}

export function useConversation(sessionKey: string) {
  return useQuery({
    queryKey: ['conversations', sessionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_key', sessionKey)
        .order('last_message_at', { ascending: false })
      if (error) throw error
      const normalized = ((data || []) as Conversation[]).map(normalizeConversation)
      const merged = mergeConversationsBySession(normalized)
      if (!merged[0]) throw new Error(`Conversation ${sessionKey} not found`)
      return merged[0]
    },
    enabled: !!sessionKey,
  })
}

export function useUpdateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ session_key, ...updates }: { session_key: string } & Partial<Conversation>) => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('session_key', session_key)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onError: (err) => { console.error('[useUpdateConversation]', err) },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.session_key] })
    },
  })
}
