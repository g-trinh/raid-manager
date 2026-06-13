import { BossMechanicData } from './mechanic'

export enum PhaseType {
  SKILL_HEAVY = 'SKILL_HEAVY',
  DISCIPLINE_HEAVY = 'DISCIPLINE_HEAVY'
}

export interface BossPhaseData {
  name: string
  flavor: string
  dpsWeight: number
  tankWeight: number
  healWeight: number
  phaseType: PhaseType
  phaseTarget: number
  mechanics: BossMechanicData[]
}

export function createPhase(
  name: string,
  flavor: string,
  dpsWeight: number,
  tankWeight: number,
  healWeight: number,
  phaseType: PhaseType,
  phaseTarget: number,
  mechanics: BossMechanicData[]
): BossPhaseData {
  return { name, flavor, dpsWeight, tankWeight, healWeight, phaseType, phaseTarget, mechanics }
}
