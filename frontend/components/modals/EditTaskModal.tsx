'use client'

import { useState } from 'react'
import type { Task, Agent } from '@/types'

export function EditTaskModal({ isOpen, onClose, onSave, onDelete, task, agents }: {
  isOpen: boolean
  onClose: () => void
  onSave: (task: { id: string } & Partial<Task>) => void
  onDelete: (id: string) => void
  task: Task | null
  agents: Agent[]
}) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || 'pending')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (task && (title !== task.title || description !== (task.description || '') || status !== task.status || priority !== task.priority || assigneeId !== (task.assignee_id || '') || dueDate !== (task.due_date ? task.due_date.split('T')[0] : ''))) {
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setPriority(task.priority)
    setAssigneeId(task.assignee_id || '')
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
  }

  if (!isOpen || !task) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      await onSave({
        id: task.id,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee_id: assigneeId || undefined,
        due_date: dueDate || undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!showDelete) { setShowDelete(true); return }
    setIsSubmitting(true)
    try {
      await onDelete(task.id)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary">Edit Task</h2>
          <span className={`text-xs px-2 py-0.5 rounded border ${
            status === 'completed' ? 'bg-success-bg text-success border-success/30' :
            status === 'in-progress' ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' :
            status === 'blocked' ? 'bg-error-bg text-error border-error/30' :
            'bg-tertiary text-muted border-[var(--border)]'
          }`}>{status.replace('-', ' ')}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" autoFocus required />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input bg-[var(--bg-secondary)]">
                <option value="pending">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="input bg-[var(--bg-secondary)]">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Assignee</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input bg-[var(--bg-secondary)]">
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleDelete} className={`btn text-xs ${showDelete ? 'bg-error text-white hover:bg-red-700' : 'btn-secondary'}`}>
              {showDelete ? 'Confirm delete?' : 'Delete'}
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={!title.trim() || isSubmitting} className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
