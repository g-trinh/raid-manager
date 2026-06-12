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
  // How many distinct mechanics the phase throws at the muster (2–5).
  // Stretches the middle of the mastery curve — more mechanics, longer learn.
  mechanicCount: number
}

// Harder phases carry more mechanics: targets ~3.0–4.0 map onto 2–5.
function deriveMechanicCount(phaseTarget: number): number {
  return Math.max(2, Math.min(5, 2 + Math.round((phaseTarget - 3) * 3)))
}

export function createPhase(
  name: string,
  flavor: string,
  dpsWeight: number,
  tankWeight: number,
  healWeight: number,
  phaseType: PhaseType,
  phaseTarget: number,
  mechanicCount?: number
): BossPhaseData {
  return {
    name,
    flavor,
    dpsWeight,
    tankWeight,
    healWeight,
    phaseType,
    phaseTarget,
    mechanicCount: mechanicCount ?? deriveMechanicCount(phaseTarget)
  }
}
