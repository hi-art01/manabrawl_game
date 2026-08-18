window.ModifierPool = [
    'None',
    'Low Gravity',
    'Heavy Gravity',
    'Arcane Surge',
    'Mana Drought',
    'Sudden Death',
    'Orb Storm',
    'Ultimate Fever',
    'Haste',
    'Glass Cannon',
    'Hazard Rush'
];

window.ModifierDescriptions = {
    Random: {
        name: 'Random',
        description: 'A different modifier is chosen at the start of every round.'
    },
    None: {
        name: 'None',
        description: 'No extra rules. Just the fighters, the map, and clean brawling.'
    },
    'Low Gravity': {
        name: 'Low Gravity',
        description: 'Everyone falls more slowly, making jumps floatier and aerial fights easier.'
    },
    'Heavy Gravity': {
        name: 'Heavy Gravity',
        description: 'Everyone falls faster, making jumps lower and ground control more important.'
    },
    'Arcane Surge': {
        name: 'Arcane Surge',
        description: 'All mana gains are doubled, so abilities come out much faster.'
    },
    'Mana Drought': {
        name: 'Mana Drought',
        description: 'All mana gains are reduced, making every cast and pickup matter more.'
    },
    'Sudden Death': {
        name: 'Sudden Death',
        description: 'After 30 seconds, both players start taking damage every second.'
    },
    'Orb Storm': {
        name: 'Orb Storm',
        description: 'Mana potions and ultimate orbs spawn more often across the arena.'
    },
    'Ultimate Fever': {
        name: 'Ultimate Fever',
        description: 'Both fighters start with ultimate charge, and ultimate orbs appear more often.'
    },
    Haste: {
        name: 'Haste',
        description: 'Both fighters move faster and recover from ability casts slightly sooner.'
    },
    'Glass Cannon': {
        name: 'Glass Cannon',
        description: 'Both fighters deal much more damage but start with less max health.'
    },
    'Hazard Rush': {
        name: 'Hazard Rush',
        description: 'Map hazards begin sooner and strike the arena much more often.'
    }
};

window.GameSpeedDefinitions = {
    Blitz: {
        name: 'Blitz',
        description: 'Short rounds: fighters have 80% health and player damage is 120%.',
        healthMultiplier: 0.8,
        damageMultiplier: 1.2,
        timeScale: 1.08
    },
    Normal: {
        name: 'Normal',
        description: 'Standard health and damage.',
        healthMultiplier: 1,
        damageMultiplier: 1,
        timeScale: 1
    },
    Long: {
        name: 'Long',
        description: 'Longer rounds: fighters have 135% health and player damage is 85%.',
        healthMultiplier: 1.35,
        damageMultiplier: 0.85,
        timeScale: 0.98
    },
    Epic: {
        name: 'Epic',
        description: 'Very long rounds: fighters have 180% health and player damage is 70%.',
        healthMultiplier: 1.8,
        damageMultiplier: 0.7,
        timeScale: 0.95
    }
};

