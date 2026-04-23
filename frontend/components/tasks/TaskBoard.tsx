'use client'

import { useState, useMemo } from 'react'
import type { Task, TaskStatus, Project, Agent } from '@/types'
import { enrichTasksWithAssignees, getAssigneeNames } from '@/lib/taskEnricher'
import { NewTaskModal } from '@/components/modals/NewTaskModal'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

const COLUMNS: { id: TaskStatus; label: string; dotColor: string; colBg: string; colBorder: string }[] = [
  { id: 'pending', label: 'BACKLOG', dotColor: 'var(--priority-low)', colBg: 'var(--bg-elevated)', colBorder: 'var(--border-subtle)' },
  { id: 'in-progress', label: 'IN PROGRESS', dotColor: 'var(--info)', colBg: 'var(--bg-elevated)', colBorder: 'var(--border-subtle)' },
  { id: 'completed', label: 'COMPLETED', dotColor: 'var(--success)', colBg: 'var(--bg-elevated)', colBorder: 'var(--border-subtle)' },
  { id: 'blocked', label: 'BLOCKED', dotColor: 'var(--error)', colBg: 'var(--bg-elevated)', colBorder: 'var(--border-subtle)' },
]

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'var(--priority-low)', bg: 'var(--priority-low-bg)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)' },
  high: { label: 'High', color: 'var(--priority-high)', bg: 'var(--priority-high-bg)' },
  critical: { label: 'Critical', color: 'var(--priority-critical)', bg: 'var(--priority-critical-bg)' },
}

interface Props {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onCreateTask: (task: Partial<Task>) => void
  onUpdateTask: (task: { id: string } & Partial<Task>) => void
  onDeleteTask: (id: string) => void
  selectedProjectId: string | null
}

export function TaskBoard({ tasks, projects, agents, onStatusChange, onCreateTask, onUpdateTask, onDeleteTask, selectedProjectId }: Props) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  // Enrich tasks with assignee data
  const enrichedTasks = useMemo(() => enrichTasksWithAssignees(tasks, agents), [tasks, agents])

  const filteredTasks = selectedProjectId
    ? enrichedTasks.filter(t => t.project_id === selectedProjectId)
    : enrichedTasks

  function handleDragStart(_: React.DragEvent, task: Task) {
    setDraggedTask(task)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDragEnter(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault()
    setDragOverColumn(status)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOverColumn(null)
  }

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status && onStatusChange) {
      onStatusChange(draggedTask.id, status)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Task Pipeline</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge" style={{ background: 'var(--bg-elevated)' }}>{filteredTasks.length} {filteredTasks.length === 1 ? 'TASK' : 'TASKS'}</span>
            {selectedProject && <span className="badge" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{selectedProject.name}</span>}
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={projects.length === 0}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.25rem' }}
        >
          + Create Task
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: '600px' }}>
        {COLUMNS.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id)
          return (
            <div
              key={col.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                outline: dragOverColumn === col.id ? `2px dashed var(--accent)` : 'none',
                transition: 'all 0.2s',
              }}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dotColor, boxShadow: `0 0 8px ${col.dotColor}` }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{columnTasks.length}</span>
              </div>

              {/* Column body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {columnTasks.map(task => {
                  const project = projects.find(p => p.id === task.project_id)
                  const priority = PRIORITY_CONFIG[task.priority]
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => setEditTask(task)}
                      className="card task-card"
                      style={{
                        padding: '1.25rem',
                        cursor: 'grab',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        opacity: draggedTask?.id === task.id ? 0.4 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: priority.color, textTransform: 'uppercase' }}>
                          {priority.label}
                        </div>
                        {task.due_date && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: isOverdue ? 'var(--error)' : 'var(--text-tertiary)' }}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                        {task.title}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        {/* Assignees */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem 0', fontWeight: 600, textTransform: 'uppercase' }}>
                            Assigned to
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getAssigneeNames(task)}
                          </p>
                        </div>

                        {/* Multi-Agent Avatars */}
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                          {(task.assignees || []).slice(0, 3).map((assignee, idx) => (
                            <div
                              key={assignee.id}
                              title={assignee.name}
                              style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--bg-elevated)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.875rem', border: '2px solid var(--bg-base)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                marginLeft: idx === 0 ? 0 : -8,
                                zIndex: 10 - idx,
                                position: 'relative'
                              }}
                            >
                              {assignee.emoji}
                            </div>
                          ))}
                          {(task.assignees || []).length > 3 && (
                            <div
                              title={`+${(task.assignees || []).length - 3} more`}
                              style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--bg-elevated)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, border: '2px solid var(--bg-base)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                marginLeft: -8,
                                zIndex: 7,
                                position: 'relative',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              +{(task.assignees || []).length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flex: 1, fontSize: '0.8125rem', color: 'var(--text-tertiary)', minHeight: '6rem',
                    border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)'
                  }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <NewTaskModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={onCreateTask}
        projects={projects}
        agents={agents}
      />

      <EditTaskModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={onUpdateTask}
        onDelete={onDeleteTask}
        task={editTask}
        agents={agents}
      />
    </div>
  )
}
