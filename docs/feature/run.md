# Component: Run

The top-level structure of a single game session: a gauntlet of 3 bosses,
hub-and-spoke around the [war table](camp.md).

## Flow

```
Draft → WAR TABLE ──[PULL]──→ Attempt resolution
            ↑                    ├─ wipe   → back to the table (Rest once per interval)
            │                    ├─ kill   → Spoils → table in ROAD MODE
            │                    └─ disband → run over → Draft
            │
   ROAD MODE: Scout (optional) → pick next boss
            → ROAD: Clear Wide | March Past → table, new boss, pull 1
```

- **Combat starts only from the war table** (the wipe screen's Pull Again is a
  shortcut to the same explicit pull).
- The boss is locked once engaged; the road fork only opens after a kill.
  Mastery resets on the new boss (new mechanics).
- Leaving the Spoils screen auto-stows unresolved items in the satchel.

## Rules

- 3 bosses per run; killing the third wins the run
- Retries are unbounded by count but bounded by [morale](morale/todo.md) —
  every wipe pushes someone closer to gquitting, and one gquit ends the run
- No state persists between runs
