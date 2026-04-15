'use client'

import { useState } from 'react'
import type { Task, TaskStatus, Project, Agent } from '@/types'
import { NewTaskModal } from '@/components/modals/NewTaskModal'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

const COLUMNS: { id: TaskStatus; label: string; dotColor: string; colBg: string; colBorder: string }[] = [
  { id: 'pending', label: 'To do', dotColor: 'bg-zinc-500', colBg: 'col-pending', colBorder: 'border-[var(--border)]' },
  { id: 'in-progress', label: 'In progress', dotColor: 'bg-blue-500', colBg: 'col-in-progress', colBorder: 'border-blue-500/30' },
  { id: 'completed', label: 'Done', dotColor: 'bg-success', colBg: 'col-completed', colBorder: 'border-success/30' },
  { id: 'blocked', label: 'Blocked', dotColor: 'bg-error', colBg: 'col-blocked', colBorder: 'border-error/30' },
]

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-muted', bg: 'badge-low' },
  medium: { label: 'Medium', color: 'text-warning', bg: 'badge-medium' },
  high: { label: 'High', color: 'text-orange-400', bg: 'badge-high' },
  critical: { label: 'Critical', color: 'text-error', bg: 'badge-critical' },
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
  const [showNewModal, setShowNewModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  function handleDragStart(task: Task) { setDraggedTask(task) }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status && onStatusChange) {
      onStatusChange(draggedTask.id, status)
    }
    setDraggedTask(null)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-primary">Tasks</h2>
          <span className="text-xs text-muted bg-tertiary px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
          {selectedProject && (
            <span className="text-xs text-accent bg-accent-subtle px-2 py-0.5 rounded-full">{selectedProject.name}</span>
          )}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={projects.length === 0}
          className="btn btn-primary text-xs disabled:opacity-40"
        >
          + New task
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id)
          return (
            <div
              key={col.id}
              className="flex-1 min-w-56"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-sm font-medium text-secondary">{col.label}</span>
                </div>
                <span className="text-xs text-muted bg-tertiary px-1.5 py-0.5 rounded">{columnTasks.length}</span>
              </div>

              {/* Column body */}
              <div className={`rounded-lg border ${col.colBorder} ${col.colBg} p-2 space-y-2 min-h-32`}>
                {columnTasks.map(task => {
                  const assignee = agents.find(a => a.id === task.assignee_id)
                  const priority = PRIORITY_CONFIG[task.priority]
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => setEditTask(task)}
                      className={`bg-[var(--bg-secondary)] rounded-md p-3 cursor-pointer hover:bg-elevated transition border border-[var(--border-subtle)] hover:border-[var(--border)] ${
                        draggedTask?.id === task.id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Title */}
                      <div className="text-sm font-medium text-primary leading-snug">{task.title}</div>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priority.bg} ${priority.color} font-medium`}>
                          {priority.label}
                        </span>

                        {assignee && (
                          <div className="flex items-center gap-1 text-muted">
                            <span className="text-xs">{assignee.emoji}</span>
                            <span className="text-xs">{assignee.name}</span>
                          </div>
                        )}

                        {task.due_date && (
                          <span className={`text-[10px] ${isOverdue ? 'text-error' : 'text-muted'}`}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-muted">
                    Empty
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
