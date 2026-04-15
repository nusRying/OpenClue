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
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function ProjectsPanel({ projects, agents, onCreateProject, onUpdateProject, onDeleteProject, onSelectProject, selectedProjectId }: ProjectsPanelProps) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)

  const activeProjects = projects.filter(p => p.status === 'active')
  const otherProjects = projects.filter(p => p.status !== 'active')

  const getOwnerName = (ownerAgentId?: string) => {
    if (!ownerAgentId) return null
    const agent = agents.find(a => a.id === ownerAgentId)
    return agent ? `${agent.emoji} ${agent.name}` : null
  }

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
            onClick={() => setShowNewModal(true)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
          >
            <span>+</span> New
          </button>
        </div>

        <div className="divide-y max-h-[400px] overflow-y-auto">
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
              onEdit={() => setEditProject(project)}
              ownerName={getOwnerName(project.owner_agent_id)}
            />
          ))}

          {/* Other status */}
          {otherProjects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              isSelected={selectedProjectId === project.id}
              onSelect={() => onSelectProject(selectedProjectId === project.id ? null : project.id)}
              onEdit={() => setEditProject(project)}
              ownerName={getOwnerName(project.owner_agent_id)}
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
        agents={agents}
      />
    </>
  )
}

function ProjectRow({ project, isSelected, onSelect, onEdit, ownerName, dimmed = false }: {
  project: Project
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  ownerName: string | null
  dimmed?: boolean
}) {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active

  return (
    <div className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition group ${isSelected ? 'bg-blue-50' : ''} ${dimmed ? 'opacity-60' : ''}`}>
      <button
        onClick={onSelect}
        className="flex-1 text-left flex items-center justify-between min-w-0"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{project.name}</span>
            {ownerName && (
              <span className="text-xs text-gray-400 shrink-0">{ownerName}</span>
            )}
          </div>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded border ${config.color} shrink-0 ml-2`}>
          {config.label}
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition ml-2"
        title="Edit project"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )
}
