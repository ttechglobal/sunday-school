export default function ClassLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {children}
    </div>
  )
}