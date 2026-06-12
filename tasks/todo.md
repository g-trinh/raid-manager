# Camp node + loot rarity (phase one — no item effects yet)

Agreed scope: camp screen between bosses (Rest / Scout / Skirmish), common loot tier
from skirmishes, signature items become the rare tier. Item effects = phase two.

## Design calls (documented in docs/feature/camp.md)

- Camp appears after each victorious boss when the run continues (not after final boss/defeat)
- Rest: pick a member, +1 to their lower stat (tie → Discipline) — becomes injury healing later
- Scout: next boss choice shows full forecasts; unscouted choice shows phases without
  projections/verdict (reuses PhaseCard `drafted=false` rendering)
- Skirmish: always yields 1 random common item (role-locked, +1 single stat);
  30% chance one random member takes −1 to a random stat ("bruised")
- Personalities react to ALL loot grants (common included) — one rule, no special case
- Rarity: `LootItemData.rarity: 'common' | 'rare'`; signature items rare, badge in LootCard

## Plan

- [x] 1. Docs: new docs/feature/camp.md; loot.md rarity section; run.md flow update
- [x] 2. lootData.ts: rarity field (default 'rare' so signature calls untouched) + createCommonItem
- [x] 3. commonLootPool in gameData.ts (6 items, 2 per role, +1 single stat)
- [x] 4. useLootStore: generic applyDelta(member, dSkill, dDiscipline) for rest/bruise
- [x] 5. useCampStore: scouted flag, camp resolution (rest/scout/skirmish), reset
- [x] 6. CampScreen UI (screens/camp/): 3 option cards → resolution panel → continue
- [x] 7. App.tsx: 'camp' screen; outcome → camp → choice
- [x] 8. ChoiceScreen/BossCandidateCard: unscouted = no projections/verdict/meter-fill
- [x] 9. LootCard: rarity badge + hide zero bonuses on single-stat commons
- [x] 10. CSS: camp screen, rarity badge
- [x] 11. Reset wiring (run reset → camp reset)
- [x] 12. Verify: typecheck + lint + headless drive (camp choices, scout gating, skirmish loot)

## Review

- Headless verified: camp shows 3 options; skirmish dropped a COMMON-badged item + bruise
  (Serenova −1 Skill with forced rolls); unscouted choice rendered "Unscouted"/"—"/"No
  Forecast"; after scouting, verdicts + % chances appeared; scout flag consumed on pick.
- Unscouted PhaseCard also zeroes meter fill and ramp color — no info leak via the bar.
- Skirmish drops clone the pooled item with a unique instance id so satchel/resolution
  maps (keyed by id) never collide across camps.
- Common equip reuses bestow → personality reactions fire on commons too (one rule);
  camp shows a one-line reaction list under the loot card.
- Phase two parked: item effects on rares, Rest→injury healing, skirmish double-drop odds.
