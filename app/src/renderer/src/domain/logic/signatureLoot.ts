import { BossData } from '../data/bossData'
import { LootItemData } from '../data/lootData'
import { Role } from '../data/role'
import { Outcome, type PhaseResult } from '../stores/useRunStore'

export function selectDroppedItems(
  boss: BossData,
  outcome: Outcome,
  phaseResults: PhaseResult[]
): LootItemData[] {
  if (outcome === Outcome.DEFEAT) return []

  const dropped =
    outcome === Outcome.FULL_VICTORY
      ? boss.signatureItems
      : boss.signatureItems.filter((_, index) => phaseResults[index]?.success)

  return dropped.map(resolveRoleLock)
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
