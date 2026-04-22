'use client'

import { useState } from 'react'
import type { Task, Project, Agent } from '@/types'

interface TimelineProps {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
  onBack?: () => void
  selectedProjectId?: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--priority-low)',
  'in-progress': 'var(--info)',
  completed: 'var(--success)',
  blocked: 'var(--error)',
}

export function Timeline({ tasks, projects, agents, onBack, selectedProjectId }: TimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const visibleTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  // Calendar logic
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const days = []
  // Previous month fill
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, month: month - 1, current: false })
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, current: true })
  }
  // Next month fill
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: month + 1, current: false })
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Mission Timeline</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>Calendar view of all scheduled operations</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button onClick={handlePrevMonth} className="btn-icon" style={{ padding: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, padding: '0 0.5rem', minWidth: '100px', textAlign: 'center' }}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
              </span>
              <button onClick={handleNextMonth} className="btn-icon" style={{ padding: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m9 18 6-6-6-6"/></svg>
              </button>
           </div>
           {onBack && <button onClick={onBack} className="btn btn-secondary">Exit Timeline</button>}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)', textAlign: 'center', letterSpacing: '0.1em' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, index) => {
            const dateStr = new Date(year, d.month, d.day).toISOString().split('T')[0]
            const dayTasks = visibleTasks.filter(t => t.due_date?.split('T')[0] === dateStr)
            const isToday = new Date().toISOString().split('T')[0] === dateStr

              return (
                <div 
                  key={index} 
                  style={{ 
                    minHeight: '140px', 
                    padding: '0.75rem', 
                    borderRight: (index + 1) % 7 === 0 ? 'none' : '1px solid var(--border-subtle)',
                    borderBottom: index >= 35 ? 'none' : '1px solid var(--border-subtle)',
                    background: d.current ? 'transparent' : 'var(--bg-base)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="timeline-day"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isToday ? 800 : 600, 
                      color: isToday ? 'white' : d.current ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                      boxShadow: isToday ? '0 0 15px var(--accent-bloom)' : 'none'
                    }}>
                      {d.day}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Group tasks by project */}
                    {Array.from(new Set(dayTasks.map(t => t.project_id))).map(projId => {
                      const project = projects.find(p => p.id === projId)
                      const projectTasks = dayTasks.filter(t => t.project_id === projId)
                      
                      return (
                        <div key={projId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ 
                            fontSize: '0.625rem', 
                            fontWeight: 800, 
                            color: 'var(--text-tertiary)', 
                            letterSpacing: '0.05em', 
                            textTransform: 'uppercase',
                            paddingLeft: '4px',
                            marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
                            {project?.name || 'Internal'}
                          </div>
                          
                          {projectTasks.map(task => {
                            const isCompleted = task.status === 'completed'
                            const isBlocked = task.status === 'blocked'
                            const color = STATUS_COLORS[task.status] || 'var(--text-tertiary)'
                            
                            return (
                              <div 
                                key={task.id}
                                style={{ 
                                  fontSize: '0.75rem', 
                                  padding: '6px 10px', 
                                  borderRadius: '6px', 
                                  background: isCompleted ? 'var(--success-muted)' : isBlocked ? 'var(--error-muted)' : 'var(--bg-elevated)', 
                                  color: isCompleted ? 'var(--success)' : isBlocked ? 'var(--error)' : 'var(--text-primary)',
                                  borderLeft: `3px solid ${color}`,
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  boxShadow: isCompleted ? '0 2px 8px var(--success-bloom)' : isBlocked ? '0 0 10px var(--error-bloom)' : '0 2px 4px rgba(0,0,0,0.05)',
                                  opacity: isCompleted ? 0.8 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  animation: isBlocked ? 'pulse-error 2s infinite' : 'none'
                                }}
                                title={`${task.title} (${task.status})`}
                              >
                                {isCompleted && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                                {isBlocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                                <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>{task.title}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{status}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
