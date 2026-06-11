---
name: loot_signature_items_v2
description: Multi-item signature loot redesign (per-phase items) for docs/features/v2/components/loot.md
type: project
---

The signature loot system (docs/features/v2/components/loot.md) was redesigned from "1 item per boss" to
"3 items per boss, one derived per phase" (Direction C applied per-phase instead of per-boss).

Key rules locked in:
- Drop count by outcome: Full Victory (3/3 phases) = all 3 items; Narrow Victory (2/3) = only the 2 items
  tied to succeeded phases; Defeat = 0 (unchanged).
- All 3 items from one boss share the same magnitude tier from the existing gauntlet-position curve
  (+3/+3 early, +4/+4 mid, +5/+5 late) — no per-phase scaling.
- Per-phase Role Lock = highest-weight role in that phase (DPS/Tank/Heal).
- **Tie-break exception** (the only randomness in the loot system): when a phase's weights are tied
  (no single highest role, e.g. 2/2/2, 3/3/3, or a 2-way tie like 1/3/3), the Role Lock is resolved by
  a per-boss authored random weighting (not uniform 1/3, not a global priority order). This is scoped
  ONLY to which role a tied phase's item locks to — item existence/count/timing remains fully
  deterministic. Explicitly called out as a narrow exception to "no randomization within a boss's drop"
  in the Non-Goals section.

Tied phases identified across the 10-boss pool (app/src/renderer/src/domain/data/gameData.ts):
- Moloch: P2 (1/3/3 Tank-Heal tie → authored 60/40 Tank), P3 (2/2/2 → authored 50/25/25 Heal-lean)
- Nyxessa: P2 (2/3/3 Tank-Heal tie → 60/40 Tank), P3 (3/3/3 → 45/30/25 DPS-lean)
- Vrokhar: P3 (2/2/2 → 50/30/20 Tank-lean)
- The Hollow Author: P3 (3/3/3 → 45/30/25 Heal-lean)
- The Sundered Titan: P2 (1/3/3 Tank-Heal tie) and P3 (3/3/2 DPS-Tank tie) — flagged as needing authored
  weightings during implementation, not yet given specific numbers.

Fully worked examples in the doc: Moloch (all 3 items, existing Iron Inferno Brand = P1/DPS), Sythara
(all 3 items, existing Vial of the Withering Bloom = P2/Heal), plus Nyxessa and Vrokhar as additional
worked examples (Vrokhar's existing Frozen Oathguard = P2/Tank, unchanged under new derivation).
Remaining 6 bosses (Zaelith, Karthus, Grizzelmaw, Hollow Author, Countess Mireth, Sundered Titan) are
noted as following the same mechanical derivation, to be authored at implementation time.

This is docs-only (docs/features/v2/components/loot.md) — no implementation changes made.

**Why:** User wants richer, more legible spoils that distinguish Full vs Narrow Victory and spread
loot across all 3 roles per boss instead of skewing DPS-heavy (most bosses' Phase 1 is DPS-dominant).
**How to apply:** When implementation work (backend-developer / frontend-development) picks this up,
the LootItemData type needs a sourcePhase field and BossData.signatureItems becomes a 3-element array;
reference this doc for the exact per-boss tie-break weightings already authored.
