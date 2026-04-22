'use client'

import type { Agent, Project, Task } from '@/types'

interface Props {
  agents: Agent[]
  projects: Project[]
  tasks: Task[]
}

export function DashboardOverview({ agents, projects, tasks }: Props) {
  const activeProjects = projects.filter(p => p.status === 'active').length
  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length
  const openTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const stats = [
    { label: 'ACTIVE PROJECTS', value: activeProjects, subtext: projects[0]?.name || 'No projects', subcolor: 'var(--accent-teal)' },
    { label: 'AGENTS ONLINE', value: onlineAgents, subtext: `${agents.length} total`, subcolor: 'var(--success)' },
    { label: 'OPEN TASKS', value: openTasks, subtext: `${tasks.filter(t => t.status === 'in_progress').length} in progress`, subcolor: 'var(--info)' },
    { label: 'OVERALL PROGRESS', value: `${progress}%`, subtext: 'Build phase active', subcolor: 'var(--accent-purple)' },
  ]

  const phases = [
    { name: 'Design', progress: 100, color: 'var(--info)', status: 'COMPLETE — MCW-DESIGN-MOCKUPS.MD DELIVERED' },
    { name: 'Build', progress: 30, color: 'var(--warning)', status: 'IN PROGRESS — PAGE BUILDER ACTIVE' },
    { name: 'Deploy', progress: 0, color: 'var(--text-tertiary)', status: 'WAITING FOR BUILD' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Mission Control Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Kutraa Information Technology — workspace overview</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.05em' }}>{stat.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{stat.value}</p>
            <p style={{ fontSize: '0.75rem', color: stat.subcolor, margin: 0, fontWeight: 500 }}>{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Middle Row: Phase Progress & Agent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        
        {/* Phase Progress */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Phase Progress — {projects[0]?.name || 'Select Project'}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{phases.length} phases</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {phases.map(phase => (
              <div key={phase.name}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{phase.name}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: phase.color }}>{phase.progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ height: '100%', width: `${phase.progress}%`, background: phase.color, transition: 'width 1s ease-in-out' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: phase.progress === 100 ? 'var(--success)' : phase.progress > 0 ? 'var(--info)' : 'var(--text-tertiary)', margin: 0, fontWeight: 500 }}>
                  {phase.progress === 100 && '✓ '}{phase.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side element from inspiration (Agent Status list could go here or in main BoardView sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="card" style={{ padding: '1.25rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Agent Status</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                  {onlineAgents} active
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {agents.slice(0, 4).map(agent => (
                  <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' 
                    }}>{agent.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>{agent.role} ({agent.name})</p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0 }}>{agent.current_task || 'Awaiting task'}</p>
                    </div>
                    <span className="badge" style={{ 
                      background: agent.status === 'online' ? 'var(--success-muted)' : 'var(--bg-elevated)', 
                      color: agent.status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
                      fontSize: '0.625rem'
                    }}>{agent.status === 'online' ? 'Working' : 'Idle'}</span>
                  </div>
                ))}
             </div>
           </div>
        </div>

      </div>

    </div>
  )
}
