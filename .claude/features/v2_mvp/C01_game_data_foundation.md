---
ID: C01
Description: Hardcoded game data — member pool and boss definition
Dependencies: none
---

## Goal

Establish the foundational game data that all other chunks depend on: a hardcoded member pool and a hardcoded boss. No UI is involved in this chunk.

## Feature Context

The MVP game loop draws from a fixed set of raid members and pits the player against a fixed boss. All data must be hardcoded — nothing is generated at runtime.

## Data Models

### Member

| Property | Type   | Description                        |
|----------|--------|------------------------------------|
| Name     | string | Unique display name                |
| Role     | enum   | Tank / Healer / DPS                |
| Skill    | int    | Combat contribution value          |

### Boss

| Property   | Type   | Description                                          |
|------------|--------|------------------------------------------------------|
| Name       | string | Display name                                         |
| Difficulty | int    | Threshold the guild's total Skill must exceed to win |

## Rules & Constraints

- All members must have unique names
- Skill is the only stat in the MVP
- The member pool must contain enough members of each role to fill the draft caps:
  - Tank: 2 slots → pool must offer more than 2 tanks (so the player has choices)
  - Healer: 2 slots → pool must offer more than 2 healers
  - DPS: 4 slots → pool must offer more than 4 DPS
- There is exactly 1 boss for the MVP
- No data is generated or randomised at runtime

## Agents Involved

- **Architect**: design the data structures and how the pool is exposed to other systems
- **Game logic developer**: implement the hardcoded member pool and boss in GDScript
