import { create } from 'zustand'
import { BossPhaseData, PhaseType } from '../data/bossPhaseData'
import { boss } from '../data/gameData'
import { MemberData } from '../data/memberData'
import { Role } from '../data/role'
import { useDraftStore } from './useDraftStore'

export enum Outcome {
  FULL_VICTORY = 'FULL_VICTORY',
  NARROW_VICTORY = 'NARROW_VICTORY',
  DEFEAT = 'DEFEAT'
}

interface RunState {
  phaseResults: boolean[]
  phasesSucceeded: number
  outcome: Outcome
  isResolved: boolean

  resolve: () => void
  reset: () => void
}

function average(vals: number[]): number {
  if (vals.length === 0) return 0
  return vals.reduce((sum, v) => sum + v, 0) / vals.length
}

function resolvePhase(phase: BossPhaseData, members: MemberData[]): boolean {
  const dpsVals: number[] = []
  const tankVals: number[] = []
  const healVals: number[] = []

  for (const m of members) {
    const stat = phase.phaseType === PhaseType.SKILL_HEAVY ? m.skill : m.liability
    switch (m.role) {
      case Role.DPS:
        dpsVals.push(stat)
        break
      case Role.TANK:
        tankVals.push(stat)
        break
      case Role.HEAL:
        healVals.push(stat)
        break
    }
  }

  const dpsAvg = average(dpsVals)
  const tankAvg = average(tankVals)
  const healAvg = average(healVals)

  const totalWeight = phase.dpsWeight + phase.tankWeight + phase.healWeight
  const phaseScore =
    (phase.dpsWeight * dpsAvg + phase.tankWeight * tankAvg + phase.healWeight * healAvg) /
    totalWeight

  const ratio = phaseScore / phase.phaseTarget
  let successChance = 0.05 + 0.9 * Math.min(1, ratio * ratio)
  successChance = Math.min(0.95, Math.max(0.05, successChance))

  return Math.random() <= successChance
}

export const useRunStore = create<RunState>((set) => ({
  phaseResults: [],
  phasesSucceeded: 0,
  outcome: Outcome.DEFEAT,
  isResolved: false,

  resolve: () => {
    if (!useDraftStore.getState().isDraftComplete()) {
      console.warn('RunState.resolve() called before draft is complete')
      return
    }

    const members = useDraftStore.getState().selectedMembers
    const phaseResults = boss.phases.map((phase) => resolvePhase(phase, members))
    const phasesSucceeded = phaseResults.filter(Boolean).length

    let outcome: Outcome
    if (phasesSucceeded === 3) outcome = Outcome.FULL_VICTORY
    else if (phasesSucceeded === 2) outcome = Outcome.NARROW_VICTORY
    else outcome = Outcome.DEFEAT

    set({ phaseResults, phasesSucceeded, outcome, isResolved: true })
  },

  reset: () => {
    set({ phaseResults: [], phasesSucceeded: 0, outcome: Outcome.DEFEAT, isResolved: false })
    useDraftStore.getState().reset()
  }
}))

export function getBossName(): string {
  return boss.bossName
}
