import { create } from 'zustand'
import { memberPool } from '../data/gameData'
import { MemberData } from '../data/memberData'
import { Role } from '../data/role'

export const ROLE_CAPS: Record<Role, number> = {
  [Role.TANK]: 2,
  [Role.HEAL]: 2,
  [Role.DPS]: 4
}
export const TEAM_SIZE = 8
export const CANDIDATES_PER_ROUND = 3

interface DraftState {
  selectedMembers: MemberData[]
  currentCandidates: MemberData[]

  addMember: (member: MemberData) => boolean
  isDraftComplete: () => boolean
  getRoleCount: (role: Role) => number
  isRoleFull: (role: Role) => boolean
  getAvailableMembers: () => MemberData[]
  drawCandidates: () => void
  reset: () => void
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const useDraftStore = create<DraftState>((set, get) => ({
  selectedMembers: [],
  currentCandidates: [],

  addMember: (member) => {
    const state = get()
    if (state.isRoleFull(member.role)) return false

    const selectedMembers = [...state.selectedMembers, member]
    set({ selectedMembers })

    if (selectedMembers.length === TEAM_SIZE) {
      set({ currentCandidates: [] })
    } else {
      get().drawCandidates()
    }
    return true
  },

  isDraftComplete: () => get().selectedMembers.length === TEAM_SIZE,

  getRoleCount: (role) => get().selectedMembers.filter((m) => m.role === role).length,

  isRoleFull: (role) => get().getRoleCount(role) >= ROLE_CAPS[role],

  getAvailableMembers: () => {
    const { selectedMembers, isRoleFull } = get()
    return memberPool.filter(
      (member) => !selectedMembers.includes(member) && !isRoleFull(member.role)
    )
  },

  drawCandidates: () => {
    const available = shuffle(get().getAvailableMembers())
    const count = Math.min(CANDIDATES_PER_ROUND, available.length)
    set({ currentCandidates: available.slice(0, count) })
  },

  reset: () => {
    set({ selectedMembers: [] })
    get().drawCandidates()
  }
}))

// Mirrors DraftState._ready(): draw the first round on load.
useDraftStore.getState().drawCandidates()
