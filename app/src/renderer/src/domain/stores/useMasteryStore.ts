import { create } from 'zustand'
import { MemberData } from '../data/memberData'
import { FAST_LEARNER_DISCIPLINE, masteryGain } from '../logic/mastery'

// Per-member, per-phase mastery of the CURRENT boss only — a new boss means
// new mechanics, so engaging one wipes the slate.

interface MasteryState {
  // memberName → mastery (0–100) per phase index of the current boss
  mastery: Record<string, number[]>

  masteryOf: (memberName: string, phaseIndex: number) => number
  rosterMastery: (roster: MemberData[], phaseIndex: number) => number
  recordPull: (phasesReached: number, roster: MemberData[], mechanicCounts: number[]) => void
  resetBoss: () => void
  reset: () => void
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  mastery: {},

  masteryOf: (memberName, phaseIndex) => {
    return get().mastery[memberName]?.[phaseIndex] ?? 0
  },

  rosterMastery: (roster, phaseIndex) => {
    if (roster.length === 0) return 0
    const { masteryOf } = get()
    const total = roster.reduce((sum, m) => sum + masteryOf(m.memberName, phaseIndex), 0)
    return total / roster.length
  },

  // Every member present learns each phase the pull reached — including the
  // one the muster died to. `roster` carries effective stats so loot-boosted
  // Discipline counts toward fast learning.
  recordPull: (phasesReached, roster, mechanicCounts) => {
    const next: Record<string, number[]> = { ...get().mastery }
    for (const member of roster) {
      const rows = [...(next[member.memberName] ?? mechanicCounts.map(() => 0))]
      const fastLearner = member.discipline >= FAST_LEARNER_DISCIPLINE
      for (let i = 0; i < phasesReached && i < mechanicCounts.length; i++) {
        rows[i] = masteryGain(rows[i] ?? 0, mechanicCounts[i], fastLearner)
      }
      next[member.memberName] = rows
    }
    set({ mastery: next })
  },

  resetBoss: () => set({ mastery: {} }),

  reset: () => set({ mastery: {} })
}))
