import { color, font, fontSize } from '@/styles/tokens'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'flex-start',
      justifyContent: 'space-between',
      gap:            '16px',
      flexWrap:       'wrap',
      marginBottom:   '24px',
    }}>
      <div>
        <h1 style={{
          fontFamily:   font.heading,
          fontSize:     fontSize['2xl'],
          fontWeight:   '800',
          color:        color.ink,
          margin:       '0 0 4px',
          letterSpacing:'-0.02em',
          lineHeight:   1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize:   fontSize.sm,
            color:      color.inkMuted,
            margin:     0,
            fontFamily: font.body,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  )
}