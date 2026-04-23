'use client'

import type { Project, Agent, Task, ActivityEvent, Conversation } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Props {
  project: Project
  agents: Agent[]
  statusConfig: Record<string, { label: string; color: string; bg: string }>
  tasks: Task[]
  activity: ActivityEvent[]
  conversations: Conversation[]
}

export function ProjectDetailView({ project, agents, statusConfig, tasks, activity, conversations }: Props) {
  const config = statusConfig[project.status] || statusConfig.active
  const owner = agents.find(a => a.id === project.owner_agent_id)
  
  const projectTasks = tasks.filter(t => t.project_id === project.id)
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
  
  const projectActivity = activity.filter(a => a.project_id === project.id)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link href="/projects" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 600 }}>PROJECTS</Link>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>/</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>{project.name.toUpperCase()}</span>
           </div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{project.name}</h1>
           <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>{project.description}</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
           <div style={{ 
              fontSize: '0.75rem', fontWeight: 800, padding: '6px 12px', borderRadius: '4px',
              background: config.bg, color: config.color, textTransform: 'uppercase', border: `1px solid ${config.color}40`
           }}>{config.label}</div>
           {owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                 <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{owner.emoji}</div>
                 <div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 800, margin: 0 }}>OWNER AGENT</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{owner.name}</p>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
         <div className="card" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', margin: 0 }}>TASK PROGRESS</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', margin: '1rem 0' }}>
               <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{progress}%</span>
               <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', paddingBottom: '0.5rem' }}>({completedTasks}/{projectTasks.length} Done)</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
               <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 1s ease-out' }} />
            </div>
         </div>

         <div className="card" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', margin: 0 }}>HEALTH SCORE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
               <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>98</div>
               <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Nominal</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)', margin: 0 }}>System performing optimally</p>
               </div>
            </div>
         </div>

         <div className="card" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', margin: 0 }}>TIME ELAPSED</p>
            <div style={{ margin: '1rem 0' }}>
               <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{formatDistanceToNow(new Date(project.created_at))}</p>
               <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Since project initialization</p>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
         
         {/* Task Context */}
         <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Project Tasks</h3>
               <Link href="/projects" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>MANAGE ALL</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {projectTasks.map(task => (
                  <div key={task.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{task.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
                           <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: task.priority === 'high' ? 'var(--warning)' : 'var(--text-tertiary)' }}>{task.priority.toUpperCase()}</span>
                           <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-strong)' }} />
                           <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{task.status.replace('-', ' ').toUpperCase()}</span>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {task.assignee_ids.map(id => agents.find(a => a.id === id)).filter(Boolean).map(a => (
                           <div key={a!.id} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', border: '1px solid var(--border-subtle)', marginLeft: '-8px' }}>
                              {a!.emoji}
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
               {projectTasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No tasks found for this mission.</p>}
            </div>
         </div>

         {/* Project Log */}
         <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, marginBottom: '1.5rem' }}>Intelligence Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '400px', overflowY: 'auto' }}>
               {projectActivity.slice(0, 10).map(event => (
                  <div key={event.id} style={{ display: 'flex', gap: '1rem' }}>
                     <div style={{ position: 'relative' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: '4px' }} />
                        <div style={{ position: 'absolute', top: 12, bottom: -12, left: 3.5, width: 1, background: 'var(--border-subtle)' }} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{event.message}</p>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</p>
                     </div>
                  </div>
               ))}
               {projectActivity.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Awaiting first intelligence drop...</p>}
            </div>
            <Link href="/timeline" style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 600 }}>VIEW FULL TIMELINE</Link>
         </div>

      </div>

    </div>
  )
}
