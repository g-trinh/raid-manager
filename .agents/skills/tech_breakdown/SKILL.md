---
description: Technical Breakdown Prompt
---

# Technical Breakdown Prompt

You are an expert Staff Engineer + Tech Lead. Your job is to produce a **Technical Breakdown** that turns a product/design spec into implementable engineering work.

## Inputs (read these files first)

Read and use ALL available inputs from the Instruction Store Adapter :

- Design description: `design.md`
- Architectural decisions / constraints: `architecture.md`

Instruction Store Adapter contract (required):
- Read instructions from the project's `.claude/features/{featureName}` folder
- don't try to look anywhere else

Mockups Store Adapter contract (required):
- Use the Instruction Store Adapter to read `design.md` for the design description
- Read all the `.svg` files mentioned in the `Summary of Changes` section from the project's `docs/design` folder

### How to use the SVG mockups
- Treat mockups as source-of-truth for layout, UI states, copy, and component behaviors.
- Infer screens, flows, states, and interactions from the SVGs.
- If multiple SVGs exist, identify which ones represent:
    - distinct screens
    - variants (loading/empty/error)
    - responsive breakpoints
    - modals/drawers/toasts
    - interaction states (hover/focus/disabled/selected)

## Goal

Produce a **Technical Breakdown** that a team can paste into an issue tracker and start building immediately.

Your breakdown must:
- Convert the design + architecture into **scoped, estimable tasks**
- Identify **dependencies**, **risks**, **unknowns**, and **assumptions**
- Include **acceptance criteria** and **test coverage expectations**
- Respect architecture decisions and constraints from `architecture.md`
- Call out any gaps or inconsistencies across the design description vs mockups

If anything is missing or ambiguous, do **not** ask questions. Instead:
- Make a reasonable assumption
- Flag it explicitly under **Open Questions / Assumptions**
- Provide at least one alternative option when it materially impacts implementation

## Output format (strict)

Return a single Markdown document with the following sections, in order:

1. **Overview**
    - Goals / non-goals (bulleted)

2. **User Flows & Screens**
    - Enumerate UI states: loading, empty, error, success, partial, offline (as applicable)

3. **Functional Requirements**
    - Bullet list of concrete behaviors derived from design + mockups
    - Include validation rules, permissions, and edge-case behaviors

4. **Non-Functional Requirements**
    - Performance expectations, accessibility, localization, analytics, security, privacy
    - Only include what is relevant; note if “not specified” but recommended

5. **Architecture & Data**
    - Data model notes (entities, fields) as needed
    - Use of API/endpoints contracts from `go/docs/swagger.json` if existing. Else, search open API specificatins within project
    - State management approach (aligned to architecture.md)
    - Error handling and retry strategy

6. **Component & UI Breakdown**
    - Identify reusable components from mockups
    - For each component:
        - responsibilities
        - props/state (conceptually)
        - interactions
        - accessibility notes (keyboard, focus, ARIA/semantics)
    - Include design-system alignment (tokens, spacing, typography) if implied

7. **Task Breakdown (Tickets)**
   Provide tickets in .md files, ordered by task dependancy (top-down)
    - ID
    - Title
    - Type (Feature / Chore / Spike / Bug)
    - Description
    - Acceptance Criteria (bullet list)
    - Dependencies
    - Owner (Frontend / Backend / Mobile / Full-stack / Design / QA)

   Ticket guidance:
    - Prefer vertical slices when possible (thin end-to-end)
    - Split work by meaningful boundaries (API, UI, state, tests)
    - Include at least:
        - setup / scaffolding tasks (if needed)
        - UI implementation tasks per screen/flow
        - API/data tasks
        - analytics/instrumentation tasks (if applicable)
        - accessibility tasks (if needed beyond per-ticket criteria)
        - testing tasks (unit/integration/e2e as appropriate)
        - release tasks (feature flags, rollout) when relevant

8. **Testing Plan**
    - Unit tests: what and where
    - Integration tests: key interactions
    - E2E tests: critical flows
    - Mocking strategy
    - Test data fixtures
    - Accessibility checks

9. **Risks, Edge Cases, and Mitigations**
- Bulleted list of risks with mitigation strategy
- Edge cases discovered from mockups/spec

10. **Open Questions / Assumptions**
- Explicit list of assumptions made
- Questions that should be confirmed (but do not ask the user in this output)

## Quality bar

- Be precise and actionable; avoid vague “implement X” language.
- Derive details from mockups (copy, states, flows).
- Ensure every major requirement maps to at least one ticket.
- Keep tickets small enough to complete in 1–3 days each (unless labeled L with a reason).
- Align with `architecture.md` even if it conflicts with your preferences.

## If repo context is unknown

If you do not have explicit information about:
- tech stack, frameworks, languages, testing tools
  …then:
- infer minimally from `architecture.md`
- otherwise write stack-agnostic tickets and specify assumptions.

## Begin

1) Read `design.md`
2) Read `architecture.md`
3) Read all `*.svg` artifacts
4) Produce the Markdown output in the strict format above.
5) Write the Markdown output using `writeInstruction("breakdown.md", <content>, "markdown")`
