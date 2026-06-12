# Pull replay — watch the wipe

WoW-progress-style replay of resolved pulls, built on the structured pull log
from [boss-mechanics](../boss-mechanics/todo.md) (hard prerequisite). Two
stages: a Wipefest-style **timeline** (stage 3 of the roadmap) and an
animated **arena** playback (stage 4, build only if the timeline proves
people watch).

## Stage 3 — Timeline replay

- **Entry points**: "Watch the replay" on the outcome screen; "Last pulls"
  on the war-table boss plaque. Pull selector (Pull 1…n of the current
  boss — `pullLogs` already keeps them all, reset per boss).
- **Layout**: vertical beat list per pull, one row per `PullEvent` beat:
  - phase-start rows as section breaks (Phase II — name, mastery band at
    pull time);
  - mechanic beats show the mechanic name + type glyph, and member chips for
    each failed check (role glyph + name, severity-colored); passed checks
    collapse into a quiet "7 held" count — failures are the story;
  - death rows in blood, the wipe/kill row as the finale with cause.
- **Reading goal**: "we always die at the third chains" visible in seconds —
  open two pulls side by side? No: keep v1 single-pull, the pull selector
  makes comparison cheap enough.
- Data is pure playback — no store mutations, no RNG, derived entirely from
  `PullEvent[]`. Component renders a log; trivial to unit test.

## Stage 4 — Arena replay (the dream, gated)

- 2D arena (DOM/CSS, 8 role-colored dots + boss marker), playing the log
  back on a timer (~400ms/beat, pause/scrub).
- **Choreography templates per MechanicType**, purely cosmetic, synthetic
  positions:
  - SPREAD: dots scatter to a ring; failers' dots overlap and flash;
  - STACK: dots converge on a marker; failers stay out;
  - TANKBUSTER: telegraph cone on the tank dot;
  - SOAK: circles spawn, dots fill them; unfilled circle flashes;
  - DODGE/RAIDWIDE/ADD_WAVE: sweep lines / pulse / spawn markers.
- A death drops the dot where it stands (the fumbler dies in the fire —
  visible, nameable, screenshotable). Wipe fades the arena; kill plays the
  sage flash.
- The fight is already decided — the arena animates a verdict. No gameplay
  reads from it; it can ship rough and improve.

## Constraints

- **Prerequisite**: boss-mechanics' pull log. No log, no replay — do not
  build a parallel event source from chronicle prose.
- New-player rule: replay is optional reading, never required to play; entry
  buttons stay quiet.
- Saves from [heroism](../heroism/todo.md)/[battle-res](../battle-res/todo.md)
  appear as their own beat kind when those land (`'save'` event) — the
  replay shows the clutch moment.

## Plan

- [ ] 1. (Prerequisite) boss-mechanics landed — `pullLogs: PullEvent[][]` available
- [ ] 2. ReplayScreen: pull selector + beat list (phase breaks, mechanic beats, fail chips, death/wipe/kill finale)
- [ ] 3. Entry points: outcome screen + war-table plaque; back navigation
- [ ] 4. Unit specs: log → rendered beats mapping (component test on a fixture log); e2e: wipe → watch replay → killer mechanic named
- [ ] 5. CSS: beat list, severity colors, type glyphs
- [ ] 6. Stage 4 (gated): arena playback with per-type choreography templates, scrub/pause, death drops
- [ ] 7. Docs: outcome.md entry point, boss-mechanics cross-ref
