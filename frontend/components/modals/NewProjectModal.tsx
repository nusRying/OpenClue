'use client'

import { useState } from 'react'
import type { Project } from '@/types'

export function NewProjectModal({ isOpen, onClose, onCreate }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (project: Partial<Project>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'paused'>('active')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onCreate({ name: name.trim(), description: description.trim(), status })
      setName('')
      setDescription('')
      setStatus('active')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Project</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Create a new project to track work</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mission Control Phase 2"
              className="input"
              autoFocus
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['active', 'paused'] as const).map((s) => (
                <label key={s} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${status === s ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: status === s ? 'var(--accent-muted)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" name="new-project-status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ display: 'none' }} />
                  <span style={{
                    fontSize: '0.8125rem',
                    color: status === s ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 500,
                  }}>
                    {s === 'active' ? '● Active' : '◐ Paused'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={!name.trim() || isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
