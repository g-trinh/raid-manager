import { BossPhaseData } from './bossPhaseData'
import { LootItemData } from './lootData'

export type SignatureItems = [LootItemData, LootItemData, LootItemData]

export interface BossData {
  bossName: string
  epithet: string
  phases: BossPhaseData[]
  signatureItems: SignatureItems
}

export function createBoss(
  name: string,
  epithet: string,
  phases: BossPhaseData[],
  signatureItems: SignatureItems
): BossData {
  return { bossName: name, epithet, phases, signatureItems }
}
