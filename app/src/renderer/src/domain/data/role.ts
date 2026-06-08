export enum Role {
  TANK = 'TANK',
  HEAL = 'HEAL',
  DPS = 'DPS'
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.TANK]: 'Tank',
  [Role.HEAL]: 'Heal',
  [Role.DPS]: 'DPS'
}
