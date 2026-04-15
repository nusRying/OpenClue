'use client'

import { useState } from 'react'
import type { Project, Agent } from '@/types'
import { NewProjectModal } from '@/components/modals/NewProjectModal'
import { EditProjectModal } from '@/components/modals/EditProjectModal'

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'var(--success)' },
  paused: { label: 'Paused', color: 'var(--warning)' },
  completed: { label: 'Done', color: 'var(--info)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)' },
}

interface ProjectsPanelProps {
  projects: Project[]
  agents: Agent[]
  onCreateProject: (project: Partial<Project>) => void
  onUpdateProject: (project: { id: string } & Partial<Project>) => void
  onDeleteProject: (id: string) => void
  onSelectProject: (projectId: string | null) => void
  selectedProjectId: string | null
}

export function ProjectsPanel({ projects, agents, onCreateProject, onUpdateProject, onDeleteProject, onSelectProject, selectedProjectId }: ProjectsPanelProps) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Projects</h2>
          <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{projects.length}</span>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
          + New project
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {/* All projects */}
        <button
          onClick={() => onSelectProject(null)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: selectedProjectId === null ? 'var(--accent-solid)' : 'transparent',
            color: selectedProjectId === null ? 'white' : 'var(--text-secondary)',
            fontSize: '0.875rem', fontWeight: 500,
            cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.15s',
            width: '100%',
          }}
          className="project-filter-btn"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectProject(null) }}
        >
          <span>All projects</span>
          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{projects.length}</span>
        </button>

        {/* Project list */}
        {projects.map(project => {
          const isSelected = selectedProjectId === project.id
          const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
          const owner = agents.find(a => a.id === project.owner_agent_id)

          return (
            <div key={project.id} style={{ position: 'relative' }} className="project-row-group">
              <button
                onClick={() => onSelectProject(isSelected ? null : project.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isSelected ? 'var(--accent-solid)' : 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
                className="project-filter-btn"
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {project.name}
                  </div>
                  {owner && (
                    <div style={{
                      fontSize: '0.6875rem',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                      opacity: isSelected ? 0.6 : 1,
                      marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {owner.emoji} {owner.name}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: '0.6875rem',
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                  opacity: isSelected ? 0.5 : 1,
                  flexShrink: 0,
                }}>
                  {config.label}
                </span>
              </button>

              {/* Edit button */}
              <button
                onClick={(e) => { e.stopPropagation(); setEditProject(project); }}
                title="Edit project"
                style={{
                  position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'all 0.15s',
                }}
                className="project-edit-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )
        })}

        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>No projects yet</p>
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
