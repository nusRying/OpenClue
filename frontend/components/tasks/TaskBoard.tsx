'use client'

import { useState } from 'react'
import type { Task, TaskStatus, Project } from '@/types'
import { NewTaskModal } from '@/components/modals/NewTaskModal'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'border-gray-300' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-400' },
  { id: 'completed', label: 'Completed', color: 'border-green-400' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-400' },
]

const PRIORITY_COLORS = {
  low: 'text-gray-400',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

const PRIORITY_BADGE = {
  low: 'bg-gray-100',
  medium: 'bg-yellow-100',
  high: 'bg-orange-100',
  critical: 'bg-red-100',
}

interface Props {
  tasks: Task[]
  projects: Project[]
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onCreateTask: (task: Partial<Task>) => void
  selectedProjectId: string | null
}

export function TaskBoard({ tasks, projects, onStatusChange, onCreateTask, selectedProjectId }: Props) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  function handleDragStart(task: Task) {
    setDraggedTask(task)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(status: TaskStatus) {
    if (draggedTask && draggedTask.status !== status && onStatusChange) {
      onStatusChange(draggedTask.id, status)
    }
    setDraggedTask(null)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="font-semibold">Tasks</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{filteredTasks.length}</span>
            {selectedProject && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {selectedProject.name}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={projects.length === 0}
            className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+</span> New Task
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto p-4">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className={`flex-1 min-w-64 bg-gray-50 rounded-lg p-3 border-t-4 ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="text-xs bg-gray-200 rounded px-1.5 py-0.5">
                  {filteredTasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <div className="space-y-2">
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className={`bg-white rounded border p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="font-medium text-sm leading-tight">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_BADGE[task.priority]} ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-400">
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-6">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-6">
            Create a project first to add tasks
          </div>
        )}
      </div>

      <NewTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={onCreateTask}
        projects={projects}
      />
    </>
  )
}
