import { MemberData } from '../../domain/data/memberData'
import { ROLE_LABELS } from '../../domain/data/role'

interface MemberCardProps {
  member: MemberData
  interactive?: boolean
  onPress?: (member: MemberData) => void
}

export function MemberCard({
  member,
  interactive = true,
  onPress
}: MemberCardProps): React.JSX.Element {
  return (
    <div
      className={`member-card${interactive ? ' member-card--interactive' : ''}`}
      onClick={interactive ? () => onPress?.(member) : undefined}
    >
      <span className="member-card__name">{member.memberName}</span>
      <span className="member-card__role">{ROLE_LABELS[member.role]}</span>
      <span className="member-card__skill">Skill: {member.skill}</span>
      <span className="member-card__liability">Liability: {member.liability}</span>
    </div>
  )
}
