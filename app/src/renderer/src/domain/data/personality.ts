export enum Personality {
  LONER = 'LONER',
  ALTRUIST = 'ALTRUIST',
  GLORY_HOUND = 'GLORY_HOUND'
}

export const PERSONALITY_LABELS: Record<Personality, string> = {
  [Personality.LONER]: 'Loner',
  [Personality.ALTRUIST]: 'Altruist',
  [Personality.GLORY_HOUND]: 'Glory Hound'
}

export function rollPersonality(): Personality {
  const roll = Math.random()
  if (roll < 0.1) return Personality.ALTRUIST
  if (roll < 0.2) return Personality.GLORY_HOUND
  return Personality.LONER
}
