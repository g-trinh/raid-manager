extends Node

const NAMES: Array[String] = [
    "Kévin",
    "Sébastien",
    "Patricia",
    "Muriel",
    "Légolas",
    "Thorîn",
    "Darkblade",
    "Gandalf",
    "Raistlin",
    "Aragorn",
    "Jean-Michel",
    "Critmaster",
    "Liliane",
    "Shadowfang",
    "Nounours",
    "Dédé",
    "Xaéris",
    "Bloodrayne",
    "Fernand",
    "Chrystal",
    "Zork",
    "Yolocaster",
    "Mamie",
    "Vortexor",
    "Bernard",
    "Thrall",
    "Noobslayer",
    "Gégé",
    "Arthas",
    "Sylvanas",
]


func generate(id: int, existing_members: Array) -> Member:
    var member := Member.new()
    member.id = id
    member.member_name = NAMES[randi() % NAMES.size()]
    member.role = randi() % (GameEnums.Role.size())
    member.skill = randi_range(30, 70)
    member.fiabilite = randi_range(40, 80)
    member.moral = randi_range(50, 80)
    member.experience = randi_range(0, 20)

    var positive_pool: Array = GameEnums.POSITIVE_TRAITS.duplicate()
    positive_pool.shuffle()
    member.traits_positive = [positive_pool[0], positive_pool[1]]

    var negative_pool: Array = GameEnums.NEGATIVE_TRAITS.duplicate()
    member.trait_negative = negative_pool[randi() % negative_pool.size()]

    for existing in existing_members:
        RelationMatrix.set_relation(id, existing.id, randi_range(20, 80))

    return member


func generate_pool(count: int) -> Array[Member]:
    var pool: Array[Member] = []
    for i in range(1, count + 1):
        var member := generate(i, pool)
        pool.append(member)
    return pool
