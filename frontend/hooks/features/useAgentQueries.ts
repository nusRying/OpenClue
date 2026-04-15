import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Agent } from '@/types'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('*').order('name')
      if (error) throw error
      return { agents: data as Agent[] }
    },
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const { data, error } = await supabase.from('agents').insert(agent).select().single()
      if (error) throw error
      return data
    },
    onError: (err) => { console.error('[useCreateAgent]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Agent>) => {
      const { data, error } = await supabase.from('agents').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onError: (err) => { console.error('[useUpdateAgent]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}
