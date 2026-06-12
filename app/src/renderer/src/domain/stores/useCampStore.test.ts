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

// AC: camp actions write the chronicle (player-feedback spec)
describe('camp — chronicle entries', () => {
  it('rest logs who recovered and which stat', () => {
    useCampStore.getState().rest(heal) // skill 2 < discipline 4 → skill mended
    expect(chronicleTexts().some((t) => t.includes('Camp Heal') && t.includes('+1 Skill'))).toBe(
      true
    )
  })

  it('scout logs that outriders were sent', () => {
    useCampStore.getState().scout()
    expect(chronicleTexts().some((t) => t.toLowerCase().includes('outriders'))).toBe(true)
  })

  it('skirmish logs the claimed item and the bruise when one lands', () => {
    // rolls: item pick (0 → first common), bruise check (0 < 0.3 → bruise),
    // victim pick (0 → first member), stat pick (0 < 0.5 → skill)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useCampStore.getState().skirmish(roster)
    const texts = chronicleTexts()
    expect(texts.some((t) => t.includes('Skirmish'))).toBe(true)
    expect(texts.some((t) => t.includes('Camp Tank') && t.includes('bruised'))).toBe(true)
  })

  it('skirmish without a bruise logs no bruise line', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9) // bruise check 0.9 >= 0.3 → safe
    useCampStore.getState().skirmish(roster)
    expect(chronicleTexts().some((t) => t.includes('bruised'))).toBe(false)
  })
})

// AC: a night's care mends the spirit, not just the stat
describe('camp — rest morale', () => {
  it('rest restores +3 morale to the chosen member', () => {
    useMoraleStore.setState({ morale: { 'Camp Heal': 4 } })
    useCampStore.getState().rest(heal)
    expect(useMoraleStore.getState().moraleOf('Camp Heal')).toBe(7)
  })
})
