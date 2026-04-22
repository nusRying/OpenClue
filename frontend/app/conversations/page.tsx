'use client'

import { useState } from 'react'
import {
  useAgents, useConversations,
  useRealtimeAgents, useRealtimeConversations
} from '@/hooks'
import { Header } from '@/components/layout/Header'
import { ConversationsPanel } from '@/components/conversations/ConversationsPanel'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function ConversationsPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: convData, isLoading: convLoading } = useConversations()

  const [selectedSessionKey, setSelectedSessionKey] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  // Enable realtime subscriptions
  useRealtimeAgents()
  useRealtimeConversations()

  const agents = agentsData?.agents ?? []
  const conversations = convData?.conversations ?? []

  const isLoading = agentsLoading || convLoading

  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Header
          agents={agents}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Agent Conversations</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Monitor live sessions between clients and agents</p>
          </div>

          <ConversationsPanel
            conversations={conversations}
            agents={agents}
            selectedSessionKey={selectedSessionKey}
            onSelectSession={setSelectedSessionKey}
          />
        </main>
      </div>
    </ErrorBoundary>
  )
}
