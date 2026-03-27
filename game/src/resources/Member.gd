class_name Member
extends Resource

var id: int
var member_name: String
var role: int              # GameEnums.Role value

var skill: int             # 0–100
var fiabilite: int         # 0–100
var moral: int             # 0–100

var traits_positive: Array[int]   # exactly 2 values from GameEnums.MemberTrait
var trait_negative: int           # exactly 1 value from GameEnums.MemberTrait
