import { BossData } from '../data/bossData'
import { BossPhaseData } from '../data/bossPhaseData'
import { MemberData } from '../data/memberData'
import { PhaseProjection, projectPhase } from './phaseProjection'

export interface BossForecastVerdict {
  label: string
  // One-word read of the same forecast, shown even without scouting
  coarse: string
  color: string
}

export interface WeakestPhase {
  phase: BossPhaseData
  index: number
  chance: number
}

export interface BossForecast {
  projections: PhaseProjection[]
  expectedHeld: number
  weakest: WeakestPhase
  verdict: BossForecastVerdict
}

function forecastVerdict(expectedHeld: number): BossForecastVerdict {
  if (expectedHeld >= 2.4)
    return { label: 'A quick kill likely', coarse: 'Favorable', color: '#a6b67c' }
  if (expectedHeld >= 1.5) return { label: 'A long grind likely', coarse: 'Even', color: '#d99a3c' }
  return { label: 'A bloodbath likely', coarse: 'Grim', color: '#b8472f' }
}

export function bossForecast(boss: BossData, roster: MemberData[]): BossForecast {
  const projections = boss.phases.map((phase) => projectPhase(phase, roster))
  const expectedHeld = projections.reduce((sum, projection) => sum + projection.chance, 0)

  let weakestIndex = 0
  projections.forEach((projection, i) => {
    if (projection.chance < projections[weakestIndex].chance) weakestIndex = i
  })

  return {
    projections,
    expectedHeld,
    weakest: {
      phase: boss.phases[weakestIndex],
      index: weakestIndex,
      chance: projections[weakestIndex].chance
    },
    verdict: forecastVerdict(expectedHeld)
  }
}
