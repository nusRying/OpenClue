'use client'

import { useState } from 'react'
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

  if (project && (name !== project.name || description !== (project.description || '') || status !== project.status)) {
    setName(project.name)
    setDescription(project.description || '')
    setStatus(project.status)
  }

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-base font-semibold text-primary">Edit Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Project Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus required />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['active', 'paused', 'completed', 'archived'] as const).map((s) => (
                <label key={s} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  status === s ? 'border-[var(--accent)] bg-accent-subtle' : 'border-[var(--border)] hover:border-[var(--bg-elevated)]'
                }`}>
                  <input type="radio" name="edit-status" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
                  <span className={`text-xs ${status === s ? 'text-accent' : 'text-secondary'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleDelete} className={`btn text-xs ${showDelete ? 'bg-error text-white hover:bg-red-700' : 'btn-secondary'}`}>
              {showDelete ? 'Confirm delete?' : 'Delete'}
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={!name.trim() || isSubmitting} className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
