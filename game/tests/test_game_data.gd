extends GutTest

# --- MemberData ---

func test_member_data_create_sets_name() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.member_name, "Gorvak")

func test_member_data_create_sets_role() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.role, Role.Type.TANK)

func test_member_data_create_sets_skill() -> void:
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.skill, 8)

# --- BossData ---

func test_boss_data_create_sets_name() -> void:
	var b := BossData.create("Moloch the Unbound", 35)
	assert_eq(b.boss_name, "Moloch the Unbound")

func test_boss_data_create_sets_difficulty() -> void:
	var b := BossData.create("Moloch the Unbound", 35)
	assert_eq(b.difficulty, 35)

# --- GameData pool ---

func test_pool_has_more_than_2_tanks() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	assert_true(tanks.size() > 2, "expected more than 2 tanks, got %d" % tanks.size())

func test_pool_has_more_than_2_healers() -> void:
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
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

func test_boss_difficulty() -> void:
	assert_eq(GameData.boss.difficulty, 35)

# --- get_members_by_role ---

func test_get_members_by_role_tank() -> void:
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	assert_eq(tanks.size(), 3)
	for member in tanks:
		assert_eq(member.role, Role.Type.TANK)

func test_get_members_by_role_healer() -> void:
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	assert_eq(healers.size(), 3)
	for member in healers:
		assert_eq(member.role, Role.Type.HEALER)

func test_get_members_by_role_dps() -> void:
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	assert_eq(dps.size(), 5)
	for member in dps:
		assert_eq(member.role, Role.Type.DPS)
