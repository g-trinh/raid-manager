import { Personality, PERSONALITY_META, PersonalityGlyphType } from '../../domain/data/personality'

interface PersonalityGlyphProps {
  glyph: PersonalityGlyphType
  hue: string
  size: number
  glow: boolean
}

export function PersonalityGlyph({
  glyph,
  hue,
  size,
  glow
}: PersonalityGlyphProps): React.JSX.Element {
  if (glyph === 'ring') {
    return (
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          boxSizing: 'border-box',
          border: `1.6px solid ${hue}`,
          display: 'inline-block',
          flexShrink: 0
        }}
      />
    )
  }
  if (glyph === 'tri') {
    return (
      <span
        style={{
          width: 0,
          height: 0,
          display: 'inline-block',
          flexShrink: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size * 0.92}px solid ${hue}`,
          filter: glow ? `drop-shadow(0 0 3px ${hue})` : 'none'
        }}
      />
    )
  }
  // disc
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: hue,
        display: 'inline-block',
        flexShrink: 0,
        boxShadow: glow ? `0 0 5px ${hue}` : 'none'
      }}
    />
  )
}

interface PersonalityMarkProps {
  personality: Personality
  size?: number
}

export function PersonalityMark({
  personality,
  size = 9
}: PersonalityMarkProps): React.JSX.Element | null {
  const meta = PERSONALITY_META[personality]
  if (!meta) return null
  const { hue, glyph, quiet, label, effect } = meta
  const glow = !quiet
  return (
    <span
      title={`${label} — ${effect}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'Barlow, sans-serif',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: hue,
        border: `1px solid color-mix(in oklab, ${hue} 45%, transparent)`,
        background: `color-mix(in oklab, ${hue} 12%, transparent)`,
        borderRadius: 4,
        padding: '3px 7px',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        boxShadow: glow ? `0 0 9px color-mix(in oklab, ${hue} 24%, transparent)` : 'none'
      }}
    >
      <PersonalityGlyph glyph={glyph} hue={hue} size={size - 1} glow={glow} />
      {label}
    </span>
  )
}
