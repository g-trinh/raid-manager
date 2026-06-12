import { MemberData } from '../../domain/data/memberData'
import { Role } from '../../domain/data/role'
import { useLootStore } from '../../domain/stores/useLootStore'
import { MemberPickRow } from '../shared/MemberPickRow'

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
  // Rest mends the weaker stat (tie → Discipline) — mirror useCampStore.rest()
  const mendsSkill = skill < discipline

  return (
    <MemberPickRow
      member={member}
      projectedSkill={mendsSkill ? skill + 1 : undefined}
      projectedDiscipline={mendsSkill ? undefined : discipline + 1}
      onPick={onPick}
    />
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
