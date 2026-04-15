'use client'

import { useCallback } from 'react'
import { useDashboardSnapshot, useRealtimeAgents, useRealtimeTasks, useRealtimeActivity, useUpdateTaskStatus } from '@/hooks/useQueries'
import { AgentCard } from '@/components/agents/AgentCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import type { Agent, Task } from '@/types'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardSnapshot()

  // Real-time invalidation on Supabase changes
  useRealtimeAgents()
  useRealtimeTasks()
  useRealtimeActivity()

  const updateTaskStatus = useUpdateTaskStatus()

  const displayAgents = (data?.agents ?? []) as Agent[]
  const displayTasks = (data?.tasks ?? []) as Task[]
  const displayActivity = data?.recentActivity ?? []

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    updateTaskStatus.mutate({ id: taskId, status: newStatus as any })
  }, [updateTaskStatus])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading Mission Control...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">Failed to load dashboard: {error.message}</div>
      </div>
    )
  }

  const onlineAgents = displayAgents.filter(a => a.status === 'online').length
  const activeProjects = displayAgents.length // use agents as proxy until projects table is seeded

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl font-bold">Mission Control</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">LIVE</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Agents: <strong className="text-gray-900">{displayAgents.length}</strong></span>
            <span>Projects: <strong className="text-gray-900">{data?.projects?.length ?? 0}</strong></span>
            <span>Tasks: <strong className="text-gray-900">{displayTasks.length}</strong></span>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Online Agents"
            value={onlineAgents}
            subtitle={`of ${displayAgents.length} total`}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Active Projects"
            value={data?.projects?.filter(p => p.status === 'active').length ?? 0}
            subtitle={`${data?.projects?.filter(p => p.status === 'completed').length ?? 0} completed`}
            icon="📁"
            color="blue"
          />
          <StatCard
            title="Pending Tasks"
            value={displayTasks.filter(t => t.status === 'pending').length}
            subtitle={`${displayTasks.filter(t => t.status === 'in-progress').length} in progress`}
            icon="📋"
            color="yellow"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agents */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              👥 Agents <span className="text-xs text-gray-400 font-normal">{displayAgents.length}</span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {displayAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {displayAgents.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No agents registered</p>
              )}
            </div>
          </div>

          {/* Projects + Tasks */}
          <div className="lg:col-span-3 space-y-6">
            {/* Projects */}
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                📁 Projects <span className="text-xs text-gray-400 font-normal">{data?.projects?.length ?? 0}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data?.projects?.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {(!data?.projects || data.projects.length === 0) && (
                  <p className="text-sm text-gray-400 col-span-2 text-center py-4">No projects yet</p>
                )}
              </div>
            </div>

            {/* Task Board */}
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                📋 Task Board <span className="text-xs text-gray-400 font-normal">{displayTasks.length}</span>
              </h2>
              <TaskBoard
                tasks={displayTasks}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            ⚡ Recent Activity <span className="text-xs text-gray-400 font-normal">live</span>
          </h2>
          <ActivityFeed events={displayActivity} />
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string
  value: number
  subtitle: string
  icon: string
  color: 'green' | 'blue' | 'yellow'
}) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  )
}
