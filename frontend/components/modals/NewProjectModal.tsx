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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New Project</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Create a new project to track work</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project Name *</label>
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
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['active', 'paused'] as const).map((s) => (
                <label key={s} className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${status === s ? 'border-indigo-500 bg-indigo-600/20' : 'border-zinc-700 hover:border-zinc-600'}`}>
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
                  <span className={`text-sm ${status === s ? 'text-indigo-400' : 'text-zinc-400'}`}>{s === 'active' ? '● Active' : '◐ Paused'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={!name.trim() || isSubmitting} className="btn btn-primary flex-1">
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
