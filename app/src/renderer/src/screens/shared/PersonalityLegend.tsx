import { useState } from 'react'
import { Personality, PERSONALITY_META } from '../../domain/data/personality'
import { PersonalityGlyph } from './PersonalityMark'

const PERSONALITY_ORDER = [Personality.LONER, Personality.ALTRUIST, Personality.GLORY_HOUND]

export function PersonalityLegend(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="personality-legend__trigger"
        onClick={() => setOpen(true)}
        title="What are personalities?"
      >
        <span className="personality-legend__glyphs">
          {PERSONALITY_ORDER.map((p) => {
            const m = PERSONALITY_META[p]
            return <PersonalityGlyph key={p} glyph={m.glyph} hue={m.hue} size={7} glow={!m.quiet} />
          })}
        </span>
        Traits
      </button>
      {open && (
        <div className="personality-legend__overlay" onClick={() => setOpen(false)}>
          <div className="personality-legend__panel" onClick={(e) => e.stopPropagation()}>
            <div className="personality-legend__panel-kicker">How They Bear Loot</div>
            <div className="personality-legend__panel-title">The Three Temperaments</div>
            <div className="personality-legend__entries">
              {PERSONALITY_ORDER.map((p) => {
                const meta = PERSONALITY_META[p]
                return (
                  <div key={p} className="personality-legend__entry">
                    <span
                      className="personality-legend__entry-icon"
                      style={{
                        background: `color-mix(in oklab, ${meta.hue} 12%, transparent)`,
                        borderColor: `color-mix(in oklab, ${meta.hue} 40%, transparent)`
                      }}
                    >
                      <PersonalityGlyph glyph={meta.glyph} hue={meta.hue} size={12} glow={!meta.quiet} />
                    </span>
                    <div className="personality-legend__entry-body">
                      <div className="personality-legend__entry-name" style={{ color: meta.hue }}>
                        {meta.label}
                      </div>
                      <div className="personality-legend__entry-effect">{meta.effect}</div>
                      <div className="personality-legend__entry-flavor">{meta.flavor}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="personality-legend__footnote">
              Traits fire only on Signature Loot grants. Deltas are permanent and stack for the run.
            </div>
            <button className="personality-legend__close" onClick={() => setOpen(false)}>
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  )
}
