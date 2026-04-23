import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityEvent } from '@/types'

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      const activity = (data || []).map(item => ({
        ...item,
        message: item.message || item.description || 'System Event'
      })) as ActivityEvent[]
      return { activity }
    },
  })
}
