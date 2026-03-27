---
name: Subagents must use software_development skill
description: game-logic-developer, game-engine-developer, and backend-developer must invoke the software_development skill when handling coding tasks
type: feedback
---

When prompting game-logic-developer, game-engine-developer, or backend-developer agents to write code, always instruct them to use the `software_development` skill as part of their coding task.

**Why:** The user expects these subagents to go through the software_development skill for all coding work — not to skip it and write code directly.

**How to apply:** In every prompt sent to these three agent types that involves writing or modifying code, include an explicit instruction such as: "Use the software_development skill to handle this coding task."
