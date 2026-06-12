# Component: Camp

The rest stop on the road. After every victorious boss attempt that does not end the
run, the muster makes camp before choosing the next foe. After a **wipe**, the muster
can also *retreat* to camp before pulling again. The player picks exactly one camp
action, then breaks camp.

## Flow

- Kill: [Outcome](outcome.md) (victory, run continues) -> Spoils -> **Camp** -> Boss Choice
- Wipe: [Outcome](outcome.md) (wipe) -> Retreat to Camp -> **Camp** -> back to the same boss (next pull)

- Camp never appears after the final boss kill or after a Disband (the run is over)
- One action per camp — choosing resolves immediately, then the only exit is
  "Break Camp" (after a kill) / "Return to the Boss" (mid-progression)
- **Mid-progression camps offer Rest and Skirmish only** — the boss is locked, so there
  is no boss choice to scout

## Actions

| Action | Label | Effect |
|---|---|---|
| Rest | Bind Wounds | Pick a member: +1 to their lower stat (tie → Discipline), clamped at 5, **+3 morale**. |
| Scout | Send Outriders | The next boss choice shows full forecasts (projections, verdict, weakest phase). |
| Skirmish | Hunt the Road | Always yields 1 random **common** item (see [loot](loot.md)). 30% chance one random roster member is **bruised**: −1 to a random stat, permanent for the run. |

### Rest

- Targets the member's *lower* stat so it always patches a weakness
- Also restores **+3 morale** — the camp lever against the disband clock
  (see [morale](morale/todo.md))
- Uses the same permanent-delta pipeline as loot and personalities (clamped [0, 5])
- Future: when injuries are introduced (failed-phase wounds), Rest becomes the healing
  action; the +1 baseline is its placeholder shape

### Scout

- **Default boss choice is unscouted**: candidate cards show each boss's phases (names,
  role weights, tested stat) and a **coarse one-word verdict** — `Favorable` / `Even` /
  `Grim`, derived from the same roster forecast — but no per-phase success projections
  and no weakest-phase callout. The player can always weigh the odds at a glance;
  scouting buys precision, not sight
- Scouting the camp before a choice reveals the full forecast for all candidates of that
  choice only — the flag is consumed when a boss is picked
- This makes information a spendable resource and keeps the default choice screen light

### Skirmish

- Auto-resolved, no player input — the muster ambushes a roadside warband
- The common item drop uses the normal loot flow (equip / bench / discard, role lock,
  personality reactions)
- The bruise (30%) hits a uniformly random roster member on a uniformly random stat —
  greed has a cost, and the cost can land on your star

## Rules

- Exactly one camp action per camp, no skipping (resting is never wrong)
- Personalities react to common-loot grants exactly as they do to signature grants —
  one rule for all loot
- Bruises and Rest bonuses persist for the rest of the run and stack with loot bonuses
  through the existing `effectiveStat` clamp pipeline

## Tuning levers (phase two candidates)

- Skirmish bruise odds / double-drop odds
- Scout also previewing the *next* boss's signature loot
- Rest healing injuries once failed-phase injuries exist
- Rare (signature) items gaining one-line effects — see loot.md "Rarity"
