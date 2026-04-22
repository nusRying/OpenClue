import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Conversation } from '@/types'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return { conversations: data as Conversation[] }
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
      return data as Conversation
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
