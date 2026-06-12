import { Fragment } from 'react'
import { MemberData } from '../../domain/data/memberData'
import { Role, ROLE_LABELS } from '../../domain/data/role'
import { ROLE_CAPS } from '../../domain/stores/useDraftStore'
import { useLootStore } from '../../domain/stores/useLootStore'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { PERSONALITY_META } from '../../domain/data/personality'
import { ROLE_HEX, lastName } from './formatting'
import { PersonalityGlyph } from './PersonalityMark'
import { RoleGlyph } from './RoleGlyph'
import { StatBar } from './StatBar'

const ROLE_ORDER = [Role.TANK, Role.HEAL, Role.DPS]

function MusterChip({ member }: { member: MemberData }): React.JSX.Element {
  const skill = useLootStore((s) => s.effectiveStat(member, 'skill'))
  const discipline = useLootStore((s) => s.effectiveStat(member, 'discipline'))
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))
  const meta = PERSONALITY_META[personality]

  return (
    <div
      className="muster-chip"
      style={{ borderLeftColor: ROLE_HEX[member.role] }}
      title={`${member.memberName} — ${ROLE_LABELS[member.role]} · ${meta.label}`}
    >
      <div className="muster-chip__head">
        <RoleGlyph role={member.role} size={22} />
        <span className="muster-chip__name">{lastName(member.memberName)}</span>
        <PersonalityGlyph glyph={meta.glyph} hue={meta.hue} size={8} glow={!meta.quiet} />
      </div>
      <div className="muster-chip__stats">
        <StatBar label="Skill" value={skill} accent="var(--rm-skill)" />
        <StatBar label="Disc" value={discipline} accent="var(--rm-discipline)" />
      </div>
    </div>
  )
}

function EmptyChip({ role }: { role: Role }): React.JSX.Element {
  return (
    <div
      className="muster-chip muster-chip--empty"
      style={{ borderLeftColor: `${ROLE_HEX[role]}55` }}
    >
      <span className="muster-chip__empty-label" style={{ color: `${ROLE_HEX[role]}99` }}>
        {ROLE_LABELS[role]} — open slot
      </span>
    </div>
  )
}

interface MusterPanelProps {
  roster: MemberData[]
  // Pad each role group with empty slots up to its cap (draft in progress)
  showEmpty?: boolean
  title?: string
}

export function MusterPanel({
  roster,
  showEmpty = false,
  title = 'The Muster'
}: MusterPanelProps): React.JSX.Element {
  return (
    <div className="muster-panel">
      <div className="muster-panel__header">
        <span className="muster-panel__title">{title}</span>
        <span className="muster-panel__count">
          {roster.length}
          <span className="muster-panel__count-max"> / 8</span>
        </span>
      </div>
      <div className="muster-panel__grid">
        {ROLE_ORDER.map((role) => {
          const members = roster.filter((m) => m.role === role)
          const blanks = showEmpty ? ROLE_CAPS[role] - members.length : 0
          return (
            <Fragment key={role}>
              {members.map((member) => (
                <MusterChip key={member.memberName} member={member} />
              ))}
              {Array.from({ length: Math.max(0, blanks) }, (_, i) => (
                <EmptyChip key={`${role}-empty-${i}`} role={role} />
              ))}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
