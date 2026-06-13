// Mastery: how well a member knows one phase of the current boss, 0–100.
// The S-curve emerges from per-mechanic step counts — phases with more mechanics
// take more pulls to fill. Band labels are the aggregate read model.

export const MASTERY_MAX = 100

// Discipline ≥ 4 members advance two steps instead of one per reached mechanic.
export const FAST_LEARNER_DISCIPLINE = 4

export type MasteryBand = 'Learning the mechanics' | 'Learning the dance' | 'Polishing' | 'On farm'

export function masteryBand(value: number): MasteryBand {
  if (value >= MASTERY_MAX) return 'On farm'
  if (value >= 80) return 'Polishing'
  if (value >= 25) return 'Learning the dance'
  return 'Learning the mechanics'
}
