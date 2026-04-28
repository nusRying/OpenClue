'use client'

import { useState } from 'react'
import type { ActivityEvent } from '@/types'
import { RichText } from '@/components/ui/RichText'
import { cleanMessageContent } from '@/lib/messageUtils'

const EVENT_CONFIG: Record<string, { color: string; bgColor: string; icon: string; label?: string }> = {
  agent_status: { color: 'var(--info)', bgColor: 'var(--info-muted)', icon: '●', label: 'Status' },
  task_created: { color: 'var(--success)', bgColor: 'var(--success-muted)', icon: '+', label: 'Created' },
  task_updated: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: '↺', label: 'Updated' },
  task_assigned: { color: 'var(--accent-purple)', bgColor: 'var(--accent-purple-muted)', icon: '→', label: 'Assigned' },
  project_updated: { color: 'var(--accent-teal)', bgColor: 'var(--accent-teal-muted)', icon: '◆', label: 'Project' },
  'message:received': { color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: '↓', label: 'In' },
  'message:sent': { color: 'var(--accent-purple)', bgColor: 'var(--accent-purple-muted)', icon: '↑', label: 'Out' },
  'message:preprocessed': { color: 'var(--accent-teal)', bgColor: 'var(--accent-teal-muted)', icon: '→', label: 'Preprocess' },
  tool_start: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-elevated)', icon: '▶', label: 'Tool' },
  tool_end: { color: 'var(--accent-orange)', bgColor: 'var(--accent-orange-muted)', icon: '■', label: 'Tool' },
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
  const rawMsg = event.message || ''
  
  if (rawMsg.startsWith('Session event from ')) {
    const meta = event.metadata as Record<string, any> | null
    const content = meta?.content || meta?.bodyForAgent || meta?.error
    if (content) return { primary: cleanMessageContent(String(content)), secondary: 'Session event' }
    return { primary: 'Session event', secondary: cleanMessageContent(rawMsg.replace('Session event from ', '')) }
  }

  if (rawMsg.startsWith('Session error:')) return { primary: cleanMessageContent(rawMsg), secondary: 'Session error' }
  if (rawMsg.startsWith('❌')) return { primary: cleanMessageContent(rawMsg), secondary: 'Tool failed' }

  return { primary: cleanMessageContent(rawMsg), secondary: undefined }
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
      onClick={() => (hasSecondary || primary.length > 80) && setExpanded(!expanded)}
    >
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
          <div style={{
            fontSize: '0.8125rem', lineHeight: 1.5, margin: 0,
            color: !primary || primary === 'Session event'
              ? 'var(--text-tertiary)'
              : 'var(--text-secondary)',
            fontStyle: !primary || primary === 'Session event' ? 'italic' : 'normal',
            cursor: hasSecondary || primary.length > 80 ? 'pointer' : 'default',
          }}>
            {expanded ? (
              <RichText text={primary} style={{ fontSize: '0.8125rem' }} />
            ) : (
              primary.length > 80 ? `${primary.slice(0, 80)}…` : primary
            )}
            {expanded && secondary && (
              <span style={{ display: 'block', color: 'var(--text-tertiary)', marginTop: 4, fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 4 }}>{secondary}</span>
            )}
          </div>

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
