import { BossData } from '../../domain/data/bossData'
import { MemberData } from '../../domain/data/memberData'
import { bossForecast } from '../../domain/logic/bossForecast'
import { PhaseCard } from '../draft/PhaseCard'
import { ROMAN, chanceRamp, pct } from '../shared/formatting'

interface BossCandidateCardProps {
  boss: BossData
  roster: MemberData[]
  onPick: (boss: BossData) => void
}

export function BossCandidateCard({
  boss,
  roster,
  onPick
}: BossCandidateCardProps): React.JSX.Element {
  const { projections, weakest, verdict } = bossForecast(boss, roster)

  return (
    <div className="boss-candidate-card" style={{ '--ramp': verdict.color } as React.CSSProperties}>
      <div className="boss-candidate-card__header">
        <div className="boss-candidate-card__identity">
          <div className="boss-candidate-card__name">{boss.bossName}</div>
          <div className="boss-candidate-card__epithet">{boss.epithet}</div>
        </div>
        <div className="boss-candidate-card__verdict">{verdict.label}</div>
      </div>

      <div className="boss-candidate-card__phases">
        {boss.phases.map((phase, i) => (
          <PhaseCard key={phase.name} phase={phase} index={i} projection={projections[i]} drafted />
        ))}
      </div>

      <div className="boss-candidate-card__footer">
        <div className="boss-candidate-card__weakest">
          <div className="boss-candidate-card__weakest-label">Weakest Phase</div>
          <div className="boss-candidate-card__weakest-value">
            {ROMAN[weakest.index]} · {weakest.phase.name}
            <span
              className="boss-candidate-card__chance"
              style={{ color: chanceRamp(weakest.chance) }}
            >
              {pct(weakest.chance)}%
            </span>
          </div>
        </div>
        <button className="boss-candidate-card__pick" onClick={() => onPick(boss)}>
          Face This Foe
        </button>
      </div>
    </div>
  )
}
