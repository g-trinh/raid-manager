# ADR-002: Mechanics as Ordered Phase Data Replacing `mechanicCount`

> **File**: `docs/adr/ADR-002-mechanics-as-phase-data.md`
> **Date**: 2026-06-13
> **Status**: `accepted`
> **Session**: [boss-mechanics architecture](../feature/boss-mechanics/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-002"
  title: "Mechanics as ordered phase data replacing mechanicCount"
  status: "accepted"
  date: "2026-06-13"
  session: "boss-mechanics"
  decision_type: "data-model"

  affects:
    contexts: ["Boss Encounter", "Mastery"]
    components: ["mechanic.ts (new)", "bossPhaseData.ts", "bossData.ts", "gameData.ts", "useMasteryStore", "phaseProjection (read-only)"]

  chosen: >
    Add a new data module mechanic.ts with MechanicType enum, BossMechanicData
    interface, and a createMechanic(type, name, overrides?) helper that applies
    per-type defaults. BossPhaseData gains `mechanics: BossMechanicData[]`
    (2-5, ordered) and DROPS `mechanicCount` and its derivation; any reader that
    wants the count uses `phase.mechanics.length`.

  rejected:
    - option: "Keep mechanicCount, add mechanics[] alongside it"
      reason: "Two sources of truth for the same fact (count). DRY violation; they can desync. The spec explicitly says the derivation is deleted."
    - option: "Mechanics as a Resource/JSON file loaded at runtime"
      reason: "YAGNI for the renderer prototype; gameData.ts is the established authoring surface (createBoss/createPhase). A data file adds a load path and a schema for no current benefit. Revisit when porting to Godot Resources."

  must_not:
    - "Do not keep mechanicCount as a stored field. phase.mechanics.length is the single source. Delete deriveMechanicCount()."
    - "Do not let createMechanic encode behaviour — it only sets the four data fields (type, name, tested, targets, severity). Resolution semantics live in the resolver, not the data."
    - "Do not give MechanicType members runtime behaviour in v1 (OQ-2). Type drives authoring defaults + presentation glyphs only."

  open_questions:
    - "OQ-2 (architecture): are MechanicType behaviours ever non-cosmetic? v1 says no — a mechanic is fully described by (tested, targets, severity)."

  assumptions:
    - "A-3: a boss has exactly 3 phases; each phase has 2-5 mechanics."
```

---

## Context

Today `BossPhaseData.mechanicCount: number` is derived from `phaseTarget`
(`deriveMechanicCount`) and its only effect is stretching the mastery S-curve
(`masteryGain` divides the dance band by it). Mechanics are not data — there is
nothing to name, blame, or replay.

The feature makes mechanics first-class: named, typed (FF14/WoW vocabulary),
targeted at a role set, with a severity. Resolution (ADR-003), mastery
(ADR-005), the pull log (ADR-006), and several UIs all key off this data.

## Decision

Introduce `app/src/renderer/src/domain/data/mechanic.ts`:

```ts
export enum MechanicType {
  TANKBUSTER = 'TANKBUSTER',
  RAIDWIDE = 'RAIDWIDE',
  SPREAD = 'SPREAD',
  STACK = 'STACK',
  SOAK = 'SOAK',
  ADD_WAVE = 'ADD_WAVE',
  DODGE = 'DODGE'
}

export type MechanicTargets = 'ALL' | 'TANKS' | 'HEALS' | 'DPS'
export type Severity = 1 | 2 | 3 // 3 = lethal to the failer

export interface BossMechanicData {
  name: string // "Molten Chains"
  type: MechanicType
  tested: 'skill' | 'discipline'
  targets: MechanicTargets // who rolls the check
  severity: Severity // damage on a failed check
}

// Per-type defaults; overrides win. Defaults encode the design's vocabulary
// (tankbuster -> TANKS / sev 3, spread -> ALL / sev 2, etc.) so authoring is terse.
export function createMechanic(
  type: MechanicType,
  name: string,
  overrides?: Partial<Omit<BossMechanicData, 'type' | 'name'>>
): BossMechanicData
```

`bossPhaseData.ts`:

```ts
export interface BossPhaseData {
  name: string
  flavor: string
  dpsWeight: number
  tankWeight: number
  healWeight: number
  phaseType: PhaseType
  phaseTarget: number
  mechanics: BossMechanicData[] // 2-5, ordered — the fight's timeline
}

export function createPhase(
  name, flavor, dpsWeight, tankWeight, healWeight, phaseType, phaseTarget,
  mechanics: BossMechanicData[]
): BossPhaseData
```

`deriveMechanicCount` and the `mechanicCount` field are deleted. Every reader
that wants the count reads `phase.mechanics.length`.

**Per-type defaults table** (the spec's worked vocabulary — overridable):

| Type | default `tested` | default `targets` | default `severity` |
|---|---|---|---|
| TANKBUSTER | skill | TANKS | 3 |
| RAIDWIDE | discipline | ALL | 2 |
| SPREAD | discipline | ALL | 2 |
| STACK | discipline | ALL | 2 |
| SOAK | discipline | DPS | 2 |
| ADD_WAVE | skill | DPS | 1 |
| DODGE | skill | ALL | 1 |

> These defaults are the *authoring ergonomics*; the balance harness (ADR-003)
> may retune severities globally. They are not balance commitments, they are a
> sensible starting point so `createMechanic(TANKBUSTER, 'Sunder')` reads clean.

## Considered Alternatives

### Option A — `mechanics[]` replaces `mechanicCount` *(chosen)*
Single source of truth, mechanics are data, count is derived where needed.

**Cons**: every `gameData.ts` phase (30 phases) must be re-authored with real
mechanics (Task in breakdown); `useMasteryStore.recordPull` signature changes
from `mechanicCounts` to per-mechanic data (ADR-005).

### Option B — keep `mechanicCount`, add `mechanics[]` alongside
**Rejected**: two facts for one truth; they desync the moment someone authors 4
mechanics but leaves `mechanicCount: 3`. The spec mandates deletion.

### Option C — mechanics in a runtime-loaded data file (JSON/Resource)
**Rejected (YAGNI)**: gameData.ts is the established, type-checked authoring
surface. A data file buys nothing today and adds a parse/validate path. The
Godot port will revisit this as a Resource; not this feature's problem.

## Authoring at scale — worked example (Moloch the Unbound)

Confirms the `createMechanic` pattern scales to 10 bosses x 3 phases x 2-5
mechanics. Phase I of Moloch (`The Searing March`, SKILL_HEAVY, 3 DPS-weighted):

```ts
createPhase(
  'The Searing March', '...flavor...', 3, 1, 1, PhaseType.SKILL_HEAVY, 3.3,
  [
    createMechanic(MechanicType.ADD_WAVE, 'Iron Host'),            // skill/DPS/1
    createMechanic(MechanicType.DODGE, 'Sweeping Cleave'),         // skill/ALL/1
    createMechanic(MechanicType.TANKBUSTER, 'Forgecrush')          // skill/TANKS/3
  ]
)
```

3 mechanics, ordered as the timeline, names carry the boss's iron-forge
identity. The other 9 bosses follow the same shape; authoring is one
`createMechanic` line per mechanic. Total ~90-100 mechanic lines across the
file — verbose but flat and mechanical, exactly like the existing phase
authoring. No helper beyond `createMechanic` is warranted (YAGNI).

## Implementation Constraints

- **DO**: put the enum/interface/helper in a new `mechanic.ts`; import into
  `bossPhaseData.ts`. Keep `bossPhaseData.ts` free of resolution logic.
- **DO**: read `phase.mechanics.length` wherever the old `mechanicCount` was read
  (notably `useMasteryStore` — superseded by ADR-005's richer signature).
- **DO NOT**: keep `mechanicCount` or `deriveMechanicCount`.
- **DO NOT**: encode resolution behaviour in `createMechanic` or `MechanicType`.

## Related
- Architecture: [boss-mechanics](../feature/boss-mechanics/architecture.md)
- Required by: ADR-003 (resolution reads mechanics), ADR-005 (mastery keys), ADR-006 (events name mechanics)
