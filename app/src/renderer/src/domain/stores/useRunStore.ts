import { create } from 'zustand'
import { BossData } from '../data/bossData'
import { bossPool, memberPool } from '../data/gameData'
import { LootItemData } from '../data/lootData'
import { drawCandidates, drawOpener, partitionPool } from '../logic/bossTiers'
import {
  AttemptResult,
  FumbleEvent,
  MasterySnapshotFn,
  Outcome,
  PausePoint,
  PhaseResult,
  PullEvent,
  Resolution,
  ResolutionDials,
  WipeCause,
  FUMBLE_CHANCE_PER_PIP,
  SEVERITY_DAMAGE,
  U0,
  phaseBudget,
  resolvePull
} from '../logic/pullResolver'
import { selectDroppedItems } from '../logic/signatureLoot'
import { ReachedMechanics, useMasteryStore } from './useMasteryStore'
import { useCampStore } from './useCampStore'
import { useChronicleStore } from './useChronicleStore'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { useMoraleStore } from './useMoraleStore'
import { usePersonalityStore } from './usePersonalityStore'

// Re-export types consumed by screens so their imports stay clean
export { Outcome, WipeCause, PhaseResult, PullEvent }
export type { AttemptResult }

const TOTAL_BOSSES = 3

const DEFAULT_DIALS: ResolutionDials = {
  U0,
  FUMBLE_CHANCE_PER_PIP,
  SEVERITY_DAMAGE,
  phaseBudget
}

const ROMAN = ['I', 'II', 'III']

export interface PendingIntervention {
  pause: PausePoint
}

interface RunState {
  bossIndex: number
  boss: BossData
  runBosses: BossData[]
  seenBosses: BossData[]
  bossOutcomes: Outcome[]
  pendingChoice: BossData[] | null
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  pullsThisBoss: number
  wipePhaseIndex: number | null
  quitter: string | null
  bossDown: boolean
  droppedItems: LootItemData[]
  isResolved: boolean
  isFinalBoss: boolean
  isRunOver: boolean
  // PullEvent log: one inner array per pull of the current boss (ADR-006)
  pullLogs: PullEvent[][]
  // Pause machine state — always null until agency features register triggers (ADR-004)
  pendingIntervention: PendingIntervention | null

  pull: () => void
  chooseBoss: (boss: BossData) => void
  reset: () => void
}

function drawBoss1(): BossData {
  return drawOpener(partitionPool(bossPool).easy)
}

// The suspended generator is held in a module-level ref (non-serialisable).
// The store's pendingIntervention exposes only the serialisable pause context.
let _suspendedGen: Generator<PausePoint, AttemptResult, Resolution> | null = null

