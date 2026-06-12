import { Role } from './role'

export type LootRarity = 'common' | 'rare'

export interface LootItemData {
  id: string
  name: string
  flavor: string
  roleLock: Role
  rarity: LootRarity
  skillBonus: number
  disciplineBonus: number
  sourceBossName?: string
  sourcePhase?: 1 | 2 | 3
  roleLockWeights?: Partial<Record<Role, number>>
}

export function createCommonItem(
  id: string,
  name: string,
  flavor: string,
  roleLock: Role,
  skillBonus: number,
  disciplineBonus: number
): LootItemData {
  return { id, name, flavor, roleLock, rarity: 'common', skillBonus, disciplineBonus }
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
    rarity: 'rare',
    skillBonus,
    disciplineBonus,
    sourceBossName,
    sourcePhase,
    roleLockWeights
  }
}
