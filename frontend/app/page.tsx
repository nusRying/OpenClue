'use client'

import { useCallback, useState } from 'react'
import { useAgents, useProjects, useTasks, useActivity, useRealtimeAgents, useRealtimeTasks, useRealtimeProjects, useRealtimeActivity, useCreateProject, useCreateTask, useUpdateTaskStatus } from '@/hooks/useQueries'
import { AgentCard } from '@/components/agents/AgentCard'
import { ProjectsPanel } from '@/components/projects/ProjectsPanel'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import type { Project } from '@/types'

export default function DashboardPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: activityData, isLoading: activityLoading } = useActivity()

  const createProject = useCreateProject()
  const createTask = useCreateTask()
  const updateTaskStatus = useUpdateTaskStatus()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Real-time invalidation on Supabase changes
  useRealtimeAgents()
  useRealtimeTasks()
  useRealtimeProjects()
  useRealtimeActivity()

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    updateTaskStatus.mutate({ id: taskId, status: newStatus })
  }, [updateTaskStatus])

  const handleCreateProject = useCallback((project: Partial<Project>) => {
    createProject.mutate(project)
  }, [createProject])

  const handleCreateTask = useCallback((task: Partial<any>) => {
    createTask.mutate(task)
  }, [createTask])

  const isLoading = agentsLoading || projectsLoading || tasksLoading || activityLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-500">Loading Mission Control...</div>
        </div>
      </div>
    )
  }

  const agents = agentsData?.agents ?? []
  const projects = projectsData?.projects ?? []
  const tasks = tasksData?.tasks ?? []
  const activity = activityData?.activity ?? []

  const onlineAgents = agents.filter((a: any) => a.last_seen_at && (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000).length
  const activeProjects = projects.filter((p: any) => p.status === 'active').length
  const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mission Control</h1>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{agents.length}</div>
                <div className="text-xs text-gray-500">Agents</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{activeProjects}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{inProgressTasks}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{pendingTasks}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar: Agents */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <h3 className="font-semibold">Agents</h3>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{agents.length}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">{onlineAgents} online</span>
              </div>
              <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
                {agents.map((agent: any) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
                {agents.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No agents registered
                  </div>
                )}
              </div>
            </div>

            {/* Activity feed in sidebar */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <ActivityFeed events={activity.slice(0, 20)} compact />
              </div>
            </div>
          </div>

          {/* Main content: Projects + Tasks */}
          <div className="lg:col-span-3 space-y-6">
            {/* Projects panel with filter */}
            <ProjectsPanel
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={setSelectedProjectId}
              selectedProjectId={selectedProjectId}
            />

            {/* Task board with project filter */}
            <TaskBoard
              tasks={tasks}
              projects={projects}
              onStatusChange={handleStatusChange}
              onCreateTask={handleCreateTask}
              selectedProjectId={selectedProjectId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
