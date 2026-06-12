# Component: Attempt

The resolution of one pull of the guild vs the boss. Fully automatic — the player has no input during resolution.

## Structure

A boss has exactly 3 phases, resolved **sequentially**. The first failed phase ends the pull (a wipe at that phase); phases past the wipe are never reached. A kill requires all 3 phases passed in one pull.

Each phase defines:

- a weight for DPS
- a weight for Tank
- a weight for Heal
- a dominant stat:
  - Skill-heavy
  - Discipline-heavy
- a phase target
- a mechanic count (2–5, derived from the target unless set) — see [morale/todo.md](morale/todo.md)

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

The score curve gives the base chance; roster mastery of the phase erases the rest of the unfamiliarity:

```text
base_chance  = 0.05 + 0.90 * min(1, (phase_score / phase_target)^2)
pass_chance  = 1 − (1 − roster_mastery_fraction) × (1 − base_chance)
```

At zero mastery this is the base curve; at full mastery the phase can only be lost to a blunder.

## Phase Resolution

In order, per phase:

1. **Fumble rolls** — each member rolls `(5 − tested_stat) × 6%`. Fumbles are stat-driven and never reduced by mastery.
2. **Lethality** — each fumble has a 5% chance to wipe the raid on the spot, attributed to the fumbler by name (a *blunder wipe*).
3. **Unfamiliarity roll** — otherwise the phase passes if the roll ≤ pass_chance; a failure is a *learning wipe*, nobody blamed.

## Rules

- No player input during resolution
- Wipes can be retried (Pull Again, or back to the [war table](camp.md)) — the disband clock in [morale](morale/todo.md) bounds the retries
- A boss is won only when all 3 phases pass in a single pull
- A kill is a kill: the full signature set drops regardless of pull count
  (the real cost of extra pulls is morale and fumble grievance)
