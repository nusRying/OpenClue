'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 'var(--radius-md)', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function AgentCardSkeleton() {
  return (
    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Skeleton width={40} height={40} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '0.75rem',
    }}>
      <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <Skeleton width={50} height={20} borderRadius="99px" />
        <Skeleton width={60} height={20} borderRadius="99px" />
      </div>
    </div>
  )
}
