'use client'

import type { Agent, Project, Task, ActivityEvent } from '@/types'
import { AgentCard } from '@/components/agents/AgentCard'
import { Timeline } from '@/components/timeline/Timeline'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

interface Props {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
  activity: ActivityEvent[]
  selectedProjectId: string | null
  onBack: () => void
}

export function TimelineView({ tasks, projects, agents, activity, selectedProjectId, onBack }: Props) {
  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <Timeline
        tasks={tasks}
        projects={projects}
        agents={agents}
        onBack={onBack}
        selectedProjectId={selectedProjectId}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Compact agents */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Agents</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{onlineAgents} online</span>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 22rem)', overflowY: 'auto' }}>
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} compact />
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card" style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Recent Activity</span>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 22rem)', overflowY: 'auto' }}>
            <ActivityFeed events={activity.slice(0, 30)} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
