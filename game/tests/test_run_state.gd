extends GutTest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

func _fill_draft(skill_val: int, liability_val: int) -> void:
	DraftState.selected_members.clear()
	# 2 tanks
	for i in range(2):
		var m := MemberData.new()
		m.role = Role.Type.TANK
		m.skill = skill_val
		m.liability = liability_val
		DraftState.selected_members.append(m)
	# 2 heals
	for i in range(2):
		var m := MemberData.new()
		m.role = Role.Type.HEAL
		m.skill = skill_val
		m.liability = liability_val
		DraftState.selected_members.append(m)
	# 4 dps
	for i in range(4):
		var m := MemberData.new()
		m.role = Role.Type.DPS
		m.skill = skill_val
		m.liability = liability_val
		DraftState.selected_members.append(m)

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------

func after_each() -> void:
	RunState.reset()

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

func test_resolve_guards_incomplete_draft() -> void:
	DraftState.reset()
	RunState.resolve()
	assert_false(RunState.is_resolved)

func test_resolve_sets_is_resolved() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	assert_true(RunState.is_resolved)

func test_resolve_populates_three_phase_results() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	assert_eq(RunState.phase_results.size(), 3)

func test_phases_succeeded_is_count_of_true() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	var count := 0
	for r in RunState.phase_results:
		if r:
			count += 1
	assert_eq(RunState.phases_succeeded, count)

func test_outcome_matches_phases_succeeded() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	match RunState.phases_succeeded:
		3: assert_eq(RunState.outcome, RunState.Outcome.FULL_VICTORY)
		2: assert_eq(RunState.outcome, RunState.Outcome.NARROW_VICTORY)
		_: assert_eq(RunState.outcome, RunState.Outcome.DEFEAT)

func test_resolve_emits_signal_with_outcome() -> void:
	_fill_draft(50, 50)
	watch_signals(RunState)
	RunState.resolve()
	assert_signal_emitted(RunState, "attempt_resolved")

func test_reset_clears_all_state() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	RunState.reset()
	assert_eq(RunState.phase_results.size(), 0)
	assert_eq(RunState.phases_succeeded, 0)
	assert_eq(RunState.outcome, RunState.Outcome.DEFEAT)
	assert_false(RunState.is_resolved)

func test_reset_cascades_to_draft_state() -> void:
	_fill_draft(50, 50)
	RunState.resolve()
	RunState.reset()
	assert_eq(DraftState.selected_members.size(), 0)

func test_get_boss_name_returns_correct_name() -> void:
	assert_eq(RunState.get_boss_name(), "Moloch the Unbound")
