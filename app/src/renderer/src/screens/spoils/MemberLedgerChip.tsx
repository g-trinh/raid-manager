import { useEffect, useState } from 'react'
import { BestowResult, RingType } from '../../domain/stores/useLootStore'
import { MemberData } from '../../domain/data/memberData'
import { PERSONALITY_META } from '../../domain/data/personality'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { useCountUp } from '../../domain/hooks/useCountUp'
import { ROLE_HEX } from '../shared/formatting'
import { PersonalityGlyph } from '../shared/PersonalityMark'

const LOOT_GOLD = '#d9c089'

interface FloatEntry {
  key: string
  text: string
  positive: boolean
}

interface MemberLedgerChipProps {
  member: MemberData
  skill: number
  discipline: number
  pulse: (BestowResult & { token: number }) | null
  ring: RingType | null
}

export function MemberLedgerChip({
  member,
  skill,
  discipline,
  pulse,
  ring
}: MemberLedgerChipProps): React.JSX.Element {
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))
  const meta = PERSONALITY_META[personality]
  const hex = ROLE_HEX[member.role]

  const dispS = useCountUp(skill)
  const dispD = useCountUp(discipline)

  const [flash, setFlash] = useState<'gold' | 'hue' | null>(null)
  const [floats, setFloats] = useState<FloatEntry[]>([])
  const [seenToken, setSeenToken] = useState<number | null>(null)

  // Adjust state when a new pulse arrives (render-time, per React docs),
  // then let the effect below only manage the clear timers.
  if (pulse && pulse.token !== seenToken) {
    setSeenToken(pulse.token)
    const delta = pulse.applied[member.memberName]
    if (delta && (delta.skill !== 0 || delta.discipline !== 0)) {
      setFlash(pulse.recipient === member.memberName ? 'gold' : 'hue')
      const fl: FloatEntry[] = []
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

  const flashColor = flash === 'gold' ? LOOT_GOLD : meta.hue
  const hasSkillFloat = floats.some((f) => f.key === 's')
  const hasDiscFloat = floats.some((f) => f.key === 'd')

  return (
    <div
      className="ledger-chip"
      style={{
        borderLeftColor: hex,
        background: flash
          ? `color-mix(in oklab, ${flashColor} 12%, rgba(0,0,0,0.22))`
          : 'rgba(0,0,0,0.22)',
        boxShadow: flash
          ? `0 0 0 1px ${flashColor}, 0 0 13px color-mix(in oklab, ${flashColor} 55%, transparent)`
          : 'none'
      }}
    >
      <PersonalityGlyph glyph={meta.glyph} hue={meta.hue} size={8} glow={!meta.quiet} />

      <span className="ledger-chip__name">{member.memberName.split(' ').slice(-1)[0]}</span>

      <span className="ledger-chip__stats">
        <span className="ledger-chip__stat">
          S
          <b
            style={{
              color: flash && hasSkillFloat ? flashColor : 'var(--parch)',
              transition: 'color 0.3s'
            }}
          >
            {dispS}
          </b>
        </span>
        <span className="ledger-chip__stat">
          D
          <b
            style={{
              color: flash && hasDiscFloat ? flashColor : 'var(--parch)',
              transition: 'color 0.3s'
            }}
          >
            {dispD}
          </b>
        </span>
      </span>

      {floats.length > 0 && (
        <div className="ledger-chip__floats">
          {floats.map((f, i) => (
            <span
              key={f.key}
              className="ledger-chip__float"
              style={{
                color: f.positive ? '#a6b67c' : '#cc5436',
                textShadow: `0 0 8px ${f.positive ? '#a6b67c' : '#cc5436'}99`,
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
          className="ledger-chip__ring"
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
