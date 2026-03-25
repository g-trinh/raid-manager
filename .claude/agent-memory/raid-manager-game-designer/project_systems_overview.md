---
name: Core Systems Overview
description: All 9 defined game systems for Raid Manager, their key rules and design state
type: project
---

9 systems have been designed and documented in docs/features/:

**01 — Defeat Conditions**: Single defeat condition — 5 wipes on one boss = collective gquit, guild dissolves. No safety net below this.

**02 — Rubber Band Mechanics**: Catch-up events (e.g., "Héros du Désespoir", "Rage Quit inversé") triggered by wipe streaks or critical morale. Comically framed, give a chance not a win.

**03 — Inter-Raid Loop**: Two sequential phases: Debriefing (auto-generated comic post-mortem) then Salle du Conseil (3 events). Calibrated for 5–10 min per inter-raid.

**04 — Salle du Conseil (v1)**: 4 event categories (Membre, Ressources, Externe, Stratégie). Contextual weighting. 2–3 choices per event with visible + hidden effects. Resolution order matters.

**05 — Member System**: 8 fixed members per run. 3 layers: role (Tank/Healer/DPS), 4 stats (Skill, Fiabilité, Moral, Expérience), personality traits (2 positive + 1 negative). Dual progression: loot (immediate) + XP (slow/passive unlocks). Relationship values (0–100) between all pairs.

**06 — Deck Creation / Draft**: 8 successive draws of 3 profiles each. 3 skips max. Synergies and relations hidden at draft time. Role balance ensured via weighted draw pool.

**07 — Inter-Member Conflicts**: 4 escalating levels (-15% skill → coordination blocked → -40% skill + resource drain → wipe-triggering sabotage). Auto-escalate each inter-raid if untreated. Conflict synergies (hidden, discoverable) can turn conflicts into advantages.

**08 — Salle du Conseil v2 + Tier End**: 3 events, sole decision space. Chained choices (max 2 depth). Tier-end: +20 morale flat + all conflicts -1 level + single celebration event (no hard choices).

**09 — Main Game Loop**: 3 tiers (Normal→Heroic→Mythic) × 5 bosses = 15 bosses total. 5 attempts per boss. 1 tactical choice pre-attempt. Inter-raid loop after every attempt. Tier-end sequence after boss 5 of each tier. Win = kill boss 15. Loss = 5 wipes on any boss.

**Why:** First design conversation was about assembling all systems into a cohesive first playable loop.
**How to apply:** All feature doc paths are under docs/features/ with numeric prefixes 01–09.
