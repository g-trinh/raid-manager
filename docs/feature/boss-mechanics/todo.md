# Boss mechanics — real fights, not abstract rolls

Bosses currently resolve as 3 abstract phase rolls; `mechanicCount` is a
number that stretches the mastery curve and nothing else. This feature makes
mechanics **first-class data** — named, typed, targeted, FF14/WoW vocabulary —
and resolves pulls mechanic-by-mechanic. Boss identity becomes mechanical,
blame becomes specific ("Skarn died to Molten Chains"), and the resolution
emits a structured **pull log** that [pull-replay](../pull-replay/todo.md)
plays back.

## Design

### Data model

```ts
enum MechanicType { TANKBUSTER, RAIDWIDE, SPREAD, STACK, SOAK, ADD_WAVE, DODGE }

interface BossMechanicData {
  name: string            // "Molten Chains"
  type: MechanicType
  tested: 'skill' | 'discipline'
  targets: 'ALL' | 'TANKS' | 'HEALS' | 'DPS'   // who rolls the check
  severity: 1 | 2 | 3     // damage on a failed check; 3 = lethal to the failer
}
```

- Each phase carries `mechanics: BossMechanicData[]` (2–5, ordered — the
  fight's timeline). `mechanicCount` becomes `mechanics.length` (derivation
  deleted).
- Authoring: 10 bosses × 3 phases × 2–5 mechanics. `createMechanic` helper
  with per-type defaults (tankbuster targets TANKS/severity 3, spread targets
  ALL/severity 2…); names and order authored per boss to match its identity.

### Resolution (replaces the per-phase pass roll)

Per phase, mechanics resolve in order. Two failure sources survive the
translation — unfamiliarity (erased by learning) and execution (stat-driven,
never erased):

1. **Check per targeted member**:
   `failChance = U0 × (1 − mechanicMastery) + (5 − stat) × 6%`
   where `U0` is the unfamiliarity base (dial, ~12%) and `mechanicMastery`
   is that member's mastery of *this mechanic* (0–1).
2. **Consequences**: a failed check adds `severity` to the phase's damage
   tally; a failed **severity-3** check kills the failer on the spot.
3. **Wipe conditions**: any death → wipe (cause `blunder`, attributed to the
   dead member — grievance applies as today); damage tally exceeding the
   phase's **budget** (dial, scales with `phaseTarget`) → wipe (cause
   `learning`, nobody blamed).
4. All mechanics resolved under budget → phase holds. Three phases → kill.

Failed checks are the new fumbles: each one increments the member's
cumulative F and writes a chronicle line naming the mechanic.

### Mastery becomes per-mechanic

- `useMasteryStore` keys by (member, phase, mechanic). Gain: each pull that
  *reaches* a mechanic advances it one step (0 → 50 → 100); Discipline ≥ 4
  advances two steps. Phase mastery (for band labels, the pass formula's
  feel, war-table bars) = average over its mechanics.
- The S-curve emerges instead of being hand-banded: few-mechanic phases
  learn fast, five-mechanic phases grind — same shape, now diegetic.

### Balance compatibility (hard requirement)

The kill curve must keep its shape: fresh average roster ≈ today's base
chance per phase, full mastery ≈ execution-only failures, ~2–4 pulls per
boss. Plan includes a **balance harness** — a vitest spec that Monte-Carlos
expected pulls per boss before/after and asserts tolerance. Dials: `U0`,
severity damage values, budget formula, step count of mechanic mastery.

### Interactive resolution lands here

Resolution pauses **between mechanic events** — this rework absorbs the
pause-point state machine that [heroism](../heroism/todo.md) was going to
build, with better hooks: [battle-res](../battle-res/todo.md) triggers on a
death event, heroism on a budget-fail, [call-the-wipe](../call-the-wipe/todo.md)
on stacked failed checks. **Sequencing decision: land boss-mechanics first;
the four agency features implement against the event stream, not the
old atomic roll.** ([pull-intent](../pull-intent/todo.md) is independent and
can land before or after.)

### Pull log (the replay file)

Resolution emits a structured timeline, kept per pull for the current boss:

```ts
interface PullEvent {
  seq: number
  phaseIndex: number
  mechanic: string | null   // null for raid-level beats
  type: MechanicType | null
  memberName: string | null
  kind: 'phase-start' | 'check-pass' | 'check-fail' | 'death'
      | 'phase-hold' | 'wipe' | 'kill'
}
```

Stored in the run store (`pullLogs: PullEvent[][]`, reset per boss). The
chronicle keeps its prose lines; the log is data for
[pull-replay](../pull-replay/todo.md) and future analytics ("we always die
to the third chains").

### What the player sees (before any replay)

- Scout reports and the war-table boss plaque list real mechanics per phase
  ("Phase II — Molten Chains · The Branding · Ash Adds").
- Outcome rows name the killer mechanic; chronicle names every failed check.
- No new player verbs: depth goes into attribution and presentation, per the
  new-player rule.

## Plan

- [ ] 1. `BossMechanicData` + `createMechanic` + phase carries `mechanics[]`; delete `mechanicCount` derivation
- [ ] 2. Authoring pass: mechanics for all 10 bosses (names, types, targets, severities)
- [ ] 3. Resolution rewrite in `useRunStore`: per-mechanic checks, damage budget, death/budget wipe causes, F + chronicle per failed check
- [ ] 4. Pause-point state machine between mechanic events (the agency features' substrate)
- [ ] 5. `useMasteryStore` per-mechanic keys + step gains; phase aggregates for bands/bars
- [ ] 6. Pull log emission + `pullLogs` state (reset per boss)
- [ ] 7. Balance harness: Monte-Carlo pulls-per-boss before/after within tolerance; tune `U0`/severities/budget
- [ ] 8. UI: war-table plaque + scout report list mechanics; outcome/chronicle name killer mechanics
- [ ] 9. Unit specs (scripted rolls per mechanic) + e2e journeys updated; docs: attempt.md rewritten, boss.md, morale/todo.md cross-refs
