'use client'

import { useState } from 'react'
import type { ActivityEvent } from '@/types'

const EVENT_CONFIG: Record<string, { color: string; icon: string; label?: string }> = {
  agent_status: { color: 'text-blue-400 bg-blue-500', icon: '●', label: 'Status' },
  task_created: { color: 'text-emerald-400 bg-emerald-500', icon: '●', label: 'Created' },
  task_updated: { color: 'text-amber-400 bg-amber-500', icon: '●', label: 'Updated' },
  task_assigned: { color: 'text-purple-400 bg-purple-500', icon: '●', label: 'Assigned' },
  project_updated: { color: 'text-cyan-400 bg-cyan-500', icon: '●', label: 'Project' },
  'message:received': { color: 'text-indigo-400 bg-indigo-500', icon: '↓', label: 'Received' },
  'message:sent': { color: 'text-violet-400 bg-violet-500', icon: '↑', label: 'Sent' },
  'message:preprocessed': { color: 'text-teal-400 bg-teal-500', icon: '→', label: 'Preprocessed' },
  tool_start: { color: 'text-zinc-400 bg-zinc-500', icon: '▶', label: 'Tool' },
  tool_end: { color: 'text-orange-400 bg-orange-500', icon: '■', label: 'Tool' },
  session_event: { color: 'text-zinc-500 bg-zinc-600', icon: '●', label: 'Event' },
  session_error: { color: 'text-red-400 bg-red-500', icon: '!' },
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

  // If it's the generic fallback, try to show something useful
  if (msg.startsWith('Session event from ')) {
    const meta = event.metadata as Record<string, any> | null
    const content = meta?.content || meta?.bodyForAgent || meta?.error
    if (content) return { primary: String(content), secondary: 'Session event' }
    return { primary: 'Session event', secondary: msg.replace('Session event from ', '') }
  }

  // Session error — extract error message
  if (msg.startsWith('Session error:')) {
    return { primary: msg, secondary: 'Session error' }
  }

  // Tool failures
  if (msg.startsWith('❌')) {
    return { primary: msg, secondary: 'Tool failed' }
  }

  // Regular messages — truncate if long
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
      {/* Status dot */}
      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center text-[8px] font-bold ${config.color.split(' ')[0]}`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        {/* Message */}
        <p
          className={`text-xs leading-snug text-zinc-300 ${hasSecondary && !expanded ? 'cursor-pointer hover:text-zinc-100' : ''}`}
          onClick={() => hasSecondary && !expanded && setExpanded(true)}
          title={hasSecondary ? 'Click to expand' : undefined}
        >
          {expanded && secondary ? (
            <span>
              <span className="text-zinc-100">{primary}</span>
              <span className="block text-zinc-500 mt-0.5">{secondary}</span>
            </span>
          ) : (
            <span className={!primary || primary === 'Session event' ? 'text-zinc-600 italic' : 'text-zinc-300'}>
              {primary || 'Empty event'}
            </span>
          )}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          {config.label && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.color} bg-opacity-20 ${config.color.split(' ')[0]}`}>
              {config.label}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">{formatTime(event.created_at)}</span>
        </div>
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="px-3 py-2.5 hover:bg-zinc-800/30 transition">
        {content}
      </div>
    )
  }

  return (
    <div className="px-4 py-3 hover:bg-zinc-800/30 transition">
      {content}
    </div>
  )
}

export function ActivityFeed({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-600 text-xs">
        <div className="text-2xl mb-2 opacity-30">◎</div>
        No activity yet
      </div>
    )
  }

  return (
    <div className={compact ? '' : 'divide-y divide-zinc-800'}>
      {events.map(event => (
        <EventRow key={event.id} event={event} compact={compact} />
      ))}
    </div>
  )
}
