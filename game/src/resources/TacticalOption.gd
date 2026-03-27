class_name TacticalOption
extends Resource

var id: String = ""
var category: int = 0
var label: String = ""
var description: String = ""
var modifier = null
var is_available: bool = true
var unavailable_reason: String = ""
var consumable_key: String = ""    # empty if no consumable cost
var consumable_cost: int = 0       # quantity consumed on confirm
