# GameData — autoload singleton
# Do NOT add class_name here: GoDot autoloads must not declare class_name
# to avoid singleton conflicts.

var member_pool: Array[MemberData] = []
var boss: BossData = null

func _ready() -> void:
	_init_member_pool()
	_init_boss()

func _init_member_pool() -> void:
	# Tanks — pool has 3, draft caps at 2
	member_pool.append(MemberData.create("Gorvak",    Role.Type.TANK,   8))
	member_pool.append(MemberData.create("Shieldara", Role.Type.TANK,   6))
	member_pool.append(MemberData.create("Bruthan",   Role.Type.TANK,   7))

	# Healers — pool has 3, draft caps at 2
	member_pool.append(MemberData.create("Lumina",    Role.Type.HEALER, 7))
	member_pool.append(MemberData.create("Patchwick", Role.Type.HEALER, 5))
	member_pool.append(MemberData.create("Serenova",  Role.Type.HEALER, 9))

	# DPS — pool has 5, draft caps at 4
	member_pool.append(MemberData.create("Razorfang", Role.Type.DPS,    8))
	member_pool.append(MemberData.create("Blitzclaw", Role.Type.DPS,    6))
	member_pool.append(MemberData.create("Vexara",    Role.Type.DPS,    10))
	member_pool.append(MemberData.create("Skarn",     Role.Type.DPS,    4))
	member_pool.append(MemberData.create("Duskblade", Role.Type.DPS,    3))

func _init_boss() -> void:
	boss = BossData.create("Moloch the Unbound", 35)

# --- Query helpers ---

func get_members_by_role(role: Role.Type) -> Array[MemberData]:
	var result: Array[MemberData] = []
	for member in member_pool:
		if member.role == role:
			result.append(member)
	return result
