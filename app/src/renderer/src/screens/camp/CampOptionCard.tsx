interface CampOptionCardProps {
  title: string
  action: string
  flavor: string
  effect: string
  onPick: () => void
}

export function CampOptionCard({
  title,
  action,
  flavor,
  effect,
  onPick
}: CampOptionCardProps): React.JSX.Element {
  return (
    <button className="camp-option" onClick={onPick}>
      <div className="camp-option__action">{action}</div>
      <div className="camp-option__title">{title}</div>
      <div className="camp-option__flavor">{flavor}</div>
      <div className="camp-option__effect">{effect}</div>
    </button>
  )
}
