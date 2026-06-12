# Heroism — the clutch lust

One limited charge per boss that lets the player intervene *mid-pull* when a
phase breaks on execution throughput. Lust at the right moment — the "we
saved the 2% wipe" war story. Counterpart: [battle-res](../battle-res/todo.md)
handles blunder deaths; Heroism handles the raid simply not being enough.

## Design

- **One Heroism charge per boss.** Granted when a boss is engaged
  (`chooseBoss` / run start), not replenished by retries. Dial: per-run
  instead of per-boss if per-boss proves too generous.
- During the outcome reveal, when a phase breaks on a **learning wipe**
  (the unfamiliarity/pass roll failed) and the charge is unspent, the reveal
  pauses on the broken row: **Burn Heroism** / **Let it go**.
  - Burning it **re-rolls the pass roll once**. If the re-roll also fails,
    the wipe stands — one intervention per charge.
  - Blunder wipes (lethal fumbles) are NOT savable by Heroism — more dps
    doesn't fix someone standing in the fire. That save is
    [battle-res](../battle-res/todo.md)'s job.
- Chronicle: "HEROISM — the muster surges, Phase II re-rolled"; outcome row
  marks the saved phase ("Held — Heroism").

### Prerequisite: interactive resolution

`attemptBoss` currently resolves all phases atomically before the reveal.
Heroism needs **pause points**: the run store resolves up to the failing
phase, exposes a `pendingIntervention` state, and continues via
`burnHeroism()` or `acceptFate()`. Build this as a small state machine in
`useRunStore` — [battle-res](../battle-res/todo.md) and
[call-the-wipe](../call-the-wipe/todo.md) ride the same mechanism, so this
feature lands the rework first.

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
- [ ] 3. Re-roll semantics on learning breaks only
- [ ] 4. Reveal pause UI + war table charge indicator + chronicle/outcome labels
- [ ] 5. Unit specs: re-roll save, double-fail, blunder wipes not eligible, charge exhaustion, reset; e2e: burn-heroism journey with seeded rolls
- [ ] 6. Docs: attempt.md resolution section, outcome.md
