'use client'

import { useState } from 'react'
import type { ActivityEvent } from '@/types'

const EVENT_CONFIG: Record<string, { color: string; bgColor: string; icon: string; label?: string }> = {
  agent_status: { color: '#60a5fa', bgColor: 'var(--info-muted)', icon: '●', label: 'Status' },
  task_created: { color: 'var(--success)', bgColor: 'var(--success-muted)', icon: '+', label: 'Created' },
  task_updated: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: '↺', label: 'Updated' },
  task_assigned: { color: '#c084fc', bgColor: 'rgba(192,132,252,0.15)', icon: '→', label: 'Assigned' },
  project_updated: { color: '#22d3ee', bgColor: 'rgba(34,211,238,0.15)', icon: '◆', label: 'Project' },
  'message:received': { color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: '↓', label: 'In' },
  'message:sent': { color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)', icon: '↑', label: 'Out' },
  'message:preprocessed': { color: '#2dd4bf', bgColor: 'rgba(45,212,191,0.15)', icon: '→', label: 'Preprocess' },
  tool_start: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-elevated)', icon: '▶', label: 'Tool' },
  tool_end: { color: '#fb923c', bgColor: 'rgba(251,146,60,0.15)', icon: '■', label: 'Tool' },
  session_event: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-elevated)', icon: '●', label: 'Event' },
  session_error: { color: 'var(--error)', bgColor: 'var(--error-muted)', icon: '!', label: 'Error' },
}

function formatTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function getDisplayMessage(event: ActivityEvent): { primary: string; secondary?: string } {
  const msg = event.message || ''

  if (msg.startsWith('Session event from ')) {
    const meta = event.metadata as Record<string, any> | null
    const content = meta?.content || meta?.bodyForAgent || meta?.error
    if (content) return { primary: String(content), secondary: 'Session event' }
    return { primary: 'Session event', secondary: msg.replace('Session event from ', '') }
  }

  if (msg.startsWith('Session error:')) return { primary: msg, secondary: 'Session error' }
  if (msg.startsWith('❌')) return { primary: msg, secondary: 'Tool failed' }

  const MAX = 100
  if (msg.length > MAX) return { primary: msg.slice(0, MAX) + '…', secondary: msg.slice(MAX) }

  return { primary: msg, secondary: undefined }
}

function EventRow({ event, compact }: { event: ActivityEvent; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.session_event
  const { primary, secondary } = getDisplayMessage(event)
  const hasSecondary = !!secondary && secondary.length > 0

  const rowStyle: React.CSSProperties = compact
    ? { padding: '0.625rem 0.75rem', transition: 'background 0.15s' }
    : { padding: '0.75rem 1rem', transition: 'background 0.15s' }

  return (
    <div
      style={rowStyle}
      className="activity-row"
      onClick={hasSecondary && !expanded ? () => setExpanded(true) : undefined}
    >
      <style>{`.activity-row:hover { background: var(--bg-elevated); }`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
        {/* Icon */}
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: config.bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', fontWeight: 700,
          color: config.color,
          flexShrink: 0, marginTop: 2,
        }}>
          {config.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.8125rem', lineHeight: 1.5, margin: 0,
            color: !primary || primary === 'Session event'
              ? 'var(--text-tertiary)'
              : 'var(--text-secondary)',
            fontStyle: !primary || primary === 'Session event' ? 'italic' : 'normal',
            cursor: hasSecondary && !expanded ? 'pointer' : 'default',
          }}>
            {primary || 'Empty event'}
            {expanded && secondary && (
              <span style={{ display: 'block', color: 'var(--text-tertiary)', marginTop: 2 }}>{secondary}</span>
            )}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
            {config.label && (
              <span style={{
                fontSize: '0.625rem', fontWeight: 500,
                color: config.color, background: config.bgColor,
                padding: '1px 6px', borderRadius: '99px',
              }}>
                {config.label}
              </span>
            )}
            <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>
              {formatTime(event.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>◎</div>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>No activity yet</p>
      </div>
    )
  }

  return (
    <div style={{ overflowY: 'auto' }}>
      {events.map(event => (
        <EventRow key={event.id} event={event} compact={compact} />
      ))}
    </div>
  )
}
