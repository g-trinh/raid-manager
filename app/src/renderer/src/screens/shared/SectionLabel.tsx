interface SectionLabelProps {
  children: React.ReactNode
  accent?: string
}

export function SectionLabel({ children, accent }: SectionLabelProps): React.JSX.Element {
  return (
    <div className="section-label">
      <span className="section-label__text" style={accent ? { color: accent } : undefined}>
        {children}
      </span>
      <span className="section-label__rule" />
    </div>
  )
}
