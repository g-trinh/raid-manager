import { MemberData } from '../../domain/data/memberData'
import { Role } from '../../domain/data/role'
import { useLootStore } from '../../domain/stores/useLootStore'
import { ROLE_HEX } from '../shared/formatting'
import { RoleGlyph } from '../shared/RoleGlyph'

const ROLE_ORDER = [Role.TANK, Role.HEAL, Role.DPS]

interface RestPickerProps {
  roster: MemberData[]
  onPick: (member: MemberData) => void
  onBack: () => void
}

function RestOption({
  member,
  onPick
}: {
  member: MemberData
  onPick: (member: MemberData) => void
}): React.JSX.Element {
  const skill = useLootStore((s) => s.effectiveStat(member, 'skill'))
  const discipline = useLootStore((s) => s.effectiveStat(member, 'discipline'))
  const mended = skill < discipline ? 'Skill' : 'Discipline'

  return (
    <button
      className="loot-option"
      style={{ borderLeftColor: ROLE_HEX[member.role] }}
      onClick={() => onPick(member)}
    >
      <RoleGlyph role={member.role} size={32} />
      <div className="loot-option__body">
        <div className="loot-option__name">{member.memberName}</div>
        <div className="loot-option__projection">
          Skill {skill} · Discipline {discipline} <span className="loot-option__sep">→</span>{' '}
          <span className="loot-option__gain">+1 {mended}</span>
        </div>
      </div>
    </button>
  )
}

export function RestPicker({ roster, onPick, onBack }: RestPickerProps): React.JSX.Element {
  const ordered = ROLE_ORDER.flatMap((role) => roster.filter((m) => m.role === role))
  return (
    <div className="camp-rest-picker">
      {ordered.map((member) => (
        <RestOption key={member.memberName} member={member} onPick={onPick} />
      ))}
      <button className="loot-card__action loot-card__action--cancel" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
