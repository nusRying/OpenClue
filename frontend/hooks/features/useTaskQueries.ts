import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { triggerTaskAction } from '@/lib/OpenClueSignals'
import type { Task, TaskStatus, Agent } from '@/types'

type AssigneeColumnMode = 'assignee_ids' | 'agent_id'
let assigneeColumnMode: AssigneeColumnMode = 'assignee_ids'

/**
 * Helper to resolve agent names from assignee IDs using the query cache
 */
function getAssigneeNamesFromCache(queryClient: any, assigneeIds: string[]): string[] {
  if (!assigneeIds || assigneeIds.length === 0) return []
  
  try {
    const agentData = queryClient.getQueryData(['agents'])
    if (!agentData) return []
    
    const agents = agentData.agents as Agent[] || []
    return assigneeIds
      .map(id => agents.find(a => a.id === id)?.name)
      .filter((name): name is string => !!name)
  } catch (error) {
    console.warn('[getAssigneeNamesFromCache] Failed to resolve names:', error)
    return []
  }
}

function parseLegacyAgentIds(agentId: string | undefined): string[] {
  if (!agentId) return []
  return agentId
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

function toDbStatus(status: TaskStatus | string | undefined) {
  if (!status) return status
  return status === 'in-progress' ? 'in_progress' : status
}

function fromDbStatus(status: string | undefined): TaskStatus {
  if (status === 'todo') return 'pending'
  return status === 'in_progress' ? 'in-progress' : (status as TaskStatus)
}

function normalizeTask(task: Task): Task {
  const raw = task as Task & { assignee_id?: string; assignee_ids?: string[]; agent_id?: string; assignee_names?: string[] }
  const assigneeIds = Array.isArray(raw.assignee_ids)
    ? raw.assignee_ids
    : raw.assignee_id
      ? [raw.assignee_id]
      : raw.agent_id
        ? parseLegacyAgentIds(raw.agent_id)
      : []

  return {
    ...raw,
    status: fromDbStatus(raw.status),
    description: raw.description || '',
    priority: raw.priority || 'medium',
    due_date: raw.due_date || undefined,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    updated_at: raw.updated_at || raw.created_at || new Date().toISOString(),
    assignee_ids: assigneeIds,
    assignee_names: Array.isArray(raw.assignee_names) ? raw.assignee_names : [],
  }
}

function toDbTaskPayload(task: Partial<Task>) {
  const raw = task as Partial<Task> & { assignee_id?: string; assignee_ids?: string[]; assignee_names?: string[] }
  const assigneeIds = Array.isArray(raw.assignee_ids)
    ? raw.assignee_ids
    : raw.assignee_id
      ? [raw.assignee_id]
      : []
  
  const assigneeNames = Array.isArray(raw.assignee_names) ? raw.assignee_names : []
  
  const base: Record<string, unknown> = {}
  
  if (raw.project_id !== undefined) base.project_id = raw.project_id
  if (raw.title !== undefined) base.title = raw.title
  if (raw.status !== undefined) base.status = raw.status
  if (raw.description !== undefined) base.description = raw.description
  if (raw.priority !== undefined) base.priority = raw.priority
  if (raw.due_date !== undefined) base.due_date = raw.due_date
  if (raw.tags !== undefined) base.tags = raw.tags

  if (assigneeColumnMode === 'agent_id') {
    return {
      ...base,
      agent_id: assigneeIds.join(','),
    }
  }

  return {
    ...base,
    assignee_ids: assigneeIds,
    assignee_names: assigneeNames,
  }
}

function getMissingColumn(error: { code?: string; message?: string } | null): string | null {
  if (!error || error.code !== 'PGRST204') return null
  const match = String(error.message || '').match(/'([^']+)'/)
  return match?.[1] || null
}

