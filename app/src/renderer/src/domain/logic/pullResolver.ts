import { BossData } from '../data/bossData'
import { BossPhaseData } from '../data/bossPhaseData'
import { BossMechanicData, MechanicTargets, MechanicType, Severity } from '../data/mechanic'
import { MemberData } from '../data/memberData'
import { Role } from '../data/role'
import { projectPhase } from './phaseProjection'

// ── Balance dials (BM-07b tunes these) ────────────────────────────────────────

export const U0 = 0.12
export const FUMBLE_CHANCE_PER_PIP = 0.06
export const SEVERITY_DAMAGE: Record<Severity, number> = { 1: 1, 2: 2, 3: 3 }

export function phaseBudget(phaseTarget: number): number {
  return Math.round(phaseTarget * 4)
}

// ── Types ──────────────────────────────────────────────────────────────────────

export enum Outcome {
  VICTORY = 'VICTORY',
  WIPE = 'WIPE',
  DISBAND = 'DISBAND'
}

export type WipeCause = 'blunder' | 'learning' | 'called'

export type PullEventKind =
  | 'phase-start'
  | 'check-pass'
  | 'check-fail'
  | 'death'
  | 'phase-hold'
  | 'wipe'
  | 'kill'

export interface PullEvent {
  seq: number
  phaseIndex: number
  mechanic: string | null
  type: MechanicType | null
  memberName: string | null
  kind: PullEventKind
}

export interface FailedCheck {
  member: string
  mechanic: string
}

export interface FumbleEvent {
  member: string
  phaseIndex: number
  mechanicIndex: number
}

export interface PhaseResult {
  phase: BossPhaseData
  score: number
  chance: number
  success: boolean
  reached: boolean
  masteryPct: number
  fumblers: string[]
  cause?: WipeCause
  blunderer?: string
  damageTally: number
  budget: number
  killerMechanic?: string
  failedChecks: FailedCheck[]
}

export interface AttemptResult {
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  wipePhaseIndex: number | null
  quitter: string | null
  pullLog: PullEvent[]
  fumbleEvents: FumbleEvent[]
}

export type PausePointKind = 'pre-verdict' | 'on-death' | 'on-budget-fail'

export interface PausePoint {
  kind: PausePointKind
  phaseIndex: number
  failedChecks: FailedCheck[]
  dyingMember?: string
  damageTally?: number
  budget?: number
}

export type Resolution =
  | { action: 'continue' }
  | { action: 'wipe'; cause: WipeCause }
  | { action: 'override' }
  | { action: 'reroll' }

export interface ResolutionDials {
  U0: number
  FUMBLE_CHANCE_PER_PIP: number
  SEVERITY_DAMAGE: Record<Severity, number>
  phaseBudget: (phaseTarget: number) => number
}

export type MasterySnapshotFn = (
  memberName: string,
  phaseIndex: number,
  mechanicIndex: number
) => number

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROLE_FOR_TARGET: Record<Exclude<MechanicTargets, 'ALL'>, Role> = {
  TANKS: Role.TANK,
  HEALS: Role.HEAL,
  DPS: Role.DPS
}

function targetedMembers(mechanic: BossMechanicData, roster: MemberData[]): MemberData[] {
  if (mechanic.targets === 'ALL') return roster
  const role = ROLE_FOR_TARGET[mechanic.targets]
  return roster.filter((m) => m.role === role)
}

function rosterPhaseMasteryFromSnapshot(
  snapshot: MasterySnapshotFn,
  roster: MemberData[],
  phaseIndex: number,
  mechanicCount: number
): number {
  if (roster.length === 0 || mechanicCount === 0) return 0
  let total = 0
  for (const m of roster) {
    let phaseTotal = 0
    for (let k = 0; k < mechanicCount; k++) {
      phaseTotal += snapshot(m.memberName, phaseIndex, k) * 100
    }
    total += phaseTotal / mechanicCount
  }
  return total / roster.length
}

function distinctMembers(checks: FailedCheck[]): string[] {
  return [...new Set(checks.map((c) => c.member))]
}

