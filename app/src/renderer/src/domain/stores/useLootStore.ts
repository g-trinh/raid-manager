import { create } from 'zustand'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'

type StatKey = 'skill' | 'liability'
type StatBonus = Record<StatKey, number>

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
  bestow: (item: LootItemData, member: MemberData) => void
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

  bestow: (item, member) => {
    const { bonuses, equippedBy } = get()
    const current = bonuses[member.memberName] ?? { skill: 0, liability: 0 }
    const worn = equippedBy[member.memberName] ?? []

    set({
      bonuses: {
        ...bonuses,
        [member.memberName]: {
          skill: current.skill + item.skillBonus,
          liability: current.liability + item.liabilityBonus
        }
      },
      equippedBy: { ...equippedBy, [member.memberName]: [...worn, item] }
    })
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
