import { BossPhaseData, PhaseType } from '../../domain/data/bossPhaseData'
import { Role } from '../../domain/data/role'
import { PhaseProjection } from '../../domain/logic/phaseProjection'
import { ROLE_HEX, ROMAN, chanceRamp, pct } from '../shared/formatting'
import { WeightDots } from '../shared/WeightDots'

interface PhaseCardProps {
  phase: BossPhaseData
  index: number
  projection: PhaseProjection
  drafted: boolean
}

const ROLE_ROWS: {
  role: Role
  label: string
  weightKey: 'dpsWeight' | 'tankWeight' | 'healWeight'
}[] = [
  { role: Role.DPS, label: 'DPS', weightKey: 'dpsWeight' },
  { role: Role.TANK, label: 'Tank', weightKey: 'tankWeight' },
  { role: Role.HEAL, label: 'Heal', weightKey: 'healWeight' }
]

export function PhaseCard({
  phase,
  index,
  projection,
  drafted
}: PhaseCardProps): React.JSX.Element {
  const { score, chance } = projection
  const fill = Math.min(1, score / phase.phaseTarget)
  const ramp = chanceRamp(chance)
  const tested = phase.phaseType === PhaseType.SKILL_HEAVY ? 'Skill' : 'Liability'

  return (
    <div className="phase-card" style={{ borderTopColor: ramp }}>
      <div>
        <div className="phase-card__heading">
          <span className="phase-card__roman">{ROMAN[index]}</span>
          <span
            className="phase-card__type"
            style={{
              color: tested === 'Skill' ? '#d9c089' : '#9fb2c4',
              borderColor: tested === 'Skill' ? '#d9c08955' : '#9fb2c455'
            }}
          >
            {tested}
          </span>
        </div>
        <div className="phase-card__name">{phase.name}</div>
      </div>

      <div className="phase-card__weights">
        {ROLE_ROWS.map(({ role, label, weightKey }) => (
          <div key={role} className="phase-card__weight-row">
            <span
              className="phase-card__weight-label"
              style={phase[weightKey] >= 3 ? { color: ROLE_HEX[role] } : undefined}
            >
              {label}
            </span>
            <WeightDots weight={phase[weightKey]} color={ROLE_HEX[role]} />
          </div>
        ))}
      </div>

      <div className="phase-card__projection">
        <div className="phase-card__meter">
          <div
            className="phase-card__meter-fill"
            style={{
              width: `${fill * 100}%`,
              background: `linear-gradient(90deg, ${ramp}aa, ${ramp})`,
              boxShadow: `0 0 6px ${ramp}66`
            }}
          />
        </div>
        <div className="phase-card__projection-row">
          <span className="phase-card__target">tgt {phase.phaseTarget}</span>
          <span className="phase-card__chance" style={{ color: ramp }}>
            {drafted ? pct(chance) : '—'}
            <span className="phase-card__chance-unit">{drafted ? '%' : ''}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
