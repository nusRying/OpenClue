'use client'

import { useState } from 'react'
import type { Task, Project } from '@/types'

export function NewTaskModal({ isOpen, onClose, onCreate, projects }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Partial<Task>) => void
  projects: Project[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        project_id: projectId || undefined,
        priority,
        due_date: dueDate || undefined,
        status: 'pending',
      })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="input" autoFocus required />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional details..." className="input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input">
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={!title.trim() || isSubmitting} className="btn btn-primary flex-1">
              {isSubmitting ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
