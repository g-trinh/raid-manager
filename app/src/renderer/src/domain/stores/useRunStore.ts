import { create } from 'zustand'
import { BossData } from '../data/bossData'
import { BossPhaseData } from '../data/bossPhaseData'
import { bossPool, memberPool } from '../data/gameData'
import { LootItemData } from '../data/lootData'
import { drawCandidates, drawOpener, partitionPool } from '../logic/bossTiers'
import { projectPhase } from '../logic/phaseProjection'
import { selectDroppedItems } from '../logic/signatureLoot'
import { useCampStore } from './useCampStore'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { usePersonalityStore } from './usePersonalityStore'

const TOTAL_BOSSES = 3

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
  bossOutcomes: Outcome[]
  pendingChoice: BossData[] | null
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  droppedItems: LootItemData[]
  isResolved: boolean
  isFinalBoss: boolean
  isRunOver: boolean

  resolve: () => void
  chooseBoss: (boss: BossData) => void
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

function drawBoss1(): BossData {
  return drawOpener(partitionPool(bossPool).easy)
}

export const useRunStore = create<RunState>((set, get) => {
  const initialBoss = drawBoss1()

  return {
    bossIndex: 0,
    boss: initialBoss,
    runBosses: [initialBoss],
    bossOutcomes: [],
    pendingChoice: null,
    phaseResults: [],
    phasesSucceeded: 0,
    outcome: Outcome.DEFEAT,
    droppedItems: [],
    isResolved: false,
    isFinalBoss: false,
    isRunOver: false,

    resolve: () => {
      if (!useDraftStore.getState().isDraftComplete()) {
        console.warn('RunState.resolve() called before draft is complete')
        return
      }

      const boss = get().runBosses[0]
      const { phaseResults, phasesSucceeded, outcome } = attemptBoss(boss)
      const droppedItems = selectDroppedItems(boss, outcome, phaseResults)
      const isFinalBoss = 0 === TOTAL_BOSSES - 1
      const isRunOver = outcome === Outcome.DEFEAT || isFinalBoss
      const pendingChoice = isRunOver ? null : drawCandidates(partitionPool(bossPool).mid, [boss])

      set({
        bossIndex: 0,
        boss,
        bossOutcomes: [outcome],
        pendingChoice,
        phaseResults,
        phasesSucceeded,
        outcome,
        droppedItems,
        isResolved: true,
        isFinalBoss,
        isRunOver
      })
    },

    chooseBoss: (picked) => {
      const { bossIndex, runBosses, bossOutcomes, pendingChoice } = get()
      if (!pendingChoice) {
        console.warn('RunState.chooseBoss() called without a pending choice')
        return
      }

      const nextIndex = bossIndex + 1
      const { phaseResults, phasesSucceeded, outcome } = attemptBoss(picked)
      const droppedItems = selectDroppedItems(picked, outcome, phaseResults)
      const nextRunBosses = [...runBosses, picked]
      const nextBossOutcomes = [...bossOutcomes, outcome]
      const isFinalBoss = nextIndex === TOTAL_BOSSES - 1
      const isRunOver = outcome === Outcome.DEFEAT || isFinalBoss

      let nextPendingChoice: BossData[] | null = null
      if (!isRunOver) {
        const unpicked = pendingChoice.filter((b) => b.bossName !== picked.bossName)
        nextPendingChoice = drawCandidates(partitionPool(bossPool).hard, [
          ...nextRunBosses,
          ...unpicked
        ])
      }

      set({
        bossIndex: nextIndex,
        boss: picked,
        runBosses: nextRunBosses,
        bossOutcomes: nextBossOutcomes,
        pendingChoice: nextPendingChoice,
        phaseResults,
        phasesSucceeded,
        outcome,
        droppedItems,
        isResolved: true,
        isFinalBoss,
        isRunOver
      })
    },

    reset: () => {
      const boss1 = drawBoss1()
      set({
        bossIndex: 0,
        boss: boss1,
        runBosses: [boss1],
        bossOutcomes: [],
        pendingChoice: null,
        phaseResults: [],
        phasesSucceeded: 0,
        outcome: Outcome.DEFEAT,
        droppedItems: [],
        isResolved: false,
        isFinalBoss: false,
        isRunOver: false
      })
      useDraftStore.getState().reset()
      useLootStore.getState().reset()
      useCampStore.getState().reset()
      usePersonalityStore.getState().reset()
      usePersonalityStore.getState().rollForRoster(memberPool)
    }
  }
})
