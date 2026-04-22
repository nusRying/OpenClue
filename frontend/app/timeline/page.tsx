'use client'

import { useState } from 'react'
import {
  useAgents, useProjects, useTasks, useActivity,
  useRealtimeAgents, useRealtimeTasks, useRealtimeProjects, useRealtimeActivity,
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { TimelineView } from '@/components/dashboard/TimelineView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function TimelinePage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: activityData, isLoading: activityLoading } = useActivity()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
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

  const isLoading = agentsLoading || projectsLoading || tasksLoading || activityLoading

  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Header
          agents={agents}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <TimelineView
            tasks={tasks}
            projects={projects}
            agents={agents}
            activity={activity}
            selectedProjectId={selectedProjectId}
            onBack={() => {}}
          />
        </main>
      </div>
    </ErrorBoundary>
  )
}
