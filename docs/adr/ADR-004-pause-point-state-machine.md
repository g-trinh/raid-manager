# ADR-004: Pause-Point State Machine as a Resumable Generator-Driven Resolver

> **File**: `docs/adr/ADR-004-pause-point-state-machine.md`
> **Date**: 2026-06-13
> **Status**: `accepted`
> **Session**: [boss-mechanics architecture](../feature/boss-mechanics/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-004"
  title: "Pause-point state machine as a resumable generator-driven resolver"
  status: "accepted"
  date: "2026-06-13"
  session: "boss-mechanics"
  decision_type: "extensibility-substrate"

  affects:
    contexts: ["Boss Encounter"]
    components: ["pullResolver.ts", "useRunStore", "OutcomeScreen (driver only)"]
    future_consumers: ["heroism", "battle-res", "call-the-wipe"]

  chosen: >
    Model resolution as a generator (resolvePull yields PausePoint at three named
    hooks: pre-verdict, on-death, on-budget-fail). useRunStore drives the
    generator step by step. With no trigger registered, the store auto-resumes
    every yield with {action:'continue'} — atomic behaviour, unchanged reveal.
    A registered trigger sets pendingIntervention, freezes the run state, and the
    generator resumes only when a continuation (burnHeroism/battleRes/callWipe/
    acceptFate) feeds a Resolution back in.

  rejected:
    - option: "Observer/event-bus: resolver emits events, listeners react"
      reason: "Listeners can observe but cannot ALTER the in-flight result (override a death, re-roll a verdict). The agency features mutate resolution, not just watch it."
    - option: "Explicit enum state machine (PHASE/MECHANIC/PAUSED states) externalised in the store"
      reason: "Forces every resolver local (phase index, mechanic cursor, running tally, partial PhaseResult) into store state and back. Huge surface, easy to desync. The generator keeps locals on its own stack."
    - option: "Build the actual pause UI/triggers now"
      reason: "YAGNI + new-player rule (no new verbs this feature). Only the hook positions + resume vocabulary are landed; triggers ship with each agency feature."

  must_not:
    - "Do not register any trigger in boss-mechanics. The machine ships dormant: every yield auto-continues. The atomic-resolution unit tests must pass byte-for-byte in behaviour (only RNG schedule changes, per ADR-003)."
    - "Do not put resolver locals (tally, cursors, partial results) into the store. The store holds only: the suspended generator, pendingIntervention, and final AttemptResult."
    - "Do not let a continuation function (burnHeroism, etc.) exist in boss-mechanics. Only the GENERIC resume(resolution) plumbing + the three hook kinds ship now."
    - "Do not make pendingIntervention drive any UI in boss-mechanics; OutcomeScreen ignores it (it is always null at reveal time when no trigger is registered)."

  open_questions: []

  assumptions:
    - "A-4: resolution runs synchronously to completion within a single pull() call when dormant. Pausing for a human decision is a future-feature concern; the generator simply suspends and the store re-enters via a continuation action dispatched from UI."
```

---

## Context

Four features (heroism, battle-res, call-the-wipe) each need to interrupt
resolution mid-pull, alter the in-flight outcome, and resume. Their specs all
say "land the pause-point state machine in the resolution rewrite first." This
ADR fixes that substrate so none of the three has to re-touch the resolver.

The hard requirement: **observe + decide + alter + resume**, at three named
moments, without those features existing yet, and with **zero behaviour change**
when no feature is active.

## Decision

### Resolution is a generator

`pullResolver.resolvePull` is a generator. It runs the ADR-003 algorithm and,
at three points, `yield`s a `PausePoint` describing the moment, then receives a
`Resolution` instruction telling it how to proceed:

```ts
type PausePointKind = 'pre-verdict' | 'on-death' | 'on-budget-fail'

interface PausePoint {
  kind: PausePointKind
  phaseIndex: number
  // context the future trigger/UI needs to decide + label:
  failedChecks: { member: string; mechanic: string }[]
  dyingMember?: string         // on-death
  damageTally?: number         // on-budget-fail / pre-verdict
  budget?: number
}

type Resolution =
  | { action: 'continue' }                 // proceed unchanged (default)
  | { action: 'wipe'; cause: WipeCause }   // call-the-wipe: end pull here (cause 'called')
  | { action: 'override' }                 // battle-res: cancel the pending death, continue the phase
  | { action: 'reroll' }                   // heroism: re-roll the budget verdict once

// The resolver:
function* resolvePull(
  roster, boss, masterySnapshot, dials, rng
): Generator<PausePoint, AttemptResult, Resolution>
```

### The three hooks (positions FROZEN)

| Kind | Yielded exactly when | Default (`continue`) | Future consumer + its action |
|---|---|---|---|
| `pre-verdict` | a phase's mechanic checks are all tallied, **before** death/budget verdict is finalised | proceed to verdict | **call-the-wipe**: if `failedChecks.length >= 2`, may return `{wipe,'called'}` |
| `on-death` | a severity-3 check just failed (member is about to die) | death stands -> blunder wipe | **battle-res**: may return `{override}` — cancel death, keep the fumble's F, continue the phase |
| `on-budget-fail` | phase verdict computed as budget-exceeded learning wipe | learning wipe stands | **heroism**: may return `{reroll}` — re-roll the verdict once |

> Mapping to spec names: heroism's "post-fumble-checks-pre-pass-roll" = our
> `pre-verdict`; battle-res's "on-death" = `on-death`; heroism's
> "on-budget-fail" = `on-budget-fail`. call-the-wipe rides `pre-verdict` (the
> >=2-fumbles gate). These are the spec's three intents, repositioned onto the
> mechanic flow.

### How the store drives it

`useRunStore` owns a thin driver loop:

```ts
// pseudocode
const gen = resolvePull(roster, boss, snapshot, dials, Math.random)
let step = gen.next()                         // run to first yield (or done)
while (!step.done) {
  const pause = step.value
  const trigger = matchTrigger(pause)         // registry; EMPTY in boss-mechanics
  if (!trigger) {
    step = gen.next({ action: 'continue' })   // auto-resume — atomic behaviour
  } else {
    // FUTURE: freeze, set pendingIntervention = {pause, options}, return.
    // A continuation action (burnHeroism/battleRes/callWipe/acceptFate)
    // re-enters and calls gen.next(resolution) to resume.
    set({ pendingIntervention: { pause, gen /* suspended */ } })
    return
  }
}
applyAttempt(step.value)                       // morale/chronicle/mastery/state
```

In **boss-mechanics**, `matchTrigger` always returns nothing -> the loop runs to
completion in one synchronous `pull()` call -> identical behaviour to today's
atomic resolution. `pendingIntervention` is always `null` at reveal.

### State the store adds (dormant)

```ts
interface RunState {
  // ...existing...
  pendingIntervention: PendingIntervention | null   // always null in this feature
}
interface PendingIntervention {
  pause: PausePoint
  // the suspended generator is held in a store-private ref, NOT in serialisable state
}
```

The suspended generator is held in a module/closure ref inside the store
(non-serialisable), not in the public state object — `pendingIntervention`
exposes only the serialisable `pause` describing context for UI.

### What ships now vs later

- **Now (boss-mechanics)**: the generator with three `yield` points; the driver
  loop with an empty trigger registry; `pendingIntervention` state field
  (always null); `Resolution`/`PausePoint` types. All `Resolution` actions are
  *handled* by the generator (so the resume paths are real and unit-testable by
  feeding actions directly to the generator), even though no trigger dispatches
  them in this feature.
- **Later (each agency feature)**: registers a trigger predicate +
  continuation function (`burnHeroism`/`battleRes`/`callWipe`/`acceptFate`) that
  feeds the matching `Resolution`. Adds its charge state + reset hooks. Adds the
  OutcomeScreen pause UI. None of these re-touch `resolvePull`.

### RNG interaction with the re-roll action

ADR-003 §6 freezes the no-intervention draw schedule. The `reroll` action
(heroism) consumes **one additional draw**, inserted immediately after the phase
verdict's draws (i.e. after the last mechanic check of the phase) — but note the
new verdict is the deterministic budget compare, so `reroll` re-rolls *the checks
that contributed over-budget damage*? No: to keep replay/scripting simple,
`reroll` re-runs the **whole phase's checks once** with current mastery,
consuming `draws(phase)` additional draws appended after the original phase's
draws. This is the single defined intervention-draw position; heroism's tests
script exactly that block. (Confirmed-final when heroism lands; positioned here
so the schedule is unambiguous.)

## Considered Alternatives

### Option A — generator yielding PausePoint, store drives *(chosen)*
Resolver keeps all locals on its stack; store mutates flow via returned
`Resolution`; alteration (override/reroll/wipe) is expressible; dormant = auto
-continue. Smallest construct that satisfies observe+decide+alter+resume.

### Option B — observer / event bus
**Rejected**: cannot alter the in-flight result. Battle-res must cancel a death
*before* it becomes the wipe; an after-the-fact event can't.

### Option C — explicit enum state machine in the store
**Rejected**: externalises every resolver local into store state (phase cursor,
mechanic cursor, running tally, partial PhaseResult) and back — a large, fragile
surface that the generator gets for free on its call stack. Violates KISS.

### Option D — build triggers/UI now
**Rejected**: YAGNI + the new-player "no new verbs this feature" rule. Hooks are
the expensive part; triggers are cheap per-feature. Ship hooks dormant.

## Implementation Constraints

- **DO**: implement `resolvePull` as a generator with the three yields at the
  exact positions above; handle all four `Resolution` actions inside it.
- **DO**: drive it from the store with an empty trigger registry; auto-`continue`
  every yield.
- **DO**: hold the suspended generator in a store-private ref; expose only the
  serialisable `pause` via `pendingIntervention`.
- **DO**: unit-test the resume paths by feeding `Resolution` actions directly to
  the generator (proves override/reroll/wipe work before any feature uses them).
- **DO NOT**: register a trigger, add a charge, add `burnHeroism`/`battleRes`/
  `callWipe`/`acceptFate`, or add pause UI in this feature.
- **DO NOT**: move resolver locals into store state.

## Related
- Architecture: [boss-mechanics](../feature/boss-mechanics/architecture.md)
- Depends on: ADR-003 (the algorithm the generator runs)
- Required by: heroism, battle-res, call-the-wipe (each registers a trigger + continuation)
- Logged in: tech_debt.md ("Dormant pause machine: hook positions + RNG re-roll slot are a contract")
