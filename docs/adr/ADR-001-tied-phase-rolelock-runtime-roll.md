# ADR-001: Tied-Phase Role Lock Resolved via Runtime Weighted Roll

> **File**: `docs/adr/ADR-001-tied-phase-rolelock-runtime-roll.md`
> **Date**: 2026-06-11
> **Status**: `accepted`
> **Superseded by**: *(none)*
> **Session**: [loot_signature_items_v2 architecture](../feature/loot_signature_items_v2/architecture.md)

---

```yaml
ai_context:
  adr: "ADR-001"
  title: "Tied-phase Role Lock resolved via runtime weighted roll"
  status: "accepted"
  date: "2026-06-11"
  session: "loot_signature_items_v2"

  decision_type: "cross-cutting"

  affects:
    contexts: ["Loot", "Run/BossEncounter"]
    components: ["lootData.ts", "bossData.ts", "gameData.ts", "signatureLoot.ts", "useRunStore", "SpoilsScreen", "useLootStore", "LootCard"]

  chosen: "Runtime weighted roll, computed once at resolve()/chooseBoss() time and stored as run state"

  constraints_that_drove_this:
    - "docs/feature/loot_signature_items_v2/game_design.md frames the per-boss authored tie-break weighting as 'the only randomness in the loot system' — an explicit gameplay-variance goal, not just a content-authoring tool."
    - "The 'no randomization within a boss's drop' rule (item existence/count/timing fully deterministic) is framed as a contrast — it only makes sense if roleLock CAN vary at runtime for tied items."
    - "Existing consumers (useLootStore.bestow, LootCard, satchel/equippedBy/discarded) must keep working with a single concrete roleLock: Role per item, with zero special-casing."

  rejected:
    - option: "Authoring-time fixed roll — gameData.ts hardcodes roleLock directly using the '-> Tank' style results already shown in game_design.md as final values"
      reason: "Removes run-to-run variance entirely (same boss always drops the same role-locked item), contradicting 'the only randomness in the loot system'; would also make that framing in game_design.md actively misleading with no contract change to show for it."

  must_not:
    - "Do not call selectDroppedItems() from a render path (render body or a useMemo recomputed on every render) — roleLock for tied items would re-roll and visibly flicker across renders of the same boss-clear."
    - "Do not let any consumer downstream of selectDroppedItems() (useLootStore, LootCard, bestow, SpoilsScreen) read or special-case roleLockWeights — by the time an item leaves selectDroppedItems(), roleLock must be a concrete Role and roleLockWeights must be stripped from the returned object."
    - "Do not vary id/name/flavor/skillBonus/liabilityBonus based on the rolled roleLock — only roleLock is randomized; item identity and stats are fixed by gameData.ts."

  open_questions:
    - "OQ-1 (architecture doc): The Sundered Titan's P2 (1/3/3 Tank-Heal) and P3 (3/3/2 DPS-Tank) tie weightings are not yet authored in docs/feature/loot_signature_items_v2/game_design.md."

  assumptions:
    - "A-2 (architecture doc): Math.random() — already used for phase-success rolls in attemptBoss — is sufficient RNG for this roll; no seeding/determinism/replay requirement exists today."
```

---

## Context

`docs/feature/loot_signature_items_v2/game_design.md` redesigns signature loot from 1 item per boss to 3 items per boss (one derived per phase), with each item's Role Lock normally derived deterministically from its phase's highest-weight role (`dpsWeight`/`tankWeight`/`healWeight`). For phases where weights are tied (e.g. 2/2/2, 3/3/3, or a 2-way tie), the design authors a per-boss weighted distribution to pick the locked role — e.g. Moloch's Phase 2 (1/3/3 Tank-Heal tie) is given an authored 60/40 Tank-leaning split.

