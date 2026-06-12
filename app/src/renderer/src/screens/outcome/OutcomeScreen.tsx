import { useEffect, useMemo, useState } from 'react'
import { BossPhaseData, PhaseType } from '../../domain/data/bossPhaseData'
import { MemberData } from '../../domain/data/memberData'
import { Role, ROLE_LABELS } from '../../domain/data/role'
import { roleAverage } from '../../domain/logic/phaseProjection'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { useLootStore } from '../../domain/stores/useLootStore'
import { Outcome, PhaseResult, useRunStore } from '../../domain/stores/useRunStore'
import { SpoilsScreen } from '../spoils/SpoilsScreen'
import { ROMAN, pct } from '../shared/formatting'

// The role(s) the phase leaned on hardest, and how the muster's tested stat
// averaged there — turns "Broke" into something the player can act on.
function failureCause(phase: BossPhaseData, roster: MemberData[]): string {
  const statKey = phase.phaseType === PhaseType.SKILL_HEAVY ? 'skill' : 'discipline'
  const statLabel = statKey === 'skill' ? 'Skill' : 'Discipline'
  const weights: [Role, number][] = [
    [Role.DPS, phase.dpsWeight],
    [Role.TANK, phase.tankWeight],
    [Role.HEAL, phase.healWeight]
  ]
  const top = Math.max(...weights.map(([, w]) => w))
  const leadRoles = weights.filter(([, w]) => w === top).map(([role]) => role)
  const parts = leadRoles.map(
    (role) =>
      `${ROLE_LABELS[role]} ${statLabel} averages ${roleAverage(roster, role, statKey).toFixed(1)}`
  )
  return `Leaned on ${leadRoles.map((r) => ROLE_LABELS[r]).join(' & ')} — your ${parts.join(', ')} of 5`
}

interface OutcomeScreenProps {
  onPlayAgain: () => void
  onChoosePath: () => void
  onInvalidState: () => void
}

interface OutcomeMeta {
  color: string
  head: string
  sub: string
}

const OUTCOME_META: Record<Outcome, OutcomeMeta> = {
  [Outcome.FULL_VICTORY]: {
    color: '#a6b67c',
    head: 'Flawless Hold',
    sub: 'Three trials, three triumphs. The raid stands whole and unbroken.'
  },
  [Outcome.NARROW_VICTORY]: {
    color: '#d99a3c',
    head: 'A Costly Triumph',
    sub: 'The foe falls — but the muster paid in blood for it.'
  },
  [Outcome.DEFEAT]: {
    color: '#b8472f',
    head: 'The Guild Is Broken',
    sub: 'The dark takes them. No retreat, no retry, no dawn.'
  }
}

const REVEAL_START_MS = 700
const REVEAL_STEP_MS = 1050
const OUTCOME_DELAY_MS = 350

interface PhaseResolveRowProps {
  result: PhaseResult
  index: number
  visible: boolean
  roster: MemberData[]
}

function PhaseResolveRow({
  result,
  index,
  visible,
  roster
}: PhaseResolveRowProps): React.JSX.Element {
  const { phase, chance, success } = result
  const tested = phase.phaseType === PhaseType.SKILL_HEAVY ? 'Skill' : 'Discipline'
  return (
    <div
      className={`phase-resolve-row${visible ? ' phase-resolve-row--visible' : ''}`}
      style={{ borderLeftColor: visible ? (success ? '#a6b67c' : '#b8472f') : 'var(--line)' }}
    >
      <span className="phase-resolve-row__roman">{ROMAN[index]}</span>
      <div className="phase-resolve-row__body">
        <div className="phase-resolve-row__name">{phase.name}</div>
        <div className="phase-resolve-row__sub">
          {tested} check · {pct(chance)}% to hold
        </div>
        {visible && !success && (
          <div className="phase-resolve-row__cause">{failureCause(phase, roster)}</div>
        )}
      </div>
      <div
        className={`phase-resolve-row__pill${visible ? ' phase-resolve-row__pill--visible' : ''}`}
        style={{
          color: success ? '#a6b67c' : '#b8472f',
          borderColor: success ? '#a6b67c' : '#b8472f',
          boxShadow: visible ? `0 0 12px ${success ? '#a6b67c44' : '#b8472f55'}` : 'none'
        }}
      >
        {success ? 'Held' : 'Broke'}
      </div>
    </div>
  )
}

