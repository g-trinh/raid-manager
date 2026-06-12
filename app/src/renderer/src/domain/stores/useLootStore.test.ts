import { beforeEach, describe, expect, it } from 'vitest'
import { createCommonItem, createLootItem, LootItemData } from '../data/lootData'
import { createMember, MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { Role } from '../data/role'
import { useLootStore } from './useLootStore'
import { usePersonalityStore } from './usePersonalityStore'

// Roster: 2 tanks, 2 heals, 4 dps — mid stats so deltas never clamp unless intended
const tankA = createMember('Tank Alpha', Role.TANK, 3, 3)
const tankB = createMember('Tank Beta', Role.TANK, 3, 3)
const healA = createMember('Heal Alpha', Role.HEAL, 3, 3)
const healB = createMember('Heal Beta', Role.HEAL, 3, 3)
const dpsA = createMember('Dps Alpha', Role.DPS, 3, 3)
const dpsB = createMember('Dps Beta', Role.DPS, 3, 3)
const dpsC = createMember('Dps Gamma', Role.DPS, 3, 3)
const dpsD = createMember('Dps Delta', Role.DPS, 3, 3)

const roster: MemberData[] = [tankA, tankB, healA, healB, dpsA, dpsB, dpsC, dpsD]

const dpsItem: LootItemData = createLootItem(
  'test-dps-item',
  'Test Fang',
  'A test item.',
  Role.DPS,
  1,
  1,
  'Test Boss',
  1
)

const tankItem: LootItemData = createCommonItem(
  'test-tank-item',
  'Test Plate',
  'A common test item.',
  Role.TANK,
  1,
  0
)

function assignPersonalities(assignments: Record<string, Personality>): void {
  usePersonalityStore.setState({ assignments })
}

function stats(member: MemberData): { skill: number; discipline: number } {
  const { effectiveStat } = useLootStore.getState()
  return {
    skill: effectiveStat(member, 'skill'),
    discipline: effectiveStat(member, 'discipline')
  }
}

beforeEach(() => {
  useLootStore.getState().reset()
  usePersonalityStore.setState({ assignments: {} })
})

// AC: equipped items grant their bonuses to the wearer (loot.md)
describe('bestow — item bonus', () => {
  it('grants the item bonus to the recipient', () => {
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(dpsA)).toEqual({ skill: 4, discipline: 4 })
  })

  it('clamps the recipient stats at 5', () => {
    const maxed = createMember('Maxed', Role.DPS, 5, 5)
    useLootStore.getState().bestow(dpsItem, maxed, [...roster, maxed])
    expect(stats(maxed)).toEqual({ skill: 5, discipline: 5 })
  })
})

// AC: a Glory Hound gains +1 Skill when personally receiving loot (personalities.md)
describe('bestow — glory hound recipient', () => {
  it('glory hound gains +1 Skill on top of the item bonus when gifted loot', () => {
    assignPersonalities({ [dpsA.memberName]: Personality.GLORY_HOUND })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(dpsA)).toEqual({ skill: 5, discipline: 4 })
  })
})

// AC: a Glory Hound loses 1 Discipline when loot goes to a same-role member (personalities.md)
describe('bestow — glory hound bystander', () => {
  it('same-role glory hound loses 1 Discipline when a rival is geared', () => {
    assignPersonalities({ [dpsB.memberName]: Personality.GLORY_HOUND })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(dpsB)).toEqual({ skill: 3, discipline: 2 })
  })

  it('different-role glory hound is unaffected when another role is geared', () => {
    assignPersonalities({ [tankA.memberName]: Personality.GLORY_HOUND })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(tankA)).toEqual({ skill: 3, discipline: 3 })
  })
})

// AC: an Altruist gains +1 Discipline whenever another member is geared (personalities.md)
describe('bestow — altruist bystander', () => {
  it('altruist gains +1 Discipline when any other member is geared', () => {
    assignPersonalities({ [healA.memberName]: Personality.ALTRUIST })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(healA)).toEqual({ skill: 3, discipline: 4 })
  })

  it('altruist also loses 1 Skill when the recipient is a glory hound', () => {
    assignPersonalities({
      [healA.memberName]: Personality.ALTRUIST,
      [dpsA.memberName]: Personality.GLORY_HOUND
    })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(healA)).toEqual({ skill: 2, discipline: 4 })
  })

  it('altruist reacts to common loot grants too', () => {
    assignPersonalities({ [healA.memberName]: Personality.ALTRUIST })
    useLootStore.getState().bestow(tankItem, tankA, roster)
    expect(stats(healA)).toEqual({ skill: 3, discipline: 4 })
  })
})

// AC: a Loner reacts to nothing (personalities.md)
describe('bestow — loner bystander', () => {
  it('loner is unaffected by any grant', () => {
    assignPersonalities({ [dpsB.memberName]: Personality.LONER })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(stats(dpsB)).toEqual({ skill: 3, discipline: 3 })
  })
})

// AC: reactions stack across multiple grants (personalities.md)
describe('bestow — stacking', () => {
  it('altruist Discipline stacks across two grants and clamps at 5', () => {
    assignPersonalities({ [healA.memberName]: Personality.ALTRUIST })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    useLootStore.getState().bestow(tankItem, tankA, roster)
    useLootStore.getState().bestow(dpsItem, dpsB, roster)
    expect(stats(healA).discipline).toBe(5)
  })
})

// AC: bestow reports the applied deltas so the UI can display reactions
describe('bestow — applied report', () => {
  it('reports recipient and bystander deltas', () => {
    assignPersonalities({
      [healA.memberName]: Personality.ALTRUIST,
      [dpsB.memberName]: Personality.GLORY_HOUND
    })
    const result = useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(result.recipient).toBe(dpsA.memberName)
    expect(result.applied[dpsA.memberName]).toEqual({ skill: 1, discipline: 1 })
    expect(result.applied[healA.memberName]).toEqual({ skill: 0, discipline: 1 })
    expect(result.applied[dpsB.memberName]).toEqual({ skill: 0, discipline: -1 })
  })
})
