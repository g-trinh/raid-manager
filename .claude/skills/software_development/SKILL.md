---
description: General software development organization
---

## Development process
1. In the .claude/features/{featureName} folder, read the following files :
- architecture.md : architecture design, decisions, goals and non goals
- breakdown.md : summary of the target needs and list of all tasks

2. Select only the tasks that correspond to your team
3. Implement the code
4. Commit the generated code

## Commit rules

### Template
`type(stack): my message`

### Task types

- feature
- fix
- chore

### Stacks

- backend
- engine
- logic
- infra

## Additional rules

- Never leave your changes uncommited
- Once all changes are verified, commit your changes using the commit rules
