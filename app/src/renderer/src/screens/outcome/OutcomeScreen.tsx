import { useEffect, useMemo, useState } from 'react'
import { BossPhaseData, PhaseType } from '../../domain/data/bossPhaseData'
import { MemberData } from '../../domain/data/memberData'
import { Role, ROLE_LABELS } from '../../domain/data/role'
import { masteryBand } from '../../domain/logic/mastery'
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
  onRetreat: () => void
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
    sub: 'One pull, three phases, no doubt. The raid stands whole and unbroken.'
  },
  [Outcome.NARROW_VICTORY]: {
    color: '#d99a3c',
    head: 'The Boss Falls',
    sub: 'Ground out pull by pull — but down is down, and the muster breathes again.'
  },
  [Outcome.WIPE]: {
    color: '#b8472f',
    head: 'The Muster Wipes',
    sub: 'The pull is lost, the lesson is not. Regroup, and go again.'
  },
  [Outcome.DISBAND]: {
    color: '#6b6357',
    head: 'The Guild Disbands',
    sub: 'One wipe too many. The muster scatters into the dark, and the run is done.'
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
  const { phase, chance, success, reached, masteryPct, cause, blunderer } = result
  const tested = phase.phaseType === PhaseType.SKILL_HEAVY ? 'Skill' : 'Discipline'

  if (!reached) {
    return (
      <div
        className={`phase-resolve-row phase-resolve-row--unreached${visible ? ' phase-resolve-row--visible' : ''}`}
      >
        <span className="phase-resolve-row__roman">{ROMAN[index]}</span>
        <div className="phase-resolve-row__body">
          <div className="phase-resolve-row__name">{phase.name}</div>
          <div className="phase-resolve-row__sub">The pull never got this far</div>
        </div>
        <div
          className={`phase-resolve-row__pill${visible ? ' phase-resolve-row__pill--visible' : ''}`}
          style={{ color: 'var(--ash)', borderColor: 'var(--ash2)' }}
        >
          Not reached
        </div>
      </div>
    )
  }

  const causeLine =
    cause === 'blunder' && blunderer
      ? `${blunderer}'s blunder wiped the muster — the mechanics were not the problem`
      : cause === 'learning'
        ? `${failureCause(phase, roster)} — and the phase isn't learned yet`
        : null

  return (
    <div
      className={`phase-resolve-row${visible ? ' phase-resolve-row--visible' : ''}`}
      style={{ borderLeftColor: visible ? (success ? '#a6b67c' : '#b8472f') : 'var(--line)' }}
    >
      <span className="phase-resolve-row__roman">{ROMAN[index]}</span>
      <div className="phase-resolve-row__body">
        <div className="phase-resolve-row__name">{phase.name}</div>
        <div className="phase-resolve-row__sub">
          {tested} check · {pct(chance)}% to hold ·{' '}
          <span className="phase-resolve-row__mastery">{masteryBand(masteryPct)}</span>
        </div>
        {visible && causeLine && <div className="phase-resolve-row__cause">{causeLine}</div>}
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
  pullsThisBoss: number
  wipePhaseIndex: number | null
  quitter: string | null
  onContinue: () => void
  onRetry: () => void
  onRetreat: () => void
  onPlayAgain: () => void
  continueLabel: string | null
}

function AttemptReveal({
  bossName,
  phaseResults,
  phasesSucceeded,
  outcome,
  pullsThisBoss,
  wipePhaseIndex,
  quitter,
  onContinue,
  onRetry,
  onRetreat,
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
  const isVictory = outcome === Outcome.FULL_VICTORY || outcome === Outcome.NARROW_VICTORY

  const performContinue = (): void => {
    if (continueLabel) onContinue()
    else onPlayAgain()
  }

  if (showSpoils) {
    return (
      <SpoilsScreen onContinue={performContinue} continueLabel={continueLabel ?? 'Muster Again'} />
    )
  }

  const tally = isVictory
    ? `${bossName} falls on pull ${pullsThisBoss}`
    : wipePhaseIndex !== null
      ? `Wiped in Phase ${ROMAN[wipePhaseIndex]} — pull ${pullsThisBoss}`
      : `${phasesSucceeded} of 3 phases held`

  return (
    <div className="resolution-screen">
      <div className="resolution-screen__header">
        <div className="resolution-screen__kicker">
          {pullsThisBoss > 1 ? `The Attempt · Pull ${pullsThisBoss}` : 'The Attempt'}
        </div>
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
        <div className="resolution-outcome__tally">{tally}</div>
        <div
          className="resolution-outcome__head"
          style={{ color: meta.color, textShadow: `0 0 26px ${meta.color}55` }}
        >
          {meta.head}
        </div>
        <div className="resolution-outcome__sub">
          {outcome === Outcome.DISBAND && quitter
            ? `${quitter} has had enough and quits the guild. ${meta.sub}`
            : meta.sub}
        </div>
        {outcome === Outcome.WIPE ? (
          <div className="resolution-outcome__actions">
            <button className="rm-btn rm-btn--default" onClick={onRetry}>
              Pull Again
            </button>
            <button className="rm-btn rm-btn--ghost" onClick={onRetreat}>
              Retreat to Camp
            </button>
          </div>
        ) : (
          <button
            className="rm-btn rm-btn--default"
            onClick={isVictory ? () => setShowSpoils(true) : onPlayAgain}
          >
            {isVictory ? 'Claim Your Spoils' : 'Muster Again'}
          </button>
        )}
      </div>
    </div>
  )
}

export function OutcomeScreen({
  onPlayAgain,
  onChoosePath,
  onRetreat,
  onInvalidState
}: OutcomeScreenProps): React.JSX.Element | null {
  const isResolved = useRunStore((s) => s.isResolved)
  const outcome = useRunStore((s) => s.outcome)
  const boss = useRunStore((s) => s.boss)
  const bossIndex = useRunStore((s) => s.bossIndex)
  const isRunOver = useRunStore((s) => s.isRunOver)
  const phaseResults = useRunStore((s) => s.phaseResults)
  const phasesSucceeded = useRunStore((s) => s.phasesSucceeded)
  const pullsThisBoss = useRunStore((s) => s.pullsThisBoss)
  const wipePhaseIndex = useRunStore((s) => s.wipePhaseIndex)
  const quitter = useRunStore((s) => s.quitter)
  const retry = useRunStore((s) => s.retry)
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
      key={`${bossIndex}:${pullsThisBoss}`}
      bossName={boss.bossName}
      phaseResults={phaseResults}
      phasesSucceeded={phasesSucceeded}
      outcome={outcome}
      pullsThisBoss={pullsThisBoss}
      wipePhaseIndex={wipePhaseIndex}
      quitter={quitter}
      onContinue={onChoosePath}
      onRetry={retry}
      onRetreat={onRetreat}
      onPlayAgain={handlePlayAgain}
      continueLabel={continueLabel}
    />
  )
}
