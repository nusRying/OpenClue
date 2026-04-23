import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Agent } from '@/types'

function normalizeAgent(agent: Agent): Agent {
  const raw = agent as Agent & { metadata?: Record<string, unknown> }
  const fallbackEmoji = raw.name ? raw.name.trim().charAt(0).toUpperCase() : 'A'

  return {
    ...raw,
    role: raw.role || 'agent',
    emoji: raw.emoji || fallbackEmoji,
    bot_username: raw.bot_username || '',
    workspace_path: raw.workspace_path || '',
    last_seen_at: raw.last_seen_at || null,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    memory: raw.memory || { has_memory_md: false },
  }
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('*').order('name')
      if (error) throw error
      return { agents: ((data || []) as Agent[]).map(normalizeAgent) }
    },
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const { data, error } = await supabase.from('agents').insert({
        name: agent.name,
        status: agent.status,
      }).select().single()
      if (error) throw error
      return normalizeAgent(data as Agent)
    },
    onError: (err) => { console.error('[useCreateAgent]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Agent>) => {
      const { data, error } = await supabase.from('agents').update({
        name: updates.name,
        status: updates.status,
        last_heartbeat: updates.last_heartbeat,
      }).eq('id', id).select().single()
      if (error) throw error
      return normalizeAgent(data as Agent)
    },
    onError: (err) => { console.error('[useUpdateAgent]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}
