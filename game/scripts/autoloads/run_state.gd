# RunState — autoload singleton for raid attempt resolution
# Do NOT add class_name (autoload convention)
extends Node

signal attempt_resolved(won: bool)

var guild_power: int = 0
var boss_difficulty: int = 0
var won: bool = false
var is_resolved: bool = false

func resolve() -> void:
	if not DraftState.is_draft_complete():
		push_warning("RunState.resolve() called before draft is complete")
		return
	guild_power = 0
	for member in DraftState.selected_members:
		guild_power += member.skill
	boss_difficulty = 0  # TODO(C03): replace with phase-based resolution
	won = guild_power > boss_difficulty
	is_resolved = true
	attempt_resolved.emit(won)

func reset() -> void:
	guild_power = 0
	boss_difficulty = 0
	won = false
	is_resolved = false
	DraftState.reset()

func get_boss_name() -> String:
	return GameData.boss.boss_name
