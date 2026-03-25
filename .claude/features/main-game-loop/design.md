# Main Game Loop — UI Design

| | Score |
|---|---|
| Understanding | 92 / 100 |
| Confidence | 88 / 100 |

## Summary of Changes

### New Screens

#### 01 — Tactical Choice (`docs/design/01-tactical-choice.svg`)
- **Description**: Pre-attempt screen where the player makes their one irrevocable tactical decision before each boss attempt. Three-tab system (Composition / Consumables / Strategy), roster display with per-member stats and conflict indicators, tactical option cards with visible effects, system-generated success probability estimate, and a large CTA to launch the attempt.

#### 02 — Attempt Resolution (`docs/design/02-attempt-resolution.svg`)
- **Description**: Full-screen result screen shown immediately after attempt auto-resolution. This instance shows a WIPE outcome. Features dramatic visual treatment (red radial glow, large WIPE typography), boss HP remaining bar, 4 performance stat cards (DPS / Heals / Deaths / Duration), MVP-du-wipe culprit callout with humorous flavor text, rubber band catch-up event notification when attempt 3+ is reached, and a guild morale dissolution risk meter.

#### 03 — Debriefing (`docs/design/03-debriefing.svg`)
- **Description**: Post-attempt inter-raid screen (phase 1 of 2). Auto-generated absurd narrative post-mortem in parchment-style log format. Per-role performance breakdown with individual percentage bars and flavor annotations. Resource impact chips (consumables consumed, XP gained). Conflict escalation notice. Per-member morale delta summary. Leads directly into Salle du Conseil.

#### 04 — Salle du Conseil (`docs/design/04-salle-du-conseil.svg`)
- **Description**: Inter-raid screen (phase 2 of 2). Three queued event cards shown at top, each tagged by category (Membre / Ressources / Conflit / Externe) with urgency states. Active event is fully expanded below, showing humorous narrative description, member context tooltip, and 2–3 choice cards. Choices display visible effects as pill badges and signal hidden effects with a "? effet caché" indicator. Order-dependency warning and confirm CTA. Conflict events carry a "GARANTI" badge when triggered by conflict level 3+.

#### 05 — Game Over / Guild Disbanded (`docs/design/05-game-over.svg`)
- **Description**: Narrative dissolution screen triggered after 5 wipes on any boss. Deliberately atmospheric: deep void background, shattered guild crest, and a scrolling departure log showing each member's /gquit message in comic but emotionally resonant fashion. Epitaph stats panel. Legacy / meta-progression hint teaser. CTA to start a new run with heritage transferred.

### Design System Updates

**New color tokens introduced:**

| Token | Value | Usage |
|---|---|---|
| `color-surface-base` | `#0D0F14` | Default screen background |
| `color-surface-card` | `#12141C` | Card / panel backgrounds |
| `color-surface-card-elevated` | `#1E2230` | Active/focused card backgrounds |
| `color-border-default` | `#2A2D3E` | Default card borders |
| `color-border-gold` | `#C8860A` | Section dividers, selected states, CTA borders |
| `color-text-primary` | `#E8D0A0` | Primary content text |
| `color-text-secondary` | `#8A8FA8` | Labels, captions, secondary info |
| `color-text-gold` | `#F0C060` | Headings, CTAs, selected elements |
| `color-role-tank` | `#3A8AFF` | Tank role accent color |
| `color-role-healer` | `#52C864` | Healer role accent color |
| `color-role-dps` | `#FF6040` | DPS role accent color |
| `color-category-member` | `#8B30CC` | Salle du Conseil: Membre events |
| `color-category-resources` | `#8B8B00` | Salle du Conseil: Ressources events |
| `color-category-conflict` | `#CC3030` | Salle du Conseil: Conflit events |
| `color-category-external` | `#008B8B` | Salle du Conseil: Externe events |
| `color-stat-skill` | `#4A9EFF` | Skill stat bars |
| `color-stat-morale` | `#52C864` | Morale stat bars |
| `color-stat-reliability` | `#FFB84A` | Reliability stat bars |
| `color-danger-low` | `#CC3030` | Low morale, wipe state, danger |
| `color-conflict` | `#FF8C30` | Conflict warnings |
| `color-rubber-band` | `#52C864` | Catch-up event notification |
| `color-dissolution` | `#8B30A0` | Guild morale risk meter |
| `color-gameover-bg` | `#050508` | Game over screen background |

**Spacing conventions (mobile):**
- Screen horizontal padding: `12px`
- Card border radius: `6px` (standard), `8px` (CTAs)
- Section header to content gap: `8px`
- Minimum touch target: `44px` height

**Typography conventions:**
- Font family: Georgia / Times New Roman (serif — medieval fantasy parody feel)
- Section labels: `9px`, letter-spacing `2–3`, `#6A6A80` uppercase
- Card titles: `11–13px` bold
- Stat values / key numbers: `18–22px` bold, gold or role color
- Flavor text / narration: `10–11px` italic, `#D4C090`
- CTA labels: `14–15px` bold, letter-spacing `1–2`

---

## Goals

- Communicate all mechanically relevant information (boss progress, attempt counter, conflict states, member stats) at a glance without overwhelming the player.
- Maintain the humorous WoW-parody guild management tone consistently across all screens — flavor text and absurd log entries are load-bearing, not decorative.
- Make the inter-raid loop feel fast and purposeful: Debriefing informs, Salle du Conseil decides. Total flow should feel completable in under 5 minutes.
- Signal danger states (low morale, escalating conflicts, late attempts) through progressive visual escalation (color, glow, borders) rather than disruptive modals.
- Ensure the Game Over screen feels like a narrative conclusion, not a punishment screen — the guild disbands with dignity and comic pathos.

## Non-Goals

- Draft screen (Phase 0) is out of scope for this design pass.
- Victory screen is out of scope for this design pass.
- Tier-end celebration screen is out of scope for this design pass.
- Desktop / web layout adaptations — these screens are mobile-first; cross-platform variants are a future pass.
- Animated transitions between screens — static SVG designs only at this stage.

## Questions & Answers

| Question | Answer |
|---|---|
| Should the attempt resolution screen differ visually for a boss kill vs a wipe? | Yes — the wipe variant is designed (red, skull, WIPE hero text). The kill variant would use gold/green treatment with loot distribution UI. Designed separately. |
| Is the success probability estimate in the Tactical Choice screen intended to be shown or hidden? | Shown. Spec states the system resolves automatically; giving a probability estimate creates informed tension without removing player agency. |
| Should hidden effects in the Salle du Conseil be signaled at all? | Yes, signaled with a "? effet caché" pill badge — experienced players read the signal, new players learn through experience. Keeps the system learnable. |
| Where does loot distribution happen? | After a boss kill, before Debriefing. Not in scope for this pass — would be an additional screen between resolution (kill) and debriefing. |
| Should the game over screen show all 8 members' departures? | Designed with 4 visible in scroll — full 8-member log would scroll within the log container. Maintained at 4 for visual rhythm. |
