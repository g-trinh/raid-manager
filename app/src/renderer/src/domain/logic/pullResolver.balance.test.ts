import { describe, expect, it } from 'vitest'
import { bossPool, memberPool } from '../data/gameData'
import { Role } from '../data/role'
import {
  FUMBLE_CHANCE_PER_PIP,
  SEVERITY_DAMAGE,
  U0,
  AttemptResult,
  PausePoint,
  Resolution,
  ResolutionDials,
  phaseBudget,
  resolvePull
} from './pullResolver'

// ── Seeded PRNG for deterministic CI runs ─────────────────────────────────────

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_DIALS: ResolutionDials = {
  U0,
  FUMBLE_CHANCE_PER_PIP,
  SEVERITY_DAMAGE,
  phaseBudget
}

function noMasterySnapshot(): (m: string, p: number, k: number) => number {
  return () => 0
}

function fullMasterySnapshot(): (m: string, p: number, k: number) => number {
  return () => 1
}

// Average 8-member roster matching memberPool composition
function averageRoster() {
  const byRole = (role: Role, n: number) =>
    memberPool.filter((m) => m.role === role).slice(0, n)
  return [...byRole(Role.TANK, 2), ...byRole(Role.HEAL, 2), ...byRole(Role.DPS, 4)]
}

function runGenerator(
  gen: Generator<PausePoint, AttemptResult, Resolution>
): AttemptResult {
  let step = gen.next()
  while (!step.done) {
    step = gen.next({ action: 'continue' })
  }
  return step.value
}

function pullsToKill(
  bossIndex: number,
  roster: ReturnType<typeof averageRoster>,
  masterySnapshot: (m: string, p: number, k: number) => number,
  rng: () => number,
  maxPulls = 50
): number {
  const boss = bossPool[bossIndex]
  for (let pull = 1; pull <= maxPulls; pull++) {
    const gen = resolvePull(roster, boss, masterySnapshot, DEFAULT_DIALS, rng)
    const result = runGenerator(gen)
    if (result.outcome === 'VICTORY') return pull
  }
  return maxPulls
}

function monteCarlo(
  bossIndex: number,
  roster: ReturnType<typeof averageRoster>,
  masterySnapshot: (m: string, p: number, k: number) => number,
  runs: number,
  seed: number
): number {
  const rng = mulberry32(seed)
  let total = 0
  for (let i = 0; i < runs; i++) {
    total += pullsToKill(bossIndex, roster, masterySnapshot, rng)
  }
  return total / runs
}

// ── Balance assertions ────────────────────────────────────────────────────────
//
// Target curve (ADR-003 §8):
//   Fresh average roster:      mean pulls-per-boss ∈ [1, 8]
//   Fully-mastered roster:     mean pulls-per-boss ∈ [1, 4]
//   (Tight tolerances require dial tuning — these bands allow room to tune)

const RUNS = 500
const SEED = 42

describe('balance harness — pulls-per-boss within tolerance', () => {
  const roster = averageRoster()

  for (let b = 0; b < bossPool.length; b++) {
    const boss = bossPool[b]

    it(`${boss.bossName}: fresh roster averages 1–8 pulls`, () => {
      const mean = monteCarlo(b, roster, noMasterySnapshot(), RUNS, SEED + b)
      expect(mean).toBeGreaterThanOrEqual(1)
      expect(mean).toBeLessThanOrEqual(8)
    })

    it(`${boss.bossName}: full-mastery roster averages 1–4 pulls`, () => {
      const mean = monteCarlo(b, roster, fullMasterySnapshot(), RUNS, SEED + b + 100)
      expect(mean).toBeGreaterThanOrEqual(1)
      expect(mean).toBeLessThanOrEqual(4)
    })
  }
})
