import { afterEach, describe, expect, it, vi } from 'vitest'
import { Personality, rollPersonality } from './personality'

afterEach(() => {
  vi.restoreAllMocks()
})

function rollAt(value: number): Personality {
  vi.spyOn(Math, 'random').mockReturnValue(value)
  return rollPersonality()
}

// AC: personalities roll at 75% Loner / 12.5% Altruist / 12.5% Glory Hound (personalities.md)
describe('rollPersonality — 75/12.5/12.5 weights', () => {
  it('rolls altruist on the bottom 12.5% of the range', () => {
    expect(rollAt(0)).toBe(Personality.ALTRUIST)
    expect(rollAt(0.124)).toBe(Personality.ALTRUIST)
  })

  it('rolls glory hound on the next 12.5% of the range', () => {
    expect(rollAt(0.125)).toBe(Personality.GLORY_HOUND)
    expect(rollAt(0.249)).toBe(Personality.GLORY_HOUND)
  })

  it('rolls loner on the remaining 75% of the range', () => {
    expect(rollAt(0.25)).toBe(Personality.LONER)
    expect(rollAt(0.5)).toBe(Personality.LONER)
    expect(rollAt(0.999)).toBe(Personality.LONER)
  })
})
