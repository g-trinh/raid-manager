# GameData — autoload singleton
# Do NOT add class_name here: GoDot autoloads must not declare class_name
# to avoid singleton conflicts.
extends Node

var member_pool: Array[MemberData] = []
var boss: BossData = null

func _ready() -> void:
	_init_member_pool()
	_init_boss()

func _init_member_pool() -> void:
	# Tanks — pool has 3, draft caps at 2
	member_pool.append(MemberData.create("Gorvak",    Role.Type.TANK, 38, 62))
	member_pool.append(MemberData.create("Shieldara", Role.Type.TANK, 81, 19))
	member_pool.append(MemberData.create("Bruthan",   Role.Type.TANK, 55, 45))

	# Healers — pool has 3, draft caps at 2
	member_pool.append(MemberData.create("Lumina",    Role.Type.HEAL, 12, 88))
	member_pool.append(MemberData.create("Patchwick", Role.Type.HEAL, 48, 52))
	member_pool.append(MemberData.create("Serenova",  Role.Type.HEAL, 91,  9))

	# DPS — pool has 5, draft caps at 4
	member_pool.append(MemberData.create("Razorfang", Role.Type.DPS, 80, 20))
	member_pool.append(MemberData.create("Blitzclaw", Role.Type.DPS, 60, 40))
	member_pool.append(MemberData.create("Vexara",    Role.Type.DPS, 95,  5))
	member_pool.append(MemberData.create("Skarn",     Role.Type.DPS, 28, 72))
	member_pool.append(MemberData.create("Duskblade", Role.Type.DPS, 15, 85))

func _init_boss() -> void:
	var phases: Array[BossPhaseData] = [
		BossPhaseData.create(3, 1, 1, BossPhaseData.PhaseType.SKILL_HEAVY,     65),
		BossPhaseData.create(1, 3, 3, BossPhaseData.PhaseType.LIABILITY_HEAVY, 70),
		BossPhaseData.create(2, 2, 2, BossPhaseData.PhaseType.SKILL_HEAVY,     60),
	]
	boss = BossData.create("Moloch the Unbound", phases)

# --- Query helpers ---

func get_members_by_role(role: Role.Type) -> Array[MemberData]:
	var result: Array[MemberData] = []
	for member in member_pool:
		if member.role == role:
			result.append(member)
	return result
