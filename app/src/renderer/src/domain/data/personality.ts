export enum Personality {
  LONER = 'LONER',
  ALTRUIST = 'ALTRUIST',
  GLORY_HOUND = 'GLORY_HOUND'
}

export type PersonalityGlyphType = 'ring' | 'tri' | 'disc'

export interface PersonalityMeta {
  label: string
  glyph: PersonalityGlyphType
  hue: string
  quiet: boolean
  effect: string
}

export const PERSONALITY_META: Record<Personality, PersonalityMeta> = {
  [Personality.LONER]: {
    label: 'Loner',
    glyph: 'ring',
    hue: 'oklch(0.71 0.055 290)',
    quiet: true,
    effect: 'Unmoved. Reacts to no loot grant.'
  },
  [Personality.ALTRUIST]: {
    label: 'Altruist',
    glyph: 'tri',
    hue: 'oklch(0.745 0.095 200)',
    quiet: false,
    effect: '+Liability when others are geared · −Skill if a Glory Hound is.'
  },
  [Personality.GLORY_HOUND]: {
    label: 'Glory Hound',
    glyph: 'disc',
    hue: 'oklch(0.70 0.115 350)',
    quiet: false,
    effect: '+Skill when gifted loot · −Liability when passed over.'
  }
}

export const PERSONALITY_LABELS: Record<Personality, string> = {
  [Personality.LONER]: 'Loner',
  [Personality.ALTRUIST]: 'Altruist',
  [Personality.GLORY_HOUND]: 'Glory Hound'
}

export function rollPersonality(): Personality {
  const roll = Math.random()
  if (roll < 0.125) return Personality.ALTRUIST
  if (roll < 0.25) return Personality.GLORY_HOUND
  return Personality.LONER
}