window.StoryBossRules = {
    Priest: { map: 'Celestial Tower', modifier: 'Ultimate Fever' },
    Devil: { map: 'Lava Caverns', modifier: 'Sudden Death' },
    Fighter: { map: 'Central Arena', modifier: 'Haste' },
    Mage: { map: 'Celestial Tower', modifier: 'Arcane Surge' },
    Barbarian: { map: 'Chaos Bridges', modifier: 'Heavy Gravity' },
    Spearman: { map: 'Sky Pillars', modifier: 'Low Gravity' },
    Necromancer: { map: 'Floating Isles', modifier: 'Mana Drought' },
    Assassin: { map: 'Chaos Bridges', modifier: 'Haste' },
    Trapper: { map: 'Lava Caverns', modifier: 'Hazard Rush' },
    Gambler: { map: 'Central Arena', modifier: 'Orb Storm' },
    Sniper: { map: 'Titan Expanse', modifier: 'Glass Cannon' },
    Alchemist: { map: 'Lava Caverns', modifier: 'Orb Storm' },
    Guardian: { map: 'Central Arena', modifier: 'Heavy Gravity' },
    GravityMage: { map: 'Sky Pillars', modifier: 'Heavy Gravity' },
    Duelist: { map: 'Celestial Tower', modifier: 'Ultimate Fever' },
    Gojo: { map: 'Celestial Tower', modifier: 'Mana Drought' },
    Sukuna: { map: 'Lava Caverns', modifier: 'Sudden Death' },
    Killua: { map: 'Sky Pillars', modifier: 'Haste' },
    Knuckle: { map: 'Central Arena', modifier: 'Mana Drought' },
    Sinbad: { map: 'Floating Isles', modifier: 'Orb Storm' },
    Mahoraga: { map: 'Chaos Bridges', modifier: 'Hazard Rush' },
    Aladdin: { map: 'Sky Pillars', modifier: 'Arcane Surge' },
    Alibaba: { map: 'Lava Caverns', modifier: 'Haste' },
    Escanor: { map: 'Celestial Tower', modifier: 'Glass Cannon' },
    Saber: { map: 'Central Arena', modifier: 'None' },
    Archer: { map: 'Titan Expanse', modifier: 'Glass Cannon' },
    Lancer: { map: 'Sky Pillars', modifier: 'Low Gravity' },
    Gilgamesh: { map: 'Celestial Tower', modifier: 'Ultimate Fever' },
    RiderZero: { map: 'Floating Isles', modifier: 'Hazard Rush' },
    RiderStayNight: { map: 'Titan Expanse', modifier: 'Haste' },
    CasterZero: { map: 'Floating Isles', modifier: 'Mana Drought' },
    CasterStayNight: { map: 'Celestial Tower', modifier: 'Arcane Surge' },
    AssassinZero: { map: 'Chaos Bridges', modifier: 'Mana Drought' },
    AssassinStayNight: { map: 'Central Arena', modifier: 'Haste' },
    BerserkerZero: { map: 'Chaos Bridges', modifier: 'Heavy Gravity' },
    BerserkerStayNight: { map: 'Lava Caverns', modifier: 'Sudden Death' }
};

window.NPCLevelDefinitions = {
    Rookie: {
        name: 'Rookie',
        description: 'Slower reactions, light bonuses, and delayed adaptation.',
        stats: { maxHealth: 0, maxMana: 10, speed: 0.2, damageMultiplier: 0.05, manaRegen: 0.5, ultimateStart: 5 },
        ai: {
            aggression: 0.78,
            followThrough: 0.72,
            avoidance: 0.45,
            pickupBias: 0.75,
            bonusAttackChance: 0.01,
            ultimateChance: 0.55,
            draftSkill: 0.45,
            adaptAfterHits: 4,
            adaptDamageTaken: 55,
            adaptWindow: 3.2,
            adaptDuration: 1.6,
            adaptCooldown: 4.5
        },
        upgradePriority: ['health', 'mana', 'speed', 'damage']
    },
    Adept: {
        name: 'Adept',
        description: 'Balanced reactions and bonuses. Close to the old NPC strength.',
        stats: { maxHealth: 25, maxMana: 20, speed: 0.8, damageMultiplier: 0.18, manaRegen: 2, ultimateStart: 20 },
        ai: {
            aggression: 1,
            followThrough: 0.9,
            avoidance: 0.68,
            pickupBias: 1,
            bonusAttackChance: 0.025,
            ultimateChance: 0.85,
            draftSkill: 0.85,
            adaptAfterHits: 3,
            adaptDamageTaken: 42,
            adaptWindow: 3,
            adaptDuration: 2.2,
            adaptCooldown: 3.4
        },
        upgradePriority: ['damage', 'health', 'mana', 'speed']
    },
    Veteran: {
        name: 'Veteran',
        description: 'Sharper defense, better drafts, and quicker tactical changes.',
        stats: { maxHealth: 35, maxMana: 30, speed: 1, damageMultiplier: 0.25, manaRegen: 2.8, ultimateStart: 28, cooldownReduction: 0.06 },
        ai: {
            aggression: 1.18,
            followThrough: 0.98,
            avoidance: 0.82,
            pickupBias: 1.25,
            bonusAttackChance: 0.045,
            ultimateChance: 1,
            draftSkill: 1,
            adaptAfterHits: 3,
            adaptDamageTaken: 34,
            adaptWindow: 3.4,
            adaptDuration: 2.8,
            adaptCooldown: 2.5
        },
        upgradePriority: ['damage', 'mana', 'health', 'speed']
    },
    Nightmare: {
        name: 'Nightmare',
        description: 'Relentless pressure, constant healing, fast adaptation, and heavy bonuses.',
        stats: { maxHealth: 70, maxMana: 55, speed: 1.55, damageMultiplier: 0.45, manaRegen: 4.5, healthRegen: 3.5, mahoragaHealthRegenBonus: 1.75, ultimateStart: 50, cooldownReduction: 0.14 },
        ai: {
            aggression: 1.55,
            followThrough: 1,
            avoidance: 0.96,
            pickupBias: 1.65,
            bonusAttackChance: 0.09,
            ultimateChance: 1,
            draftSkill: 1,
            adaptAfterHits: 2,
            adaptDamageTaken: 22,
            adaptWindow: 4.2,
            adaptDuration: 3.8,
            adaptCooldown: 1.2
        },
        upgradePriority: ['damage', 'mana', 'speed', 'health']
    }
};

