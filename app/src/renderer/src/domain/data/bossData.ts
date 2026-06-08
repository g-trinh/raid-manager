import { BossPhaseData } from './bossPhaseData'

export interface BossData {
  bossName: string
  phases: BossPhaseData[]
}

export function createBoss(name: string, phases: BossPhaseData[]): BossData {
  return { bossName: name, phases }
}
