import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bossPool, memberPool } from '../data/gameData'
import { useChronicleStore } from './useChronicleStore'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { useMasteryStore } from './useMasteryStore'
import { useMoraleStore } from './useMoraleStore'
import { Outcome, useRunStore } from './useRunStore'
import { usePersonalityStore } from './usePersonalityStore'

function chronicleTexts(): string[] {
  return useChronicleStore.getState().entries.map((e) => e.text)
}

// A legal full roster: 2 tanks, 2 heals, 4 dps from the hardcoded pool.
// Roster order (alphabetical within role as returned by filter().slice()):
//   TANK: Gorvak(sk2,di3), Shieldara(sk4,di1)
//   HEAL: Lumina(sk1,di4), Patchwick(sk2,di3)
//   DPS:  Razorfang(sk4,di1), Blitzclaw(sk3,di2), Vexara(sk5,di1), Skarn(sk1,di4)
function fullRoster(): typeof memberPool {
  const byRole = (role: string, n: number): typeof memberPool =>
    memberPool.filter((m) => m.role === role).slice(0, n)
  return [...byRole('TANK', 2), ...byRole('HEAL', 2), ...byRole('DPS', 4)]
}

// ── RNG draw schedule for Moloch the Unbound (ADR-003 §6) ────────────────────
//
// Phase I  "The Searing March":  ADD_WAVE→DPS(4,sk,sv1) + DODGE→ALL(8,sk,sv1)
//                                 + TANKBUSTER→TANKS(2,sk,sv3)  = 14 draws
// Phase II "The Branding Rite":  RAIDWIDE→ALL(8,di,sv2) + SPREAD→ALL(8,di,sv2)
//                                 + SOAK→DPS(4,di,sv2)          = 20 draws
// Phase III "The Last Smelting": DODGE→ALL(8,sk,sv1) + RAIDWIDE→ALL(8,di,sv2) = 16 draws
// Kill total: 50 draws
//
// 0.01 → always fails (< any failChance in this roster)
// 0.99 → always passes (> max failChance ≤ 0.42)

const PASS = 0.99
const FAIL = 0.01

const PHASE_I_ALL_PASS = Array(14).fill(PASS)
const PHASE_II_ALL_PASS = Array(20).fill(PASS)
const PHASE_III_ALL_PASS = Array(16).fill(PASS)

const KILL = [...PHASE_I_ALL_PASS, ...PHASE_II_ALL_PASS, ...PHASE_III_ALL_PASS]

// Phase II learning wipe: fail RAIDWIDE (8×sev2 = 16 damage) > budget(3.5*4=14).
// SPREAD(8) and SOAK(4) use the PASS fallback — damage already exceeds budget.
const PHASE_II_LEARNING_WIPE = [
  ...PHASE_I_ALL_PASS,          // Phase I: 14 draws all pass
  ...Array(8).fill(FAIL)        // Phase II RAIDWIDE: 8×sev2 fail → +16 > budget 14
  // remaining 12 Phase II draws: fallback PASS
]

function scriptRandom(script: number[], fallback = PASS): void {
  let i = 0
  vi.spyOn(Math, 'random').mockImplementation(() => (i < script.length ? script[i++] : fallback))
}

const MOLOCH = bossPool[0]

