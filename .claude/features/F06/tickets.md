# F06 -- Tactical Choice (Pre-Attempt): Implementation Tickets

## Ticket Overview

| Ticket | Title | Role | Depends On | Estimate |
|---|---|---|---|---|
| F06-T1 | Add TacticalCategory enum to GameEnums | game-logic-developer | -- | XS |
| F06-T2 | Create AttemptModifier resource | game-logic-developer | F06-T1 | S |
| F06-T3 | Create TacticalOption resource | game-logic-developer | F06-T2 | S |
| F06-T4 | Implement TacticalChoiceSystem autoload | game-logic-developer | F06-T3 | M |
| F06-T5 | Register TacticalChoiceSystem autoload | game-engine-developer | F06-T4 | XS |
| F06-T6 | Create TacticalChoiceScreen scene and script | game-engine-developer | F06-T4 | M |
| F06-T7 | Integrate TacticalChoiceScreen into Main.gd flow | game-engine-developer | F06-T6 | S |

---

## F06-T1: Add TacticalCategory enum to GameEnums

**Role:** game-logic-developer

**File:** `game/src/autoloads/GameEnums.gd`

**Task:** Add the `TacticalCategory` enum and its display name mapping.

**Changes:**

Add after the existing `MemberTrait` enum block:

```gdscript
enum TacticalCategory { COMPOSITION, CONSUMABLES, STRATEGY }

const TACTICAL_CATEGORY_NAMES: Dictionary = {
    TacticalCategory.COMPOSITION: "Composition",
    TacticalCategory.CONSUMABLES: "Consommables",
    TacticalCategory.STRATEGY: "Strategie",
}
```

**Acceptance criteria:**
- Enum has exactly 3 values
- `TACTICAL_CATEGORY_NAMES` maps all 3 values to French display strings
- Existing enums and constants are unchanged

---

## F06-T2: Create AttemptModifier resource

**Role:** game-logic-developer

**File:** `game/src/resources/AttemptModifier.gd` (new)

**Task:** Create the `AttemptModifier` Resource class that represents the output of a tactical choice, consumed by F07.

**Implementation:**

```gdscript
class_name AttemptModifier
extends Resource

var source_option_id: String = ""
var category: int = GameEnums.TacticalCategory.COMPOSITION

# Additive stat modifiers (applied to guild aggregate)
var skill_bonus: int = 0
var fiabilite_bonus: int = 0
var moral_bonus: int = 0

# Role effectiveness multipliers
var tank_effectiveness: float = 1.0
var healer_effectiveness: float = 1.0
var dps_effectiveness: float = 1.0

# Special flags
var ignore_mechanic: bool = false
var burst_mode: bool = false
var endurance_mode: bool = false
```

**Acceptance criteria:**
- All default values are neutral (0 for bonuses, 1.0 for multipliers, false for flags)
- No logic in this class -- pure data container
- Class is registered as `class_name AttemptModifier`

---

## F06-T3: Create TacticalOption resource

**Role:** game-logic-developer

**File:** `game/src/resources/TacticalOption.gd` (new)

**Task:** Create the `TacticalOption` Resource class that represents one selectable option in the tactical choice screen.

**Implementation:**

```gdscript
class_name TacticalOption
extends Resource

var id: String = ""
var category: int = GameEnums.TacticalCategory.COMPOSITION
var label: String = ""
var description: String = ""
var modifier: AttemptModifier = null
var is_available: bool = true
var unavailable_reason: String = ""
var consumable_key: String = ""    # empty if no consumable cost; e.g. "potion", "scroll", "meal"
var consumable_cost: int = 0       # quantity consumed on confirm
```

**Acceptance criteria:**
- `modifier` field holds a reference to an `AttemptModifier` instance
- `consumable_key` and `consumable_cost` allow the system to deduct inventory on confirm
- No logic in this class -- pure data container

---

## F06-T4: Implement TacticalChoiceSystem autoload

**Role:** game-logic-developer

**File:** `game/src/autoloads/TacticalChoiceSystem.gd` (new)

**Task:** Implement the core autoload that generates contextual tactical options and manages the selection/confirmation flow.

### Signals

```gdscript
signal options_generated(options: Dictionary)        # category (int) -> Array[TacticalOption]
signal option_selected(option: TacticalOption)       # preview selection
signal choice_confirmed(modifier: AttemptModifier)   # final choice
```

### State

