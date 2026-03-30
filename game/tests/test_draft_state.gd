extends GutTest

func before_each() -> void:
	DraftState.reset()

func _member(role: Role.Type) -> MemberData:
	return GameData.get_members_by_role(role)[0]

# --- reset ---

func test_reset_clears_selection() -> void:
	DraftState.add_member(_member(Role.Type.TANK))
	DraftState.reset()
	assert_eq(DraftState.selected_members.size(), 0)

# --- add_member ---

func test_add_member_returns_true_when_slot_available() -> void:
	assert_true(DraftState.add_member(_member(Role.Type.TANK)))

func test_add_member_appends_to_selected() -> void:
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	assert_true(DraftState.selected_members.has(member))

func test_add_member_returns_false_when_role_full() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	assert_false(DraftState.add_member(tanks[2]))

func test_add_member_no_side_effect_when_rejected() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	var size_before := DraftState.selected_members.size()
	DraftState.add_member(tanks[2])
	assert_eq(DraftState.selected_members.size(), size_before)

# --- get_role_count ---

func test_get_role_count_zero_initially() -> void:
	assert_eq(DraftState.get_role_count(Role.Type.TANK), 0)

func test_get_role_count_increments() -> void:
	DraftState.add_member(_member(Role.Type.TANK))
	assert_eq(DraftState.get_role_count(Role.Type.TANK), 1)

# --- is_role_full ---

func test_is_role_full_false_initially() -> void:
	assert_false(DraftState.is_role_full(Role.Type.TANK))

func test_is_role_full_true_at_cap() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	assert_true(DraftState.is_role_full(Role.Type.TANK))

# --- is_draft_complete ---

func test_is_draft_complete_false_initially() -> void:
	assert_false(DraftState.is_draft_complete())

func test_is_draft_complete_true_when_8_selected() -> void:
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
	DraftState.add_member(dps[3])
	assert_true(DraftState.is_draft_complete())

# --- get_available_members ---

func test_available_excludes_selected() -> void:
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	assert_false(DraftState.get_available_members().has(member))

func test_available_excludes_role_capped() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	assert_false(DraftState.get_available_members().has(tanks[2]))

func test_available_returns_all_initially() -> void:
	assert_eq(DraftState.get_available_members().size(), 11)

# --- signals ---

func test_member_selected_signal_fires() -> void:
	watch_signals(DraftState)
	DraftState.add_member(_member(Role.Type.TANK))
	assert_signal_emitted(DraftState, "member_selected")

func test_draft_completed_signal_fires_on_8th() -> void:
	watch_signals(DraftState)
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
	assert_signal_not_emitted(DraftState, "draft_completed")
	DraftState.add_member(dps[3])
	assert_signal_emitted(DraftState, "draft_completed")

func test_draft_completed_not_fired_before_8th() -> void:
	watch_signals(DraftState)
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
	assert_signal_not_emitted(DraftState, "draft_completed")

# --- draw_candidates ---

func test_draw_candidates_returns_at_most_3() -> void:
	DraftState.draw_candidates()
	assert_true(DraftState.current_candidates.size() <= 3)

func test_draw_candidates_excludes_selected_members() -> void:
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	assert_false(DraftState.current_candidates.has(member))

func test_draw_candidates_excludes_role_capped_members() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	DraftState.add_member(tanks[0])
	DraftState.add_member(tanks[1])
	# tanks[2] is excluded because TANK role is now full
	assert_false(DraftState.current_candidates.has(tanks[2]))

func test_add_member_refreshes_candidates() -> void:
	var candidates_before := DraftState.current_candidates.duplicate()
	var member := _member(Role.Type.TANK)
	DraftState.add_member(member)
	# The just-selected member must no longer appear in candidates
	assert_false(DraftState.current_candidates.has(member))
	# Candidates have been refreshed (new array assigned)
	assert_ne(DraftState.current_candidates, candidates_before)

func test_candidates_empty_after_draft_complete() -> void:
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
	DraftState.add_member(dps[3])
	assert_true(DraftState.is_draft_complete())
	# draw_candidates must NOT have been called after the 8th pick
	assert_eq(DraftState.current_candidates.size(), 0)

func test_round_drawn_signal_fires_on_draw_candidates() -> void:
	watch_signals(DraftState)
	DraftState.draw_candidates()
	assert_signal_emitted(DraftState, "round_drawn")

func test_round_drawn_signal_fires_after_add_member() -> void:
	watch_signals(DraftState)
	DraftState.add_member(_member(Role.Type.TANK))
	assert_signal_emitted(DraftState, "round_drawn")

func test_round_drawn_not_fired_after_last_pick() -> void:
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
	# Start watching only now so previous draws don't count
	watch_signals(DraftState)
	DraftState.add_member(dps[3])
	assert_signal_not_emitted(DraftState, "round_drawn")
