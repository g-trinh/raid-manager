# Battle res — catch the blunder

One limited charge per boss that saves a pull from a **lethal blunder**: the
fumbler dies in the fire, the battle res picks them up, the pull goes on.
Counterpart: [heroism](../heroism/todo.md) saves learning wipes (throughput);
battle res saves execution deaths (people).

## Design

- **One Battle Res charge per boss.** Granted when a boss is engaged
  (`chooseBoss` / run start), not replenished by retries. Independent from
  the Heroism charge — a boss can burn both in one pull.
- During the outcome reveal, when a phase breaks on a **blunder wipe**
  (a fumble rolled lethal) and the charge is unspent, the reveal pauses on
  the broken row, naming the fumbler: **Battle Res ${name}** / **Let it go**.
  - Burning it **overrides the lethal blunder**: the wipe is cancelled and
    the phase proceeds to its normal unfamiliarity/pass roll.
  - The fumble **still counts toward the member's cumulative F** — the
    mistake happened; the save just caught the body. Grievance, however, is
    only ever charged on an actual blunder *wipe*, so a successful save
    spares the roster's morale entirely.
  - If the subsequent pass roll fails anyway, it's a learning wipe — the
    blunderer is off the hook (and [heroism](../heroism/todo.md) may pause
    next, if its charge is up).
- Learning wipes are NOT savable by battle res — nobody died, the raid just
  wasn't enough. That save is Heroism's job.
- Chronicle: "BATTLE RES — ${name} is up again, Phase II continues"; outcome
  row marks the save ("Held — Battle Res" when the phase ultimately holds).

### Prerequisite: interactive resolution

Rides the pause-point state machine specced (and landed first) in
[heroism](../heroism/todo.md) — this feature adds a second pause trigger on
blunder breaks and a `battleRes()` continuation.

### Touchpoints

- `useRunStore`: charge state (`battleResReady`), blunder pause trigger,
  override-then-pass-roll continuation; reset on `chooseBoss`/`reset`.
- `useMoraleStore`: no change needed — grievance already only fires via
  `applyWipe` with a blunderer, which a successful save never reaches.
- OutcomeScreen: pause UI naming the fumbler; war table charge indicator
  ("Battle Res ready/spent") alongside Heroism's.
- Dials: charges per boss (1), shared-pull stacking with Heroism (allowed).

## Plan

- [ ] 1. Depends on heroism's pause-point state machine — land that first
- [ ] 2. Battle Res charge lifecycle (grant per boss, spend once, reset hooks), independent of Heroism's
- [ ] 3. Override semantics: cancel lethal, keep the fumble's F, continue to the pass roll; chain into a Heroism pause if that roll fails
- [ ] 4. Reveal pause UI naming the fumbler + war table charge indicator + chronicle/outcome labels
- [ ] 5. Unit specs: save → phase holds, save → learning wipe anyway, F still counted, no grievance on saved blunders, learning wipes not eligible, charge exhaustion; e2e: battle-res journey with seeded lethal fumble
- [ ] 6. Docs: attempt.md resolution section, outcome.md
