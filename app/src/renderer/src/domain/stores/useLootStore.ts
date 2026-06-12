import { create } from 'zustand'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { usePersonalityStore } from './usePersonalityStore'

type StatKey = 'skill' | 'discipline'
type StatBonus = Record<StatKey, number>

export interface BestowResult {
  applied: Record<string, StatBonus>
  recipient: string
}

export type RingType = 'white' | 'trait' | 'gradient'

function clampStat(value: number): number {
  return Math.max(0, Math.min(5, value))
}

interface LootState {
  bonuses: Record<string, StatBonus>
  equippedBy: Record<string, LootItemData[]>
  satchel: LootItemData[]
  discarded: LootItemData[]

  effectiveStat: (member: MemberData, key: StatKey) => number
  effectiveRoster: (members: MemberData[]) => MemberData[]
  projectedStat: (member: MemberData, item: LootItemData, key: StatKey) => number
  applyDelta: (memberName: string, skill: number, discipline: number) => void
  previewRings: (member: MemberData, roster: MemberData[]) => Record<string, RingType>
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
      discipline: effectiveStat(member, 'discipline')
    }))
  },

  projectedStat: (member, item, key) => {
    const bonus = key === 'skill' ? item.skillBonus : item.disciplineBonus
    return clampStat(get().effectiveStat(member, key) + bonus)
  },

  // Permanent stat delta outside the loot flow (camp rest, skirmish bruises).
  applyDelta: (memberName, skill, discipline) => {
    set((state) => {
      const cur = state.bonuses[memberName] ?? { skill: 0, discipline: 0 }
      return {
        bonuses: {
          ...state.bonuses,
          [memberName]: { skill: cur.skill + skill, discipline: cur.discipline + discipline }
        }
      }
    })
  },

  // Which members a grant to `member` would touch, and how to ring each one.
  // Mirrors bestow()'s trait rules exactly (no stats are mutated):
  //   - recipient            -> 'white'  (they receive the item)
  //   - recipient is GH      -> 'gradient' (white + their own crimson trait,
  //                              a Glory Hound also basking in own loot)
  //   - other Altruist       -> 'trait'  (reacts to any grant)
  //   - other same-role GH   -> 'trait'  (sulks only when a role rival is geared)
  //   - Loners / unaffected  -> no ring
  previewRings: (member, roster) => {
    const { personalityOf } = usePersonalityStore.getState()
    const recipientPersonality = personalityOf(member.memberName)
    const rings: Record<string, RingType> = {}
    rings[member.memberName] =
      recipientPersonality === Personality.GLORY_HOUND ? 'gradient' : 'white'

    for (const bystander of roster) {
      if (bystander.memberName === member.memberName) continue
      const bp = personalityOf(bystander.memberName)
      if (
        bp === Personality.ALTRUIST ||
        (bp === Personality.GLORY_HOUND && bystander.role === member.role)
      ) {
        rings[bystander.memberName] = 'trait'
      }
    }
    return rings
  },

  bestow: (item, member, roster) => {
    const { bonuses, equippedBy } = get()
    const { personalityOf } = usePersonalityStore.getState()

    const recipientPersonality = personalityOf(member.memberName)
    const updated: Record<string, StatBonus> = { ...bonuses }

    const addDelta = (name: string, skill: number, discipline: number): void => {
      const cur = updated[name] ?? { skill: 0, discipline: 0 }
      updated[name] = { skill: cur.skill + skill, discipline: cur.discipline + discipline }
    }

    // Item bonus to recipient
    addDelta(member.memberName, item.skillBonus, item.disciplineBonus)

    // Recipient personality — Glory Hound basks
    if (recipientPersonality === Personality.GLORY_HOUND) {
      addDelta(member.memberName, 1, 0)
    }

    // Bystander reactions
    for (const bystander of roster) {
      if (bystander.memberName === member.memberName) continue
      const bp = personalityOf(bystander.memberName)
      if (bp === Personality.ALTRUIST) {
        addDelta(bystander.memberName, recipientPersonality === Personality.GLORY_HOUND ? -1 : 0, 1)
      } else if (bp === Personality.GLORY_HOUND && bystander.role === member.role) {
        // Sulks only when a rival of their own role is geared instead of them
        addDelta(bystander.memberName, 0, -1)
      }
    }

    // Compute actual applied delta = new effective − old effective (post-clamp)
    const applied: Record<string, StatBonus> = {}
    const memberByName = Object.fromEntries(roster.map((m) => [m.memberName, m]))
    for (const name of Object.keys(updated)) {
      const base = memberByName[name]
      if (!base) continue
      const prevBonus = bonuses[name] ?? { skill: 0, discipline: 0 }
      const newBonus = updated[name]
      const prevS = clampStat(base.skill + prevBonus.skill)
      const prevD = clampStat(base.discipline + prevBonus.discipline)
      const newS = clampStat(base.skill + newBonus.skill)
      const newD = clampStat(base.discipline + newBonus.discipline)
      const ds = newS - prevS
      const dd = newD - prevD
      if (ds !== 0 || dd !== 0) {
        applied[name] = { skill: ds, discipline: dd }
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
