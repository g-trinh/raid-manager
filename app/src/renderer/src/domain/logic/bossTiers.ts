import { BossData } from '../data/bossData'

export interface BossTiers {
  easy: BossData[]
  mid: BossData[]
  hard: BossData[]
}

function averagePhaseTarget(boss: BossData): number {
  const total = boss.phases.reduce((sum, phase) => sum + phase.phaseTarget, 0)
  return total / boss.phases.length
}

function shuffle(items: BossData[]): BossData[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function partitionPool(pool: BossData[]): BossTiers {
  const sorted = [...pool].sort((a, b) => averagePhaseTarget(a) - averagePhaseTarget(b))
  const tierSize = Math.floor(sorted.length / 3)

  return {
    easy: sorted.slice(0, tierSize),
    mid: sorted.slice(tierSize, tierSize * 2),
    hard: sorted.slice(tierSize * 2)
  }
}

export function drawOpener(tier: BossData[]): BossData {
  return tier[Math.floor(Math.random() * tier.length)]
}

export function drawCandidates(tier: BossData[], exclude: BossData[]): [BossData, BossData] {
  const excluded = new Set(exclude.map((boss) => boss.bossName))
  const available = shuffle(tier.filter((boss) => !excluded.has(boss.bossName)))
  return [available[0], available[1]]
}
