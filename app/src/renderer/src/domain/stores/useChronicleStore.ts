import { create } from 'zustand'

export type ChronicleKind = 'loot' | 'reaction' | 'camp' | 'battle' | 'system'

export interface ChronicleEntry {
  id: number
  kind: ChronicleKind
  text: string
}

interface ChronicleState {
  entries: ChronicleEntry[]

  log: (kind: ChronicleKind, text: string) => void
  reset: () => void
}

let nextId = 0

export const useChronicleStore = create<ChronicleState>((set) => ({
  entries: [],

  log: (kind, text) => {
    set((state) => ({ entries: [...state.entries, { id: ++nextId, kind, text }] }))
  },

  reset: () => set({ entries: [] })
}))
