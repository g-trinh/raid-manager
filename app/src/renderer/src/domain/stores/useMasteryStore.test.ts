import { beforeEach, describe, expect, it } from 'vitest'
import { createMember } from '../data/memberData'
import { Role } from '../data/role'
import { useMasteryStore } from './useMasteryStore'

const slowLearner = createMember('Slow Sam', Role.DPS, 3, 2)
const fastLearner = createMember('Keen Kira', Role.DPS, 3, 4)
const roster = [slowLearner, fastLearner]
const mechanicCounts = [2, 5, 3]

beforeEach(() => {
  useMasteryStore.getState().reset()
})

// AC: every member present learns each phase the pull reached — no further
describe('mastery store — recordPull', () => {
  it('grants mastery only to phases the pull reached', () => {
    useMasteryStore.getState().recordPull(2, roster, mechanicCounts)
    const { masteryOf } = useMasteryStore.getState()
    expect(masteryOf('Slow Sam', 0)).toBe(25)
    expect(masteryOf('Slow Sam', 1)).toBe(25)
    expect(masteryOf('Slow Sam', 2)).toBe(0)
  })

  it('disciplined members learn ×1.5 faster', () => {
    useMasteryStore.getState().recordPull(1, roster, mechanicCounts)
    const { masteryOf } = useMasteryStore.getState()
    expect(masteryOf('Slow Sam', 0)).toBe(25)
    expect(masteryOf('Keen Kira', 0)).toBe(37.5)
  })

  it('accumulates across pulls through the dance band', () => {
    const { recordPull } = useMasteryStore.getState()
    recordPull(1, [slowLearner], mechanicCounts)
    recordPull(1, [slowLearner], mechanicCounts)
    // 0 → 25 (discovery), then 25 → 25 + 55/2 (dance, 2 mechanics)
    expect(useMasteryStore.getState().masteryOf('Slow Sam', 0)).toBe(52.5)
  })
})

describe('mastery store — roster aggregate and resets', () => {
  it('rosterMastery averages the roster', () => {
    useMasteryStore.getState().recordPull(1, roster, mechanicCounts)
    expect(useMasteryStore.getState().rosterMastery(roster, 0)).toBe((25 + 37.5) / 2)
    expect(useMasteryStore.getState().rosterMastery([], 0)).toBe(0)
  })

  it('a new boss wipes the slate', () => {
    useMasteryStore.getState().recordPull(3, roster, mechanicCounts)
    useMasteryStore.getState().resetBoss()
    expect(useMasteryStore.getState().masteryOf('Slow Sam', 0)).toBe(0)
  })
})
