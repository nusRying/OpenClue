'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { Agent, Project, Task, ActivityEvent, DashboardSnapshot } from '@/types'

// ─── REST Queries ───────────────────────────────────────────────────────────

export function useDashboardSnapshot() {
  return useQuery<DashboardSnapshot>({
    queryKey: ['dashboard-snapshot'],
    queryFn: api.live.all,
    refetchInterval: 30000,
  })
}

export function useAgents() {
  return useQuery<{ agents: Agent[] }>({
    queryKey: ['agents'],
    queryFn: api.live.agents,
    refetchInterval: 30000,
  })
}

export function useProjects() {
  return useQuery<{ projects: Project[] }>({
    queryKey: ['projects'],
    queryFn: api.live.projects,
    refetchInterval: 30000,
  })
}

export function useTasks(filters?: { project_id?: string; assignee_id?: string; status?: string }) {
  return useQuery<{ tasks: Task[] }>({
    queryKey: ['tasks', filters],
    queryFn: () => api.live.tasks(filters),
    refetchInterval: 30000,
  })
}

export function useActivity(limit = 50, eventType?: string) {
  return useQuery<{ activity: ActivityEvent[] }>({
    queryKey: ['activity', limit, eventType],
    queryFn: () => api.live.activity(String(limit), eventType),
    refetchInterval: 15000,
  })
}

// ─── Real-time Subscriptions ────────────────────────────────────────────────

export function useRealtimeAgents(queryKey = 'dashboard-snapshot') {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient, queryKey])
}

export function useRealtimeTasks(queryKey = 'dashboard-snapshot') {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient, queryKey])
}

export function useRealtimeActivity(queryKey = 'activity') {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel('activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient, queryKey])
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/live/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-snapshot'] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/live/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-snapshot'] })
    },
  })
}
