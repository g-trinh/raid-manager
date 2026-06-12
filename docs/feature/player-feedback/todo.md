# Player feedback overhaul (proposals A+B+C+D)

Goal: feedback stops being transient/invisible; every decision point explains itself.

## Design

- **A — Chronicle**: `useChronicleStore`, entries {id, kind: 'loot'|'reaction'|'camp'|'battle'|'system', text}.
  Emitters: bestow/bench/discard (loot), rest/scout/skirmish+bruise (camp), phase results +
  outcome + drops (run). Run reset clears. UI: ChronicleDrawer bottom-left, all screens.
- **B — Grant moment**: bestow() refactor → pure `grantReactions()` (intended deltas + reason);
  BestowResult gains `reactions` + `capped` (intent swallowed by [0,5] clamp).
  `previewReactions(item, member, roster)` → consequence lines for the picker hover hint.
  Chip shows muted "at peak" float when capped; MusterReacts shows "the rest of the muster
  doesn't react" when a grant moves nobody else.
- **C — Stat provenance**: maxed pips render bright ("at peak" readable); MusterChip badge
  ▲+n / ▼−n when effective ≠ base, tooltip "Base n · run bonuses ±n".
- **D — Actionable hints**: failed phase row on outcome screen names the cause ("Discipline
  check — Heal Discipline averages 2.0, the phase leaned on it"); draft candidate cards tag
  "Shores up Phase II" when the pick most improves the weakest projected phase.

## Plan

- [ ] 1. Red: chronicle store tests → implement useChronicleStore
- [ ] 2. Red: bestow reactions/capped/chronicle tests → refactor useLootStore
- [ ] 3. Red: previewReactions tests → implement
- [ ] 4. Red: camp emitter tests → wire useCampStore
- [ ] 5. Red: run emitter tests (seeded random) → wire useRunStore; PhaseResult gains score
- [ ] 6. UI A: ChronicleDrawer + App mount
- [ ] 7. UI B: chip capped float, no-react line, LootCard hover hint (roster prop)
- [ ] 8. UI C: maxed pip style, MusterChip delta badge + tooltip
- [ ] 9. UI D: outcome failure cause line, draft "shores up" tag (projection delta heuristic)
- [ ] 10. Verify: vitest + typecheck + lint + headless drive
- [ ] 11. Docs: spec.md in this folder; touch personalities.md/camp.md where behavior surfaces

## Review

(to fill)
