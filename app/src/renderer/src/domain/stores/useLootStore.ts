import { create } from 'zustand'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { usePersonalityStore } from './usePersonalityStore'

type StatKey = 'skill' | 'liability'
type StatBonus = Record<StatKey, number>

export interface BestowResult {
  applied: Record<string, StatBonus>
  recipient: string
}

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value))
}

interface LootState {
  bonuses: Record<string, StatBonus>
  equippedBy: Record<string, LootItemData[]>
  satchel: LootItemData[]
  discarded: LootItemData[]

  effectiveStat: (member: MemberData, key: StatKey) => number
  effectiveRoster: (members: MemberData[]) => MemberData[]
  projectedStat: (member: MemberData, item: LootItemData, key: StatKey) => number
  bestow: (item: LootItemData, member: MemberData, roster: MemberData[]) => BestowResult
  bench: (item: LootItemData) => void
  discard: (item: LootItemData) => void
  reset: () => void
}

export const useLootStore = create<LootState>((set, get) => ({
  bonuses: {},
  equippedBy: {},
  satchel: [],
  discarded: [],

  effectiveStat: (member, key) => {
    const bonus = get().bonuses[member.memberName]
    return clampStat(member[key] + (bonus?.[key] ?? 0))
  },

  effectiveRoster: (members) => {
    const { effectiveStat } = get()
    return members.map((member) => ({
      ...member,
      skill: effectiveStat(member, 'skill'),
      liability: effectiveStat(member, 'liability')
    }))
  },

  projectedStat: (member, item, key) => {
    const bonus = key === 'skill' ? item.skillBonus : item.liabilityBonus
    return clampStat(get().effectiveStat(member, key) + bonus)
  },

  bestow: (item, member, roster) => {
    const { bonuses, equippedBy } = get()
    const { personalityOf } = usePersonalityStore.getState()

    const recipientPersonality = personalityOf(member.memberName)
    const updated: Record<string, StatBonus> = { ...bonuses }

    const addDelta = (name: string, skill: number, liability: number): void => {
      const cur = updated[name] ?? { skill: 0, liability: 0 }
      updated[name] = { skill: cur.skill + skill, liability: cur.liability + liability }
    }

    // Item bonus to recipient
    addDelta(member.memberName, item.skillBonus, item.liabilityBonus)

    // Recipient personality — Glory Hound basks
    if (recipientPersonality === Personality.GLORY_HOUND) {
      addDelta(member.memberName, 10, 0)
    }

    // Bystander reactions
    for (const bystander of roster) {
      if (bystander.memberName === member.memberName) continue
      const bp = personalityOf(bystander.memberName)
      if (bp === Personality.ALTRUIST) {
        addDelta(bystander.memberName, recipientPersonality === Personality.GLORY_HOUND ? -10 : 0, 10)
      } else if (bp === Personality.GLORY_HOUND) {
        addDelta(bystander.memberName, 0, -10)
      }
    }

    // Compute actual applied delta = new effective − old effective (post-clamp)
    const applied: Record<string, StatBonus> = {}
    const memberByName = Object.fromEntries(roster.map((m) => [m.memberName, m]))
    for (const name of Object.keys(updated)) {
      const base = memberByName[name]
      if (!base) continue
      const prevBonus = bonuses[name] ?? { skill: 0, liability: 0 }
      const newBonus = updated[name]
      const prevS = clampStat(base.skill + prevBonus.skill)
      const prevL = clampStat(base.liability + prevBonus.liability)
      const newS = clampStat(base.skill + newBonus.skill)
      const newL = clampStat(base.liability + newBonus.liability)
      const ds = newS - prevS
      const dl = newL - prevL
      if (ds !== 0 || dl !== 0) {
        applied[name] = { skill: ds, liability: dl }
      }
    }

    set({
      bonuses: updated,
      equippedBy: {
        ...equippedBy,
        [member.memberName]: [...(equippedBy[member.memberName] ?? []), item]
      }
    })

    return { applied, recipient: member.memberName }
  },

  bench: (item) => {
    set((state) => ({ satchel: [...state.satchel, item] }))
  },

  discard: (item) => {
    set((state) => ({ discarded: [...state.discarded, item] }))
  },

  reset: () => {
    set({ bonuses: {}, equippedBy: {}, satchel: [], discarded: [] })
  }
}))
