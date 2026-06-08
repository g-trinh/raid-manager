import { BossPhaseData, PhaseType } from '../data/bossPhaseData'
import { MemberData } from '../data/memberData'
import { Role } from '../data/role'

export interface PhaseProjection {
  score: number
  chance: number
}

function average(vals: number[]): number {
  if (vals.length === 0) return 0
  return vals.reduce((sum, v) => sum + v, 0) / vals.length
}

function roleAverage(members: MemberData[], role: Role, statKey: 'skill' | 'liability'): number {
  const vals = members.filter((m) => m.role === role).map((m) => m[statKey])
  return average(vals)
}

export function projectPhase(phase: BossPhaseData, members: MemberData[]): PhaseProjection {
  const statKey = phase.phaseType === PhaseType.SKILL_HEAVY ? 'skill' : 'liability'

  const dpsAvg = roleAverage(members, Role.DPS, statKey)
  const tankAvg = roleAverage(members, Role.TANK, statKey)
  const healAvg = roleAverage(members, Role.HEAL, statKey)

  const totalWeight = phase.dpsWeight + phase.tankWeight + phase.healWeight
  const score =
    (phase.dpsWeight * dpsAvg + phase.tankWeight * tankAvg + phase.healWeight * healAvg) /
    totalWeight

  const ratio = phase.phaseTarget > 0 ? score / phase.phaseTarget : 0
  const chance = 0.05 + 0.9 * Math.min(1, Math.pow(Math.max(0, ratio), 2))

  return { score, chance }
}
