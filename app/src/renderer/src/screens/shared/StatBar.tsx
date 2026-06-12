interface StatBarProps {
  label: string
  value: number
  // When set, pips between value and projected preview the gain (or mark the loss)
  projected?: number
  accent?: string
}

const MAX_STAT = 5

type PipState = 'filled' | 'gain' | 'loss' | 'empty'

function pipStates(value: number, projected: number | undefined): PipState[] {
  const cur = Math.max(0, Math.min(MAX_STAT, Math.round(value)))
  const next =
    projected === undefined ? cur : Math.max(0, Math.min(MAX_STAT, Math.round(projected)))
  return Array.from({ length: MAX_STAT }, (_, i) => {
    if (i < Math.min(cur, next)) return 'filled'
    if (i < next) return 'gain'
    if (i < cur) return 'loss'
    return 'empty'
  })
}

export function StatBar({
  label,
  value,
  projected,
  accent = 'var(--rm-skill)'
}: StatBarProps): React.JSX.Element {
  const states = pipStates(value, projected)
  const maxed = states.every((s) => s === 'filled')
  const ariaProjection =
    projected !== undefined && projected !== value ? `, becomes ${projected}` : ''
  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{label}</span>
      <div
        className="stat-bar__pips"
        role="img"
        aria-label={`${label} ${value} of ${MAX_STAT}${ariaProjection}${maxed ? ' (at peak)' : ''}`}
      >
        {states.map((state, i) => (
          <span
            key={i}
            className={`stat-bar__pip stat-bar__pip--${state}${maxed ? ' stat-bar__pip--max' : ''}`}
            style={
              state === 'filled' || state === 'gain'
                ? {
                    background: state === 'gain' ? 'transparent' : accent,
                    borderColor: accent,
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
