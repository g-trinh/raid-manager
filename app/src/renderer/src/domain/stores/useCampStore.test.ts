import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMember, MemberData } from '../data/memberData'
import { Role } from '../data/role'
import { useCampStore } from './useCampStore'
import { useChronicleStore } from './useChronicleStore'
import { useLootStore } from './useLootStore'
import { useMoraleStore } from './useMoraleStore'
import { usePersonalityStore } from './usePersonalityStore'

const tank = createMember('Camp Tank', Role.TANK, 3, 3)
const heal = createMember('Camp Heal', Role.HEAL, 2, 4)
const roster: MemberData[] = [tank, heal]

function chronicleTexts(): string[] {
  return useChronicleStore.getState().entries.map((e) => e.text)
}

beforeEach(() => {
  useLootStore.getState().reset()
  useCampStore.getState().reset()
  useChronicleStore.getState().reset()
  useMoraleStore.getState().reset()
  usePersonalityStore.setState({ assignments: {} })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// AC: Rest patches the weaker stat, mends morale, once per pull interval
describe('table — rest', () => {
  it('rest logs who recovered, which stat, and restores +3 morale', () => {
    useMoraleStore.setState({ morale: { 'Camp Heal': 4 } })
    useCampStore.getState().rest(heal) // skill 2 < discipline 4 → skill mended
    expect(chronicleTexts().some((t) => t.includes('Camp Heal') && t.includes('+1 Skill'))).toBe(
      true
    )
    expect(useMoraleStore.getState().moraleOf('Camp Heal')).toBe(7)
  })

  it('rest is spent for the interval and a new pull opens it again', () => {
    expect(useCampStore.getState().restSpent).toBe(false)
    useCampStore.getState().rest(heal)
    expect(useCampStore.getState().restSpent).toBe(true)
    useCampStore.getState().newInterval()
    expect(useCampStore.getState().restSpent).toBe(false)
  })
})

describe('road mode — scout', () => {
  it('scout logs that outriders were sent and is consumed on the boss pick', () => {
    useCampStore.getState().scout()
    expect(chronicleTexts().some((t) => t.toLowerCase().includes('outriders'))).toBe(true)
    expect(useCampStore.getState().scouted).toBe(true)
    useCampStore.getState().consumeScout()
    expect(useCampStore.getState().scouted).toBe(false)
  })
})

// AC: trash guards the road — sweep it for a common drop, or march past
describe('road encounter', () => {
  it('clear wide logs the claimed item and the bruise when one lands', () => {
    // rolls: item pick (0 → first common), bruise check (0 < 0.3 → bruise),
    // victim pick (0 → first member), stat pick (0 < 0.5 → skill)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useCampStore.getState().clearWide(roster)
    const texts = chronicleTexts()
    expect(texts.some((t) => t.includes('cleared wide'))).toBe(true)
    expect(texts.some((t) => t.includes('Camp Tank') && t.includes('bruised'))).toBe(true)
  })

  it('clear wide without a bruise logs no bruise line', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9) // bruise check 0.9 >= 0.3 → safe
    useCampStore.getState().clearWide(roster)
    expect(chronicleTexts().some((t) => t.includes('bruised'))).toBe(false)
  })

  it('march past restores +1 morale to the whole muster', () => {
    useMoraleStore.setState({ morale: { 'Camp Tank': 5, 'Camp Heal': 9 } })
    useCampStore.getState().marchPast(roster)
    expect(useMoraleStore.getState().moraleOf('Camp Tank')).toBe(6)
    expect(useMoraleStore.getState().moraleOf('Camp Heal')).toBe(10)
    expect(chronicleTexts().some((t) => t.includes('marches past'))).toBe(true)
  })
})
