---
name: Raid Manager — Design System Tokens
description: Established color, spacing, typography, and component tokens for Raid Manager UI
type: project
---

## Visual Language

**Style**: Dark theme, medieval fantasy meets gaming UI, WoW guild management software parody. Serif font (Georgia) gives "ancient codex" feel. Heavy use of gold accents, dark stone backgrounds, role-color coding.

**Font family**: Georgia / Times New Roman (serif). This is intentional — parody of official-looking guild management software.

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `color-surface-base` | `#0D0F14` | Default screen background |
| `color-surface-card` | `#12141C` | Card / panel backgrounds |
| `color-surface-card-elevated` | `#1E2230` | Active/focused card backgrounds |
| `color-border-default` | `#2A2D3E` | Default card borders |
| `color-border-gold` | `#C8860A` | Section dividers, selected states, CTA borders |
| `color-text-primary` | `#E8D0A0` | Primary content text (warm off-white) |
| `color-text-secondary` | `#8A8FA8` | Labels, captions, secondary info |
| `color-text-gold` | `#F0C060` | Headings, CTAs, selected elements |
| `color-role-tank` | `#3A8AFF` | Tank role accent |
| `color-role-healer` | `#52C864` | Healer role accent |
| `color-role-dps` | `#FF6040` | DPS role accent |
| `color-category-member` | `#8B30CC` | Salle du Conseil: Membre events |
| `color-category-resources` | `#8B8B00` | Salle du Conseil: Ressources events |
| `color-category-conflict` | `#CC3030` | Salle du Conseil: Conflit events |
| `color-category-external` | `#008B8B` | Salle du Conseil: Externe events |
| `color-stat-skill` | `#4A9EFF` | Skill stat bars |
| `color-stat-morale` | `#52C864` | Morale stat bars |
| `color-stat-reliability` | `#FFB84A` | Reliability stat bars |
| `color-danger` | `#CC3030` | Low morale, wipe state, danger |
| `color-conflict-warning` | `#FF8C30` | Conflict warnings |
| `color-rubber-band` | `#52C864` | Catch-up event notification (same as healer — intentional, feels restorative) |
| `color-dissolution` | `#8B30A0` | Guild morale risk meter (purple = ominous) |
| `color-gameover-bg` | `#050508` | Game over screen background (near-black void) |

## Spacing

- Screen horizontal padding: `12px`
- Card border radius: `6px` (standard), `8px` (CTAs and large panels)
- Section header to content gap: `8px`
- Minimum touch target height: `44px`
- Inter-card gap: `8px`

## Typography Scale

- Section labels: `9px`, uppercase, letter-spacing `2–3px`, `color-text-secondary`
- Body / flavor text (narration): `10–11px`, italic, `#D4C090`
- Card titles / event titles: `11–13px`, bold
- Member names: `12px`, bold, role color
- Key stat values / numbers: `18–22px`, bold, gold or role color
- CTA labels: `14–15px`, bold, letter-spacing `1–2px`
- Hero result text (WIPE / VICTOIRE): `36–42px`, bold, letter-spacing `4–8px`

## Component Patterns

- **Role stripe**: 3px left border on member rows, colored by role (tank/healer/dps)
- **Category pill**: rounded `rx="8"` badge with dark fill + category-colored border + text
- **Stat bar**: dark fill track + colored fill, standard `8px` height, `rx="4"`
- **Conflict badge**: amber (`#FF8C30`) with `#1A0800` fill — appears on member rows and banners
- **Hidden effect badge**: blue-gray with `?` prefix — signals possible hidden consequences
- **Section header pattern**: `9px` uppercase label + 1px gold horizontal rule
- **Active tab**: gold border `1.5px` + gold text + `#2A2000` fill
- **CTA primary**: `52px` height, `8px` radius, bordered (gold or category color), inner highlight strip

## Screen Inventory

| Screen | File | Status |
|---|---|---|
| Tactical Choice | `docs/design/01-tactical-choice.svg` | Done |
| Attempt Resolution (Wipe) | `docs/design/02-attempt-resolution.svg` | Done |
| Debriefing | `docs/design/03-debriefing.svg` | Done |
| Salle du Conseil | `docs/design/04-salle-du-conseil.svg` | Done |
| Game Over / Guild Disbanded | `docs/design/05-game-over.svg` | Done |
| Draft (Phase 0) | — | Not designed yet |
| Attempt Resolution (Kill) | — | Not designed yet |
| Loot Distribution | — | Not designed yet |
| Tier End Celebration | — | Not designed yet |
| Victory Screen | — | Not designed yet |
