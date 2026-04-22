'use client'

import { useState } from 'react'
import type { Project, Agent } from '@/types'
import { NewProjectModal } from '@/components/modals/NewProjectModal'
import { EditProjectModal } from '@/components/modals/EditProjectModal'

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'var(--success)', bg: 'var(--success-muted)' },
  paused: { label: 'Paused', color: 'var(--warning)', bg: 'var(--warning-muted)' },
  completed: { label: 'Done', color: 'var(--info)', bg: 'var(--info-muted)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)', bg: 'var(--bg-elevated)' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Projects</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>Manage and track your active workspaces</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
          + New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* All Projects Card */}
        <div 
          onClick={() => onSelectProject(null)}
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: `2px solid ${selectedProjectId === null ? 'var(--accent)' : 'var(--border-subtle)'}`,
            background: selectedProjectId === null ? 'var(--accent-muted)' : 'var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>OVERVIEW</span>
            <span className="badge" style={{ background: 'var(--bg-elevated)' }}>{projects.length}</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: selectedProjectId === null ? 'var(--accent)' : 'var(--text-primary)' }}>All Projects</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Unified view of all active missions.</p>
        </div>

        {/* Project Cards */}
        {projects.map(project => {
          const isSelected = selectedProjectId === project.id
          const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
          const owner = agents.find(a => a.id === project.owner_agent_id)

          return (
            <div 
              key={project.id}
              onClick={() => onSelectProject(isSelected ? null : project.id)}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: isSelected ? 'var(--accent-muted)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ 
                  fontSize: '0.625rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                  background: config.bg, color: config.color, textTransform: 'uppercase'
                }}>{config.label}</div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); setEditProject(project); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </h3>

              {owner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    {owner.emoji}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{owner.name}</span>
                </div>
              )}
              
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: project.status === 'completed' ? '100%' : '30%', background: config.color, borderRadius: '2px' }} />
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {project.status === 'completed' ? '100%' : '30%'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-subtle)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>No projects discovered yet.</p>
          <button onClick={() => setShowNewModal(true)} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Initialize First Project</button>
        </div>
      )}

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
    </div>
  )
}
