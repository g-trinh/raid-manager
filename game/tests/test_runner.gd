extends Node

const TestGameDataScript = preload("res://tests/test_game_data.gd")
const TestDraftStateScript = preload("res://tests/test_draft_state.gd")

var _pass := 0
var _fail := 0

func _ready() -> void:
	_run_suite(TestGameDataScript.new())
	_run_suite(TestDraftStateScript.new())
	print("\n=== Results: %d passed, %d failed ===" % [_pass, _fail])
	get_tree().quit(1 if _fail > 0 else 0)

func _run_suite(suite: Node) -> void:
	suite._runner = self
	add_child(suite)
	var methods: Array = []
	for m in suite.get_method_list():
		if m["name"].begins_with("test_"):
			methods.append(m["name"])
	methods.sort()
	print("\n--- %s ---" % suite.get_class())
	for method in methods:
		suite.call(method)
	suite.queue_free()

func pass_test(name: String) -> void:
	_pass += 1
	print("  PASS  %s" % name)

func fail_test(name: String, msg: String) -> void:
	_fail += 1
	print("  FAIL  %s — %s" % [name, msg])
