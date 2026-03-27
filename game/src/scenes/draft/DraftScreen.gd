extends Control

# Header labels
@onready var draw_label: Label = $VBoxContainer/HeaderHBox/DrawLabel
@onready var skip_label: Label = $VBoxContainer/HeaderHBox/SkipLabel

# Card container
@onready var cards_container: HBoxContainer = $VBoxContainer/CardsContainer

# Skip button
@onready var skip_button: Button = $VBoxContainer/SkipButton

# Roster bar
@onready var roster_bar: HBoxContainer = $VBoxContainer/RosterBar

# Tracks the current draw members in order (index 0, 1, 2)
var _current_members: Array[Member] = []

# Roster slot labels (8 slots)
var _roster_slots: Array[Label] = []

const ROLE_NAMES: Dictionary = {
	0: "Tank",
	1: "Soigneur",
	2: "DPS",
}

const SKIP_FILLED: String = "●"
const SKIP_EMPTY: String = "○"


func _ready() -> void:
	_build_roster_slots()
	_connect_signals()
	DraftSystem.start_draft()


func _build_roster_slots() -> void:
	for i in range(DraftSystem.GUILD_SIZE):
		var slot := Label.new()
		slot.text = "---"
		slot.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		slot.custom_minimum_size = Vector2(80, 0)
		roster_bar.add_child(slot)
		_roster_slots.append(slot)


func _connect_signals() -> void:
	DraftSystem.draw_ready.connect(_on_draw_ready)
	DraftSystem.member_picked.connect(_on_member_picked)
	DraftSystem.draw_skipped.connect(_on_draw_skipped)
	DraftSystem.draft_complete.connect(_on_draft_complete)
	skip_button.pressed.connect(_on_skip_pressed)


# --- Signal handlers ---

func _on_draw_ready(members: Array[Member]) -> void:
	_current_members = members
	_refresh_cards(members)
	_refresh_header()
	_refresh_skip_button()


func _on_member_picked(_member: Member, _draw_index: int) -> void:
	_refresh_roster()
	_refresh_header()


func _on_draw_skipped(_draw_index: int, _skips_remaining: int) -> void:
	_refresh_header()
	_refresh_skip_button()


func _on_draft_complete(roster: Array[Member]) -> void:
	print("Draft complete! Roster: " + str(roster.size()) + " members")


func _on_skip_pressed() -> void:
	if DraftSystem.can_skip():
		DraftSystem.skip_draw()


# --- UI refresh helpers ---

func _refresh_header() -> void:
	var draw_number: int = DraftSystem.draw_index + 1
	draw_label.text = "DRAFT — Tirage %d/%d" % [draw_number, DraftSystem.GUILD_SIZE]

	var skips_remaining: int = DraftSystem.skips_remaining
	var skips_total: int = DraftSystem.MAX_SKIPS
	var skip_str: String = ""
	for i in range(skips_total):
		if i < skips_remaining:
			skip_str += SKIP_FILLED
		else:
			skip_str += SKIP_EMPTY
	skip_label.text = "Skips: " + skip_str


func _refresh_skip_button() -> void:
	skip_button.disabled = not DraftSystem.can_skip()


func _refresh_cards(members: Array[Member]) -> void:
	var cards := cards_container.get_children()
	for i in range(cards.size()):
		if i < members.size():
			_fill_card(cards[i] as PanelContainer, members[i], i)
		else:
			_clear_card(cards[i] as PanelContainer)


func _fill_card(card: PanelContainer, member: Member, index: int) -> void:
	var vbox := card.get_child(0) as VBoxContainer

	(vbox.get_node("NameLabel") as Label).text = member.member_name
	(vbox.get_node("RoleLabel") as Label).text = ROLE_NAMES.get(member.role, "?")
	(vbox.get_node("SkillLabel") as Label).text = "Skill: %d" % member.skill
	(vbox.get_node("MoralLabel") as Label).text = "Moral: %d" % member.moral

	if member.traits_positive.size() > 0:
		(vbox.get_node("Trait1Label") as Label).text = "[+] " + GameEnums.trait_name(member.traits_positive[0])
	else:
		(vbox.get_node("Trait1Label") as Label).text = ""

	if member.traits_positive.size() > 1:
		(vbox.get_node("Trait2Label") as Label).text = "[+] " + GameEnums.trait_name(member.traits_positive[1])
	else:
		(vbox.get_node("Trait2Label") as Label).text = ""

	(vbox.get_node("NegTraitLabel") as Label).text = "[-] " + GameEnums.trait_name(member.trait_negative)

	var recruit_button := vbox.get_node("RecruitButton") as Button
	recruit_button.disabled = false

	# Disconnect all existing connections on pressed before reconnecting
	var connections := recruit_button.pressed.get_connections()
	for conn in connections:
		recruit_button.pressed.disconnect(conn["callable"])

	recruit_button.pressed.connect(_on_recruit_pressed.bind(index))


func _clear_card(card: PanelContainer) -> void:
	var vbox := card.get_child(0) as VBoxContainer
	(vbox.get_node("NameLabel") as Label).text = ""
	(vbox.get_node("RoleLabel") as Label).text = ""
	(vbox.get_node("SkillLabel") as Label).text = ""
	(vbox.get_node("MoralLabel") as Label).text = ""
	(vbox.get_node("Trait1Label") as Label).text = ""
	(vbox.get_node("Trait2Label") as Label).text = ""
	(vbox.get_node("NegTraitLabel") as Label).text = ""

	var recruit_button := vbox.get_node("RecruitButton") as Button
	recruit_button.disabled = true

	var connections := recruit_button.pressed.get_connections()
	for conn in connections:
		recruit_button.pressed.disconnect(conn["callable"])


func _on_recruit_pressed(index: int) -> void:
	if index < _current_members.size():
		DraftSystem.pick_member(_current_members[index])


func _refresh_roster() -> void:
	var roster := DraftSystem.roster
	for i in range(_roster_slots.size()):
		if i < roster.size():
			_roster_slots[i].text = roster[i].member_name
		else:
			_roster_slots[i].text = "---"
