'use client'

import type { Task, Project, Agent } from '@/types'

interface TimelineProps {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
  onBack?: () => void
}

const STATUS_COLORS = {
  pending: 'bg-zinc-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-success',
  blocked: 'bg-error',
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
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTimeWidth(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const diff = now - created
  const days7 = 7 * 24 * 60 * 60 * 1000
  const days30 = 30 * 24 * 60 * 60 * 1000
  if (diff < days7) return Math.min(100, (diff / days7) * 100)
  if (diff < days30) return Math.min(100, 50 + ((diff - days7) / (days30 - days7)) * 50)
  return 100
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h2 className="text-lg font-semibold text-primary">Timeline</h2>
            <p className="text-xs text-muted">{tasks.length} tasks across {projects.length} projects</p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="btn btn-secondary text-xs">
            ← Back
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3">📋</div>
          <p>No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
            const projectName = getProjectName(projectId, projects)
            return (
              <div key={projectId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-accent">{projectName}</span>
                  <span className="text-xs text-muted bg-tertiary px-2 py-0.5 rounded-full">
                    {projectTasks.length}
                  </span>
                </div>
                <div className="relative pl-4 border-l border-[var(--border)] space-y-3">
                  {projectTasks.map((task) => {
                    const assignee = getAgentName(task.assignee_id, agents)
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                    const timeWidth = getTimeWidth(task.created_at)

                    return (
                      <div key={task.id} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-primary)] ${STATUS_COLORS[task.status]}`} />

                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 hover:border-[var(--border)] transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-primary">{task.title}</div>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                                {assignee && (
                                  <>
                                    <span>{assignee}</span>
                                    <span className="text-[var(--border)]">·</span>
                                  </>
                                )}
                                <span>{formatDate(task.created_at)}</span>
                                {task.due_date && (
                                  <>
                                    <span className="text-[var(--border)]">·</span>
                                    <span className={isOverdue ? 'text-error' : ''}>
                                      Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                task.status === 'completed' ? 'bg-success-bg text-success border-success/30' :
                                task.status === 'in-progress' ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' :
                                task.status === 'blocked' ? 'bg-error-bg text-error border-error/30' :
                                'bg-tertiary text-muted border-[var(--border)]'
                              }`}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2.5">
                            <div className="h-1 bg-tertiary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${STATUS_COLORS[task.status]}`}
                                style={{ width: `${timeWidth}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-0.5 text-[10px] text-muted">
                              <span>created</span>
                              <span>{timeWidth >= 80 ? '30d+' : timeWidth >= 50 ? '7d+' : 'recently'}</span>
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
    </div>
  )
}
