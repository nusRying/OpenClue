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

  // Real-time invalidation
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-zinc-500 text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  const agents = agentsData?.agents ?? []
  const projects = projectsData?.projects ?? []
  const tasks = tasksData?.tasks ?? []
  const activity = activityData?.activity ?? []

  const onlineAgents = agents.filter((a: any) => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length
  const activeProjects = projects.filter((p: any) => p.status === 'active').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress').length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
                MC
              </div>
              <div>
                <h1 className="text-sm font-semibold text-zinc-100">Mission Control</h1>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="text-center">
                <div className="text-lg font-semibold text-zinc-100">{agents.length}</div>
                <div className="text-zinc-600">Agents</div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-400">{activeProjects}</div>
                <div className="text-zinc-600">Active</div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">{inProgressTasks}</div>
                <div className="text-zinc-600">In progress</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  showTimeline
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {showTimeline ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Timeline tasks={tasks} projects={projects} agents={agents} onBack={() => setShowTimeline(false)} />
            </div>
            <div className="space-y-4">
              {/* Compact agents */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Agents</span>
                    <span className="text-xs text-zinc-600">{agents.length}</span>
                  </div>
                  <span className="text-xs text-emerald-500">{onlineAgents} online</span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} compact />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <ActivityFeed events={activity.slice(0, 20)} compact />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Agents */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Agents</span>
                    <span className="text-xs text-zinc-600">{agents.length}</span>
                  </div>
                  <span className="text-xs text-emerald-500">{onlineAgents} online</span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <ActivityFeed events={activity.slice(0, 20)} compact />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Projects panel */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4">
                <ProjectsPanel
                  projects={projects}
                  agents={agents}
                  onCreateProject={handleCreateProject}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onSelectProject={setSelectedProjectId}
                  selectedProjectId={selectedProjectId}
                />
              </div>

              {/* Task board */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4">
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
          </div>
        )}
      </main>
    </div>
  )
}
