# F05 — Draft Screen (Phase 0): Architecture

## Confirmed Decisions

| # | Question | Answer | Impact |
|---|---|---|---|
| Q1 | Pool size | 24 members (GUILD_SIZE × DRAW_SIZE = 8 × 3). Large enough for 8 draws of 3, none reused. | Simple linear cursor through a shuffled pool |
| Q2 | Role diversity guarantee | Pre-build a role list with minimums (≥4 TANK, ≥4 HEALER, rest DPS), shuffle it, assign roles after generation | MemberGenerator.generate() is called first, then role is overwritten — generation still sets relations correctly |
| Q3 | Skip behaviour | On skip: decrement skips_remaining, advance pool cursor, emit draw_skipped then draw_ready. Pool slot is consumed (discarded). | Pool must be large enough that 3 skips + 8 picks = 11 draws fit inside 24 members |
| Q4 | Pool exhaustion edge case | If pool runs out before GUILD_SIZE reached, emit draft_complete with partial roster | Prevents crash on edge case; UI layer handles partial roster warning |
| Q5 | State ownership | DraftSystem holds all draft state. GameState (future F18) will call start_draft() and listen to draft_complete | Clean separation between draft phase and run state machine |

---

## File Structure

```
game/
├── project.godot                          ← add DraftSystem autoload entry
└── src/
    └── autoloads/
        └── DraftSystem.gd                 ← new autoload (this feature)
```

---

## Component Contract: `DraftSystem.gd` (Autoload)

Manages Phase 0 draft. Pure state machine — no scene dependencies.

### Constants

```gdscript
const GUILD_SIZE: int = 8      # slots to fill
const MAX_SKIPS: int = 3       # total skips allowed for the whole phase
const DRAW_SIZE: int = 3       # members shown per draw
const MIN_TANKS: int = 4       # minimum Tank roles in the 24-member pool
const MIN_HEALERS: int = 4     # minimum Healer roles in the 24-member pool
const POOL_SIZE: int = GUILD_SIZE * DRAW_SIZE  # 24
```

### State Variables

```gdscript
var draw_index: int            # current draw number, starts at 0
var skips_remaining: int       # starts at MAX_SKIPS (3)
var roster: Array[Member]      # members chosen so far
var current_draw: Array[Member] # 3 members in the current draw

var _pool: Array[Member]       # full shuffled pool of 24
var _pool_cursor: int          # next unread index in _pool
```

### Signals

```gdscript
signal draw_ready(members: Array[Member])
signal member_picked(member: Member, draw_index: int)
signal draw_skipped(draw_index: int, skips_remaining: int)
signal draft_complete(roster: Array[Member])
```

### Public API

```gdscript
func start_draft() -> void
func pick_member(member: Member) -> void
func skip_draw() -> void
func can_skip() -> bool
func is_complete() -> bool
```

### Private Helpers

```gdscript
func _generate_pool() -> Array[Member]     # builds and returns 24-member pool
func _build_role_list() -> Array[int]      # builds role list with minimums
func _advance_draw() -> void               # moves cursor, sets current_draw, emits draw_ready
```

---

## Sequence Diagrams

### Happy path (pick all 8)

```
start_draft()
  → _generate_pool()        (24 members, roles assigned, shuffled)
  → _advance_draw()         (cursor 0→3, current_draw = pool[0..2])
  → emit draw_ready

pick_member(m)
  → roster.append(m)
  → emit member_picked
  → draw_index++
  → is_complete()? no
  → _advance_draw()         (cursor 3→6, ...)
  → emit draw_ready
  ... repeat 7 more times ...
  → is_complete()? yes
  → emit draft_complete
```

### Skip path

```
skip_draw()
  → can_skip()? yes
  → skips_remaining--
  → emit draw_skipped
  → draw_index++
  → _advance_draw()
  → emit draw_ready
```

### Pool exhaustion

```
pick_member(m) or skip_draw()
  → _pool_cursor >= _pool.size()
  → emit draft_complete (with partial roster)
```

---

## Role Distribution in Pool (24 members)

| Role | Count | Rationale |
|---|---|---|
| TANK | 4 | Minimum per spec — enough for any valid 8-member composition |
| HEALER | 4 | Same |
| DPS | 16 | Remaining slots |

Roles are shuffled before being assigned so position in the pool is random.

---

## No API Changes to Existing Autoloads

DraftSystem calls:
- `MemberGenerator.generate(id, pool_so_far)` — existing API, unchanged
- `RelationMatrix` is called transitively through MemberGenerator, unchanged

---

## Open Questions

None — spec fully defines the API and business rules.
