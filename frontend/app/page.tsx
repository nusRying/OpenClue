'use client'

import { useState, useCallback } from 'react'
import {
  useAgents, useProjects, useTasks, useActivity,
  useRealtimeAgents, useRealtimeTasks, useRealtimeProjects, useRealtimeActivity,
  useCreateProject, useUpdateProject, useDeleteProject,
  useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus,
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { BoardView } from '@/components/dashboard/BoardView'
import { TimelineView } from '@/components/dashboard/TimelineView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
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

  // Enable realtime subscriptions
  useRealtimeAgents()
  useRealtimeTasks()
  useRealtimeProjects()
  useRealtimeActivity()

  const agents = agentsData?.agents ?? []
  const projects = projectsData?.projects ?? []
  const tasks = tasksData?.tasks ?? []
  const activity = activityData?.activity ?? []

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
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>Loading...</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Header
          agents={agents}
          projects={projects}
          tasks={tasks}
          showTimeline={showTimeline}
          onToggleTimeline={() => setShowTimeline(s => !s)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          {showTimeline ? (
            <TimelineView
              tasks={tasks}
              projects={projects}
              agents={agents}
              activity={activity}
              selectedProjectId={selectedProjectId}
              onBack={() => setShowTimeline(false)}
            />
          ) : (
            <BoardView
              projects={projects}
              tasks={tasks}
              agents={agents}
              activity={activity}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
