import { create } from 'zustand'
import { memberPool } from '../data/gameData'
import { MemberData } from '../data/memberData'
import { Personality, rollPersonality } from '../data/personality'

interface PersonalityState {
  assignments: Record<string, Personality>

  rollForRoster: (members: MemberData[]) => void
  personalityOf: (memberName: string) => Personality
  reset: () => void
}

export const usePersonalityStore = create<PersonalityState>((set, get) => ({
  assignments: {},

  rollForRoster: (members) => {
    const assignments: Record<string, Personality> = {}
    for (const member of members) {
      assignments[member.memberName] = rollPersonality()
    }
    set({ assignments })
  },

  personalityOf: (memberName) => {
    return get().assignments[memberName] ?? Personality.LONER
  },

  reset: () => set({ assignments: {} })
}))

usePersonalityStore.getState().rollForRoster(memberPool)
