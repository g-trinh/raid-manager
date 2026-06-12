import { afterEach, describe, expect, it, vi } from 'vitest'
import { Personality, rollPersonality } from './personality'

afterEach(() => {
  vi.restoreAllMocks()
})

function rollAt(value: number): Personality {
  vi.spyOn(Math, 'random').mockReturnValue(value)
  return rollPersonality()
}

// AC: personalities roll at 80% Loner / 10% Altruist / 10% Glory Hound (personalities.md)
describe('rollPersonality — 80/10/10 weights', () => {
  it('rolls altruist on the bottom 10% of the range', () => {
    expect(rollAt(0)).toBe(Personality.ALTRUIST)
    expect(rollAt(0.099)).toBe(Personality.ALTRUIST)
  })

  it('rolls glory hound on the next 10% of the range', () => {
    expect(rollAt(0.1)).toBe(Personality.GLORY_HOUND)
    expect(rollAt(0.199)).toBe(Personality.GLORY_HOUND)
  })

  it('rolls loner on the remaining 80% of the range', () => {
    expect(rollAt(0.2)).toBe(Personality.LONER)
    expect(rollAt(0.5)).toBe(Personality.LONER)
    expect(rollAt(0.999)).toBe(Personality.LONER)
  })
})
