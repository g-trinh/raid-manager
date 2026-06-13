import { beforeEach, describe, expect, it } from 'vitest'
import { createMember } from '../data/memberData'
import { Role } from '../data/role'
import { ReachedMechanics, useMasteryStore } from './useMasteryStore'

const slowLearner = createMember('Slow Sam', Role.DPS, 3, 2)
const fastLearner = createMember('Keen Kira', Role.DPS, 3, 4)
const roster = [slowLearner, fastLearner]

// A two-phase boss: phase 0 has 2 mechanics, phase 1 has 3 mechanics.
const allThreePhases: ReachedMechanics = [
  { phaseIndex: 0, mechanicIndex: 0 },
  { phaseIndex: 0, mechanicIndex: 1 },
  { phaseIndex: 1, mechanicIndex: 0 },
  { phaseIndex: 1, mechanicIndex: 1 },
  { phaseIndex: 1, mechanicIndex: 2 }
]
const phaseZeroOnly: ReachedMechanics = [
  { phaseIndex: 0, mechanicIndex: 0 },
  { phaseIndex: 0, mechanicIndex: 1 }
]

beforeEach(() => {
  useMasteryStore.getState().reset()
})

// AC: every reached mechanic advances one step; Discipline ≥ 4 advances two steps
describe('mastery store — recordPull', () => {
  it('grants mastery only to phases the pull reached', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, roster)
    const { mechanicMastery } = useMasteryStore.getState()
    // Phase 0 mechanics advanced
    expect(mechanicMastery('Slow Sam', 0, 0)).toBe(0.5)
    expect(mechanicMastery('Slow Sam', 0, 1)).toBe(0.5)
    // Phase 1 untouched
    expect(mechanicMastery('Slow Sam', 1, 0)).toBe(0)
  })

  it('slow learner (Discipline < 4) advances one step (0 → 50)', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, [slowLearner])
    expect(useMasteryStore.getState().mechanicMastery('Slow Sam', 0, 0)).toBe(0.5)
  })

  it('fast learner (Discipline ≥ 4) advances two steps in one pull (0 → 100)', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, [fastLearner])
    expect(useMasteryStore.getState().mechanicMastery('Keen Kira', 0, 0)).toBe(1)
  })

  it('slow learner reaches full mastery on a mechanic after two pulls', () => {
    const { recordPull, mechanicMastery } = useMasteryStore.getState()
    recordPull(phaseZeroOnly, [slowLearner])
    expect(mechanicMastery('Slow Sam', 0, 0)).toBe(0.5)
    useMasteryStore.getState().recordPull(phaseZeroOnly, [slowLearner])
    expect(useMasteryStore.getState().mechanicMastery('Slow Sam', 0, 0)).toBe(1)
  })

  it('caps at 100 — additional pulls do not exceed full mastery', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, [fastLearner])
    useMasteryStore.getState().recordPull(phaseZeroOnly, [fastLearner])
    expect(useMasteryStore.getState().mechanicMastery('Keen Kira', 0, 0)).toBe(1)
  })
})

// AC: phase mastery is the average of its mechanics; more mechanics → more pulls to fill
describe('mastery store — phaseMastery aggregate', () => {
  it('phaseMastery averages over mechanic steps', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, [slowLearner])
    // Both mechanics at 50 → average 50
    expect(useMasteryStore.getState().phaseMastery('Slow Sam', 0, 2)).toBe(50)
  })

  it('a slow learner reaches full mastery on a phase after 2 pulls (2 discrete steps)', () => {
    const reached: ReachedMechanics = [
      { phaseIndex: 0, mechanicIndex: 0 },
      { phaseIndex: 0, mechanicIndex: 1 }
    ]
    useMasteryStore.getState().recordPull(reached, [slowLearner])
    expect(useMasteryStore.getState().phaseMastery('Slow Sam', 0, 2)).toBe(50)
    useMasteryStore.getState().recordPull(reached, [slowLearner])
    expect(useMasteryStore.getState().phaseMastery('Slow Sam', 0, 2)).toBe(100)
  })

  it('rosterPhaseMastery averages across roster members', () => {
    useMasteryStore.getState().recordPull(phaseZeroOnly, roster)
    const { rosterPhaseMastery } = useMasteryStore.getState()
    // Sam: 50 per mechanic → phase 50; Kira: 100 per mechanic → phase 100 → roster avg 75
    expect(rosterPhaseMastery(roster, 0, 2)).toBe(75)
    expect(rosterPhaseMastery([], 0, 2)).toBe(0)
  })
})

// AC: resetBoss and reset clear all mastery
describe('mastery store — resets', () => {
  it('a new boss wipes the slate', () => {
    useMasteryStore.getState().recordPull(allThreePhases, roster)
    useMasteryStore.getState().resetBoss()
    expect(useMasteryStore.getState().mechanicMastery('Slow Sam', 0, 0)).toBe(0)
  })

  it('reset wipes all mastery', () => {
    useMasteryStore.getState().recordPull(allThreePhases, roster)
    useMasteryStore.getState().reset()
    expect(useMasteryStore.getState().mechanicMastery('Keen Kira', 1, 2)).toBe(0)
  })
})