`docs/feature/loot_signature_items_v2/game_design.md` explicitly calls this "the only randomness in the loot system," scoped narrowly: item existence, count, and timing remain fully deterministic — only *which role a tied phase's item locks to* is subject to this weighting. It was ambiguous whether "randomness" here means a one-time design-time coin flip (the doc's "-> Tank" results are simply the final, hardcoded answer) or a roll that happens during actual gameplay each time the item drops.

This matters architecturally because it determines whether `LootItemData.roleLock` can be treated as static content (today's model) or must become a value resolved at a defined computation point, with implications for the data contract and for where/when that computation runs relative to React's render cycle.

---

## Goals

- Reproduce, exactly, the per-boss authored weightings from `docs/feature/loot_signature_items_v2/game_design.md` (e.g. Moloch P2 60/40 Tank-Heal) as the probability distribution for the affected item's `roleLock`.
- Keep `roleLock: Role` as the single, concrete field every existing consumer (`useLootStore`, `LootCard`, satchel/bestow) relies on — no consumer-side branching on "is this item tied?".
- Avoid any visible inconsistency (e.g. an item's displayed Role Lock changing between renders) for the player.

## Non-Goals

- Determining the actual weighting numbers for The Sundered Titan (OQ-1) — that is a content-authoring task, not part of this decision.
- Introducing seeding, replay, or determinism guarantees for the roll (covered by assumption A-2).

---

## Decision

**We will: resolve a tied-phase item's `roleLock` via a weighted random roll (`Math.random()` against the item's `roleLockWeights`) computed exactly once, inside `useRunStore.resolve()`/`chooseBoss()` as part of building `droppedItems`, and store the resolved item (with `roleLockWeights` stripped) in run state for the rest of that boss-clear's lifetime.**

`LootItemData` gains an optional `roleLockWeights?: Partial<Record<Role, number>>`. In `gameData.ts`, items derived from a tied phase carry this field (and a placeholder `roleLock` matching the doc's worked-example outcome, by convention only — never read for these items). All other items omit it and `roleLock` is authoritative as today.

`signatureLoot.ts`'s `selectDroppedItems(boss, outcome, phaseResults)` is the single resolution point: for each item it returns, if `roleLockWeights` is present, it rolls a weighted random `Role` and returns `{ ...item, roleLock: rolled, roleLockWeights: undefined }`; otherwise it returns the item as-is. `useRunStore` calls this once per boss attempt and stores the result as `droppedItems`. `SpoilsScreen` and everything downstream (`useLootStore.bestow`, `LootCard`, satchel) only ever see plain `LootItemData` with a concrete `roleLock` — identical shape to today.

---

## Considered Alternatives

### Option A — Runtime weighted roll, resolved once at resolve-time *(chosen)*

Roll happens during gameplay, at the moment `droppedItems` is computed (`resolve()`/`chooseBoss()`), and the result is stored in run state for the remainder of that boss-clear.

**Pros**
- Matches the "only randomness in the loot system" framing literally — real run-to-run variance.
- Single resolution point; downstream code is completely unaware tied items ever existed.
- Computed alongside `outcome`/`phaseResults`, which are already computed at the same point in `useRunStore` — no new lifecycle hook needed.

**Cons**
- `LootItemData` gains a field (`roleLockWeights`) that is meaningless outside `gameData.ts`/`signatureLoot.ts` — must be documented and stripped reliably.
- Requires discipline: any future code path that produces `droppedItems`-like data (if one is ever added) must also call `selectDroppedItems`, not read `signatureItems` raw.

---

### Option B — Authoring-time fixed roll

`gameData.ts` hardcodes `roleLock` directly to the doc's worked-example result (e.g. `Role.TANK` for Moloch P2); no `roleLockWeights` field, no runtime computation beyond the existing array-vs-single change.

**Pros**
- Zero new fields, zero new computation — smallest possible diff.
- No risk of render-time re-roll/flicker because there is nothing to roll.

**Cons**
- No run-to-run variance: the same boss always drops the same role-locked item for its tied phase(s), forever.
- Contradicts `docs/feature/loot_signature_items_v2/game_design.md`'s explicit "the only randomness in the loot system" framing — the doc's exception clause would describe a mechanic that doesn't exist.

**Why rejected**: The user confirmed the design intent is real per-run variance (Option A), not a one-time design-time coin flip presented as if it were a runtime mechanic.

---

## Thinking Process

The initial instinct, reading `docs/feature/loot_signature_items_v2/game_design.md` in isolation, leaned toward Option B — "authored weighting" sounds like a design-time artifact, and the doc's worked examples (`-> Tank`, `-> Heal-lean`) read like concrete, final answers. But the doc's own framing — calling this "the only randomness in the loot system" and treating it as a *named exception* to a *runtime* determinism rule ("no randomization within a boss's drop") — only makes sense if there's something to roll during play. Presenting both readings to the user surfaced that the intended mechanic is Option A: real per-run variance on which role a tied item locks to.

Once Option A was chosen, the remaining design question was purely mechanical: where does the roll happen so it doesn't flicker? Since `useRunStore.resolve()`/`chooseBoss()` already compute `outcome` and `phaseResults` once per attempt and store them as state, extending that same computation to also produce `droppedItems` (with rolls already resolved) was the natural fit — no new store, no new lifecycle concern, and `SpoilsScreen` stays a pure reader exactly as it is today for `boss.signatureItem`.

---

## Consequences

### Positive
- Real per-run variance for tied-phase items, matching design intent.
- `useLootStore`, `LootCard`, satchel/bestow/discard need zero changes — they already operate on plain `LootItemData` with a concrete `roleLock`.
- Roll timing piggybacks on an existing, well-understood computation point (`resolve()`/`chooseBoss()`), so no new architectural seam is introduced.

### Negative / Trade-offs
- `LootItemData` carries a field (`roleLockWeights`) that is only meaningful for a small subset of items (~7 across 10 bosses) and only between authoring and resolution — a minor "leaky" content field.
- The placeholder `roleLock` value on tied-phase items in `gameData.ts` is dead data (never read at runtime) — must be documented clearly to avoid confusion during content authoring.

### Risks
- If a future code path reads `boss.signatureItems` directly (bypassing `selectDroppedItems`), it would see un-resolved `roleLockWeights` items with a misleading placeholder `roleLock`. Mitigated by `must_not` rules above and by `selectDroppedItems` being the only documented way to turn `signatureItems` into a drop list.

---

## Implementation Constraints

- **DO**: compute `droppedItems` via `selectDroppedItems(boss, outcome, phaseResults)` exactly once, inside `useRunStore.resolve()` and `useRunStore.chooseBoss()`, alongside the existing `outcome`/`phaseResults`/`phasesSucceeded` computation.
- **DO**: have `selectDroppedItems` strip `roleLockWeights` from every item it returns, regardless of whether a roll occurred, so downstream types are uniform.
- **DO NOT**: call `selectDroppedItems` from `SpoilsScreen` render logic, a `useMemo` recomputed per render, or any other path that could run more than once per boss-clear.
- **DO NOT**: add `roleLockWeights`-awareness to `useLootStore`, `LootCard`, or any satchel/bestow/discard code.
- **DO NOT**: vary anything other than `roleLock` (id/name/flavor/skillBonus/liabilityBonus) based on the roll.

---

## Follow-up Actions

- [ ] `frontend-development` — implement `signatureLoot.ts`, extend `lootData.ts`/`bossData.ts`/`useRunStore` per the architecture doc.
- [ ] User (game design) — resolve OQ-1 (Sundered Titan tie weightings) before that boss's `gameData.ts` entry is authored.

---

## Related

- **Architecture doc**: [loot_signature_items_v2](../feature/loot_signature_items_v2/architecture.md)
- **Depends on**: none
- **Required by**: none
