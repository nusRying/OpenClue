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
  online: { label: 'Online', color: 'bg-emerald-500' },
  idle: { label: 'Idle', color: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'bg-zinc-600' },
}

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  const status = getActivityStatus(agent.last_seen_at)
  const s = STATUS_CONFIG[status]

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-tertiary transition rounded-lg">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm text-primary">
            {agent.emoji}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${s.color} border-2 border-[var(--bg-secondary)]`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-primary truncate">{agent.name}</div>
          <div className="text-xs text-muted">{s.label}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 hover:shadow-lg transition-all">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-lg text-primary">
            {agent.emoji}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${s.color} border-2 border-[var(--card-bg)]`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">{agent.name}</span>
            <span className={`text-xs ${
              status === 'online' ? 'text-success' :
              status === 'idle' ? 'text-warning' : 'text-muted'
            }`}>{s.label}</span>
          </div>
          <div className="text-xs text-muted mt-0.5">{agent.role}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-subtle grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted">Last seen</span>
          <div className="text-primary mt-0.5">{formatLastSeen(agent.last_seen_at)}</div>
        </div>
        {agent.current_task && (
          <div>
            <span className="text-muted">Task</span>
            <div className="text-primary mt-0.5 truncate">{agent.current_task}</div>
          </div>
        )}
      </div>
    </div>
  )
}
