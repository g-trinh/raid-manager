## Tech Breakdown: Boss Mechanics

**Architecture ref:** [architecture.md](./architecture.md) (ADR-002…ADR-006)
**Spec ref:** [todo.md](./todo.md)
**Teams:** Frontend only (renderer — `app/src/renderer/src`). No Go backend.
**Granularity:** ~half-day tasks, one PR each.

> Maps the spec's 9-item Plan onto sequenced tickets. Test work is folded into
> each implementation ticket (the project writes tests with the code,
> `frontend-testing`); BM-09 covers the *cross-cutting* RNG-schedule rewrite and
> e2e because it spans every prior ticket's specs.

---

### Tasks

---

#### BM-01 — Add `mechanic.ts` data model and replace `mechanicCount` with `mechanics[]`

**Type:** Chore (data model) · **Owner:** Frontend · **Dependencies:** — · **ADR:** ADR-002
**Spec plan item:** 1

**Description:** Create `domain/data/mechanic.ts` (`MechanicType`, `BossMechanicData`,
`createMechanic` with per-type defaults). Change `BossPhaseData` to carry
`mechanics: BossMechanicData[]`; delete `mechanicCount` and `deriveMechanicCount`;
update `createPhase`'s signature to take `mechanics`. This will break `gameData.ts`
and `useMasteryStore.recordPull`'s call site — leave a minimal compiling stub on
those (real authoring in BM-02, real rekey in BM-05) **or** sequence BM-02/BM-05
immediately after; prefer the latter to avoid a broken intermediate.

**Acceptance Criteria:**
- `phase.mechanics.length` returns the count; `mechanicCount`/`deriveMechanicCount` no longer exist anywhere.
- `createMechanic(TANKBUSTER, 'X')` yields `{type:TANKBUSTER, name:'X', tested:'skill', targets:'TANKS', severity:3}`; overrides win. Unit test covers each type's defaults + an override.
- `tsc` passes for `mechanic.ts`, `bossPhaseData.ts`, `bossData.ts`.

---

#### BM-02 — Author mechanics for all 10 bosses

**Type:** Chore (content) · **Owner:** Frontend · **Dependencies:** BM-01 · **ADR:** ADR-002
**Spec plan item:** 2

**Description:** Re-author every phase in `gameData.ts` (30 phases) with 2–5 ordered
`createMechanic` lines matching each boss's identity (names, types, targets,
severities). Use the Moloch worked example in ADR-002 as the pattern.

**Acceptance Criteria:**
- All 30 phases compile with `mechanics: [...]`; each phase has 2–5 mechanics.
- A snapshot/sanity test asserts every boss has 3 phases and every phase 2–5 mechanics with non-empty names.
- No `mechanicCount` references remain in `gameData.ts`.

---

#### BM-03 — Extract pure `pullResolver.ts` reproducing today's resolution (no mechanics yet)

**Type:** Chore (refactor) · **Owner:** Frontend · **Dependencies:** — · **ADR:** ADR-003
**Spec plan item:** 3 (prep)

**Description:** Move `pullPhase`/`attemptBoss` logic out of `useRunStore` into a new
pure `domain/logic/pullResolver.ts` with signature
`resolvePull(roster, boss, masterySnapshot, dials, rng)` returning `AttemptResult`
(today's fields). Store keeps driving + applying side effects (morale/chronicle/
mastery). **Behaviour-preserving**: existing `useRunStore.test.ts` still passes
unchanged. This is the seam that lets BM-04/06/07 land cleanly.

**Acceptance Criteria:**
- `useRunStore` no longer contains the per-phase roll math; it calls `resolvePull`.
- Resolver is pure (rng injected; no store imports inside the resolution path; store applies returned side-effect intents).
- All existing `useRunStore.test.ts` cases pass with no changes to assertions (RNG schedule still the old one in this ticket).

---

#### BM-05 — Rekey mastery to (member, phase, mechanic) with phase aggregate

**Type:** Feature · **Owner:** Frontend · **Dependencies:** BM-01 · **ADR:** ADR-005
**Spec plan item:** 5

**Description:** Rework `useMasteryStore` to `Record<string, number[][]>`; add
`mechanicMastery` (0..1), `phaseMastery`/`rosterPhaseMastery` (0..100). Replace
`mastery.ts`'s `masteryGain` band internals with the step rule (+1 step on reach,
+2 if Discipline≥4); keep `masteryBand`/`MASTERY_MAX`. `recordPull(reached, roster,
factor?)`. Update read-site callers (`projectPhase` feed via store,
OutcomeScreen, war-table bars) to use `rosterPhaseMastery`.

