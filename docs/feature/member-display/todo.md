# Unified member display

Problem: members render five different ways — draft candidates and muster panels use
stat pips, but the loot picker, rest picker and the reacts strip use raw numbers
("Skill 3 → 4", "S4 D2"). Different components, different languages.

## Design

- **StatBar** (the one pip row) gains `projected?: number`: pips between current and
  projected render as gain previews (accent outline); a projected loss marks the lost
  pips red. One component now expresses "current", "current → gain" and "current → loss".
- **MusterChip** becomes the single member chip (own file in shared/): head row
  (role glyph, name, run-delta badge, personality glyph) + two StatBar pip rows.
  Absorbs MemberLedgerChip's pulse behavior (flash, floats incl. "at peak", preview
  ring) as optional props. MusterReacts now renders MusterChips — numbers gone.
- **MemberPickRow** (new, shared): the clickable member row used by both the loot
  picker and the camp rest picker — role glyph, name, PersonalityMark, two StatBars
  with projections. Replaces LootCard's MemberOption and RestPicker's RestOption.
- CandidateCard already speaks pips — untouched apart from shared sizing.

## Plan

- [x] 1. StatBar: projected prop + gain/loss pip styles
- [x] 2. Extract MusterChip to shared/MusterChip.tsx, absorb pulse/ring/floats; delete MemberLedgerChip
- [x] 3. MusterReacts renders MusterChip
- [x] 4. shared/MemberPickRow; LootCard and RestPicker use it
- [x] 5. CSS: pip gain/loss, chip floats/ring under .muster-chip, drop dead .ledger-chip styles
- [x] 6. Update e2e selectors (.ledger-chip → .muster-chip); vitest + e2e + typecheck + lint green

## Review

- One stat language everywhere: StatBar pips with optional `projected` (gain pips render
  hollow accent + pulse, losses red) — loot picker and rest picker dropped their raw
  numbers ("Skill 3 → 4") for pip previews.
- One member chip everywhere: MusterChip (shared/) absorbed MemberLedgerChip's pulse
  flash, floats (incl. "at peak") and preview ring as optional props; MusterReacts now
  renders it, so the reacts strip, draft tray, choice sidebar and drawer all match.
- One pick row: MemberPickRow (shared/) backs both LootCard's picker and the camp
  RestPicker.
- Deleted: MemberLedgerChip, useCountUp (numbers no longer count up — pips snap),
  dead .ledger-chip / .loot-option__projection CSS.
- Verified: 36 vitest + 7 Playwright e2e green (one selector updated:
  .ledger-chip → .muster-chip), typecheck + lint clean.
