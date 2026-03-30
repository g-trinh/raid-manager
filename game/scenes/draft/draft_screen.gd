extends Control

const MemberCardScene = preload("res://scenes/draft/member_card.tscn")

@onready var tank_counter: Label = $VBoxContainer/SlotTracker/TankCounter
@onready var healer_counter: Label = $VBoxContainer/SlotTracker/HealerCounter
@onready var dps_counter: Label = $VBoxContainer/SlotTracker/DPSCounter
@onready var member_grid: VBoxContainer = $VBoxContainer/HSplitLayout/AvailablePanel/MemberGrid
@onready var team_list: VBoxContainer = $VBoxContainer/HSplitLayout/TeamPanel/TeamList
@onready var proceed_button: Button = $VBoxContainer/ProceedButton

func _ready() -> void:
	DraftState.reset()
	DraftState.member_selected.connect(_on_member_selected)
	DraftState.draft_completed.connect(_on_draft_completed)
	proceed_button.pressed.connect(_on_proceed_pressed)
	_refresh_available_panel()
	_update_slot_tracker()

func _refresh_available_panel() -> void:
	for child in member_grid.get_children():
		child.queue_free()
	for member_data in DraftState.get_available_members():
		var card = MemberCardScene.instantiate()
		member_grid.add_child(card)
		card.setup(member_data, true)
		card.card_pressed.connect(_on_card_pressed)

func _on_card_pressed(member: MemberData) -> void:
	DraftState.add_member(member)

func _on_member_selected(member: MemberData) -> void:
	var card = MemberCardScene.instantiate()
	team_list.add_child(card)
	card.setup(member, false)
	_refresh_available_panel()
	_update_slot_tracker()

func _update_slot_tracker() -> void:
	tank_counter.text = "Tanks: %d/2" % DraftState.get_role_count(Role.Type.TANK)
	healer_counter.text = "Healers: %d/2" % DraftState.get_role_count(Role.Type.HEALER)
	dps_counter.text = "DPS: %d/4" % DraftState.get_role_count(Role.Type.DPS)

func _on_draft_completed() -> void:
	proceed_button.disabled = false

func _on_proceed_pressed() -> void:
	print("Draft complete! Team: ", DraftState.selected_members.map(func(m): return m.member_name))
