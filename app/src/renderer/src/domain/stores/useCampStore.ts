import { create } from 'zustand'
import { commonLootPool } from '../data/gameData'
import { LootItemData } from '../data/lootData'
import { MemberData } from '../data/memberData'
import { useChronicleStore } from './useChronicleStore'
import { useLootStore } from './useLootStore'
import { useMoraleStore } from './useMoraleStore'

// War-table and road actions: Rest between pulls, Scout in road mode, and the
// road encounter (Clear wide / March past) on the way to a new boss.

export interface RestResult {
  memberName: string
  stat: 'skill' | 'discipline'
}

export interface Bruise {
  memberName: string
  stat: 'skill' | 'discipline'
}

export interface RoadClearResult {
  item: LootItemData
  bruise: Bruise | null
}

const BRUISE_CHANCE = 0.3
const MARCH_MORALE = 1

const STAT_LABEL = { skill: 'Skill', discipline: 'Discipline' } as const

interface CampState {
  // Rest is available once per pull interval; pull() opens the next interval
  restSpent: boolean
  // True until the next boss is picked — gates the road-mode forecasts
  scouted: boolean
  roadClearResult: RoadClearResult | null

  rest: (member: MemberData) => RestResult
  scout: () => void
  clearWide: (roster: MemberData[]) => RoadClearResult
  marchPast: (roster: MemberData[]) => void
  newInterval: () => void
  consumeScout: () => void
  reset: () => void
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// The same common item can drop on several roads — each drop is its own
// instance so satchel/resolution bookkeeping (keyed by id) never collides.
let dropCounter = 0

export const useCampStore = create<CampState>((set) => ({
  restSpent: false,
  scouted: false,
  roadClearResult: null,

  rest: (member) => {
    const { effectiveStat, applyDelta } = useLootStore.getState()
    const skill = effectiveStat(member, 'skill')
    const discipline = effectiveStat(member, 'discipline')
    // Patch the weaker stat; on a tie, Discipline
    const stat: RestResult['stat'] = skill < discipline ? 'skill' : 'discipline'
    applyDelta(member.memberName, stat === 'skill' ? 1 : 0, stat === 'discipline' ? 1 : 0)
    // A night's care also mends the spirit
    useMoraleStore.getState().restore(member.memberName, 3)

    const result: RestResult = { memberName: member.memberName, stat }
    useChronicleStore
      .getState()
      .log('camp', `Rest — ${member.memberName} recovers: +1 ${STAT_LABEL[stat]}, +3 morale`)
    set({ restSpent: true })
    return result
  },

  scout: () => {
    useChronicleStore
      .getState()
      .log('camp', 'Outriders sent — the next foes will be fully forecast')
    set({ scouted: true })
  },

  clearWide: (roster) => {
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
    log('camp', `The road cleared wide — 「${item.name}」 claimed from the packs`)
    if (bruise) {
      log('camp', `${bruise.memberName} bruised on the road — −1 ${STAT_LABEL[bruise.stat]}`)
    }

    const result: RoadClearResult = { item, bruise }
    set({ roadClearResult: result })
    return result
  },

  marchPast: (roster) => {
    const morale = useMoraleStore.getState()
    for (const member of roster) {
      morale.restore(member.memberName, MARCH_MORALE)
    }
    useChronicleStore
      .getState()
      .log('camp', `The muster marches past the packs — fresh legs (+${MARCH_MORALE} morale)`)
    set({ roadClearResult: null })
  },

  newInterval: () => {
    set({ restSpent: false, roadClearResult: null })
  },

  consumeScout: () => {
    set({ scouted: false })
  },

  reset: () => {
    set({ restSpent: false, scouted: false, roadClearResult: null })
  }
}))
