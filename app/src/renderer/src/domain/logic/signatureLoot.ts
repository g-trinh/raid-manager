import { BossData } from '../data/bossData'
import { LootItemData } from '../data/lootData'
import { Role } from '../data/role'
import { Outcome } from '../stores/useRunStore'

// A kill is a kill: the boss's full signature set drops however many pulls it
// took. Wipes drop nothing.
export function selectDroppedItems(boss: BossData, outcome: Outcome): LootItemData[] {
  if (outcome !== Outcome.VICTORY) return []
  return boss.signatureItems.map(resolveRoleLock)
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
