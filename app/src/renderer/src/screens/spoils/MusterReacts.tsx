import { MemberData } from '../../domain/data/memberData'
import { Role } from '../../domain/data/role'
import { BestowResult } from '../../domain/stores/useLootStore'
import { PersonalityLegend } from '../shared/PersonalityLegend'
import { MemberLedgerChip } from './MemberLedgerChip'

const ROLE_ORDER = [Role.TANK, Role.HEAL, Role.DPS]

type Pulse = BestowResult & { token: number }

interface MusterReactsProps {
  roster: MemberData[]
  effectiveStat: (member: MemberData, key: 'skill' | 'liability') => number
  pulse: Pulse | null
}

export function MusterReacts({ roster, effectiveStat, pulse }: MusterReactsProps): React.JSX.Element {
  const ordered = ROLE_ORDER.flatMap((r) => roster.filter((m) => m.role === r))
  return (
    <div className="muster-reacts">
      <div className="muster-reacts__header">
        <span className="muster-reacts__title">The Muster Reacts</span>
        <PersonalityLegend />
      </div>
      <div className="muster-reacts__grid">
        {ordered.map((m) => (
          <MemberLedgerChip
            key={m.memberName}
            member={m}
            skill={effectiveStat(m, 'skill')}
            liability={effectiveStat(m, 'liability')}
            pulse={pulse}
          />
        ))}
      </div>
    </div>
  )
}
