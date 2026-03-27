class_name AttemptModifier
extends Resource

var source_option_id: String = ""
var category: int = 0

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
