'use client'

import { useCallback, useState } from 'react'
import { useAgents, useProjects, useTasks, useActivity, useRealtimeAgents, useRealtimeTasks, useRealtimeProjects, useRealtimeActivity, useCreateProject, useUpdateProject, useDeleteProject, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '@/hooks/useQueries'
import { AgentCard } from '@/components/agents/AgentCard'
import { ProjectsPanel } from '@/components/projects/ProjectsPanel'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Timeline } from '@/components/timeline/Timeline'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { Project, Task } from '@/types'

export default function DashboardPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: activityData, isLoading: activityLoading } = useActivity()

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const updateTaskStatus = useUpdateTaskStatus()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const { theme, toggleTheme } = useTheme()

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

  const handleUpdateProject = useCallback((project: { id: string } & Partial<Project>) => {
    updateProject.mutate(project)
  }, [updateProject])

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject.mutate(id)
    if (selectedProjectId === id) setSelectedProjectId(null)
  }, [deleteProject, selectedProjectId])

  const handleCreateTask = useCallback((task: Partial<Task>) => {
    createTask.mutate(task)
  }, [createTask])

  const handleUpdateTask = useCallback((task: { id: string } & Partial<Task>) => {
    updateTask.mutate(task)
  }, [updateTask])

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask.mutate(id)
  }, [deleteTask])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  showTimeline ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📊 Timeline
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showTimeline ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Timeline tasks={tasks} projects={projects} agents={agents} onBack={() => setShowTimeline(false)} />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <h3 className="font-semibold">Agents</h3>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar: Agents + Activity */}
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
                <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
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
              <ProjectsPanel
                projects={projects}
                agents={agents}
                onCreateProject={handleCreateProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onSelectProject={setSelectedProjectId}
                selectedProjectId={selectedProjectId}
              />

              <TaskBoard
                tasks={tasks}
                projects={projects}
                agents={agents}
                onStatusChange={handleStatusChange}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                selectedProjectId={selectedProjectId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
