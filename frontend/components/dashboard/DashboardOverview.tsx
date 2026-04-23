import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { Agent, Project, Task } from '@/types'

interface Props {
  agents: Agent[]
  projects: Project[]
  tasks: Task[]
}

export function DashboardOverview({ agents, projects, tasks }: Props) {
  const [pulseIndices, setPulseIndices] = useState<number[]>([])
  const prevCountsRef = useRef<{ [key: string]: number | string }>({})

  const activeProjects = projects.filter(p => p.status === 'active').length
  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length
  const openTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const stats = [
    { id: 'projects', label: 'ACTIVE PROJECTS', value: activeProjects, subtext: projects[0]?.name || 'No projects', subcolor: 'var(--accent-teal)' },
    { id: 'agents', label: 'AGENTS ONLINE', value: onlineAgents, subtext: `${agents.length} total`, subcolor: 'var(--success)' },
    { id: 'tasks', label: 'OPEN TASKS', value: openTasks, subtext: `${tasks.filter(t => t.status === 'in-progress').length} in progress`, subcolor: 'var(--info)' },
    { id: 'progress', label: 'OVERALL PROGRESS', value: `${progress}%`, subtext: 'System heartbeat normal', subcolor: 'var(--accent-purple)' },
  ]

  // Heartbeat effect: detect changes in stats and trigger pulse
  useEffect(() => {
    const newPulseIndices: number[] = []
    stats.forEach((stat, idx) => {
      if (prevCountsRef.current[stat.id] !== undefined && prevCountsRef.current[stat.id] !== stat.value) {
        newPulseIndices.push(idx)
      }
      prevCountsRef.current[stat.id] = stat.value
    })

    if (newPulseIndices.length > 0) {
      setPulseIndices(newPulseIndices)
      const timer = setTimeout(() => setPulseIndices([]), 600)
      return () => clearTimeout(timer)
    }
  }, [activeProjects, onlineAgents, openTasks, progress])

  const getPhaseProgress = (tag: string) => {
    const phaseTasks = tasks.filter(t => t.tags?.some(tagStr => tagStr.toLowerCase().includes(tag)))
    // Default fallback for Build if no tags match
    if (tag === 'build' && phaseTasks.length === 0) {
      const buildCount = tasks.filter(t => !t.tags || t.tags.length === 0).length
      const buildCompleted = tasks.filter(t => (!t.tags || t.tags.length === 0) && t.status === 'completed').length
      const p = buildCount > 0 ? Math.round((buildCompleted / buildCount) * 100) : 0
      return { progress: p, status: p === 100 ? 'COMPLETE' : p > 0 ? 'IN PROGRESS' : 'AWAITING' }
    }
    
    if (phaseTasks.length === 0) return { progress: 0, status: 'WAITING' }
    const completed = phaseTasks.filter(t => t.status === 'completed').length
    const p = Math.round((completed / phaseTasks.length) * 100)
    return {
      progress: p,
      status: p === 100 ? 'COMPLETE' : p > 0 ? 'IN PROGRESS' : 'AWAITING'
    }
  }

  const designPhase = getPhaseProgress('design')
  const buildPhase = getPhaseProgress('build')
  const deployPhase = getPhaseProgress('deploy')

  const phases = [
    { name: 'Design', progress: designPhase.progress, color: 'var(--info)', status: designPhase.status },
    { name: 'Build', progress: buildPhase.progress, color: 'var(--warning)', status: buildPhase.status },
    { name: 'Deploy', progress: deployPhase.progress, color: 'var(--text-tertiary)', status: deployPhase.status },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* "Majestic" Page Title */}
      <div style={{ position: 'relative', padding: '1rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--text-primary), var(--text-tertiary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Overview
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Welcome to OpenClue Mission Control. Everything is running smoothly.</p>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px' }} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {stats.map((stat, idx) => (
          <div 
            key={stat.label} 
            className="card" 
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              cursor: 'default',
              animation: pulseIndices.includes(idx) ? 'pulse-stats 0.6s ease-out' : 'none',
              border: pulseIndices.includes(idx) ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {pulseIndices.includes(idx) && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
            )}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.75rem 0', color: 'var(--text-primary)' }}>{stat.value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
              <div style={{ 
                width: 6, height: 6, borderRadius: '50%', background: stat.subcolor,
                boxShadow: `0 0 10px ${stat.subcolor}80`
              }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Phase Systems */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
               <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Phase Trajectory</h2>
               <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>Current project: {projects[0]?.name || 'Internal'}</p>
            </div>
            <div className="badge" style={{ background: 'var(--bg-elevated)', padding: '4px 12px' }}>{phases.length} STAGES</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {phases.map(phase => (
              <div key={phase.name}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '2px', background: phase.color, transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.02em' }}>{phase.name.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{phase.status}</span>
                     <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', width: '3rem', textAlign: 'right' }}>{phase.progress}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${phase.progress}%`, 
                    background: phase.color, 
                    transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 12px ${phase.color}40`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Agent Pulse */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Agent Pulse</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '4px 10px', borderRadius: '20px', background: 'var(--success-muted)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, position: 'relative' }}>
                <span style={{ position: 'relative', width: 8, height: 8 }}>
                  <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', background: 'var(--success)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.75 }} />
                  <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                </span>
                {onlineAgents} LIVE
              </div>
            </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {agents.slice(0, 5).map(agent => (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, background: 'var(--bg-base)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                    border: '1px solid var(--border-subtle)'
                  }}>{agent.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{agent.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.125rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {agent.current_task || 'Monitoring systems...'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.625rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                      background: agent.status === 'online' ? 'var(--success-muted)' : 'var(--bg-base)',
                      color: agent.status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
                      textTransform: 'uppercase'
                    }}>{agent.status}</div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>{agent.role}</p>
                  </div>
                </div>
              ))}
           </div>
           
           <Link href="/agents" style={{ marginTop: 'auto', textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                 View All Agents
              </button>
           </Link>
        </div>

      </div>

    </div>
  )
}
