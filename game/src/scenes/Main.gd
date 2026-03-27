extends Node
const AttemptModifier = preload("res://src/resources/AttemptModifier.gd")

const DraftScreen := preload("res://src/scenes/draft/DraftScreen.tscn")
const TacticalChoiceScene := preload("res://src/scenes/tactical_choice/TacticalChoiceScreen.tscn")

var current_tier: int = 1
var current_boss_position: int = 1
var current_attempt: int = 1


func _ready() -> void:
	TacticalChoiceSystem.choice_confirmed.connect(_on_tactical_choice_confirmed)
	DraftSystem.draft_complete.connect(_on_draft_complete)

	var draft_screen := DraftScreen.instantiate()
	add_child(draft_screen)


func _on_draft_complete(_roster: Array) -> void:
	_clear_current_scene()
	_show_tactical_choice()


func _show_tactical_choice() -> void:
	var screen := TacticalChoiceScene.instantiate()
	screen.current_tier = current_tier
	screen.current_boss_position = current_boss_position
	screen.current_boss = BossDatabase.get_boss(current_tier, current_boss_position)
	add_child(screen)


func _on_tactical_choice_confirmed(modifier) -> void:
	_clear_current_scene()
	# F07 will handle the actual attempt resolution
	print("[Main] Tactical choice confirmed: %s" % modifier.source_option_id)


func _clear_current_scene() -> void:
	for child in get_children():
		child.queue_free()
