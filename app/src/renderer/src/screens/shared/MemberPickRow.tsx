import { MemberData } from '../../domain/data/memberData'
import { useLootStore } from '../../domain/stores/useLootStore'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { ROLE_HEX } from './formatting'
import { PersonalityMark } from './PersonalityMark'
import { RoleGlyph } from './RoleGlyph'
import { StatBar } from './StatBar'

interface MemberPickRowProps {
  member: MemberData
  // Stat values after the pick — pips preview the difference
  projectedSkill?: number
  projectedDiscipline?: number
  onPick: (member: MemberData) => void
  onHover?: (member: MemberData) => void
}

// The one clickable member row for every "pick a member" list (loot picker,
// camp rest picker): identity on the left, pip rows with projected gains.
export function MemberPickRow({
  member,
  projectedSkill,
  projectedDiscipline,
  onPick,
  onHover
}: MemberPickRowProps): React.JSX.Element {
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))
  const skill = useLootStore((s) => s.effectiveStat(member, 'skill'))
  const discipline = useLootStore((s) => s.effectiveStat(member, 'discipline'))

  return (
    <button
      className="loot-option"
      style={{ borderLeftColor: ROLE_HEX[member.role] }}
      onClick={() => onPick(member)}
      onMouseEnter={() => onHover?.(member)}
    >
      <RoleGlyph role={member.role} size={32} />
      <div className="loot-option__body">
        <div className="loot-option__name">
          {member.memberName}
          <PersonalityMark personality={personality} size={8} />
        </div>
        <div className="loot-option__stats">
          <StatBar
            label="Skill"
            value={skill}
            projected={projectedSkill}
            accent="var(--rm-skill)"
          />
          <StatBar
            label="Disc"
            value={discipline}
            projected={projectedDiscipline}
            accent="var(--rm-discipline)"
          />
        </div>
      </div>
    </button>
  )
}
