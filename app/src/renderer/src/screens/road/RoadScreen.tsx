import { useRef, useState } from 'react'
import { MemberData } from '../../domain/data/memberData'
import { useCampStore } from '../../domain/stores/useCampStore'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { BestowResult, RingType, useLootStore } from '../../domain/stores/useLootStore'
import { useRunStore } from '../../domain/stores/useRunStore'
import { LootCard, LootResolution } from '../spoils/LootCard'
import { MusterReacts } from '../spoils/MusterReacts'
import { SectionLabel } from '../shared/SectionLabel'

interface RoadScreenProps {
  onContinue: () => void
}

type Pulse = BestowResult & { token: number }

const STAT_LABEL = { skill: 'Skill', discipline: 'Discipline' } as const

// Trash guards the way to every boss. One choice on the road: sweep the packs
// for a common drop (bruise risk), or march past and save the muster's legs.
export function RoadScreen({ onContinue }: RoadScreenProps): React.JSX.Element {
  const bossName = useRunStore((s) => s.boss.bossName)
  const roster = useDraftStore((s) => s.selectedMembers)
  const clearWide = useCampStore((s) => s.clearWide)
  const marchPast = useCampStore((s) => s.marchPast)
  const roadClearResult = useCampStore((s) => s.roadClearResult)

  const bestow = useLootStore((s) => s.bestow)
  const bench = useLootStore((s) => s.bench)
  const discard = useLootStore((s) => s.discard)
  const previewRings = useLootStore((s) => s.previewRings)

  const [choice, setChoice] = useState<'clear' | 'march' | null>(null)
  const [lootResolution, setLootResolution] = useState<LootResolution | null>(null)
  const [benched, setBenched] = useState(false)
  const [pulse, setPulse] = useState<Pulse | null>(null)
  const [preview, setPreview] = useState<Record<string, RingType> | null>(null)
  const pulseToken = useRef(0)

  const handleClearWide = (): void => {
    clearWide(roster)
    setChoice('clear')
  }

  const handleMarchPast = (): void => {
    marchPast(roster)
    setChoice('march')
  }

  const handleEquip = (member: MemberData): void => {
    if (!roadClearResult) return
    const result = bestow(roadClearResult.item, member, roster)
    pulseToken.current += 1
    setPulse({ ...result, token: pulseToken.current })
    setPreview(null)
    setLootResolution({ type: 'equipped', member })
  }

  const handleBench = (): void => {
    if (!roadClearResult) return
    bench(roadClearResult.item)
    setBenched(true)
  }

  const handleDiscard = (): void => {
    if (!roadClearResult) return
    discard(roadClearResult.item)
    setLootResolution({ type: 'discarded' })
  }

  const lootSettled = lootResolution !== null || benched

  return (
    <div className="camp-screen road-screen">
      <header className="camp-header">
        <div className="camp-header__kicker">The Road</div>
        <div className="camp-header__title">Toward {bossName}</div>
        <div className="camp-header__sub">
          Packs of the vanguard hold the road. How does the muster pass?
        </div>
      </header>

      <main className="camp-body">
        {choice === null && (
          <>
            <SectionLabel>Choose One</SectionLabel>
            <div className="camp-options camp-options--two">
              <button className="camp-option" onClick={handleClearWide}>
                <div className="camp-option__action">Skirmish</div>
                <div className="camp-option__title">Clear Wide</div>
                <div className="camp-option__flavor">Sweep every pack off the road.</div>
                <div className="camp-option__effect">
                  Guaranteed common item. Risk: someone returns bruised.
                </div>
              </button>
              <button className="camp-option" onClick={handleMarchPast}>
                <div className="camp-option__action">March</div>
                <div className="camp-option__title">March Past</div>
                <div className="camp-option__flavor">Push straight through to the foe.</div>
                <div className="camp-option__effect">No loot, no risk — +1 morale to everyone.</div>
              </button>
            </div>
          </>
        )}

        {choice === 'march' && (
          <div className="camp-result">
            <div className="camp-result__head">The packs scatter unfought</div>
            <div className="camp-result__line">
              The muster arrives fresh — <b>+1 morale</b> to everyone.
            </div>
          </div>
        )}

        {choice === 'clear' && roadClearResult && (
          <div className="camp-result">
            <div className="camp-result__head">The road is cleared wide</div>
            {roadClearResult.bruise && (
              <div className="camp-result__line camp-result__line--bruise">
                <b>{roadClearResult.bruise.memberName}</b> returns bruised — −1{' '}
                {STAT_LABEL[roadClearResult.bruise.stat]}.
              </div>
            )}
            <div className="camp-result__muster">
              <MusterReacts roster={roster} pulse={pulse} preview={preview} />
            </div>
            <div className="camp-result__loot">
              {benched ? (
                <div className="camp-result__line">
                  <b>{roadClearResult.item.name}</b> stowed in the satchel.
                </div>
              ) : (
                <LootCard
                  item={roadClearResult.item}
                  eligibleMembers={roster.filter((m) => m.role === roadClearResult.item.roleLock)}
                  roster={roster}
                  resolution={lootResolution ?? undefined}
                  showBench
                  onEquip={handleEquip}
                  onBench={handleBench}
                  onDiscard={handleDiscard}
                  onHoverMember={(m) => setPreview(previewRings(m, roster))}
                  onLeaveMember={() => setPreview(null)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="camp-footer">
        {choice !== null && (
          <button
            className="rm-btn rm-btn--default"
            disabled={choice === 'clear' && !lootSettled}
            onClick={onContinue}
          >
            {choice === 'clear' && !lootSettled ? 'Settle the spoils first' : 'To the War Table'}
          </button>
        )}
      </footer>
    </div>
  )
}
