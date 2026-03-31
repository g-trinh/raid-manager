extends GutTest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

func _fill_draft_with_skill(skill_per_member: int) -> void:
	# Bypass role caps by writing directly to selected_members.
	# Creates 8 DPS members each with the given skill value.
	DraftState.selected_members.clear()
	for i in range(8):
		var m := MemberData.new()
		m.role = Role.Type.DPS
		m.skill = skill_per_member
		DraftState.selected_members.append(m)

func _fill_draft_winning() -> void:
	# Gorvak(38)+Shieldara(81)+Lumina(12)+Serenova(91)+Razorfang(80)+Blitzclaw(60)+Vexara(95)+Skarn(28) = 485
	# boss_difficulty stub = 0, so any positive guild_power wins (TODO C03)
	DraftState.selected_members.clear()
	var tanks   := GameData.get_members_by_role(Role.Type.TANK)
	var healers := GameData.get_members_by_role(Role.Type.HEAL)
	var dps     := GameData.get_members_by_role(Role.Type.DPS)
	# tanks[0]=Gorvak(38), tanks[1]=Shieldara(81)
	DraftState.selected_members.append(tanks[0])
	DraftState.selected_members.append(tanks[1])
	# healers[0]=Lumina(12), healers[2]=Serenova(91)
	DraftState.selected_members.append(healers[0])
	DraftState.selected_members.append(healers[2])
	# dps[0]=Razorfang(80), dps[1]=Blitzclaw(60), dps[2]=Vexara(95), dps[3]=Skarn(28)
	DraftState.selected_members.append(dps[0])
	DraftState.selected_members.append(dps[1])
	DraftState.selected_members.append(dps[2])
	DraftState.selected_members.append(dps[3])

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------

func after_each() -> void:
	RunState.reset()

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

func test_resolve_computes_guild_power() -> void:
	# 8 members each with skill=5 → guild_power = 40
	_fill_draft_with_skill(5)
	RunState.resolve()
	assert_eq(RunState.guild_power, 40)

func test_resolve_sets_won_true_when_power_exceeds_difficulty() -> void:
	# Winning team: sum = 58 > 35
	_fill_draft_winning()
	RunState.resolve()
	assert_true(RunState.won)

func test_resolve_sets_won_false_when_power_at_or_below_difficulty() -> void:
	# 8 members each with skill=0 → sum = 0, not > 0 (boss_difficulty stub = 0)
	# TODO(C03): replace with phase-based resolution; threshold will change
	_fill_draft_with_skill(0)
	RunState.resolve()
	assert_false(RunState.won)

func test_resolve_guards_incomplete_draft() -> void:
	# Draft is empty — resolve() should be a no-op
	DraftState.reset()
	RunState.resolve()
	assert_false(RunState.is_resolved)

func test_resolve_emits_signal() -> void:
	_fill_draft_winning()
	watch_signals(RunState)
	RunState.resolve()
	assert_signal_emitted_with_parameters(RunState, "attempt_resolved", [true])

func test_reset_clears_all_state() -> void:
	_fill_draft_winning()
	RunState.resolve()
	RunState.reset()
	assert_eq(RunState.guild_power, 0)
	assert_eq(RunState.boss_difficulty, 0)
	assert_false(RunState.won)
	assert_false(RunState.is_resolved)

func test_reset_cascades_to_draft_state() -> void:
	_fill_draft_winning()
	RunState.resolve()
	RunState.reset()
	assert_eq(DraftState.selected_members.size(), 0)

func test_get_boss_name_returns_correct_name() -> void:
	assert_eq(RunState.get_boss_name(), "Moloch the Unbound")
