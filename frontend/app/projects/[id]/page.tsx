'use client'

import { useParams } from 'next/navigation'
import {
  useAgents, useTasks, useActivity, useProject,
  useRealtimeAgents, useRealtimeTasks, useRealtimeActivity,
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { ProjectDetailView } from '@/components/projects/ProjectDetailView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/components/providers/ThemeProvider'

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'var(--success)', bg: 'var(--success-muted)' },
  paused: { label: 'Paused', color: 'var(--warning)', bg: 'var(--warning-muted)' },
  completed: { label: 'Done', color: 'var(--info)', bg: 'var(--info-muted)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)', bg: 'var(--bg-elevated)' },
}

export default function ProjectPage() {
  const params = useParams()
  const id = params.id as string

  const { data: project, isLoading: projectLoading } = useProject(id)
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: activityData, isLoading: activityLoading } = useActivity()

  const { theme, toggleTheme } = useTheme()

  // Enable realtime subscriptions for this project context
  useRealtimeAgents()
  useRealtimeTasks()
  useRealtimeActivity()

  const agents = agentsData?.agents ?? []
  const tasks = tasksData?.tasks ?? []
  const activity = activityData?.activity ?? []

  const isLoading = projectLoading || agentsLoading || tasksLoading || activityLoading

  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Project Not Found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>This workspace may have been archived or deleted.</p>
        <a href="/projects" style={{ color: 'var(--accent)', fontWeight: 700 }}>Return to Projects</a>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <Header
          agents={agents}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
          <ProjectDetailView
            project={project}
            agents={agents}
            statusConfig={STATUS_CONFIG}
            tasks={tasks}
            activity={activity}
            conversations={[]} // Future expansion: project-linked chats
          />
        </main>
      </div>
    </ErrorBoundary>
  )
}
