# Component: Run

The top-level structure of a single game session: a gauntlet of 3 bosses.

## Flow

Draft -> [Boss Attempt](attempt.md) -> [Outcome](outcome.md) -> ...

- **Kill** → Spoils -> [Camp](camp.md) -> Boss Choice -> next boss (mastery resets — new mechanics)
- **Wipe** → Pull Again (immediate retry) or Retreat to Camp (one action, Scout excluded, then back to the same boss). The boss is locked once engaged.
- **Disband** (a member gquits at morale 0) → run over

## Rules

- 3 bosses per run; killing the third wins the run
- Retries are unbounded by count but bounded by [morale](morale/todo.md) — every wipe pushes someone closer to gquitting, and one gquit ends the run
- No state persists between runs
