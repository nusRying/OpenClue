'use client'

import type { Task, Project, Agent } from '@/types'

interface TimelineProps {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
  onBack?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#71717a',
  'in-progress': '#60a5fa',
  completed: 'var(--success)',
  blocked: 'var(--error)',
}

function getProjectName(projectId: string, projects: Project[]): string {
  return projects.find(p => p.id === projectId)?.name || 'Unknown'
}

function getAgentName(agentId: string | undefined, agents: Agent[]): string {
  if (!agentId) return ''
  return agents.find(a => a.id === agentId)?.name || ''
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getProgressWidth(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const diff = now - created
  const days7 = 7 * 24 * 60 * 60 * 1000
  const days30 = 30 * 24 * 60 * 60 * 1000
  if (diff < days7) return Math.min(100, (diff / days7) * 100)
  if (diff < days30) return Math.min(100, 50 + ((diff - days7) / (days30 - days7)) * 50)
  return 100
}

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: 'var(--border-default)' },
  'in-progress': { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  completed: { bg: 'var(--success-muted)', color: 'var(--success)', border: 'rgba(74,222,128,0.3)' },
  blocked: { bg: 'var(--error-muted)', color: 'var(--error)', border: 'rgba(248,113,113,0.3)' },
}

export function Timeline({ tasks, projects, agents, onBack }: TimelineProps) {
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const tasksByProject = sortedTasks.reduce((acc, task) => {
    const projectId = task.project_id || 'unknown'
    if (!acc[projectId]) acc[projectId] = []
    acc[projectId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Timeline</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              {tasks.length} tasks across {projects.length} projects
            </p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            ← Back
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>No tasks yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
            const projectName = getProjectName(projectId, projects)
            return (
              <div key={projectId}>
                {/* Project label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)' }}>{projectName}</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
                    {projectTasks.length}
                  </span>
                </div>

                {/* Timeline */}
                <div style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {projectTasks.map((task) => {
                    const assignee = getAgentName(task.assignee_id, agents)
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                    const timeWidth = getProgressWidth(task.created_at)
                    const statusBadge = STATUS_BADGE[task.status] || STATUS_BADGE.pending

                    return (
                      <div key={task.id} style={{ position: 'relative' }}>
                        {/* Dot */}
                        <div style={{
                          position: 'absolute', left: '-1.3125rem', top: '0.625rem',
                          width: 10, height: 10, borderRadius: '50%',
                          background: STATUS_COLORS[task.status],
                          border: '2px solid var(--bg-base)',
                        }} />

                        {/* Card */}
                        <div style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '0.75rem 1rem',
                          transition: 'border-color 0.15s',
                        }}
                        className="timeline-card"
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                                {task.title}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                                {assignee && (
                                  <>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{assignee}</span>
                                    <span style={{ color: 'var(--border-default)', fontSize: '0.75rem' }}>·</span>
                                  </>
                                )}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatDate(task.created_at)}</span>
                                {task.due_date && (
                                  <>
                                    <span style={{ color: 'var(--border-default)', fontSize: '0.75rem' }}>·</span>
                                    <span style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--error)' : 'var(--text-tertiary)' }}>
                                      Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.625rem', fontWeight: 500, padding: '2px 8px', borderRadius: '99px',
                              background: statusBadge.bg, color: statusBadge.color,
                              border: `1px solid ${statusBadge.border}`,
                              flexShrink: 0,
                            }}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div style={{ marginTop: '0.625rem' }}>
                            <div style={{ height: 3, background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '99px',
                                background: STATUS_COLORS[task.status],
                                width: `${timeWidth}%`,
                                transition: 'width 0.3s',
                              }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                              <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>created</span>
                              <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>
                                {timeWidth >= 80 ? '30d+' : timeWidth >= 50 ? '7d+' : 'recently'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style>{`.timeline-card:hover { border-color: var(--border-default); }`}</style>
    </div>
  )
}
