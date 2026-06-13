import { describe, expect, it } from 'vitest'
import { masteryBand } from './mastery'

// AC: band labels double as narrative feedback
describe('masteryBand', () => {
  it('maps the four bands', () => {
    expect(masteryBand(0)).toBe('Learning the mechanics')
    expect(masteryBand(24.9)).toBe('Learning the mechanics')
    expect(masteryBand(25)).toBe('Learning the dance')
    expect(masteryBand(79.9)).toBe('Learning the dance')
    expect(masteryBand(80)).toBe('Polishing')
    expect(masteryBand(99.9)).toBe('Polishing')
    expect(masteryBand(100)).toBe('On farm')
  })
})
