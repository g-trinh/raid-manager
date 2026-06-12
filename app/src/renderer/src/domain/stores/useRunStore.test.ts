import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { memberPool } from '../data/gameData'
import { useChronicleStore } from './useChronicleStore'
import { useDraftStore } from './useDraftStore'
import { useLootStore } from './useLootStore'
import { useRunStore } from './useRunStore'

function chronicleTexts(): string[] {
  return useChronicleStore.getState().entries.map((e) => e.text)
}

// A legal full roster: 2 tanks, 2 heals, 4 dps from the hardcoded pool
function fullRoster(): typeof memberPool {
  const byRole = (role: string, n: number): typeof memberPool =>
    memberPool.filter((m) => m.role === role).slice(0, n)
  return [...byRole('TANK', 2), ...byRole('HEAL', 2), ...byRole('DPS', 4)]
}

beforeEach(() => {
  useLootStore.getState().reset()
  useChronicleStore.getState().reset()
  useDraftStore.setState({ selectedMembers: fullRoster() })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// AC: the attempt writes the chronicle — each phase result and the outcome
describe('run — chronicle entries', () => {
  it('resolve logs three phase results, the outcome, and the drops on full victory', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // every phase roll succeeds
    useRunStore.getState().resolve()
    const texts = chronicleTexts()
    expect(texts.filter((t) => t.includes('Held')).length).toBe(3)
    expect(texts.some((t) => t.includes('Full Victory'))).toBe(true)
    expect(texts.some((t) => t.includes('signature item'))).toBe(true)
  })

  it('resolve logs broken phases and defeat without a drop line', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999) // every phase roll fails
    useRunStore.getState().resolve()
    const texts = chronicleTexts()
    expect(texts.filter((t) => t.includes('Broke')).length).toBe(3)
    expect(texts.some((t) => t.includes('Defeat'))).toBe(true)
    expect(texts.some((t) => t.includes('signature item'))).toBe(false)
  })

  it('reset clears the chronicle', () => {
    useChronicleStore.getState().log('system', 'stale')
    useRunStore.getState().reset()
    expect(useChronicleStore.getState().entries).toEqual([])
  })
})

// AC: phase results carry their score so the outcome screen can explain failures
describe('run — phase result score', () => {
  it('each phase result exposes the projected score', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useRunStore.getState().resolve()
    for (const result of useRunStore.getState().phaseResults) {
      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThan(0)
    }
  })
})
