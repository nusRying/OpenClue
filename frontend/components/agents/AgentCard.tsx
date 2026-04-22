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
  display: 'flex', alignItems: 'center', gap: '0.875rem',
  padding: '0.75rem 1rem',
  transition: 'background 0.15s',
  cursor: 'default',
  borderBottom: '1px solid var(--border-subtle)',
}

const cardStyle: React.CSSProperties = {
  padding: '1rem',
  transition: 'all 0.15s',
  background: 'var(--bg-surface)',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.875rem',
}

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  const status = getActivityStatus(agent.last_seen_at)
  const s = STATUS_CONFIG[status]
  
  const displayStatus = status === 'online' ? 'Working' : status === 'idle' ? 'Awaiting' : 'Offline'

  if (compact) {
    return (
      <div style={compactStyle} className="agent-compact-row">
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0
        }}>
          {agent.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.role} ({agent.name})
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.current_task || 'Awaiting task'}
          </p>
        </div>
        <span className="badge" style={{ 
          background: status === 'online' ? 'var(--success-muted)' : 'var(--bg-elevated)', 
          color: status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
          fontSize: '0.625rem', padding: '1px 8px', fontWeight: 600
        }}>
          {displayStatus}
        </span>
      </div>
    )
  }

  return (
    <div style={cardStyle} className="agent-card-row">
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem', flexShrink: 0
      }}>
        {agent.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {agent.role} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({agent.name})</span>
          </p>
          <span className="badge" style={{ 
            background: status === 'online' ? 'var(--success-muted)' : 'var(--bg-elevated)', 
            color: status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
            fontSize: '0.625rem', padding: '1px 8px', fontWeight: 600
          }}>
            {displayStatus}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.current_task || 'Awaiting task'}
        </p>
      </div>
    </div>
  )
}
