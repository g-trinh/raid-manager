# RunState — autoload singleton for raid attempt resolution
# Do NOT add class_name (autoload convention)
extends Node

enum Outcome {
	FULL_VICTORY,
	NARROW_VICTORY,
	DEFEAT,
}

signal attempt_resolved(outcome)

var phase_results: Array[bool] = []
var phases_succeeded: int = 0
var outcome: Outcome = Outcome.DEFEAT
var is_resolved: bool = false

func resolve() -> void:
	if not DraftState.is_draft_complete():
		push_warning("RunState.resolve() called before draft is complete")
		return

	phase_results.clear()
	var boss := GameData.boss

	for phase in boss.phases:
		var phase_succeeded := _resolve_phase(phase)
		phase_results.append(phase_succeeded)

	phases_succeeded = 0
	for result in phase_results:
		if result:
			phases_succeeded += 1

	if phases_succeeded == 3:
		outcome = Outcome.FULL_VICTORY
	elif phases_succeeded == 2:
		outcome = Outcome.NARROW_VICTORY
	else:
		outcome = Outcome.DEFEAT

	is_resolved = true
	attempt_resolved.emit(outcome)

func _resolve_phase(phase: BossPhaseData) -> bool:
	var members := DraftState.selected_members

	var dps_vals: Array[float] = []
	var tank_vals: Array[float] = []
	var heal_vals: Array[float] = []

	for m in members:
		var stat := float(m.skill) if phase.phase_type == BossPhaseData.PhaseType.SKILL_HEAVY else float(m.liability)
		match m.role:
			Role.Type.DPS:  dps_vals.append(stat)
			Role.Type.TANK: tank_vals.append(stat)
			Role.Type.HEAL: heal_vals.append(stat)

	var dps_avg  := _avg(dps_vals)
	var tank_avg := _avg(tank_vals)
	var heal_avg := _avg(heal_vals)

	var total_weight := phase.dps_weight + phase.tank_weight + phase.heal_weight
	var phase_score := (phase.dps_weight * dps_avg + phase.tank_weight * tank_avg + phase.heal_weight * heal_avg) / float(total_weight)

	var ratio := phase_score / float(phase.phase_target)
	var success_chance := 0.05 + 0.90 * minf(1.0, ratio * ratio)
	success_chance = clampf(success_chance, 0.05, 0.95)

	return randf() <= success_chance

func _avg(vals: Array[float]) -> float:
	if vals.is_empty():
		return 0.0
	var sum := 0.0
	for v in vals:
		sum += v
	return sum / vals.size()

func reset() -> void:
	phase_results.clear()
	phases_succeeded = 0
	outcome = Outcome.DEFEAT
	is_resolved = false
	DraftState.reset()

func get_boss_name() -> String:
	return GameData.boss.boss_name
