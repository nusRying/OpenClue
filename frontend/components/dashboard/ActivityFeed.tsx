'use client'

import { useState } from 'react'
import type { ActivityEvent } from '@/types'

const EVENT_CONFIG: Record<string, { color: string; icon: string; label?: string }> = {
  agent_status: { color: 'text-blue-400 bg-blue-500', icon: '●', label: 'Status' },
  task_created: { color: 'text-success bg-success', icon: '●', label: 'Created' },
  task_updated: { color: 'text-warning bg-warning', icon: '●', label: 'Updated' },
  task_assigned: { color: 'text-purple-400 bg-purple-500', icon: '●', label: 'Assigned' },
  project_updated: { color: 'text-cyan-400 bg-cyan-500', icon: '●', label: 'Project' },
  'message:received': { color: 'text-[var(--accent)] bg-[var(--accent)]', icon: '↓', label: 'Received' },
  'message:sent': { color: 'text-violet-400 bg-violet-500', icon: '↑', label: 'Sent' },
  'message:preprocessed': { color: 'text-teal-400 bg-teal-500', icon: '→', label: 'Preprocessed' },
  tool_start: { color: 'text-muted bg-[var(--bg-elevated)]', icon: '▶', label: 'Tool' },
  tool_end: { color: 'text-orange-400 bg-orange-500', icon: '■', label: 'Tool' },
  session_event: { color: 'text-muted bg-[var(--bg-elevated)]', icon: '●', label: 'Event' },
  session_error: { color: 'text-error bg-error', icon: '!' },
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

function getMessage(event: ActivityEvent): { primary: string; secondary?: string } {
  const msg = event.message || ''

  if (msg.startsWith('Session event from ')) {
    const meta = event.metadata as Record<string, any> | null
    const content = meta?.content || meta?.bodyForAgent || meta?.error
    if (content) return { primary: String(content), secondary: 'Session event' }
    return { primary: 'Session event', secondary: msg.replace('Session event from ', '') }
  }

  if (msg.startsWith('Session error:')) return { primary: msg, secondary: 'Session error' }
  if (msg.startsWith('❌')) return { primary: msg, secondary: 'Tool failed' }

  if (msg.length > 120) {
    return { primary: msg.slice(0, 120) + '…', secondary: msg.slice(120) }
  }

  return { primary: msg, secondary: undefined }
}

function EventRow({ event, compact }: { event: ActivityEvent; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.session_event
  const { primary, secondary } = getMessage(event)
  const hasSecondary = !!secondary

  const content = (
    <div className="flex items-start gap-2.5">
      {/* Status icon */}
      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${config.color} bg-opacity-20`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-snug text-primary ${hasSecondary && !expanded ? 'cursor-pointer hover:text-primary' : ''}`}
          onClick={() => hasSecondary && !expanded && setExpanded(true)}
          title={hasSecondary ? 'Click to expand' : undefined}
        >
          {expanded && secondary ? (
            <span>
              <span className="text-primary">{primary}</span>
              <span className="block text-muted mt-0.5">{secondary}</span>
            </span>
          ) : (
            <span className={!primary || primary === 'Session event' ? 'text-muted italic' : 'text-secondary'}>
              {primary || 'Empty event'}
            </span>
          )}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          {config.label && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.color} bg-opacity-20`}>
              {config.label}
            </span>
          )}
          <span className="text-[10px] text-muted">{formatTime(event.created_at)}</span>
        </div>
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="px-3 py-2.5 hover:bg-tertiary transition">
        {content}
      </div>
    )
  }

  return (
    <div className="px-4 py-3 hover:bg-tertiary transition">
      {content}
    </div>
  )
}

export function ActivityFeed({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-10 text-muted text-xs">
        <div className="text-2xl mb-2 opacity-30">◎</div>
        No activity yet
      </div>
    )
  }

  return (
    <div className={compact ? '' : 'divide-y divide-[var(--border-subtle)]'}>
      {events.map(event => (
        <EventRow key={event.id} event={event} compact={compact} />
      ))}
    </div>
  )
}