beforeEach(() => {
  useLootStore.getState().reset()
  useChronicleStore.getState().reset()
  useMasteryStore.getState().reset()
  useMoraleStore.getState().reset()
  usePersonalityStore.getState().reset()
  useDraftStore.setState({ selectedMembers: fullRoster() })
  // Fix Moloch as the current boss for deterministic draw schedules
  useRunStore.setState({
    boss: MOLOCH,
    pullsThisBoss: 0,
    wipePhaseIndex: null,
    quitter: null,
    bossDown: false,
    isResolved: false,
    isRunOver: false,
    pullLogs: []
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// AC: phases resolve in order — the first failure ends the pull
describe('run — sequential phases', () => {
  it('a kill requires all three phases and drops the full signature set', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.VICTORY)
    expect(state.phasesSucceeded).toBe(3)
    expect(state.bossDown).toBe(true)
    expect(state.droppedItems.length).toBe(3)
  })

  it('a failed phase wipes the pull — later phases are never reached', () => {
    scriptRandom(PHASE_II_LEARNING_WIPE)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.WIPE)
    expect(state.wipePhaseIndex).toBe(1)
    expect(state.phaseResults[1].cause).toBe('learning')
    expect(state.phaseResults[2].reached).toBe(false)
    expect(state.droppedItems).toEqual([])
    expect(state.isRunOver).toBe(false)
  })

  it('a lethal tankbuster failure wipes the raid attributed by name', () => {
    // Phase I draw order: 4 DPS (ADD_WAVE), 8 ALL (DODGE), 2 TANKS (TANKBUSTER).
    // Make all DPS and ALL pass, then first tank (Gorvak) fails TANKBUSTER (sev3 → death).
    const draws = [
      ...Array(12).fill(PASS), // ADD_WAVE(4) + DODGE(8) all pass
      FAIL,                     // TANKBUSTER: Gorvak (first TANK) fails → death
      PASS                      // Shieldara not checked (wipe already triggered)
    ]
    scriptRandom(draws)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.WIPE)
    expect(state.wipePhaseIndex).toBe(0)
    expect(state.phaseResults[0].cause).toBe('blunder')
    expect(state.phaseResults[0].blunderer).toBe('Gorvak')
    expect(state.phaseResults[0].killerMechanic).toBe('Forgecrush')
    expect(useMoraleStore.getState().fumblesOf('Gorvak')).toBe(1)
    expect(chronicleTexts().some((t) => t.includes("Gorvak's blunder wipes the muster"))).toBe(true)
  })
})

// AC: wipes can be retried — pulls accumulate mastery until the boss dies
describe('run — retry loop', () => {
  it('retry pulls the same boss again — a kill after wipes still drops everything', () => {
    scriptRandom([...PHASE_II_LEARNING_WIPE, ...KILL])
    useRunStore.getState().pull()
    expect(useRunStore.getState().pullsThisBoss).toBe(1)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.pullsThisBoss).toBe(2)
    expect(state.outcome).toBe(Outcome.VICTORY)
    expect(state.droppedItems.length).toBe(3)
  })

  it('the wiped phase still teaches — the next pull rolls with mastery', () => {
    scriptRandom([...PHASE_II_LEARNING_WIPE, ...PHASE_II_LEARNING_WIPE])
    useRunStore.getState().pull()
    expect(useRunStore.getState().phaseResults[0].masteryPct).toBe(0)
    useRunStore.getState().pull()
    // Phase 0 was reached on both pulls — mastery should be non-zero now
    expect(useRunStore.getState().phaseResults[0].masteryPct).toBeGreaterThan(0)
  })

  it('pulling with no boss standing is refused', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const before = useRunStore.getState().pullsThisBoss
    useRunStore.getState().pull()
    expect(useRunStore.getState().pullsThisBoss).toBe(before)
  })

  it('choosing the next boss arms the table without pulling', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const choice = useRunStore.getState().pendingChoice
    expect(choice).not.toBeNull()
    useRunStore.getState().chooseBoss(choice![0])
    const state = useRunStore.getState()
    expect(state.boss.bossName).toBe(choice![0].bossName)
    expect(state.pullsThisBoss).toBe(0)
    expect(state.bossDown).toBe(false)
    expect(state.isResolved).toBe(false)
  })
})

// AC: morale 0 means a gquit, and a gquit means the run is over
describe('run — disband', () => {
  it('a wipe that breaks a member disbands the guild', () => {
    // Phase II wipe costs baseLoss=1 (WIPE_BASE_LOSS[1]); start at 1 so it hits 0.
    useMoraleStore.setState({ morale: { Gorvak: 1 }, fumbles: {} })
    scriptRandom(PHASE_II_LEARNING_WIPE)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.DISBAND)
    expect(state.quitter).toBe('Gorvak')
    expect(state.isRunOver).toBe(true)
    expect(chronicleTexts().some((t) => t.includes('Gorvak has had enough'))).toBe(true)
  })
})

