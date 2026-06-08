import { useMemo } from 'react'
import { bosses } from '../../domain/data/gameData'
import { MemberData } from '../../domain/data/memberData'
import { projectPhase } from '../../domain/logic/phaseProjection'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { useRunStore } from '../../domain/stores/useRunStore'
import { SectionLabel } from '../shared/SectionLabel'
import { CandidateCard } from './CandidateCard'
import { MusterComplete } from './MusterComplete'
import { PhaseCard } from './PhaseCard'
import { RosterTray } from './RosterTray'

interface DraftScreenProps {
  onProceed: () => void
}

export function DraftScreen({ onProceed }: DraftScreenProps): React.JSX.Element {
  const currentCandidates = useDraftStore((s) => s.currentCandidates)
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const addMember = useDraftStore((s) => s.addMember)
  const isDraftComplete = useDraftStore((s) => s.isDraftComplete)
  const resolve = useRunStore((s) => s.resolve)

  const boss = bosses[0]
  const full = isDraftComplete()
  const round = Math.min(selectedMembers.length + 1, 8)
  const lastAdded =
    selectedMembers.length > 0 ? selectedMembers[selectedMembers.length - 1].memberName : null

  const projections = useMemo(
    () => boss.phases.map((phase) => projectPhase(phase, selectedMembers)),
    [boss.phases, selectedMembers]
  )

  const handlePick = (member: MemberData): void => {
    if (full) return
    addMember(member)
  }

  const handleBegin = (): void => {
    resolve()
    onProceed()
  }

  return (
    <div className="muster-screen">
      <header className="muster-header">
        <div className="muster-header__kicker">The Trial Ahead</div>
        <div className="muster-header__name">{boss.bossName}</div>
        <div className="muster-header__epithet">{boss.epithet}</div>
      </header>

      <main className="muster-body">
        <SectionLabel>The Three Phases</SectionLabel>
        <div className="muster-phases">
          {boss.phases.map((phase, i) => (
            <PhaseCard
              key={phase.name}
              phase={phase}
              index={i}
              projection={projections[i]}
              drafted={selectedMembers.length > 0}
            />
          ))}
        </div>

        {full ? (
          <MusterComplete onBegin={handleBegin} />
        ) : (
          <>
            <SectionLabel accent="var(--parch)">{`Choose One · Round ${round} / 8`}</SectionLabel>
            <div className="muster-candidates">
              {currentCandidates.map((member) => (
                <CandidateCard key={member.memberName} member={member} onPick={handlePick} />
              ))}
            </div>
          </>
        )}
      </main>

      <RosterTray roster={selectedMembers} lastAdded={lastAdded} />
    </div>
  )
}