export function useTasks(filters?: { project_id?: string; assignee_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (filters?.project_id) query = query.eq('project_id', filters.project_id)
      if (filters?.assignee_id) {
        query = assigneeColumnMode === 'agent_id'
          ? query.like('agent_id', `%${filters.assignee_id}%`)
          : query.contains('assignee_ids', [filters.assignee_id])
      }
      if (filters?.status) query = query.eq('status', toDbStatus(filters.status))
      let { data, error } = await query

      // Fallback to legacy schema when assignee_ids is missing.
      if (error?.code === 'PGRST204' && String(error.message || '').includes("'assignee_ids'")) {
        assigneeColumnMode = 'agent_id'
        let fallbackQuery = supabase.from('tasks').select('*').order('created_at', { ascending: false })
        if (filters?.project_id) fallbackQuery = fallbackQuery.eq('project_id', filters.project_id)
        if (filters?.assignee_id) fallbackQuery = fallbackQuery.like('agent_id', `%${filters.assignee_id}%`)
        if (filters?.status) fallbackQuery = fallbackQuery.eq('status', toDbStatus(filters.status))
        const fallback = await fallbackQuery
        data = fallback.data
        error = fallback.error
      }

      if (error) throw error
      return { tasks: ((data || []) as Task[]).map(normalizeTask) }
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const payload: Record<string, unknown> = {
        ...toDbTaskPayload(task),
        status: toDbStatus(task.status),
      }

      // Resolve and add assignee names from agent cache
      if (task.assignee_ids && task.assignee_ids.length > 0) {
        const names = getAssigneeNamesFromCache(queryClient, task.assignee_ids)
        if (names.length > 0) {
          payload.assignee_names = names
        }
      }

      let data: Task | null = null
      let error: { code?: string; message?: string } | null = null

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const result = await supabase
          .from('tasks')
          .insert(payload)
          .select()
          .single()
        data = result.data as Task | null
        error = result.error
        if (!error) break

        const missingColumn = getMissingColumn(error)
        if (!missingColumn) break

        if (missingColumn === 'assignee_ids') {
          assigneeColumnMode = 'agent_id'
          payload.agent_id = (task.assignee_ids || []).join(',')
        }

        delete payload[missingColumn]
      }

      if (error) throw error
      const normalized = normalizeTask(data as Task)
      
      // Trigger n8n webhook
      if (normalized.assignee_ids?.length > 0) {
        triggerTaskAction(normalized.id, 'create')
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
      const payload: Record<string, unknown> = {
        ...toDbTaskPayload(updates),
        status: toDbStatus(updates.status),
      }

      // Resolve and add assignee names from agent cache
      if (updates.assignee_ids && updates.assignee_ids.length > 0) {
        const names = getAssigneeNamesFromCache(queryClient, updates.assignee_ids)
        if (names.length > 0) {
          payload.assignee_names = names
        }
      }

      let data: Task | null = null
      let error: { code?: string; message?: string } | null = null

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const result = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
        data = result.data as Task | null
        error = result.error
        if (!error) break

        const missingColumn = getMissingColumn(error)
        if (!missingColumn) break

        if (missingColumn === 'assignee_ids') {
          assigneeColumnMode = 'agent_id'
          payload.agent_id = (updates.assignee_ids || []).join(',')
        }

        delete payload[missingColumn]
      }

      if (error) throw error
      const normalized = normalizeTask(data as Task)

      // Trigger n8n webhook
      if (normalized.assignee_ids?.length > 0) {
        triggerTaskAction(normalized.id, 'update')
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
      let { data, error } = await supabase
        .from('tasks')
        .update({ status: toDbStatus(status), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      // Legacy fallback when updated_at is missing.
      if (error?.code === 'PGRST204' && String(error.message || '').includes("'updated_at'")) {
        const retry = await supabase
          .from('tasks')
          .update({ status: toDbStatus(status) })
          .eq('id', id)
          .select()
          .single()
        data = retry.data
        error = retry.error
      }

      if (error) throw error
      const normalized = normalizeTask(data as Task)

      // Trigger n8n webhook for status change
      if (normalized.assignee_ids?.length > 0) {
        triggerTaskAction(normalized.id, 'status_change')
      }

      return normalized
    },
    onError: (err) => { console.error('[useUpdateTaskStatus]', err) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
