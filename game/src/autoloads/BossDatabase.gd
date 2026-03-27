extends Node

var bosses: Array[Boss] = []

func _ready() -> void:
	for t in range(1, GameEnums.TIER_COUNT + 1):
		for p in range(1, GameEnums.BOSSES_PER_TIER + 1):
			var boss := Boss.new()
			boss.tier = t
			boss.position = p
			boss.id = (t - 1) * GameEnums.BOSSES_PER_TIER + p
			boss.difficulty_score = (t - 1) * GameEnums.BOSSES_PER_TIER + p
			bosses.append(boss)

func get_boss(tier: int, position: int) -> Boss:
	for boss in bosses:
		if boss.tier == tier and boss.position == position:
			return boss
	return null

func get_tier_bosses(tier: int) -> Array[Boss]:
	var result: Array[Boss] = []
	for boss in bosses:
		if boss.tier == tier:
			result.append(boss)
	return result
