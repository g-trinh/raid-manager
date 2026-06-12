import { create } from 'zustand'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { Personality } from '../data/personality'
import { useChronicleStore } from './useChronicleStore'
import { useMoraleStore } from './useMoraleStore'
import { usePersonalityStore } from './usePersonalityStore'

type StatKey = 'skill' | 'discipline'
type StatBonus = Record<StatKey, number>

export type ReactionReason = 'basks' | 'heartened' | 'resents' | 'sulks'

export interface GrantReaction {
  memberName: string
  skill: number
  discipline: number
  reason: ReactionReason
}

export interface BestowResult {
  applied: Record<string, StatBonus>
  // Per-stat flags for intended deltas fully swallowed by the [0, 5] clamp
  capped: Record<string, Record<StatKey, boolean>>
  // Personality reactions the grant triggered (intent, before clamping)
  reactions: GrantReaction[]
  recipient: string
}

export type RingType = 'white' | 'trait' | 'gradient'

function clampStat(value: number): number {
  return Math.max(0, Math.min(5, value))
}

// The personality reactions a grant to `recipient` triggers — intent only, no clamping.
// Single source of truth shared by bestow(), previewRings() and previewReactions().
function grantReactions(recipient: MemberData, roster: MemberData[]): GrantReaction[] {
  const { personalityOf } = usePersonalityStore.getState()
  const recipientPersonality = personalityOf(recipient.memberName)
  const reactions: GrantReaction[] = []

  if (recipientPersonality === Personality.GLORY_HOUND) {
    reactions.push({ memberName: recipient.memberName, skill: 1, discipline: 0, reason: 'basks' })
  }

  for (const bystander of roster) {
    if (bystander.memberName === recipient.memberName) continue
    const personality = personalityOf(bystander.memberName)
    if (personality === Personality.ALTRUIST) {
      reactions.push({
        memberName: bystander.memberName,
        skill: 0,
        discipline: 1,
        reason: 'heartened'
      })
      if (recipientPersonality === Personality.GLORY_HOUND) {
        reactions.push({
          memberName: bystander.memberName,
          skill: -1,
          discipline: 0,
          reason: 'resents'
        })
      }
    } else if (personality === Personality.GLORY_HOUND && bystander.role === recipient.role) {
      // Sulks only when a rival of their own role is geared instead of them
      reactions.push({
        memberName: bystander.memberName,
        skill: 0,
        discipline: -1,
        reason: 'sulks'
      })
    }
  }
  return reactions
}

const REASON_TEXT: Record<ReactionReason, string> = {
  basks: 'basks in the recognition',
  heartened: 'is heartened',
  resents: 'resents the Glory Hound',
  sulks: 'sulks at being passed over'
}

