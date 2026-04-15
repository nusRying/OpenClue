'use client'

import type { Agent } from '@/types'

const STATUS_COLORS = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-400',
}

const STATUS_LABELS = {
  green: 'Online',
  yellow: 'Idle',
  gray: 'Offline',
}

function getActivityStatus(lastSeenAt: string | null): 'green' | 'yellow' | 'gray' {
  if (!lastSeenAt) return 'gray'
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  const mins = diff / 60000
  if (mins <= 5) return 'green'
  if (mins <= 30) return 'yellow'
  return 'gray'
}

function formatLastSeen(ts: string | null): string {
  if (!ts) return 'never'
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AgentCard({ agent }: { agent: Agent }) {
  const activityStatus = getActivityStatus(agent.last_seen_at)

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <div className="font-semibold">{agent.name}</div>
            <div className="text-sm text-gray-500">{agent.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[activityStatus]}`} />
          <span className="text-xs text-gray-600">{STATUS_LABELS[activityStatus]}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 min-w-16">Bot:</span>
          <span className="font-mono text-xs">{agent.bot_username}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 min-w-16">Last seen:</span>
          <span className="text-xs">{formatLastSeen(agent.last_seen_at)}</span>
        </div>
        {agent.current_task && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16 shrink-0">Task:</span>
            <span className="text-xs truncate">{agent.current_task}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 min-w-16">Skills:</span>
          <span className="text-xs">{agent.skills?.length ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
