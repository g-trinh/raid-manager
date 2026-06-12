import { useMemo, useRef, useState } from 'react'
import { MemberData } from '../../domain/data/memberData'
import { useCampStore } from '../../domain/stores/useCampStore'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { BestowResult, RingType, useLootStore } from '../../domain/stores/useLootStore'
import { SectionLabel } from '../shared/SectionLabel'
import { LootCard, LootResolution } from '../spoils/LootCard'
import { MusterReacts } from '../spoils/MusterReacts'
import { CampOptionCard } from './CampOptionCard'
import { RestPicker } from './RestPicker'

interface CampScreenProps {
  onContinue: () => void
}

type Stage = 'idle' | 'rest-pick' | 'resolved'

type Pulse = BestowResult & { token: number }

const STAT_LABEL = { skill: 'Skill', discipline: 'Discipline' } as const

export function CampScreen({ onContinue }: CampScreenProps): React.JSX.Element {
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const chosenAction = useCampStore((s) => s.chosenAction)
  const restResult = useCampStore((s) => s.restResult)
  const skirmishResult = useCampStore((s) => s.skirmishResult)
  const rest = useCampStore((s) => s.rest)
  const scout = useCampStore((s) => s.scout)
  const skirmish = useCampStore((s) => s.skirmish)
  const bestow = useLootStore((s) => s.bestow)
  const bench = useLootStore((s) => s.bench)
  const discard = useLootStore((s) => s.discard)
  const previewRings = useLootStore((s) => s.previewRings)

  const [stage, setStage] = useState<Stage>(chosenAction ? 'resolved' : 'idle')
  const [lootResolution, setLootResolution] = useState<LootResolution | null>(null)
  const [benched, setBenched] = useState(false)
  const [pulse, setPulse] = useState<Pulse | null>(null)
  const [preview, setPreview] = useState<Record<string, RingType> | null>(null)
  const pulseToken = useRef(0)

  const roster = useMemo(() => selectedMembers, [selectedMembers])

  const handleRestPick = (member: MemberData): void => {
    rest(member)
    setStage('resolved')
  }

  const handleScout = (): void => {
    scout()
    setStage('resolved')
  }

  const handleSkirmish = (): void => {
    skirmish(roster)
    setStage('resolved')
  }

  const handleEquip = (member: MemberData): void => {
    if (!skirmishResult) return
    const result = bestow(skirmishResult.item, member, roster)
    pulseToken.current += 1
    setPulse({ ...result, token: pulseToken.current })
    setPreview(null)
    setLootResolution({ type: 'equipped', member })
  }

  const handleBench = (): void => {
    if (!skirmishResult) return
    bench(skirmishResult.item)
    setBenched(true)
  }

  const handleDiscard = (): void => {
    if (!skirmishResult) return
    discard(skirmishResult.item)
    setLootResolution({ type: 'discarded' })
  }

  const handleHoverMember = (member: MemberData): void => {
    setPreview(previewRings(member, roster))
  }

  const handleLeaveMember = (): void => {
    setPreview(null)
  }

  const skirmishSettled = lootResolution !== null || benched
  const canBreakCamp = stage === 'resolved' && (chosenAction !== 'skirmish' || skirmishSettled)

  return (
    <div className="camp-screen">
      <header className="camp-header">
        <div className="camp-header__kicker">The Road Between</div>
        <div className="camp-header__title">Make Camp</div>
        <div className="camp-header__sub">
          The fires are lit. One thing can be done before dawn — choose it well.
        </div>
      </header>

      <main className="camp-body">
        {stage === 'idle' && (
          <>
            <SectionLabel>Choose One</SectionLabel>
            <div className="camp-options">
              <CampOptionCard
                title="Bind Wounds"
                action="Rest"
                flavor="Tend to one of your own through the night."
                effect="Pick a member: +1 to their weaker stat."
                onPick={() => setStage('rest-pick')}
              />
              <CampOptionCard
                title="Send Outriders"
                action="Scout"
                flavor="Riders slip into the dark to study the foes ahead."
                effect="The next boss choice shows full forecasts."
                onPick={handleScout}
              />
              <CampOptionCard
                title="Hunt the Road"
                action="Skirmish"
                flavor="A roadside warband carries spoils worth taking."
                effect="Gain a common item. Risk: someone returns bruised."
                onPick={handleSkirmish}
              />
            </div>
          </>
        )}

        {stage === 'rest-pick' && (
          <>
            <SectionLabel>Who rests easy tonight?</SectionLabel>
            <RestPicker roster={roster} onPick={handleRestPick} onBack={() => setStage('idle')} />
          </>
        )}

        {stage === 'resolved' && chosenAction === 'rest' && restResult && (
          <div className="camp-result">
            <div className="camp-result__head">Wounds bound, spirits mended</div>
            <div className="camp-result__line">
              <b>{restResult.memberName}</b> rests easy — +1 {STAT_LABEL[restResult.stat]}.
            </div>
          </div>
        )}

        {stage === 'resolved' && chosenAction === 'scout' && (
          <div className="camp-result">
            <div className="camp-result__head">The outriders return at dawn</div>
            <div className="camp-result__line">
              Every foe on the next road is mapped — full forecasts await your choice.
            </div>
          </div>
        )}

        {stage === 'resolved' && chosenAction === 'skirmish' && skirmishResult && (
          <div className="camp-result">
            <div className="camp-result__head">The warband breaks and scatters</div>
            {skirmishResult.bruise && (
              <div className="camp-result__line camp-result__line--bruise">
                <b>{skirmishResult.bruise.memberName}</b> returns bruised — −1{' '}
                {STAT_LABEL[skirmishResult.bruise.stat]}.
              </div>
            )}
            <div className="camp-result__muster">
              <MusterReacts roster={roster} pulse={pulse} preview={preview} />
            </div>
            <div className="camp-result__loot">
              {benched ? (
                <div className="camp-result__line">
                  <b>{skirmishResult.item.name}</b> stowed in the satchel.
                </div>
              ) : (
                <LootCard
                  item={skirmishResult.item}
                  eligibleMembers={roster.filter((m) => m.role === skirmishResult.item.roleLock)}
                  roster={roster}
                  resolution={lootResolution ?? undefined}
                  showBench
                  onEquip={handleEquip}
                  onBench={handleBench}
                  onDiscard={handleDiscard}
                  onHoverMember={handleHoverMember}
                  onLeaveMember={handleLeaveMember}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="camp-footer">
        {canBreakCamp && (
          <button className="rm-btn rm-btn--default" onClick={onContinue}>
            Break Camp
          </button>
        )}
      </footer>
    </div>
  )
}
