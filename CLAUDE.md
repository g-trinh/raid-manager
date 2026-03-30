# Raid manager roguelike

## Project

[See README.md](README.md)

## Workflow Orchestration

### 1. Plan Mode Default
– Enter plan mode for ANY non-trivial task (3+ steps)
– If something goes sideways, STOP and re-plan immediately
– Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
– Use subagents liberally to keep main context window clean
– One task per subagent for focused execution
– For complex problems, throw more compute at it
- Always use backend-developer, game-engine-developer or game-logic-developer subagents for all coding tasks. Pick that is the most relevent for the task.
- Once all changes are verified, commit your changes using the commit rules

### 3. Self-Improvement Loop
– After ANY correction: update tasks/lessons.md
– Write rules that prevent the same mistake
– Ruthlessly iterate until mistake rate drops

### 4. Verification Before Done
– Never mark a task complete without proving it works
– Ask yourself: “Would a staff engineer approve this?”
– Run tests, check logs, demonstrate correctness
- Run the GoDot game

### 5. Demand Elegance (Balanced)
– Pause and ask “is there a more elegant way?”
– Skip this for simple fixes — don’t over-engineer

### 6. Autonomous Bug Fixing
– When given a bug report: just fix it
– Zero context switching required from the user

## Task Management
1. Plan First: Write plan to tasks/todo.md
2. Verify Plan: Check in before starting
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to todo.md
6. Capture Lessons: Update lessons.md after corrections

## Core Principles
– Simplicity First: Make every change as simple as possible
– No Laziness: Find root causes. No temporary fixes
– Minimal Impact: Only touch what’s necessary

## Team organization
1. Game designer: polishes the feature
2. Product designer: produces mockups and answers UX problems
3. Architect: designs software architecture
4. Backend developer: implements backend code
5. Game engine developer: implements screens imagined by the product designer
6. Game logic developer: implements game logic