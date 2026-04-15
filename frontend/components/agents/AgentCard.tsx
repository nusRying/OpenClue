'use client'

import type { Agent } from '@/types'

const STATUS_COLORS = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
}

const STATUS_TEXT = {
  online: 'Online',
  idle: 'Idle',
  busy: 'Busy',
  offline: 'Offline',
}

function formatHeartbeat(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AgentCard({ agent }: { agent: Agent }) {
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
          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[agent.status]}`} />
          <span className="text-xs text-gray-600">{STATUS_TEXT[agent.status]}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 min-w-16">Bot:</span>
          <span className="font-mono text-xs">{agent.bot_username}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 min-w-16">Heartbeat:</span>
          <span className="text-xs">{formatHeartbeat(agent.last_heartbeat)}</span>
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
