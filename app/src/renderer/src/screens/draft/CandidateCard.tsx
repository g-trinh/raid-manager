import { Personality } from '../../domain/data/personality'
import { MemberData } from '../../domain/data/memberData'
import { ROLE_LABELS } from '../../domain/data/role'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { ROLE_HEX } from '../shared/formatting'
import { PersonalityMark } from '../shared/PersonalityMark'
import { RoleGlyph } from '../shared/RoleGlyph'
import { StatBar } from '../shared/StatBar'

interface CandidateCardProps {
  member: MemberData
  onPick: (member: MemberData) => void
}

export function CandidateCard({ member, onPick }: CandidateCardProps): React.JSX.Element {
  const hex = ROLE_HEX[member.role]
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))

  return (
    <button
      className="candidate-card"
      style={{ borderLeftColor: hex }}
      onClick={() => onPick(member)}
    >
      <RoleGlyph role={member.role} size={40} />
      <div className="candidate-card__body">
        <div className="candidate-card__name">{member.memberName}</div>
        <div className="candidate-card__role">{ROLE_LABELS[member.role]}</div>
        {personality !== Personality.LONER && (
          <div className="candidate-card__personality">
            <PersonalityMark personality={personality} size={9} />
          </div>
        )}
        <div className="candidate-card__stats">
          <StatBar label="Skill" value={member.skill} accent="#d9c089" />
          <StatBar label="Liability" value={member.liability} accent="#9fb2c4" />
        </div>
      </div>
    </button>
  )
}
