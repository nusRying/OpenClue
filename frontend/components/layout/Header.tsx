'use client'

import type { Agent, Project, Task } from '@/types'
import { SunIcon } from '@/components/ui/SunIcon'
import { MoonIcon } from '@/components/ui/MoonIcon'

interface Props {
  agents: Agent[]
  projects: Project[]
  tasks: Task[]
  showTimeline: boolean
  onToggleTimeline: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Header({ agents, projects, tasks, showTimeline, onToggleTimeline, theme, onToggleTheme }: Props) {
  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length

  const activeProjects = projects.filter(p => p.status === 'active').length
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'color-mix(in srgb, var(--bg-base) 85%, transparent)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.5rem' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8125rem', color: 'white',
              flexShrink: 0,
            }}>MC</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Mission Control</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: 2 }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
                  <span style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    background: 'var(--status-online)',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                  <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-online)', boxShadow: '0 0 6px var(--status-online)' }} />
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--status-online)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Live</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {[
              { value: agents.length, label: 'Agents' },
              { value: activeProjects, label: 'Active', color: 'var(--success)' },
              { value: inProgressTasks, label: 'In progress', color: 'var(--info)' },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onToggleTimeline}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: '1px solid var(--border-default)',
                background: showTimeline ? 'var(--accent-solid)' : 'var(--bg-elevated)',
                color: showTimeline ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Timeline
            </button>
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
