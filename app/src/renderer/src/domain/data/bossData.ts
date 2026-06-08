import { BossPhaseData } from './bossPhaseData'
import { LootItemData } from './lootData'

export interface BossData {
  bossName: string
  epithet: string
  phases: BossPhaseData[]
  signatureItem: LootItemData
}

export function createBoss(
  name: string,
  epithet: string,
  phases: BossPhaseData[],
  signatureItem: LootItemData
): BossData {
  return { bossName: name, epithet, phases, signatureItem }
}