window.TalentDefinitions = [
    {
        id: 'shadow-step',
        name: 'Shadow Step',
        description: '10% chance to dodge incoming damage. Dodges restore 10 mana.',
        effects: { dodgeChance: 0.10, manaOnDodge: 10 }
    },
    {
        id: 'iron-skin',
        name: 'Iron Current',
        description: 'Take 8% less damage. Damage taken restores mana equal to 15% of the damage.',
        effects: { damageReduction: 0.08, manaOnDamageTaken: 0.15 }
    },
    {
        id: 'sharp-edge',
        name: 'Spell Edge',
        description: 'Hits restore 4 mana and 2 ultimate charge.',
        effects: { onHitManaFlat: 4, onHitUltimateFlat: 2 }
    },
    {
        id: 'vital-spark',
        name: 'Second Wind',
        description: 'Once per round below 35% health, heal 30 and gain 25 mana.',
        effects: { secondWindThreshold: 0.35, secondWindHeal: 30, secondWindMana: 25 }
    },
    {
        id: 'deep-reserves',
        name: 'Potion Scholar',
        description: 'Mana potions grant 35 extra mana and heal 10 health.',
        effects: { potionManaBonus: 35, potionHeal: 10 }
    },
    {
        id: 'quick-boots',
        name: 'Quick Cast',
        description: 'Ability lockout is 0.15 seconds shorter.',
        effects: { cooldownReduction: 0.15 }
    },
    {
        id: 'mana-bloom',
        name: 'Aerial Bloom',
        description: 'Regenerate 5 mana per second while airborne.',
        effects: { airborneManaRegen: 5 }
    },
    {
        id: 'ultimate-spark',
        name: 'Orb Hunter',
        description: 'Start with 20% ultimate charge. Ultimate orbs grant 25 extra charge.',
        effects: { ultimateStart: 20, orbUltimateBonus: 25 }
    },
    {
        id: 'siphon-hits',
        name: 'Siphon Hits',
        description: 'Heal for 12% of the damage you deal and steal 5 mana on hit.',
        effects: { lifeSteal: 0.12, manaBurnOnHit: 5, manaGainOnBurn: 5 }
    },
    {
        id: 'spring-step',
        name: 'Spring Battery',
        description: 'Jumps grant 5 mana and 2 ultimate charge.',
        effects: { manaOnJump: 5, ultimateOnJump: 2 }
    },
    {
        id: 'warheart',
        name: 'Warheart',
        description: 'Below 40% health, gain 20% damage and regenerate 2 mana per second.',
        effects: { lowHealthThreshold: 0.40, lowHealthDamageMultiplier: 0.20, lowHealthManaRegen: 2 }
    },
    {
        id: 'arcane-vessel',
        name: 'Arcane Vessel',
        description: '+20 max mana. While your mana is full, gain 4 ultimate charge per second.',
        effects: { maxMana: 20, fullManaUltimateRegen: 4 }
    },
    {
        id: 'duelist-stance',
        name: 'Duelist Stance',
        description: 'Hits burn 10 enemy mana and grant 2 ultimate charge.',
        effects: { manaBurnOnHit: 10, onHitUltimateFlat: 2 }
    },
    {
        id: 'windrunner',
        name: 'Windrunner',
        description: 'Picking up a potion or orb grants +2 speed for 3 seconds.',
        effects: { pickupSpeed: 2, pickupBoostDuration: 3 }
    },
    {
        id: 'starlit-focus',
        name: 'Starlit Focus',
        description: 'After using your ultimate, keep 20 ultimate charge.',
        effects: { ultimateRefund: 20 }
    },
    {
        id: 'mirror-guard',
        name: 'Mirror Guard',
        description: '8% chance to dodge. Dodges heal 8 and restore 8 mana.',
        effects: { dodgeChance: 0.08, healOnDodge: 8, manaOnDodge: 8 }
    },
    {
        id: 'vampiric-core',
        name: 'Vampiric Core',
        description: 'Heal for 16% of the damage you deal and gain 1 ultimate charge on hit.',
        effects: { lifeSteal: 0.16, onHitUltimateFlat: 1 }
    },
    {
        id: 'colossus-blood',
        name: 'Stonebound',
        description: 'Take 50% less hazard damage. Below 40% health, take 18% less damage.',
        effects: { hazardDamageReduction: 0.50, lowHealthThreshold: 0.40, lowHealthDamageReduction: 0.18 }
    },
    {
        id: 'quick-cast',
        name: 'Overflow Bloom',
        description: 'Mana potions grant 15 ultimate charge, and ultimate orbs grant 20 mana.',
        effects: { potionUltimateBonus: 15, orbManaBonus: 20 }
    },
    {
        id: 'spellbreaker',
        name: 'Spellbreaker',
        description: 'Hits burn 14 enemy mana. If mana was burned, gain 7 mana.',
        effects: { manaBurnOnHit: 14, manaGainOnBurn: 7 }
    }
];

