---
ID: C03
Description: Attempt resolution, outcome screen, and run flow orchestration
Dependencies: C01, C02
---

## Goal

Resolve the boss attempt automatically, display the Win or Lose outcome screen, and wire the complete run flow (Draft → Attempt → Outcome). A "Play Again" action restarts the run from scratch.

## Feature Context

Once the player confirms their team in the draft, the attempt resolves instantly with no player input. A result screen then shows whether the guild won or lost, with the final scores, and offers a way to play again.

## Resolution Formula

```
guild_power = sum of Skill across all 8 drafted members
win          = guild_power > boss.difficulty
```

## Outcome States

| State | Condition                        | Description                              |
|-------|----------------------------------|------------------------------------------|
| Win   | guild_power > boss.difficulty    | Boss defeated — run complete             |
| Lose  | guild_power <= boss.difficulty   | Guild wiped — run over                   |

## What the Player Sees on the Outcome Screen

- Win or Lose state (clearly communicated)
- guild_power value
- boss.difficulty value
- "Play Again" action (restarts a fresh run — no state carries over)

## Run Flow

```
Draft (C02) → Attempt resolution → Outcome screen → [Play Again] → Draft
```

- No player input during resolution
- Exactly 1 attempt per run — no retries
- No state persists between runs

## Rules & Constraints

- Resolution is fully automatic — no animation or delay is required for MVP
- Both Win and Lose states use the same outcome screen layout
- "Play Again" resets all run state (drafted members, attempt result)

## Agents Involved

- **Product designer**: design the outcome screen (Win/Lose display, score readout, Play Again action)
- **Architect**: design the run state machine (scene transitions: Draft → Outcome, Play Again reset)
- **Game engine developer**: implement the outcome screen scene and Play Again navigation in GoDot
- **Game logic developer**: implement attempt resolution logic and run reset in GDScript
