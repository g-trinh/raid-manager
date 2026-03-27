class_name Boss
extends Resource

var id: int
var tier: int
var position: int
var difficulty_score: int

func get_label() -> String:
	return "T%d-B%d" % [tier, position]
