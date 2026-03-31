# Boss Encounter V2 — Specification

| | Score |
|---|---|
| Understanding | 97 / 100 |
| Confidence | 95 / 100 |

---

## Summary

The Boss Encounter V2 redesign replaces the flat guild-power-vs-difficulty formula with a phase-based probabilistic resolution system. A boss now has three independent phases, each with distinct role weights, a dominant stat type (Skill-heavy or Liability-heavy), and a target value. Each phase resolves via a success-chance roll, and the run outcome depends on how many phases succeed — introducing three distinct outcome states instead of a binary win/lose.

Members gain a second stat, Liability, alongside Skill, both on a 0-100 scale. Role-specific averages (Tank, Heal, DPS) drive phase evaluation, making roster composition strategically meaningful beyond raw power totals.

---

## Why We Are Building This

The v1 formula (sum of Skill > flat difficulty) produces a single optimal strategy: always draft the highest Skill members. There is no tension, no tradeoff, and no reason to care about role composition beyond meeting caps. The outcome is also deterministic once the draft is complete, removing any sense of drama from the resolution.

V2 addresses both problems. Probabilistic phase resolution means even a well-constructed roster can fail — and a weaker roster can sometimes prevail — giving each attempt genuine stakes. The three-phase structure, role weights, and dual stats (Skill vs Liability) force the player to read the boss before building their team, creating strategic decisions that compound across future runs.

---

## Goals

- Replace the single-stat deterministic formula with a three-phase probabilistic resolution driven by role averages and boss phase definitions
- Introduce Liability as a second member stat, making boss mechanic awareness a distinct axis from raw DPS/Tank/Heal performance
- Surface three outcome states (Full Victory, Narrow Victory, Defeat) that reflect degrees of success and lay groundwork for differentiated rewards
- Expose all boss phase data to the player before the attempt so roster decisions are informed choices
- Rename the Healer role to Heal everywhere in data and UI to match the v2 spec

---

## Non-Goals

- Reward differentiation between Full Victory and Narrow Victory (deferred to the reward and progression system)
- Multiple active bosses per run or player-selected bosses (MVP fixes exactly one boss)
- Member progression, unlocks, or stat changes between runs
- Animation or delay during attempt resolution (instant resolution is sufficient for MVP)
- Any UI changes to how phase results are surfaced beyond showing success/failure count and outcome state

---

## Questions & Answers Log

| Question | Answer |
|---|---|
| What replaces the flat difficulty model? | Three independent boss phases, each with role weights, a dominant stat (Skill or Liability), and a numeric target on a 0-100 scale |
| How does a phase succeed or fail? | A success chance is computed from role-weighted averages vs the phase target, then a random roll determines success. Formula: `0.05 + 0.90 * min(1, (phase_score / phase_target)^2)` |
| What is Liability? | A second per-member int stat (0-100) representing ability to respect boss mechanics. Used in Liability-heavy phases the same way Skill is used in Skill-heavy phases |
| How many outcome states are there? | Three: Full Victory (3/3 phases), Narrow Victory (2/3 phases), Defeat (0 or 1 phase) |
| Does the run continue after a Narrow Victory? | No. The run ends on any outcome. Narrow Victory reward handling is deferred |
| Should all boss phases be visible before the attempt? | Yes, all three phases are fully visible to the player during the draft |
| Is the HEALER enum value being renamed? | Yes, Role.Type.HEALER becomes Role.Type.HEAL everywhere — in data, UI labels, slot counters, and any string formatting |
| How should the member pool be updated? | Retain existing member names; add Liability values and rescale Skill from the 3-10 range to the 0-100 scale |
| How many bosses exist in MVP? | Exactly one, hardcoded: "Moloch the Unbound" with three fully specified phases |

---

## Acceptance Criteria

- [ ] `MemberData` has a `liability: int` property alongside `skill: int`; both range from 0 to 100
- [ ] `Role.Type` enum uses `HEAL` (not `HEALER`); all references updated
- [ ] `BossData` has no `difficulty` property; instead it holds an array of exactly 3 `BossPhaseData` entries
- [ ] Each `BossPhaseData` has: `dps_weight: int`, `tank_weight: int`, `heal_weight: int` (each 0-5), `phase_type: PhaseType` (SKILL_HEAVY or LIABILITY_HEAVY), `phase_target: int` (0-100)
- [ ] At least one weight per phase is greater than 0
- [ ] `GameData` hardcodes 11 members (3 Tank, 3 Heal, 5 DPS) with Skill and Liability on the 0-100 scale
- [ ] `GameData` hardcodes exactly 1 boss ("Moloch the Unbound") with 3 concrete phases
- [ ] `RunState.resolve()` computes role averages for the dominant stat of each phase, applies the weighted phase score formula, applies the success-chance formula, rolls each phase independently, and determines outcome based on successful phase count
- [ ] `RunState` stores per-phase results (succeeded: bool) accessible after resolution
- [ ] Outcome screen shows one of three states: "Full Victory", "Narrow Victory", or "Defeat"
- [ ] Outcome screen shows the number of phases succeeded (e.g. "2 / 3 phases")
- [ ] "Play Again" on the outcome screen resets all run state and returns to the draft
- [ ] Draft screen member cards display both Skill and Liability values
- [ ] Draft screen slot counter reads "Heal: %d/2" (not "Healers: %d/2")
- [ ] Boss phase data (weights, type, target for all 3 phases) is visible on the draft screen before the player proceeds

---

## User Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant DS as Draft Screen
    participant BS as Boss Panel
    participant DL as Draft Logic
    participant RS as RunState
    participant OS as Outcome Screen

    P->>DS: Run starts (fresh state)
    DS->>BS: Display all 3 boss phases (weights, type, target)
    loop 8 rounds (until roster full)
        DS->>DL: draw_candidates() — 3 cards from pool
        DL-->>DS: current_candidates (Name, Role, Skill, Liability)
        P->>DS: Select 1 member card
        DS->>DL: add_member(member)
        DL-->>DS: member_selected signal → update slot tracker
    end
    DL-->>DS: draft_completed signal → enable Proceed
    P->>DS: Press "Proceed to Attempt"
    DS->>RS: resolve()
    loop For each of 3 phases
        RS->>RS: compute role averages (dps_avg, tank_avg, heal_avg) for dominant stat
        RS->>RS: compute phase_score (weighted average)
        RS->>RS: compute success_chance = 0.05 + 0.90 * min(1, (phase_score / phase_target)^2)
        RS->>RS: roll random float [0,1]; succeed if roll <= success_chance
    end
    RS->>RS: count successes → assign outcome (Full Victory / Narrow Victory / Defeat)
    RS-->>DS: attempt_resolved signal
    DS->>OS: change_scene_to outcome_screen.tscn
    OS->>P: Show outcome state + "X / 3 phases"
    P->>OS: Press "Play Again"
    OS->>RS: reset()
    OS->>DS: change_scene_to draft_screen.tscn
```
