# DraftState — autoload singleton for draft phase
# Do NOT add class_name (autoload convention)
extends Node

signal member_selected(member: MemberData)
signal draft_completed

const ROLE_CAPS: Dictionary = {
	Role.Type.TANK: 2,
	Role.Type.HEALER: 2,
	Role.Type.DPS: 4,
}
const TEAM_SIZE: int = 8

var selected_members: Array[MemberData] = []

func add_member(member: MemberData) -> bool:
	if is_role_full(member.role):
		return false
	selected_members.append(member)
	emit_signal("member_selected", member)
	if is_draft_complete():
		emit_signal("draft_completed")
	return true

func is_draft_complete() -> bool:
	return selected_members.size() == TEAM_SIZE

func get_role_count(role: Role.Type) -> int:
	var count := 0
	for m in selected_members:
		if m.role == role:
			count += 1
	return count

func is_role_full(role: Role.Type) -> bool:
	return get_role_count(role) >= ROLE_CAPS[role]

func get_available_members() -> Array[MemberData]:
	var result: Array[MemberData] = []
	for member in GameData.member_pool:
		if selected_members.has(member):
			continue
		if is_role_full(member.role):
			continue
		result.append(member)
	return result

func reset() -> void:
	selected_members.clear()
