class_name BossPhaseData
extends Resource

enum PhaseType {
	SKILL_HEAVY = 0,
	LIABILITY_HEAVY = 1,
}

@export var dps_weight: int = 0
@export var tank_weight: int = 0
@export var heal_weight: int = 0
@export var phase_type: PhaseType = PhaseType.SKILL_HEAVY
@export var phase_target: int = 0

static func create(p_dps_weight: int, p_tank_weight: int, p_heal_weight: int, p_phase_type: PhaseType, p_phase_target: int) -> BossPhaseData:
	var phase := BossPhaseData.new()
	phase.dps_weight = p_dps_weight
	phase.tank_weight = p_tank_weight
	phase.heal_weight = p_heal_weight
	phase.phase_type = p_phase_type
	phase.phase_target = p_phase_target
	return phase
