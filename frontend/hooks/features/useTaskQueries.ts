import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { triggerN8nWebhook } from '@/lib/n8n'
import type { Task, TaskStatus } from '@/types'

function toDbStatus(status: TaskStatus | string | undefined) {
  if (!status) return status
  return status === 'in-progress' ? 'in_progress' : status
}

function fromDbStatus(status: string | undefined): TaskStatus {
  return status === 'in_progress' ? 'in-progress' : (status as TaskStatus)
}

function normalizeTask(task: Task): Task {
  return {
    ...task,
    status: fromDbStatus(task.status),
  }
}

export function useTasks(filters?: { project_id?: string; assignee_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (filters?.project_id) query = query.eq('project_id', filters.project_id)
      if (filters?.assignee_id) query = query.eq('assignee_id', filters.assignee_id)
      if (filters?.status) query = query.eq('status', toDbStatus(filters.status))
      const { data, error } = await query
      if (error) throw error
      return { tasks: (data as Task[]).map(normalizeTask) }
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          status: toDbStatus(task.status),
        })
        .select()
        .single()
      if (error) throw error
      const normalized = normalizeTask(data as Task)
      
      // Trigger n8n webhook if assigned
      if (normalized.assignee_id) {
        triggerN8nWebhook(normalized.id, 'create')
      }
      
      return normalized
    },
    onError: (err) => { console.error('[useCreateTask]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          status: toDbStatus(updates.status),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const normalized = normalizeTask(data as Task)

      // Trigger n8n webhook if assignee changed or task updated significantly
      if (normalized.assignee_id) {
        triggerN8nWebhook(normalized.id, 'update')
      }

      return normalized
    },
    onError: (err) => { console.error('[useUpdateTask]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onError: (err) => { console.error('[useDeleteTask]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: toDbStatus(status), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const normalized = normalizeTask(data as Task)

      // Trigger n8n webhook for status change
      if (normalized.assignee_id) {
        triggerN8nWebhook(normalized.id, 'status_change')
      }

      return normalized
    },
    onError: (err) => { console.error('[useUpdateTaskStatus]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
