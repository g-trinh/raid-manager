class_name MemberData
extends Resource

@export var member_name: String = ""
@export var role: Role.Type = Role.Type.DPS
@export var skill: int = 0

static func create(p_name: String, p_role: Role.Type, p_skill: int) -> MemberData:
	var member := MemberData.new()
	member.member_name = p_name
	member.role = p_role
	member.skill = p_skill
	return member
