interface MusterCompleteProps {
  onBegin: () => void
}

export function MusterComplete({ onBegin }: MusterCompleteProps): React.JSX.Element {
  return (
    <div className="muster-complete">
      <div className="muster-complete__sigil" />
      <div className="muster-complete__title">The Muster Is Full</div>
      <div className="muster-complete__copy">
        Eight souls answer the call. Moloch waits in the forge-dark — and there is but one attempt.
      </div>
      <button className="rm-btn rm-btn--primary" style={{ width: '100%' }} onClick={onBegin}>
        Begin the Attempt
      </button>
    </div>
  )
}
