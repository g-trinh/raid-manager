---
name: Raid Manager — Project Context
description: Core product context for Raid Manager, a roguelike WoW guild management game
type: project
---

Raid Manager is a roguelike guild management game with a humorous WoW guild parody theme. Mobile-first, with potential web/desktop support.

**Why:** The game simulates managing a dysfunctional WoW raid guild across 3 difficulty tiers (Normal → Héroïque → Mythique), 5 bosses per tier, 15 bosses total. Game over = 5 wipes on any boss → guild disbands (gquit). Victory = kill boss 5 of Tier 3.

**How to apply:** All UI design must balance strategic information density with the comic absurd tone. Flavor text, member names (Sardoche3000, Flamius, Kévin, Zerkitos), and log-style narration are load-bearing — not decoration. Design must support both comprehension and emotional attachment to procedurally generated guild members.

Key game loop phases:
- Phase 0: Draft (8 members, 8 draws of 3 profiles)
- Phase 1: Tactical choice (Composition / Consumables / Strategy) → auto-resolution → Wipe or Kill
- Phase 2: Inter-raid = Debriefing + Salle du Conseil (3 events, player-chosen order)
- Phase 3: Tier end (+20 morale flat, conflicts −1 level, celebration event)
- Phase 4: Victory or Game over (5 wipes = guild disbands narrative)

Feature docs live in: `/home/guillaume/Projects/raid-manager/docs/features/`
Design assets live in: `/home/guillaume/Projects/raid-manager/docs/design/`
