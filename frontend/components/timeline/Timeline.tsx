'use client'

import type { Task, Project, Agent } from '@/types'

interface TimelineProps {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
}

const STATUS_COLORS = {
  pending: 'border-gray-300 bg-gray-50',
  'in-progress': 'border-blue-400 bg-blue-50',
  completed: 'border-green-400 bg-green-50',
  blocked: 'border-red-400 bg-red-50',
}

const STATUS_DOT = {
  pending: 'bg-gray-400',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}

function getProjectName(projectId: string, projects: Project[]): string {
  return projects.find(p => p.id === projectId)?.name || 'Unknown'
}

function getAgentName(agentId: string | undefined, agents: Agent[]): string {
  if (!agentId) return 'Unassigned'
  return agents.find(a => a.id === agentId)?.name || 'Unknown'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
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

export function Timeline({ tasks, projects, agents }: TimelineProps) {
  // Sort tasks by creation date (newest first)
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Group by project
  const tasksByProject = sortedTasks.reduce((acc, task) => {
    const projectId = task.project_id || 'unknown'
    if (!acc[projectId]) acc[projectId] = []
    acc[projectId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p>No tasks yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
        <span className="text-lg">📊</span>
        <h3 className="font-semibold">Timeline</h3>
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{tasks.length} tasks</span>
      </div>

      <div className="divide-y">
        {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
          const projectName = getProjectName(projectId, projects)
          return (
            <div key={projectId} className="p-4">
              <div className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <span>📁</span> {projectName}
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                {projectTasks.map((task, idx) => (
                  <div key={task.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white ${STATUS_DOT[task.status]}`} />

                    {/* Task card */}
                    <div className={`rounded-lg border p-3 ${STATUS_COLORS[task.status]}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{getAgentName(task.assignee_id, agents)}</span>
                            <span>•</span>
                            <span>{formatDate(task.created_at)}</span>
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : ''}>
                                  Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          task.status === 'blocked' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Time bar */}
                      <div className="mt-2">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${STATUS_DOT[task.status]}`}
                            style={{ width: `${getTimeWidth(task.created_at)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-0.5 text-[10px] text-gray-400">
                          <span>created</span>
                          <span>{getTimeWidth(task.created_at) >= 80 ? '30d+' : getTimeWidth(task.created_at) >= 50 ? '7d+' : 'recently'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
