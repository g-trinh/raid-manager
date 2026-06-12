# Heroism — the clutch save

One limited charge per boss that lets the player intervene *mid-pull* at the
moment a phase breaks. Turns the resolution reveal from cinematic into a
decision point and creates the "we saved the 2% wipe" war story.

## Design

- **One Heroism charge per boss.** Granted when a boss is engaged
  (`chooseBoss` / run start), not replenished by retries. Dial: per-run
  instead of per-boss if per-boss proves too generous.
- During the outcome reveal, when a phase **breaks** and the charge is
  unspent, the reveal pauses on the broken row: **Burn Heroism** / **Let it
  go**.
  - **Learning wipe** (unfamiliarity roll failed): re-roll the pass roll once.
  - **Blunder wipe** (lethal fumble): the battle-res — the blunder is
    overridden and the phase proceeds to its normal unfamiliarity roll. The
    fumble still counts toward the member's cumulative F (the mistake
    happened; the save just caught it).
- If the re-roll also fails, the wipe stands. One intervention per charge.
- Chronicle: "HEROISM — the muster steadies, Phase II re-rolled" /
  outcome row marks the saved phase ("Held — Heroism").

### Prerequisite: interactive resolution

`attemptBoss` currently resolves all phases atomically before the reveal.
Heroism needs **pause points**: the run store resolves up to the failing
phase, exposes a `pendingIntervention` state, and continues via
`burnHeroism()` or `acceptFate()`. Build this as a small state machine in
`useRunStore` — [call-the-wipe](../call-the-wipe/todo.md) rides the same
mechanism, so implement the pause-point rework here first.

Determinism note: pausing splits the Math.random consumption sequence; the
scripted-roll unit helpers and the seeded e2e specs must account for the
extra re-roll consumption.

### Touchpoints

- `useRunStore`: charge state (`heroismReady`), pause-point state machine,
  re-roll path; reset on `chooseBoss`/`reset`.
- OutcomeScreen: pause UI on the broken row (two buttons, reveal resumes
  after choice); charge indicator on the war table ("Heroism ready/spent").
- Chronicle + outcome row labeling for saved phases.

## Plan

- [ ] 1. Interactive resolution: pause-point state machine in `useRunStore` (resolve → pending → continue), atomic path preserved when no charge
- [ ] 2. Heroism charge lifecycle (grant per boss, spend once, reset hooks)
- [ ] 3. Re-roll semantics: learning re-roll + blunder override (F still counts)
- [ ] 4. Reveal pause UI + war table charge indicator + chronicle/outcome labels
- [ ] 5. Unit specs: both wipe causes, double-fail, charge exhaustion, reset; e2e: burn-heroism journey with seeded rolls
- [ ] 6. Docs: attempt.md resolution section, outcome.md
