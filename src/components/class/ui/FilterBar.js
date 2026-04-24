import { color, font, fontSize, radius } from '@/styles/tokens'

export function FilterTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display:      'flex',
      gap:          '2px',
      background:   color.creamDark,
      padding:      '3px',
      borderRadius: radius.lg,
      overflow:     'hidden',
      flexWrap:     'wrap',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding:      '7px 16px',
            borderRadius: radius.md,
            border:       'none',
            cursor:       'pointer',
            fontFamily:   font.body,
            fontSize:     fontSize.sm,
            fontWeight:   active === tab.id ? '700' : '500',
            background:   active === tab.id ? color.white : 'transparent',
            color:        active === tab.id ? color.navy   : color.inkMuted,
            boxShadow:    active === tab.id ? '0 1px 4px rgba(15,37,87,0.1)' : 'none',
            transition:   'all 0.15s ease',
            whiteSpace:   'nowrap',
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft:   '6px',
              padding:      '1px 7px',
              borderRadius: radius.full,
              background:   active === tab.id ? color.navy : color.creamBorder,
              color:        active === tab.id ? color.cream : color.inkSubtle,
              fontSize:     fontSize['2xs'],
              fontWeight:   '700',
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <circle cx="11" cy="11" r="8" stroke={color.inkSubtle} strokeWidth="2"/>
        <path d="m21 21-4.35-4.35" stroke={color.inkSubtle} strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingLeft: '42px', background: color.white }}
      />
    </div>
  )
}

export function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select
        value={month}
        onChange={e => onMonthChange(Number(e.target.value))}
        style={{
          height:       '40px',
          padding:      '0 12px',
          fontFamily:   font.body,
          fontSize:     fontSize.sm,
          color:        color.ink,
          background:   color.white,
          border:       `1.5px solid ${color.creamBorder}`,
          borderRadius: radius.md,
          outline:      'none',
          cursor:       'pointer',
          minWidth:     '130px',
        }}
      >
        <option value={0}>All months</option>
        {months.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={e => onYearChange(Number(e.target.value))}
        style={{
          height:       '40px',
          padding:      '0 12px',
          fontFamily:   font.body,
          fontSize:     fontSize.sm,
          color:        color.ink,
          background:   color.white,
          border:       `1.5px solid ${color.creamBorder}`,
          borderRadius: radius.md,
          outline:      'none',
          cursor:       'pointer',
          minWidth:     '100px',
        }}
      >
        <option value={0}>All years</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}