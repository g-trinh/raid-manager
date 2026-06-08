import { Role } from '../../domain/data/role'

export const ROLE_HEX: Record<Role, string> = {
  [Role.TANK]: '#84a0b4',
  [Role.HEAL]: '#a6b67c',
  [Role.DPS]: '#cc6a45'
}

export const ROLE_INITIAL: Record<Role, string> = {
  [Role.TANK]: 'T',
  [Role.HEAL]: 'H',
  [Role.DPS]: 'D'
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V']

export function pct(x: number): number {
  return Math.round(x * 100)
}

export function lastInitial(name: string): string {
  const last = name.trim().split(' ').slice(-1)[0]
  return last.charAt(0)
}

// chance → color ramp (blood → amber → sage)
export function chanceRamp(chance: number): string {
  if (chance >= 0.72) return '#a6b67c' // sage — safe
  if (chance >= 0.45) return '#d99a3c' // amber — uncertain
  return '#b8472f' // blood — failing
}
