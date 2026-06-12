import { BossData } from '../data/bossData'
import { LootItemData } from '../data/lootData'
import { Role } from '../data/role'
import { Outcome } from '../stores/useRunStore'

// A one-shot kill drops the boss's full signature set; a kill ground out over
// several pulls loses one item to the chaos. Wipes drop nothing.
export function selectDroppedItems(boss: BossData, outcome: Outcome): LootItemData[] {
  if (outcome === Outcome.WIPE || outcome === Outcome.DISBAND) return []

  // Rolled once: a Narrow Victory loses exactly one item, never more
  const lost = lostItemIndex(boss.signatureItems.length)
  const dropped =
    outcome === Outcome.FULL_VICTORY
      ? boss.signatureItems
      : boss.signatureItems.filter((_, index) => index !== lost)

  return dropped.map(resolveRoleLock)
}

function lostItemIndex(count: number): number {
  return Math.floor(Math.random() * count)
}

function resolveRoleLock(item: LootItemData): LootItemData {
  if (!item.roleLockWeights) return item

  const roleLock = rollWeightedRole(item.roleLockWeights)
  const resolved = { ...item, roleLock }
  delete resolved.roleLockWeights
  return resolved
}

function rollWeightedRole(weights: Partial<Record<Role, number>>): Role {
  const entries = Object.entries(weights) as [Role, number][]
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)

  let roll = Math.random() * total
  for (const [role, weight] of entries) {
    if (roll < weight) return role
    roll -= weight
  }
  return entries[entries.length - 1][0]
}
