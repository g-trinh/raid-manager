import { Role } from './role'

export interface LootItemData {
  id: string
  name: string
  flavor: string
  roleLock: Role
  skillBonus: number
  disciplineBonus: number
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
  disciplineBonus: number,
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
    disciplineBonus,
    sourceBossName,
    sourcePhase,
    roleLockWeights
  }
}
