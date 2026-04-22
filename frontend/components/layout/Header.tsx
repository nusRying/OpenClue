'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Agent } from '@/types'
import { SunIcon } from '@/components/ui/SunIcon'
import { MoonIcon } from '@/components/ui/MoonIcon'

interface Props {
  agents: Agent[]
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Header({ agents, theme, onToggleTheme }: Props) {
  const pathname = usePathname()
  
  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Conversations', href: '/conversations' },
  ]

  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'color-mix(in srgb, var(--bg-base) 85%, transparent)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

          {/* Logo & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8125rem', color: 'white',
                flexShrink: 0,
              }}>MC</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mission Control</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-subtle)' }}>
                  <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
                    <span style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      background: 'var(--status-online)',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }} />
                    <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-online)', boxShadow: '0 0 6px var(--status-online)' }} />
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', marginLeft: '1rem' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '0.375rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    background: pathname === item.href ? 'var(--bg-overlay)' : 'transparent',
                    color: pathname === item.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <span className="badge" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{agents.length} AGENTS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Live • Just now
              </div>
            </div>

            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
