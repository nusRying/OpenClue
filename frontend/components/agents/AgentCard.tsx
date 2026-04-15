'use client'

import type { Agent } from '@/types'

function getActivityStatus(lastSeenAt: string | null): 'online' | 'idle' | 'offline' {
  if (!lastSeenAt) return 'offline'
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  const mins = diff / 60000
  if (mins <= 5) return 'online'
  if (mins <= 30) return 'idle'
  return 'offline'
}

function formatLastSeen(ts: string | null): string {
  if (!ts) return 'never'
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

const STATUS_CONFIG = {
  online: { label: 'Online', color: 'var(--status-online)' },
  idle: { label: 'Idle', color: 'var(--status-idle)' },
  offline: { label: 'Offline', color: 'var(--status-offline)' },
}

const compactStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.5rem 0.75rem',
  transition: 'background 0.15s',
  cursor: 'default',
}

const cardStyle: React.CSSProperties = {
  padding: '1rem',
  transition: 'box-shadow 0.15s, border-color 0.15s',
  border: '1px solid var(--card-border)',
}

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  const status = getActivityStatus(agent.last_seen_at)
  const s = STATUS_CONFIG[status]

  if (compact) {
    return (
      <div style={compactStyle} className="agent-compact-row">
        <style>{`.agent-compact-row:hover { background: var(--bg-elevated); }`}</style>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-overlay)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
          }}>
            {agent.emoji}
          </div>
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: s.color,
            border: '2px solid var(--bg-surface)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.name}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>{s.label}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle} className="agent-card-row">
      <style>{`.agent-card-row:hover { box-shadow: var(--card-shadow); }`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bg-overlay)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem',
            color: 'var(--text-primary)',
          }}>
            {agent.emoji}
          </div>
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 12, height: 12, borderRadius: '50%',
            background: s.color,
            border: '2px solid var(--card-bg)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{agent.name}</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: s.color }}>{s.label}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>{agent.role}</p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
        marginTop: '0.75rem', paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0 0 2px' }}>Last seen</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>{formatLastSeen(agent.last_seen_at)}</p>
        </div>
        {agent.current_task && (
          <div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0 0 2px' }}>Task</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.current_task}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
