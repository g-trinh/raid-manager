import { create } from 'zustand'
import { MemberData } from '../data/memberData'
import { FAST_LEARNER_DISCIPLINE, MASTERY_MAX } from '../logic/mastery'

// Per-mechanic step values: 0, 50, 100 (two steps to full mastery).
// mechanicMastery returns this as 0..1 for the resolver's failChance term.
// phaseMastery averages mechanics for the UI's 0..100 phase view.

const STEP_SMALL = 50
const STEP_LARGE = 100

export type ReachedMechanics = { phaseIndex: number; mechanicIndex: number }[]

interface MasteryState {
  // memberName → phaseIndex → mechanicIndex → step value (0 / 50 / 100)
  mastery: Record<string, number[][]>

  mechanicMastery: (memberName: string, phaseIndex: number, mechanicIndex: number) => number
  phaseMastery: (memberName: string, phaseIndex: number, mechanicCount: number) => number
  rosterPhaseMastery: (
    roster: MemberData[],
    phaseIndex: number,
    mechanicCount: number
  ) => number
  recordPull: (reached: ReachedMechanics, roster: MemberData[], factor?: number) => void
  resetBoss: () => void
  reset: () => void
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  mastery: {},

  mechanicMastery: (memberName, phaseIndex, mechanicIndex) => {
    const step = get().mastery[memberName]?.[phaseIndex]?.[mechanicIndex] ?? 0
    return step / MASTERY_MAX
  },

  phaseMastery: (memberName, phaseIndex, mechanicCount) => {
    if (mechanicCount === 0) return 0
    const phases = get().mastery[memberName]?.[phaseIndex] ?? []
    let total = 0
    for (let k = 0; k < mechanicCount; k++) {
      total += phases[k] ?? 0
    }
    return total / mechanicCount
  },

  rosterPhaseMastery: (roster, phaseIndex, mechanicCount) => {
    if (roster.length === 0 || mechanicCount === 0) return 0
    const { phaseMastery } = get()
    const total = roster.reduce((sum, m) => sum + phaseMastery(m.memberName, phaseIndex, mechanicCount), 0)
    return total / roster.length
  },

  recordPull: (reached, roster, factor = 1) => {
    const next: Record<string, number[][]> = {}
    for (const [name, phases] of Object.entries(get().mastery)) {
      next[name] = phases.map((row) => [...row])
    }

    for (const member of roster) {
      if (!next[member.memberName]) next[member.memberName] = []
      const fastLearner = member.discipline >= FAST_LEARNER_DISCIPLINE
      const stepsPerMechanic = fastLearner ? 2 : 1
      const effectiveSteps = Math.round(stepsPerMechanic * factor)

      for (const { phaseIndex: p, mechanicIndex: k } of reached) {
        if (!next[member.memberName][p]) next[member.memberName][p] = []
        const current = next[member.memberName][p][k] ?? 0
        const gain = effectiveSteps === 2 ? STEP_LARGE : STEP_SMALL
        next[member.memberName][p][k] = Math.min(MASTERY_MAX, current + gain)
      }
    }

    set({ mastery: next })
  },

  resetBoss: () => set({ mastery: {} }),

  reset: () => set({ mastery: {} })
}))
