import { create } from 'zustand'
import { commonLootPool } from '../data/gameData'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { useChronicleStore } from './useChronicleStore'
import { useLootStore } from './useLootStore'

export type CampAction = 'rest' | 'scout' | 'skirmish'

export interface RestResult {
  memberName: string
  stat: 'skill' | 'discipline'
}

export interface Bruise {
  memberName: string
  stat: 'skill' | 'discipline'
}

export interface SkirmishResult {
  item: LootItemData
  bruise: Bruise | null
}

const BRUISE_CHANCE = 0.3

const STAT_LABEL = { skill: 'Skill', discipline: 'Discipline' } as const

interface CampState {
  // Action chosen at the current camp, null while undecided
  chosenAction: CampAction | null
  restResult: RestResult | null
  skirmishResult: SkirmishResult | null
  // True until the next boss is picked — gates the choice-screen forecasts
  scouted: boolean

  rest: (member: MemberData) => RestResult
  scout: () => void
  skirmish: (roster: MemberData[]) => SkirmishResult
  beginCamp: () => void
  consumeScout: () => void
  reset: () => void
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// The same common item can drop at several camps — each drop is its own instance
// so satchel/resolution bookkeeping (keyed by id) never collides.
let dropCounter = 0

export const useCampStore = create<CampState>((set) => ({
  chosenAction: null,
  restResult: null,
  skirmishResult: null,
  scouted: false,

  rest: (member) => {
    const { effectiveStat, applyDelta } = useLootStore.getState()
    const skill = effectiveStat(member, 'skill')
    const discipline = effectiveStat(member, 'discipline')
    // Patch the weaker stat; on a tie, Discipline
    const stat: RestResult['stat'] = skill < discipline ? 'skill' : 'discipline'
    applyDelta(member.memberName, stat === 'skill' ? 1 : 0, stat === 'discipline' ? 1 : 0)

    const result: RestResult = { memberName: member.memberName, stat }
    useChronicleStore
      .getState()
      .log('camp', `Rest — ${member.memberName} recovers: +1 ${STAT_LABEL[stat]}`)
    set({ chosenAction: 'rest', restResult: result })
    return result
  },

  scout: () => {
    useChronicleStore
      .getState()
      .log('camp', 'Outriders sent — the next foes will be fully forecast')
    set({ chosenAction: 'scout', scouted: true })
  },

  skirmish: (roster) => {
    const base = pick(commonLootPool)
    const item = { ...base, id: `${base.id}-${++dropCounter}` }

    let bruise: Bruise | null = null
    if (Math.random() < BRUISE_CHANCE) {
      const victim = pick(roster)
      const stat: Bruise['stat'] = Math.random() < 0.5 ? 'skill' : 'discipline'
      useLootStore
        .getState()
        .applyDelta(victim.memberName, stat === 'skill' ? -1 : 0, stat === 'discipline' ? -1 : 0)
      bruise = { memberName: victim.memberName, stat }
    }

    const { log } = useChronicleStore.getState()
    log('camp', `Skirmish won — 「${item.name}」 claimed from the warband`)
    if (bruise) {
      log('camp', `${bruise.memberName} bruised in the skirmish — −1 ${STAT_LABEL[bruise.stat]}`)
    }

    const result: SkirmishResult = { item, bruise }
    set({ chosenAction: 'skirmish', skirmishResult: result })
    return result
  },

  beginCamp: () => {
    set({ chosenAction: null, restResult: null, skirmishResult: null })
  },

  consumeScout: () => {
    set({ scouted: false })
  },

  reset: () => {
    set({ chosenAction: null, restResult: null, skirmishResult: null, scouted: false })
  }
}))
