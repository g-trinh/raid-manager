# Architecture attention points

Running log of watch-points surfaced during architecture work — things that aren't bugs
or blockers today, but could become subtle problems if a future change doesn't account
for them. Each entry: what it is, why it matters, what to watch for.

---

## Single seam for member-stat reads in Resolution

**Surfaced during**: Signature Loot architecture session (`docs/feature/loot/` /
`docs/features/v2/components/loot.md`)

**What it is**: `useRunStore.attemptBoss` is currently the *only* place Resolution reads a
member's `skill`/`discipline` — one line builds the roster passed into `projectPhase`. The
Loot system relies on this: it overlays permanent item bonuses onto base stats via
`useLootStore.effectiveRoster()`, and that overlay must be applied at this single seam for
loot to affect combat math at all.

**Why it matters**: if a future change adds a second path where Resolution reads
`member.skill`/`member.discipline` directly — bypassing `effectiveRoster()` — loot bonuses
would silently stop applying on that path. The bug would be subtle: numbers would look
"almost right" (base stats, missing the loot boost), easy to miss in playtesting since
nothing crashes or visibly breaks.

**What to watch for**: any new Resolution code that touches `MemberData.skill` or
`MemberData.discipline` must go through `useLootStore.getState().effectiveRoster()` (or
`effectiveStat()` for a single member), never read the raw pool values. If Resolution
grows multiple stat-read paths, consider centralizing them behind one helper so the seam
stays singular by construction rather than by discipline.

---

## Signature loot's tied-phase roll must happen once, not on render

**Surfaced during**: Multi-Item Signature Loot architecture session
(`docs/feature/loot_signature_items_v2/architecture.md`, ADR-001).

**What it is**: Some signature items (`LootItemData.roleLockWeights` present) have their
`roleLock` resolved via a weighted random roll inside `signatureLoot.ts`'s
`selectDroppedItems(boss, outcome, phaseResults)`. This is called exactly once, inside
`useRunStore.resolve()`/`chooseBoss()`, and the result is stored as `droppedItems` in run
state — `SpoilsScreen` only ever reads that stored value.

**Why it matters**: if a future change calls `selectDroppedItems` from a render path
(component body, or a `useMemo` that recomputes on every render/remount), a tied-phase
item's `roleLock` would re-roll and could visibly change between renders of the same
boss-clear — confusing for the player and balance-relevant (it determines which role can
equip the item).

**What to watch for**: any new code path that needs the boss's drop list must read
`useRunStore`'s `droppedItems`, never call `selectDroppedItems` directly outside
`resolve()`/`chooseBoss()`.

---

## Dormant pause-point machine: hook positions and RNG re-roll slot are a contract

**Surfaced during**: Boss Mechanics architecture session
(`docs/feature/boss-mechanics/architecture.md`, ADR-004).

**What it is**: `pullResolver.resolvePull` is a generator that `yield`s a
`PausePoint` at three frozen positions — `pre-verdict`, `on-death`,
`on-budget-fail`. boss-mechanics ships it **dormant**: `useRunStore`'s driver
loop auto-resumes every yield with `{action:'continue'}`, so behaviour is atomic
and the reveal is unchanged. The three resume actions (`wipe`/`override`/`reroll`)
are implemented in the generator but no trigger dispatches them yet.

**Why it matters**: heroism, battle-res, and call-the-wipe each plug a trigger +
continuation into this machine *without re-touching the resolver*. If a future
change moves a hook, collapses the generator back to a plain function, or moves
resolver locals into store state, all three features break at once. Also: the
`reroll` action consumes an extra block of `draws(phase)` Math.random draws
appended after the phase's draws (ADR-004 §RNG) — the scripted-roll unit helpers
and seeded e2e specs encode this exact position; shifting it silently breaks
heroism's tests.

**What to watch for**: keep `resolvePull` a generator with the three yields at
their ADR-004 positions; keep the store's trigger registry the only place new
triggers register; never put resolver locals (phase/mechanic cursors, running
tally, partial `PhaseResult`) into store state; preserve the RNG draw-order
contract (ADR-003 §6) including the re-roll slot.

---

## New per-mechanic stat-read site must use the effective roster

**Surfaced during**: Boss Mechanics architecture session (ADR-003).

**What it is**: the per-mechanic check reads `member[tested]` for each targeted
member — a *new* stat-read site beyond the old single `projectPhase` call. The
single-seam rule (above) requires loot bonuses to flow through
`useLootStore.effectiveRoster()`.

**Why it matters**: if the resolver reads raw `member.skill/discipline` instead
of the store-supplied effective roster, loot bonuses silently stop affecting the
per-mechanic check — the subtle "almost right" bug the original seam entry warns
about, now with two read sites instead of one.

**What to watch for**: `useRunStore` builds the roster via `effectiveRoster()`
and passes it into `resolvePull`; the resolver must never read raw pool stats. If
projection and the per-mechanic check ever diverge on which roster they read,
that is the bug.
</content>
