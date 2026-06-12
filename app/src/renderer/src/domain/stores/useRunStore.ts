import { create } from 'zustand'
import { BossData } from '../data/bossData'
import { BossPhaseData, PhaseType } from '../data/bossPhaseData'
import { bossPool, memberPool } from '../data/gameData'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { drawCandidates, drawOpener, partitionPool } from '../logic/bossTiers'
import { projectPhase } from '../logic/phaseProjection'
import { selectDroppedItems } from '../logic/signatureLoot'
import { useCampStore } from './useCampStore'
import { useChronicleStore } from './useChronicleStore'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { useMasteryStore } from './useMasteryStore'
import { useMoraleStore } from './useMoraleStore'
import { usePersonalityStore } from './usePersonalityStore'

const TOTAL_BOSSES = 3

// A fumble's chance per missing pip of the tested stat, and the odds that any
// given fumble proves lethal (wipes the raid then and there).
const FUMBLE_CHANCE_PER_PIP = 0.06
const FUMBLE_LETHALITY = 0.05

export enum Outcome {
  VICTORY = 'VICTORY', // the boss is down — a kill is a kill, however many pulls
  WIPE = 'WIPE', // pull lost — retry available
  DISBAND = 'DISBAND' // someone gquit — run over
}

export type WipeCause = 'blunder' | 'learning'

export interface PhaseResult {
  phase: BossPhaseData
  score: number
  chance: number
  success: boolean
  // Sequential pulls: a phase past the wipe was never seen
  reached: boolean
  // Roster mastery of the phase going into this pull, 0–100
  masteryPct: number
  fumblers: string[]
  cause?: WipeCause
  blunderer?: string
}

interface AttemptResult {
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  wipePhaseIndex: number | null
  quitter: string | null
}

interface RunState {
  bossIndex: number
  boss: BossData
  runBosses: BossData[]
  // Fought bosses plus roads not taken — excluded from future draws
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

  pull: () => void
  chooseBoss: (boss: BossData) => void
  reset: () => void
}

const ROMAN = ['I', 'II', 'III']

function testedStat(phase: BossPhaseData): 'skill' | 'discipline' {
  return phase.phaseType === PhaseType.SKILL_HEAVY ? 'skill' : 'discipline'
}

interface PhasePull {
  result: PhaseResult
  blunderer: string | null
}

// One phase of one pull: fumble rolls first (a lethal one wipes the raid on
// the spot, attributed by name), then the unfamiliarity roll — which mastery
// erases. Random order matters for the seeded tests: |roster| fumble rolls,
// one lethality roll per fumbler, then one pass roll if nobody proved lethal.
function pullPhase(phase: BossPhaseData, phaseIndex: number, roster: MemberData[]): PhasePull {
  const { log } = useChronicleStore.getState()
  const morale = useMoraleStore.getState()
  const statKey = testedStat(phase)

  const masteryPct = useMasteryStore.getState().rosterMastery(roster, phaseIndex)
  const { score, chance: base } = projectPhase(phase, roster)
  const chance = 1 - (1 - masteryPct / 100) * (1 - base)

  const fumblers: string[] = []
  for (const member of roster) {
    const fumbleChance = (5 - member[statKey]) * FUMBLE_CHANCE_PER_PIP
    if (Math.random() < fumbleChance) {
      fumblers.push(member.memberName)
      morale.recordFumble(member.memberName)
      log('battle', `${member.memberName} fumbles in Phase ${ROMAN[phaseIndex]}`)
    }
  }

  let blunderer: string | null = null
  for (const name of fumblers) {
    if (Math.random() < FUMBLE_LETHALITY) {
      blunderer = name
      break
    }
  }

  let success: boolean
  let cause: WipeCause | undefined
  if (blunderer) {
    success = false
    cause = 'blunder'
  } else {
    success = Math.random() <= chance
    cause = success ? undefined : 'learning'
  }

  return {
    result: {
      phase,
      score,
      chance,
      success,
      reached: true,
      masteryPct,
      fumblers,
      cause,
      blunderer: blunderer ?? undefined
    },
    blunderer
  }
}

