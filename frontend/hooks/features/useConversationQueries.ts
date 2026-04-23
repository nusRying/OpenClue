import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Conversation } from '@/types'

function normalizeConversation(conversation: Conversation): Conversation {
  const raw = conversation as Conversation & {
    last_message_at?: string
    updated_at?: string
    channel?: 'telegram' | 'whatsapp' | 'web'
    messages?: Conversation['messages']
  }

  return {
    ...raw,
    channel: raw.channel || 'telegram',
    messages: Array.isArray(raw.messages) ? raw.messages : [],
    updated_at: raw.updated_at || raw.last_message_at || raw.created_at || new Date().toISOString(),
  }
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
      return { conversations: ((data || []) as Conversation[]).map(normalizeConversation) }
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
        .single()
      if (error) throw error
      return normalizeConversation(data as Conversation)
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
