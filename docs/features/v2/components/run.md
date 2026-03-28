# Component: Run

The top-level structure of a single game session.

## Flow

Draft → [Boss Attempt](attempt.md) → [Outcome](outcome.md)

1. Player drafts 8 [members](member.md) from the hardcoded roster
2. Player faces 1 hardcoded [boss](boss.md)
3. The [attempt](attempt.md) resolves automatically → Win or Lose
4. Run ends immediately (no retries)

## Rules

- There is exactly 1 attempt per run
- No state persists between runs
