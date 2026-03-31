---
ID: C05
Description: Draft screen UI — add Liability column to member cards, rename Heal slot counter
Dependencies: C01
---

## Goal

Update the draft screen UI to reflect the new v2 member data model: display the `liability` stat on each member card alongside the existing `skill` display, and rename the Heal slot counter from "Healers: %d/2" to "Heal: %d/2". This is a pure UI update with no logic changes.

## Feature Context

C01 adds `liability` to `MemberData` and renames `Role.Type.HEALER` to `Role.Type.HEAL`. The draft screen (`draft_screen.gd`, `member_card.gd`) needs to surface these data changes in the UI. The player must be able to see both Skill and Liability before choosing a candidate — this information is essential for making informed decisions against Liability-heavy boss phases.

## Data Models / Changes

No data model changes. This task consumes the `liability` property added in C01.

## UI Changes Required

### member_card.gd

- `setup()` currently sets three labels: `NameLabel`, `RoleLabel`, `SkillLabel`
- Add display of `liability`: a new label showing "Liability: X" (or equivalent display — e.g. "Liab: X")
- The `_role_label()` helper currently returns "Healer" for `Role.Type.HEALER`; after C01 renames the enum, update the match arm to `Role.Type.HEAL` and return "Heal" as the display string

### member_card.tscn

- Add a new Label node to the `HBoxContainer` for the Liability value
- Node should be named `LiabilityLabel` and positioned after `SkillLabel`
- No layout restructuring required beyond adding the label

### draft_screen.gd — slot tracker

- `_update_slot_tracker()` currently sets:
  - `healer_counter.text = "Healers: %d/2"`
- Change to:
  - `healer_counter.text = "Heal: %d/2"`
- The node reference `healer_counter` and its scene node name (`HealerCounter`) can remain unchanged — only the display string changes

### draft_screen.gd — role enum reference

- `_update_slot_tracker()` calls `DraftState.get_role_count(Role.Type.HEALER)` — update to `Role.Type.HEAL` after C01

## Rules & Constraints

- The Liability label must be visible on both interactive (candidate) cards and non-interactive (selected roster) cards — `setup()` is called for both
- Display format should match the existing Skill label style for consistency (e.g. "Skill: 78" / "Liability: 62")
- No changes to draft logic, role cap enforcement, or round flow
- No changes to `draft_state.gd` beyond the enum rename handled in C01
- Boss phase visibility on the draft screen is out of scope for this task (deferred to a future task if needed)

## Agents Involved

- **Game engine developer**: add `LiabilityLabel` node to `member_card.tscn`; update `member_card.gd` to populate the new label in `setup()`; update `_role_label()` match arm for `Role.Type.HEAL`; update `draft_screen.gd` slot tracker string and enum reference
