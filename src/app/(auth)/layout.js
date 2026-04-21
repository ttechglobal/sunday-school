export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {children}
    </div>
  )
}