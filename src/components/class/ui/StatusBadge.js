import { color, font, fontSize, radius } from '@/styles/tokens'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: color.warningBg,  border: color.warningBorder, text: '#92400E'  },
  approved:  { label: 'Approved',  bg: color.successBg,  border: color.successBorder, text: '#065F46'  },
  rejected:  { label: 'Rejected',  bg: color.errorBg,    border: color.errorBorder,   text: '#991B1B'  },
  submitted: { label: 'Submitted', bg: color.infoBg,     border: color.infoBorder,    text: '#1E40AF'  },
  open:      { label: 'Open',      bg: color.successBg,  border: color.successBorder, text: '#065F46'  },
  closed:    { label: 'Closed',    bg: color.creamDark,  border: color.creamBorder,   text: color.inkMuted },
  active:    { label: 'Active',    bg: color.successBg,  border: color.successBorder, text: '#065F46'  },
  inactive:  { label: 'Inactive',  bg: color.errorBg,    border: color.errorBorder,   text: '#991B1B'  },
}

export default function StatusBadge({ status, label, size = 'md' }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || {
    label:  label || status || 'Unknown',
    bg:     color.creamDark,
    border: color.creamBorder,
    text:   color.inkMuted,
  }

  const displayLabel = label || cfg.label

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '4px',
      padding:      size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: radius.full,
      background:   cfg.bg,
      border:       `1px solid ${cfg.border}`,
      fontSize:     size === 'sm' ? fontSize['2xs'] : fontSize.xs,
      fontWeight:   '700',
      color:        cfg.text,
      fontFamily:   font.body,
      letterSpacing:'0.02em',
      whiteSpace:   'nowrap',
    }}>
      {displayLabel}
    </span>
  )
}