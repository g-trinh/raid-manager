import { Fragment } from 'react'
import { MemberData } from '../../domain/data/memberData'
import { PERSONALITY_LABELS, Personality } from '../../domain/data/personality'
import { Role, ROLE_LABELS } from '../../domain/data/role'
import { ROLE_CAPS } from '../../domain/stores/useDraftStore'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { ROLE_HEX, lastInitial } from '../shared/formatting'

interface RosterTrayProps {
  roster: MemberData[]
  lastAdded: string | null
}

const GROUPS = [Role.TANK, Role.HEAL, Role.DPS]

interface RosterSlotProps {
  member: MemberData | null
  role: Role
  justAdded: boolean
  personality?: Personality
}

function RosterSlot({ member, role, justAdded, personality }: RosterSlotProps): React.JSX.Element {
  const hex = ROLE_HEX[role]
  if (!member) {
    return (
      <div className="roster-slot" title="Empty">
        <span
          className="roster-slot__diamond roster-slot__diamond--empty"
          style={{ borderColor: `${hex}44` }}
        />
      </div>
    )
  }
  const personalityLabel =
    personality && personality !== Personality.LONER ? ` · ${PERSONALITY_LABELS[personality]}` : ''
  return (
    <div
      className={`roster-slot${justAdded ? ' roster-slot--pop' : ''}`}
      title={`${member.memberName} — ${ROLE_LABELS[member.role]}${personalityLabel}`}
    >
      <span
        className="roster-slot__diamond"
        style={{
          background: `linear-gradient(140deg, ${hex}33, ${hex}11)`,
          border: `1.5px solid ${hex}`,
          boxShadow: `0 0 7px ${hex}44, inset 0 0 6px ${hex}22`
        }}
      />
      <span className="roster-slot__letter">{lastInitial(member.memberName)}</span>
    </div>
  )
}

export function RosterTray({ roster, lastAdded }: RosterTrayProps): React.JSX.Element {
  const personalityOf = usePersonalityStore((s) => s.personalityOf)
  return (
    <div className="roster-tray">
      <div className="roster-tray__header">
        <span className="roster-tray__title">The Muster</span>
        <span className="roster-tray__count">
          {roster.length}
          <span className="roster-tray__count-max"> / 8</span>
        </span>
      </div>
      <div className="roster-tray__groups">
        {GROUPS.map((role, gi) => {
          const members = roster.filter((m) => m.role === role)
          const cap = ROLE_CAPS[role]
          const slots = Array.from({ length: cap }, (_, i) => members[i] ?? null)
          return (
            <Fragment key={role}>
              {gi > 0 && <div className="roster-tray__divider" />}
              <div className="roster-tray__group">
                <div className="roster-tray__slots">
                  {slots.map((m, i) => (
                    <RosterSlot
                      key={i}
                      member={m}
                      role={role}
                      justAdded={Boolean(lastAdded && m && m.memberName === lastAdded)}
                      personality={m ? personalityOf(m.memberName) : undefined}
                    />
                  ))}
                </div>
                <span className="roster-tray__group-label" style={{ color: ROLE_HEX[role] }}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
