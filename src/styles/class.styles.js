import { color, font, radius, shadow } from './tokens'

// ── Page shells ───────────────────────────────────────────────
export const page = {
  wrapper: {
    minHeight: '100vh',
    background: color.cream,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: font.body,
  },
  body: {
    flex: 1,
    padding: '20px 16px 100px',
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  bodyFull: {
    flex: 1,
    padding: '0 0 100px',
    display: 'flex',
    flexDirection: 'column',
  },
}

// ── Top bar ───────────────────────────────────────────────────
export const topbar = {
  bar: {
    background: color.navy,
    padding: '48px 20px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontFamily: font.display,
    fontSize: '17px',
    fontWeight: '700',
    color: color.cream,
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '11px',
    color: 'rgba(245,240,232,0.5)',
    margin: 0,
    marginTop: '1px',
  },
  iconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: radius.md,
    background: 'rgba(245,240,232,0.1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
}

// ── Cards ─────────────────────────────────────────────────────
export const card = {
  base: {
    background: color.white,
    borderRadius: radius.lg,
    boxShadow: shadow.card,
    padding: '18px',
  },
  cream: {
    background: color.cream,
    borderRadius: radius.lg,
    padding: '18px',
    border: `1px solid ${color.creamDark}`,
  },
  navy: {
    background: color.navy,
    borderRadius: radius.lg,
    padding: '18px',
  },
  action: {
    border: 'none',
    borderRadius: radius.lg,
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    minHeight: '140px',
    transition: 'transform 0.12s ease, opacity 0.15s ease',
  },
}

// ── Typography ────────────────────────────────────────────────
export const text = {
  display: {
    fontFamily: font.display,
    fontWeight: '700',
    color: color.navy,
  },
  label: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: color.mist,
    textTransform: 'uppercase',
    margin: 0,
  },
  body: {
    fontSize: '15px',
    color: color.ink,
    lineHeight: 1.6,
  },
  muted: {
    fontSize: '12px',
    color: color.mist,
  },
}

// ── Banners ───────────────────────────────────────────────────
export const banner = {
  open: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: color.successBg,
    border: `1px solid ${color.successBorder}`,
    borderRadius: radius.md,
    padding: '12px 16px',
  },
  closed: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: color.warningBg,
    border: `1px solid #FDE68A`,
    borderRadius: radius.md,
    padding: '12px 16px',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: color.successBg,
    padding: '12px 20px',
    borderBottom: `1px solid ${color.successBorder}`,
  },
}

// ── Bottom bar ────────────────────────────────────────────────
export const bottomBar = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: color.white,
    borderTop: `1px solid ${color.creamDark}`,
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 -4px 20px rgba(10,22,40,0.08)',
    zIndex: 10,
  },
}

// ── Sheets / Modals ───────────────────────────────────────────
export const sheet = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,22,40,0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 50,
  },
  panel: {
    background: color.white,
    borderRadius: '24px 24px 0 0',
    padding: '8px 24px 44px',
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  handle: {
    width: '40px',
    height: '4px',
    borderRadius: '2px',
    background: color.creamDark,
    margin: '12px auto 20px',
  },
  title: {
    fontFamily: font.display,
    fontSize: '20px',
    color: color.navy,
    margin: '0 0 6px',
  },
}

// ── Attendance member card ────────────────────────────────────
export const memberCard = {
  card: {
    background: color.white,
    borderRadius: radius.lg,
    boxShadow: shadow.card,
    overflow: 'hidden',
    transition: 'box-shadow 0.15s ease',
  },
  cardActive: {
    background: color.white,
    borderRadius: radius.lg,
    boxShadow: shadow.hover,
    overflow: 'hidden',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
  },
  bottom: {
    padding: '0 16px 14px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '13px',
    fontWeight: '700',
  },
  name: {
    fontSize: '15px',
    fontWeight: '700',
    color: color.navy,
    margin: 0,
    lineHeight: 1.3,
  },
  nameMuted: {
    fontSize: '15px',
    fontWeight: '600',
    color: color.mist,
    margin: 0,
    lineHeight: 1.3,
  },
}

// ── Toggle chip ───────────────────────────────────────────────
export const chip = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '32px',
    padding: '0 10px',
    borderRadius: radius.full,
    border: `1.5px solid ${color.creamDark}`,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: font.body,
    color: color.mist,
    transition: 'all 0.12s ease',
    whiteSpace: 'nowrap',
  },
}

// ── Form elements ─────────────────────────────────────────────
export const form = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: color.mist,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  offeringWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  offeringPrefix: {
    position: 'absolute',
    left: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: color.gold,
    pointerEvents: 'none',
    zIndex: 1,
  },
  offeringInput: {
    width: '100%',
    height: '40px',
    paddingLeft: '28px',
    paddingRight: '12px',
    fontSize: '14px',
    fontWeight: '700',
    color: color.navy,
    background: color.cream,
    border: `1.5px solid ${color.creamDark}`,
    borderRadius: radius.sm,
    outline: 'none',
    fontFamily: font.body,
    minWidth: '120px',
    transition: 'border-color 0.15s ease',
  },
}

// ── Drawer nav ────────────────────────────────────────────────
export const drawer = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,22,40,0.55)',
    zIndex: 80,
    display: 'flex',
  },
  panel: {
    width: '280px',
    background: color.navy,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    boxShadow: '4px 0 24px rgba(10,22,40,0.3)',
  },
  header: {
    padding: '52px 20px 20px',
    borderBottom: '1px solid rgba(245,240,232,0.08)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    borderLeft: '3px solid transparent',
    transition: 'all 0.12s ease',
  },
  itemActive: {
    background: 'rgba(245,240,232,0.08)',
    borderLeft: `3px solid ${color.gold}`,
  },
  itemLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(245,240,232,0.85)',
  },
  itemLabelActive: {
    fontSize: '15px',
    fontWeight: '700',
    color: color.cream,
  },
}

// ── History / Records ─────────────────────────────────────────
export const history = {
  sessionCard: {
    background: color.white,
    borderRadius: radius.lg,
    boxShadow: shadow.card,
    padding: '16px 18px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'box-shadow 0.15s ease',
  },
  statRow: {
    display: 'flex',
    gap: '0',
    borderTop: `1px solid ${color.creamDark}`,
    paddingTop: '12px',
  },
  stat: {
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: font.display,
    fontSize: '20px',
    fontWeight: '700',
    color: color.navy,
    margin: 0,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: color.mist,
    margin: '4px 0 0',
    letterSpacing: '0.04em',
  },
  divider: {
    width: '1px',
    background: color.creamDark,
    margin: '0 4px',
  },
}