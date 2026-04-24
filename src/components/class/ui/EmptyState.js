import { color, font, fontSize, radius } from '@/styles/tokens'

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      textAlign:      'center',
      padding:        '60px 32px',
      background:     color.white,
      borderRadius:   radius.xl,
      border:         `1px solid ${color.creamBorder}`,
    }}>
      {icon && (
        <div style={{
          width:          '72px',
          height:         '72px',
          borderRadius:   '50%',
          background:     'rgba(15,37,87,0.06)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   '20px',
          flexShrink:     0,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontFamily:   font.heading,
        fontSize:     fontSize.lg,
        fontWeight:   '700',
        color:        color.ink,
        margin:       '0 0 8px',
        letterSpacing:'-0.01em',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize:  fontSize.sm,
        color:     color.inkMuted,
        margin:    action ? '0 0 24px' : 0,
        maxWidth:  '320px',
        lineHeight:'1.6',
        fontFamily: font.body,
      }}>
        {message}
      </p>
      {action && (
        <button
          className="btn btn-primary"
          onClick={action.onClick}
          style={{ fontFamily: font.body }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}