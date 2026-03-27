extends Control

@onready var boss_info_label: Label = $VBoxContainer/BossInfoLabel
@onready var composition_tab_btn: Button = $VBoxContainer/CategoryTabs/CompositionTabBtn
@onready var consumables_tab_btn: Button = $VBoxContainer/CategoryTabs/ConsumablesTabBtn
@onready var strategy_tab_btn: Button = $VBoxContainer/CategoryTabs/StrategyTabBtn
@onready var options_container: VBoxContainer = $VBoxContainer/OptionsContainer
@onready var selected_label: Label = $VBoxContainer/SelectedPreview/VBoxContainer/SelectedLabel
@onready var modifier_summary: Label = $VBoxContainer/SelectedPreview/VBoxContainer/ModifierSummary
@onready var confirm_button: Button = $VBoxContainer/ConfirmButton

var _current_category: int = GameEnums.TacticalCategory.COMPOSITION
var _option_cards: Array = []
var _current_options: Dictionary = {}

# Passed from Main.gd before adding to scene tree
var current_boss: Boss = null
var current_tier: int = 1
var current_boss_position: int = 1


func _ready() -> void:
	# Populate option cards array from OptionsContainer children
	for child in options_container.get_children():
		_option_cards.append(child)

	# Connect tab buttons
	composition_tab_btn.toggled.connect(_on_tab_toggled.bind(GameEnums.TacticalCategory.COMPOSITION))
	consumables_tab_btn.toggled.connect(_on_tab_toggled.bind(GameEnums.TacticalCategory.CONSUMABLES))
	strategy_tab_btn.toggled.connect(_on_tab_toggled.bind(GameEnums.TacticalCategory.STRATEGY))

	# Connect select buttons on each card
	for i in range(_option_cards.size()):
		var card := _option_cards[i] as PanelContainer
		var select_btn := card.get_node("HBoxContainer/SelectBtn%d" % i) as Button
		select_btn.pressed.connect(_on_select_pressed.bind(i))

	# Connect confirm button
	confirm_button.pressed.connect(_on_confirm_pressed)

	# Connect TacticalChoiceSystem signals
	TacticalChoiceSystem.options_generated.connect(_on_options_generated)
	TacticalChoiceSystem.option_selected.connect(_on_option_selected)

	# Update boss info label
	boss_info_label.text = "Palier %d — Boss %d" % [current_tier, current_boss_position]

	# Generate options
	TacticalChoiceSystem.generate_options(DraftSystem.roster, current_boss)


func _on_options_generated(options: Dictionary) -> void:
	_current_options = options
	_display_category(_current_category)


func _on_tab_toggled(button_pressed: bool, category: int) -> void:
	if button_pressed:
		_current_category = category
		_display_category(category)


func _display_category(category: int) -> void:
	var options: Array = _current_options.get(category, [])

	for i in range(_option_cards.size()):
		var card := _option_cards[i] as PanelContainer

		if i < options.size():
			card.visible = true
			var option := options[i] as TacticalOption
			var vbox := card.get_node("HBoxContainer/VBoxContainer")
			var option_label := vbox.get_node("OptionLabel%d" % i) as Label
			var desc_label := vbox.get_node("DescLabel%d" % i) as Label
			var select_btn := card.get_node("HBoxContainer/SelectBtn%d" % i) as Button

			option_label.text = option.label

			if not option.is_available:
				desc_label.text = option.description + " (" + option.unavailable_reason + ")"
				select_btn.disabled = true
			else:
				desc_label.text = option.description
				select_btn.disabled = false

			# Highlight if this is the selected option
			if TacticalChoiceSystem.selected_option != null and TacticalChoiceSystem.selected_option == option:
				card.modulate = Color(1.2, 1.2, 0.6, 1.0)
			else:
				card.modulate = Color(1.0, 1.0, 1.0, 1.0)
		else:
			card.visible = false


func _on_select_pressed(index: int) -> void:
	var options: Array = _current_options.get(_current_category, [])
	if index < options.size():
		TacticalChoiceSystem.select_option(options[index])


func _on_option_selected(option: TacticalOption) -> void:
	selected_label.text = "Sélection : " + option.label
	modifier_summary.text = _build_modifier_summary(option.modifier)
	confirm_button.disabled = false
	_display_category(_current_category)


func _on_confirm_pressed() -> void:
	TacticalChoiceSystem.confirm_choice()


func _build_modifier_summary(modifier: AttemptModifier) -> String:
	if modifier == null:
		return ""

	var parts: Array = []

	if modifier.skill_bonus != 0:
		var sign := "+" if modifier.skill_bonus > 0 else ""
		parts.append("%s%d Skill" % [sign, modifier.skill_bonus])

	if modifier.fiabilite_bonus != 0:
		var sign := "+" if modifier.fiabilite_bonus > 0 else ""
		parts.append("%s%d Fiabilité" % [sign, modifier.fiabilite_bonus])

	if modifier.moral_bonus != 0:
		var sign := "+" if modifier.moral_bonus > 0 else ""
		parts.append("%s%d Moral" % [sign, modifier.moral_bonus])

	if modifier.tank_effectiveness != 1.0:
		parts.append("Tank x%.2f" % modifier.tank_effectiveness)

	if modifier.healer_effectiveness != 1.0:
		parts.append("Healer x%.2f" % modifier.healer_effectiveness)

	if modifier.dps_effectiveness != 1.0:
		parts.append("DPS x%.2f" % modifier.dps_effectiveness)

	if modifier.burst_mode:
		parts.append("Mode Burst")

	if modifier.endurance_mode:
		parts.append("Mode Endurance")

	if modifier.ignore_mechanic:
		parts.append("Ignore Mécanique")

	return ", ".join(parts)
