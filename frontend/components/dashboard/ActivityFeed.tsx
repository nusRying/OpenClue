'use client'

import type { ActivityEvent } from '@/types'

const EVENT_ICONS: Record<string, string> = {
  agent_status: '👤',
  task_created: '📋',
  task_updated: '📝',
  task_assigned: '👉',
  project_updated: '📁',
  tool_start: '⚡',
  tool_end: '🔧',
  session_event: '💬',
}

function formatTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  events: ActivityEvent[]
  compact?: boolean
}

export function ActivityFeed({ events, compact = false }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className={`${compact ? 'p-4' : 'rounded-lg border p-6'} text-center text-gray-500 text-sm`}>
        No activity yet
      </div>
    )
  }

  if (compact) {
    return (
      <div className="divide-y">
        {events.map(event => (
          <div key={event.id} className="px-4 py-2 flex items-start gap-2 text-xs hover:bg-gray-50">
            <span className="shrink-0">{EVENT_ICONS[event.event_type] ?? '📌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 leading-snug line-clamp-2">{event.message}</p>
              <span className="text-gray-400">{formatTime(event.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y">
      {events.map(event => (
        <div key={event.id} className="p-3 flex items-start gap-3 text-sm hover:bg-gray-50">
          <span className="text-lg shrink-0">{EVENT_ICONS[event.event_type] ?? '📌'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-sm leading-snug">{event.message}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {event.agent_id && (
                <span className="text-xs text-gray-500">Agent: {event.agent_id}</span>
              )}
              <span className="text-xs text-gray-400">{formatTime(event.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
