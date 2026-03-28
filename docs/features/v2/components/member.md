# Component: Member

A single raid member. All members are hardcoded — none are generated at runtime.

## Properties

| Property | Type   | Description                        |
|----------|--------|------------------------------------|
| Name     | string | Unique display name                |
| Role     | enum   | Tank / Healer / DPS                |
| Skill    | int    | Combat contribution value          |

## Pool

The full member pool is a hardcoded list. The draft draws from this list and filters by role cap.

## Notes

- Skill is the only stat in the MVP
- Every member in the pool must have a unique name
