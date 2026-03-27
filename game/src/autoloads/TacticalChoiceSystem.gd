extends Node
const AttemptModifier = preload("res://src/resources/AttemptModifier.gd")
const TacticalOption = preload("res://src/resources/TacticalOption.gd")

signal options_generated(options: Dictionary)      # int -> Array[TacticalOption]
signal option_selected(option)     # preview selection
signal choice_confirmed(modifier) # final choice

var current_options: Dictionary = {}
var selected_option = null
var current_modifier = null

# Stub inventory -- will be extracted to its own autoload later
var inventory: Dictionary = {
	"potion": 3,
	"scroll": 2,
	"meal": 2,
}

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

func generate_options(roster: Array, boss: Boss) -> void:
	selected_option = null
	current_modifier = null

	var composition_opts: Array = _generate_composition_options(roster, boss)
	var consumable_opts: Array = _generate_consumable_options()
	var strategy_opts: Array = _generate_strategy_options(boss)

	current_options = {
		GameEnums.TacticalCategory.COMPOSITION: composition_opts,
		GameEnums.TacticalCategory.CONSUMABLES: consumable_opts,
		GameEnums.TacticalCategory.STRATEGY:    strategy_opts,
	}

	options_generated.emit(current_options)


func select_option(option) -> void:
	if not option.is_available:
		return
	selected_option = option
	option_selected.emit(option)


func confirm_choice() -> bool:
	if selected_option == null:
		return false

	if selected_option.consumable_cost > 0:
		var consumed: bool = _consume_item(selected_option.consumable_key, selected_option.consumable_cost)
		if not consumed:
			return false

	current_modifier = selected_option.modifier
	choice_confirmed.emit(current_modifier)
	return true


func get_modifier():
	return current_modifier


func reset() -> void:
	current_options = {}
	selected_option = null
	current_modifier = null

# ---------------------------------------------------------------------------
# Private — option generators
# ---------------------------------------------------------------------------

func _generate_composition_options(roster: Array, _boss: Boss) -> Array:
	var tanks: int = 0
	var healers: int = 0
	for member in roster:
		if member.role == GameEnums.Role.TANK:
			tanks += 1
		elif member.role == GameEnums.Role.HEALER:
			healers += 1

	# Pre-build all possible options
	var tank_def = _create_option(
		"comp_tank_def",
		GameEnums.TacticalCategory.COMPOSITION,
		"Tank Défensif",
		"Protection maximale, DPS réduit",
		_create_modifier(GameEnums.TacticalCategory.COMPOSITION, "comp_tank_def", {
			"tank_effectiveness": 1.3,
			"dps_effectiveness":  0.9,
		})
	)

	var tank_off = _create_option(
		"comp_tank_off",
		GameEnums.TacticalCategory.COMPOSITION,
		"Tank Offensif",
		"DPS accru, fiabilité réduite",
		_create_modifier(GameEnums.TacticalCategory.COMPOSITION, "comp_tank_off", {
			"tank_effectiveness":  0.9,
			"dps_effectiveness":   1.2,
			"fiabilite_bonus":     -5,
		})
	)

	var heal_raid = _create_option(
		"comp_heal_raid",
		GameEnums.TacticalCategory.COMPOSITION,
		"Healer de Raid",
		"Moral amélioré, DPS réduit",
		_create_modifier(GameEnums.TacticalCategory.COMPOSITION, "comp_heal_raid", {
			"moral_bonus":          10,
			"healer_effectiveness": 1.2,
			"dps_effectiveness":    0.9,
		})
	)

	var heal_spot = _create_option(
		"comp_heal_spot",
		GameEnums.TacticalCategory.COMPOSITION,
		"Healer de Spot",
		"Soins ciblés efficaces, moral en baisse",
		_create_modifier(GameEnums.TacticalCategory.COMPOSITION, "comp_heal_spot", {
			"healer_effectiveness": 1.4,
			"moral_bonus":          -5,
			"tank_effectiveness":   0.9,
		})
	)

	var balanced = _create_option(
		"comp_balanced",
		GameEnums.TacticalCategory.COMPOSITION,
		"Composition Équilibrée",
		"Légère amélioration globale",
		_create_modifier(GameEnums.TacticalCategory.COMPOSITION, "comp_balanced", {
			"skill_bonus": 5,
		})
	)

	var result: Array = []

	if tanks >= 1 and healers >= 1:
		# One random tank option + one random healer option + balanced
		var tank_opts: Array = [tank_def, tank_off]
		var healer_opts: Array = [heal_raid, heal_spot]
		tank_opts.shuffle()
		healer_opts.shuffle()
		result = [tank_opts[0], healer_opts[0], balanced]
	elif tanks >= 1:
		result = [tank_def, tank_off, balanced]
	elif healers >= 1:
		result = [heal_raid, heal_spot, balanced]
	else:
		result = [balanced]

	return result