**Acceptance Criteria:**
- `mechanicMastery(m, p, k)` returns 0/0.5/1; advancing a fast learner (Disc≥4) twice from 0 reaches 100.
- `phaseMastery` equals the average of its mechanics' steps; a 2-mechanic phase reaches full in fewer pulls than a 5-mechanic phase (unit test).
- `resetBoss`/`reset` clear all mastery. Existing phase-level read interfaces (0–100 number) unchanged for UI.

---

#### BM-04 — Rewrite resolution to mechanic-by-mechanic with damage budget

**Type:** Feature · **Owner:** Frontend · **Dependencies:** BM-02, BM-03, BM-05 · **ADR:** ADR-003
**Spec plan item:** 3

**Description:** Replace the resolver's per-phase pass roll with the ADR-003
algorithm: per mechanic, one check per targeted member
(`failChance = U0*(1-mechanicMastery) + (5-stat)*PIP`); failed check adds
`severity` to the phase tally + records a fumble intent (F + chronicle naming the
mechanic); severity-3 failure kills the failer → blunder wipe; tally>budget →
learning wipe; all-under-budget → hold. Add named dials (`U0`, `SEVERITY_DAMAGE`,
`phaseBudget`). Extend `PhaseResult` (`damageTally`, `budget`, `killerMechanic?`,
`failedChecks`; `fumblers` derived). Implement the §6 RNG draw order exactly.

**Acceptance Criteria:**
- A phase with no failed checks holds; a phase whose failed-check severities exceed `phaseBudget(target)` is a learning wipe; a failed severity-3 check produces a blunder wipe attributed to the failer.
- `applyWipe(wipePhaseIndex, blunderer, roster)` / `applyKill` call sites unchanged; morale/disband behaviour identical in shape to today.
- Draws consumed per phase == `Σ |targetedMembers(m)|` (asserted by a scripted-roll unit test).
- Stat reads go through the store-supplied effective roster only (no raw `member.skill` in the resolver).

---

#### BM-06 — Add the pause-point generator (dormant) and store driver loop

**Type:** Feature (substrate) · **Owner:** Frontend · **Dependencies:** BM-04 · **ADR:** ADR-004
**Spec plan item:** 4

**Description:** Convert `resolvePull` to a generator yielding `PausePoint` at
`pre-verdict` / `on-death` / `on-budget-fail`, handling all four `Resolution`
actions (`continue`/`wipe`/`override`/`reroll`) including the re-roll RNG slot.
Add the store driver loop with an **empty trigger registry** (auto-`continue`
every yield) and a `pendingIntervention: null` state field (suspended generator
held in a store-private ref).

**Acceptance Criteria:**
- With no trigger registered, resolution runs to completion in one `pull()` call; `pendingIntervention` is always `null`; BM-04's behaviour is byte-for-byte unchanged.
- Feeding the generator each `Resolution` action directly (unit test, no store): `override` cancels a death and continues the phase keeping the fumble's F; `reroll` re-rolls the phase verdict once consuming `draws(phase)` extra draws; `wipe('called')` ends the pull with cause `called`.
- No trigger, charge, or continuation function (`burnHeroism`/`battleRes`/`callWipe`/`acceptFate`) and no pause UI ship in this ticket.

---

#### BM-07 — Emit `PullEvent` log and store `pullLogs` (reset per boss)

**Type:** Feature · **Owner:** Frontend · **Dependencies:** BM-04 (events sit on emission points) · **ADR:** ADR-006
**Spec plan item:** 6

**Description:** Build a `PullEvent[]` inline in the resolver at the seven emission
points (ADR-006), seq-numbered in resolution order; return as
`AttemptResult.pullLog`. Add `pullLogs: PullEvent[][]` to `useRunStore`; append
per pull in `performPull`; clear in `chooseBoss`/`reset`.

**Acceptance Criteria:**
- A kill emits 3× `phase-start`, the passed/failed checks, 3× `phase-hold`, one `kill`; a blunder wipe emits a `death` then `wipe` with the killer mechanic name.
- `pullLogs` accumulates one inner array per pull of the current boss and resets to `[]` on `chooseBoss`/`reset`.
- `pullLogs` is never mutated from a render path (resolver→AttemptResult→store only).

---

#### BM-08 — Surface mechanics + killer attribution in the UI

