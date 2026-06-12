import { useState } from 'react'
import { useDraftStore } from '../../domain/stores/useDraftStore'
import { MusterPanel } from './MusterPanel'

// Floating roster inspector: available from any screen.
export function MusterDrawer(): React.JSX.Element | null {
  const selectedMembers = useDraftStore((s) => s.selectedMembers)
  const [open, setOpen] = useState(false)

  if (selectedMembers.length === 0) return null

  return (
    <>
      <button className="muster-drawer__toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : `Muster ${selectedMembers.length}/8`}
      </button>
      {open && (
        <div className="muster-drawer__backdrop" onClick={() => setOpen(false)}>
          <div className="muster-drawer__panel" onClick={(e) => e.stopPropagation()}>
            <MusterPanel roster={selectedMembers} showEmpty={selectedMembers.length < 8} />
          </div>
        </div>
      )}
    </>
  )
}
