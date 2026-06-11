import { BossData } from '../data/bossData'

function averagePhaseTarget(boss: BossData): number {
  const total = boss.phases.reduce((sum, phase) => sum + phase.phaseTarget, 0)
  return total / boss.phases.length
}

export function draftBosses(pool: BossData[], count: number): BossData[] {
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count).sort((a, b) => averagePhaseTarget(a) - averagePhaseTarget(b))
}
