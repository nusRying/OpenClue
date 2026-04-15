'use client'

import { useState } from 'react'
import type { Task, TaskStatus, Project, Agent } from '@/types'
import { NewTaskModal } from '@/components/modals/NewTaskModal'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

const COLUMNS: { id: TaskStatus; label: string; dotColor: string; colBg: string; colBorder: string }[] = [
  { id: 'pending', label: 'To do', dotColor: 'var(--priority-low)', colBg: 'var(--col-pending)', colBorder: 'var(--border-subtle)' },
  { id: 'in-progress', label: 'In progress', dotColor: 'var(--info)', colBg: 'var(--col-in-progress)', colBorder: 'var(--col-in-progress-border)' },
  { id: 'completed', label: 'Done', dotColor: 'var(--success)', colBg: 'var(--col-done)', colBorder: 'var(--col-done-border)' },
  { id: 'blocked', label: 'Blocked', dotColor: 'var(--error)', colBg: 'var(--col-blocked)', colBorder: 'var(--col-blocked-border)' },
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

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

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
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Tasks</h2>
          <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
            {filteredTasks.length}
          </span>
          {selectedProject && (
            <span className="badge" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
              {selectedProject.name}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={projects.length === 0}
          className="btn btn-primary"
          style={{ fontSize: '0.8125rem' }}
        >
          + New task
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {COLUMNS.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id)
          return (
            <div
              key={col.id}
              style={{
                flex: '1 1 0',
                minWidth: 200,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-lg)',
                outline: dragOverColumn === col.id ? `2px solid ${col.dotColor}` : 'none',
                outlineOffset: '2px',
                transition: 'outline 0.15s',
              }}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dotColor }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{col.label}</span>
                </div>
                <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Column body */}
              <div style={{
                flex: 1,
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${col.colBorder}`,
                background: col.colBg,
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minHeight: '8rem',
              }}>
                {columnTasks.map(task => {
                  const assignee = agents.find(a => a.id === task.assignee_id)
                  const priority = PRIORITY_CONFIG[task.priority]
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

                  return (
                    <div
                      key={task.id}
                      draggable
                      tabIndex={0}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => setEditTask(task)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditTask(task) }}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        cursor: 'grab',
                        transition: 'all 0.15s',
                        opacity: draggedTask?.id === task.id ? 0.4 : 1,
                      }}
                      className="task-card"
                    >
                      <style>{`
                        .task-card:hover { background: var(--bg-elevated); border-color: var(--border-default); }
                        .task-card:active { cursor: grabbing; }
                      `}</style>

                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                        {task.title}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Priority badge */}
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 600,
                          padding: '2px 6px', borderRadius: '99px',
                          color: priority.color, background: priority.bg,
                        }}>
                          {priority.label}
                        </span>

                        {/* Assignee */}
                        {assignee && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                          }}>
                            <span>{assignee.emoji}</span>
                            <span>{assignee.name}</span>
                          </span>
                        )}

                        {/* Due date */}
                        {task.due_date && (
                          <span style={{
                            fontSize: '0.625rem',
                            color: isOverdue ? 'var(--error)' : 'var(--text-tertiary)',
                            marginLeft: 'auto',
                          }}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flex: 1, fontSize: '0.75rem', color: 'var(--text-tertiary)', minHeight: '4rem',
                  }}>
                    {selectedProjectId ? 'No tasks' : 'Empty'}
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
      />

      <EditTaskModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={onUpdateTask}
        onDelete={onDeleteTask}
        task={editTask}
        agents={agents}
      />
    </>
  )
}
