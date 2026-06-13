# ADR-005: Per-Mechanic Mastery Keys with a Phase-Aggregate Read Model

> **File**: `docs/adr/ADR-005-per-mechanic-mastery.md`
> **Date**: 2026-06-13
> **Status**: `accepted`
> **Session**: [boss-mechanics architecture](../feature/boss-mechanics/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-005"
  title: "Per-mechanic mastery keys with phase-aggregate read model"
  status: "accepted"
  date: "2026-06-13"
  session: "boss-mechanics"
  decision_type: "data-model + read-model"

  affects:
    contexts: ["Mastery", "Boss Encounter"]
    components: ["useMasteryStore", "mastery.ts (logic)", "pullResolver (reads mechanicMastery)", "OutcomeScreen/WarTable (read phaseMastery)"]

  chosen: >
    Store mastery keyed by (memberName, phaseIndex, mechanicIndex) as a 0..1 (or
    0/50/100 step) value. Gain: reaching a mechanic in a pull advances it one
    step; Discipline>=4 advances two steps. The S-curve EMERGES from mechanic
    count. Phase mastery (for bands, bars, projection feel) = average over the
    phase's mechanics, exposed as phaseMastery() / rosterPhaseMastery().

  rejected:
    - option: "Keep per-phase scalar mastery, keep mechanicCount stretching the band"
      reason: "The feature deletes mechanicCount; the resolver needs per-mechanic mastery for the failChance term. A phase scalar can't feed a per-mechanic check."
    - option: "Continuous mastery gain per mechanic (smooth +x%)"
      reason: "Spec specifies discrete steps (0->50->100). Steps make the curve legible ('learned 2 of 3 mechanics') and replayable; the harness tunes step count if needed."

  must_not:
    - "Do not keep masteryGain's hand-banded DISCOVERY/DANCE/POLISH constants for the per-mechanic value — the S-curve now emerges from per-mechanic steps + averaging, not from band math. (Bands as LABELS over the aggregate stay.)"
    - "Do not read mechanicMastery from anywhere but pullResolver's check. Phase-level readers (UI, projection) use the phaseMastery aggregate."
    - "Do not change resetBoss/reset semantics — a new boss still wipes the slate; this just changes the key shape."

  open_questions:
    - "OQ-1 (shared): step count (2 steps: 0->50->100) is the starting point; the balance harness may change it to hit the curve."

  assumptions:
    - "A-5: a mechanic is 'reached' in a pull iff its phase was reached (the pull got to that phase). Within a reached phase, all its mechanics are reached even if the pull wipes mid-phase on a death — consistent with today's 'wiped phase still teaches'. (call-the-wipe later refines 'current phase counts as reached'.)"
```

---

## Context

Today mastery is keyed `(memberName, phaseIndex)` as a 0-100 scalar;
`masteryGain` hand-bands an S-curve whose middle is stretched by `mechanicCount`.
With mechanics now real and the per-mechanic check needing each member's mastery
*of that mechanic*, mastery must rekey to the mechanic level. The S-curve should
emerge from "more mechanics = more steps to fill" rather than from band math.

## Decision

### Storage: (member, phase, mechanic)

```ts
interface MasteryState {
  // memberName -> phaseIndex -> mechanicIndex -> step value
  mastery: Record<string, number[][]>

  mechanicMastery: (member: string, phaseIndex: number, mechanicIndex: number) => number // 0..1
  phaseMastery: (member: string, phaseIndex: number) => number   // 0..100, avg over mechanics
  rosterPhaseMastery: (roster: MemberData[], phaseIndex: number) => number // 0..100
  recordPull: (reached: ReachedMechanics, roster: MemberData[], factor?: number) => void
  resetBoss: () => void
  reset: () => void
}
```

Stored step value per mechanic is 0 / 50 / 100 (two steps). `mechanicMastery`
returns it as a 0..1 fraction for the resolver's `U0*(1-mMastery)` term.

### Gain rule

For each member present, for each mechanic the pull **reached** (A-5):
- advance the mechanic **one step** (0->50->100);
- if `member.discipline >= FAST_LEARNER_DISCIPLINE (4)`, advance **two steps**.

`recordPull` takes a `factor?` (pull-intent Practice ×1.5) — applied as a step
multiplier (round), preserving that feature's hook with no shape change.

`reached` is the set of (phaseIndex, mechanicIndex) the pull got to — the
resolver already knows this; the store receives it rather than recomputing.

### Read model: phase aggregate

`phaseMastery(member, phaseIndex)` = average of that phase's mechanic steps.
`rosterPhaseMastery(roster, phaseIndex)` = average across the roster — the direct
replacement for today's `rosterMastery(roster, phaseIndex)`. UI bands
(`masteryBand`), war-table bars, and the projection's "feel" read this aggregate
— their interfaces are unchanged (still a 0-100 phase number).

### The S-curve emerges

A 2-mechanic phase fills both mechanics in ~2 pulls (fast learner: 1). A
5-mechanic phase needs ~5. The aggregate climbs in `100/mechanics`-sized chunks
per reached pull — same S *feel*, now diegetic, with `masteryGain`'s
band-stretch math deleted. `mastery.ts` keeps `masteryBand(value)` (labels over
the aggregate) and `MASTERY_MAX`; it loses `masteryGain`'s
DISCOVERY/DANCE/POLISH internals (replaced by the step function) and
`FAST_LEARNER_FACTOR` becomes the +1 step rule.

## Considered Alternatives

### Option A — per-mechanic steps, phase-average read model *(chosen)*
Feeds the resolver's per-mechanic term, emergent S-curve, unchanged phase-level
read interfaces.

### Option B — keep per-phase scalar + mechanicCount band
**Rejected**: mechanicCount is deleted (ADR-002) and a phase scalar can't supply
a per-mechanic failChance. Doesn't satisfy the resolver.

### Option C — continuous per-mechanic gain
**Rejected**: spec specifies discrete steps; steps are more legible and the
harness can retune step count if the curve drifts.

## Implementation Constraints

- **DO**: rekey storage to `Record<string, number[][]>` (member -> phase ->
  mechanic).
- **DO**: expose `mechanicMastery` (0..1) for the resolver and `phaseMastery`/
  `rosterPhaseMastery` (0..100) for everyone else.
- **DO**: keep `resetBoss`/`reset` wiping the slate (new boss = new mechanics).
- **DO**: keep `masteryBand` as labels over the aggregate; keep the `factor?`
  param on `recordPull` for pull-intent.
- **DO NOT**: read `mechanicMastery` outside the resolver's check.
- **DO NOT**: retain `masteryGain`'s band constants for the per-mechanic value.

## Related
- Architecture: [boss-mechanics](../feature/boss-mechanics/architecture.md)
- Depends on: ADR-002 (mechanics define the keys)
- Required by: ADR-003 (resolver reads mechanicMastery)