```gdscript
var current_options: Dictionary = {}    # int -> Array[TacticalOption]
var selected_option: TacticalOption = null
var current_modifier: AttemptModifier = null

# Stub inventory -- will be extracted to own autoload in a future feature
var inventory: Dictionary = {
    "potion": 3,
    "scroll": 2,
    "meal": 2,
}
```

### Public Methods

**`generate_options(roster: Array[Member], boss: Boss, inventory_override: Dictionary = {}) -> void`**
- Reset `selected_option` and `current_modifier` to null
- Call `_generate_composition_options(roster, boss)`
- Call `_generate_consumable_options()`
- Call `_generate_strategy_options(boss)`
- Store results in `current_options`
- Emit `options_generated`

**`select_option(option: TacticalOption) -> void`**
- Validate `option.is_available` is true; return silently if false
- Set `selected_option = option`
- Emit `option_selected`

**`confirm_choice() -> bool`**
- If `selected_option` is null, return false
- If option has a consumable cost, call `_consume_item()`; if fails, return false
- Set `current_modifier = selected_option.modifier`
- Emit `choice_confirmed(current_modifier)`
- Return true

**`get_modifier() -> AttemptModifier`**
- Return `current_modifier` (may be null)

**`reset() -> void`**
- Set `current_options = {}`, `selected_option = null`, `current_modifier = null`

### Private Methods

**`_generate_composition_options(roster: Array[Member], boss: Boss) -> Array[TacticalOption]`**

Generate 2-3 options based on roster composition:

1. Count roles in roster (tanks, healers, dps)
2. If tanks >= 1: generate "Tank Defensif" and "Tank Offensif" options
3. If healers >= 1: generate "Healer de Raid" and "Healer de Spot" options
4. Always generate at least a generic "Equilibree" option as fallback
5. Return max 3 options

Option definitions (initial balance values, subject to tuning):

| Option | Condition | Modifier |
|---|---|---|
| Tank Defensif | tanks >= 1 | tank_effectiveness +0.3, dps_effectiveness -0.1 |
| Tank Offensif | tanks >= 1 | tank_effectiveness -0.1, dps_effectiveness +0.2, fiabilite_bonus -5 |
| Healer de Raid | healers >= 1 | moral_bonus +10, healer_effectiveness +0.2, dps_effectiveness -0.1 |
| Healer de Spot | healers >= 1 | healer_effectiveness +0.4, moral_bonus -5, tank_effectiveness -0.1 |
| Equilibree | always | skill_bonus +5 (small generic buff, low impact) |

Selection logic: pick 2-3 options relevant to roster. If roster has both tanks and healers, pick one tank option and one healer option randomly, plus "Equilibree". If roster has only one role type, show both variants of that role plus "Equilibree".

**`_generate_consumable_options() -> Array[TacticalOption]`**

Always generate all 3 consumable options. Mark as unavailable if inventory is depleted.

| Option | Key | Cost | Modifier | Unavailable when |
|---|---|---|---|---|
| Potion de Puissance | "potion" | 1 | skill_bonus +15, fiabilite_bonus -10 | inventory["potion"] <= 0 |
| Repas de Guilde | "meal" | 1 | moral_bonus +15 | inventory["meal"] <= 0 |
| Parchemin de Buff | "scroll" | 1 | tank/healer/dps_effectiveness all +0.15 | inventory["scroll"] <= 0 |

**`_generate_strategy_options(boss: Boss) -> Array[TacticalOption]`**

Always generate exactly 3 strategy options:

| Option | Modifier |
|---|---|
| Burst DPS | burst_mode = true, dps_effectiveness +0.4, healer_effectiveness -0.2 |
| Survie Longue | endurance_mode = true, healer_effectiveness +0.3, dps_effectiveness -0.2 |
| Ignorer une Mecanique | ignore_mechanic = true, fiabilite_bonus -15 |

**`_consume_item(key: String, cost: int) -> bool`**
- If `inventory.get(key, 0) >= cost`: decrement and return true
- Else return false

**`_create_option(id: String, cat: int, label: String, desc: String, mod: AttemptModifier, consumable_key: String = "", consumable_cost: int = 0) -> TacticalOption`**
- Factory method that constructs a TacticalOption with all fields set

### Acceptance Criteria

- `generate_options()` always produces exactly 3 categories with 2-3 options each
- `select_option()` on an unavailable option is a no-op
- `confirm_choice()` deducts consumables before emitting signal
- `confirm_choice()` returns false and does not emit if no option selected
- `reset()` clears all state cleanly
- No scene or UI dependencies in this file

