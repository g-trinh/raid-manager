class_name BossData
extends Resource

@export var boss_name: String = ""
@export var difficulty: int = 0

static func create(p_name: String, p_difficulty: int) -> BossData:
	var boss := BossData.new()
	boss.boss_name = p_name
	boss.difficulty = p_difficulty
	return boss
