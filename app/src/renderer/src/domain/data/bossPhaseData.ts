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
}

export function createPhase(
  name: string,
  flavor: string,
  dpsWeight: number,
  tankWeight: number,
  healWeight: number,
  phaseType: PhaseType,
  phaseTarget: number
): BossPhaseData {
  return { name, flavor, dpsWeight, tankWeight, healWeight, phaseType, phaseTarget }
}