---

## F06-T5: Register TacticalChoiceSystem autoload

**Role:** game-engine-developer

**File:** `game/project.godot`

**Task:** Add TacticalChoiceSystem as an autoload in the project settings.

**Changes:**

Add to the `[autoload]` section:

```ini
TacticalChoiceSystem="*res://src/autoloads/TacticalChoiceSystem.gd"
```

**Acceptance criteria:**
- TacticalChoiceSystem is accessible as a global singleton from any script
- Existing autoloads remain unchanged

---

## F06-T6: Create TacticalChoiceScreen scene and script

**Role:** game-engine-developer

**Files:**
- `game/src/scenes/tactical_choice/TacticalChoiceScreen.tscn` (new)
- `game/src/scenes/tactical_choice/TacticalChoiceScreen.gd` (new)

**Task:** Build the UI scene for the tactical choice phase.

### Scene Tree

```
TacticalChoiceScreen (Control) [anchors: full_rect]
└── VBoxContainer [anchors: full_rect, margins: 40px]
    ├── HeaderLabel (Label)
    │       text: "Choix Tactique"
    │       horizontal_alignment: CENTER
    │       theme_override_font_sizes/font_size: 28
    ├── CategoryTabs (HBoxContainer) [alignment: center]
    │   ├── CompositionTabBtn (Button) [text: "Composition", toggle_mode: true, button_group: tab_group]
    │   ├── ConsumablesTabBtn (Button) [text: "Consommables", toggle_mode: true, button_group: tab_group]
    │   └── StrategyTabBtn (Button) [text: "Strategie", toggle_mode: true, button_group: tab_group]
    ├── OptionsContainer (VBoxContainer) [size_flags_vertical: EXPAND_FILL]
    │   ├── OptionCard0 (PanelContainer) [custom_minimum_size: (0, 80)]
    │   │   └── HBoxContainer
    │   │       ├── VBoxContainer
    │   │       │   ├── OptionLabel (Label)
    │   │       │   └── DescriptionLabel (Label) [autowrap_mode: WORD]
    │   │       └── SelectButton (Button) [text: "Choisir", custom_minimum_size: (100, 0)]
    │   ├── OptionCard1 (PanelContainer) -- same structure
    │   └── OptionCard2 (PanelContainer) -- same structure
    ├── SelectedPreview (PanelContainer) [custom_minimum_size: (0, 60)]
    │   └── VBoxContainer
    │       ├── SelectedLabel (Label) [text: "Aucune selection"]
    │       └── ModifierSummary (Label) [text: ""]
    └── ConfirmButton (Button) [text: "Confirmer", disabled: true, custom_minimum_size: (200, 50)]
```

Use a `ButtonGroup` resource for the 3 tab buttons so only one can be pressed at a time. Set CompositionTabBtn as pressed by default.

### Script Behavior (`TacticalChoiceScreen.gd`)

```gdscript
extends Control
```

**@onready references:** All nodes listed in the scene tree above.

**State:**
```gdscript
var _current_category: int = GameEnums.TacticalCategory.COMPOSITION
var _option_cards: Array[PanelContainer] = []  # populated from OptionsContainer children
```

**_ready():**
1. Populate `_option_cards` from OptionsContainer children
2. Connect tab button `toggled` signals to `_on_tab_changed`
3. Connect ConfirmButton `pressed` to `_on_confirm_pressed`
4. Connect `TacticalChoiceSystem.options_generated` to `_on_options_generated`
5. Connect `TacticalChoiceSystem.option_selected` to `_on_option_selected`
6. Call `TacticalChoiceSystem.generate_options(DraftSystem.roster, current_boss, TacticalChoiceSystem.inventory)`

**_on_options_generated(options: Dictionary):**
- Store options reference
- Call `_display_category(_current_category)`

**_on_tab_changed(button_pressed: bool, category: int):**
- If `button_pressed`: set `_current_category = category`, call `_display_category(category)`

**_display_category(category: int):**
- Get options array for category from `TacticalChoiceSystem.current_options`
- For each option card (0..2):
  - If index < options.size(): fill card with option data, show it
  - Else: hide card
- For each visible card:
  - Set OptionLabel.text = option.label
  - Set DescriptionLabel.text = option.description
  - If option.is_available == false: disable SelectButton, append unavailable_reason to description
  - Else: enable SelectButton
  - Highlight card if this option == TacticalChoiceSystem.selected_option

