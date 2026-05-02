'use client'

import { useState, useEffect, useRef } from 'react'
import type { Conversation, Agent } from '@/types'
import { format, isValid } from 'date-fns'
import { RichText } from '@/components/ui/RichText'
import { cleanMessageContent } from '@/lib/messageUtils'

interface Props {
  conversations: Conversation[]
  agents: Agent[]
  selectedSessionKey: string | null
  onSelectSession: (key: string) => void
}



function formatDateTime(value: string | undefined, pattern: string, fallback = '--:--'): string {
  if (!value) return fallback

  const parsed = new Date(value)
  if (!isValid(parsed)) return fallback

  return format(parsed, pattern)
}

export function ConversationsPanel({ conversations, agents, selectedSessionKey, onSelectSession }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'telegram' | 'whatsapp'>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConv = conversations.find(c => c.session_key === selectedSessionKey)

  // Auto-scroll to bottom on new messages or session change
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      const scroll = () => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
      scroll()
      // Small delay to ensure DOM is fully rendered (especially with RichText)
      const timeoutId = setTimeout(scroll, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedConv?.messages?.length, selectedSessionKey])
  
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.session_key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = selectedChannel === 'all' || c.channel.toLowerCase() === selectedChannel
    return matchesSearch && matchesChannel
  })

  const counts = {
    all: conversations.length,
    telegram: conversations.filter(c => c.channel.toLowerCase() === 'telegram').length,
    whatsapp: conversations.filter(c => c.channel.toLowerCase() === 'whatsapp').length
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '350px 1fr', 
      gap: '1px', 
      height: 'calc(100vh - 10rem)', 
      background: 'var(--border-subtle)', 
      borderRadius: 'var(--radius-xl)', 
      overflow: 'hidden', 
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    }}>
      <style jsx global>{`
        .chat-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll-container::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 10px;
        }
        .chat-scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }
      `}</style>
      
      {/* Sidebar: Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Terminal</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 1rem 0' }}>All encrypted session streams</p>
          
          <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            {(['all', 'telegram', 'whatsapp'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                style={{
                  flex: 1, padding: '0.5rem', fontSize: '0.625rem', fontWeight: 800,
                  borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                  background: selectedChannel === ch ? 'var(--bg-surface)' : 'transparent',
                  color: selectedChannel === ch ? 'var(--accent)' : 'var(--text-tertiary)',
                  boxShadow: selectedChannel === ch ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem'
                }}
              >
                {ch}
                <span style={{ 
                  opacity: 0.5, fontSize: '0.5625rem', 
                  background: selectedChannel === ch ? 'var(--accent-muted)' : 'var(--bg-base)',
                  padding: '2px 6px', borderRadius: '4px'
                }}>
                  {counts[ch]}
                </span>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Filter code streams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', borderRadius: 'var(--radius-md)', 
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                fontSize: '0.8125rem'
              }}
            />
            <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '0.875rem' }}>No matching streams.</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const agent = agents.find(a => a.id === conv.agent_id)
              const lastMessage = conv.messages[conv.messages.length - 1]
              const isActive = selectedSessionKey === conv.session_key

              return (
                <button
                  key={conv.session_key}
                  onClick={() => onSelectSession(conv.session_key)}
                  style={{
                    width: '100%', padding: '1.25rem', textAlign: 'left',
                    background: isActive ? 'var(--accent-muted)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent)' }} />}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>{agent?.emoji || '👤'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.client_name || 'Client'}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                        {conv.channel.toUpperCase()} {conv.client_id ? `• ${conv.client_id}` : ''}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      {formatDateTime(conv.updated_at, 'HH:mm')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                    {lastMessage ? cleanMessageContent(lastMessage.content) : 'Initializing stream...'}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative', height: '100%', overflow: 'hidden', minHeight: 0 }}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                  {agents.find(a => a.id === selectedConv.agent_id)?.emoji || '👤'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{selectedConv.client_name || 'Client'}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                      SENDER: {selectedConv.client_id || 'UNKNOWN'} | SESSION: {selectedConv.session_key.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>EXPORT LOGS</button>
                <span className="badge" style={{ background: 'var(--success-muted)', color: 'var(--success)', border: '1px solid var(--success-muted)' }}>LIVE FEED</span>
              </div>
            </div>
            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="chat-scroll-container"
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '2rem 2rem 0 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                background: 'var(--bg-base)', 
                minHeight: 0,
                scrollBehavior: 'smooth'
              }}
            >
              {selectedConv.messages.map((msg, idx) => {
                const isAgent = msg.role === 'agent'
                const isSystem = msg.role === 'system'
                const cleanedContent = cleanMessageContent(msg.content)

                if (isSystem) {
                  return (
                    <div key={idx} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {cleanedContent}
                      </span>
                    </div>
                  )
                }

                return (
                  <div key={idx} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isAgent ? 'flex-end' : 'flex-start',
                    maxWidth: '75%', alignSelf: isAgent ? 'flex-end' : 'flex-start'
                  }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexDirection: isAgent ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{isAgent ? 'MISSION AGENT' : 'EXTERNAL CLIENT'}</span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', opacity: 0.6 }}>{formatDateTime(msg.timestamp, 'HH:mm:ss')}</span>
                     </div>
                     {cleanedContent && (
                  <div 
                    style={{ 
                      maxWidth: '85%',
                      alignSelf: isAgent ? 'flex-end' : 'flex-start',
                      padding: '1.25rem 1.5rem',
                      borderRadius: isAgent ? '1.5rem 1.5rem 0.25rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.25rem',
                      background: isAgent ? 'var(--accent-solid)' : 'var(--bg-surface)',
                      color: isAgent ? 'white' : 'var(--text-primary)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      position: 'relative',
                      border: isAgent ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <RichText text={cleanedContent} isAgent={isAgent} />
                    
                    <div style={{ 
                      fontSize: '0.7rem', 
                      opacity: 0.6, 
                      marginTop: '0.5rem',
                      textAlign: isAgent ? 'right' : 'left',
                      fontWeight: 500
                    }}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </div>
                  </div>
                )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} style={{ height: '100px', flexShrink: 0 }} />
            </div>

            {/* Footer / Status Area */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--info)', animation: 'pulse 2s infinite' }} />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', margin: 0 }}>WAITING FOR AGENT RESPONSE STREAM...</p>
               </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid var(--border-subtle)' }}>📡</div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Secure Feed Empty</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Select an active session to intercept the communication stream.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
