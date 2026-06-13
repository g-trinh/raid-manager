# ADR-003: Mechanic-by-Mechanic Resolution and the RNG Draw-Order Contract

> **File**: `docs/adr/ADR-003-mechanic-resolution-and-rng-contract.md`
> **Date**: 2026-06-13
> **Status**: `accepted`
> **Session**: [boss-mechanics architecture](../feature/boss-mechanics/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-003"
  title: "Mechanic-by-mechanic resolution with damage budget; exact RNG draw-order contract"
  status: "accepted"
  date: "2026-06-13"
  session: "boss-mechanics"
  decision_type: "core-algorithm"

  affects:
    contexts: ["Boss Encounter", "Mastery", "Morale", "Chronicle"]
    components: ["pullResolver.ts (new)", "useRunStore", "phaseProjection (read)", "useMasteryStore (read)", "useMoraleStore (unchanged contract)"]

  chosen: >
    Extract resolution into a pure pullResolver module. Per phase, mechanics
    resolve in order; each mechanic rolls one check per targeted member
    (failChance = U0*(1-mechanicMastery) + (5-stat)*PIP). A failed check adds
    `severity` to the phase damage tally and is recorded as a fumble (F++ +
    chronicle). A failed severity-3 check kills the failer (-> blunder wipe). The
    phase holds if all mechanics resolve with tally <= budget; tally > budget is
    a learning wipe. The RNG draw order is frozen as a contract.

  rng_contract: >
    Per phase, in mechanic order: for each mechanic, one draw per targeted member
    (roster order) for the check; if a check FAILS and severity===3, one
    immediate lethality... NO — severity-3 failure is lethal by definition, no
    second roll. (Contrast: old model rolled fumble then a separate lethality
    roll. New model folds lethality into the single check at severity 3.) After
    all mechanics in the phase: NO separate pass roll (the budget comparison is
    deterministic). Draws per phase = sum over mechanics of |targeted members|.

  rejected:
    - option: "Keep a separate per-fumbler lethality roll like today"
      reason: "Severity already encodes lethality (sev 3 = lethal). A second roll re-introduces the abstract layer the feature removes and doubles the RNG bookkeeping for replay/heroism."
    - option: "Keep the post-phase unfamiliarity pass roll, drive only damage from mechanics"
      reason: "Two failure dials (pass roll AND budget) for the same 'phase holds?' question. The budget IS the learning-wipe condition now; a pass roll on top is redundant and uncombinable with the harness."

  must_not:
    - "Do not read raw member.skill/discipline in the resolver. The store passes an already-effective roster (effectiveRoster()). Single-seam rule (tech_debt.md)."
    - "Do not add a separate lethality roll. Severity 3 failed check IS the death. One draw per (mechanic, targeted member)."
    - "Do not hardcode U0 / severity damage / budget formula as magic numbers scattered in the resolver — they are named exported dials the harness tunes."
    - "Do not let the resolver mutate stores directly during the pure resolution pass. It returns AttemptResult + PullEvent[] + side-effect intents (fumbles to record); the store applies them. (Keeps the resolver testable and replayable.)"

  open_questions:
    - "OQ-1: numeric values of U0, severity damage [s1,s2,s3], budget(phaseTarget). Set by the harness, not this ADR."
    - "OQ-3: pull-intent Safety/Practice mapping onto the new dials (see 'pull-intent compatibility')."
```

---

## Context

`pullPhase` + `attemptBoss` in `useRunStore` resolve a phase as: one fumble roll
per member -> one lethality roll per fumbler -> one unfamiliarity pass roll
(mastery-lifted base chance). The feature replaces this with mechanic-by-mechanic
resolution where the phase's verdict comes from a **damage tally vs budget**, and
lethality is folded into severity.

This is the combat core. Three things must come out right: the **algorithm**, the
**exact RNG draw order** (a contract — heroism/battle-res/replay reason about
specific draws), and **balance parity** (the harness).

## Decision

### 1. Extract a pure resolver module

New `app/src/renderer/src/domain/logic/pullResolver.ts`. `useRunStore` stops
owning the algorithm; it owns *driving* the resolver and applying its outputs to
stores. The resolver is pure over its inputs (roster, boss, mastery snapshot,
dials, and an `rng = Math.random` injected for testability) and returns data —
it does not call `useMoraleStore`/`useChronicleStore` itself. (ADR-004 makes it a
generator; this ADR defines the algorithm it runs.)

### 2. The per-mechanic check

For mechanic `m` in phase `p`, for each member in `targetedMembers(m, roster)`
(roster order, filtered by `m.targets`):

```
stat        = member[m.tested]                       // from effective roster
mMastery    = masteryStore.mechanicMastery(member, phaseIndex, mechanicIndex) // 0..1
failChance  = U0 * (1 - mMastery) + (5 - stat) * FUMBLE_CHANCE_PER_PIP
fail        = rng() < failChance
```

`U0` is the unfamiliarity base dial (~0.12). `FUMBLE_CHANCE_PER_PIP` is today's
0.06, reused. Two failure sources are preserved exactly as the spec frames them:
unfamiliarity (the `U0*(1-mMastery)` term, erased by learning) and execution
(the `(5-stat)*PIP` term, never erased).

### 3. Consequences of a failed check

A failed check is the **new fumble**:
- adds `m.severity` to the phase's running `damageTally`;
- emits a `check-fail` PullEvent (ADR-006);
- is recorded as a fumble: `member` -> `F++` (morale.recordFumble) + chronicle
  line naming the mechanic ("Skarn fumbles Molten Chains in Phase II");
- if `m.severity === 3`: the failer **dies** — emit a `death` event, mark the
  phase a **blunder wipe** attributed to that member, and stop the phase. (This
  is the on-death hook point, ADR-004.)

A passed check emits `check-pass` (collapsed in replay).

### 4. Phase verdict

After all mechanics resolve (no member died):
- `budget = phaseBudget(phaseTarget)` (dial; scales with `phaseTarget`);
- `damageTally <= budget` -> **phase holds** (emit `phase-hold`);
- `damageTally > budget` -> **learning wipe**, nobody blamed (this is the
  on-budget-fail hook point, ADR-004).

The phase verdict is **deterministic given the checks** — there is NO separate
pass roll. All randomness is in the per-member checks.

### 5. Pull verdict

Phases resolve in order (A-3: 3 phases). First wipe ends the pull; later phases
are `reached: false`. Three holds -> kill. `wipePhaseIndex`, `cause`
(`'blunder'|'learning'`), and `blunderer` carry forward to morale exactly as
today — `applyWipe(wipePhaseIndex, blunderer, roster)` is **unchanged**.

### 6. The RNG draw-order contract (FROZEN)

> This is the part scripted-roll tests and the agency features depend on.

Per pull, phases in index order. Per phase, mechanics in array order. Per
mechanic, one `rng()` draw per targeted member in **roster order**:

```
draws(phase) = Σ over mechanics m of  |targetedMembers(m, roster)|
```

- **No** per-fumbler lethality roll (folded into severity-3 check).
- **No** post-phase pass roll (verdict is the deterministic budget compare).
- Members not targeted by a mechanic consume **no** draw for it.
- A phase past a wipe consumes **no** draws (not reached).

Worked example — phase with mechanics `[ADD_WAVE→DPS(4), DODGE→ALL(8), TANKBUSTER→TANKS(2)]`,
full 8-member roster: `4 + 8 + 2 = 14` draws. (Old model for the same phase:
8 fumble + (fumblers) lethality + 1 pass.) **The test helpers in
`useRunStore.test.ts` must be rewritten to this schedule** — old
`NO_FUMBLES`/`PHASE_PASSES` constants no longer map.

ADR-004 defines where an *intervention* draw (heroism's one re-roll of the
verdict) is inserted relative to this schedule, so that feature can script it.

### 7. Named dials (the harness tunes these)

Exported from `pullResolver.ts` (or a sibling `resolutionDials.ts`):

```ts
export const U0 = 0.12                       // unfamiliarity base
export const FUMBLE_CHANCE_PER_PIP = 0.06    // reused from today
export const SEVERITY_DAMAGE = { 1: 1, 2: 2, 3: 3 } // sev->tally contribution (placeholder)
export function phaseBudget(phaseTarget: number): number // scales with target
```

Exact values are OQ-1 — the design fixes the shape; the harness fixes the
numbers so balance parity holds.

> **OQ-1 resolved (BM-07b, 2026-06-13).** Committed values that make
> `pullResolver.balance.test.ts` green across all 10 bosses:
> `U0 = 0.12`, `FUMBLE_CHANCE_PER_PIP = 0.06`, `SEVERITY_DAMAGE = {1:1, 2:2, 3:3}`,
> `phaseBudget(t) = round(t * 4)`. The harness asserts a **fresh average roster**
> kills in a mean of 1–8 pulls/boss and a **fully-mastered roster** in 1–4
> pulls/boss (500-run Monte-Carlo, seeded `mulberry32` for CI determinism).
> The budget multiplier landed at ×4 (not the ×2 first tried) because the
> per-mechanic check is far less punishing than the old single pass roll — at ×2,
> discipline-heavy phases (3–4 sev-2 mechanics, every member checked) wiped fresh
> rosters ~20–35 pulls deep, well outside tolerance. ×4 restores the
> ≈2–4-pull feel while keeping full-mastery wipes execution-only. If a future
> balance report shows the late game feels too soft, `phaseBudget` is the first
> dial to retighten.

### 8. Balance harness (hard requirement)

New `app/src/renderer/src/domain/logic/pullResolver.balance.test.ts` (or
`.bench`-style vitest spec, run in CI). It:

- Monte-Carlos N pulls-per-boss (e.g. 10k runs) for a **fresh average roster**
  and a **fully-mastered roster** against each of the 10 bosses, using the new
  resolver with `rng = Math.random` (or a seeded PRNG for repeatability).
- Asserts mean pulls-per-boss is within tolerance of the **target curve**: fresh
  roster ≈ today's base per-phase chance (≈2-4 pulls/boss), full mastery ≈
  execution-only failures.
- The assertions are the spec ("keep the kill curve's shape"); the dials (`U0`,
  `SEVERITY_DAMAGE`, `phaseBudget`) are the knobs turned until the assertions
  pass. The committed values are whatever satisfies the harness.

> The harness is authored against the **shape** contract here; the numeric
> tolerances and final dial values are produced during implementation (Task 7)
> and recorded back into the dials + this ADR's OQ-1 resolution note.

### 9. Side-effect discipline

The resolver returns:
```ts
interface AttemptResult {
  phaseResults: PhaseResult[]
  phasesSucceeded: number
  outcome: Outcome
  wipePhaseIndex: number | null
  quitter: string | null            // store fills after applying morale
  pullLog: PullEvent[]              // ADR-006
  fumbleEvents: { member: string; phaseIndex: number; mechanicIndex: number }[] // store applies F + chronicle
}
```

`PhaseResult` extends today's shape (keeps `phase, score, chance, success,
reached, masteryPct, fumblers, cause?, blunderer?`) and gains:
```ts
  damageTally: number
  budget: number
  killerMechanic?: string   // name of the mechanic that broke the phase (death or first over-budget contributor)
  failedChecks: { member: string; mechanic: string }[]
```
`fumblers` stays (derived as the distinct members in `failedChecks`) so existing
readers keep working. The store records fumbles/chronicle from `fumbleEvents`
and calls `applyWipe`/`applyKill` exactly where `attemptBoss` does today.

## pull-intent compatibility (OQ-3, sketch only)

`pull-intent` threads a `PullIntent` and modifies three things; mapped onto the
new dials so its later landing is mechanical:

| Intent effect (old) | New mapping |
|---|---|
| Practice: mastery ×1.5 | factor passed to `recordPull` (ADR-005) — unchanged shape |
| Practice: kill suppressed | resolver/store turns a would-be VICTORY into a "called at the kill" wipe — orthogonal to checks |
| Safety: lethality halved | severity-3 checks use a reduced fail chance OR a sev-3 failure is downgraded to sev-2 for the tally; **decide when pull-intent lands** |
| Safety: pass chance −10pp | maps to a budget penalty (effective budget reduced) since there is no pass roll |

The resolver's `resolvePull(roster, boss, masterySnapshot, dials, rng)` signature
takes a `dials` object; pull-intent supplies a modified `dials` per stance — no
new parameter shape churn. This is enough to confirm pull-intent is not made
awkward; the exact Safety mapping is its own ADR.

## Considered Alternatives

### Option A — fold lethality into severity, budget = learning verdict *(chosen)*
One draw per (mechanic, member); deterministic verdict. Minimal RNG, clean
contract, directly replayable.

### Option B — keep separate lethality + keep pass roll, add damage on top
**Rejected**: three failure dials (lethality, pass roll, budget) answering one
question. Untunable by the harness, redundant draws, harder replay.

### Option C — resolver mutates stores inline (as `attemptBoss` does today)
**Rejected**: not replayable, not Monte-Carlo-able without store resets per
iteration, and the pause machine (ADR-004) needs the resolver to be drivable
without committing side effects mid-pull. Pure-resolve + store-applies wins.

## Implementation Constraints

- **DO**: extract `pullResolver.ts`; keep it pure (inputs in, data out), with
  `rng` injectable.
- **DO**: receive an already-effective roster from the store; the resolver never
  touches raw stats (single-seam rule).
- **DO**: keep `applyWipe`/`applyKill`/`projectPhase` contracts unchanged; the
  store remains the only mutator.
- **DO**: enumerate every draw per the §6 contract; rewrite `useRunStore.test.ts`
  scripted-roll helpers to match.
- **DO NOT**: add a lethality roll or a post-phase pass roll.
- **DO NOT**: scatter `U0`/severity/budget as literals — they are named dials.
- **DO NOT**: commit dial values that fail the balance harness.

## Related
- Architecture: [boss-mechanics](../feature/boss-mechanics/architecture.md)
- Depends on: ADR-002 (mechanics data), ADR-005 (mechanicMastery read)
- Required by: ADR-004 (hooks sit at on-death / budget-fail / pre-verdict), ADR-006 (events)
- Touches: tech_debt.md single-seam rule (new stat-read site routed through effectiveRoster)
