import { beforeEach, describe, expect, it } from 'vitest'
import { createMember } from '../data/memberData'
import { Personality } from '../data/personality'
import { Role } from '../data/role'
import { useChronicleStore } from './useChronicleStore'
import { grievanceFor, useMoraleStore } from './useMoraleStore'
import { usePersonalityStore } from './usePersonalityStore'

const blunderer = createMember('Butterfingers', Role.DPS, 1, 1)
const loner = createMember('Stone Face', Role.TANK, 3, 3)
const altruist = createMember('Soft Heart', Role.HEAL, 3, 3)
const gloryHound = createMember('Big Ego', Role.DPS, 3, 3)
const roster = [blunderer, loner, altruist, gloryHound]

function setPersonalities(): void {
  usePersonalityStore.setState({
    assignments: {
      Butterfingers: Personality.LONER,
      'Stone Face': Personality.LONER,
      'Soft Heart': Personality.ALTRUIST,
      'Big Ego': Personality.GLORY_HOUND
    }
  })
}

function recordFumbles(name: string, count: number): void {
  for (let i = 0; i < count; i++) useMoraleStore.getState().recordFumble(name)
}

beforeEach(() => {
  useMoraleStore.getState().reset()
  useChronicleStore.getState().reset()
  setPersonalities()
})

// AC: the Nth cumulative fumble escalates exponentially — first ones forgiven
describe('morale — grievance table', () => {
  it('escalates 0/0/1/2/4 and caps at 6', () => {
    expect(grievanceFor(0)).toBe(0)
    expect(grievanceFor(1)).toBe(0)
    expect(grievanceFor(2)).toBe(1)
    expect(grievanceFor(3)).toBe(2)
    expect(grievanceFor(4)).toBe(4)
    expect(grievanceFor(5)).toBe(6)
    expect(grievanceFor(99)).toBe(6)
  })
})

// AC: wipe depth sets the base loss — a close pull keeps hope
describe('morale — applyWipe base loss', () => {
  it('phase I wipe costs 2, phase II costs 1, phase III costs nothing', () => {
    const { applyWipe, moraleOf } = useMoraleStore.getState()
    applyWipe(0, null, [loner])
    expect(moraleOf('Stone Face')).toBe(8)
    applyWipe(1, null, [loner])
    expect(moraleOf('Stone Face')).toBe(7)
    applyWipe(2, null, [loner])
    expect(moraleOf('Stone Face')).toBe(7)
  })

  it('a Glory Hound loses 1 extra on every wipe — a lootless pull stings', () => {
    useMoraleStore.getState().applyWipe(2, null, roster)
    expect(useMoraleStore.getState().moraleOf('Big Ego')).toBe(9)
    expect(useMoraleStore.getState().moraleOf('Stone Face')).toBe(10)
  })
})

// AC: a blunder-attributed wipe charges the lethal fumbler's grievance to the
// roster — except the fumbler, modulated by personality
describe('morale — blunder grievance', () => {
  it('charges grievance to teammates, not the blunderer', () => {
    recordFumbles('Butterfingers', 4) // grievance 4
    useMoraleStore.getState().applyWipe(2, 'Butterfingers', [blunderer, gloryHound])
    // Glory Hound teammate: 4 grievance + 1 lootless; the blunderer walks free
    expect(useMoraleStore.getState().moraleOf('Big Ego')).toBe(5)
    expect(useMoraleStore.getState().moraleOf('Butterfingers')).toBe(10)
  })

  it('Altruists take half grievance, Glory Hounds the full hit plus their extra', () => {
    recordFumbles('Butterfingers', 4) // grievance 4
    usePersonalityStore.setState({
      assignments: {
        Butterfingers: Personality.GLORY_HOUND, // full grievance applies to others
        'Stone Face': Personality.LONER,
        'Soft Heart': Personality.ALTRUIST,
        'Big Ego': Personality.GLORY_HOUND
      }
    })
    useMoraleStore.getState().applyWipe(2, 'Butterfingers', roster)
    const { moraleOf } = useMoraleStore.getState()
    expect(moraleOf('Stone Face')).toBe(10) // Loner: immune
    expect(moraleOf('Soft Heart')).toBe(8) // half of 4
    expect(moraleOf('Big Ego')).toBe(5) // 4 grievance + 1 lootless
    expect(moraleOf('Butterfingers')).toBe(9) // own blunder forgiven, but GH −1
  })

  it('a first blunder is forgiven entirely', () => {
    recordFumbles('Butterfingers', 1)
    useMoraleStore.getState().applyWipe(2, 'Butterfingers', [blunderer, gloryHound])
    expect(useMoraleStore.getState().moraleOf('Big Ego')).toBe(9) // only the GH extra
  })
})

describe('morale — recovery, quits, warnings', () => {
  it('a kill restores +3 to everyone, clamped at 10', () => {
    useMoraleStore.setState({ morale: { 'Stone Face': 4, 'Soft Heart': 9 } })
    useMoraleStore.getState().applyKill([loner, altruist])
    expect(useMoraleStore.getState().moraleOf('Stone Face')).toBe(7)
    expect(useMoraleStore.getState().moraleOf('Soft Heart')).toBe(10)
  })

  it('restore clamps at the max', () => {
    useMoraleStore.getState().restore('Stone Face', 99)
    expect(useMoraleStore.getState().moraleOf('Stone Face')).toBe(10)
  })

  it('quitterIn finds the member at zero', () => {
    expect(useMoraleStore.getState().quitterIn(roster)).toBeNull()
    useMoraleStore.setState({ morale: { 'Soft Heart': 0 } })
    expect(useMoraleStore.getState().quitterIn(roster)).toBe('Soft Heart')
  })

  it('chronicles a warning when a member crosses into near-breaking', () => {
    useMoraleStore.setState({ morale: { 'Stone Face': 4 } })
    useMoraleStore.getState().applyWipe(0, null, [loner])
    const texts = useChronicleStore.getState().entries.map((e) => e.text)
    expect(texts.some((t) => t.includes('Stone Face is near breaking'))).toBe(true)
  })
})
