'use client'

import { useState, useEffect } from 'react'
import type { Project } from '@/types'

export function EditProjectModal({ isOpen, onClose, onSave, onDelete, project }: {
  isOpen: boolean
  onClose: () => void
  onSave: (project: { id: string } & Partial<Project>) => void
  onDelete: (id: string) => void
  project: Project | null
}) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [status, setStatus] = useState<'active' | 'paused' | 'completed' | 'archived'>(project?.status || 'active')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Sync state when project prop changes (avoids setState during render)
  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setStatus(project.status)
    }
  }, [project])

  if (!isOpen || !project) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onSave({ id: project.id, name: name.trim(), description: description.trim(), status })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!showDelete) { setShowDelete(true); return }
    setIsSubmitting(true)
    try {
      await onDelete(project.id)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const STATUS_OPTIONS = ['active', 'paused', 'completed', 'archived'] as const

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '1rem',
      }}
      onClick={handleBackdropClick}
    >
      <div className="card" style={{ width: '100%', maxWidth: 440, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Edit Project</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Project Name *
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem)' }}>
              Description
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem)' }}>
              Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
              {STATUS_OPTIONS.map((s) => (
                <label key={s} style={{
                  display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${status === s ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: status === s ? 'var(--accent-muted)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="radio" name="edit-project-status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ display: 'none' }} />
                  <span style={{
                    fontSize: '0.8125rem',
                    color: status === s ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 500,
                  }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </label>
              ))}
            </div>
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
            <button type="submit" disabled={!name.trim() || isSubmitting} className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