**_on_select_pressed(index: int):**
- Get option from current category at index
- Call `TacticalChoiceSystem.select_option(option)`

**_on_option_selected(option: TacticalOption):**
- Update SelectedPreview: SelectedLabel.text = "Selection: " + option.label
- Build ModifierSummary text from modifier values (show non-zero bonuses and non-1.0 multipliers)
- Enable ConfirmButton
- Refresh card highlighting in current category

**_on_confirm_pressed():**
- Show a simple confirmation: use an `AcceptDialog` or `ConfirmationDialog` node
- On confirmed: call `TacticalChoiceSystem.confirm_choice()`
- The `choice_confirmed` signal is handled by Main.gd, which transitions the scene

**_build_modifier_summary(modifier: AttemptModifier) -> String:**
- Helper that returns a human-readable string, e.g. "+15 Skill, -10 Fiabilite"
- Only include non-default values

### Acceptance Criteria

- Three category tabs are functional and switch displayed options
- Unavailable options are visually distinct (disabled button) with reason shown
- Selected option is previewed before confirmation
- Confirmation dialog prevents accidental clicks
- Scene does not call any F07 logic directly -- only emits through TacticalChoiceSystem signals
- Scene works at 720p minimum resolution (no overflow, no clipping)

---

## F06-T7: Integrate TacticalChoiceScreen into Main.gd flow

**Role:** game-engine-developer

**File:** `game/src/scenes/Main.gd`

**Task:** Update Main.gd to transition from draft to tactical choice screen, and from tactical choice to the next phase.

### Changes

1. Add scene constant:
```gdscript
const TacticalChoiceScreen := preload("res://src/scenes/tactical_choice/TacticalChoiceScreen.tscn")
```

2. Connect signals in `_ready()`:
```gdscript
DraftSystem.draft_complete.connect(_on_draft_complete)
TacticalChoiceSystem.choice_confirmed.connect(_on_tactical_choice_confirmed)
```

3. Add transition handlers:
```gdscript
func _on_draft_complete(_roster: Array[Member]) -> void:
    _clear_current_scene()
    _show_tactical_choice()

func _show_tactical_choice() -> void:
    var screen := TacticalChoiceScreen.instantiate()
    add_child(screen)

func _on_tactical_choice_confirmed(_modifier: AttemptModifier) -> void:
    _clear_current_scene()
    # F07 scene transition will go here
    print("Tactical choice confirmed. Modifier: " + _modifier.source_option_id)

func _clear_current_scene() -> void:
    for child in get_children():
        child.queue_free()
```

4. Update `_ready()` to no longer directly instantiate DraftScreen (it should be the entry point but now with proper cleanup):
```gdscript
func _ready() -> void:
    DraftSystem.draft_complete.connect(_on_draft_complete)
    TacticalChoiceSystem.choice_confirmed.connect(_on_tactical_choice_confirmed)
    var draft_screen := DraftScreen.instantiate()
    add_child(draft_screen)
```

### Acceptance Criteria

- After draft completes, DraftScreen is freed and TacticalChoiceScreen is shown
- After tactical choice is confirmed, TacticalChoiceScreen is freed
- A print/log message confirms the modifier was received (placeholder for F07)
- No orphaned nodes after transitions
- Boss reference is accessible to TacticalChoiceScreen (via BossDatabase.get_boss() or passed as metadata)

### Note on Boss Context

The current Main.gd has no run state tracking (current tier, current boss position, attempt count). F06-T7 should introduce minimal state to Main.gd:

```gdscript
var current_tier: int = 1
var current_boss_position: int = 1
var current_attempt: int = 1
```

These will be used by TacticalChoiceScreen to fetch the right boss from BossDatabase and display the header. This is a stub -- a proper RunState autoload will be introduced in a later feature.

---

## Implementation Order

```
F06-T1 (enum)
   |
F06-T2 (AttemptModifier resource)
   |
F06-T3 (TacticalOption resource)
   |
F06-T4 (TacticalChoiceSystem autoload)
   |
   +--- F06-T5 (register autoload in project.godot)
   |
   +--- F06-T6 (TacticalChoiceScreen scene + script)
            |
         F06-T7 (Main.gd integration)
```

T1 through T4 are sequential (each depends on the previous). T5 and T6 can be done in parallel after T4. T7 depends on T6.
