import { BossData, createBoss } from './bossData'
import { createPhase, PhaseType } from './bossPhaseData'
import { createLootItem } from './lootData'
import { createMember, MemberData } from './memberData'
import { Role } from './role'

export const memberPool: MemberData[] = [
  // Tanks — pool has 3, draft caps at 2
  createMember('Gorvak', Role.TANK, 38, 62),
  createMember('Shieldara', Role.TANK, 81, 19),
  createMember('Bruthan', Role.TANK, 55, 45),

  // Healers — pool has 3, draft caps at 2
  createMember('Lumina', Role.HEAL, 12, 88),
  createMember('Patchwick', Role.HEAL, 48, 52),
  createMember('Serenova', Role.HEAL, 91, 9),

  // DPS — pool has 5, draft caps at 4
  createMember('Razorfang', Role.DPS, 80, 20),
  createMember('Blitzclaw', Role.DPS, 60, 40),
  createMember('Vexara', Role.DPS, 95, 5),
  createMember('Skarn', Role.DPS, 28, 72),
  createMember('Duskblade', Role.DPS, 15, 85)
]

export const bosses: BossData[] = [
  createBoss(
    'Moloch the Unbound',
    'The Iron Inferno',
    [
      createPhase(
        'The Searing March',
        'Its forges roar to life. Strike fast before the iron host overwhelms you.',
        3,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        65
      ),
      createPhase(
        'The Branding Rite',
        'Molten chains seek the careless. Mind the rite, or be claimed by it.',
        1,
        3,
        3,
        PhaseType.LIABILITY_HEAVY,
        70
      ),
      createPhase(
        'The Last Smelting',
        'Moloch bares its core. Endure the final heat — the weary will not last alone.',
        2,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        60
      )
    ],
    createLootItem(
      'iron-inferno-brand',
      'Iron Inferno Brand',
      "A fragment of Moloch's forge-chains, etched with the heat that broke the careless.",
      Role.DPS,
      3,
      3,
      'Moloch the Unbound'
    )
  ),

  createBoss(
    'Sythara the Plaguebound',
    'The Rot Unending',
    [
      createPhase(
        'The Withering Approach',
        'Spores cloud the air. Strike fast, before the rot has time to settle in your lungs.',
        3,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        65
      ),
      createPhase(
        'Communion of Decay',
        'Toxin blooms in pulsing waves. Read the pattern, or join the chorus of the fallen.',
        1,
        2,
        3,
        PhaseType.LIABILITY_HEAVY,
        72
      ),
      createPhase(
        'The Last Bloom',
        'Sythara unravels into spore and spite. Hold the line until the bloom withers.',
        2,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        70
      )
    ],
    createLootItem(
      'vial-of-the-withering-bloom',
      'Vial of the Withering Bloom',
      "A sealed dose of Sythara's own rot, refined into something that steadies rather than spreads.",
      Role.HEAL,
      3,
      3,
      'Sythara the Plaguebound'
    )
  ),

  createBoss(
    'Nyxessa, Empress of the Hollow Stars',
    'The Endless Dusk',
    [
      createPhase(
        'The Starless Descent',
        'Darkness peels the sky away. Strike true before your eyes fail you completely.',
        4,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        72
      ),
      createPhase(
        'The Devouring Hush',
        'Silence swallows sound and sense alike. Mind the hush, or be unmade within it.',
        2,
        3,
        3,
        PhaseType.LIABILITY_HEAVY,
        78
      ),
      createPhase(
        'Collapse of the Final Star',
        'Nyxessa pours her last light into ruin. Endure it together, or not at all.',
        3,
        3,
        3,
        PhaseType.SKILL_HEAVY,
        75
      )
    ],
    createLootItem(
      'hollow-star-shard',
      'Hollow Star Shard',
      "A splinter of Nyxessa's collapsed light, sharp enough to cut even in total darkness.",
      Role.DPS,
      3,
      3,
      'Nyxessa, Empress of the Hollow Stars'
    )
  )
]

export function getMembersByRole(role: Role): MemberData[] {
  return memberPool.filter((member) => member.role === role)
}
