const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  live: {
    all: () => fetchJSON<import('@/types').DashboardSnapshot>('/api/v1/live'),
    agents: () => fetchJSON<{ agents: import('@/types').Agent[] }>('/api/v1/live/agents'),
    projects: () => fetchJSON<{ projects: import('@/types').Project[] }>('/api/v1/live/projects'),
    tasks: (filters?: { project_id?: string; assignee_id?: string; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.project_id) params.set('project_id', filters.project_id)
      if (filters?.assignee_id) params.set('assignee_id', filters.assignee_id)
      if (filters?.status) params.set('status', filters.status)
      const qs = params.toString() ? `?${params.toString()}` : ''
      return fetchJSON<{ tasks: import('@/types').Task[] }>(`/api/v1/live/tasks${qs}`)
    },
    activity: (limit = '50', event_type?: string) => {
      const params = new URLSearchParams({ limit })
      if (event_type) params.set('event_type', event_type)
      return fetchJSON<{ activity: import('@/types').ActivityEvent[] }>(`/api/v1/live/activity?${params}`)
    },
  },
}
