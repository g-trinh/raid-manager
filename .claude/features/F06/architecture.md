# F06 -- Tactical Choice (Pre-Attempt): Architecture

## Overview

Before each boss attempt, the player makes **one irreversible tactical choice** from three categories (Composition, Consumables, Strategy). This is the only moment of direct player agency on the attempt itself. The chosen option produces an `AttemptModifier` resource that F07 (Boss Attempt Resolution) consumes.

---

## Confirmed Decisions

| # | Question | Answer | Impact |
|---|---|---|---|
| Q1 | How many choices per category? | 2-3 options per category, exactly 3 categories always shown | Player picks exactly 1 option from exactly 1 category |
| Q2 | Where does choice generation logic live? | `TacticalChoiceSystem` autoload -- pure logic, no scene dependencies | Same pattern as DraftSystem |
| Q3 | How are choices contextual? | Generator receives current roster, boss, and run inventory as inputs; filters and weights options accordingly | Composition options depend on roster roles; consumables depend on inventory; strategy depends on boss difficulty |
| Q4 | What does a choice produce? | An `AttemptModifier` resource with typed stat bonuses/penalties and a category tag | F07 reads this resource to adjust resolution math |
| Q5 | Are choices persisted? | The chosen `AttemptModifier` is stored on run state for the current attempt only; cleared after resolution | No backend persistence needed mid-attempt |
| Q6 | Can the player go back? | No. Once confirmed, the choice is locked. A confirmation step prevents misclicks | Irreversibility is a core design constraint |
| Q7 | How does this integrate with Main.gd flow? | After draft_complete (or after inter-raid for subsequent bosses), Main.gd transitions to TacticalChoiceScreen; on choice confirmed, transitions to attempt resolution | Scene-based transition, signal-driven |

---

## File Structure

```
game/
├── project.godot                                    <- add TacticalChoiceSystem autoload
└── src/
    ├── autoloads/
    │   └── TacticalChoiceSystem.gd                  <- new autoload (this feature)
    ├── resources/
    │   ├── TacticalOption.gd                        <- new Resource: one selectable option
    │   └── AttemptModifier.gd                       <- new Resource: output consumed by F07
    └── scenes/
        └── tactical_choice/
            ├── TacticalChoiceScreen.tscn             <- new scene
            └── TacticalChoiceScreen.gd               <- new script
```

---

## Data Model

### `TacticalOption` (Resource)

Represents one selectable option within a category.

```gdscript
class_name TacticalOption
extends Resource

var id: String                        # unique key, e.g. "comp_defensive_tank"
var category: int                     # GameEnums.TacticalCategory value
var label: String                     # display name, e.g. "Tank Defensif"
var description: String               # tooltip text explaining trade-off
var modifier: AttemptModifier         # the modifier this option produces
var is_available: bool = true         # false if preconditions not met (grayed out)
var unavailable_reason: String = ""   # why it is unavailable, shown in UI
```

### `AttemptModifier` (Resource)

The output of a tactical choice, consumed by F07 attempt resolution.

```gdscript
class_name AttemptModifier
extends Resource

var source_option_id: String          # which TacticalOption produced this
var category: int                     # GameEnums.TacticalCategory value

# Stat modifiers (additive, applied to guild aggregate before resolution)
var skill_bonus: int = 0              # added to guild effective skill
var fiabilite_bonus: int = 0          # added to guild effective fiabilite
var moral_bonus: int = 0              # added to guild effective moral

# Role-specific modifiers
var tank_effectiveness: float = 1.0   # multiplier on tank contribution
var healer_effectiveness: float = 1.0 # multiplier on healer contribution
var dps_effectiveness: float = 1.0    # multiplier on DPS contribution

# Special flags
var ignore_mechanic: bool = false     # strategy: skip one boss mechanic check
var burst_mode: bool = false          # strategy: higher damage, lower survival
var endurance_mode: bool = false      # strategy: lower damage, higher survival
```

### New enum in `GameEnums.gd`

```gdscript
enum TacticalCategory { COMPOSITION, CONSUMABLES, STRATEGY }

const TACTICAL_CATEGORY_NAMES: Dictionary = {
    TacticalCategory.COMPOSITION: "Composition",
    TacticalCategory.CONSUMABLES: "Consommables",
    TacticalCategory.STRATEGY: "Strategie",
}
```

---

## Component Contract: `TacticalChoiceSystem.gd` (Autoload)

Generates contextual tactical options and manages the selection flow. Pure state machine -- no scene dependencies.

### State Variables

```gdscript
var current_options: Dictionary = {}   # category (int) -> Array[TacticalOption]
var selected_option: TacticalOption    # null until player confirms
var current_modifier: AttemptModifier  # null until player confirms
```

### Signals

```gdscript
signal options_generated(options: Dictionary)       # category -> Array[TacticalOption]
signal option_selected(option: TacticalOption)      # preview selection (before confirm)
signal choice_confirmed(modifier: AttemptModifier)  # final, irreversible
```

