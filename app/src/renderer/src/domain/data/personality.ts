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
  flavor: string
}

export const PERSONALITY_META: Record<Personality, PersonalityMeta> = {
  [Personality.LONER]: {
    label: 'Loner',
    glyph: 'ring',
    hue: 'var(--rm-loner)',
    quiet: true,
    effect: 'Unmoved. Reacts to no loot grant.',
    flavor: 'Keeps their own counsel. The steady baseline of any muster.'
  },
  [Personality.ALTRUIST]: {
    label: 'Altruist',
    glyph: 'tri',
    hue: 'var(--rm-altruist)',
    quiet: false,
    effect: '+Discipline when others are geared · −Skill if a Glory Hound is.',
    flavor:
      'Plays for the guild. Glad to see the squad gear up — galled when glory-seekers are rewarded.'
  },
  [Personality.GLORY_HOUND]: {
    label: 'Glory Hound',
    glyph: 'disc',
    hue: 'var(--rm-glory)',
    quiet: false,
    effect: '+Skill when gifted loot · −Discipline when a same-role rival is geared instead.',
    flavor: 'Lives for recognition. Gear them and they shine; overlook them and they curdle.'
  }
}

export const PERSONALITY_LABELS: Record<Personality, string> = {
  [Personality.LONER]: 'Loner',
  [Personality.ALTRUIST]: 'Altruist',
  [Personality.GLORY_HOUND]: 'Glory Hound'
}

// 75% Loner / 12.5% Altruist / 12.5% Glory Hound — see docs/feature/personalities.md
export function rollPersonality(): Personality {
  const roll = Math.random()
  if (roll < 0.125) return Personality.ALTRUIST
  if (roll < 0.25) return Personality.GLORY_HOUND
  return Personality.LONER
}
