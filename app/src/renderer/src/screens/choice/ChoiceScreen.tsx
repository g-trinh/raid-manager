import { useMemo } from 'react'
import { BossData } from '../../domain/data/bossData'
import { useCampStore } from '../../domain/stores/useCampStore'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { useLootStore } from '../../domain/stores/useLootStore'
import { useRunStore } from '../../domain/stores/useRunStore'
import { MusterPanel } from '../shared/MusterPanel'
import { BossCandidateCard } from './BossCandidateCard'
import { RunTrail } from './RunTrail'

interface TrialCopy {
  kicker: string
  title: string
  sub: string
}

const TRIAL_COPY: Record<number, TrialCopy> = {
  2: {
    kicker: 'Trial II of III · Even Match',
    title: 'The Road Forks',
    sub: 'The first trial is behind you. Two roads run deeper into the dark — only one can be walked.'
  },
  3: {
    kicker: 'Trial III of III · The Deep Dark',
    title: 'The Final Trial',
    sub: 'One foe remains between the muster and the end. Choose the death you can survive.'
  }
}

interface ChoiceScreenProps {
  onPicked: () => void
}

export function ChoiceScreen({ onPicked }: ChoiceScreenProps): React.JSX.Element | null {
  const pendingChoice = useRunStore((s) => s.pendingChoice)
  const runBosses = useRunStore((s) => s.runBosses)
  const bossOutcomes = useRunStore((s) => s.bossOutcomes)
  const bossIndex = useRunStore((s) => s.bossIndex)
  const chooseBoss = useRunStore((s) => s.chooseBoss)
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const effectiveRoster = useLootStore((s) => s.effectiveRoster)
  const scouted = useCampStore((s) => s.scouted)
  const consumeScout = useCampStore((s) => s.consumeScout)

  const roster = useMemo(() => effectiveRoster(selectedMembers), [effectiveRoster, selectedMembers])

  if (!pendingChoice) return null

  const trialIndex = bossIndex + 2
  const copy = TRIAL_COPY[trialIndex]
  const resolved = runBosses.map((boss, i) => ({ boss, outcome: bossOutcomes[i] }))

  const handlePick = (boss: BossData): void => {
    chooseBoss(boss)
    consumeScout()
    onPicked()
  }

  return (
    <div className="choice-screen">
      <header className="choice-header">
        <div className="choice-header__kicker">{copy.kicker}</div>
        <div className="choice-header__title">{copy.title}</div>
        <div className="choice-header__sub">{copy.sub}</div>
        <RunTrail trialIndex={trialIndex} resolved={resolved} />
      </header>

      <main className="choice-body">
        <div className="choice-layout">
          <div className="choice-candidates">
            {pendingChoice.map((boss) => (
              <BossCandidateCard
                key={boss.bossName}
                boss={boss}
                roster={roster}
                scouted={scouted}
                onPick={handlePick}
              />
            ))}
          </div>
          <aside className="choice-muster">
            <MusterPanel roster={selectedMembers} />
          </aside>
        </div>
        <div className="choice-footnote">
          {scouted
            ? 'The outriders have read each foe against the locked muster. The road not taken is lost — that foe will not return this run.'
            : 'The muster can weigh its odds at a glance — send outriders at camp for phase-by-phase forecasts. The road not taken is lost.'}
        </div>
      </main>
    </div>
  )
}
