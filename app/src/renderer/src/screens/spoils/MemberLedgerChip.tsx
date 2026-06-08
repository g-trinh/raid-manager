import { useEffect, useState } from 'react'
import { BestowResult } from '../../domain/stores/useLootStore'
import { MemberData } from '../../domain/data/memberData'
import { Personality, PERSONALITY_META } from '../../domain/data/personality'
import { usePersonalityStore } from '../../domain/stores/usePersonalityStore'
import { useCountUp } from '../../domain/hooks/useCountUp'
import { ROLE_HEX } from '../shared/formatting'
import { PersonalityMark } from '../shared/PersonalityMark'

const LOOT_GOLD = '#d9c089'

interface FloatEntry {
  key: string
  text: string
  positive: boolean
}

interface MemberLedgerChipProps {
  member: MemberData
  skill: number
  liability: number
  pulse: (BestowResult & { token: number }) | null
}

export function MemberLedgerChip({
  member,
  skill,
  liability,
  pulse
}: MemberLedgerChipProps): React.JSX.Element {
  const personality = usePersonalityStore((s) => s.personalityOf(member.memberName))
  const meta = PERSONALITY_META[personality]
  const hex = ROLE_HEX[member.role]

  const dispS = useCountUp(skill)
  const dispL = useCountUp(liability)

  const [flash, setFlash] = useState<'gold' | 'hue' | null>(null)
  const [floats, setFloats] = useState<FloatEntry[]>([])

  useEffect(() => {
    if (!pulse) return
    const delta = pulse.applied[member.memberName]
    if (!delta || (delta.skill === 0 && delta.liability === 0)) return

    const isRecipient = pulse.recipient === member.memberName
    setFlash(isRecipient ? 'gold' : 'hue')

    const fl: FloatEntry[] = []
    if (delta.skill !== 0)
      fl.push({ key: 's', text: `${delta.skill > 0 ? '+' : ''}${delta.skill} Skill`, positive: delta.skill > 0 })
    if (delta.liability !== 0)
      fl.push({ key: 'l', text: `${delta.liability > 0 ? '+' : ''}${delta.liability} Liab`, positive: delta.liability > 0 })
    setFloats(fl)

    const t1 = setTimeout(() => setFlash(null), 950)
    const t2 = setTimeout(() => setFloats([]), 1200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pulse?.token])

  const flashColor = flash === 'gold' ? LOOT_GOLD : meta.hue
  const hasSkillFloat = floats.some((f) => f.key === 's')
  const hasLiabFloat = floats.some((f) => f.key === 'l')

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
      {personality !== Personality.LONER ? (
        <PersonalityMark personality={personality} size={7} />
      ) : (
        <span className="ledger-chip__loner-ring" style={{ borderColor: meta.hue }} />
      )}

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
          L
          <b
            style={{
              color: flash && hasLiabFloat ? flashColor : 'var(--parch)',
              transition: 'color 0.3s'
            }}
          >
            {dispL}
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
    </div>
  )
}
