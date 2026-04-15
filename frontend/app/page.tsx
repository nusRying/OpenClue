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
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-secondary text-sm">Loading...</div>
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
    <div className="min-h-screen bg-primary text-primary">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-subtle"
        style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-primary))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
                MC
              </div>
              <div>
                <h1 className="text-sm font-semibold text-primary">Mission Control</h1>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                  </span>
                  <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-medium">Live</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-primary tabular-nums">{agents.length}</span>
                <span className="text-muted">Agents</span>
              </div>
              <div className="w-px h-4 bg-[var(--border)]" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-success tabular-nums">{activeProjects}</span>
                <span className="text-muted">Active</span>
              </div>
              <div className="w-px h-4 bg-[var(--border)]" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-[var(--accent)] tabular-nums">{inProgressTasks}</span>
                <span className="text-muted">Tasks</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  showTimeline
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-tertiary text-secondary hover:text-primary hover:bg-elevated border border-[var(--border)]'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-tertiary text-secondary hover:text-primary hover:bg-elevated border border-[var(--border)] transition"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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

      {/* ─── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {showTimeline ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Timeline tasks={tasks} projects={projects} agents={agents} onBack={() => setShowTimeline(false)} />
            </div>
            <div className="space-y-4">
              {/* Compact agents */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">Agents</span>
                    <span className="text-xs text-muted">{agents.length}</span>
                  </div>
                  <span className="text-xs text-success">{onlineAgents} online</span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} compact />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-subtle">
                  <span className="text-sm font-medium text-primary">Recent Activity</span>
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
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">Agents</span>
                    <span className="text-xs text-muted">{agents.length}</span>
                  </div>
                  <span className="text-xs text-success">{onlineAgents} online</span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-subtle">
                  <span className="text-sm font-medium text-primary">Recent Activity</span>
                </div>
                <ActivityFeed events={activity.slice(0, 20)} compact />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Projects panel */}
              <div className="card p-4">
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
              <div className="card p-4">
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
