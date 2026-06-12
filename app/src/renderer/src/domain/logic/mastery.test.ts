import { describe, expect, it } from 'vitest'
import { createPhase, PhaseType } from '../data/bossPhaseData'
import { masteryBand, masteryGain } from './mastery'

// AC: the learning curve is an S — fast discovery, slow dance, quick polish
describe('masteryGain — banded S-curve', () => {
  it('discovery band gains +25 per pull (one pull to clear)', () => {
    expect(masteryGain(0, 3, false)).toBe(25)
  })

  it('dance band gains +55/mechanicCount per pull', () => {
    expect(masteryGain(25, 5, false)).toBe(36)
    expect(masteryGain(25, 2, false)).toBe(52.5)
  })

  it('polish band gains +20 per pull and caps at 100', () => {
    expect(masteryGain(80, 3, false)).toBe(100)
    expect(masteryGain(95, 3, false)).toBe(100)
    expect(masteryGain(100, 3, false)).toBe(100)
  })

  it('a 2-mechanic phase clears the dance band in 2 pulls, a 5-mechanic one in 5', () => {
    const pullsToPolish = (mechanicCount: number): number => {
      let mastery = 25
      let pulls = 0
      while (mastery < 80) {
        mastery = masteryGain(mastery, mechanicCount, false)
        pulls++
      }
      return pulls
    }
    expect(pullsToPolish(2)).toBe(2)
    expect(pullsToPolish(5)).toBe(5)
  })

  it('fast learners (Discipline ≥ 4) gain ×1.5', () => {
    expect(masteryGain(0, 3, true)).toBe(37.5)
    expect(masteryGain(30, 5, true)).toBe(30 + (55 / 5) * 1.5)
  })
})

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

// AC: harder phases carry more mechanics (2–5), derived from the target
describe('mechanicCount derivation', () => {
  const phase = (target: number, explicit?: number): number =>
    createPhase('P', 'f', 1, 1, 1, PhaseType.SKILL_HEAVY, target, explicit).mechanicCount

  it('derives 2–5 across the target range', () => {
    expect(phase(3.0)).toBe(2)
    expect(phase(3.3)).toBe(3)
    expect(phase(3.5)).toBe(4)
    expect(phase(4.0)).toBe(5)
  })

  it('clamps the derivation to [2, 5]', () => {
    expect(phase(2.0)).toBe(2)
    expect(phase(6.0)).toBe(5)
  })

  it('respects an explicit count', () => {
    expect(phase(3.0, 5)).toBe(5)
  })
})
