# Main Game Loop — Feature Breakdown

Features ordered by dependency (no dependencies first, most-dependent last).

---

## F01 — Member Data Model
**Doc:** [Système 05 — Le système de membres](../../docs/features/05_systeme_de_membres.md#L20) (L20–L53)
**Dependencies:** none

Core data structures for a guild member: role (Tank/Healer/DPS), four stats (Skill, Fiabilité, Moral, Expérience), 2 positive + 1 negative personality traits, and relation values with other members (0–100 per pair).

---

## F02 — Boss Data Model
**Doc:** [Système 09 — La boucle de jeu principale](../../docs/features/09_boucle_de_jeu_principale.md#L22) (L22–L29, L63–L68)
**Dependencies:** none

Data structure for a boss: tier (1–3), position in tier (1–5), derived difficulty score. 15 bosses total across 3 tiers of 5.

---

## F03 — Member Procedural Generation
**Doc:** [Système 05](../../docs/features/05_systeme_de_membres.md#L38) (L38–L52, L74–L81)
**Dependencies:** F01

Algorithm to generate a member: random name, class, role, stat values, trait assignment (2 positive / 1 negative), and initial relation values with other members in the pool.

---

## F04 — Conflict System (Levels & Penalties)
**Doc:** [Système 07 — Conflits inter-membres](../../docs/features/07_conflits_inter_membres.md#L20) (L20–L55)
**Dependencies:** F01

Four conflict levels between member pairs, each with mechanical penalties:
- L1: −15% skill
- L2: certain compositions blocked, duo synergies impossible
- L3: −40% skill + consumes consumables
- L4: can trigger wipes on mastered bosses

Automatic escalation: untreated conflict rises one level each inter-raid with no resolution event.

---

## F05 — Draft Screen (Phase 0)
**Doc:** [Système 06 — Création de deck](../../docs/features/06_creation_de_deck.md#L18) (L18–L36)
**Dependencies:** F03

8 sequential draws of 3 random profiles. Player picks one or skips (3 skips max for the phase). Visible: name, class, role, Skill, Moral, traits. Hidden: conflict synergies with already-selected members, existing relations, locked passives.

---

## F06 — Tactical Choice (Pre-Attempt)
**Doc:** [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L49) (L49–L61)
**Dependencies:** F01, F02

Single irreversible choice before each attempt, across 3 categories: Composition (role assignment change), Consumables (potions/buffs/meals), Strategy (burst / survive / ignore mechanic). This is the player's only direct agency on an attempt.

---

## F07 — Boss Attempt Resolution
**Doc:** [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L62) (L62–L75)
**Dependencies:** F01, F02, F04, F06

Automatic resolution using: member stats (Skill, Fiabilité, Moral, Expérience), active conflict penalties, tactical choice modifier, boss difficulty. Output: kill (loot + XP → inter-raid) or wipe (attempt counter +1 → inter-raid).

---

## F08 — Defeat Condition
**Doc:** [Système 01 — Conditions de défaite](../../docs/features/01_conditions_de_defaite.md#L17) (L17–L26)
**Dependencies:** F07

Wipe counter per boss (max 5). On 5th wipe without kill: guild dissolves, run ends. Presented as a narrative conclusion (members gquit one by one), not an abstract game-over screen.

---

## F09 — Loot & XP Distribution
**Doc:** [Système 05](../../docs/features/05_systeme_de_membres.md#L56) (L56–L69)
**Dependencies:** F07

After a boss kill: distribute loot (equipment points, immediate power) to one member of player's choice (arbitrage: weakest / strongest / most unhappy). XP distributed to all members present regardless of outcome, slowly unlocking passive abilities.

---

## F10 — Debriefing
**Doc:** [Système 03 — La boucle inter-raid](../../docs/features/03_boucle_inter_raid.md#L22) (L22–L30) · [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L82) (L82–L93)
**Dependencies:** F07

Auto-generated absurd-but-informative post-attempt summary. Reveals: which member underperformed and why, which resource was missing, which role was deficient, active conflict effects that impacted the result. Tone: comic but mechanically useful.

---

## F11 — Catch-up Mechanics (Rubber Band)
**Doc:** [Système 02 — Mécaniques de rattrapage](../../docs/features/02_mecaniques_de_rattrapage.md#L17) (L17–L42)
**Dependencies:** F07, F04

Triggered events when the guild is struggling (X consecutive wipes, or collective moral below threshold). Examples: "Hero of Despair" (random member goes super on one attempt), "Inverted Rage Quit" (moral boost for all, conflict penalty if attempt fails). Events appear in the Council Chamber flow.

---

## F12 — Council Chamber Event Pool
**Doc:** [Système 04 — La Salle du Conseil](../../docs/features/04_salle_du_conseil.md#L19) (L19–L62)
**Dependencies:** F01, F04

Pool of event cards across 4 categories: Member, Resources, External, Strategy. Each card: tag, title (absurd), description, 2–3 choices with visible effects + possible hidden effects. Volume must be large enough to avoid repetition across a 1–2h run.

---

## F13 — Council Chamber Selection & Weighting
**Doc:** [Système 08 — Salle du Conseil v2](../../docs/features/08_salle_du_conseil_v2_et_fin_de_palier.md#L25) (L25–L36) · [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L96) (L96–L106)
**Dependencies:** F12, F04, F01

Contextual weighted selection of 3 events per inter-raid:
- Conflict level 3+ active → one conflict event guaranteed
- Low collective moral → priority to Member events
- Empty bank → priority to Resource events
- Otherwise → weighted random across 4 categories

Player sees all 3 simultaneously and chooses resolution order (order can affect options on subsequent events).

---

## F14 — Council Chamber Resolution (Chained Choices)
**Doc:** [Système 08](../../docs/features/08_salle_du_conseil_v2_et_fin_de_palier.md#L37) (L37–L50) · [Système 04](../../docs/features/04_salle_du_conseil.md#L65) (L65–L73)
**Dependencies:** F13, F01, F04

UI for resolving the 3 selected events. Supports chained choices: a first choice opens/closes options in the same event (max 2 levels deep). Resolving one event may modify options available in the remaining ones. What is not covered this turn worsens on its own (no explicit "ignore" option).

---

## F15 — Conflict Synergies
**Doc:** [Système 07](../../docs/features/07_conflits_inter_membres.md#L72) (L72–L103)
**Dependencies:** F04, F07

Certain member traits (Rivalité productive, Solitaire, Rancunier) transform an active conflict into a mechanical advantage. Hidden at start — revealed via narrative event after X raids with conditions met (conflicting member assigned without their rival). Post-discovery: displayed on member sheet with condition, effects, conflict level indicator.

---

## F16 — Inter-Raid Loop
**Doc:** [Système 03](../../docs/features/03_boucle_inter_raid.md#L20) (L20–L43) · [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L78) (L78–L108)
**Dependencies:** F10, F14, F11

Sequential two-phase structure triggered after every attempt (win or wipe):
1. Debriefing (auto-generated, no player input)
2. Council Chamber (3 events, player resolves in chosen order)

On completion: return to tactical choice for the next attempt or next boss.

---

## F17 — Tier End Sequence
**Doc:** [Système 08](../../docs/features/08_salle_du_conseil_v2_et_fin_de_palier.md#L53) (L53–L76) · [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L111) (L111–L133)
**Dependencies:** F16, F04, F15

Triggered after the 5th boss of a tier is killed. In order:
1. Apply automatic reset: +20 Moral flat for all members, all conflicts drop one level (level 1 → resolved)
2. Show reset effects clearly to player before anything else
3. Replace the 3 Council events with a single narrative celebration event (comic, no difficult choice)
4. Transition to next tier, Boss 1, tactical choice available immediately

Strategic tension: players exploiting conflict synergies may lose them via the automatic level drop.

---

## F18 — Main Run State Machine
**Doc:** [Système 09](../../docs/features/09_boucle_de_jeu_principale.md#L19) (L19–L29, L182–L210)
**Dependencies:** F05, F06, F07, F08, F09, F16, F17

Orchestrates the full run:
- Phase 0: Draft (F05)
- Loop: 3 tiers × 5 bosses × up to 5 attempts each
  - Tactical choice (F06) → Attempt resolution (F07) → Loot/XP if kill (F09) → Inter-raid loop (F16)
  - If 5 wipes on same boss → Game over (F08)
  - If last boss of tier → Tier end (F17) before next tier
- Victory: 5th boss of Tier 3 killed → run complete

Tracks: current tier (1–3), current boss in tier (1–5), attempt counter per boss, overall run state.
