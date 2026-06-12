# War Table — reshaping the game cycle

The old cycle had no home: combat fired as a side effect of three different
screens (Begin, boss pick, leaving camp), the outcome screen doubled as the
navigation hub, and camp was two different places wearing one coat — which
produced dead-ends (hidden exits gated on loot resolution). This feature
rebuilds the loop hub-and-spoke around one preparation screen.

## Design

### The cycle

```
Draft → WAR TABLE ──[PULL]──→ resolution
            ↑                    ├─ wipe   → back to the table
            │                    ├─ kill   → Spoils → table in ROAD MODE
            │                    └─ disband → run over → Draft
            │
   ROAD MODE: Scout (optional, once) → pick next boss
            → ROAD ENCOUNTER: Clear wide | March past
            → table, new boss, pull 1
```

### The War Table (hub)

- Boss plaque: name, pull count, the 3 phases with mastery band labels.
- Roster panel (the muster, mood dots included) and the satchel — stowed items
  are resolvable here any time (equip / discard), never blocking.
- **Pull is the only way into combat.** Picking a boss never auto-pulls;
  breaking camp doesn't exist anymore.
- Between pulls: **Rest, once per pull interval** (+1 weaker stat, +3 morale).
  The respawn farm (mid-progress skirmish) is removed — gearing up mid-boss
  means resting less, full stop.
- The wipe screen keeps **Pull Again** as a shortcut (same explicit decision,
  fewer clicks) plus **To the War Table**.

### Road mode (after a kill)

- The table switches to the road: candidate boss cards (coarse verdict, full
  forecast if scouted) plus **Send Outriders** — optional, once, spent before
  picking.
- Picking a boss leads to the **road encounter** — trash guards the way:
  - **Clear wide**: sweep the packs — guaranteed common item (equip / stow /
    discard on the spot), bruise risk as today (30%, −1 random stat).
  - **March past**: no loot, no risk, **+1 morale to everyone** (the muster
    saves its legs).
- After the road: table resets on the new boss, mastery slate wiped, pull 1.

### Loot never blocks

- Leaving the Spoils screen auto-stows unresolved drops in the satchel.
- `bestow`/`discard` now remove the item from the satchel (also fixes a latent
  dupe: satchel items equipped at the spoils screen stayed in the satchel).

## Plan

- [x] 1. `useLootStore`: bestow/discard pull the item out of the satchel
- [x] 2. `useCampStore` → table/road actions: rest (once per interval, `newInterval()`), scout (road mode), `clearWide()`/`marchPast()` replace skirmish
- [x] 3. `useRunStore`: split `chooseBoss` (select only — no pull) from explicit `pull()`; remove `resolve()`; draft no longer auto-attempts
- [x] 4. WarTableScreen (hub + road mode), RoadScreen (encounter beat)
- [x] 5. OutcomeScreen: wipe → Pull Again / To the War Table; kill → Spoils; SpoilsScreen auto-stow on continue
- [x] 6. App flow rewire; delete CampScreen + ChoiceScreen
- [x] 7. CSS: war table, road encounter
- [x] 8. Unit tests: camp/run store rework, loot satchel fix
- [x] 9. e2e rewrite: hub journeys (pull/wipe/rest/road), layout specs on the new screens
- [x] 10. Docs sync: run.md, camp.md (now the war-table/road doc), outcome.md, attempt.md

## Review

- Combat now has exactly one trigger: the Pull button on the war table (the
  wipe screen's Pull Again is a labeled shortcut to the same store action).
  Picking a boss arms the table without pulling; leaving a screen never
  resolves combat as a side effect.
- The war table is home: boss plaque with per-phase mastery bars and band
  labels, pull counter, persistent muster panel, satchel settlement, and the
  Rest action (once per pull interval, reopened by `newInterval()` on pull).
- Road mode replaces the choice screen: coarse verdicts, optional Send
  Outriders (full forecasts, consumed on pick), then the road encounter —
  Clear Wide (guaranteed common + 30% bruise) or March Past (+1 morale all).
  The respawn farm is removed by design: trash is fought once per road.
- Loot never blocks: leaving Spoils auto-stows unresolved drops; the road
  exit is always visible, disabled with a reason while loot is unsettled;
  bestow/discard now remove items from the satchel (fixed a latent dupe).
- Deleted: CampScreen, CampOptionCard, ChoiceScreen (folded into
  WarTableScreen + RoadScreen, reusing camp-option/camp-result CSS).
- Verified: 73 vitest specs, 15 Playwright e2e specs (hub journeys: pull,
  wipe→rest-once-per-interval→re-pull, road clear strip, scout upgrade in
  place, disband, layout/overflow on table + road), typecheck + lint clean.
