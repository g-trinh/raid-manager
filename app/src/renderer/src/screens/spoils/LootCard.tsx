import { useState } from 'react'
import { LootItemData } from '../../domain/data/lootData'
import { MemberData } from '../../domain/data/memberData'
import { ROLE_LABELS } from '../../domain/data/role'
import { useLootStore } from '../../domain/stores/useLootStore'
import { ROLE_HEX } from '../shared/formatting'
import { MemberPickRow } from '../shared/MemberPickRow'
import { RoleGlyph } from '../shared/RoleGlyph'

export type LootResolution = { type: 'equipped'; member: MemberData } | { type: 'discarded' }

interface MemberOptionProps {
  member: MemberData
  item: LootItemData
  onPick: (member: MemberData) => void
  onHover?: (member: MemberData) => void
}

function MemberOption({ member, item, onPick, onHover }: MemberOptionProps): React.JSX.Element {
  const projectedSkill = useLootStore((s) => s.projectedStat(member, item, 'skill'))
  const projectedDiscipline = useLootStore((s) => s.projectedStat(member, item, 'discipline'))

  return (
    <MemberPickRow
      member={member}
      projectedSkill={projectedSkill}
      projectedDiscipline={projectedDiscipline}
      onPick={onPick}
      onHover={onHover}
    />
  )
}

interface LootCardProps {
  item: LootItemData
  eligibleMembers: MemberData[]
  // Full muster — needed to predict bystander reactions on hover
  roster?: MemberData[]
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
  roster = [],
  resolution,
  showBench = false,
  onEquip,
  onBench,
  onDiscard,
  onHoverMember,
  onLeaveMember
}: LootCardProps): React.JSX.Element {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hovered, setHovered] = useState<MemberData | null>(null)
  const previewReactions = useLootStore((s) => s.previewReactions)

  const hintLines = hovered && roster.length > 0 ? previewReactions(item, hovered, roster) : []

  const handleHover = (member: MemberData): void => {
    setHovered(member)
    onHoverMember?.(member)
  }

  const handleLeave = (): void => {
    setHovered(null)
    onLeaveMember?.()
  }
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
          <div className="loot-card__name">
            {item.name}
            <span className={`loot-card__rarity loot-card__rarity--${item.rarity}`}>
              {item.rarity === 'rare' ? 'Signature' : 'Common'}
            </span>
          </div>
          <div className="loot-card__role">{ROLE_LABELS[item.roleLock]}-bound</div>
          <div className="loot-card__flavor">{item.flavor}</div>
          <div className="loot-card__bonus">
            {[
              item.skillBonus > 0 && `+${item.skillBonus} Skill`,
              item.disciplineBonus > 0 && `+${item.disciplineBonus} Discipline`
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <div className="loot-card__picker" onMouseLeave={handleLeave}>
          {eligibleMembers.map((member) => (
            <MemberOption
              key={member.memberName}
              member={member}
              item={item}
              onPick={onEquip}
              onHover={handleHover}
            />
          ))}
          {hovered && (
            <div className="loot-card__hint">
              {hintLines.length > 0 ? (
                hintLines.map((line) => (
                  <div key={line} className="loot-card__hint-line">
                    {line}
                  </div>
                ))
              ) : (
                <div className="loot-card__hint-line loot-card__hint-line--quiet">
                  Nobody else will react.
                </div>
              )}
            </div>
          )}
          <button
            className="loot-card__action loot-card__action--cancel"
            onClick={() => {
              setPickerOpen(false)
              handleLeave()
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