// ── The resolver generator (ADR-003 + ADR-004 + ADR-006) ──────────────────────
//
// Draw order (frozen contract, ADR-003 §6):
//   Per phase, per mechanic in array order, per targeted member in roster order:
//   one rng() call. No separate lethality roll; no post-phase pass roll.
//   Draws per phase = Σ |targetedMembers(m)|.
//
// Pause points (ADR-004):
//   'on-death'       — severity-3 check failed; yields before wipe is finalised
//   'pre-verdict'    — all mechanic checks tallied; before budget verdict
//   'on-budget-fail' — tally > budget; yields before learning wipe is finalised

export function* resolvePull(
  roster: MemberData[],
  boss: BossData,
  masterySnapshot: MasterySnapshotFn,
  dials: ResolutionDials,
  rng: () => number
): Generator<PausePoint, AttemptResult, Resolution> {
  const pullLog: PullEvent[] = []
  let seq = 0
  const phaseResults: PhaseResult[] = []
  const fumbleEvents: FumbleEvent[] = []
  let wipePhaseIndex: number | null = null

  function emit(event: Omit<PullEvent, 'seq'>): void {
    pullLog.push({ seq: seq++, ...event })
  }

  for (let p = 0; p < boss.phases.length; p++) {
    const phase = boss.phases[p]

    if (wipePhaseIndex !== null) {
      phaseResults.push({
        phase,
        score: 0,
        chance: 0,
        success: false,
        reached: false,
        masteryPct: 0,
        fumblers: [],
        damageTally: 0,
        budget: 0,
        failedChecks: []
      })
      continue
    }

    emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'phase-start' })

    const { score, chance } = projectPhase(phase, roster)
    const masteryPct = rosterPhaseMasteryFromSnapshot(masterySnapshot, roster, p, phase.mechanics.length)
    const budget = dials.phaseBudget(phase.phaseTarget)
    let damageTally = 0
    const failedChecks: FailedCheck[] = []
    let blunderer: string | null = null
    let killerMechanic: string | undefined
    let phaseDied = false

    // Per-mechanic, per-targeted-member checks (ADR-003 §6 draw order).
    for (let k = 0; k < phase.mechanics.length && !phaseDied; k++) {
      const mechanic = phase.mechanics[k]
      const targets = targetedMembers(mechanic, roster)

      for (const member of targets) {
        const stat = member[mechanic.tested]
        const mMastery = masterySnapshot(member.memberName, p, k)
        const failChance =
          dials.U0 * (1 - mMastery) + (5 - stat) * dials.FUMBLE_CHANCE_PER_PIP
        const fail = rng() < failChance

        if (!fail) {
          emit({
            phaseIndex: p,
            mechanic: mechanic.name,
            type: mechanic.type,
            memberName: member.memberName,
            kind: 'check-pass'
          })
          continue
        }

        // Failed check
        damageTally += dials.SEVERITY_DAMAGE[mechanic.severity]
        failedChecks.push({ member: member.memberName, mechanic: mechanic.name })
        fumbleEvents.push({ member: member.memberName, phaseIndex: p, mechanicIndex: k })

        emit({
          phaseIndex: p,
          mechanic: mechanic.name,
          type: mechanic.type,
          memberName: member.memberName,
          kind: 'check-fail'
        })

        if (mechanic.severity === 3) {
          // Death event; pause for battle-res (dormant — auto-continues)
          emit({
            phaseIndex: p,
            mechanic: mechanic.name,
            type: mechanic.type,
            memberName: member.memberName,
            kind: 'death'
          })

          const resolution: Resolution = yield {
            kind: 'on-death',
            phaseIndex: p,
            failedChecks: [...failedChecks],
            dyingMember: member.memberName
          }

          if (resolution.action === 'override') {
            // Battle-res: cancel the death, keep the fumble F, continue phase
            continue
          }

          // Death stands — blunder wipe
          blunderer = member.memberName
          killerMechanic = mechanic.name
          phaseDied = true
          break
        }
      }
    }

    if (phaseDied) {
      emit({
        phaseIndex: p,
        mechanic: killerMechanic ?? null,
        type: null,
        memberName: blunderer,
        kind: 'wipe'
      })
      wipePhaseIndex = p
      phaseResults.push({
        phase,
        score,
        chance,
        success: false,
        reached: true,
        masteryPct,
        fumblers: distinctMembers(failedChecks),
        cause: 'blunder',
        blunderer: blunderer ?? undefined,
        damageTally,
        budget,
        killerMechanic,
        failedChecks
      })
      continue
    }

    // Pre-verdict pause (call-the-wipe hook — dormant)
    const preVerdict: Resolution = yield {
      kind: 'pre-verdict',
      phaseIndex: p,
      failedChecks: [...failedChecks],
      damageTally,
      budget
    }

    if (preVerdict.action === 'wipe') {
      const cause = preVerdict.cause
      emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'wipe' })
      wipePhaseIndex = p
      phaseResults.push({
        phase,
        score,
        chance,
        success: false,
        reached: true,
        masteryPct,
        fumblers: distinctMembers(failedChecks),
        cause,
        damageTally,
        budget,
        failedChecks
      })
      continue
    }

    // Budget verdict
    if (damageTally > budget) {
      // On-budget-fail pause (heroism hook — dormant)
      const budgetFail: Resolution = yield {
        kind: 'on-budget-fail',
        phaseIndex: p,
        failedChecks: [...failedChecks],
        damageTally,
        budget
      }

      if (budgetFail.action === 'reroll') {
        // Heroism: re-run the whole phase's checks once, consuming draws(phase) extra draws
        let rerollTally = 0
        const rerollChecks: FailedCheck[] = []

        for (let k = 0; k < phase.mechanics.length; k++) {
          const mechanic = phase.mechanics[k]
          const targets = targetedMembers(mechanic, roster)
          for (const member of targets) {
            const stat = member[mechanic.tested]
            const mMastery = masterySnapshot(member.memberName, p, k)
            const failChance =
              dials.U0 * (1 - mMastery) + (5 - stat) * dials.FUMBLE_CHANCE_PER_PIP
            if (rng() < failChance) {
              rerollTally += dials.SEVERITY_DAMAGE[mechanic.severity]
              rerollChecks.push({ member: member.memberName, mechanic: mechanic.name })
            }
          }
        }

        if (rerollTally <= budget) {
          emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'phase-hold' })
          phaseResults.push({
            phase,
            score,
            chance,
            success: true,
            reached: true,
            masteryPct,
            fumblers: distinctMembers(rerollChecks),
            damageTally: rerollTally,
            budget,
            failedChecks: rerollChecks
          })
          continue
        }

        emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'wipe' })
        wipePhaseIndex = p
        phaseResults.push({
          phase,
          score,
          chance,
          success: false,
          reached: true,
          masteryPct,
          fumblers: distinctMembers(rerollChecks),
          cause: 'learning',
          damageTally: rerollTally,
          budget,
          failedChecks: rerollChecks
        })
        continue
      }

      // Learning wipe
      emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'wipe' })
      wipePhaseIndex = p
      phaseResults.push({
        phase,
        score,
        chance,
        success: false,
        reached: true,
        masteryPct,
        fumblers: distinctMembers(failedChecks),
        cause: 'learning',
        damageTally,
        budget,
        failedChecks
      })
      continue
    }

    // Phase holds
    emit({ phaseIndex: p, mechanic: null, type: null, memberName: null, kind: 'phase-hold' })
    phaseResults.push({
      phase,
      score,
      chance,
      success: true,
      reached: true,
      masteryPct,
      fumblers: distinctMembers(failedChecks),
      damageTally,
      budget,
      failedChecks
    })
  }

  const phasesSucceeded = phaseResults.filter((r) => r.success).length
  const outcome = wipePhaseIndex === null ? Outcome.VICTORY : Outcome.WIPE

  if (wipePhaseIndex === null) {
    emit({
      phaseIndex: boss.phases.length - 1,
      mechanic: null,
      type: null,
      memberName: null,
      kind: 'kill'
    })
  }

  return {
    phaseResults,
    phasesSucceeded,
    outcome,
    wipePhaseIndex,
    quitter: null,
    pullLog,
    fumbleEvents
  }
}
