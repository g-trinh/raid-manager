import { Role } from './role'

export interface LootItemData {
  id: string
  name: string
  flavor: string
  roleLock: Role
  skillBonus: number
  liabilityBonus: number
  sourceBossName: string
}

export function createLootItem(
  id: string,
  name: string,
  flavor: string,
  roleLock: Role,
  skillBonus: number,
  liabilityBonus: number,
  sourceBossName: string
): LootItemData {
  return { id, name, flavor, roleLock, skillBonus, liabilityBonus, sourceBossName }
}
