# Component: Outcome

The end state of a run.

## States

| State | Condition                          | Description           |
|-------|------------------------------------|-----------------------|
| Win   | guild_power > boss.difficulty      | Boss defeated, run complete |
| Lose  | guild_power <= boss.difficulty     | Guild wiped, run over |

## Rules

- The run ends immediately on outcome — no continuation
- Both states display a result screen with the final score (guild_power vs difficulty)