window.CharacterSelectMeta = {
    Priest: { role: 'Support', difficulty: 'Max', stats: { hp: 3, mana: 4, speed: 2, range: 4, damage: 2, scaling: 3 } },
    Devil: { role: 'Brawler', difficulty: 'Medium', stats: { hp: 3, mana: 2, speed: 3, range: 2, damage: 4, scaling: 3 } },
    Fighter: { role: 'Shooter', difficulty: 'Easy', stats: { hp: 3, mana: 3, speed: 3, range: 4, damage: 3, scaling: 3 } },
    Mage: { role: 'Burst Mage', difficulty: 'Hard', stats: { hp: 2, mana: 5, speed: 2, range: 5, damage: 5, scaling: 4 } },
    Barbarian: { role: 'Tank', difficulty: 'Easy', stats: { hp: 5, mana: 2, speed: 1, range: 2, damage: 4, scaling: 2 } },
    Spearman: { role: 'Poke', difficulty: 'Medium', stats: { hp: 3, mana: 3, speed: 3, range: 4, damage: 5, scaling: 2 } },
    Necromancer: { role: 'Summoner', difficulty: 'Medium', stats: { hp: 3, mana: 4, speed: 2, range: 4, damage: 3, scaling: 5 } },
    Assassin: { role: 'Assassin', difficulty: 'Hard', stats: { hp: 2, mana: 3, speed: 5, range: 1, damage: 5, scaling: 2 } },
    Trapper: { role: 'Setup', difficulty: 'Hard', stats: { hp: 3, mana: 4, speed: 3, range: 3, damage: 3, scaling: 4 } },
    Broker: { role: 'Scaler', difficulty: 'Hard', stats: { hp: 3, mana: 4, speed: 3, range: 3, damage: 3, scaling: 5 } },
    Gambler: { role: 'Chaos', difficulty: 'Hard', stats: { hp: 3, mana: 3, speed: 3, range: 3, damage: 4, scaling: 5 } },
    Sniper: { role: 'Marksman', difficulty: 'Hard', stats: { hp: 1, mana: 5, speed: 4, range: 5, damage: 5, scaling: 2 } },
    Alchemist: { role: 'Engineer', difficulty: 'Medium', stats: { hp: 3, mana: 4, speed: 2, range: 4, damage: 3, scaling: 4 } },
    Guardian: { role: 'Defender', difficulty: 'Medium', stats: { hp: 5, mana: 3, speed: 2, range: 2, damage: 3, scaling: 3 } },
    GravityMage: { role: 'Control', difficulty: 'Hard', stats: { hp: 3, mana: 4, speed: 2, range: 3, damage: 4, scaling: 4 } },
    Duelist: { role: 'Cards', difficulty: 'Hard', stats: { hp: 3, mana: 4, speed: 2, range: 4, damage: 4, scaling: 5 } }
};

