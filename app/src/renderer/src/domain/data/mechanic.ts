export enum MechanicType {
  TANKBUSTER = 'TANKBUSTER',
  RAIDWIDE = 'RAIDWIDE',
  SPREAD = 'SPREAD',
  STACK = 'STACK',
  SOAK = 'SOAK',
  ADD_WAVE = 'ADD_WAVE',
  DODGE = 'DODGE'
}

export type MechanicTargets = 'ALL' | 'TANKS' | 'HEALS' | 'DPS'
export type Severity = 1 | 2 | 3

export interface BossMechanicData {
  name: string
  type: MechanicType
  tested: 'skill' | 'discipline'
  targets: MechanicTargets
  severity: Severity
}

type MechanicDefaults = Pick<BossMechanicData, 'tested' | 'targets' | 'severity'>

const TYPE_DEFAULTS: Record<MechanicType, MechanicDefaults> = {
  [MechanicType.TANKBUSTER]: { tested: 'skill', targets: 'TANKS', severity: 3 },
  [MechanicType.RAIDWIDE]: { tested: 'discipline', targets: 'ALL', severity: 2 },
  [MechanicType.SPREAD]: { tested: 'discipline', targets: 'ALL', severity: 2 },
  [MechanicType.STACK]: { tested: 'discipline', targets: 'ALL', severity: 2 },
  [MechanicType.SOAK]: { tested: 'discipline', targets: 'DPS', severity: 2 },
  [MechanicType.ADD_WAVE]: { tested: 'skill', targets: 'DPS', severity: 1 },
  [MechanicType.DODGE]: { tested: 'skill', targets: 'ALL', severity: 1 }
}

export function createMechanic(
  type: MechanicType,
  name: string,
  overrides?: Partial<Omit<BossMechanicData, 'type' | 'name'>>
): BossMechanicData {
  return { ...TYPE_DEFAULTS[type], ...overrides, type, name }
}
