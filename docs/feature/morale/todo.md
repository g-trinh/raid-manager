# Progression, mastery & morale (the wipe loop)

Real-life raiding: a guild wipes on a boss, learns the mechanics pull by pull,
tries get longer, the boss dies — but every wipe frays nerves, sloppy players
get blamed, and people eventually gquit. This feature brings that loop in.

## Design

### Sequential phases, retries

- Phases resolve **in order**; the first failed phase ends the attempt (a wipe
  at that phase). A kill requires all 3 phases passed in one pull.
- After a wipe: **Pull Again** (immediate retry) or **Retreat to Camp** (one
  camp action, then back to the same boss). The boss is locked once engaged —
  boss choice only happens after a kill.
- Outcomes: `FULL_VICTORY` (one-shot kill, all 3 signature items drop),
  `NARROW_VICTORY` (kill after wipes, 2 of 3 items drop), `WIPE` (retry
  available), `DISBAND` (a member quit — run over).

### Mastery (S-curve learning)

- Per member, per phase of the **current boss**, 0–100 internal. Resets when a
  new boss is engaged.
- Each phase has a `mechanicCount` (2–5), derived from its target unless set:
  `clamp(2 + round((phaseTarget − 3) × 3), 2, 5)`.
- Gain per pull that **reaches** the phase (including the one you died to):
  - 0→25 ("Learning the mechanics"): +25 — one pull
  - 25→80 ("Learning the dance"): +55 / mechanicCount — 2 to 5 pulls
  - 80→100 ("Polishing" → "On farm"): +20 — one pull
  - ×1.5 if the member's effective Discipline ≥ 4 (disciplined players do
    their homework).
- Mastery erases **unfamiliarity**, not fumbles:
  `passChance = 1 − (1 − m) × (1 − base)` with `m` = roster average mastery
  fraction and `base` = the existing score/target curve. At m=0 identical to
  today; at m=1 only blunders can wipe the phase.

### Fumbles & wipe attribution

- Per phase, each member rolls a fumble: `(5 − stat) × 6%`, stat = Discipline
  on DISCIPLINE_HEAVY phases, Skill on SKILL_HEAVY (effective, loot included).
  Stat 5 never fumbles. Fumbles are stat-driven forever — mastery does not
  reduce them (farm wipes are always blunders).
- Each fumble has a **5% lethality** roll. A lethal fumble wipes the raid
  right there, attributed by name. No lethal fumble → unfamiliarity roll;
  failure is a "learning wipe", nobody blamed.
- Story split: mastery fixes not knowing the fight, stats fix execution, loot
  fixes stats.

### Morale & grievance (the disband clock)

- Per member: morale 0–10, starts 10. Cumulative fumble count F (whole run —
  resentment persists across bosses).
- On a wipe, everyone loses base morale by wipe depth: phase I −2, II −1,
  III −0 (a close pull keeps hope).
- On a **blunder** wipe, teammates additionally lose grievance from the lethal
  fumbler's F (exponential): F=1→0, 2→1, 3→2, 4→4, ≥5→6. The fumbler is
  exempt. Learning wipes blame nobody.
- Personality: Loner immune to grievance; Altruist takes half (floored);
  Glory Hound loses 1 extra on every wipe (lootless pull).
- Recovery: boss kill +3 all; loot grant +2 (rare) / +1 (common) to the
  recipient; camp Rest +3 morale on top of the stat heal.
- **Morale 0 → the member gquits at the end of the attempt → the guild
  disbands → run over.** No shrink, no recruitment.

### UI

- Outcome screen: wipe/disband heads; unreached phases dimmed ("Not reached");
  failed-phase cause line distinguishes "`X`'s blunder wiped the muster" from
  learning wipes (which keep the stat hint); each phase row shows its mastery
  band label; wipe tally shows phase + pull count; Pull Again / Retreat
  buttons.
- MusterChip: mood dot (sage ≥8, amber 4–7, blood ≤3 pulsing) + morale in the
  tooltip.
- Camp mid-boss: Scout hidden (boss locked), button reads "Return to the
  Boss"; Rest copy gains the morale line.
- Chronicle: new `morale` kind — fumbles, grievances, near-breaking warnings,
  quits.

## Plan

- [x] 1. `bossPhaseData`: `mechanicCount` (explicit or derived)
- [x] 2. `logic/mastery.ts`: banded gain, band labels (+ unit tests)
- [x] 3. `useMasteryStore`: per-member-per-phase, recordPull, resetBoss (+ tests)
- [x] 4. `useMoraleStore`: morale/fumbles, grievance table, applyWipe/applyKill, quit detection (+ tests)
- [x] 5. `useRunStore`: sequential resolution, fumble/lethality rolls, attribution, retry(), pullsThisBoss, WIPE/DISBAND outcomes (+ tests reworked)
- [x] 6. `signatureLoot`: FULL → 3 items, NARROW → 2, WIPE/DISBAND → none
- [x] 7. Loot bestow + camp Rest restore morale
- [x] 8. Screens: OutcomeScreen (wipe/disband/mastery/causes/buttons), App flow (retry/retreat), CampScreen (scout gate, label), MusterChip mood dot, ChronicleDrawer hue
- [x] 9. CSS: mood dot, unreached rows, mastery band, wipe buttons
- [x] 10. e2e: wipe→retry mastery progression, retreat camp gating; fix specs broken by sequential resolution
- [x] 11. vitest + typecheck + lint + playwright green; docs updated

## Review

- The wipe loop is in: phases resolve sequentially, a failed phase ends the
  pull, and the defeat screen offers Pull Again / Retreat to Camp. The boss is
  locked until killed; boss choice only follows a kill. One-shot kills drop
  all 3 signature items, ground-out kills lose one random item.
- Learning runs on two dials. Mastery (per member, per phase, S-curve banded
  by `mechanicCount`) erases unfamiliarity in the pass formula; fumbles stay
  stat-driven forever with a 5% lethality roll. Wipe attribution falls out of
  the math: early wipes are learning wipes, farm wipes are always somebody's
  named blunder.
- The disband clock is per-member morale (0–10): base wipe loss by depth
  (−2/−1/−0), exponential grievance off the lethal fumbler's cumulative F
  (0/0/1/2/4, cap 6), personalities modulating (Loner immune, Altruist half,
  Glory Hound −1 extra per wipe). Morale 0 → gquit → disband → run over.
  Recovery levers: kill +3 all, loot +2/+1 to the recipient, camp Rest +3.
- UI: mood dots on every MusterChip (pulsing at ≤3), mastery band labels on
  outcome phase rows, "Not reached" rows, pull counters, blunder-vs-learning
  cause lines, a `morale` chronicle kind, and mid-progression camps without
  Scout ("Return to the Boss").
- Verified: 69 vitest specs (was 36), 14 Playwright e2e specs (was 11),
  typecheck + lint clean. Tuning dials live as named constants
  (FUMBLE_LETHALITY, grievance table, band widths, WIPE_BASE_LOSS).
- Docs updated: attempt.md, outcome.md, run.md, camp.md, loot.md,
  personalities.md.
