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
</content>
