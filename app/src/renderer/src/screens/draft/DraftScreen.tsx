import { useDraftStore } from '../../domain/stores/useDraftStore'
import { useRunStore } from '../../domain/stores/useRunStore'
import { Role } from '../../domain/data/role'
import { MemberData } from '../../domain/data/memberData'
import { MemberCard } from './MemberCard'

interface DraftScreenProps {
  onProceed: () => void
}

export function DraftScreen({ onProceed }: DraftScreenProps): React.JSX.Element {
  const currentCandidates = useDraftStore((s) => s.currentCandidates)
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const addMember = useDraftStore((s) => s.addMember)
  const getRoleCount = useDraftStore((s) => s.getRoleCount)
  const isDraftComplete = useDraftStore((s) => s.isDraftComplete)
  const resolve = useRunStore((s) => s.resolve)

  const handleCardPressed = (member: MemberData): void => {
    addMember(member)
  }

  const handleProceed = (): void => {
    resolve()
    onProceed()
  }

  return (
    <div className="draft-screen">
      <div className="slot-tracker">
        <span>Tanks: {getRoleCount(Role.TANK)}/2</span>
        <span>Heal: {getRoleCount(Role.HEAL)}/2</span>
        <span>DPS: {getRoleCount(Role.DPS)}/4</span>
      </div>

      <div className="hsplit-layout">
        <div className="available-panel">
          <h2>Candidates</h2>
          <div className="member-grid">
            {currentCandidates.map((member) => (
              <MemberCard
                key={member.memberName}
                member={member}
                interactive
                onPress={handleCardPressed}
              />
            ))}
          </div>
        </div>

        <div className="team-panel">
          <h2>Your Team</h2>
          <div className="team-list">
            {selectedMembers.map((member) => (
              <MemberCard key={member.memberName} member={member} interactive={false} />
            ))}
          </div>
        </div>
      </div>

      <button className="proceed-button" disabled={!isDraftComplete()} onClick={handleProceed}>
        Proceed
      </button>
    </div>
  )
}
