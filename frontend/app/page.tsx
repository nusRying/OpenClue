'use client'

import {
  useAgents, useProjects, useTasks, useActivity,
  useRealtimeAgents, useRealtimeTasks, useRealtimeProjects, useRealtimeActivity,
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function DashboardPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: activityData, isLoading: activityLoading } = useActivity()

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <DashboardOverview
                agents={agents}
                projects={projects}
                tasks={tasks}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Recent Activity</span>
                </div>
                <div style={{ maxHeight: 'calc(100vh - 12rem)', overflowY: 'auto' }}>
                  <ActivityFeed events={activity.slice(0, 30)} compact />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