interface AttemptRevealProps {
  bossName: string
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  onContinue: () => void
  onPlayAgain: () => void
  continueLabel: string | null
}

function AttemptReveal({
  bossName,
  phaseResults,
  phasesSucceeded,
  outcome,
  onContinue,
  onPlayAgain,
  continueLabel
}: AttemptRevealProps): React.JSX.Element {
  const [revealed, setRevealed] = useState(0)
  const [showOutcome, setShowOutcome] = useState(false)
  const [showSpoils, setShowSpoils] = useState(false)
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const effectiveRoster = useLootStore((s) => s.effectiveRoster)
  const roster = useMemo(() => effectiveRoster(selectedMembers), [effectiveRoster, selectedMembers])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    phaseResults.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), REVEAL_START_MS + i * REVEAL_STEP_MS))
    })
    timers.push(
      setTimeout(
        () => setShowOutcome(true),
        REVEAL_START_MS + phaseResults.length * REVEAL_STEP_MS + OUTCOME_DELAY_MS
      )
    )
    return () => timers.forEach(clearTimeout)
  }, [phaseResults])

  const meta = OUTCOME_META[outcome]

  const performContinue = (): void => {
    if (continueLabel) onContinue()
    else onPlayAgain()
  }

  const handleOutcomeButtonClick = (): void => {
    if (outcome === Outcome.DEFEAT) onPlayAgain()
    else setShowSpoils(true)
  }

  if (showSpoils) {
    return (
      <SpoilsScreen onContinue={performContinue} continueLabel={continueLabel ?? 'Muster Again'} />
    )
  }

  return (
    <div className="resolution-screen">
      <div className="resolution-screen__header">
        <div className="resolution-screen__kicker">The Attempt</div>
        <div className="resolution-screen__name">{bossName}</div>
      </div>

      <div className="resolution-screen__rows">
        {phaseResults.map((result, i) => (
          <PhaseResolveRow
            key={result.phase.name}
            result={result}
            index={i}
            visible={revealed > i}
            roster={roster}
          />
        ))}
      </div>

      <div className={`resolution-outcome${showOutcome ? ' resolution-outcome--visible' : ''}`}>
        <div
          className="resolution-outcome__rule"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }}
        />
        <div className="resolution-outcome__tally">{phasesSucceeded} of 3 phases held</div>
        <div
          className="resolution-outcome__head"
          style={{ color: meta.color, textShadow: `0 0 26px ${meta.color}55` }}
        >
          {meta.head}
        </div>
        <div className="resolution-outcome__sub">{meta.sub}</div>
        <button className="rm-btn rm-btn--default" onClick={handleOutcomeButtonClick}>
          {outcome === Outcome.DEFEAT ? (continueLabel ?? 'Muster Again') : 'Claim Your Spoils'}
        </button>
      </div>
    </div>
  )
}

export function OutcomeScreen({
  onPlayAgain,
  onChoosePath,
  onInvalidState
}: OutcomeScreenProps): React.JSX.Element | null {
  const isResolved = useRunStore((s) => s.isResolved)
  const outcome = useRunStore((s) => s.outcome)
  const boss = useRunStore((s) => s.boss)
  const bossIndex = useRunStore((s) => s.bossIndex)
  const isRunOver = useRunStore((s) => s.isRunOver)
  const phaseResults = useRunStore((s) => s.phaseResults)
  const phasesSucceeded = useRunStore((s) => s.phasesSucceeded)
  const reset = useRunStore((s) => s.reset)

  useEffect(() => {
    if (!isResolved) {
      console.warn('OutcomeScreen loaded without resolution')
      onInvalidState()
    }
  }, [isResolved, onInvalidState])

  if (!isResolved) return null

  const continueLabel = isRunOver ? null : 'Make Camp'

  const handlePlayAgain = (): void => {
    reset()
    onPlayAgain()
  }

  return (
    <AttemptReveal
      key={bossIndex}
      bossName={boss.bossName}
      phaseResults={phaseResults}
      phasesSucceeded={phasesSucceeded}
      outcome={outcome}
      onContinue={onChoosePath}
      onPlayAgain={handlePlayAgain}
      continueLabel={continueLabel}
    />
  )
}
