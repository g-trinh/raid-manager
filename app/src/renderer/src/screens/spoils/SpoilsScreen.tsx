import { useMemo, useState } from 'react'
import { LootItemData } from '../../domain/data/lootData'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { BestowResult, useLootStore } from '../../domain/stores/useLootStore'
import { Outcome, useRunStore } from '../../domain/stores/useRunStore'
import { SectionLabel } from '../shared/SectionLabel'
import { LootCard, LootResolution } from './LootCard'
import { MemberLedgerChip } from './MemberLedgerChip'

interface SpoilsScreenProps {
  onContinue: () => void
  continueLabel: string
}

interface OutcomeMeta {
  color: string
  kicker: string
  head: string
}

const OUTCOME_META: Record<Outcome.FULL_VICTORY | Outcome.NARROW_VICTORY, OutcomeMeta> = {
  [Outcome.FULL_VICTORY]: {
    color: '#a6b67c',
    kicker: 'The Spoils',
    head: 'A signature item, freely given'
  },
  [Outcome.NARROW_VICTORY]: {
    color: '#d99a3c',
    kicker: 'The Spoils',
    head: 'A signature item, hard-won'
  }
}

type Pulse = BestowResult & { token: number }

export function SpoilsScreen({ onContinue, continueLabel }: SpoilsScreenProps): React.JSX.Element {
  const outcome = useRunStore((s) => s.outcome)
  const boss = useRunStore((s) => s.boss)
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const satchel = useLootStore((s) => s.satchel)
  const bestow = useLootStore((s) => s.bestow)
  const bench = useLootStore((s) => s.bench)
  const discard = useLootStore((s) => s.discard)
  const effectiveStat = useLootStore((s) => s.effectiveStat)

  interface Resolved {
    item: LootItemData
    resolution: LootResolution
  }

  const [resolved, setResolved] = useState<Record<string, Resolved>>({})
  const [pulse, setPulse] = useState<Pulse | null>(null)

  const droppedItem: LootItemData | null = outcome !== Outcome.DEFEAT ? boss.signatureItem : null
  const droppedAlreadyBenched = droppedItem ? satchel.some((i) => i.id === droppedItem.id) : false

  const pendingItems = useMemo(() => {
    const fromSatchel = satchel.filter((i) => !resolved[i.id])
    if (droppedItem && !resolved[droppedItem.id] && !droppedAlreadyBenched) {
      return [droppedItem, ...fromSatchel]
    }
    return fromSatchel
  }, [satchel, droppedItem, droppedAlreadyBenched, resolved])

  const resolvedItems = Object.values(resolved)

  const handleEquip = (item: LootItemData, member: (typeof selectedMembers)[number]): void => {
    const result = bestow(item, member, selectedMembers)
    setPulse({ ...result, token: Date.now() + Math.random() })
    setResolved((prev) => ({
      ...prev,
      [item.id]: { item, resolution: { type: 'equipped', member } }
    }))
  }

  const handleBench = (item: LootItemData): void => {
    bench(item)
  }

  const handleDiscard = (item: LootItemData): void => {
    discard(item)
    setResolved((prev) => ({ ...prev, [item.id]: { item, resolution: { type: 'discarded' } } }))
  }

  const meta =
    outcome === Outcome.FULL_VICTORY || outcome === Outcome.NARROW_VICTORY
      ? OUTCOME_META[outcome]
      : null

  return (
    <div className="spoils-screen">
      <div className="spoils-screen__header">
        <div className="spoils-screen__kicker" style={meta ? { color: meta.color } : undefined}>
          {meta?.kicker ?? 'The Spoils'}
        </div>
        <div className="spoils-screen__name">{boss.bossName} has fallen</div>
        {meta && <div className="spoils-screen__sub">{meta.head}</div>}
      </div>

      <div className="spoils-screen__body">
        {pendingItems.length > 0 && (
          <div className="spoils-screen__section">
            <SectionLabel>Unclaimed</SectionLabel>
            <div className="spoils-screen__cards">
              {pendingItems.map((item) => (
                <LootCard
                  key={item.id}
                  item={item}
                  eligibleMembers={selectedMembers.filter(
                    (member) => member.role === item.roleLock
                  )}
                  showBench={!!droppedItem && item.id === droppedItem.id && !droppedAlreadyBenched}
                  onEquip={(member) => handleEquip(item, member)}
                  onBench={() => handleBench(item)}
                  onDiscard={() => handleDiscard(item)}
                />
              ))}
            </div>
          </div>
        )}

        {resolvedItems.length > 0 && (
          <div className="spoils-screen__section">
            <SectionLabel>Resolved this visit</SectionLabel>
            <div className="spoils-screen__cards">
              {resolvedItems.map(({ item, resolution }) => (
                <LootCard
                  key={item.id}
                  item={item}
                  eligibleMembers={[]}
                  resolution={resolution}
                  onEquip={() => {}}
                  onBench={() => {}}
                  onDiscard={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        <div className="spoils-screen__section">
          <SectionLabel>The Muster</SectionLabel>
          <div className="spoils-ledger">
            {selectedMembers.map((member) => (
              <MemberLedgerChip
                key={member.memberName}
                member={member}
                skill={effectiveStat(member, 'skill')}
                liability={effectiveStat(member, 'liability')}
                pulse={pulse}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="spoils-screen__footer">
        <button className="spoils-screen__button" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
