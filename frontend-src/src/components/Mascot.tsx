interface MascotProps {
  size?: number
  className?: string
}

export function Mascot({ size = 40, className = '' }: MascotProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mascotBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#76E60E" />
          <stop offset="100%" stopColor="#46a302" />
        </linearGradient>
        <linearGradient id="mascotBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFCE2" />
          <stop offset="100%" stopColor="#FFD900" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="68" rx="44" ry="42" fill="url(#mascotBody)" />
      <ellipse cx="60" cy="78" rx="28" ry="26" fill="url(#mascotBelly)" />
      <path d="M22 38 L34 22 L40 40 Z" fill="#46a302" />
      <path d="M98 38 L86 22 L80 40 Z" fill="#46a302" />
      <ellipse cx="44" cy="56" rx="14" ry="15" fill="#fff" />
      <ellipse cx="76" cy="56" rx="14" ry="15" fill="#fff" />
      <ellipse cx="46" cy="58" rx="6" ry="7" fill="#1F1F1F" />
      <ellipse cx="78" cy="58" rx="6" ry="7" fill="#1F1F1F" />
      <circle cx="48" cy="55" r="2" fill="#fff" />
      <circle cx="80" cy="55" r="2" fill="#fff" />
      <path d="M55 74 L65 74 L60 84 Z" fill="#FF9600" stroke="#E07A00" strokeWidth="1.5" />
      <ellipse cx="48" cy="108" rx="9" ry="4" fill="#FF9600" />
      <ellipse cx="72" cy="108" rx="9" ry="4" fill="#FF9600" />
    </svg>
  )
}
