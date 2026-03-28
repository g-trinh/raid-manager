# Component: Boss

The enemy the guild faces. All bosses are hardcoded — none are generated at runtime.

## Properties

| Property   | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| Name       | string | Display name                                     |
| Difficulty | int    | Threshold the guild's total Skill must exceed to win |

## Notes

- For the MVP there is 1 active boss per run
- The boss is selected (or fixed) before the attempt — not chosen by the player in MVP
