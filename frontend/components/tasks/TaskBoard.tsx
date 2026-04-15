'use client'

import { useState } from 'react'
import type { Task, TaskStatus } from '@/types'

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
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

export function TaskBoard({ tasks, onStatusChange }: Props) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

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

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
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
              {tasks.filter(t => t.status === col.id).length}
            </span>
          </div>
          <div className="space-y-2">
            {tasks.filter(t => t.status === col.id).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                className={`bg-white rounded border p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${
                  draggedTask?.id === task.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm leading-tight">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
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
            {tasks.filter(t => t.status === col.id).length === 0 && (
              <div className="text-center text-xs text-gray-400 py-6">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
