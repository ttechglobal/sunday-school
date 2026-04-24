'use client'

export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`toggle-track ${checked ? 'on' : 'off'}`}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <span className="toggle-thumb" />
    </button>
  )
}