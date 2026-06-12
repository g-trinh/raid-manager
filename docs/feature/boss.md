# Component: Boss

The enemy the guild faces. All bosses are hardcoded — none are generated at runtime.

## Properties

| Property | Type   | Description                    |
|----------|--------|--------------------------------|
| Name     | string | Display name                   |
| Phases   | list   | Exactly 3 ordered boss phases  |

## Phase Properties

| Property     | Type | Description |
|--------------|------|-------------|
| DPS Weight   | int  | Importance of the DPS role in the phase, from 0 to 5 |
| Tank Weight  | int  | Importance of the Tank role in the phase, from 0 to 5 |
| Heal Weight  | int  | Importance of the Heal role in the phase, from 0 to 5 |
| Phase Type   | enum | Skill-heavy or Discipline-heavy |
| Phase Target | number | Target value for the phase, on the 1-5 stat scale (e.g. 3.5) |

## Visibility

All 3 phases of a boss are fully visible before the attempt.

For each phase, the player can see:

- DPS Weight
- Tank Weight
- Heal Weight
- Phase Type
- Phase Target

## Notes

- For the MVP there is 1 active boss per run
- The boss is selected (or fixed) before the attempt — not chosen by the player in MVP
- Each boss phase tests role averages, not individual members
- At least one role weight must be above 0 in each phase
