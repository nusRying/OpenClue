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

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  const status = getActivityStatus(agent.last_seen_at)

  const statusConfig = {
    online: { label: 'Online', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    idle: { label: 'Idle', color: 'bg-amber-500', textColor: 'text-amber-400' },
    offline: { label: 'Offline', color: 'bg-zinc-600', textColor: 'text-zinc-500' },
  }
  const s = statusConfig[status]

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/50 transition rounded-lg">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
            {agent.emoji}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${s.color} border-2 border-zinc-900`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-100 truncate">{agent.name}</div>
          <div className="text-xs text-zinc-500">{s.label}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-zinc-900/50">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-lg">
            {agent.emoji}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${s.color} border-2 border-zinc-900`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100">{agent.name}</span>
            <span className={`text-xs ${s.textColor}`}>{s.label}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{agent.role}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-zinc-600">Last seen</span>
          <div className="text-zinc-300 mt-0.5">{formatLastSeen(agent.last_seen_at)}</div>
        </div>
        {agent.current_task && (
          <div>
            <span className="text-zinc-600">Task</span>
            <div className="text-zinc-300 mt-0.5 truncate">{agent.current_task}</div>
          </div>
        )}
      </div>
    </div>
  )
}
