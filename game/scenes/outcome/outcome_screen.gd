extends Control

@onready var title_label: Label = $VBoxContainer/TitleLabel
@onready var phases_label: Label = $VBoxContainer/PhasesLabel
@onready var play_again_button: Button = $VBoxContainer/PlayAgainButton

func _ready() -> void:
	if not RunState.is_resolved:
		push_warning("OutcomeScreen loaded without resolution")
		get_tree().change_scene_to_file("res://scenes/draft/draft_screen.tscn")
		return
	_display_result()
	play_again_button.pressed.connect(_on_play_again_pressed)

func _display_result() -> void:
	match RunState.outcome:
		RunState.Outcome.FULL_VICTORY:
			title_label.text = "Full Victory"
		RunState.Outcome.NARROW_VICTORY:
			title_label.text = "Narrow Victory"
		RunState.Outcome.DEFEAT:
			title_label.text = "Defeat"
	phases_label.text = "%d / 3 phases succeeded" % RunState.phases_succeeded

func _on_play_again_pressed() -> void:
	RunState.reset()
	get_tree().change_scene_to_file("res://scenes/draft/draft_screen.tscn")
