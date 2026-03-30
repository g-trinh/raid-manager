extends Control

@onready var title_label: Label = $VBoxContainer/TitleLabel
@onready var guild_power_label: Label = $VBoxContainer/GuildPowerLabel
@onready var boss_difficulty_label: Label = $VBoxContainer/BossDifficultyLabel
@onready var play_again_button: Button = $VBoxContainer/PlayAgainButton

func _ready() -> void:
	if not RunState.is_resolved:
		push_warning("OutcomeScreen loaded without resolution")
		get_tree().change_scene_to_file("res://scenes/draft/draft_screen.tscn")
		return
	_display_result()
	play_again_button.pressed.connect(_on_play_again_pressed)

func _display_result() -> void:
	title_label.text = "Victory!" if RunState.won else "Defeat!"
	guild_power_label.text = "Guild Power: %d" % RunState.guild_power
	boss_difficulty_label.text = "%s Difficulty: %d" % [RunState.get_boss_name(), RunState.boss_difficulty]

func _on_play_again_pressed() -> void:
	RunState.reset()
	get_tree().change_scene_to_file("res://scenes/draft/draft_screen.tscn")