window.DefaultCharacterSelectMeta = {
    role: 'Specialist',
    difficulty: 'Medium',
    stats: { hp: 3, mana: 3, speed: 3, range: 3, damage: 4, scaling: 4 }
};

window.UnlockableRewards = {
    Priest: 'Dawn Cleric Badge',
    Devil: 'Hellgate Sigil',
    Fighter: 'Full Auto Medal',
    Mage: 'Cataclysm Crest',
    Barbarian: 'Earthbreaker Title',
    Spearman: 'Phalanx Banner',
    Necromancer: 'Grave Legion Seal',
    Assassin: 'Death Mark Title',
    Trapper: 'Minefield Badge',
    Gambler: 'Jackpot Token',
    Sniper: 'Deadeye Medal',
    Alchemist: 'Chemical Crown',
    Guardian: 'Aegis Banner',
    GravityMage: 'Singularity Crest',
    Duelist: 'God Card Emblem'
};

window.UltimateDescriptions = {
    Priest: {
        name: 'Divine Sanctuary',
        description: 'Heals, cleanses control/mana lock effects, grants brief protection, and releases a holy nova.'
    },
    Devil: {
        name: 'Hellgate',
        description: 'Sacrifices a little health for a temporary damage boost and hellfire claws.'
    },
    Fighter: {
        name: 'Full Auto Barrage',
        description: 'Unloads a fast burst of bullets across several lanes.'
    },
    Mage: {
        name: 'Elemental Cataclysm',
        description: 'Detonates a huge arcane nova and launches elemental shards.'
    },
    Barbarian: {
        name: 'Earthbreaker',
        description: 'Heals, toughens up, and sends shockwaves along the ground.'
    },
    Spearman: {
        name: 'Phalanx Storm',
        description: 'Throws a spread of golden spears without losing the main spear.'
    },
    Necromancer: {
        name: 'Grave Legion',
        description: 'Raises extra undead and curses the enemy area.'
    },
    Assassin: {
        name: 'Death Mark',
        description: 'Vanishes behind the target and strikes with a lethal slash.'
    },
    Trapper: {
        name: 'Minefield',
        description: 'Explodes a ring of traps around the opponent.'
    },
    Broker: {
        name: 'Market Crash',
        description: 'Fires a hostile takeover contract that inverts controls, then crashes coins onto the target area.'
    },
    Gambler: {
        name: 'Jackpot Finale',
        description: 'Has a 1/3 chance to fully heal and gain infinite mana plus damage immunity for 30 seconds.'
    },
    Sniper: {
        name: 'Deadeye',
        description: 'Fires a guaranteed precision beam that knocks up, drains ultimate charge, and briefly locks mana.'
    },
    Alchemist: {
        name: 'Chemical Flood',
        description: 'Creates a toxic cloud and deploys emergency turrets.'
    },
    Guardian: {
        name: 'Aegis Nova',
        description: 'Heals, gains heavy protection, and blasts enemies away.'
    },
    GravityMage: {
        name: 'Singularity',
        description: 'Pulls the target into a gravity well and crushes the area.'
    },
    Duelist: {
        name: 'Egyptian God Summon',
        description: 'Randomly summons Slifer, Obelisk, or Ra: hand-scaling thunder, tribute-powered fists, or Life Point solar fire.'
    }
};

