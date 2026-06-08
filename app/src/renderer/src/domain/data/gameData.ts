import { BossData, createBoss } from './bossData'
import { createPhase, PhaseType } from './bossPhaseData'
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

export const boss: BossData = createBoss('Moloch the Unbound', 'The Iron Inferno', [
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
])

export function getMembersByRole(role: Role): MemberData[] {
  return memberPool.filter((member) => member.role === role)
}
