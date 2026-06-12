import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { memberPool } from '../data/gameData'
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

// A legal full roster: 2 tanks, 2 heals, 4 dps from the hardcoded pool
function fullRoster(): typeof memberPool {
  const byRole = (role: string, n: number): typeof memberPool =>
    memberPool.filter((m) => m.role === role).slice(0, n)
  return [...byRole('TANK', 2), ...byRole('HEAL', 2), ...byRole('DPS', 4)]
}

const ROSTER_SIZE = 8

// Random consumption per reached phase: one fumble roll per member, one
// lethality roll per fumbler, then one pass roll if nobody proved lethal.
// 0.9 never fumbles (max chance is 0.24) and 0.0 always passes the pass roll;
// 0.999 always fails it (chance caps at 0.95 with zero mastery).
const NO_FUMBLES = Array(ROSTER_SIZE).fill(0.9)
const PHASE_PASSES = [...NO_FUMBLES, 0.0]
const PHASE_FAILS_LEARNING = [...NO_FUMBLES, 0.999]
const KILL = [...PHASE_PASSES, ...PHASE_PASSES, ...PHASE_PASSES]

function scriptRandom(script: number[], fallback = 0.5): void {
  let i = 0
  vi.spyOn(Math, 'random').mockImplementation(() => (i < script.length ? script[i++] : fallback))
}

beforeEach(() => {
  useLootStore.getState().reset()
  useChronicleStore.getState().reset()
  useMasteryStore.getState().reset()
  useMoraleStore.getState().reset()
  usePersonalityStore.getState().reset() // unassigned → everyone a Loner
  useDraftStore.setState({ selectedMembers: fullRoster() })
  useRunStore.setState({
    pullsThisBoss: 0,
    wipePhaseIndex: null,
    quitter: null,
    bossDown: false,
    isResolved: false,
    isRunOver: false
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// AC: phases resolve in order — the first failure ends the pull
describe('run — sequential phases', () => {
  it('a kill requires all three phases and one-shots count as full victories', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.FULL_VICTORY)
    expect(state.phasesSucceeded).toBe(3)
    expect(state.bossDown).toBe(true)
    expect(state.droppedItems.length).toBe(3)
  })

  it('a failed phase wipes the pull — later phases are never reached', () => {
    scriptRandom([...PHASE_PASSES, ...PHASE_FAILS_LEARNING])
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.WIPE)
    expect(state.wipePhaseIndex).toBe(1)
    expect(state.phaseResults[1].cause).toBe('learning')
    expect(state.phaseResults[2].reached).toBe(false)
    expect(state.droppedItems).toEqual([])
    expect(state.isRunOver).toBe(false)
  })

  it('a lethal fumble wipes the raid on the spot, attributed by name', () => {
    // First member (Gorvak, skill 2 / disc 3) fumbles, and the fumble is lethal
    scriptRandom([0.0, ...Array(ROSTER_SIZE - 1).fill(0.9), 0.0])
    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.outcome).toBe(Outcome.WIPE)
    expect(state.wipePhaseIndex).toBe(0)
    expect(state.phaseResults[0].cause).toBe('blunder')
    expect(state.phaseResults[0].blunderer).toBe('Gorvak')
    expect(useMoraleStore.getState().fumblesOf('Gorvak')).toBe(1)
    expect(chronicleTexts().some((t) => t.includes("Gorvak's blunder wipes the muster"))).toBe(true)
  })
})

// AC: wipes can be retried — pulls accumulate mastery until the boss dies
describe('run — retry loop', () => {
  it('retry pulls the same boss again and a later kill is a narrow victory', () => {
    // Varying post-kill rolls: the lost-item index must be rolled exactly once —
    // a constant mock would mask a per-item re-roll (the 1-or-3-drops bug)
    scriptRandom([...PHASE_FAILS_LEARNING, ...KILL, 0.9, 0.1, 0.4])
    useRunStore.getState().pull()
    expect(useRunStore.getState().pullsThisBoss).toBe(1)

    useRunStore.getState().pull()
    const state = useRunStore.getState()
    expect(state.pullsThisBoss).toBe(2)
    expect(state.outcome).toBe(Outcome.NARROW_VICTORY)
    expect(state.droppedItems.length).toBe(2) // exactly one item lost to the grind
  })

  it('the wiped phase still teaches — the next pull rolls with mastery', () => {
    scriptRandom([...PHASE_FAILS_LEARNING, ...PHASE_FAILS_LEARNING])
    useRunStore.getState().pull()
    expect(useRunStore.getState().phaseResults[0].masteryPct).toBe(0)
    useRunStore.getState().pull()
    expect(useRunStore.getState().phaseResults[0].masteryPct).toBeGreaterThan(0)
  })

  it('pulling with no boss standing is refused', () => {
    scriptRandom(KILL)
    useRunStore.getState().pull()
    const before = useRunStore.getState().pullsThisBoss
    useRunStore.getState().pull() // boss is down — nothing to pull
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
    useMoraleStore.setState({ morale: { Gorvak: 2 }, fumbles: {} })
    scriptRandom(PHASE_FAILS_LEARNING) // phase I wipe: −2 base
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
    expect(texts.some((t) => t.includes('Full Victory'))).toBe(true)
    expect(texts.some((t) => t.includes('signature item'))).toBe(true)
  })

  it('a learning wipe logs only the reached phases and no drops', () => {
    scriptRandom(PHASE_FAILS_LEARNING)
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
})
