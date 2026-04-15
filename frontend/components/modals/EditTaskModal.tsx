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

  if (task && (
    title !== task.title ||
    description !== (task.description || '') ||
    status !== task.status ||
    priority !== task.priority ||
    assigneeId !== (task.assignee_id || '') ||
    dueDate !== (task.due_date ? task.due_date.split('T')[0] : '')
  )) {
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

  const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: 'var(--border-default)' },
    'in-progress': { bg: 'var(--status-in-progress-bg)', color: 'var(--info)', border: 'var(--status-in-progress-border)' },
    completed: { bg: 'var(--success-muted)', color: 'var(--success)', border: 'var(--status-completed-border)' },
    blocked: { bg: 'var(--error-muted)', color: 'var(--error)', border: 'var(--status-blocked-border)' },
  }

  const statusBadge = STATUS_BADGE[status] || STATUS_BADGE.pending

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Edit Task</h2>
          <span style={{
            fontSize: '0.625rem', fontWeight: 500, padding: '2px 8px', borderRadius: '99px',
            background: statusBadge.bg, color: statusBadge.color,
            border: `1px solid ${statusBadge.border}`,
          }}>
            {status.replace('-', ' ')}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Title *
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" autoFocus required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Description
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="pending">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleDelete}
              className={showDelete ? 'btn-danger' : 'btn-secondary'}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
            >
              {showDelete ? 'Confirm delete?' : 'Delete'}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={!title.trim() || isSubmitting} className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
