# New-player friendliness pass — stat rescale + rename + UI declutter

User decisions:
- Keep mechanics, simplify presentation (approach 1)
- Stats rescaled 0–100 → 1–5 (round(x/20), clamp 1..5)
- Item bonuses shrink to +1/+1, personality deltas to ±1
- Rename stat `Liability` → `Discipline` (higher = better now reads naturally)

## Plan

- [x] 1. Domain rename: `liability` → `discipline` (memberData, lootData `liabilityBonus` → `disciplineBonus`, PhaseType.LIABILITY_HEAVY → DISCIPLINE_HEAVY, phaseProjection statKey, useLootStore StatKey)
- [x] 2. Rescale gameData: member stats /20 (clamped 1..5), phase targets /20 (1 decimal), item bonuses 3→1
- [x] 3. useLootStore: clamp [0,5], personality deltas ±10 → ±1
- [x] 4. personality.ts effect copy → Discipline wording
- [x] 5. UI: StatBar → 5-pip display (same language as WeightDots), drop raw numbers
- [x] 6. PhaseCard declutter: drop "tgt N" raw target, rename Liability tag → Discipline
- [x] 7. Other screens: OutcomeScreen ("Discipline check"), LootCard (+1 Skill · +1 Discipline), MemberLedgerChip (S/D), MusterReacts types
- [x] 8. CSS: stat pips, remove phase-card__target, --rm-liability → --rm-discipline
- [x] 9. Docs: docs/feature/{member,attempt,draft,boss,loot,personalities}.md + docs/architecture/tech_debt.md updated to new scale + name
- [x] 10. Verify: typecheck + lint clean; drove full run headless (draft → attempt → spoils)

## Review

- Balance preserved: success formula unchanged; stats and targets both divided by 20 so score/target ratios stay close (small drift from rounding members to whole pips).
- Item +1 / personality ±1 on the 1-5 scale = one full pip (≈ +20 on old scale) — deliberate buff the user accepted; clamp at 5 contains it.
- Fixed 2 pre-existing lint errors while in the files: SpoilsScreen impure pulse token (now ref counter), MemberLedgerChip setState-in-effect (now render-time adjust + timers-only effect).
- Verified headless via playwright-core + chrome against the Vite renderer: no "Liability"/"tgt N" text on draft/outcome/spoils; candidate pips render "Skill 3/5, Discipline 2/5"; loot shows "+1 Skill · +1 Discipline".
- Follow-up candidates (not done): draft pick hints ("fits Phase II"), boss-choice progressive disclosure (collapse 9 phase cards), first-run tooltips.
