import { Role } from './role'

export interface LootItemData {
  id: string
  name: string
  flavor: string
  roleLock: Role
  skillBonus: number
  liabilityBonus: number
  sourceBossName: string
  sourcePhase: 1 | 2 | 3
  roleLockWeights?: Partial<Record<Role, number>>
}

export function createLootItem(
  id: string,
  name: string,
  flavor: string,
  roleLock: Role,
  skillBonus: number,
  liabilityBonus: number,
  sourceBossName: string,
  sourcePhase: 1 | 2 | 3,
  roleLockWeights?: Partial<Record<Role, number>>
): LootItemData {
  return {
    id,
    name,
    flavor,
    roleLock,
    skillBonus,
    liabilityBonus,
    sourceBossName,
    sourcePhase,
    roleLockWeights
  }
}
