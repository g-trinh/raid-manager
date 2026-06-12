import { MemberData } from '../../domain/data/memberData'
import { Role } from '../../domain/data/role'
import { BestowResult, RingType } from '../../domain/stores/useLootStore'
import { MusterChip } from '../shared/MusterChip'
import { PersonalityLegend } from '../shared/PersonalityLegend'

const ROLE_ORDER = [Role.TANK, Role.HEAL, Role.DPS]

type Pulse = BestowResult & { token: number }

interface MusterReactsProps {
  roster: MemberData[]
  pulse: Pulse | null
  preview: Record<string, RingType> | null
}

export function MusterReacts({ roster, pulse, preview }: MusterReactsProps): React.JSX.Element {
  const ordered = ROLE_ORDER.flatMap((r) => roster.filter((m) => m.role === r))
  const silentGrant =
    pulse !== null && pulse.reactions.every((r) => r.memberName === pulse.recipient)
  return (
    <div className="muster-reacts">
      <div className="muster-reacts__header">
        <span className="muster-reacts__title">The Muster Reacts</span>
        <PersonalityLegend />
      </div>
      <div className="muster-reacts__grid">
        {ordered.map((m) => (
          <MusterChip
            key={m.memberName}
            member={m}
            pulse={pulse}
            ring={preview ? (preview[m.memberName] ?? null) : null}
          />
        ))}
      </div>
      {silentGrant && (
        <div className="muster-reacts__silent">The rest of the muster doesn&apos;t react.</div>
      )}
    </div>
  )
}
