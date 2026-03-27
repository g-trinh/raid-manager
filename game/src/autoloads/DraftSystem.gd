extends Node

const GUILD_SIZE: int = 8
const MAX_SKIPS: int = 3
const DRAW_SIZE: int = 3
const MIN_TANKS: int = 4
const MIN_HEALERS: int = 4
const POOL_SIZE: int = GUILD_SIZE * DRAW_SIZE  # 24

var draw_index: int = 0
var skips_remaining: int = MAX_SKIPS
var roster: Array[Member] = []
var current_draw: Array[Member] = []

var _pool: Array[Member] = []
var _pool_cursor: int = 0

signal draw_ready(members: Array[Member])
signal member_picked(member: Member, draw_index: int)
signal draw_skipped(draw_index: int, skips_remaining: int)
signal draft_complete(roster: Array[Member])


func start_draft() -> void:
	draw_index = 0
	skips_remaining = MAX_SKIPS
	roster = []
	current_draw = []
	_pool_cursor = 0

	_pool = _generate_pool()

	_advance_draw()


func pick_member(member: Member) -> void:
	roster.append(member)
	emit_signal("member_picked", member, draw_index)

	draw_index += 1

	if is_complete():
		emit_signal("draft_complete", roster)
		return

	if _pool_cursor >= _pool.size():
		emit_signal("draft_complete", roster)
		return

	_advance_draw()


func skip_draw() -> void:
	if not can_skip():
		return

	skips_remaining -= 1
	emit_signal("draw_skipped", draw_index, skips_remaining)

	draw_index += 1

	if _pool_cursor >= _pool.size():
		emit_signal("draft_complete", roster)
		return

	_advance_draw()


func can_skip() -> bool:
	return skips_remaining > 0


func is_complete() -> bool:
	return roster.size() >= GUILD_SIZE


# Generates a pool of POOL_SIZE members with guaranteed role minimums.
# Roles are pre-assigned after generation so MemberGenerator.generate()
# still sets initial relations correctly via the growing pool array.
func _generate_pool() -> Array[Member]:
	var role_list: Array[int] = _build_role_list()
	role_list.shuffle()

	var pool: Array[Member] = []
	for i in range(role_list.size()):
		var member: Member = MemberGenerator.generate(i + 1, pool)
		member.role = role_list[i]
		pool.append(member)

	pool.shuffle()
	return pool


# Builds a flat list of POOL_SIZE role integers satisfying the minimums.
func _build_role_list() -> Array[int]:
	var roles: Array[int] = []

	for _i in range(MIN_TANKS):
		roles.append(GameEnums.Role.TANK)

	for _i in range(MIN_HEALERS):
		roles.append(GameEnums.Role.HEALER)

	var dps_count: int = POOL_SIZE - MIN_TANKS - MIN_HEALERS
	for _i in range(dps_count):
		roles.append(GameEnums.Role.DPS)

	return roles


# Pulls the next DRAW_SIZE members from the pool, sets current_draw, emits draw_ready.
func _advance_draw() -> void:
	current_draw = []
	var end: int = mini(_pool_cursor + DRAW_SIZE, _pool.size())
	for i in range(_pool_cursor, end):
		current_draw.append(_pool[i])
	_pool_cursor = end

	emit_signal("draw_ready", current_draw)