function deltaText(skill: number, discipline: number): string {
  const parts: string[] = []
  if (skill !== 0) parts.push(`${skill > 0 ? '+' : '−'}${Math.abs(skill)} Skill`)
  if (discipline !== 0)
    parts.push(`${discipline > 0 ? '+' : '−'}${Math.abs(discipline)} Discipline`)
  return parts.join(' · ')
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
  previewReactions: (item: LootItemData, member: MemberData, roster: MemberData[]) => string[]
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

  // Which members a grant to `member` would touch, and how to ring each one:
  //   - recipient            -> 'white'  (they receive the item)
  //   - recipient is GH      -> 'gradient' (white + their own crimson trait,
  //                              a Glory Hound also basking in own loot)
  //   - reacting bystander   -> 'trait'
  previewRings: (member, roster) => {
    const { personalityOf } = usePersonalityStore.getState()
    const rings: Record<string, RingType> = {}
    rings[member.memberName] =
      personalityOf(member.memberName) === Personality.GLORY_HOUND ? 'gradient' : 'white'

    for (const reaction of grantReactions(member, roster)) {
      if (reaction.memberName !== member.memberName) rings[reaction.memberName] = 'trait'
    }
    return rings
  },

  // Human-readable consequence lines for the picker hover hint. Mirrors bestow(),
  // including "at peak" when the clamp would swallow the whole reaction.
  previewReactions: (_item, member, roster) => {
    const { effectiveStat } = get()
    return grantReactions(member, roster).map((reaction) => {
      const target = roster.find((m) => m.memberName === reaction.memberName)
      const key: StatKey = reaction.skill !== 0 ? 'skill' : 'discipline'
      const delta = reaction.skill !== 0 ? reaction.skill : reaction.discipline
      const current = target ? effectiveStat(target, key) : 0
      const blocked = delta > 0 ? current >= 5 : current <= 0
      const effect = blocked
        ? 'already at peak — no change'
        : deltaText(reaction.skill, reaction.discipline)
      return `${reaction.memberName} ${REASON_TEXT[reaction.reason]} — ${effect}`
    })
  },

  bestow: (item, member, roster) => {
    const { bonuses, equippedBy } = get()
    const updated: Record<string, StatBonus> = { ...bonuses }

    const addDelta = (name: string, skill: number, discipline: number): void => {
      const cur = updated[name] ?? { skill: 0, discipline: 0 }
      updated[name] = { skill: cur.skill + skill, discipline: cur.discipline + discipline }
    }

    // Item bonus to recipient, then personality reactions
    addDelta(member.memberName, item.skillBonus, item.disciplineBonus)
    const reactions = grantReactions(member, roster)
    for (const reaction of reactions) {
      addDelta(reaction.memberName, reaction.skill, reaction.discipline)
    }

    // Intended total per member (item + reactions), to detect clamp-swallowed intent
    const intended: Record<string, StatBonus> = {}
    intended[member.memberName] = { skill: item.skillBonus, discipline: item.disciplineBonus }
    for (const reaction of reactions) {
      const cur = intended[reaction.memberName] ?? { skill: 0, discipline: 0 }
      intended[reaction.memberName] = {
        skill: cur.skill + reaction.skill,
        discipline: cur.discipline + reaction.discipline
      }
    }

    // Actual applied delta = new effective − old effective (post-clamp)
    const applied: Record<string, StatBonus> = {}
    const capped: Record<string, Record<StatKey, boolean>> = {}
    const memberByName = Object.fromEntries(roster.map((m) => [m.memberName, m]))
    for (const name of Object.keys(updated)) {
      const base = memberByName[name]
      if (!base) continue
      const prevBonus = bonuses[name] ?? { skill: 0, discipline: 0 }
      const newBonus = updated[name]
      const ds = clampStat(base.skill + newBonus.skill) - clampStat(base.skill + prevBonus.skill)
      const dd =
        clampStat(base.discipline + newBonus.discipline) -
        clampStat(base.discipline + prevBonus.discipline)
      if (ds !== 0 || dd !== 0) {
        applied[name] = { skill: ds, discipline: dd }
      }
      const intent = intended[name]
      if (intent) {
        const skillCapped = intent.skill !== 0 && ds === 0
        const disciplineCapped = intent.discipline !== 0 && dd === 0
        if (skillCapped || disciplineCapped) {
          capped[name] = { skill: skillCapped, discipline: disciplineCapped }
        }
      }
    }

    set({
      bonuses: updated,
      equippedBy: {
        ...equippedBy,
        [member.memberName]: [...(equippedBy[member.memberName] ?? []), item]
      }
    })

    // Being geared keeps people in the guild — rare loot more than commons
    const moraleGain = item.rarity === 'rare' ? 2 : 1
    useMoraleStore.getState().restore(member.memberName, moraleGain)

    // Chronicle: the grant, every reaction (capped ones included), or the silence
    const { log } = useChronicleStore.getState()
    const grantDelta = deltaText(item.skillBonus, item.disciplineBonus)
    log('loot', `「${item.name}」 bestowed upon ${member.memberName} (${grantDelta})`)
    log('morale', `${member.memberName} takes heart (+${moraleGain} morale)`)
    for (const reaction of reactions) {
      const wasCapped =
        (reaction.skill !== 0 && capped[reaction.memberName]?.skill) ||
        (reaction.discipline !== 0 && capped[reaction.memberName]?.discipline)
      const effect = wasCapped
        ? 'already at peak — no change'
        : deltaText(reaction.skill, reaction.discipline)
      log('reaction', `${reaction.memberName} ${REASON_TEXT[reaction.reason]} — ${effect}`)
    }
    if (reactions.length === 0) {
      log('reaction', "The muster doesn't react.")
    }

    return { applied, capped, reactions, recipient: member.memberName }
  },

  bench: (item) => {
    useChronicleStore.getState().log('loot', `「${item.name}」 stowed in the satchel`)
    set((state) => ({ satchel: [...state.satchel, item] }))
  },

  discard: (item) => {
    useChronicleStore.getState().log('loot', `「${item.name}」 cast aside, lost to the dark`)
    set((state) => ({ discarded: [...state.discarded, item] }))
  },

  reset: () => {
    set({ bonuses: {}, equippedBy: {}, satchel: [], discarded: [] })
  }
}))
