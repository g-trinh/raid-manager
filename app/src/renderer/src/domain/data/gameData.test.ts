import { describe, expect, it } from 'vitest'
import { bossPool } from './gameData'

// AC (BM-02): every boss has 3 phases; every phase has 2–5 ordered mechanics
// with non-empty names. Guards the authoring pass against regressions.
describe('boss authoring — mechanic content sanity', () => {
  it('there are 10 bosses', () => {
    expect(bossPool.length).toBe(10)
  })

  it.each(bossPool.map((b) => [b.bossName, b] as const))(
    '%s has exactly 3 phases, each with 2–5 named mechanics',
    (_name, boss) => {
      expect(boss.phases.length).toBe(3)
      for (const phase of boss.phases) {
        expect(phase.mechanics.length).toBeGreaterThanOrEqual(2)
        expect(phase.mechanics.length).toBeLessThanOrEqual(5)
        for (const mechanic of phase.mechanics) {
          expect(mechanic.name.trim().length).toBeGreaterThan(0)
        }
      }
    }
  )

  it('mechanic names are unique within each phase', () => {
    for (const boss of bossPool) {
      for (const phase of boss.phases) {
        const names = phase.mechanics.map((m) => m.name)
        expect(new Set(names).size).toBe(names.length)
      }
    }
  })
})