### Public API

```gdscript
# Called by Main.gd when entering the tactical choice phase.
# Generates contextual options based on current game state.
# Emits options_generated when ready.
func generate_options(roster: Array[Member], boss: Boss, inventory: Dictionary) -> void

# Called by UI when player highlights/selects an option (reversible).
# Emits option_selected for UI preview.
func select_option(option: TacticalOption) -> void

# Called by UI when player confirms their choice (irreversible).
# Sets current_modifier, emits choice_confirmed.
# Returns false if no option is selected.
func confirm_choice() -> bool

# Returns the active modifier for F07 to consume. Null if no choice made yet.
func get_modifier() -> AttemptModifier

# Resets state for next attempt. Called by Main.gd after attempt resolution.
func reset() -> void
```

### Private Helpers

```gdscript
func _generate_composition_options(roster: Array[Member], boss: Boss) -> Array[TacticalOption]
func _generate_consumable_options(inventory: Dictionary) -> Array[TacticalOption]
func _generate_strategy_options(boss: Boss) -> Array[TacticalOption]
func _create_option(id: String, category: int, label: String, desc: String, modifier: AttemptModifier) -> TacticalOption
```

### Option Generation Logic

**Composition options** (2-3 options, always available):
- Depend on which roles are present in the roster
- Example: if roster has >= 1 TANK, offer "Tank Defensif" (tank_effectiveness +0.3, dps_effectiveness -0.1) vs "Tank Offensif" (tank_effectiveness -0.1, dps_effectiveness +0.2, fiabilite_bonus -5)
- Example: if roster has >= 1 HEALER, offer "Healer de Raid" (moral_bonus +10, healer_effectiveness +0.2) vs "Healer de Spot" (healer_effectiveness +0.4, moral_bonus -5)
- At least 2 options are always generated

**Consumable options** (2-3 options, availability depends on inventory):
- Each consumable type has a quantity in the inventory Dictionary
- Options that require depleted consumables are shown but marked `is_available = false`
- Example: "Potion de Puissance" (skill_bonus +15, fiabilite_bonus -10) -- costs 1 potion
- Example: "Repas de Guilde" (moral_bonus +15, no penalty) -- costs 1 meal
- Example: "Parchemin de Buff" (all effectiveness +0.15) -- costs 1 scroll

**Strategy options** (2-3 options, always available):
- Pure trade-off choices, no resource cost
- "Burst DPS" (burst_mode = true, dps_effectiveness +0.4, healer_effectiveness -0.2)
- "Survie Longue" (endurance_mode = true, healer_effectiveness +0.3, dps_effectiveness -0.2)
- "Ignorer une Mecanique" (ignore_mechanic = true, fiabilite_bonus -15) -- risky but can bypass a hard check

---

## Contract with F07 (Boss Attempt Resolution)

F07 will receive the `AttemptModifier` via `TacticalChoiceSystem.get_modifier()`.

**F07 integration points:**

1. **Guild stat aggregation**: before computing guild performance, F07 adds `skill_bonus`, `fiabilite_bonus`, `moral_bonus` to the aggregated guild stats.

2. **Role contribution weighting**: F07 multiplies each role's contribution by the corresponding effectiveness multiplier (`tank_effectiveness`, `healer_effectiveness`, `dps_effectiveness`).

3. **Special flag checks**: F07 checks boolean flags:
   - `burst_mode`: higher DPS ceiling but reduced survival threshold
   - `endurance_mode`: higher survival threshold but reduced DPS ceiling
   - `ignore_mechanic`: skip one mechanic check (the hardest one for this boss)

4. **Null safety**: if `get_modifier()` returns null (should not happen in normal flow), F07 uses default values (all bonuses 0, all multipliers 1.0, all flags false).

**Pseudo-code for F07 consumption:**

```gdscript
var modifier: AttemptModifier = TacticalChoiceSystem.get_modifier()
if modifier == null:
    modifier = AttemptModifier.new()  # defaults

var effective_skill = guild_avg_skill + modifier.skill_bonus
var effective_fiabilite = guild_avg_fiabilite + modifier.fiabilite_bonus
var effective_moral = guild_avg_moral + modifier.moral_bonus

var tank_score = tank_avg * modifier.tank_effectiveness
var healer_score = healer_avg * modifier.healer_effectiveness
var dps_score = dps_avg * modifier.dps_effectiveness
```

---

## Scene Structure: `TacticalChoiceScreen`

### Layout

