export function SkeletonCard({ height = 80 }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: '16px' }}
    />
  )
}

export function SkeletonList({ count = 3, height = 80, gap = 10 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  )
}