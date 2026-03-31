class_name BossData
extends Resource

@export var boss_name: String = ""
@export var phases: Array[BossPhaseData] = []

static func create(p_name: String, p_phases: Array[BossPhaseData]) -> BossData:
	var boss := BossData.new()
	boss.boss_name = p_name
	boss.phases = p_phases
	return boss