func _generate_consumable_options() -> Array:
	var definitions: Array = [
		{
			"id":             "cons_potion",
			"key":            "potion",
			"cost":           1,
			"label":          "Potion de Puissance",
			"description":    "Skill +15, Fiabilité -10",
			"modifier_kwargs": {
				"skill_bonus":     15,
				"fiabilite_bonus": -10,
			},
		},
		{
			"id":             "cons_meal",
			"key":            "meal",
			"cost":           1,
			"label":          "Repas de Guilde",
			"description":    "Moral +15",
			"modifier_kwargs": {
				"moral_bonus": 15,
			},
		},
		{
			"id":             "cons_scroll",
			"key":            "scroll",
			"cost":           1,
			"label":          "Parchemin de Buff",
			"description":    "Efficacité de tous les rôles +15%",
			"modifier_kwargs": {
				"tank_effectiveness":   1.15,
				"healer_effectiveness": 1.15,
				"dps_effectiveness":    1.15,
			},
		},
	]

	var result: Array = []
	for def in definitions:
		var mod = _create_modifier(
			GameEnums.TacticalCategory.CONSUMABLES,
			def["id"],
			def["modifier_kwargs"]
		)
		var opt = _create_option(
			def["id"],
			GameEnums.TacticalCategory.CONSUMABLES,
			def["label"],
			def["description"],
			mod,
			def["key"],
			def["cost"]
		)
		if inventory.get(def["key"], 0) <= 0:
			opt.is_available = false
			opt.unavailable_reason = "Stock épuisé"
		result.append(opt)

	return result


func _generate_strategy_options(_boss: Boss) -> Array:
	var definitions: Array = [
		{
			"id":          "strat_burst",
			"label":       "Burst DPS",
			"description": "DPS puissant, soins réduits",
			"modifier_kwargs": {
				"burst_mode":          true,
				"dps_effectiveness":   1.4,
				"healer_effectiveness": 0.8,
			},
		},
		{
			"id":          "strat_endurance",
			"label":       "Survie Longue",
			"description": "Résistance prolongée, DPS réduit",
			"modifier_kwargs": {
				"endurance_mode":       true,
				"healer_effectiveness": 1.3,
				"dps_effectiveness":    0.8,
			},
		},
		{
			"id":          "strat_ignore",
			"label":       "Ignorer une Mécanique",
			"description": "Évite une contrainte du boss, fiabilité réduite",
			"modifier_kwargs": {
				"ignore_mechanic":  true,
				"fiabilite_bonus": -15,
			},
		},
	]

	var result: Array = []
	for def in definitions:
		var mod = _create_modifier(
			GameEnums.TacticalCategory.STRATEGY,
			def["id"],
			def["modifier_kwargs"]
		)
		var opt = _create_option(
			def["id"],
			GameEnums.TacticalCategory.STRATEGY,
			def["label"],
			def["description"],
			mod
		)
		result.append(opt)

	return result

# ---------------------------------------------------------------------------
# Private — helpers
# ---------------------------------------------------------------------------

func _consume_item(key: String, cost: int) -> bool:
	if inventory.get(key, 0) >= cost:
		inventory[key] -= cost
		return true
	return false


func _create_modifier(category: int, id: String, kwargs: Dictionary):
	var mod = AttemptModifier.new()
	mod.source_option_id = id
	mod.category = category
	for field in kwargs:
		mod.set(field, kwargs[field])
	return mod


func _create_option(
	id: String,
	cat: int,
	label: String,
	desc: String,
	mod,
	consumable_key: String = "",
	consumable_cost: int = 0
):
	var opt = TacticalOption.new()
	opt.id = id
	opt.category = cat
	opt.label = label
	opt.description = desc
	opt.modifier = mod
	opt.consumable_key = consumable_key
	opt.consumable_cost = consumable_cost
	return opt
