export enum PhaseType {
  SKILL_HEAVY = 'SKILL_HEAVY',
  LIABILITY_HEAVY = 'LIABILITY_HEAVY'
}

export interface BossPhaseData {
  dpsWeight: number
  tankWeight: number
  healWeight: number
  phaseType: PhaseType
  phaseTarget: number
}

export function createPhase(
  dpsWeight: number,
  tankWeight: number,
  healWeight: number,
  phaseType: PhaseType,
  phaseTarget: number
): BossPhaseData {
  return { dpsWeight, tankWeight, healWeight, phaseType, phaseTarget }
}
