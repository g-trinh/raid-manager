import { useState } from 'react'
import { BossData } from '../../domain/data/bossData'
import { PhaseType } from '../../domain/data/bossPhaseData'
import { MemberData } from '../../domain/data/memberData'
import { masteryBand } from '../../domain/logic/mastery'
import { RestResult, useCampStore } from '../../domain/stores/useCampStore'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { useLootStore } from '../../domain/stores/useLootStore'
import { useMasteryStore } from '../../domain/stores/useMasteryStore'
import { useRunStore } from '../../domain/stores/useRunStore'
import { BossCandidateCard } from '../choice/BossCandidateCard'
import { RunTrail } from '../choice/RunTrail'
import { RestPicker } from '../camp/RestPicker'
import { LootCard } from '../spoils/LootCard'
import { MusterPanel } from '../shared/MusterPanel'
import { SectionLabel } from '../shared/SectionLabel'
import { ROMAN } from '../shared/formatting'

interface WarTableScreenProps {
  onPull: () => void
  onRoadTaken: () => void
}

const TRIAL_ROMAN = ['I', 'II', 'III']

const STAT_LABEL = { skill: 'Skill', discipline: 'Discipline' } as const

// The hub. Combat starts here and only here; between pulls the muster can
// rest (once per interval) and settle the satchel. After a kill the table
// turns into the road: scout, pick the next foe, walk on.
export function WarTableScreen({ onPull, onRoadTaken }: WarTableScreenProps): React.JSX.Element {
  const boss = useRunStore((s) => s.boss)
  const bossIndex = useRunStore((s) => s.bossIndex)
  const pullsThisBoss = useRunStore((s) => s.pullsThisBoss)
  const bossDown = useRunStore((s) => s.bossDown)
  const pendingChoice = useRunStore((s) => s.pendingChoice)
  const runBosses = useRunStore((s) => s.runBosses)
  const bossOutcomes = useRunStore((s) => s.bossOutcomes)
  const chooseBoss = useRunStore((s) => s.chooseBoss)

  const restSpent = useCampStore((s) => s.restSpent)
  const scouted = useCampStore((s) => s.scouted)
  const scout = useCampStore((s) => s.scout)
  const rest = useCampStore((s) => s.rest)
  const consumeScout = useCampStore((s) => s.consumeScout)

  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const satchel = useLootStore((s) => s.satchel)
  const bestow = useLootStore((s) => s.bestow)
  const discard = useLootStore((s) => s.discard)
  const effectiveRoster = useLootStore((s) => s.effectiveRoster)
  const rosterPhaseMastery = useMasteryStore((s) => s.rosterPhaseMastery)

  const [resting, setResting] = useState(false)
  const [lastRest, setLastRest] = useState<RestResult | null>(null)

  const roster = effectiveRoster(selectedMembers)

  const handleRestPick = (member: MemberData): void => {
    setLastRest(rest(member))
    setResting(false)
  }

  const handleRoadPick = (picked: BossData): void => {
    chooseBoss(picked)
    consumeScout()
    onRoadTaken()
  }

  // ── Road mode: the boss is down, choose the next foe ────────────────
  if (bossDown && pendingChoice) {
    const trialIndex = bossIndex + 2
    const resolved = runBosses.map((b, i) => ({ boss: b, outcome: bossOutcomes[i] }))
    return (
      <div className="war-table war-table--road">
        <header className="war-table__header">
          <div className="war-table__kicker">The War Table · The Road Forks</div>
          <div className="war-table__title">
            Trial {TRIAL_ROMAN[trialIndex - 1]} of III — choose the next foe
          </div>
          <RunTrail trialIndex={trialIndex} resolved={resolved} />
        </header>

        <main className="war-table__body">
          <div className="war-table__layout">
            <div className="war-table__main">
              {!scouted && (
                <button className="war-table__scout" onClick={scout}>
                  <span className="war-table__scout-action">Scout</span>
                  <span className="war-table__scout-title">Send Outriders</span>
                  <span className="war-table__scout-effect">
                    Spend the night scouting — both roads get full forecasts.
                  </span>
                </button>
              )}
              <div className="war-table__candidates">
                {pendingChoice.map((candidate) => (
                  <BossCandidateCard
                    key={candidate.bossName}
                    boss={candidate}
                    roster={roster}
                    scouted={scouted}
                    onPick={handleRoadPick}
                  />
                ))}
              </div>
              <div className="war-table__footnote">
                The road not taken is lost — that foe will not return this run. Trash guards either
                road; you will deal with it on the way.
              </div>
            </div>
            <aside className="war-table__muster">
              <MusterPanel roster={selectedMembers} />
            </aside>
          </div>
        </main>
      </div>
    )
  }

  // ── Progress mode: a boss is standing ────────────────────────────────
  const nextPull = pullsThisBoss + 1
  return (
    <div className="war-table">
      <header className="war-table__header">
        <div className="war-table__kicker">
          The War Table · Trial {TRIAL_ROMAN[bossIndex]} of III
        </div>
        <div className="war-table__title">{boss.bossName}</div>
        <div className="war-table__sub">
          {pullsThisBoss === 0
            ? 'The muster stands ready. No pull yet — the first lesson is free.'
            : `${pullsThisBoss} pull${pullsThisBoss > 1 ? 's' : ''} taken. The boss still stands.`}
        </div>
      </header>

      <main className="war-table__body">
        <div className="war-table__layout">
          <div className="war-table__main">
            <SectionLabel>The Trial</SectionLabel>
            <div className="war-table__phases">
              {boss.phases.map((phase, i) => {
                const mastery = rosterPhaseMastery(roster, i, phase.mechanics.length)
                return (
                  <div key={phase.name} className="war-table__phase">
                    <span className="war-table__phase-roman">{ROMAN[i]}</span>
                    <div className="war-table__phase-body">
                      <div className="war-table__phase-name">{phase.name}</div>
                      <div className="war-table__phase-sub">
                        {phase.phaseType === PhaseType.SKILL_HEAVY ? 'Skill' : 'Discipline'} check ·{' '}
                        {masteryBand(mastery)}
                      </div>
                      <div className="war-table__phase-mechanics">
                        {phase.mechanics.map((m) => m.name).join(' · ')}
                      </div>
                      <div className="war-table__mastery-track">
                        <div className="war-table__mastery-fill" style={{ width: `${mastery}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <SectionLabel>Between Pulls</SectionLabel>
            {resting ? (
              <RestPicker
                roster={selectedMembers}
                onPick={handleRestPick}
                onBack={() => setResting(false)}
              />
            ) : (
              <div className="war-table__actions">
                <button
                  className="rm-btn rm-btn--ghost"
                  disabled={restSpent}
                  onClick={() => setResting(true)}
                >
                  {restSpent ? 'Rested — back after the next pull' : 'Rest a member'}
                </button>
                <button className="rm-btn rm-btn--primary war-table__pull" onClick={onPull}>
                  Pull — Attempt {nextPull}
                </button>
              </div>
            )}
            {lastRest && !resting && (
              <div className="war-table__rest-line">
                {lastRest.memberName} rests easy — +1 {STAT_LABEL[lastRest.stat]}, +3 morale.
              </div>
            )}

            {satchel.length > 0 && (
              <>
                <SectionLabel>The Satchel</SectionLabel>
                <div className="war-table__satchel">
                  {satchel.map((item) => (
                    <LootCard
                      key={item.id}
                      item={item}
                      eligibleMembers={selectedMembers.filter((m) => m.role === item.roleLock)}
                      roster={selectedMembers}
                      onEquip={(member) => bestow(item, member, selectedMembers)}
                      onBench={() => {}}
                      onDiscard={() => discard(item)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <aside className="war-table__muster">
            <MusterPanel roster={selectedMembers} />
          </aside>
        </div>
      </main>
    </div>
  )
}
