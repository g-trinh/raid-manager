import { create } from 'zustand'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { usePersonalityStore } from './usePersonalityStore'

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
  bestow: (item: LootItemData, member: MemberData, roster: MemberData[]) => void
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

    // Apply item bonus to recipient
    const recipientBonus = updated[member.memberName] ?? { skill: 0, liability: 0 }
    updated[member.memberName] = {
      skill: recipientBonus.skill + item.skillBonus,
      liability: recipientBonus.liability + item.liabilityBonus
    }

    // Recipient personality reaction
    if (recipientPersonality === Personality.GLORY_HOUND) {
      updated[member.memberName] = {
        skill: updated[member.memberName].skill + 10,
        liability: updated[member.memberName].liability
      }
    }

    // Bystander reactions
    for (const bystander of roster) {
      if (bystander.memberName === member.memberName) continue
      const bystanderPersonality = personalityOf(bystander.memberName)
      const bystanderBonus = updated[bystander.memberName] ?? { skill: 0, liability: 0 }

      if (bystanderPersonality === Personality.ALTRUIST) {
        // Happy someone got gear
        let skillDelta = 0
        let liabilityDelta = 10
        // But resents if that someone is a Glory Hound
        if (recipientPersonality === Personality.GLORY_HOUND) {
          skillDelta = -10
        }
        updated[bystander.memberName] = {
          skill: bystanderBonus.skill + skillDelta,
          liability: bystanderBonus.liability + liabilityDelta
        }
      } else if (bystanderPersonality === Personality.GLORY_HOUND) {
        // Sulks at being passed over
        updated[bystander.memberName] = {
          skill: bystanderBonus.skill,
          liability: bystanderBonus.liability - 10
        }
      }
    }

    set({
      bonuses: updated,
      equippedBy: { ...equippedBy, [member.memberName]: [...(equippedBy[member.memberName] ?? []), item] }
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
