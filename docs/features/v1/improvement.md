# Specification Improvements Backlog

Proposals surfaced during architecture sessions. Each item includes expected engineering impact and tradeoffs.

---

## F01 — Member Data Model

| # | Proposal | Engineering Impact | Tradeoff |
|---|---|---|---|
| F01-I1 | Add `experience: int = 0` to Member now | Near-zero cost; avoids a future breaking change to the Resource schema when F09 needs it | Slight confusion if the field is visible but always 0 |
| F01-I2 | Add `equipment_points: int = 0` to Member now | F09 (Loot) will need it; adding it later forces touching Member again | Minor field bloat on F01 |
| F01-I3 | Add `const GUILD_SIZE = 8` to `GameEnums` | Centralises the hardcoded guild size used by RelationMatrix and generation logic | Premature if size could change in design |
