# ADR-006: PullEvent Log Emitted Inline by the Resolver; `pullLogs` Reset per Boss

> **File**: `docs/adr/ADR-006-pull-event-log.md`
> **Date**: 2026-06-13
> **Status**: `accepted`
> **Session**: [boss-mechanics architecture](../feature/boss-mechanics/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-006"
  title: "PullEvent log emitted inline by the resolver; pullLogs reset per boss"
  status: "accepted"
  date: "2026-06-13"
  session: "boss-mechanics"
  decision_type: "published-language"

  affects:
    contexts: ["Boss Encounter", "Pull Replay (future consumer)"]
    components: ["pullResolver.ts", "useRunStore", "OutcomeScreen (entry point later)"]

  chosen: >
    The resolver builds a PullEvent[] inline as it resolves (seq-numbered, one
    array per pull). useRunStore stores pullLogs: PullEvent[][], appended per
    pull, reset per boss (mirroring mastery's per-boss lifecycle). The chronicle
    keeps its prose lines; the log is the structured data source for pull-replay
    and analytics — chronicle prose is NEVER parsed back into events.

  rejected:
    - option: "Derive replay events from chronicle prose at replay time"
      reason: "Brittle string-parsing; pull-replay spec explicitly forbids building a parallel event source from prose. The log is the contract."
    - option: "Emit events via a separate logging store the resolver calls"
      reason: "Resolver must stay pure for Monte-Carlo + pause-machine driving (ADR-003/004). It returns the array; the store persists it."

  must_not:
    - "Do not parse chronicle text to reconstruct events. pullLogs is the only event source."
    - "Do not have the resolver write to a store. It returns pullLog in AttemptResult; the store appends it."
    - "Do not reset pullLogs on a per-pull basis — it accumulates across the current boss's pulls and resets only on chooseBoss/reset (like mastery)."
    - "Do not let a render path mutate pullLogs (same once-not-on-render discipline as droppedItems, ADR-001)."

  open_questions: []

  assumptions:
    - "A-6: a 'save' event kind is added later by heroism/battle-res (pull-replay stage 4). The kind union is open for extension; this feature ships the 7 base kinds."
```

---

## Context

`pull-replay` is a hard consumer of a structured per-pull event timeline. The
spec sketches `PullEvent` and `pullLogs: PullEvent[][]`. This ADR fixes the shape
and the exact emission points so the resolver produces a replayable log and
replay never has to parse prose.

## Decision

### The shape (from the spec, confirmed)

```ts
type PullEventKind =
  | 'phase-start' | 'check-pass' | 'check-fail' | 'death'
  | 'phase-hold' | 'wipe' | 'kill'

interface PullEvent {
  seq: number                    // monotonic within the pull
  phaseIndex: number
  mechanic: string | null        // null for raid-level beats (phase-start/wipe/kill)
  type: MechanicType | null
  memberName: string | null      // the checked/dying member; null for raid beats
  kind: PullEventKind
}
```

### Emission points (inside `resolvePull`, ADR-003 algorithm)

| Event | Emitted when |
|---|---|
| `phase-start` | entering each reached phase (mechanic/member null; carries phaseIndex so replay can label the phase + show mastery band at pull time) |
| `check-pass` | a per-mechanic per-member check passes |
| `check-fail` | a per-mechanic per-member check fails (member + mechanic + type) |
| `death` | a severity-3 check fails (the failer) — emitted before the wipe |
| `phase-hold` | a phase's verdict is hold |
| `wipe` | the pull ends in a wipe (carries the wipe phase; mechanic = killer mechanic name for blunder, null for budget/learning) |
| `kill` | all three phases held |

`seq` is assigned in emission order — which is exactly the ADR-003 resolution
order, so the log is a faithful timeline. The resolver appends to a local array
and returns it as `AttemptResult.pullLog`.

### Storage + lifecycle

```ts
interface RunState {
  // ...
  pullLogs: PullEvent[][]   // one inner array per pull of the CURRENT boss
}
```

- `performPull` appends the new pull's `pullLog` to `pullLogs`.
- `chooseBoss` and `reset` clear `pullLogs` to `[]` (new boss = new fight;
  mirrors `useMasteryStore.resetBoss()`).
- Mutated only in the store's resolve path, never on render (ADR-001 discipline).

### Relationship to the chronicle

Independent. The chronicle keeps its human prose lines (`'battle'`/`'morale'`),
authored by the store from `fumbleEvents` + outcome exactly as today (now naming
mechanics). `pullLogs` is machine data. Neither derives from the other.

## Considered Alternatives

### Option A — resolver returns `pullLog`, store appends; reset per boss *(chosen)*
Pure resolver, single source of truth, replay-ready, lifecycle mirrors mastery.

### Option B — parse chronicle prose into events at replay time
**Rejected**: brittle, and pull-replay's spec forbids it.

### Option C — resolver pushes to a dedicated event store
**Rejected**: breaks resolver purity needed for Monte-Carlo + generator driving.

## Implementation Constraints

- **DO**: build the `PullEvent[]` inline in `resolvePull`; return it in
  `AttemptResult`.
- **DO**: append per pull in the store; reset in `chooseBoss`/`reset`.
- **DO**: keep the kind union open (a `'save'` kind lands later).
- **DO NOT**: parse chronicle text; reset per pull; emit from a render path; or
  have the resolver write to any store.

## Related
- Architecture: [boss-mechanics](../feature/boss-mechanics/architecture.md)
- Depends on: ADR-002 (mechanic names/types in events), ADR-003 (emission order)
- Required by: pull-replay (sole event source)
