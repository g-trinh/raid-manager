# Call the wipe — the disciplined abort

When fumbles stack up early in a pull, a good shot-caller doesn't ride it
into the ground — they call the wipe, save everyone's nerves, and reset.
Gives the player a damage-control lever *inside* the pull.

## Design

- During resolution, **after a phase's fumble rolls land and before its pass
  roll**, if that phase produced **2 or more fumbles**, the reveal pauses:
  **Call the wipe** / **Ride it out**.
  - Gate at 2+ fumbles keeps pacing tight — clean phases never pause, and a
    single fumble isn't worth the meeting.
- Calling it ends the pull at that phase:
  - Outcome: WIPE at the current phase, cause `called` — **nobody is blamed**
    (no lethal blunder happened; no grievance is charged). Fumble counts (F)
    still accumulate.
  - Base morale loss is **1 less** than a normal wipe at that depth
    (phase I −1, II −0, III −0): calling early is exactly how you protect the
    roster from tilt.
  - Mastery: phases reached count as reached, current phase included — you
    still learned something.
- Riding it out resumes normal resolution (lethality rolls, pass roll).
- Outcome row: "Broke — called"; chronicle: "The shot-caller calls the wipe
  in Phase II — regroup".

### Tension

Calling early trades a possible phase hold (and kill progress) for morale.
Against the practice pull ([pull-intent](../pull-intent/todo.md)) it's the
reactive version: practice is declared at the table, the call is made in the
moment, with information.

### Prerequisite: interactive resolution

Shares the pause-point state machine specced in
[heroism](../heroism/todo.md) — implement that first; this feature adds a
second pause trigger (post-fumbles, pre-pass-roll) and a `called` wipe cause.

### Touchpoints

- `useRunStore`: pause trigger on ≥2 fumbles, `callWipe()` / `rideItOut()`
  continuations, `WipeCause` gains `'called'`.
- `useMoraleStore.applyWipe`: reduced base loss for called wipes, no
  grievance path.
- OutcomeScreen: pause UI, `called` cause line; chronicle lines.
- Dials: fumble-count gate (2), morale discount (1).

## Plan

- [ ] 1. Depends on heroism's pause-point state machine — land that first
- [ ] 2. Pause trigger (≥2 fumbles in current phase) + `callWipe`/`rideItOut` continuations
- [ ] 3. `'called'` wipe cause: morale discount, no grievance, mastery counts the reached phase
- [ ] 4. Reveal pause UI + outcome row/chronicle copy
- [ ] 5. Unit specs: gate threshold, morale math vs normal wipe, no-grievance, ride-it-out path; e2e: call-the-wipe journey with seeded fumbles
- [ ] 6. Docs: attempt.md, outcome.md (new wipe cause)
