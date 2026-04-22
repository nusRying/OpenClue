'use client'

import { useState } from 'react'
import type { Conversation, Agent } from '@/types'
import { format } from 'date-fns'

interface Props {
  conversations: Conversation[]
  agents: Agent[]
  selectedSessionKey: string | null
  onSelectSession: (key: string) => void
}

export function ConversationsPanel({ conversations, agents, selectedSessionKey, onSelectSession }: Props) {
  const selectedConv = conversations.find(c => c.session_key === selectedSessionKey)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', height: 'calc(100vh - 12rem)' }}>
      {/* Sidebar: Sessions List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Active Sessions</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0 0' }}>{conversations.length} sessions</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              No active sessions
            </div>
          ) : (
            conversations.map(conv => {
              const agent = agents.find(a => a.id === conv.agent_id)
              const lastMessage = conv.messages[conv.messages.length - 1]
              const isActive = selectedSessionKey === conv.session_key

              return (
                <button
                  key={conv.session_key}
                  onClick={() => onSelectSession(conv.session_key)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  className="agent-compact-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: 6, background: 'var(--bg-base)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
                    }}>{agent?.emoji || '👤'}</div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                      {conv.client_name || 'Anonymous Client'}
                    </span>
                    <span className="badge" style={{ background: 'var(--bg-base)', color: 'var(--text-tertiary)', fontSize: '0.625rem' }}>
                      {conv.channel}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {lastMessage?.content || 'No messages yet'}
                  </p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                    {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>{selectedConv.client_name || 'Client'}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Session: <code style={{ color: 'var(--accent)' }}>{selectedConv.session_key}</code>
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>LIVE MONITORING</span>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedConv.messages.map((msg, idx) => {
                const isAgent = msg.role === 'agent'
                const isSystem = msg.role === 'system'

                if (isSystem) {
                  return (
                    <div key={idx} style={{ textAlign: 'center', margin: '1rem 0' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', background: 'var(--bg-base)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                        {msg.content}
                      </span>
                    </div>
                  )
                }

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAgent ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isAgent ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      borderBottomLeftRadius: !isAgent ? 0 : '1rem',
                      borderBottomRightRadius: isAgent ? 0 : '1rem',
                      background: isAgent ? 'var(--accent-solid)' : 'var(--bg-elevated)',
                      color: isAgent ? 'white' : 'var(--text-primary)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Footer / Input Placeholder */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0, textAlign: 'center' }}>
                Monitoring active. All messages are logged for quality control.
              </p>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <p style={{ fontSize: '0.875rem' }}>Select a session to view conversation history</p>
          </div>
        )}
      </div>
    </div>
  )
}
