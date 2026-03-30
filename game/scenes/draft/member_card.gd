class_name MemberCard extends PanelContainer

signal card_pressed(member: MemberData)

var member_data: MemberData

func setup(data: MemberData, interactive: bool = true) -> void:
	member_data = data
	$HBoxContainer/NameLabel.text = data.member_name
	$HBoxContainer/RoleLabel.text = _role_label(data.role)
	$HBoxContainer/SkillLabel.text = "Skill: " + str(data.skill)
	if interactive:
		gui_input.connect(_on_gui_input)

func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		emit_signal("card_pressed", member_data)

func _role_label(role: Role.Type) -> String:
	match role:
		Role.Type.TANK: return "Tank"
		Role.Type.HEALER: return "Healer"
		Role.Type.DPS: return "DPS"
	return "?"
