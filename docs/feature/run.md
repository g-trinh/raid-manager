# Component: Run

The top-level structure of a single game session.

## Flow

Draft -> [Boss Attempt](attempt.md) -> [Outcome](outcome.md) -> Spoils -> [Camp](camp.md) -> Boss Choice -> next attempt

1. Player drafts 8 [members](member.md) from the hardcoded roster
2. Player reviews the 3 visible phases of the active [boss](boss.md)
3. The [attempt](attempt.md) resolves automatically across 3 phases
4. The [outcome](outcome.md) is determined from the number of successful phases
5. Run ends immediately (no retries)

## Rules

- There is exactly 1 attempt per run
- No state persists between runs
- The single boss attempt is fully visible before resolution, but fully automatic during resolution
