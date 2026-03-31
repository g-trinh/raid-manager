---
ID: C01
Description: Update hardcoded game data — add Liability stat, rescale Skill, rename HEAL, replace boss difficulty with 3 phases
Dependencies: none
---

## Goal

Update the foundational game data layer to match the v2 data model: add `liability` to `MemberData`, rescale `skill` to 0-100, rename `Role.Type.HEALER` to `Role.Type.HEAL`, replace `BossData.difficulty` with a three-phase structure, and provide concrete hardcoded values for all members and the boss. No UI work is part of this task.

## Feature Context

The v1 data model (flat Skill 3-10, flat boss difficulty 35) is incompatible with the v2 resolution formula, which requires role-averages of both Skill and Liability on a 0-100 scale and per-phase boss data. All downstream systems — draft, resolution, outcome screen — depend on this foundation being correct before they can be updated.

## Data Models / Changes

### role.gd

- Rename `HEALER = 1` to `HEAL = 1`
- Sweep every file in the project that references `Role.Type.HEALER` and update to `Role.Type.HEAL`
- Affected files include: `game_data.gd`, `draft_state.gd` (ROLE_CAPS dictionary key), `draft_screen.gd`, `member_card.gd`, any test files

### member_data.gd

- Add `liability: int` as a new exported property (0-100 scale)
- Update the `create()` factory to accept `p_liability: int` as a fourth argument
- `skill` remains an int; its range is now 0-100 (the factory signature changes but the property type does not)

### boss_phase_data.gd (new file — `game/scripts/data/boss_phase_data.gd`)

New resource class with the following properties:

| Property | Type | Range | Description |
|---|---|---|---|
| `dps_weight` | int | 0-5 | Weight of the DPS role for this phase |
| `tank_weight` | int | 0-5 | Weight of the Tank role for this phase |
| `heal_weight` | int | 0-5 | Weight of the Heal role for this phase |
| `phase_type` | enum | SKILL_HEAVY / LIABILITY_HEAVY | Which member stat this phase evaluates |
| `phase_target` | int | 0-100 | The target value the phase score is measured against |

Include a `create()` factory method with all five properties as arguments.

### boss_data.gd

- Remove the `difficulty: int` property entirely
- Add `phases: Array[BossPhaseData]` (always length 3)
- Update `create()` factory to accept `p_phases: Array[BossPhaseData]`

### game_data.gd — member pool

Retain all existing member names. Rescale Skill from the 3-10 range to 0-100. Add Liability values. Pool composition is unchanged: 3 Tanks, 3 Heals, 5 DPS.

Suggested values (implementer may adjust within 0-100, but must preserve relative ordering between members):

| Name | Role | Skill | Liability |
|---|---|---|---|
| Gorvak | TANK | 38 | 62 |
| Shieldara | TANK | 81 | 19 |
| Bruthan | TANK | 55 | 45 |
| Lumina | HEAL | 12 | 88 |
| Patchwick | HEAL | 48 | 52 |
| Serenova | HEAL | 91 | 9 |
| Razorfang | DPS | 80 | 20 |
| Blitzclaw | DPS | 60 | 40 |
| Vexara | DPS | 95 | 5 |
| Skarn | DPS | 28 | 72 |
| Duskblade | DPS | 15 | 85 |

### game_data.gd — boss

"Moloch the Unbound" with exactly 3 phases. Phase design intent:

| Phase | dps_weight | tank_weight | heal_weight | phase_type | phase_target |
|---|---|---|---|---|---|
| 1 — DPS brawl | 3 | 1 | 1 | SKILL_HEAVY | 65 |
| 2 — Mechanic gauntlet | 1 | 3 | 3 | LIABILITY_HEAVY | 70 |
| 3 — All-role finale | 2 | 2 | 2 | SKILL_HEAVY | 60 |

## Rules & Constraints

- All member names must remain unique across the pool
- `skill` and `liability` must both be integers in the 0-100 range
- Each boss phase must have at least one weight > 0; all weights must be in the 0-5 range
- Exactly 3 phases per boss — no more, no less
- No data is generated or randomised at runtime; all values are hardcoded literals
- The `ROLE_CAPS` dictionary in `draft_state.gd` is keyed on `Role.Type`; updating the enum requires updating that dictionary key

## Agents Involved

- **Architect**: confirm the `BossPhaseData` class placement and that the autoload dependency order remains valid after the new file is added
- **Game logic developer**: implement all changes across `role.gd`, `member_data.gd`, `boss_data.gd`; create `boss_phase_data.gd`; update `game_data.gd` with new pool and boss; sweep all references to `HEALER` and rename to `HEAL`
