'use client'

import type { ActivityEvent } from '@/types'

const EVENT_COLORS: Record<string, string> = {
  agent_status: 'text-blue-400',
  task_created: 'text-emerald-400',
  task_updated: 'text-amber-400',
  task_assigned: 'text-purple-400',
  project_updated: 'text-cyan-400',
  tool_start: 'text-zinc-400',
  tool_end: 'text-orange-400',
  session_event: 'text-zinc-500',
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

export function ActivityFeed({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600 text-sm">
        No activity yet
      </div>
    )
  }

  if (compact) {
    return (
      <div className="divide-y divide-zinc-800">
        {events.map(event => (
          <div key={event.id} className="px-3 py-2.5 hover:bg-zinc-800/30 transition">
            <div className="flex items-start gap-2">
              <div className={`text-xs mt-0.5 ${EVENT_COLORS[event.event_type] || 'text-zinc-400'}`}>
                ●
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                  {event.message || <span className="text-zinc-600 italic">Empty event</span>}
                </p>
                <span className="text-[10px] text-zinc-600 mt-0.5">{formatTime(event.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800">
      {events.map(event => (
        <div key={event.id} className="px-4 py-3 hover:bg-zinc-800/30 transition">
          <div className="flex items-start gap-3">
            <div className={`mt-1 ${EVENT_COLORS[event.event_type] || 'text-zinc-400'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 leading-snug">
                {event.message || <span className="text-zinc-600 italic">Empty event</span>}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-600">{event.event_type.replace('_', ' ')}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-600">{formatTime(event.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
