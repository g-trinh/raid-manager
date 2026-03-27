extends Node

enum Role { TANK, HEALER, DPS }

enum Tier { NORMAL = 1, HEROIC = 2, MYTHIC = 3 }

const BOSSES_PER_TIER: int = 5
const TIER_COUNT: int = 3
const MAX_ATTEMPTS_PER_BOSS: int = 5

enum MemberTrait {
    # Positive
    ENTHOUSIASTE,
    LOYAL,
    DRAMA_QUEEN,
    MAIN_FROIDE,
    LOOTER,
    MENTOR,
    # Negative
    AFK_FREQUENT,
}

const TRAIT_NAMES: Dictionary = {
    MemberTrait.ENTHOUSIASTE: "Enthousiaste",
    MemberTrait.LOYAL:        "Loyal",
    MemberTrait.DRAMA_QUEEN:  "Drama Queen",
    MemberTrait.MAIN_FROIDE:  "Main Froide",
    MemberTrait.LOOTER:       "Looter",
    MemberTrait.MENTOR:       "Mentor",
    MemberTrait.AFK_FREQUENT: "AFK Fréquent",
}

const POSITIVE_TRAITS: Array = [
    MemberTrait.ENTHOUSIASTE,
    MemberTrait.LOYAL,
    MemberTrait.DRAMA_QUEEN,
    MemberTrait.MAIN_FROIDE,
    MemberTrait.LOOTER,
    MemberTrait.MENTOR,
]

const NEGATIVE_TRAITS: Array = [
    MemberTrait.AFK_FREQUENT,
]

func trait_name(trait_id: int) -> String:
    return TRAIT_NAMES.get(trait_id, "Unknown")

func is_positive_trait(trait_id: int) -> bool:
    return trait_id in POSITIVE_TRAITS
