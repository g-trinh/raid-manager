extends GutTest

# --- MemberData ---

func test_member_data_create_sets_name() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 38, 62)
	assert_eq(m.member_name, "Gorvak")

func test_member_data_create_sets_role() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 38, 62)
	assert_eq(m.role, Role.Type.TANK)

func test_member_data_create_sets_skill() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 38, 62)
	assert_eq(m.skill, 38)

func test_member_data_create_sets_liability() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 38, 62)
	assert_eq(m.liability, 62)

# --- BossData ---

func test_boss_data_create_sets_name() -> void:
	var b := BossData.create("Moloch the Unbound", [])
	assert_eq(b.boss_name, "Moloch the Unbound")

func test_boss_data_create_sets_phases() -> void:
	var phases: Array[BossPhaseData] = [
		BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65),
	]
	var b := BossData.create("Test Boss", phases)
	assert_eq(b.phases.size(), 1)

# --- BossPhaseData ---

func test_boss_phase_data_create_sets_dps_weight() -> void:
	var p := BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65)
	assert_eq(p.dps_weight, 3)

func test_boss_phase_data_create_sets_tank_weight() -> void:
	var p := BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65)
	assert_eq(p.tank_weight, 1)

func test_boss_phase_data_create_sets_heal_weight() -> void:
	var p := BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65)
	assert_eq(p.heal_weight, 1)

func test_boss_phase_data_create_sets_phase_type_skill_heavy() -> void:
	var p := BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65)
	assert_eq(p.phase_type, BossPhaseData.PhaseType.SKILL_HEAVY)

func test_boss_phase_data_create_sets_phase_type_liability_heavy() -> void:
	var p := BossPhaseData.create(1, 3, 3, BossPhaseData.PhaseType.LIABILITY_HEAVY, 70)
	assert_eq(p.phase_type, BossPhaseData.PhaseType.LIABILITY_HEAVY)

func test_boss_phase_data_create_sets_phase_target() -> void:
	var p := BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY, 65)
	assert_eq(p.phase_target, 65)

# --- GameData pool ---

func test_pool_has_more_than_2_tanks() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	assert_true(tanks.size() > 2, "expected more than 2 tanks, got %d" % tanks.size())

func test_pool_has_more_than_2_healers() -> void:
	var healers := GameData.get_members_by_role(Role.Type.HEAL)
	assert_true(healers.size() > 2, "expected more than 2 healers, got %d" % healers.size())

func test_pool_has_more_than_4_dps() -> void:
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	assert_true(dps.size() > 4, "expected more than 4 DPS, got %d" % dps.size())

func test_pool_total_size() -> void:
	assert_eq(GameData.member_pool.size(), 11)

func test_pool_member_names_unique() -> void:
	var names: Array = []
	for member in GameData.member_pool:
		names.append(member.member_name)
	var unique_names := {}
	for n in names:
		unique_names[n] = true
	assert_eq(unique_names.size(), names.size())

func test_pool_skills_positive() -> void:
	for member in GameData.member_pool:
		assert_true(member.skill > 0, "member %s has non-positive skill %d" % [member.member_name, member.skill])

# --- GameData boss ---

func test_boss_is_not_null() -> void:
	assert_not_null(GameData.boss)

func test_boss_name() -> void:
	assert_eq(GameData.boss.boss_name, "Moloch the Unbound")

func test_boss_has_3_phases() -> void:
	assert_not_null(GameData.boss.phases)
	assert_eq(GameData.boss.phases.size(), 3)

func test_boss_phase_1_type_is_skill_heavy() -> void:
	assert_eq(GameData.boss.phases[0].phase_type, BossPhaseData.PhaseType.SKILL_HEAVY)

func test_boss_phase_2_type_is_liability_heavy() -> void:
	assert_eq(GameData.boss.phases[1].phase_type, BossPhaseData.PhaseType.LIABILITY_HEAVY)

func test_boss_phase_3_type_is_skill_heavy() -> void:
	assert_eq(GameData.boss.phases[2].phase_type, BossPhaseData.PhaseType.SKILL_HEAVY)

func test_boss_phase_1_dps_weight() -> void:
	assert_eq(GameData.boss.phases[0].dps_weight, 3)

func test_boss_phase_2_tank_weight() -> void:
	assert_eq(GameData.boss.phases[1].tank_weight, 3)

func test_boss_phase_3_weights_equal() -> void:
	var p := GameData.boss.phases[2]
	assert_eq(p.dps_weight, 2)
	assert_eq(p.tank_weight, 2)
	assert_eq(p.heal_weight, 2)

# --- get_members_by_role ---

func test_get_members_by_role_tank() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	assert_eq(tanks.size(), 3)
	for member in tanks:
		assert_eq(member.role, Role.Type.TANK)

func test_get_members_by_role_healer() -> void:
	var healers := GameData.get_members_by_role(Role.Type.HEAL)
	assert_eq(healers.size(), 3)
	for member in healers:
		assert_eq(member.role, Role.Type.HEAL)

func test_get_members_by_role_dps() -> void:
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	assert_eq(dps.size(), 5)
	for member in dps:
		assert_eq(member.role, Role.Type.DPS)
