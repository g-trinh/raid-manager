extends Node

const DraftScreen := preload("res://src/scenes/draft/DraftScreen.tscn")

func _ready() -> void:
	var draft_screen := DraftScreen.instantiate()
	add_child(draft_screen)
