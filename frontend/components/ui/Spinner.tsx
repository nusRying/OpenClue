'use client'

export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: size, height: size,
        border: '2px solid var(--accent)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        margin: '0 auto 12px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
