import { create } from 'zustand'
import { BossData } from '../data/bossData'
import { BossPhaseData } from '../data/bossPhaseData'
import { bosses } from '../data/gameData'
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

interface AttemptResult {
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
}

interface RunState {
  bossIndex: number
  boss: BossData
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  isResolved: boolean
  isFinalBoss: boolean
  isRunOver: boolean

  resolve: () => void
  advance: () => void
  reset: () => void
}

function attemptBoss(boss: BossData): AttemptResult {
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

  return { phaseResults, phasesSucceeded, outcome }
}

export const useRunStore = create<RunState>((set, get) => ({
  bossIndex: 0,
  boss: bosses[0],
  phaseResults: [],
  phasesSucceeded: 0,
  outcome: Outcome.DEFEAT,
  isResolved: false,
  isFinalBoss: bosses.length === 1,
  isRunOver: false,

  resolve: () => {
    if (!useDraftStore.getState().isDraftComplete()) {
      console.warn('RunState.resolve() called before draft is complete')
      return
    }

    const bossIndex = 0
    const boss = bosses[bossIndex]
    const { phaseResults, phasesSucceeded, outcome } = attemptBoss(boss)
    const isFinalBoss = bossIndex === bosses.length - 1
    const isRunOver = outcome === Outcome.DEFEAT || isFinalBoss

    set({
      bossIndex,
      boss,
      phaseResults,
      phasesSucceeded,
      outcome,
      isResolved: true,
      isFinalBoss,
      isRunOver
    })
  },

  advance: () => {
    const { bossIndex, outcome, isFinalBoss } = get()
    if (outcome === Outcome.DEFEAT || isFinalBoss) {
      console.warn('RunState.advance() called when the run is already over')
      return
    }

    const nextIndex = bossIndex + 1
    const boss = bosses[nextIndex]
    const { phaseResults, phasesSucceeded, outcome: nextOutcome } = attemptBoss(boss)
    const nextIsFinalBoss = nextIndex === bosses.length - 1
    const isRunOver = nextOutcome === Outcome.DEFEAT || nextIsFinalBoss

    set({
      bossIndex: nextIndex,
      boss,
      phaseResults,
      phasesSucceeded,
      outcome: nextOutcome,
      isResolved: true,
      isFinalBoss: nextIsFinalBoss,
      isRunOver
    })
  },

  reset: () => {
    set({
      bossIndex: 0,
      boss: bosses[0],
      phaseResults: [],
      phasesSucceeded: 0,
      outcome: Outcome.DEFEAT,
      isResolved: false,
      isFinalBoss: bosses.length === 1,
      isRunOver: false
    })
    useDraftStore.getState().reset()
  }
}))