export const useRunStore = create<RunState>((set, get) => {
  const initialBoss = drawBoss1()

  function applyAttempt(boss: BossData, attempt: AttemptResult, pullNumber: number): void {
    const { bossIndex, seenBosses, bossOutcomes } = get()
    const { phaseResults, phasesSucceeded, wipePhaseIndex, pullLog, fumbleEvents } = attempt
    const morale = useMoraleStore.getState()
    const { log } = useChronicleStore.getState()
    const roster = useLootStore
      .getState()
      .effectiveRoster(useDraftStore.getState().selectedMembers)

    // Apply fumble side-effects: morale F++ + chronicle line naming the mechanic
    for (const { member, phaseIndex, mechanicIndex } of fumbleEvents) {
      morale.recordFumble(member)
      const mechanicName = boss.phases[phaseIndex]?.mechanics[mechanicIndex]?.name
      const label = mechanicName
        ? `${member} fumbles ${mechanicName} in Phase ${ROMAN[phaseIndex]}`
        : `${member} fumbles in Phase ${ROMAN[phaseIndex]}`
      log('battle', label)
    }

    // Chronicle phase outcomes
    for (let i = 0; i < phaseResults.length; i++) {
      const result = phaseResults[i]
      if (!result.reached) continue
      const odds = Math.round(result.chance * 100)
      log(
        'battle',
        `Phase ${ROMAN[i]} — ${result.phase.name}: ${result.success ? 'Held' : 'Broke'} (${odds}% to hold)`
      )
    }

    // Record mastery for all reached mechanics (A-5: all mechanics in reached phases)
    const reachedMechanics: ReachedMechanics = []
    const phasesReached = wipePhaseIndex === null ? boss.phases.length : wipePhaseIndex + 1
    for (let p = 0; p < phasesReached; p++) {
      for (let k = 0; k < boss.phases[p].mechanics.length; k++) {
        reachedMechanics.push({ phaseIndex: p, mechanicIndex: k })
      }
    }
    useMasteryStore.getState().recordPull(reachedMechanics, roster)

    let outcome: Outcome
    let quitter: string | null = null
    if (wipePhaseIndex === null) {
      outcome = Outcome.VICTORY
      morale.applyKill(roster)
      log(
        'battle',
        `Victory — ${boss.bossName} falls ${pullNumber === 1 ? 'in one pull' : `on pull ${pullNumber}`}`
      )
    } else {
      const failed = phaseResults[wipePhaseIndex]
      morale.applyWipe(
        wipePhaseIndex,
        failed.blunderer ?? null,
        roster
      )
      quitter = morale.quitterIn(roster)
      outcome = quitter ? Outcome.DISBAND : Outcome.WIPE

      if (failed.cause === 'blunder' && failed.blunderer) {
        log(
          'battle',
          `${failed.blunderer}'s blunder wipes the muster in Phase ${ROMAN[wipePhaseIndex]}`
        )
      } else {
        log('battle', `Wipe in Phase ${ROMAN[wipePhaseIndex]} — the muster is still learning`)
      }
    }

    if (outcome === Outcome.DISBAND && quitter) {
      log('morale', `${quitter} has had enough — they quit, and the guild disbands`)
    }

    const droppedItems = selectDroppedItems(boss, outcome)
    if (droppedItems.length > 0) {
      log('loot', `${droppedItems.length} signature item${droppedItems.length > 1 ? 's' : ''} drop`)
    }

    const bossDown = outcome === Outcome.VICTORY
    const isFinalBoss = bossIndex === TOTAL_BOSSES - 1
    const isRunOver = outcome === Outcome.DISBAND || (bossDown && isFinalBoss)
    const pendingChoice =
      bossDown && !isFinalBoss
        ? drawCandidates(partitionPool(bossPool)[bossIndex === 0 ? 'mid' : 'hard'], seenBosses)
        : null

    set((state) => ({
      bossOutcomes: bossDown ? [...bossOutcomes, outcome] : bossOutcomes,
      pendingChoice,
      phaseResults,
      phasesSucceeded,
      outcome,
      pullsThisBoss: pullNumber,
      wipePhaseIndex,
      quitter,
      bossDown,
      droppedItems,
      isResolved: true,
      isFinalBoss,
      isRunOver,
      pendingIntervention: null,
      pullLogs: [...state.pullLogs, pullLog]
    }))
  }

  function performPull(boss: BossData, pullNumber: number): void {
    const roster = useLootStore
      .getState()
      .effectiveRoster(useDraftStore.getState().selectedMembers)

    const masteryState = useMasteryStore.getState()
    const masterySnapshot: MasterySnapshotFn = (memberName, phaseIndex, mechanicIndex) =>
      masteryState.mechanicMastery(memberName, phaseIndex, mechanicIndex)

    const gen = resolvePull(roster, boss, masterySnapshot, DEFAULT_DIALS, Math.random)

    // Driver loop: empty trigger registry → auto-continue every yield
    let step = gen.next()
    while (!step.done) {
      const pause = step.value
      // FUTURE: matchTrigger(pause) — when agency features register triggers,
      // this sets pendingIntervention and suspends; the continuation feeds the resolution.
      // For now, always auto-continue.
      _suspendedGen = null
      step = gen.next({ action: 'continue' })
    }

    applyAttempt(boss, step.value, pullNumber)
  }

  return {
    bossIndex: 0,
    boss: initialBoss,
    runBosses: [initialBoss],
    seenBosses: [initialBoss],
    bossOutcomes: [],
    pendingChoice: null,
    phaseResults: [],
    phasesSucceeded: 0,
    outcome: Outcome.WIPE,
    pullsThisBoss: 0,
    wipePhaseIndex: null,
    quitter: null,
    bossDown: false,
    droppedItems: [],
    isResolved: false,
    isFinalBoss: false,
    isRunOver: false,
    pullLogs: [],
    pendingIntervention: null,

    pull: () => {
      const { boss, pullsThisBoss, bossDown, isRunOver } = get()
      if (!useDraftStore.getState().isDraftComplete()) {
        console.warn('RunState.pull() called before draft is complete')
        return
      }
      if (bossDown || isRunOver) {
        console.warn('RunState.pull() called with no boss standing')
        return
      }
      useCampStore.getState().newInterval()
      performPull(boss, pullsThisBoss + 1)
    },

    chooseBoss: (picked) => {
      const { bossIndex, runBosses, pendingChoice } = get()
      if (!pendingChoice) {
        console.warn('RunState.chooseBoss() called without a pending choice')
        return
      }

      useChronicleStore.getState().log('system', `Path chosen — ${picked.bossName}`)
      useMasteryStore.getState().resetBoss()

      const unpicked = pendingChoice.filter((b) => b.bossName !== picked.bossName)
      set((state) => ({
        bossIndex: bossIndex + 1,
        boss: picked,
        runBosses: [...runBosses, picked],
        seenBosses: [...state.seenBosses, picked, ...unpicked],
        pendingChoice: null,
        bossDown: false,
        isResolved: false,
        pullsThisBoss: 0,
        wipePhaseIndex: null,
        outcome: Outcome.WIPE,
        pullLogs: []
      }))
    },

    reset: () => {
      const boss1 = drawBoss1()
      _suspendedGen = null
      set({
        bossIndex: 0,
        boss: boss1,
        runBosses: [boss1],
        seenBosses: [boss1],
        bossOutcomes: [],
        pendingChoice: null,
        phaseResults: [],
        phasesSucceeded: 0,
        outcome: Outcome.WIPE,
        pullsThisBoss: 0,
        wipePhaseIndex: null,
        quitter: null,
        bossDown: false,
        droppedItems: [],
        isResolved: false,
        isFinalBoss: false,
        isRunOver: false,
        pullLogs: [],
        pendingIntervention: null
      })
      useDraftStore.getState().reset()
      useLootStore.getState().reset()
      useCampStore.getState().reset()
      useChronicleStore.getState().reset()
      useMasteryStore.getState().reset()
      useMoraleStore.getState().reset()
      usePersonalityStore.getState().reset()
      usePersonalityStore.getState().rollForRoster(memberPool)
    }
  }
})
