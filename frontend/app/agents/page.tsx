'use client'

import {
  useAgents,
  useRealtimeAgents,
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/components/providers/ThemeProvider'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function AgentsPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { theme, toggleTheme } = useTheme()

  // Enable realtime status updates
  useRealtimeAgents()

  const agents = agentsData?.agents ?? []

  if (agentsLoading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <Header
          agents={agents}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
          
          <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Link href="/" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 600 }}>DASHBOARD</Link>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>/</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>ROSTER</span>
               </div>
               <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Agent Roster</h1>
               <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The designated elite agents of OpenClue Mission Control.</p>
            </div>
            <div className="badge" style={{ padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>
               {agents.length} AGENTS DEPLOYED
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {agents.map(agent => (
              <div key={agent.id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                
                {/* Status Indicator */}
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                   <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      padding: '4px 10px', borderRadius: '20px',
                      background: agent.status === 'online' ? 'var(--success-muted)' : (agent.status === 'busy' ? 'var(--warning-muted)' : 'var(--bg-elevated)'),
                      color: agent.status === 'online' ? 'var(--success)' : (agent.status === 'busy' ? 'var(--warning)' : 'var(--text-tertiary)'),
                      fontSize: '0.6875rem', fontWeight: 800, border: '1px solid currentColor'
                   }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {agent.status.toUpperCase()}
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                   <div style={{ 
                      width: 80, height: 80, borderRadius: 20, background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                      border: '1px solid var(--border-subtle)', flexShrink: 0,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                   }}>{agent.emoji}</div>
                   
                   <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{agent.name}</h2>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', margin: '0.25rem 0' }}>{agent.role.toUpperCase()}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.5rem 0 0' }}>@{agent.bot_username}</p>
                   </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                   <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-tertiary)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>CURRENT ASSIGNMENT</p>
                   <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                      {agent.current_task || 'Awaiting task allocation...'}
                   </p>
                </div>

                <div>
                   <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-tertiary)', margin: '0 0 0.75rem 0', letterSpacing: '0.05em' }}>SPECIALIZED SKILLS</p>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {agent.skills?.map(skill => (
                        <span key={skill} style={{ 
                           padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                           fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500
                        }}>{skill}</span>
                      ))}
                      {!agent.skills?.length && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Generalist intelligence</span>}
                   </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>LAST SEEN</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                         {agent.last_seen_at ? formatDistanceToNow(new Date(agent.last_seen_at), { addSuffix: true }) : 'Never'}
                      </span>
                   </div>
                   <button style={{ 
                      padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-solid)',
                      color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                   }}>
                      MANAGE
                   </button>
                </div>

              </div>
            ))}
          </div>

        </main>
      </div>
    </ErrorBoundary>
  )
}
