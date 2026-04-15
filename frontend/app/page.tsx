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
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '2px solid var(--accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'color-mix(in srgb, var(--bg-base) 85%, transparent)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.5rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8125rem', color: 'white',
                flexShrink: 0,
              }}>MC</div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Mission Control</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: 2 }}>
                  <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
                    <span style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      background: 'var(--status-online)',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }} />
                    <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-online)', boxShadow: '0 0 6px var(--status-online)' }} />
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--status-online)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Live</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {[
                { value: agents.length, label: 'Agents' },
                { value: activeProjects, label: 'Active', color: 'var(--success)' },
                { value: inProgressTasks, label: 'In progress', color: 'var(--info)' },
              ].map(({ value, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: '1px solid var(--border-default)',
                  background: showTimeline ? 'var(--accent-solid)' : 'var(--bg-elevated)',
                  color: showTimeline ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Timeline
              </button>
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>

      {/* ─── Main ────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {showTimeline ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <Timeline tasks={tasks} projects={projects} agents={agents} onBack={() => setShowTimeline(false)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Compact agents */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Agents</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{onlineAgents} online</span>
                </div>
                <div style={{ maxHeight: 'calc(100vh - 22rem)', overflowY: 'auto' }}>
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} compact />
                  ))}
                </div>
              </div>
              {/* Activity */}
              <div className="card" style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Recent Activity</span>
                </div>
                <div style={{ maxHeight: 'calc(100vh - 22rem)', overflowY: 'auto' }}>
                  <ActivityFeed events={activity.slice(0, 30)} compact />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5rem' }}>
              {/* Agents */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Agents</span>
                    <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{agents.length}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{onlineAgents} online</span>
                </div>
                <div>
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Recent Activity</span>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  <ActivityFeed events={activity.slice(0, 20)} compact />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Projects */}
              <div className="card" style={{ padding: '1rem' }}>
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

              {/* Tasks */}
              <div className="card" style={{ padding: '1rem' }}>
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
