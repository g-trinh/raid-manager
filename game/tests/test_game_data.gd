class_name TestGameData extends Node

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

# --- MemberData ---

func test_member_data_create_sets_name() -> void:
	_current_test = "test_member_data_create_sets_name"
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.member_name, "Gorvak")

func test_member_data_create_sets_role() -> void:
	_current_test = "test_member_data_create_sets_role"
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.role, Role.Type.TANK)

func test_member_data_create_sets_skill() -> void:
	_current_test = "test_member_data_create_sets_skill"
	var m := MemberData.create("Gorvak", Role.Type.TANK, 8)
	assert_eq(m.skill, 8)

# --- BossData ---

func test_boss_data_create_sets_name() -> void:
	_current_test = "test_boss_data_create_sets_name"
	var b := BossData.create("Moloch the Unbound", 35)
	assert_eq(b.boss_name, "Moloch the Unbound")

func test_boss_data_create_sets_difficulty() -> void:
	_current_test = "test_boss_data_create_sets_difficulty"
	var b := BossData.create("Moloch the Unbound", 35)
	assert_eq(b.difficulty, 35)

# --- GameData pool ---

func test_pool_has_more_than_2_tanks() -> void:
	_current_test = "test_pool_has_more_than_2_tanks"
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	assert_true(tanks.size() > 2, "expected more than 2 tanks, got %d" % tanks.size())

func test_pool_has_more_than_2_healers() -> void:
	_current_test = "test_pool_has_more_than_2_healers"
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	assert_true(healers.size() > 2, "expected more than 2 healers, got %d" % healers.size())

func test_pool_has_more_than_4_dps() -> void:
	_current_test = "test_pool_has_more_than_4_dps"
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	assert_true(dps.size() > 4, "expected more than 4 DPS, got %d" % dps.size())

func test_pool_total_size() -> void:
	_current_test = "test_pool_total_size"
	assert_eq(GameData.member_pool.size(), 11)

func test_pool_member_names_unique() -> void:
	_current_test = "test_pool_member_names_unique"
	var names: Array = []
	for member in GameData.member_pool:
		names.append(member.member_name)
	var unique_names := {}
	for n in names:
		unique_names[n] = true
	assert_eq(unique_names.size(), names.size())

func test_pool_skills_positive() -> void:
	_current_test = "test_pool_skills_positive"
	for member in GameData.member_pool:
		if member.skill <= 0:
			_runner.fail_test(_current_test, "member %s has non-positive skill %d" % [member.member_name, member.skill])
			return
	_runner.pass_test(_current_test)

# --- GameData boss ---

func test_boss_is_not_null() -> void:
	_current_test = "test_boss_is_not_null"
	assert_true(GameData.boss != null, "boss should not be null")

func test_boss_name() -> void:
	_current_test = "test_boss_name"
	assert_eq(GameData.boss.boss_name, "Moloch the Unbound")

func test_boss_difficulty() -> void:
	_current_test = "test_boss_difficulty"
	assert_eq(GameData.boss.difficulty, 35)

# --- get_members_by_role ---

func test_get_members_by_role_tank() -> void:
	_current_test = "test_get_members_by_role_tank"
	var tanks := GameData.get_members_by_role(Role.Type.TANK)
	for member in tanks:
		if member.role != Role.Type.TANK:
			_runner.fail_test(_current_test, "non-tank returned by get_members_by_role(TANK)")
			return
	assert_true(tanks.size() == 3, "expected 3 tanks, got %d" % tanks.size())

func test_get_members_by_role_healer() -> void:
	_current_test = "test_get_members_by_role_healer"
	var healers := GameData.get_members_by_role(Role.Type.HEALER)
	for member in healers:
		if member.role != Role.Type.HEALER:
			_runner.fail_test(_current_test, "non-healer returned by get_members_by_role(HEALER)")
			return
	assert_true(healers.size() == 3, "expected 3 healers, got %d" % healers.size())

func test_get_members_by_role_dps() -> void:
	_current_test = "test_get_members_by_role_dps"
	var dps := GameData.get_members_by_role(Role.Type.DPS)
	for member in dps:
		if member.role != Role.Type.DPS:
			_runner.fail_test(_current_test, "non-DPS returned by get_members_by_role(DPS)")
			return
	assert_true(dps.size() == 5, "expected 5 DPS, got %d" % dps.size())
