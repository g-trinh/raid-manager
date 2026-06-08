interface WeightDotsProps {
  weight: number
  color: string
}

export function WeightDots({ weight, color }: WeightDotsProps): React.JSX.Element {
  return (
    <div className="weight-dots">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="weight-dots__dot"
          style={i <= weight ? { background: color, boxShadow: `0 0 4px ${color}88` } : undefined}
        />
      ))}
    </div>
  )
}