**Type:** Feature · **Owner:** Frontend · **Dependencies:** BM-02 (data), BM-04 (killerMechanic) · **ADR:** ADR-002/003
**Spec plan item:** 8

**Description:** War-table boss plaque + scout report (`BossCandidateCard` / its
`PhaseCard`, `bossForecast` if needed) list real mechanics per phase
("Phase II — Molten Chains · The Branding · Ash Adds"). OutcomeScreen
`PhaseResolveRow` names the killer mechanic in its cause line; chronicle already
names every failed check (from BM-04's fumble intents). **No pause UI** (deferred
to agency features).

**Acceptance Criteria:**
- A scouted candidate card and the war-table plaque render each phase's mechanic names in order.
- A broken phase's outcome row names the killer mechanic (blunder: "{name} died to {mechanic}"; budget: the over-budget phase, mechanics not learned).
- No new player verbs / buttons added to OutcomeScreen; `pendingIntervention` is not read by any component.

---

#### BM-07b — Balance harness: Monte-Carlo pulls-per-boss within tolerance

**Type:** Feature (test + tuning) · **Owner:** Frontend/QA · **Dependencies:** BM-04 · **ADR:** ADR-003 §8
**Spec plan item:** 7

**Description:** Add `pullResolver.balance.test.ts` Monte-Carlo'ing pulls-per-boss
for a fresh average roster and a fully-mastered roster across all 10 bosses,
asserting the mean is within tolerance of the target curve (≈2–4 pulls/boss
fresh; execution-only failures at full mastery). Tune `U0`/`SEVERITY_DAMAGE`/
`phaseBudget`/mastery step count until assertions pass; commit the resulting dial
values and record them in ADR-003 OQ-1.

**Acceptance Criteria:**
- The harness runs deterministically in CI (seeded PRNG or fixed N with tolerance bands) and asserts both fresh and full-mastery pulls-per-boss are within tolerance.
- Committed dial values make the harness green; ADR-003 OQ-1 updated with the final numbers.

---

#### BM-09 — Rewrite scripted-roll unit helpers + e2e + docs

**Type:** Chore (tests + docs) · **Owner:** Frontend/QA · **Dependencies:** BM-04, BM-06, BM-07 · **ADR:** ADR-003 §6
**Spec plan item:** 9

**Description:** Rewrite `useRunStore.test.ts`'s `scriptRandom` constants
(`NO_FUMBLES`/`PHASE_PASSES`/…) to the new per-mechanic draw schedule (§6); update
all run/retry/disband/chronicle specs to the mechanic model. Update seeded e2e
journeys. Rewrite `docs/feature/attempt.md` to the mechanic-by-mechanic algorithm
(plan item 9 says this becomes mechanical given the ADRs); add `boss.md` /
`morale/todo.md` cross-refs.

**Acceptance Criteria:**
- All run-store specs pass against the new draw schedule; comments document draws-per-phase = `Σ |targetedMembers|`.
- e2e kill / learning-wipe / blunder-wipe / disband journeys pass with seeded rolls.
- `attempt.md` describes the mechanic check, budget verdict, and RNG order; no references to the deleted pass roll / lethality roll remain.

---

### Dependency Graph

```
BM-01 ─┬─> BM-02 ─┐
       └─> BM-05 ─┤
                  ├─> BM-04 ─┬─> BM-06 ─┐
BM-03 ────────────┘          ├─> BM-07 ─┼─> BM-09
                             ├─> BM-07b │
                             └─> BM-08 ─┘
```

(BM-03 is behaviour-preserving and can start in parallel with BM-01/02/05; BM-04
needs all three of BM-02, BM-03, BM-05.)

### Parallel tracks

- **BM-01** and **BM-03** have no shared dependency — start together.
- After BM-01: **BM-02** (content) and **BM-05** (mastery) run in parallel.
- After BM-04: **BM-06**, **BM-07**, **BM-07b**, **BM-08** are independent of each
  other (all depend only on BM-04) — four parallel tracks.

### Open Questions

| # | Question | Blocking tasks | Owner |
|---|----------|----------------|-------|
| OQ-1 | Final `U0`, severity-damage values, `phaseBudget` formula, mastery step count | BM-07b (resolves it) | Frontend/balance |
| OQ-2 | Are any MechanicType behaviours non-cosmetic in v1? (assumed no) | BM-02, BM-04 | Game design |
| OQ-3 | Exact pull-intent Safety mapping (lethality halved / pass malus) onto new dials | none here (pull-intent's own ticket) | Frontend |
