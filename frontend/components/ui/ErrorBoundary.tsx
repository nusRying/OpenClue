'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1rem',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <p style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>
            Something went wrong
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0, maxWidth: 360 }}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
