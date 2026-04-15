'use client'

import { useState } from 'react'
import type { Task, TaskStatus, Project, Agent } from '@/types'
import { NewTaskModal } from '@/components/modals/NewTaskModal'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

const COLUMNS: { id: TaskStatus; label: string; color: string; borderColor: string }[] = [
  { id: 'pending', label: 'To do', color: 'bg-zinc-800', borderColor: 'border-zinc-600' },
  { id: 'in-progress', label: 'In progress', color: 'bg-blue-900/30', borderColor: 'border-blue-700' },
  { id: 'completed', label: 'Done', color: 'bg-emerald-900/30', borderColor: 'border-emerald-800' },
  { id: 'blocked', label: 'Blocked', color: 'bg-red-900/30', borderColor: 'border-red-800' },
]

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-zinc-500', bg: 'bg-zinc-800' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-900/40' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-900/40' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-900/40' },
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

  function handleDragStart(task: Task) {
    setDraggedTask(task)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

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
          <h2 className="text-base font-semibold text-zinc-100">Tasks</h2>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
          {selectedProject && (
            <span className="text-xs text-indigo-400 bg-indigo-900/40 px-2 py-0.5 rounded-full">{selectedProject.name}</span>
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
                  <div className={`w-2 h-2 rounded-full ${col.id === 'pending' ? 'bg-zinc-500' : col.id === 'in-progress' ? 'bg-blue-500' : col.id === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-zinc-300">{col.label}</span>
                </div>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{columnTasks.length}</span>
              </div>

              {/* Column body */}
              <div className={`rounded-lg border ${col.borderColor} ${col.color} p-2 space-y-2 min-h-32`}>
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
                      className={`bg-zinc-900/80 rounded-md p-3 cursor-pointer hover:bg-zinc-800/80 transition border border-zinc-800 hover:border-zinc-700 ${
                        draggedTask?.id === task.id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Title */}
                      <div className="text-sm font-medium text-zinc-100 leading-snug">{task.title}</div>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Priority */}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priority.bg} ${priority.color} font-medium`}>
                          {priority.label}
                        </span>

                        {/* Assignee */}
                        {assignee && (
                          <div className="flex items-center gap-1 text-zinc-500">
                            <span className="text-xs">{assignee.emoji}</span>
                            <span className="text-xs">{assignee.name}</span>
                          </div>
                        )}

                        {/* Due date */}
                        {task.due_date && (
                          <span className={`text-[10px] ${isOverdue ? 'text-red-400' : 'text-zinc-600'}`}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-zinc-700">
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
