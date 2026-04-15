'use client'

import { useState } from 'react'
import type { Project } from '@/types'
import { NewProjectModal } from '@/components/modals/NewProjectModal'

interface ProjectsPanelProps {
  projects: Project[]
  onCreateProject: (project: Partial<Project>) => void
  onSelectProject: (projectId: string | null) => void
  selectedProjectId: string | null
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function ProjectsPanel({ projects, onCreateProject, onSelectProject, selectedProjectId }: ProjectsPanelProps) {
  const [showModal, setShowModal] = useState(false)

  const activeProjects = projects.filter(p => p.status === 'active')
  const otherProjects = projects.filter(p => p.status !== 'active')

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📁</span>
            <h3 className="font-semibold">Projects</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{projects.length}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
          >
            <span>+</span> New
          </button>
        </div>

        <div className="divide-y">
          {/* Filter: All projects */}
          <button
            onClick={() => onSelectProject(null)}
            className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition ${
              selectedProjectId === null ? 'bg-blue-50' : ''
            }`}
          >
            <span className="font-medium text-sm">All Projects</span>
            <span className="text-xs text-gray-500">{projects.length}</span>
          </button>

          {/* Active projects */}
          {activeProjects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              isSelected={selectedProjectId === project.id}
              onSelect={() => onSelectProject(selectedProjectId === project.id ? null : project.id)}
            />
          ))}

          {/* Other status */}
          {otherProjects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              isSelected={selectedProjectId === project.id}
              onSelect={() => onSelectProject(selectedProjectId === project.id ? null : project.id)}
              dimmed
            />
          ))}

          {projects.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No projects yet
            </div>
          )}
        </div>
      </div>

      <NewProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={onCreateProject}
      />
    </>
  )
}

function ProjectRow({ project, isSelected, onSelect, dimmed = false }: {
  project: Project
  isSelected: boolean
  onSelect: () => void
  dimmed?: boolean
}) {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active

  return (
    <button
      onClick={onSelect}
      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition flex items-center justify-between ${
        isSelected ? 'bg-blue-50' : ''
      } ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium truncate">{project.name}</span>
      </div>
      <span className={`text-xs px-1.5 py-0.5 rounded border ${config.color} shrink-0 ml-2`}>
        {config.label}
      </span>
    </button>
  )
}
