interface StatBarProps {
  label: string
  value: number
  accent?: string
}

export function StatBar({ label, value, accent = '#e8dcc0' }: StatBarProps): React.JSX.Element {
  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{label}</span>
      <div className="stat-bar__track">
        <div
          className="stat-bar__fill"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
            boxShadow: `0 0 6px ${accent}55`
          }}
        />
        <div className="stat-bar__notches" />
      </div>
      <span className="stat-bar__value">{value}</span>
    </div>
  )
}