Object.assign(window.UltimateDescriptions, {
    Gojo: {
        name: 'Unlimited Void',
        description: 'Stuns the target in an information field and locks their mana briefly.'
    },
    Sukuna: {
        name: 'Malevolent Shrine',
        description: 'Opens a shrine that repeatedly cuts the target area from many angles.'
    },
    Killua: {
        name: 'Godspeed',
        description: 'Turns on speed, strength, and dodge buffs until Killua runs out of mana.'
    },
    Knuckle: {
        name: 'Hakoware Interest Spike',
        description: 'Makes Hakoware debt grow much faster; at max debt, the enemy loses mana and supers.'
    },
    Sinbad: {
        name: 'Seven Seas Djinn Equip',
        description: 'Randomly transforms into Baal, Valefor, Focalor, or Zepar for 12 seconds, replacing both abilities.'
    },
    Mahoraga: {
        name: 'Eight-Handled Wheel',
        description: 'Instantly adapts to one of the enemy moves that Mahoraga has not adapted to yet, including their super.'
    },
    Aladdin: {
        name: 'Ugo Giant Hand',
        description: 'Calls a huge rukh hand that lifts and crushes the enemy area.'
    },
    Alibaba: {
        name: 'Amon Djinn Equip',
        description: 'Empowers Alibaba and floods the target zone with Amon fire.'
    },
    Escanor: {
        name: 'The One',
        description: 'Becomes a sun-powered tank and drops a devastating miniature sun.'
    },
    Saber: {
        name: 'Excalibur',
        description: 'Fires a holy sword beam that rewards clean spacing and forward pressure.'
    },
    Archer: {
        name: 'Unlimited Blade Works',
        description: 'Summons swords from all around the enemy instead of firing them from Archer.'
    },
    Lancer: {
        name: 'Gae Bolg',
        description: 'Curses the target zone with a spear strike that launches and knocks back.'
    },
    Gilgamesh: {
        name: 'Enuma Elish',
        description: 'Uses Ea to tear a wide rift across the battlefield.'
    },
    RiderZero: {
        name: 'Ionioi Hetairoi',
        description: 'Summons a large skeleton army that fights for about 20 seconds.'
    },
    RiderStayNight: {
        name: 'Bellerophon',
        description: 'Rams forward with a huge Pegasus charge.'
    },
    CasterZero: {
        name: 'Sea Monster',
        description: 'Summons a massive monster zone for area denial.'
    },
    CasterStayNight: {
        name: 'Rule Breaker',
        description: 'Rushes in with the Noble Phantasm dagger, breaking mana, ultimate charge, and turning summons against their owner.'
    },
    AssassinZero: {
        name: 'Hundred Faces',
        description: 'Creates a permanent AI-controlled Hassan clone.'
    },
    AssassinStayNight: {
        name: 'Tsubame Gaeshi',
        description: 'Cuts the target zone with an unavoidable triple slash.'
    },
    BerserkerZero: {
        name: 'Knight of Owner',
        description: 'Turns the battlefield into a weapon storm while gaining protection.'
    },
    BerserkerStayNight: {
        name: 'God Hand',
        description: 'If his super bar is full when killed, Heracles consumes it to revive without losing the round.'
    }
});
