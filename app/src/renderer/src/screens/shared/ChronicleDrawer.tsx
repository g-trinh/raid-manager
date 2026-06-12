import { useState } from 'react'
import { ChronicleKind, useChronicleStore } from '../../domain/stores/useChronicleStore'

const KIND_HUE: Record<ChronicleKind, string> = {
  loot: 'var(--gold)',
  reaction: 'var(--rm-altruist)',
  camp: 'var(--rm-amber)',
  battle: 'var(--blood)',
  morale: '#d98a9c',
  system: 'var(--ash)'
}

// Persistent run log: every grant, reaction, camp action and battle beat — so
// feedback missed in the moment can always be re-read.
export function ChronicleDrawer(): React.JSX.Element | null {
  const entries = useChronicleStore((s) => s.entries)
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  return (
    <>
      <button className="chronicle-drawer__toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Chronicle'}
      </button>
      {open && (
        <div className="chronicle-drawer__backdrop" onClick={() => setOpen(false)}>
          <div className="chronicle-drawer__panel" onClick={(e) => e.stopPropagation()}>
            <div className="chronicle-drawer__title">The Run Chronicle</div>
            <div className="chronicle-drawer__list">
              {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="chronicle-drawer__entry">
                  <span
                    className="chronicle-drawer__dot"
                    style={{ background: KIND_HUE[entry.kind] }}
                  />
                  <span className="chronicle-drawer__text">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
