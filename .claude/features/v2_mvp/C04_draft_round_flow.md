---
ID: C04
Description: Draft round-based flow — present 3 candidates per round, player picks 1
Dependencies: C02
---

## Goal

Update the draft phase to implement the round-based flow defined in `docs/features/v2/components/draft.md`. Instead of showing all available members at once, each round presents exactly 3 randomly drawn candidates. The player picks 1, which triggers the next round. This repeats until the roster is full (8/8).

## Feature Context

The draft spec was updated to formalize the round structure. The current implementation (`draft_screen.gd` + `DraftState`) already enforces role caps and tracks selected members — it just exposes the full available pool rather than a limited draw per round. This task closes that gap.

## Round Flow

1. Draft begins with an empty 8-slot roster
2. A round starts: 3 candidates are drawn **randomly** from the hardcoded pool
   - Members whose role has reached its cap are excluded
   - Members already on the roster are excluded
3. The player picks 1 of the 3 candidates — they are added to the roster
4. If the roster is full (8/8), the draft ends and the run proceeds to the boss attempt
5. Otherwise, a new round begins (back to step 2)

## What the Player Sees per Round

- Exactly 3 member cards (name, role, skill value)
- Their current roster composition and slot counts (unchanged)
- "Proceed" button enabled only when 8/8

## Rules & Constraints

- Candidates are drawn **randomly** each round — same member will not appear twice across rounds once selected
- If fewer than 3 eligible members remain (near end of draft, role caps nearly full), show however many are available (could be 1 or 2)
- The player cannot skip a round or see the full pool
- Selecting a member immediately replaces the 3-card display with the next round's draw

## Affected Files

- `game/scripts/autoloads/draft_state.gd` — add `current_candidates` state and `draw_candidates()` method
- `game/scenes/draft/draft_screen.gd` — read from `current_candidates` instead of `get_available_members()`
- `game/tests/test_draft_state.gd` — add unit tests for `draw_candidates()`

## Agents Involved

- **Game logic developer**: add `current_candidates` + `draw_candidates()` to `DraftState`; emit a signal after each draw so UI reacts; add unit tests
- **Game engine developer**: update `draft_screen.gd` to display `current_candidates` (3 cards) and wire to the new signal; no scene layout changes expected