function attemptBoss(boss: BossData): AttemptResult {
  const roster = useLootStore.getState().effectiveRoster(useDraftStore.getState().selectedMembers)
  const morale = useMoraleStore.getState()

  const phaseResults: PhaseResult[] = []
  let wipePhaseIndex: number | null = null
  let blunderer: string | null = null

  boss.phases.forEach((phase, i) => {
    if (wipePhaseIndex !== null) {
      phaseResults.push({
        phase,
        score: 0,
        chance: 0,
        success: false,
        reached: false,
        masteryPct: useMasteryStore.getState().rosterMastery(roster, i),
        fumblers: []
      })
      return
    }
    const pull = pullPhase(phase, i, roster)
    phaseResults.push(pull.result)
    if (!pull.result.success) {
      wipePhaseIndex = i
      blunderer = pull.blunderer
    }
  })

  // Everyone learns every phase the pull reached — the failed one included
  const phasesReached = wipePhaseIndex === null ? boss.phases.length : wipePhaseIndex + 1
  useMasteryStore.getState().recordPull(
    phasesReached,
    roster,
    boss.phases.map((p) => p.mechanicCount)
  )

  let outcome: Outcome
  let quitter: string | null = null
  if (wipePhaseIndex === null) {
    outcome = Outcome.VICTORY
    morale.applyKill(roster)
  } else {
    morale.applyWipe(wipePhaseIndex, blunderer, roster)
    quitter = morale.quitterIn(roster)
    outcome = quitter ? Outcome.DISBAND : Outcome.WIPE
  }

  const phasesSucceeded = phaseResults.filter((r) => r.success).length
  return { phaseResults, phasesSucceeded, outcome, wipePhaseIndex, quitter }
}

function chronicleAttempt(boss: BossData, attempt: AttemptResult, pullNumber: number): void {
  const { log } = useChronicleStore.getState()
  const { phaseResults, outcome, wipePhaseIndex, quitter } = attempt

  phaseResults.forEach((result, i) => {
    if (!result.reached) return
    const odds = Math.round(result.chance * 100)
    log(
      'battle',
      `Phase ${ROMAN[i]} — ${result.phase.name}: ${result.success ? 'Held' : 'Broke'} (${odds}% to hold)`
    )
  })

  if (outcome === Outcome.VICTORY) {
    log(
      'battle',
      `Victory — ${boss.bossName} falls ${pullNumber === 1 ? 'in one pull' : `on pull ${pullNumber}`}`
    )
  } else if (wipePhaseIndex !== null) {
    const failed = phaseResults[wipePhaseIndex]
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
}

function chronicleDrops(droppedCount: number): void {
  if (droppedCount > 0) {
    useChronicleStore
      .getState()
      .log('loot', `${droppedCount} signature item${droppedCount > 1 ? 's' : ''} drop`)
  }
}

function isVictory(outcome: Outcome): boolean {
  return outcome === Outcome.VICTORY
}

function drawBoss1(): BossData {
  return drawOpener(partitionPool(bossPool).easy)
}

export const useRunStore = create<RunState>((set, get) => {
  const initialBoss = drawBoss1()

  // Resolve one pull against the current boss and project the next screen
  function performPull(boss: BossData, pullNumber: number): void {
    const { bossIndex, seenBosses, bossOutcomes } = get()
    const attempt = attemptBoss(boss)
    const { phaseResults, phasesSucceeded, outcome, wipePhaseIndex, quitter } = attempt
    const droppedItems = selectDroppedItems(boss, outcome)
    chronicleAttempt(boss, attempt, pullNumber)
    chronicleDrops(droppedItems.length)

    const bossDown = isVictory(outcome)
    const isFinalBoss = bossIndex === TOTAL_BOSSES - 1
    const isRunOver = outcome === Outcome.DISBAND || (bossDown && isFinalBoss)
    const pendingChoice =
      bossDown && !isFinalBoss
        ? drawCandidates(partitionPool(bossPool)[bossIndex === 0 ? 'mid' : 'hard'], seenBosses)
        : null

    set({
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
      isRunOver
    })
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

    // The one way into combat: an explicit pull from the war table (or the
    // wipe screen's Pull Again shortcut). Never a side effect of navigation.
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
      // A fresh interval: Rest becomes available again after this pull
      useCampStore.getState().newInterval()
      performPull(boss, pullsThisBoss + 1)
    },

    // Select only — the player pulls from the war table when ready
    chooseBoss: (picked) => {
      const { bossIndex, runBosses, pendingChoice } = get()
      if (!pendingChoice) {
        console.warn('RunState.chooseBoss() called without a pending choice')
        return
      }

      useChronicleStore.getState().log('system', `Path chosen — ${picked.bossName}`)
      // New boss, new mechanics — the old mastery is worthless
      useMasteryStore.getState().resetBoss()

      // The road not taken is lost — exclude it from every later draw
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
        outcome: Outcome.WIPE
      }))
    },

    reset: () => {
      const boss1 = drawBoss1()
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
        isRunOver: false
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
