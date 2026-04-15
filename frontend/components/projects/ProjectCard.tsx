'use client'

import type { Project } from '@/types'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_BADGES = {
  active: '🟢 Active',
  paused: '🟡 Paused',
  completed: '🔵 Completed',
  archived: '⚪ Archived',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{project.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[project.status]}`}>
          {STATUS_BADGES[project.status]}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {project.description || 'No description'}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
