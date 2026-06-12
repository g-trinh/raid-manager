# Pull intent — the shot-caller's stance

The pull is currently a movie: the player's agency ends at the war table's
Pull button. Pull intent makes *how* we pull a decision. Real raids do this
every night: full-send when the kill is close, practice pulls to learn a
phase, safety calls when one more sloppy wipe ends the guild.

## Design

At the war table, the Pull action becomes a stance choice (default Full Send,
one click as today):

| Stance | Effect | When you'd call it |
|---|---|---|
| **Full Send** | Today's pull, unchanged. | Kill attempt. |
| **Practice Pull** | Mastery gain **×1.5** on every reached phase. Base wipe morale loss is a flat **−1 for everyone** regardless of wipe depth, and **no grievance** is charged ("everyone knew it was practice"). The boss **cannot die**: even if all 3 phases hold, the pull is called off — outcome is a wipe with the chronicle line "called at the kill — it was a drill". | Learning a wall phase without burning the roster. |
| **Safety Call** | Fumble lethality **halved** (5% → 2.5%), pass chance **−10pp** (floor 5%). | Farm phases with a serial fumbler — protect morale, accept slower progress. |

Anti-spam tension on Practice: it still costs morale (flat −1 all), fumbles
still increment cumulative F (resentment builds silently even in practice),
and it can never kill — at some point you must send it.

### Touchpoints

- `useRunStore.pull(intent: PullIntent)` — intent threaded through
  `attemptBoss`/`pullPhase`; recorded on the attempt for the outcome screen.
- Mastery: ×1.5 factor applied in `recordPull` (new param).
- Morale: practice branch in `applyWipe` (flat loss, skip grievance).
- UI: stance selector next to the Pull button (default Full Send, one extra
  click max); outcome kicker shows the stance ("Pull 4 · Practice"); chronicle
  logs the call ("The shot-caller calls a practice pull").
- Balance dials, all named constants: practice mastery factor, practice flat
  loss, safety lethality factor, safety pass malus.

## Plan

- [ ] 1. `PullIntent` type + `pull(intent)` threading; default FULL_SEND keeps every existing test green
- [ ] 2. Practice: mastery factor in `recordPull`, flat morale loss + no grievance in `applyWipe`, kill suppression + "called at the kill" outcome
- [ ] 3. Safety: lethality and pass-chance modifiers in `pullPhase`
- [ ] 4. War table stance selector + outcome/chronicle surfacing
- [ ] 5. Unit specs per stance (scripted rolls); e2e: practice pull journey (stance → wipe → doubled band progress)
- [ ] 6. Docs: attempt.md resolution modifiers, run.md flow note
