export default function BibleLogo({ size = 48, light = false }) {
  const spine = light ? '#F5F0E8' : '#0A1628'
  const page  = light ? 'rgba(245,240,232,0.85)' : '#F5F0E8'
  const gold  = '#C9A84C'
  const cross = light ? 'rgba(201,168,76,0.9)' : '#C9A84C'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left page */}
      <path
        d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z"
        fill={page}
        opacity={light ? 1 : 0.9}
      />
      {/* Right page */}
      <path
        d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z"
        fill={page}
      />
      {/* Spine */}
      <rect x="22.5" y="9" width="3" height="30" rx="1.5" fill={spine} />

      {/* Lines on left page */}
      <line x1="10" y1="17" x2="21" y2="16.5" stroke={gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="21" x2="21" y2="20.5" stroke={gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="25" x2="21" y2="24.5" stroke={gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="29" x2="17" y2="28.8" stroke={gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

      {/* Cross on right page */}
      <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={cross} />
      <rect x="25.5" y="20" width="12" height="2.5" rx="1.25" fill={cross} />

      {/* Bookmark ribbon */}
      <path
        d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z"
        fill={gold}
      />
    </svg>
  )
}