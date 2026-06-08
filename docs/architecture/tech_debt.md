# Architecture attention points

Running log of watch-points surfaced during architecture work — things that aren't bugs
or blockers today, but could become subtle problems if a future change doesn't account
for them. Each entry: what it is, why it matters, what to watch for.

---

## Single seam for member-stat reads in Resolution

**Surfaced during**: Signature Loot architecture session (`docs/feature/loot/` /
`docs/features/v2/components/loot.md`)

**What it is**: `useRunStore.attemptBoss` is currently the *only* place Resolution reads a
member's `skill`/`liability` — one line builds the roster passed into `projectPhase`. The
Loot system relies on this: it overlays permanent item bonuses onto base stats via
`useLootStore.effectiveRoster()`, and that overlay must be applied at this single seam for
loot to affect combat math at all.

**Why it matters**: if a future change adds a second path where Resolution reads
`member.skill`/`member.liability` directly — bypassing `effectiveRoster()` — loot bonuses
would silently stop applying on that path. The bug would be subtle: numbers would look
"almost right" (base stats, missing the loot boost), easy to miss in playtesting since
nothing crashes or visibly breaks.

**What to watch for**: any new Resolution code that touches `MemberData.skill` or
`MemberData.liability` must go through `useLootStore.getState().effectiveRoster()` (or
`effectiveStat()` for a single member), never read the raw pool values. If Resolution
grows multiple stat-read paths, consider centralizing them behind one helper so the seam
stays singular by construction rather than by discipline.
</content>
