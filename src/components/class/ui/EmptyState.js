export default function EmptyState({ icon = '📋', title, message, action }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '60px 24px',
      textAlign:      'center',
      background:     '#fff',
      borderRadius:   '16px',
      boxShadow:      '0 1px 4px rgba(10,22,40,0.08)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>{icon}</div>
      <p style={{
        fontFamily:  "'Playfair Display', Georgia, serif",
        fontSize:    '20px',
        fontWeight:  '700',
        color:       '#0A1628',
        margin:      '0 0 8px',
      }}>
        {title}
      </p>
      <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 24px', maxWidth: '320px', lineHeight: 1.6 }}>
        {message}
      </p>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}