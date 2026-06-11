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

export const bossPool: BossData[] = [
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
  ),

  createBoss(
    'Vrokhar, the Frostbound Warden',
    'The Glacial Vigil',
    [
      createPhase(
        'The Shattering Approach',
        'Shards of ancient ice rain down. Move fast, or be entombed before you strike.',
        3,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        65
      ),
      createPhase(
        'Wardens of the Frozen Oath',
        'Frozen sentinels rise to enforce the old pact. Mind their ground, or join their vigil.',
        1,
        3,
        2,
        PhaseType.LIABILITY_HEAVY,
        70
      ),
      createPhase(
        'The Last Thaw',
        'Vrokhar surrenders the cold to one final, desperate surge. Hold until it melts.',
        2,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        68
      )
    ],
    createLootItem(
      'frozen-oathguard',
      'Frozen Oathguard',
      "A shield of unmelting ice, etched with a vow Vrokhar's wardens kept past death.",
      Role.TANK,
      3,
      3,
      'Vrokhar, the Frostbound Warden'
    )
  ),

  createBoss(
    'Zaelith, Herald of the Tempest',
    'The Storm Unbroken',
    [
      createPhase(
        'Gathering Fury',
        'Wind howls into a wall of force. Strike before the gale finds your footing.',
        3,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        68
      ),
      createPhase(
        'Chainlightning Cascade',
        'Lightning leaps from soul to soul. Mind the chain, or carry it to the rest.',
        2,
        1,
        3,
        PhaseType.LIABILITY_HEAVY,
        74
      ),
      createPhase(
        'Eye of the Maelstrom',
        'Zaelith calls down the full storm. Endure its eye, or be scattered on the wind.',
        3,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        76
      )
    ],
    createLootItem(
      'stormcallers-edge',
      "Stormcaller's Edge",
      'A blade that hums with caught lightning, restless until it strikes again.',
      Role.DPS,
      3,
      3,
      'Zaelith, Herald of the Tempest'
    )
  ),

  createBoss(
    'Karthus, the Bone Sovereign',
    'Lord of the Silent Crypt',
    [
      createPhase(
        'March of the Risen',
        'The crypt empties itself. Cut them down before the column overwhelms you.',
        4,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        70
      ),
      createPhase(
        "The Sovereign's Decree",
        'Karthus speaks, and the dead obey. Heed the decree, or be bound by it.',
        1,
        2,
        3,
        PhaseType.LIABILITY_HEAVY,
        72
      ),
      createPhase(
        'Crown of Bones',
        'The Sovereign rises in his full regalia. Break the crown before it breaks you.',
        2,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        78
      )
    ],
    createLootItem(
      'sovereigns-marrow-draught',
      "Sovereign's Marrow Draught",
      "A bitter tonic distilled from Karthus's own marrow — it steadies the hand that drinks it.",
      Role.HEAL,
      3,
      3,
      'Karthus, the Bone Sovereign'
    )
  ),

  createBoss(
    'Grizzelmaw, the Feral Sovereign',
    'Fang of the Deep Wood',
    [
      createPhase(
        'The Hunt Begins',
        'The wood erupts with snarling shapes. Strike fast — Grizzelmaw rewards the bold.',
        4,
        1,
        1,
        PhaseType.SKILL_HEAVY,
        66
      ),
      createPhase(
        'Thrash and Bleed',
        'Claws rake wide and reckless. Mind your footing, or be dragged into the thrash.',
        2,
        3,
        2,
        PhaseType.LIABILITY_HEAVY,
        71
      ),
      createPhase(
        "The Alpha's Last Roar",
        'Grizzelmaw bares everything in one final charge. Hold the line against the roar.',
        3,
        2,
        1,
        PhaseType.SKILL_HEAVY,
        74
      )
    ],
    createLootItem(
      'alphas-bloodfang',
      "Alpha's Bloodfang",
      'A curved fang taken from Grizzelmaw, still warm with the hunt.',
      Role.DPS,
      3,
      3,
      'Grizzelmaw, the Feral Sovereign'
    )
  ),

  createBoss(
    'The Hollow Author',
    'Writer of Unmade Things',
    [
      createPhase(
        'The First Erasure',
        'Whole chapters of the world unwrite themselves. Strike before you are edited out.',
        3,
        1,
        2,
        PhaseType.SKILL_HEAVY,
        69
      ),
      createPhase(
        'Pages of the Unwritten',
        'Blank pages drift through the air, hungry for a story. Mind what they take.',
        1,
        2,
        3,
        PhaseType.LIABILITY_HEAVY,
        75
      ),
      createPhase(
        'The Final Sentence',
        'The Author reaches for the last word. Survive it, and the story is yours.',
        3,
        3,
        3,
        PhaseType.SKILL_HEAVY,
        80
      )
    ],
    createLootItem(
      'ink-of-the-unwritten-verse',
      'Ink of the Unwritten Verse',
      'Ink that has never touched a page — it writes only what its bearer needs to hear.',
      Role.HEAL,
      3,
      3,
      'The Hollow Author'
    )
  ),

  createBoss(
    'Countess Mireth, the Crimson Thirst',
    'The Eternal Banquet',
    [
      createPhase(
        'Invitation to the Feast',
        'The hall doors swing open on a banquet of knives. Strike before you are seated.',
        3,
        2,
        1,
        PhaseType.SKILL_HEAVY,
        64
      ),
      createPhase(
        'The Crimson Waltz',
        'Mireth leads a dance no one survives twice. Mind your steps, or join the dead partners.',
        2,
        2,
        3,
        PhaseType.LIABILITY_HEAVY,
        73
      ),
      createPhase(
        'Last Call of the Banquet',
        'The Countess drops all pretense and feeds in earnest. Hold until the table is cleared.',
        4,
        1,
        2,
        PhaseType.SKILL_HEAVY,
        77
      )
    ],
    createLootItem(
      'mireths-thirsting-fang',
      "Mireth's Thirsting Fang",
      'A dagger that drinks shallow — just enough to keep its wielder sharp.',
      Role.DPS,
      3,
      3,
      'Countess Mireth, the Crimson Thirst'
    )
  ),

  createBoss(
    'The Sundered Titan',
    'Last Bastion of the Old World',
    [
      createPhase(
        'The Awakening Fault',
        'The ground splits as something ancient stirs beneath it. Strike before it fully wakes.',
        2,
        3,
        1,
        PhaseType.SKILL_HEAVY,
        62
      ),
      createPhase(
        'Fissure and Fall',
        'The earth opens in jagged lines. Mind your footing, or be swallowed by the fault.',
        1,
        3,
        3,
        PhaseType.LIABILITY_HEAVY,
        71
      ),
      createPhase(
        "The Titan's Final Stand",
        'The Sundered Titan gathers the last of the old world into one final blow. Endure it.',
        3,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        79
      )
    ],
    createLootItem(
      'shard-of-the-sundered-core',
      'Shard of the Sundered Core',
      "A fragment of the Titan's core, still warm with the heartbeat of the old world.",
      Role.TANK,
      3,
      3,
      'The Sundered Titan'
    )
  )
]

export function getMembersByRole(role: Role): MemberData[] {
  return memberPool.filter((member) => member.role === role)
}
