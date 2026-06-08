import { useEffect, useState } from 'react'
import { boss } from '../../domain/data/gameData'
import { PhaseType } from '../../domain/data/bossPhaseData'
import { Outcome, PhaseResult, useRunStore } from '../../domain/stores/useRunStore'
import { ROMAN, pct } from '../shared/formatting'

interface OutcomeScreenProps {
  onPlayAgain: () => void
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
    head: 'The Inferno Falls',
    sub: 'Three trials, three triumphs. The raid stands whole in the ash.'
  },
  [Outcome.NARROW_VICTORY]: {
    color: '#d99a3c',
    head: 'A Costly Triumph',
    sub: 'Moloch is undone — but the muster paid in blood for it.'
  },
  [Outcome.DEFEAT]: {
    color: '#b8472f',
    head: 'The Guild Is Broken',
    sub: 'The forge-dark takes them. No retreat, no retry, no dawn.'
  }
}

const REVEAL_START_MS = 700
const REVEAL_STEP_MS = 1050
const OUTCOME_DELAY_MS = 350

interface PhaseResolveRowProps {
  result: PhaseResult
  index: number
  visible: boolean
}

function PhaseResolveRow({ result, index, visible }: PhaseResolveRowProps): React.JSX.Element {
  const { phase, chance, success } = result
  const tested = phase.phaseType === PhaseType.SKILL_HEAVY ? 'Skill' : 'Liability'
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

export function OutcomeScreen({
  onPlayAgain,
  onInvalidState
}: OutcomeScreenProps): React.JSX.Element | null {
  const isResolved = useRunStore((s) => s.isResolved)
  const outcome = useRunStore((s) => s.outcome)
  const phaseResults = useRunStore((s) => s.phaseResults)
  const phasesSucceeded = useRunStore((s) => s.phasesSucceeded)
  const reset = useRunStore((s) => s.reset)

  const [revealed, setRevealed] = useState(0)
  const [showOutcome, setShowOutcome] = useState(false)

  useEffect(() => {
    if (!isResolved) {
      console.warn('OutcomeScreen loaded without resolution')
      onInvalidState()
    }
  }, [isResolved, onInvalidState])

  useEffect(() => {
    if (!isResolved) return undefined

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
  }, [isResolved, phaseResults])

  if (!isResolved) return null

  const meta = OUTCOME_META[outcome]

  const handlePlayAgain = (): void => {
    reset()
    onPlayAgain()
  }

  return (
    <div className="resolution-screen">
      <div className="resolution-screen__header">
        <div className="resolution-screen__kicker">The Attempt</div>
        <div className="resolution-screen__name">{boss.bossName}</div>
      </div>

      <div className="resolution-screen__rows">
        {phaseResults.map((result, i) => (
          <PhaseResolveRow
            key={result.phase.name}
            result={result}
            index={i}
            visible={revealed > i}
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
        <button
          className="resolution-outcome__button"
          style={{ borderTopColor: meta.color }}
          onClick={handlePlayAgain}
        >
          Muster Again
        </button>
      </div>
    </div>
  )
}
