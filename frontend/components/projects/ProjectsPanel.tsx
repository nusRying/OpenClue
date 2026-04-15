'use client'

import { useState } from 'react'
import type { Project, Agent } from '@/types'
import { NewProjectModal } from '@/components/modals/NewProjectModal'
import { EditProjectModal } from '@/components/modals/EditProjectModal'

interface ProjectsPanelProps {
  projects: Project[]
  agents: Agent[]
  onCreateProject: (project: Partial<Project>) => void
  onUpdateProject: (project: { id: string } & Partial<Project>) => void
  onDeleteProject: (id: string) => void
  onSelectProject: (projectId: string | null) => void
  selectedProjectId: string | null
}

const STATUS_CONFIG = {
  active: { label: 'Active', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', dot: 'bg-amber-500' },
  completed: { label: 'Done', dot: 'bg-blue-500' },
  archived: { label: 'Archived', dot: 'bg-zinc-600' },
}

export function ProjectsPanel({ projects, agents, onCreateProject, onUpdateProject, onDeleteProject, onSelectProject, selectedProjectId }: ProjectsPanelProps) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-zinc-100">Projects</h2>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{projects.length}</span>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary text-xs">
          + New project
        </button>
      </div>

      <div className="space-y-1">
        {/* All projects filter */}
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
            selectedProjectId === null
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-zinc-800 text-zinc-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>All projects</span>
            <span className="text-xs opacity-60">{projects.length}</span>
          </div>
        </button>

        {/* Project list */}
        {projects.map(project => {
          const isSelected = selectedProjectId === project.id
          const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
          const owner = agents.find(a => a.id === project.owner_agent_id)

          return (
            <div key={project.id} className="group relative">
              <button
                onClick={() => onSelectProject(isSelected ? null : project.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex items-center gap-3 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{project.name}</div>
                  {owner && (
                    <div className={`text-xs truncate ${isSelected ? 'text-indigo-200' : 'text-zinc-600'}`}>
                      {owner.emoji} {owner.name}
                    </div>
                  )}
                </div>
                <span className={`text-xs opacity-50 ${isSelected ? 'text-indigo-200' : 'text-zinc-600'}`}>
                  {config.label}
                </span>
              </button>

              {/* Edit button on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); setEditProject(project); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition ${
                  isSelected ? 'hover:bg-indigo-500 text-indigo-200' : 'hover:bg-zinc-700 text-zinc-500'
                }`}
                title="Edit project"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )
        })}

        {projects.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-sm">
            No projects yet
          </div>
        )}
      </div>

      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={onCreateProject}
      />

      <EditProjectModal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        onSave={onUpdateProject}
        onDelete={onDeleteProject}
        project={editProject}
      />
    </>
  )
}
