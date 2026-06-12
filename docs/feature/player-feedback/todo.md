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

- [x] 1. Red: chronicle store tests → implement useChronicleStore
- [x] 2. Red: bestow reactions/capped/chronicle tests → refactor useLootStore
- [x] 3. Red: previewReactions tests → implement
- [x] 4. Red: camp emitter tests → wire useCampStore
- [x] 5. Red: run emitter tests (seeded random) → wire useRunStore; PhaseResult gains score
- [x] 6. UI A: ChronicleDrawer + App mount
- [x] 7. UI B: chip capped float, no-react line, LootCard hover hint (roster prop)
- [x] 8. UI C: maxed pip style, MusterChip delta badge + tooltip
- [x] 9. UI D: outcome failure cause line, draft "shores up" tag (projection delta heuristic)
- [x] 10. Verify: vitest + typecheck + lint + headless drive
- [x] 11. Docs: spec.md in this folder; touch personalities.md/camp.md where behavior surfaces

## Review

- Shipped in c7d5e85 (feature) + d2aa12f (e2e suite).
- 36 vitest specs cover the stores (chronicle, bestow reactions/capped, previews,
  camp/run emitters); 7 Playwright e2e specs cover the UI journeys against the real
  renderer (electron-vite --rendererOnly + pinned Math.random for determinism).
- Step 10's throwaway-script verification was replaced by the committed Playwright
  suite at the user's request — `npm run test:e2e`.
- Docs note (step 11) folded into this folder; personalities.md/camp.md untouched —
  no rule changes, only presentation.
