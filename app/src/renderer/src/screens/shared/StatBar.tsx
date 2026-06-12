interface StatBarProps {
  label: string
  value: number
  accent?: string
}

const MAX_STAT = 5

export function StatBar({
  label,
  value,
  accent = 'var(--rm-skill)'
}: StatBarProps): React.JSX.Element {
  const filled = Math.max(0, Math.min(MAX_STAT, Math.round(value)))
  const maxed = filled === MAX_STAT
  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{label}</span>
      <div
        className="stat-bar__pips"
        role="img"
        aria-label={`${label} ${filled} of ${MAX_STAT}${maxed ? ' (at peak)' : ''}`}
      >
        {Array.from({ length: MAX_STAT }, (_, i) => (
          <span
            key={i}
            className={`stat-bar__pip${maxed ? ' stat-bar__pip--max' : ''}`}
            style={
              i < filled
                ? {
                    background: accent,
                    boxShadow: `0 0 ${maxed ? 8 : 5}px color-mix(in srgb, ${accent} ${maxed ? 85 : 55}%, transparent)`
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
