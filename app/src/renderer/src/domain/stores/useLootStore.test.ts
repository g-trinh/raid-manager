import { beforeEach, describe, expect, it } from 'vitest'
import { createCommonItem, createLootItem, LootItemData } from '../data/lootData'
import { createMember, MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { Role } from '../data/role'
import { useChronicleStore } from './useChronicleStore'
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
  useChronicleStore.getState().reset()
})

function chronicleTexts(): string[] {
  return useChronicleStore.getState().entries.map((e) => e.text)
}

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

// AC: a reaction swallowed by the stat clamp is still reported, flagged as capped
describe('bestow — capped reactions', () => {
  it('flags an altruist already at Discipline 5 as capped instead of silent', () => {
    const cappedAltruist = createMember('Capped Heal', Role.HEAL, 3, 5)
    const fullRoster = [...roster, cappedAltruist]
    assignPersonalities({ [cappedAltruist.memberName]: Personality.ALTRUIST })

    const result = useLootStore.getState().bestow(dpsItem, dpsA, fullRoster)

    expect(result.applied[cappedAltruist.memberName]).toBeUndefined()
    expect(result.capped[cappedAltruist.memberName]).toEqual({ skill: false, discipline: true })
  })

  it('does not flag members whose reaction fully applied', () => {
    assignPersonalities({ [healA.memberName]: Personality.ALTRUIST })
    const result = useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(result.capped[healA.memberName]).toBeUndefined()
  })
})

// AC: bestow lists the personality reactions it triggered (for hints and the chronicle)
describe('bestow — reactions report', () => {
  it('lists altruist and same-role glory hound reactions with their reasons', () => {
    assignPersonalities({
      [healA.memberName]: Personality.ALTRUIST,
      [dpsB.memberName]: Personality.GLORY_HOUND
    })
    const result = useLootStore.getState().bestow(dpsItem, dpsA, roster)
    const byName = Object.fromEntries(result.reactions.map((r) => [r.memberName, r]))
    expect(byName[healA.memberName]).toMatchObject({ discipline: 1, reason: 'heartened' })
    expect(byName[dpsB.memberName]).toMatchObject({ discipline: -1, reason: 'sulks' })
  })

  it('lists the glory hound recipient bask as a reaction', () => {
    assignPersonalities({ [dpsA.memberName]: Personality.GLORY_HOUND })
    const result = useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(result.reactions).toContainEqual(
      expect.objectContaining({ memberName: dpsA.memberName, skill: 1, reason: 'basks' })
    )
  })

  it('reports no reactions when the muster is all loners', () => {
    const result = useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(result.reactions).toEqual([])
  })
})

// AC: every grant writes the chronicle — including silent and capped ones
describe('bestow — chronicle entries', () => {
  it('logs the grant and each reaction', () => {
    assignPersonalities({ [healA.memberName]: Personality.ALTRUIST })
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    const texts = chronicleTexts()
    expect(texts.some((t) => t.includes('Test Fang') && t.includes(dpsA.memberName))).toBe(true)
    expect(texts.some((t) => t.includes(healA.memberName) && t.includes('+1 Discipline'))).toBe(
      true
    )
  })

  it('logs that the muster does not react when nobody is moved', () => {
    useLootStore.getState().bestow(dpsItem, dpsA, roster)
    expect(chronicleTexts().some((t) => t.includes("doesn't react"))).toBe(true)
  })

  it('logs a capped reaction as at peak', () => {
    const cappedAltruist = createMember('Capped Heal', Role.HEAL, 3, 5)
    assignPersonalities({ [cappedAltruist.memberName]: Personality.ALTRUIST })
    useLootStore.getState().bestow(dpsItem, dpsA, [...roster, cappedAltruist])
    expect(chronicleTexts().some((t) => t.includes('Capped Heal') && t.includes('at peak'))).toBe(
      true
    )
  })

  it('logs bench and discard', () => {
    useLootStore.getState().bench(dpsItem)
    useLootStore.getState().discard(tankItem)
    const texts = chronicleTexts()
    expect(texts.some((t) => t.includes('Test Fang') && t.includes('satchel'))).toBe(true)
    expect(texts.some((t) => t.includes('Test Plate') && t.includes('cast aside'))).toBe(true)
  })
})

// AC: hovering a member in the picker predicts the grant's consequences
describe('previewReactions', () => {
  it('predicts altruist and same-role glory hound reactions', () => {
    assignPersonalities({
      [healA.memberName]: Personality.ALTRUIST,
      [dpsB.memberName]: Personality.GLORY_HOUND
    })
    const lines = useLootStore.getState().previewReactions(dpsItem, dpsA, roster)
    expect(lines.some((l) => l.includes(healA.memberName) && l.includes('+1 Discipline'))).toBe(
      true
    )
    expect(lines.some((l) => l.includes(dpsB.memberName) && l.includes('−1 Discipline'))).toBe(true)
  })

  it('predicts an at-peak reaction for a capped altruist', () => {
    const cappedAltruist = createMember('Capped Heal', Role.HEAL, 3, 5)
    assignPersonalities({ [cappedAltruist.memberName]: Personality.ALTRUIST })
    const lines = useLootStore
      .getState()
      .previewReactions(dpsItem, dpsA, [...roster, cappedAltruist])
    expect(lines.some((l) => l.includes('Capped Heal') && l.includes('at peak'))).toBe(true)
  })

  it('returns no lines when nobody would react', () => {
    expect(useLootStore.getState().previewReactions(dpsItem, dpsA, roster)).toEqual([])
  })
})