```
TacticalChoiceScreen (Control, full-screen)
├── VBoxContainer
│   ├── HeaderLabel                    "Choix Tactique -- T{tier}-B{pos} (Tentative {n}/{max})"
│   ├── CategoryTabs (HBoxContainer)
│   │   ├── CompositionTab (Button)    toggle to show composition options
│   │   ├── ConsumablesTab (Button)    toggle to show consumable options
│   │   └── StrategyTab (Button)       toggle to show strategy options
│   ├── OptionsContainer (VBoxContainer)
│   │   ├── OptionCard1 (PanelContainer)
│   │   │   ├── OptionLabel
│   │   │   ├── DescriptionLabel
│   │   │   └── SelectButton
│   │   ├── OptionCard2 (PanelContainer)
│   │   │   └── ...
│   │   └── OptionCard3 (PanelContainer)
│   │       └── ...
│   ├── SelectedPreview (PanelContainer)
│   │   ├── SelectedLabel             "Selection: {option label}"
│   │   └── ModifierSummary           "+15 Skill, -10 Fiabilite"
│   └── ConfirmButton (Button)        disabled until an option is selected
```

### Behavior

1. On scene enter: `TacticalChoiceSystem.generate_options(roster, boss, inventory)` is called
2. `options_generated` signal populates the three category tabs
3. Default view: Composition tab selected
4. Player clicks a tab -> shows that category's options in OptionsContainer
5. Player clicks SelectButton on an option -> `TacticalChoiceSystem.select_option(option)` called
6. `option_selected` signal updates SelectedPreview panel and enables ConfirmButton
7. Player can switch tabs and select a different option (replaces previous selection)
8. Player clicks ConfirmButton -> confirmation dialog ("Confirmer ce choix? Cette decision est irreversible.")
9. On confirm -> `TacticalChoiceSystem.confirm_choice()` called
10. `choice_confirmed` signal -> Main.gd transitions to attempt resolution scene

### Unavailable Options

- Options with `is_available == false` are shown with grayed-out styling
- SelectButton is disabled
- `unavailable_reason` is displayed in the description area
- This prevents hiding information -- player sees what they could have had with different resources

---

## Integration with Main.gd

### Scene Flow Update

```
Draft -> TacticalChoice -> AttemptResolution -> InterRaid -> TacticalChoice (next boss or retry)
```

### Main.gd Changes

```gdscript
# Add scene constant
const TacticalChoiceScreen := preload("res://src/scenes/tactical_choice/TacticalChoiceScreen.tscn")

# In draft_complete handler (or inter-raid complete handler):
func _on_ready_for_tactical_choice() -> void:
    _clear_current_scene()
    var screen := TacticalChoiceScreen.instantiate()
    add_child(screen)

# Listen for choice_confirmed to transition to F07
func _ready() -> void:
    TacticalChoiceSystem.choice_confirmed.connect(_on_tactical_choice_confirmed)

func _on_tactical_choice_confirmed(_modifier: AttemptModifier) -> void:
    _clear_current_scene()
    # Transition to F07 attempt resolution scene (future feature)
```

---

## Inventory System (Minimal Stub for F06)

Consumable options require an inventory. Since no inventory system exists yet, F06 introduces a minimal stub:

```gdscript
# In TacticalChoiceSystem or a future InventorySystem autoload:
var inventory: Dictionary = {
    "potion": 3,
    "scroll": 2,
    "meal": 2,
}

func consume_item(item_key: String) -> bool:
    if inventory.get(item_key, 0) > 0:
        inventory[item_key] -= 1
        return true
    return false
```

This stub lives inside `TacticalChoiceSystem` for now. When a proper inventory/resource system is built, it will be extracted to its own autoload.

Consumables are deducted on `confirm_choice()`, not on `select_option()`. This ensures the player does not lose items by browsing.

---

## No Backend Changes

This feature is entirely client-side. The `AttemptModifier` is ephemeral -- it exists only for the duration of one attempt. Run state snapshots (future) will persist the chosen option ID for replay/analytics, but that is out of scope for F06.

---

## Sequence Diagram

### Happy Path

```
Main.gd                     TacticalChoiceSystem              TacticalChoiceScreen
  |                                |                                |
  |-- generate_options(roster, boss, inv) -->                       |
  |                                |-- _generate_composition_options()
  |                                |-- _generate_consumable_options()
  |                                |-- _generate_strategy_options()
  |                                |                                |
  |                                |-- emit options_generated ----> |
  |                                |                                |-- display tabs + options
  |                                |                                |
  |                                |<-- select_option(opt) ---------|  (user clicks)
  |                                |-- emit option_selected ------> |
  |                                |                                |-- update preview
  |                                |                                |
  |                                |<-- confirm_choice() -----------|  (user confirms)
  |                                |-- consume_item() if consumable |
  |                                |-- set current_modifier         |
  |                                |-- emit choice_confirmed -----> |
  |<-- choice_confirmed -----------|                                |
  |-- transition to F07            |                                |
```

---

## Open Questions

None -- the spec fully defines the scope. The balance tuning of modifier values (how much +skill, how much -fiabilite) is a game design concern that will be iterated on during playtesting. The architecture supports any numeric values without structural changes.
