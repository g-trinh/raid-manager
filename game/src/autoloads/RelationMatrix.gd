extends Node

var _data: Dictionary = {}

func set_relation(id_a: int, id_b: int, value: int) -> void:
    value = clampi(value, 0, 100)
    _ensure(id_a)
    _ensure(id_b)
    _data[id_a][id_b] = value
    _data[id_b][id_a] = value

func get_relation(id_a: int, id_b: int) -> int:
    if _data.has(id_a) and _data[id_a].has(id_b):
        return _data[id_a][id_b]
    return 0

func get_all_for(id: int) -> Dictionary:
    return _data.get(id, {})

func clear() -> void:
    _data.clear()

func _ensure(id: int) -> void:
    if not _data.has(id):
        _data[id] = {}
