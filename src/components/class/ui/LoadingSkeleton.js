export function SkeletonCard({ height = 80 }) {
  return (
    <div style={{
      background:   'linear-gradient(90deg, #EDE5D0 25%, #F5F0E8 50%, #EDE5D0 75%)',
      backgroundSize: '200% 100%',
      animation:    'shimmer 1.4s infinite',
      borderRadius: '16px',
      height,
    }} />
  )
}

export function SkeletonList({ count = 4, height = 72 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}