// AC: the attempt writes the chronicle — reached phases, the outcome, drops
describe('run — chronicle entries', () => {
  it('a one-shot kill logs three held phases, the victory and the drops', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const texts = chronicleTexts()
    expect(texts.filter((t) => t.includes('Held')).length).toBe(3)
    expect(texts.some((t) => t.includes('falls in one pull'))).toBe(true)
    expect(texts.some((t) => t.includes('signature item'))).toBe(true)
  })

  it('a learning wipe logs only the reached phases and no drops', () => {
    scriptRandom(PHASE_II_LEARNING_WIPE)
    useRunStore.getState().pull()
    const texts = chronicleTexts()
    expect(texts.filter((t) => t.includes('Broke')).length).toBe(1)
    expect(texts.some((t) => t.includes('still learning'))).toBe(true)
    expect(texts.some((t) => t.includes('signature item'))).toBe(false)
  })

  it('reset clears the chronicle', () => {
    useChronicleStore.getState().log('system', 'stale')
    useRunStore.getState().reset()
    expect(useChronicleStore.getState().entries).toEqual([])
  })
})

// AC: phase results carry score and mastery so the outcome screen can explain
describe('run — phase result detail', () => {
  it('each reached phase exposes the projected score', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    for (const result of useRunStore.getState().phaseResults) {
      expect(result.reached).toBe(true)
      expect(result.score).toBeGreaterThan(0)
      expect(typeof result.masteryPct).toBe('number')
    }
  })

  it('kill result includes damageTally, budget, and failedChecks fields', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    for (const result of useRunStore.getState().phaseResults) {
      expect(typeof result.damageTally).toBe('number')
      expect(typeof result.budget).toBe('number')
      expect(Array.isArray(result.failedChecks)).toBe(true)
    }
  })
})

// AC: pullLogs accumulates one array per pull and resets on chooseBoss
describe('run — pullLogs', () => {
  it('accumulates one log per pull', () => {
    scriptRandom([...PHASE_II_LEARNING_WIPE, ...PHASE_II_LEARNING_WIPE])
    useRunStore.getState().pull()
    useRunStore.getState().pull()
    expect(useRunStore.getState().pullLogs.length).toBe(2)
  })

  it('each pull log starts with phase-start and ends with wipe or kill', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const log = useRunStore.getState().pullLogs[0]
    expect(log.length).toBeGreaterThan(0)
    expect(log[0].kind).toBe('phase-start')
    expect(log[log.length - 1].kind).toBe('kill')
  })

  it('pullLogs resets when choosing a new boss', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const choice = useRunStore.getState().pendingChoice
    useRunStore.getState().chooseBoss(choice![0])
    expect(useRunStore.getState().pullLogs).toEqual([])
  })
})

// AC: draw count per phase matches Σ |targetedMembers| (ADR-003 §6)
// Tested at resolver level to avoid counting infrastructure randomness.
describe('run — RNG draw order', () => {
  it('Moloch kill resolver consumes exactly 50 draws (14 + 20 + 16)', async () => {
    const { resolvePull, FUMBLE_CHANCE_PER_PIP, SEVERITY_DAMAGE, U0, phaseBudget } = await import(
      '../logic/pullResolver'
    )
    const roster = fullRoster()
    let drawCount = 0
    const countingRng = (): number => { drawCount++; return PASS }

    const gen = resolvePull(
      roster,
      MOLOCH,
      () => 0,
      { U0, FUMBLE_CHANCE_PER_PIP, SEVERITY_DAMAGE, phaseBudget },
      countingRng
    )
    let step = gen.next()
    while (!step.done) {
      step = gen.next({ action: 'continue' })
    }
    // Phase I: ADD_WAVE(4 DPS) + DODGE(8 ALL) + TANKBUSTER(2 TANKS) = 14
    // Phase II: RAIDWIDE(8 ALL) + SPREAD(8 ALL) + SOAK(4 DPS) = 20
    // Phase III: DODGE(8 ALL) + RAIDWIDE(8 ALL) = 16
    expect(drawCount).toBe(50)
  })
})
