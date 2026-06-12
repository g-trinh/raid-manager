import { BossData } from '../../domain/data/bossData'
import { MemberData } from '../../domain/data/memberData'
import { bossForecast } from '../../domain/logic/bossForecast'
import { PhaseCard } from '../draft/PhaseCard'
import { ROMAN, chanceRamp, pct } from '../shared/formatting'

interface BossCandidateCardProps {
  boss: BossData
  roster: MemberData[]
  scouted: boolean
  onPick: (boss: BossData) => void
}

const UNSCOUTED_COLOR = 'var(--ash)'

export function BossCandidateCard({
  boss,
  roster,
  scouted,
  onPick
}: BossCandidateCardProps): React.JSX.Element {
  const { projections, weakest, verdict } = bossForecast(boss, roster)
  const rampColor = scouted ? verdict.color : UNSCOUTED_COLOR

  return (
    <div className="boss-candidate-card" style={{ '--ramp': rampColor } as React.CSSProperties}>
      <div className="boss-candidate-card__header">
        <div className="boss-candidate-card__identity">
          <div className="boss-candidate-card__name">{boss.bossName}</div>
          <div className="boss-candidate-card__epithet">{boss.epithet}</div>
        </div>
        <div className="boss-candidate-card__verdict">{scouted ? verdict.label : 'Unscouted'}</div>
      </div>

      <div className="boss-candidate-card__phases">
        {boss.phases.map((phase, i) => (
          <PhaseCard
            key={phase.name}
            phase={phase}
            index={i}
            projection={projections[i]}
            drafted={scouted}
          />
        ))}
      </div>

      <div className="boss-candidate-card__footer">
        <div className="boss-candidate-card__weakest">
          {scouted ? (
            <>
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
            </>
          ) : (
            <>
              <div className="boss-candidate-card__weakest-label">No Forecast</div>
              <div className="boss-candidate-card__weakest-value boss-candidate-card__weakest-value--unscouted">
                The outriders never rode this way
              </div>
            </>
          )}
        </div>
        <button className="boss-candidate-card__pick" onClick={() => onPick(boss)}>
          Face This Foe
        </button>
      </div>
    </div>
  )
}
