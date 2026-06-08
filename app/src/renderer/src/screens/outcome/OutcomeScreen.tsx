import { useEffect } from 'react'
import { Outcome, useRunStore } from '../../domain/stores/useRunStore'

interface OutcomeScreenProps {
  onPlayAgain: () => void
  onInvalidState: () => void
}

const OUTCOME_TITLES: Record<Outcome, string> = {
  [Outcome.FULL_VICTORY]: 'Full Victory',
  [Outcome.NARROW_VICTORY]: 'Narrow Victory',
  [Outcome.DEFEAT]: 'Defeat'
}

export function OutcomeScreen({
  onPlayAgain,
  onInvalidState
}: OutcomeScreenProps): React.JSX.Element | null {
  const isResolved = useRunStore((s) => s.isResolved)
  const outcome = useRunStore((s) => s.outcome)
  const phasesSucceeded = useRunStore((s) => s.phasesSucceeded)
  const reset = useRunStore((s) => s.reset)

  useEffect(() => {
    if (!isResolved) {
      console.warn('OutcomeScreen loaded without resolution')
      onInvalidState()
    }
  }, [isResolved, onInvalidState])

  if (!isResolved) return null

  const handlePlayAgain = (): void => {
    reset()
    onPlayAgain()
  }

  return (
    <div className="outcome-screen">
      <h1 className="title-label">{OUTCOME_TITLES[outcome]}</h1>
      <p className="phases-label">{phasesSucceeded} / 3 phases succeeded</p>
      <button className="play-again-button" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  )
}
