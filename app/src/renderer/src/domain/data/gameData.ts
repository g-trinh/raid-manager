import { BossData, createBoss } from './bossData'
import { createPhase, PhaseType } from './bossPhaseData'
import { createLootItem } from './lootData'
import { createMember, MemberData } from './memberData'
import { Role } from './role'

export const memberPool: MemberData[] = [
  // Tanks — pool has 3, draft caps at 2
  createMember('Gorvak', Role.TANK, 2, 3),
  createMember('Shieldara', Role.TANK, 4, 1),
  createMember('Bruthan', Role.TANK, 3, 2),

  // Healers — pool has 3, draft caps at 2
  createMember('Lumina', Role.HEAL, 1, 4),
  createMember('Patchwick', Role.HEAL, 2, 3),
  createMember('Serenova', Role.HEAL, 5, 1),

  // DPS — pool has 5, draft caps at 4
  createMember('Razorfang', Role.DPS, 4, 1),
  createMember('Blitzclaw', Role.DPS, 3, 2),
  createMember('Vexara', Role.DPS, 5, 1),
  createMember('Skarn', Role.DPS, 1, 4),
  createMember('Duskblade', Role.DPS, 1, 4)
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
        3.3
      ),
      createPhase(
        'The Branding Rite',
        'Molten chains seek the careless. Mind the rite, or be claimed by it.',
        1,
        3,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.5
      ),
      createPhase(
        'The Last Smelting',
        'Moloch bares its core. Endure the final heat — the weary will not last alone.',
        2,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        3.0
      )
    ],
    [
      createLootItem(
        'iron-inferno-brand',
        'Iron Inferno Brand',
        "A fragment of Moloch's forge-chains, etched with the heat that broke the careless.",
        Role.DPS,
        1,
        1,
        'Moloch the Unbound',
        1
      ),
      createLootItem(
        'brand-scarred-manacle',
        'Brand-Scarred Manacle',
        'A length of chain that once sought the careless; worn now, it seeks nothing but holds everything.',
        Role.TANK,
        1,
        1,
        'Moloch the Unbound',
        2,
        { [Role.TANK]: 60, [Role.HEAL]: 40 }
      ),
      createLootItem(
        'embered-patience',
        'Embered Patience',
        'A coal that never cools, carried by those who learned the weary do not last alone.',
        Role.HEAL,
        1,
        1,
        'Moloch the Unbound',
        3,
        { [Role.HEAL]: 50, [Role.DPS]: 25, [Role.TANK]: 25 }
      )
    ]
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
        3.3
      ),
      createPhase(
        'Communion of Decay',
        'Toxin blooms in pulsing waves. Read the pattern, or join the chorus of the fallen.',
        1,
        2,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.6
      ),
      createPhase(
        'The Last Bloom',
        'Sythara unravels into spore and spite. Hold the line until the bloom withers.',
        2,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        3.5
      )
    ],
    [
      createLootItem(
        'spore-touched-fang',
        'Spore-Touched Fang',
        "A tooth coated in Sythara's first breath of rot; it bites once, and the wound never quite heals clean.",
        Role.DPS,
        1,
        1,
        'Sythara the Plaguebound',
        1
      ),
      createLootItem(
        'vial-of-the-withering-bloom',
        'Vial of the Withering Bloom',
        "A sealed dose of Sythara's own rot, refined into something that steadies rather than spreads.",
        Role.HEAL,
        1,
        1,
        'Sythara the Plaguebound',
        2
      ),
      createLootItem(
        'rootbound-carapace',
        'Rootbound Carapace',
        'Bark-like plating grown from the last bloom, hard enough to hold the line until the rot withers on its own.',
        Role.TANK,
        1,
        1,
        'Sythara the Plaguebound',
        3
      )
    ]
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
        3.6
      ),
      createPhase(
        'The Devouring Hush',
        'Silence swallows sound and sense alike. Mind the hush, or be unmade within it.',
        2,
        3,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.9
      ),
      createPhase(
        'Collapse of the Final Star',
        'Nyxessa pours her last light into ruin. Endure it together, or not at all.',
        3,
        3,
        3,
        PhaseType.SKILL_HEAVY,
        3.8
      )
    ],
    [
      createLootItem(
        'hollow-star-shard',
        'Hollow Star Shard',
        "A splinter of Nyxessa's collapsed light, sharp enough to cut even in total darkness.",
        Role.DPS,
        1,
        1,
        'Nyxessa, Empress of the Hollow Stars',
        1
      ),
      createLootItem(
        'silence-worn-aegis',
        'Silence-Worn Aegis',
        'A shield that has absorbed a sound it will never give back.',
        Role.TANK,
        1,
        1,
        'Nyxessa, Empress of the Hollow Stars',
        2,
        { [Role.TANK]: 60, [Role.HEAL]: 40 }
      ),
      createLootItem(
        'last-light-caught',
        'Last Light, Caught',
        "A weapon that carries one final flare of Nyxessa's dying star, spent the instant it's needed most.",
        Role.DPS,
        1,
        1,
        'Nyxessa, Empress of the Hollow Stars',
        3,
        { [Role.DPS]: 45, [Role.TANK]: 30, [Role.HEAL]: 25 }
      )
    ]
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
        3.3
      ),
      createPhase(
        'Wardens of the Frozen Oath',
        'Frozen sentinels rise to enforce the old pact. Mind their ground, or join their vigil.',
        1,
        3,
        2,
        PhaseType.DISCIPLINE_HEAVY,
        3.5
      ),
      createPhase(
        'The Last Thaw',
        'Vrokhar surrenders the cold to one final, desperate surge. Hold until it melts.',
        2,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        3.4
      )
    ],
    [
      createLootItem(
        'shardbreaker-point',
        'Shardbreaker Point',
        'A weapon-tip that has already cracked through one wall of ice; the next is easier.',
        Role.DPS,
        1,
        1,
        'Vrokhar, the Frostbound Warden',
        1
      ),
      createLootItem(
        'frozen-oathguard',
        'Frozen Oathguard',
        "A shield of unmelting ice, etched with a vow Vrokhar's wardens kept past death.",
        Role.TANK,
        1,
        1,
        'Vrokhar, the Frostbound Warden',
        2
      ),
      createLootItem(
        'vigils-final-frost',
        "Vigil's Final Frost",
        'The last cold Vrokhar surrendered, held now by those who hold the line until it melts.',
        Role.TANK,
        1,
        1,
        'Vrokhar, the Frostbound Warden',
        3,
        { [Role.TANK]: 50, [Role.HEAL]: 30, [Role.DPS]: 20 }
      )
    ]
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
        3.4
      ),
      createPhase(
        'Chainlightning Cascade',
        'Lightning leaps from soul to soul. Mind the chain, or carry it to the rest.',
        2,
        1,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.7
      ),
      createPhase(
        'Eye of the Maelstrom',
        'Zaelith calls down the full storm. Endure its eye, or be scattered on the wind.',
        3,
        2,
        2,
        PhaseType.SKILL_HEAVY,
        3.8
      )
    ],
    [
      createLootItem(
        'stormcallers-edge',
        "Stormcaller's Edge",
        'A blade that hums with caught lightning, restless until it strikes again.',
        Role.DPS,
        1,
        1,
        'Zaelith, Herald of the Tempest',
        1
      ),
      createLootItem(
        'chainlight-reliquary',
        'Chainlight Reliquary',
        "A censer that hums with leftover current from Zaelith's chain-lightning; its glow leaps between the wounded, mending each in turn.",
        Role.HEAL,
        1,
        1,
        'Zaelith, Herald of the Tempest',
        2
      ),
      createLootItem(
        'maelstroms-eye',
        "Maelstrom's Eye",
        "A shard of perfect stillness torn from the storm's heart; wielded, it strikes exactly where the chaos isn't.",
        Role.DPS,
        1,
        1,
        'Zaelith, Herald of the Tempest',
        3
      )
    ]
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
        3.5
      ),
      createPhase(
        "The Sovereign's Decree",
        'Karthus speaks, and the dead obey. Heed the decree, or be bound by it.',
        1,
        2,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.6
      ),
      createPhase(
        'Crown of Bones',
        'The Sovereign rises in his full regalia. Break the crown before it breaks you.',
        2,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        3.9
      )
    ],
    [
      createLootItem(
        'gravecallers-edge',
        "Gravecaller's Edge",
        'Forged from a blade the risen carried in their march; it remembers the rhythm of the advance and never breaks stride.',
        Role.DPS,
        1,
        1,
        'Karthus, the Bone Sovereign',
        1
      ),
      createLootItem(
        'sovereigns-marrow-draught',
        "Sovereign's Marrow Draught",
        "A bitter tonic distilled from Karthus's own marrow — it steadies the hand that drinks it.",
        Role.HEAL,
        1,
        1,
        'Karthus, the Bone Sovereign',
        2
      ),
      createLootItem(
        'crownbone-aegis',
        'Crownbone Aegis',
        "A plate torn from the Sovereign's own crown of bones; it shields its wearer the way a king shields his throne — absolutely, and without apology.",
        Role.TANK,
        1,
        1,
        'Karthus, the Bone Sovereign',
        3
      )
    ]
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
        3.3
      ),
      createPhase(
        'Thrash and Bleed',
        'Claws rake wide and reckless. Mind your footing, or be dragged into the thrash.',
        2,
        3,
        2,
        PhaseType.DISCIPLINE_HEAVY,
        3.6
      ),
      createPhase(
        "The Alpha's Last Roar",
        'Grizzelmaw bares everything in one final charge. Hold the line against the roar.',
        3,
        2,
        1,
        PhaseType.SKILL_HEAVY,
        3.7
      )
    ],
    [
      createLootItem(
        'first-scent-dagger',
        'First Scent Dagger',
        "Carved from the claw that drew first blood; it strikes before the prey even knows it's been found.",
        Role.DPS,
        1,
        1,
        'Grizzelmaw, the Feral Sovereign',
        1
      ),
      createLootItem(
        'thrashbound-hide',
        'Thrashbound Hide',
        'Hide flayed from Grizzelmaw mid-thrash, cured into plating that absorbs a beating meant for someone else.',
        Role.TANK,
        1,
        1,
        'Grizzelmaw, the Feral Sovereign',
        2
      ),
      createLootItem(
        'alphas-bloodfang',
        "Alpha's Bloodfang",
        'A curved fang taken from Grizzelmaw, still warm with the hunt.',
        Role.DPS,
        1,
        1,
        'Grizzelmaw, the Feral Sovereign',
        3
      )
    ]
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
        3.5
      ),
      createPhase(
        'Pages of the Unwritten',
        'Blank pages drift through the air, hungry for a story. Mind what they take.',
        1,
        2,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.8
      ),
      createPhase(
        'The Final Sentence',
        'The Author reaches for the last word. Survive it, and the story is yours.',
        3,
        3,
        3,
        PhaseType.SKILL_HEAVY,
        4.0
      )
    ],
    [
      createLootItem(
        'erasures-edge',
        "Erasure's Edge",
        'A blade that cuts not flesh but existence; what it strikes is written out of the story entirely.',
        Role.DPS,
        1,
        1,
        'The Hollow Author',
        1
      ),
      createLootItem(
        'ink-of-the-unwritten-verse',
        'Ink of the Unwritten Verse',
        'Ink that has never touched a page — it writes only what its bearer needs to hear.',
        Role.HEAL,
        1,
        1,
        'The Hollow Author',
        2
      ),
      createLootItem(
        'last-punctuation',
        'Last Punctuation',
        "A single mark of ink that refuses to be the period on someone's story; it mends what the Author tried to end.",
        Role.HEAL,
        1,
        1,
        'The Hollow Author',
        3,
        { [Role.HEAL]: 45, [Role.TANK]: 30, [Role.DPS]: 25 }
      )
    ]
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
        3.2
      ),
      createPhase(
        'The Crimson Waltz',
        'Mireth leads a dance no one survives twice. Mind your steps, or join the dead partners.',
        2,
        2,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.7
      ),
      createPhase(
        'Last Call of the Banquet',
        'The Countess drops all pretense and feeds in earnest. Hold until the table is cleared.',
        4,
        1,
        2,
        PhaseType.SKILL_HEAVY,
        3.9
      )
    ],
    [
      createLootItem(
        'mireths-thirsting-fang',
        "Mireth's Thirsting Fang",
        'A dagger that drinks shallow — just enough to keep its wielder sharp.',
        Role.DPS,
        1,
        1,
        'Countess Mireth, the Crimson Thirst',
        1
      ),
      createLootItem(
        'waltz-worn-pendant',
        'Waltz-Worn Pendant',
        "Worn during the Countess's endless dance, it keeps time with a heartbeat — and lends a few extra beats to whoever needs them most.",
        Role.HEAL,
        1,
        1,
        'Countess Mireth, the Crimson Thirst',
        2
      ),
      createLootItem(
        'last-call-stiletto',
        'Last Call Stiletto',
        "Mireth's own blade, set down when the banquet ended; it still thirsts for one more course.",
        Role.DPS,
        1,
        1,
        'Countess Mireth, the Crimson Thirst',
        3
      )
    ]
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
        3.1
      ),
      createPhase(
        'Fissure and Fall',
        'The earth opens in jagged lines. Mind your footing, or be swallowed by the fault.',
        1,
        3,
        3,
        PhaseType.DISCIPLINE_HEAVY,
        3.6
      ),
      createPhase(
        "The Titan's Final Stand",
        'The Sundered Titan gathers the last of the old world into one final blow. Endure it.',
        3,
        3,
        2,
        PhaseType.SKILL_HEAVY,
        4.0
      )
    ],
    [
      createLootItem(
        'shard-of-the-sundered-core',
        'Shard of the Sundered Core',
        "A fragment of the Titan's core, still warm with the heartbeat of the old world.",
        Role.TANK,
        1,
        1,
        'The Sundered Titan',
        1
      ),
      createLootItem(
        'fissure-sealing-balm',
        'Fissure-Sealing Balm',
        "An unguent drawn from the Titan's own crackling veins; it closes wounds the way the earth tries, and fails, to close itself.",
        Role.HEAL,
        1,
        1,
        'The Sundered Titan',
        2,
        { [Role.HEAL]: 60, [Role.TANK]: 40 }
      ),
      createLootItem(
        'last-bastion-plating',
        'Last Bastion Plating',
        'A plate broken from the Titan in its final moments of standing; wear it, and for a while, you become the bastion.',
        Role.TANK,
        1,
        1,
        'The Sundered Titan',
        3,
        { [Role.TANK]: 55, [Role.DPS]: 45 }
      )
    ]
  )
]

export function getMembersByRole(role: Role): MemberData[] {
  return memberPool.filter((member) => member.role === role)
}
