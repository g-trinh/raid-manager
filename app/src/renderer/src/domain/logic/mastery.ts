// Mastery: how well a member knows one phase of the current boss, 0–100.
// The learning curve is an S: the obvious mechanics come in one pull, the
// dance takes mechanicCount pulls, the last polish comes quickly again.

export const MASTERY_MAX = 100

const DISCOVERY_CEIL = 25
const DANCE_CEIL = 80
const DISCOVERY_GAIN = 25
const DANCE_BAND_TOTAL = 55
const POLISH_GAIN = 20

// Discipline ≥ 4 members do their homework between pulls.
export const FAST_LEARNER_DISCIPLINE = 4
const FAST_LEARNER_FACTOR = 1.5

export function masteryGain(current: number, mechanicCount: number, fastLearner: boolean): number {
  let gain: number
  if (current < DISCOVERY_CEIL) gain = DISCOVERY_GAIN
  else if (current < DANCE_CEIL) gain = DANCE_BAND_TOTAL / mechanicCount
  else gain = POLISH_GAIN
  if (fastLearner) gain *= FAST_LEARNER_FACTOR
  return Math.min(MASTERY_MAX, current + gain)
}

export type MasteryBand = 'Learning the mechanics' | 'Learning the dance' | 'Polishing' | 'On farm'

export function masteryBand(value: number): MasteryBand {
  if (value >= MASTERY_MAX) return 'On farm'
  if (value >= DANCE_CEIL) return 'Polishing'
  if (value >= DISCOVERY_CEIL) return 'Learning the dance'
  return 'Learning the mechanics'
}
