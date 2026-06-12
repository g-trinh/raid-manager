# Component: Attempt

The resolution of the guild vs the boss. Fully automatic — the player has no input during resolution.

## Structure

A boss attempt always resolves across exactly 3 independent phases.

Each phase defines:

- a weight for DPS
- a weight for Tank
- a weight for Heal
- a dominant stat:
  - Skill-heavy
  - Discipline-heavy
- a phase target

## Role Averages

For the relevant stat, compute the average value per role:

```text
dps_avg(stat)  = average(stat of the 4 DPS)
tank_avg(stat) = average(stat of the 2 Tanks)
heal_avg(stat) = average(stat of the 2 Heals)
```

## Phase Score

Each phase evaluates one dominant stat:

- Skill-heavy phases use Skill
- Discipline-heavy phases use Discipline

```text
phase_score =
  (dps_weight  * dps_avg(target_stat) +
   tank_weight * tank_avg(target_stat) +
   heal_weight * heal_avg(target_stat))
  / (dps_weight + tank_weight + heal_weight)
```

## Phase Success Chance

Each phase converts its phase score into a bounded success chance:

```text
success_chance =
  0.05 + 0.90 * min(1, (phase_score / phase_target)^2)
```

This means:

- minimum success chance is 5%
- maximum success chance is 95%
- meeting the phase target gives a 95% success chance

## Phase Resolution

Each phase rolls independently:

- if the roll is below or equal to success_chance, the phase succeeds
- otherwise, the phase fails

## Rules

- No player input during resolution
- There is exactly 1 attempt per run (no retries)
- Each phase resolves automatically from role averages and boss data
- A boss is won if at least 2 of its 3 phases succeed
