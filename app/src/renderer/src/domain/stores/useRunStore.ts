import { create } from 'zustand'
import { BossPhaseData } from '../data/bossPhaseData'
import { boss } from '../data/gameData'
import { projectPhase } from '../logic/phaseProjection'
import { useDraftStore } from './useDraftStore'

export enum Outcome {
  FULL_VICTORY = 'FULL_VICTORY',
  NARROW_VICTORY = 'NARROW_VICTORY',
  DEFEAT = 'DEFEAT'
}

export interface PhaseResult {
  phase: BossPhaseData
  chance: number
  success: boolean
}

interface RunState {
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  isResolved: boolean

  resolve: () => void
  reset: () => void
}

export const useRunStore = create<RunState>((set) => ({
  phaseResults: [],
  phasesSucceeded: 0,
  outcome: Outcome.DEFEAT,
  isResolved: false,

  resolve: () => {
    if (!useDraftStore.getState().isDraftComplete()) {
      console.warn('RunState.resolve() called before draft is complete')
      return
    }

    const members = useDraftStore.getState().selectedMembers
    const phaseResults: PhaseResult[] = boss.phases.map((phase) => {
      const { chance } = projectPhase(phase, members)
      return { phase, chance, success: Math.random() <= chance }
    })
    const phasesSucceeded = phaseResults.filter((r) => r.success).length

    let outcome: Outcome
    if (phasesSucceeded === 3) outcome = Outcome.FULL_VICTORY
    else if (phasesSucceeded === 2) outcome = Outcome.NARROW_VICTORY
    else outcome = Outcome.DEFEAT

    set({ phaseResults, phasesSucceeded, outcome, isResolved: true })
  },

  reset: () => {
    set({ phaseResults: [], phasesSucceeded: 0, outcome: Outcome.DEFEAT, isResolved: false })
    useDraftStore.getState().reset()
  }
}))

export function getBossName(): string {
  return boss.bossName
}
