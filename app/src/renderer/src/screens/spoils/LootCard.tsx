import { useState } from 'react'
import { LootItemData } from '../../domain/data/lootData'
import { MemberData } from '../../domain/data/memberData'
import { ROLE_LABELS } from '../../domain/data/role'
import { useLootStore } from '../../domain/stores/useLootStore'
import { ROLE_HEX } from '../shared/formatting'
import { RoleGlyph } from '../shared/RoleGlyph'

export type LootResolution = { type: 'equipped'; member: MemberData } | { type: 'discarded' }

interface MemberOptionProps {
  member: MemberData
  item: LootItemData
  onPick: (member: MemberData) => void
  onHover?: (member: MemberData) => void
}

function MemberOption({ member, item, onPick, onHover }: MemberOptionProps): React.JSX.Element {
  const currentSkill = useLootStore((s) => s.effectiveStat(member, 'skill'))
  const currentDiscipline = useLootStore((s) => s.effectiveStat(member, 'discipline'))
  const projectedSkill = useLootStore((s) => s.projectedStat(member, item, 'skill'))
  const projectedDiscipline = useLootStore((s) => s.projectedStat(member, item, 'discipline'))

  return (
    <button
      className="loot-option"
      style={{ borderLeftColor: ROLE_HEX[member.role] }}
      onClick={() => onPick(member)}
      onMouseEnter={() => onHover?.(member)}
    >
      <RoleGlyph role={member.role} size={32} />
      <div className="loot-option__body">
        <div className="loot-option__name">{member.memberName}</div>
        <div className="loot-option__projection">
          Skill {currentSkill} <span className="loot-option__arrow">→</span>{' '}
          <span className="loot-option__gain">{projectedSkill}</span>
          <span className="loot-option__sep"> · </span>
          Discipline {currentDiscipline} <span className="loot-option__arrow">→</span>{' '}
          <span className="loot-option__gain">{projectedDiscipline}</span>
        </div>
      </div>
    </button>
  )
}

interface LootCardProps {
  item: LootItemData
  eligibleMembers: MemberData[]
  resolution?: LootResolution
  showBench?: boolean
  onEquip: (member: MemberData) => void
  onBench: () => void
  onDiscard: () => void
  onHoverMember?: (member: MemberData) => void
  onLeaveMember?: () => void
}

export function LootCard({
  item,
  eligibleMembers,
  resolution,
  showBench = false,
  onEquip,
  onBench,
  onDiscard,
  onHoverMember,
  onLeaveMember
}: LootCardProps): React.JSX.Element {
  const [pickerOpen, setPickerOpen] = useState(false)
  const hex = ROLE_HEX[item.roleLock]

  if (resolution) {
    return (
      <div className={`loot-card loot-card--${resolution.type}`} style={{ borderLeftColor: hex }}>
        <RoleGlyph role={item.roleLock} size={38} />
        <div className="loot-card__body">
          <div className="loot-card__name">{item.name}</div>
          <div className="loot-card__outcome">
            {resolution.type === 'equipped'
              ? `Bestowed upon ${resolution.member.memberName}`
              : 'Cast aside, lost to the dark'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="loot-card" style={{ borderLeftColor: hex }}>
      <div className="loot-card__header">
        <RoleGlyph role={item.roleLock} size={38} />
        <div className="loot-card__body">
          <div className="loot-card__name">{item.name}</div>
          <div className="loot-card__role">{ROLE_LABELS[item.roleLock]}-bound</div>
          <div className="loot-card__flavor">{item.flavor}</div>
          <div className="loot-card__bonus">
            +{item.skillBonus} Skill · +{item.disciplineBonus} Discipline
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <div className="loot-card__picker" onMouseLeave={() => onLeaveMember?.()}>
          {eligibleMembers.map((member) => (
            <MemberOption
              key={member.memberName}
              member={member}
              item={item}
              onPick={onEquip}
              onHover={onHoverMember}
            />
          ))}
          <button
            className="loot-card__action loot-card__action--cancel"
            onClick={() => {
              setPickerOpen(false)
              onLeaveMember?.()
            }}
          >
            Back
          </button>
        </div>
      ) : (
        <div className="loot-card__actions">
          <button
            className="loot-card__action loot-card__action--equip"
            onClick={() => setPickerOpen(true)}
          >
            Equip
          </button>
          {showBench && (
            <button className="loot-card__action" onClick={onBench}>
              Bench
            </button>
          )}
          <button className="loot-card__action loot-card__action--discard" onClick={onDiscard}>
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
