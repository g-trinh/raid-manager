# Component: Member

A single raid member. All members are hardcoded — none are generated at runtime.

## Properties

| Property  | Type   | Description                                           |
|-----------|--------|-------------------------------------------------------|
| Name      | string | Unique display name                                   |
| Role      | enum   | Tank / Heal / DPS                                     |
| Skill      | int   | Ability to perform the role correctly, on a 1-5 scale |
| Discipline | int   | Ability to respect boss mechanics correctly, on a 1-5 scale |

## Pool

The full member pool is a hardcoded list. The draft draws from this list and filters by role cap.

## Notes

- Skill and Discipline are the only encounter stats in the MVP
- Both stats are used only through role averages during boss resolution
- Every member in the pool must have a unique name
