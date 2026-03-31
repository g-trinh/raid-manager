---
ID: C03
Description: Phase-based attempt resolution, three-state outcome screen, and run flow wiring
Dependencies: C01, C02, C04
---

## Goal

Replace the v1 guild-power formula with the v2 three-phase probabilistic resolution system. Update the outcome screen to display one of three states (Full Victory, Narrow Victory, Defeat) along with a per-phase result summary. Wire the complete run flow: Draft → Attempt → Outcome → Play Again.

## Feature Context

Once the player confirms their team, the attempt resolves automatically with no player input. Each of the boss's three phases is evaluated independently using role averages and the phase's own weights, type, and target. A random roll per phase determines success. The final outcome depends on how many phases succeed out of three.

The run flow topology is unchanged from v1 (Draft → Outcome → Play Again returns to Draft), but the data flowing through it is entirely different.

## Resolution Formula

### Step 1 — Role Averages

For the dominant stat of the phase (`skill` for SKILL_HEAVY, `liability` for LIABILITY_HEAVY):

```
dps_avg  = average(target_stat) across the 4 drafted DPS members
tank_avg = average(target_stat) across the 2 drafted Tank members
heal_avg = average(target_stat) across the 2 drafted Heal members
```

### Step 2 — Phase Score

```
phase_score =
  (dps_weight  * dps_avg  +
   tank_weight * tank_avg +
   heal_weight * heal_avg)
  / (dps_weight + tank_weight + heal_weight)
```

### Step 3 — Success Chance

```
success_chance = 0.05 + 0.90 * min(1.0, (phase_score / phase_target)^2)
```

- Minimum success chance: 5% (floor, always)
- Maximum success chance: 95% (cap, always)
- A phase_score exactly equal to phase_target produces success_chance ≈ 0.95

### Step 4 — Phase Roll

For each phase independently:
- Roll a random float uniformly in [0.0, 1.0]
- If roll <= success_chance → phase succeeds; otherwise → phase fails

### Step 5 — Outcome

Count the number of successful phases:

| Successes | Outcome State |
|---|---|
| 3 | Full Victory |
| 2 | Narrow Victory |
| 0 or 1 | Defeat |

## RunState Changes

The following state must be available after `resolve()` completes:

| Property | Type | Description |
|---|---|---|
| `phase_results` | Array[bool] | Per-phase success/failure, index 0-2 |
| `phases_succeeded` | int | Count of true entries in phase_results (0-3) |
| `outcome` | enum | FULL_VICTORY / NARROW_VICTORY / DEFEAT |
| `is_resolved` | bool | True after resolve() completes (existing, keep) |

Remove from RunState: `guild_power: int`, `boss_difficulty: int`, `won: bool`.

The `attempt_resolved` signal should carry the outcome enum value rather than a bool:
```
signal attempt_resolved(outcome)
```

`reset()` must clear `phase_results`, `phases_succeeded`, `outcome`, and `is_resolved`, then call `DraftState.reset()`.

`get_boss_name()` remains unchanged.

## Outcome Screen

### What the Player Sees

- Outcome state headline: "Full Victory", "Narrow Victory", or "Defeat"
- Phase result summary: "X / 3 phases succeeded" (e.g. "2 / 3 phases succeeded")
- Boss name (existing behaviour, keep)
- "Play Again" button (existing behaviour, keep)

### Removed from Outcome Screen

- Guild Power value display
- Boss Difficulty value display

### Node References to Update

The outcome screen currently reads `RunState.won`, `RunState.guild_power`, and `RunState.boss_difficulty`. All three must be replaced with reads from `RunState.outcome` and `RunState.phases_succeeded`.

The `title_label`, `guild_power_label`, and `boss_difficulty_label` nodes should be renamed or repurposed:
- `title_label` → displays outcome headline
- Repurpose or replace the score labels to display phases summary

## Run Flow

```
Draft (C02 + C04) → [Proceed pressed] → RunState.resolve() → outcome_screen.tscn → [Play Again] → RunState.reset() → draft_screen.tscn
```

- No player input during resolution
- Exactly 1 attempt per run — no retries
- No state persists between runs

## Rules & Constraints

- Resolution is fully automatic — no animation or delay required for MVP
- All three phases always resolve; there is no early exit on phase failure
- Random rolls must use GDScript's built-in `randf()` (no seeding required for MVP)
- The outcome enum should be defined in `run_state.gd` (as an inner class or at the top of the file) to avoid a separate file for a three-value enum
- Both Full Victory and Narrow Victory use the same screen layout; the headline text distinguishes them
- `draft_screen.gd` already calls `RunState.resolve()` before changing scene — this call site is unchanged

## Agents Involved

- **Architect**: confirm the outcome enum placement; verify the updated `attempt_resolved` signal signature does not break any existing connections in the scene tree
- **Game engine developer**: update `outcome_screen.gd` to read `RunState.outcome` and `RunState.phases_succeeded`; update or replace the score label nodes; ensure scene node names match the updated script references
- **Game logic developer**: rewrite `RunState.resolve()` with the v2 phase formula; add `phase_results`, `phases_succeeded`, and `outcome` properties; update `reset()`; define the outcome enum
