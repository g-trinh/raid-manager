---
ID: C02
Description: Draft screen — player picks 8 members from the hardcoded pool
Dependencies: C01
---

## Goal

Build the screen where the player assembles their 8-person team before the boss attempt. The player sees members one at a time (or in small groups) and selects until all role slots are filled.

## Feature Context

The draft is the only moment of player agency in the run. Once all 8 slots are filled, the player proceeds to the attempt. There is no going back or swapping members after selection.

## Role Caps

| Role   | Slots |
|--------|-------|
| Tank   | 2     |
| Healer | 2     |
| DPS    | 4     |
| Total  | 8     |

## What the Player Sees per Member Card

- Name
- Role (Tank / Healer / DPS)
- Skill value

## Rules & Constraints

- Members are presented from the hardcoded pool (C01)
- When a role has reached its cap, no further members of that role are offered
- The draft ends exactly when all 8 slots are filled (no partial teams)
- The player cannot remove or swap a member once selected
- A "Proceed to Attempt" action becomes available only when all 8 slots are filled

## Agents Involved

- **Product designer**: design the draft screen layout (member card presentation, slot tracker, role cap feedback, proceed action)
- **Architect**: design how the draft state is managed and passed to the attempt
- **Game engine developer**: implement the draft screen scene and UI components in GoDot
- **Game logic developer**: implement draft logic (pool filtering by role cap, slot filling, completion check) in GDScript
