# Component: Outcome

The end state of a run.

## States

| State          | Condition             | Description |
|----------------|-----------------------|-------------|
| Full Victory   | 3 phase successes     | Boss defeated with full success |
| Narrow Victory | 2 phase successes     | Boss defeated with partial success |
| Defeat         | 0 or 1 phase success  | Guild wiped, run over |

## Rules

- The run ends immediately on outcome — no continuation
- The result screen displays the outcome and the number of successful phases
- Narrow Victory should later grant reduced rewards compared to Full Victory
- The exact reward tradeoff is intentionally left undefined until reward and progression systems are designed
