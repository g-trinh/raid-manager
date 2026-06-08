import { BossPhaseData } from './bossPhaseData'

export interface BossData {
  bossName: string
  epithet: string
  phases: BossPhaseData[]
}

export function createBoss(name: string, epithet: string, phases: BossPhaseData[]): BossData {
  return { bossName: name, epithet, phases }
}
