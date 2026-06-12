# Component: War Table & Road

The hub of the run (see [war-table/todo.md](war-table/todo.md) for the full
reshape spec). The old camp screen is gone — its actions live on the war table
and the road.

## The War Table

The home screen between every action. Shows the standing boss (phases with
mastery bands), pull count, the muster (mood dots), and the satchel.

- **Pull** — the only way into combat, always visible.
- **Rest** (between pulls, once per pull interval): pick a member, +1 to their
  weaker stat (tie → Discipline, clamped at 5), **+3 morale**. A new pull
  reopens the action.
- **Satchel** — stowed items are settled here any time (equip / discard),
  never blocking navigation.

### Road mode (after a kill)

- The table switches to the road fork: candidate boss cards with a coarse
  verdict (`Favorable` / `Even` / `Grim`).
- **Scout (Send Outriders)** — optional, once per fork, upgrades both
  candidates to full forecasts (per-phase projections, weakest phase).
  Consumed when a boss is picked.
- Picking a boss never auto-pulls — it leads to the road encounter, then back
  to the table at pull 0.

## The Road encounter

Trash guards the way to every boss. One choice:

| Choice | Label | Effect |
|---|---|---|
| Skirmish | Clear Wide | Guaranteed 1 random **common** item (see [loot](loot.md)). 30% chance one random roster member is **bruised**: −1 to a random stat, permanent for the run. |
| March | March Past | No loot, no risk — **+1 morale to everyone**. |

- The respawn farm was deliberately removed: trash is fought once per road,
  never farmed between pulls. Gearing up vs holding morale together is the
  Rest-or-not decision, not a grind.
- Common-loot grants trigger personality reactions exactly as signature grants
  do — one rule for all loot.
- Bruises and Rest bonuses persist for the rest of the run through the
  existing `effectiveStat` clamp pipeline.

## Tuning levers (phase two candidates)

- Road bruise odds / double-drop odds
- Scout also previewing the next boss's signature loot
- Rest healing injuries once failed-phase injuries exist
- Rare (signature) items gaining one-line effects — see loot.md "Rarity"
