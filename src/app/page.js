export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sunday School</h1>
      <p style={{ marginTop: '12px', color: 'var(--mist)' }}>
        Design system is working ✓
      </p>
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-gold">Gold</button>
        <button className="btn btn-danger">Danger</button>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="badge badge-green">SUBMITTED</span>
        <span className="badge badge-amber">PENDING</span>
        <span className="badge badge-red">NOT SUBMITTED</span>
        <span className="badge badge-gold">₦5,000</span>
      </div>
      <div style={{ marginTop: '16px' }}>
        <input className="input" placeholder="Type something..." />
      </div>
      <div className="card" style={{ marginTop: '16px' }}>
        This is a card component
      </div>
    </div>
  )
}