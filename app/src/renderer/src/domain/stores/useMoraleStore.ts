import { create } from 'zustand'
import { MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { useChronicleStore } from './useChronicleStore'
import { usePersonalityStore } from './usePersonalityStore'

// Morale: each member's patience with the run, 0–10. Wipes drain it — sloppy
// early wipes more than close ones, repeat blunderers exponentially more.
// At 0 the member gquits and the guild disbands.

export const MORALE_MAX = 10
const NEAR_BREAKING = 2

// Base morale cost of a wipe by the phase it happened in: a phase-I wipe is
// sloppy, a phase-III wipe was almost a kill and keeps hope alive.
const WIPE_BASE_LOSS = [2, 1, 0]

// The Nth cumulative fumble of the same member: first ones are forgiven,
// the serial blunderer's wipes hit the roster exponentially harder.
const GRIEVANCE_BY_FUMBLES = [0, 0, 1, 2, 4]
const GRIEVANCE_CAP = 6

export function grievanceFor(fumbleCount: number): number {
  return GRIEVANCE_BY_FUMBLES[fumbleCount] ?? GRIEVANCE_CAP
}

function clampMorale(value: number): number {
  return Math.max(0, Math.min(MORALE_MAX, value))
}

interface MoraleState {
  // memberName → morale; absent means untouched (MORALE_MAX)
  morale: Record<string, number>
  // memberName → cumulative fumbles this run (resentment persists across bosses)
  fumbles: Record<string, number>

  moraleOf: (memberName: string) => number
  fumblesOf: (memberName: string) => number
  recordFumble: (memberName: string) => void
  restore: (memberName: string, amount: number) => void
  applyWipe: (wipePhaseIndex: number, blunderer: string | null, roster: MemberData[]) => void
  applyKill: (roster: MemberData[]) => void
  quitterIn: (roster: MemberData[]) => string | null
  reset: () => void
}

export const useMoraleStore = create<MoraleState>((set, get) => ({
  morale: {},
  fumbles: {},

  moraleOf: (memberName) => get().morale[memberName] ?? MORALE_MAX,

  fumblesOf: (memberName) => get().fumbles[memberName] ?? 0,

  recordFumble: (memberName) => {
    set((state) => ({
      fumbles: { ...state.fumbles, [memberName]: (state.fumbles[memberName] ?? 0) + 1 }
    }))
  },

  restore: (memberName, amount) => {
    if (amount <= 0) return
    set((state) => ({
      morale: {
        ...state.morale,
        [memberName]: clampMorale((state.morale[memberName] ?? MORALE_MAX) + amount)
      }
    }))
  },

  applyWipe: (wipePhaseIndex, blunderer, roster) => {
    const { moraleOf, fumblesOf } = get()
    const personalityOf = usePersonalityStore.getState().personalityOf
    const { log } = useChronicleStore.getState()

    const baseLoss = WIPE_BASE_LOSS[wipePhaseIndex] ?? 0
    const grievance = blunderer ? grievanceFor(fumblesOf(blunderer)) : 0

    const next: Record<string, number> = { ...get().morale }
    for (const member of roster) {
      const name = member.memberName
      const personality = personalityOf(name)

      let loss = baseLoss
      // A lootless pull stings the glory-seeker every time
      if (personality === Personality.GLORY_HOUND) loss += 1
      // Grievance lands on everyone but the blunderer themselves
      if (blunderer && name !== blunderer) {
        if (personality === Personality.LONER) loss += 0
        else if (personality === Personality.ALTRUIST) loss += Math.floor(grievance / 2)
        else loss += grievance
      }

      const before = moraleOf(name)
      const after = clampMorale(before - loss)
      next[name] = after
      if (after <= NEAR_BREAKING && before > NEAR_BREAKING) {
        log('morale', `${name} is near breaking (morale ${after}/${MORALE_MAX})`)
      }
    }

    if (blunderer && grievance > 0) {
      log('morale', `The muster grows weary of ${blunderer}'s blunders (−${grievance} morale)`)
    }

    set({ morale: next })
  },

  applyKill: (roster) => {
    const next: Record<string, number> = { ...get().morale }
    for (const member of roster) {
      next[member.memberName] = clampMorale((next[member.memberName] ?? MORALE_MAX) + 3)
    }
    useChronicleStore.getState().log('morale', 'The boss is down — the muster breathes (+3 morale)')
    set({ morale: next })
  },

  quitterIn: (roster) => {
    const { moraleOf } = get()
    const quitter = roster.find((m) => moraleOf(m.memberName) <= 0)
    return quitter ? quitter.memberName : null
  },

  reset: () => set({ morale: {}, fumbles: {} })
}))
