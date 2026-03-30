# Component: Draft

The phase where the player assembles their team before the boss attempt.

## Role Caps

| Role   | Slots |
|--------|-------|
| Tank   | 2     |
| Healer | 2     |
| DPS    | 4     |
| Total  | 8     |

## Flow

1. The draft begins with an empty 8-slot roster
2. A round starts: 3 candidates are drawn from the hardcoded pool
   - Members whose role has reached its cap are excluded
   - Members already on the roster are excluded
3. The player picks 1 of the 3 candidates — they are added to the roster
4. If the roster is full (8/8), the draft ends and the run proceeds to the boss attempt
5. Otherwise, a new round begins (back to step 2)

## Rules

- The player is shown members from the hardcoded pool one at a time (or in small groups) and picks until all 8 slots are filled
- If a role has reached its cap, no further members of that role are offered
- All available members are hardcoded — none are generated at runtime

## What the Player Sees per Member

- Name
- Role (Tank / Healer / DPS)
- Skill value
