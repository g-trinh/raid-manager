import { useEffect, useState } from 'react'
import { MemberData } from '../../domain/data/memberData'
import { PERSONALITY_META } from '../../domain/data/personality'
import { ROLE_LABELS } from '../../domain/data/role'
import { BestowResult, RingType, useLootStore } from '../../domain/stores/useLootStore'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { ROLE_HEX, lastName } from './formatting'
import { PersonalityGlyph } from './PersonalityMark'
import { RoleGlyph } from './RoleGlyph'
import { StatBar } from './StatBar'

const LOOT_GOLD = '#d9c089'

type Pulse = BestowResult & { token: number }

interface FloatEntry {
  key: string
  text: string
  positive: boolean
  muted?: boolean
}

interface MusterChipProps {
  member: MemberData
  // Optional grant-moment feedback (spoils/camp reacts strip)
  pulse?: Pulse | null
  ring?: RingType | null
}

// The one way a member renders everywhere: role glyph, name, run-delta badge,
// personality glyph, and Skill/Discipline pip rows. With a pulse it also plays
// the grant-moment feedback (flash, floats, preview ring).
export function MusterChip({
  member,
  pulse = null,
  ring = null
}: MusterChipProps): React.JSX.Element {
  const skill = useLootStore((s) => s.effectiveStat(member, 'skill'))
  const discipline = useLootStore((s) => s.effectiveStat(member, 'discipline'))
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))
  const meta = PERSONALITY_META[personality]

  const [flash, setFlash] = useState<'gold' | 'hue' | null>(null)
  const [floats, setFloats] = useState<FloatEntry[]>([])
  const [seenToken, setSeenToken] = useState<number | null>(null)

  // Adjust state when a new pulse arrives (render-time, per React docs),
  // then let the effect below only manage the clear timers.
  if (pulse && pulse.token !== seenToken) {
    setSeenToken(pulse.token)
    const delta = pulse.applied[member.memberName]
    const capped = pulse.capped?.[member.memberName]
    const fl: FloatEntry[] = []
    if (delta) {
      if (delta.skill !== 0)
        fl.push({
          key: 's',
          text: `${delta.skill > 0 ? '+' : ''}${delta.skill} Skill`,
          positive: delta.skill > 0
        })
      if (delta.discipline !== 0)
        fl.push({
          key: 'd',
          text: `${delta.discipline > 0 ? '+' : ''}${delta.discipline} Disc`,
          positive: delta.discipline > 0
        })
    }
    // Reactions fully swallowed by the [0,5] clamp still announce themselves
    if (capped?.skill) fl.push({ key: 'sc', text: 'Skill at peak', positive: true, muted: true })
    if (capped?.discipline)
      fl.push({ key: 'dc', text: 'Disc at peak', positive: true, muted: true })
    if (fl.length > 0) {
      setFlash(pulse.recipient === member.memberName ? 'gold' : 'hue')
      setFloats(fl)
    }
  }

  useEffect(() => {
    if (seenToken === null) return
    const t1 = setTimeout(() => setFlash(null), 950)
    const t2 = setTimeout(() => setFloats([]), 1200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [seenToken])

  // Provenance: how far the run (loot, morale, camp) has moved this member off base
  const net = skill - member.skill + (discipline - member.discipline)
  const provenance = [
    `Skill: base ${member.skill}${skill !== member.skill ? ` → ${skill}` : ''}`,
    `Discipline: base ${member.discipline}${discipline !== member.discipline ? ` → ${discipline}` : ''}`
  ].join(' · ')

  const flashColor = flash === 'gold' ? LOOT_GOLD : meta.hue

  return (
    <div
      className="muster-chip"
      style={{
        borderLeftColor: ROLE_HEX[member.role],
        background: flash
          ? `color-mix(in oklab, ${flashColor} 12%, rgba(0, 0, 0, 0.25))`
          : undefined,
        boxShadow: flash
          ? `0 0 0 1px ${flashColor}, 0 0 13px color-mix(in oklab, ${flashColor} 55%, transparent)`
          : undefined
      }}
      title={`${member.memberName} — ${ROLE_LABELS[member.role]} · ${meta.label}\n${provenance}`}
    >
      <div className="muster-chip__head">
        <RoleGlyph role={member.role} size={22} />
        <span className="muster-chip__name">{lastName(member.memberName)}</span>
        {net !== 0 && (
          <span
            className="muster-chip__delta"
            style={{ color: net > 0 ? 'var(--rm-safe)' : 'var(--rm-fail)' }}
          >
            {net > 0 ? `▲${net}` : `▼${Math.abs(net)}`}
          </span>
        )}
        <PersonalityGlyph glyph={meta.glyph} hue={meta.hue} size={8} glow={!meta.quiet} />
      </div>
      <div className="muster-chip__stats">
        <StatBar label="Skill" value={skill} accent="var(--rm-skill)" />
        <StatBar label="Disc" value={discipline} accent="var(--rm-discipline)" />
      </div>

      {floats.length > 0 && (
        <div className="muster-chip__floats">
          {floats.map((f, i) => (
            <span
              key={f.key}
              className="muster-chip__float"
              style={{
                color: f.muted ? 'var(--ash)' : f.positive ? '#a6b67c' : '#cc5436',
                textShadow: f.muted ? 'none' : `0 0 8px ${f.positive ? '#a6b67c' : '#cc5436'}99`,
                animationDelay: `${i * 0.06}s`
              }}
            >
              {f.text}
            </span>
          ))}
        </div>
      )}

      {ring && (
        <span
          aria-hidden="true"
          className="muster-chip__ring"
          style={{
            background:
              ring === 'white'
                ? '#f4eede'
                : ring === 'trait'
                  ? meta.hue
                  : `linear-gradient(135deg, #ffffff 0%, #f4eede 42%, ${meta.hue} 100%)`,
            filter:
              ring === 'white'
                ? 'drop-shadow(0 0 4px rgba(244,238,222,0.92))'
                : `drop-shadow(0 0 4px color-mix(in oklab, ${meta.hue} 85%, white))`
          }}
        />
      )}
    </div>
  )
}
