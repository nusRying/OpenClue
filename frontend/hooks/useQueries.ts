'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Agent, Project, Task, ActivityEvent } from '@/types'

// ─── Initial Data Queries (Supabase direct) ───────────────────────────────

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

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return { projects: data as Project[] }
    },
  })
}

export function useTasks(filters?: { project_id?: string; assignee_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (filters?.project_id) query = query.eq('project_id', filters.project_id)
      if (filters?.assignee_id) query = query.eq('assignee_id', filters.assignee_id)
      if (filters?.status) query = query.eq('status', filters.status)
      const { data, error } = await query
      if (error) throw error
      return { tasks: data as Task[] }
    },
  })
}

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
      return { activity: data as ActivityEvent[] }
    },
  })
}

// ─── Real-time Subscriptions ─────────────────────────────────────────────

export function useRealtimeAgents() {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient])
}

export function useRealtimeTasks() {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient])
}

export function useRealtimeProjects() {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient])
}

export function useRealtimeActivity() {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        queryClient.invalidateQueries({ queryKey: ['activity'] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient])
}

// ─── Mutations ───────────────────────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { data, error } = await supabase.from('projects').insert(project).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Project>) => {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase.from('tasks').insert(task).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Task>) => {
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
