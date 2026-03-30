class_name TestDraftState extends Node

var _runner  # set by runner
var _current_test := ""

# --- Assertion helpers ---

func assert_eq(a: Variant, b: Variant) -> void:
	if a != b:
		_runner.fail_test(_current_test, "expected %s == %s" % [str(a), str(b)])
	else:
		_runner.pass_test(_current_test)

func assert_true(v: bool, msg: String = "") -> void:
	if not v:
		_runner.fail_test(_current_test, "expected true" + (" — " + msg if msg else ""))
	else:
		_runner.pass_test(_current_test)

func assert_false(v: bool, msg: String = "") -> void:
	assert_true(not v, msg)

# --- Helper: pick first member of given role from pool ---

func _member(role: Role.Type) -> MemberData:
	return GameData.get_members_by_role(role)[0]

# --- reset ---

func test_reset_clears_selection() -> void:
	_current_test = "test_reset_clears_selection"
	DraftState.reset()
	DraftState.add_member(_member(Role.Type.TANK))
	DraftState.reset()
	assert_eq(DraftState.selected_members.size(), 0)

# --- add_member ---

func test_add_member_returns_true_when_slot_available() -> void:
	_current_test = "test_add_member_returns_true_when_slot_available"
	DraftState.reset()
	var result := DraftState.add_member(_member(Role.Type.TANK))
	assert_true(result, "add_member should return true when slot available")

func test_add_member_appends_to_selected() -> void:
	_current_test = "test_add_member_appends_to_selected"
	DraftState.reset()
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	assert_true(DraftState.selected_members.has(member), "member should be in selected_members")

func test_add_member_returns_false_when_role_full() -> void:
	_current_test = "test_add_member_returns_false_when_role_full"
	DraftState.reset()
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	# Fill tank slots (cap is 2)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	# Third tank should be rejected
	var result := DraftState.add_member(tanks[2])
	assert_false(result, "add_member should return false when role is full")

func test_add_member_no_side_effect_when_rejected() -> void:
	_current_test = "test_add_member_no_side_effect_when_rejected"
	DraftState.reset()
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	var size_before := DraftState.selected_members.size()
	DraftState.add_member(tanks[2])
	assert_eq(DraftState.selected_members.size(), size_before)

# --- get_role_count ---

func test_get_role_count_zero_initially() -> void:
	_current_test = "test_get_role_count_zero_initially"
	DraftState.reset()
	assert_eq(DraftState.get_role_count(Role.Type.TANK), 0)

func test_get_role_count_increments() -> void:
	_current_test = "test_get_role_count_increments"
	DraftState.reset()
	DraftState.add_member(_member(Role.Type.TANK))
	assert_eq(DraftState.get_role_count(Role.Type.TANK), 1)

# --- is_role_full ---

func test_is_role_full_false_initially() -> void:
	_current_test = "test_is_role_full_false_initially"
	DraftState.reset()
	assert_false(DraftState.is_role_full(Role.Type.TANK), "tank role should not be full initially")

func test_is_role_full_true_at_cap() -> void:
	_current_test = "test_is_role_full_true_at_cap"
	DraftState.reset()
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	assert_true(DraftState.is_role_full(Role.Type.TANK), "tank role should be full at cap of 2")

# --- is_draft_complete ---

func test_is_draft_complete_false_initially() -> void:
	_current_test = "test_is_draft_complete_false_initially"
	DraftState.reset()
	assert_false(DraftState.is_draft_complete(), "draft should not be complete initially")

func test_is_draft_complete_true_when_8_selected() -> void:
	_current_test = "test_is_draft_complete_true_when_8_selected"
	DraftState.reset()
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	# Add 2 tanks + 2 healers + 4 DPS = 8 members
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	DraftState.add_member(healers[0])
	DraftState.add_member(healers[1])
	DraftState.add_member(dps[0])
	DraftState.add_member(dps[1])
	DraftState.add_member(dps[2])
	DraftState.add_member(dps[3])
	assert_true(DraftState.is_draft_complete(), "draft should be complete with 8 members")

# --- get_available_members ---

func test_available_excludes_selected() -> void:
	_current_test = "test_available_excludes_selected"
	DraftState.reset()
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	var available := DraftState.get_available_members()
	assert_false(available.has(member), "selected member should not appear in available list")

func test_available_excludes_role_capped() -> void:
	_current_test = "test_available_excludes_role_capped"
	DraftState.reset()
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	# Fill tank cap
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	var available := DraftState.get_available_members()
	# Third tank must not appear in available
	assert_false(available.has(tanks[2]), "third tank should not be available when role is capped")

func test_available_returns_all_initially() -> void:
	_current_test = "test_available_returns_all_initially"
	DraftState.reset()
	var available := DraftState.get_available_members()
	assert_eq(available.size(), 11)

# --- signals ---
# GDScript lambdas capture primitives by value; use a single-element Array as a
# mutable reference so the callback can update the flag seen by the test body.

func test_member_selected_signal_fires() -> void:
	_current_test = "test_member_selected_signal_fires"
	DraftState.reset()
	# Use an array so the lambda captures it by reference
	var flag := [false]
	var cb := func(_m: MemberData) -> void:
		flag[0] = true
	DraftState.member_selected.connect(cb, CONNECT_ONE_SHOT)
	DraftState.add_member(_member(Role.Type.TANK))
	if DraftState.member_selected.is_connected(cb):
		DraftState.member_selected.disconnect(cb)
	assert_true(flag[0], "member_selected signal should have fired")

func test_draft_completed_signal_fires_on_8th() -> void:
	_current_test = "test_draft_completed_signal_fires_on_8th"
	DraftState.reset()
	var flag := [false]
	var cb := func() -> void:
		flag[0] = true
	DraftState.draft_completed.connect(cb, CONNECT_ONE_SHOT)
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	DraftState.add_member(healers[0])
	DraftState.add_member(healers[1])
	DraftState.add_member(dps[0])
	DraftState.add_member(dps[1])
	DraftState.add_member(dps[2])
	# 7 members added — signal must not have fired yet
	if flag[0]:
		_runner.fail_test(_current_test, "draft_completed fired early before 8th member")
		if DraftState.draft_completed.is_connected(cb):
			DraftState.draft_completed.disconnect(cb)
		return
	DraftState.add_member(dps[3])
	if DraftState.draft_completed.is_connected(cb):
		DraftState.draft_completed.disconnect(cb)
	assert_true(flag[0], "draft_completed signal should have fired on 8th member")

func test_draft_completed_not_fired_before_8th() -> void:
	_current_test = "test_draft_completed_not_fired_before_8th"
	DraftState.reset()
	var flag := [false]
	var cb := func() -> void:
		flag[0] = true
	DraftState.draft_completed.connect(cb, CONNECT_ONE_SHOT)
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	# Add only 7 members — must not trigger draft_completed
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	DraftState.add_member(healers[0])
	DraftState.add_member(healers[1])
	DraftState.add_member(dps[0])
	DraftState.add_member(dps[1])
	DraftState.add_member(dps[2])
	if DraftState.draft_completed.is_connected(cb):
		DraftState.draft_completed.disconnect(cb)
	assert_false(flag[0], "draft_completed should not fire before 8th member")
