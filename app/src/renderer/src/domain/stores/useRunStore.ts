import { create } from 'zustand'
import { BossData } from '../data/bossData'
import { BossPhaseData } from '../data/bossPhaseData'
import { bossPool, memberPool } from '../data/gameData'
import { draftBosses } from '../logic/bossDraft'
import { projectPhase } from '../logic/phaseProjection'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { usePersonalityStore } from './usePersonalityStore'

const RUN_BOSS_COUNT = 3

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
  runBosses: BossData[]
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
  const members = useLootStore.getState().effectiveRoster(useDraftStore.getState().selectedMembers)
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

const initialRunBosses = draftBosses(bossPool, RUN_BOSS_COUNT)

export const useRunStore = create<RunState>((set, get) => ({
  bossIndex: 0,
  boss: initialRunBosses[0],
  runBosses: initialRunBosses,
  phaseResults: [],
  phasesSucceeded: 0,
  outcome: Outcome.DEFEAT,
  isResolved: false,
  isFinalBoss: initialRunBosses.length === 1,
  isRunOver: false,

  resolve: () => {
    if (!useDraftStore.getState().isDraftComplete()) {
      console.warn('RunState.resolve() called before draft is complete')
      return
    }

    const { runBosses } = get()
    const bossIndex = 0
    const boss = runBosses[bossIndex]
    const { phaseResults, phasesSucceeded, outcome } = attemptBoss(boss)
    const isFinalBoss = bossIndex === runBosses.length - 1
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
    const { bossIndex, runBosses, outcome, isFinalBoss } = get()
    if (outcome === Outcome.DEFEAT || isFinalBoss) {
      console.warn('RunState.advance() called when the run is already over')
      return
    }

    const nextIndex = bossIndex + 1
    const boss = runBosses[nextIndex]
    const { phaseResults, phasesSucceeded, outcome: nextOutcome } = attemptBoss(boss)
    const nextIsFinalBoss = nextIndex === runBosses.length - 1
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
    const runBosses = draftBosses(bossPool, RUN_BOSS_COUNT)
    set({
      bossIndex: 0,
      boss: runBosses[0],
      runBosses,
      phaseResults: [],
      phasesSucceeded: 0,
      outcome: Outcome.DEFEAT,
      isResolved: false,
      isFinalBoss: runBosses.length === 1,
      isRunOver: false
    })
    useDraftStore.getState().reset()
    useLootStore.getState().reset()
    usePersonalityStore.getState().reset()
    usePersonalityStore.getState().rollForRoster(memberPool)
  }
}))
