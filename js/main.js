const charMap = {
    'Priest': Priest,
    'Devil': Devil,
    'Fighter': Fighter,
    'Mage': Mage,
    'Barbarian': Barbarian,
    'Spearman': Spearman,
    'Necromancer': Necromancer,
    'Assassin': Assassin,
    'Trapper': Trapper,
    'Broker': Broker,
    'Gambler': Gambler,
    'Sniper': Sniper,
    'Alchemist': Alchemist,
    'Guardian': Guardian,
    'GravityMage': GravityMage,
    'Duelist': Duelist,
    'Gojo': Gojo,
    'Sukuna': Sukuna,
    'Killua': Killua,
    'Knuckle': Knuckle,
    'Sinbad': Sinbad,
    'Vader': Vader,
    'Mahoraga': Mahoraga,
    'Aladdin': Aladdin,
    'Alibaba': Alibaba,
    'Escanor': Escanor,
    'Saber': Saber,
    'Archer': Archer,
    'Lancer': Lancer,
    'Gilgamesh': Gilgamesh,
    'RiderZero': RiderZero,
    'RiderStayNight': RiderStayNight,
    'CasterZero': CasterZero,
    'CasterStayNight': CasterStayNight,
    'AssassinZero': AssassinZero,
    'AssassinStayNight': AssassinStayNight,
    'BerserkerZero': BerserkerZero,
    'BerserkerStayNight': BerserkerStayNight
};

const charInfo = {
    'Priest': { passive: "Passive: Regenerate Mana over time.", a1: "Heal (Cost: 40)", a2: "Light Beam (Cost: 20)" },
    'Devil': { passive: "Passive: Gain Mana by dealing damage.", a1: "Shadow Claw (Cost: 0, Low Dmg)", a2: "Dark Pact (Cost: 50, +Dmg, -HP)" },
    'Fighter': { passive: "Passive: 3 hits load Special Ammo (Mana Steal).", a1: "Shoot (Fast Bullet)", a2: "Rapid Fire (Cost: 30, 3-shot burst)" },
    'Mage': { passive: "Passive: High Max Mana, No Regen.", a1: "Ice Shard (Cost: 10)", a2: "Thunder (Cost: 50, Large AoE)" },
    'Barbarian': { passive: "Passive: Huge HP, Slow Speed.", a1: "Heavy Swing (Builder)", a2: "Rage (Cost: 50, 70% Dmg Reduc)" },
    'Spearman': { passive: "Passive: Long Range.", a1: "Thrust / Retrieve (Cost: 0)", a2: "Throw Spear (MASSIVE DMG)" },
    'Necromancer': { passive: "Passive: Refund Mana on minion death.", a1: "Summon Skeleton (Melee)", a2: "Summon Archer (Ranged)" },
    'Assassin': { passive: "Passive: Super Fast Speed.", a1: "Stab (High Dmg, Short Range)", a2: "Vanish (Brief Immunity + Stealth, Cooldown)" },
    'Trapper': { passive: "Passive: Regenerate Mana slowly.", a1: "Place Trap (Cost: 20)", a2: "Detonate All (Cost: 0)" },
    'Broker': { passive: "Passive: Gain mana over time. Refine levels are permanent.", a1: "Refine (Permanent Level Up, costs all Mana, min 20)", a2: "Transaction (Shoot/Swipe, damage scales hard with Level)" },
    'Gambler': { passive: "Jackpot moves shown above head.", a1: "Jackpot (Rand Class 10s / Uses moves if active)", a2: "Gamble (Heal roll or Rand Mana)" },
    'Sniper': { passive: "Passive: Rapid Mana Regen. Low HP.", a1: "Snipe (Full Mana only, 1/3 Chance of Insta-kill)", a2: "Dash (Quick burst)" },
    'Alchemist': { passive: "Passive: Regenerate Mana over time.", a1: "Summon Turret (Cost: 50, Auto-Aims)", a2: "Acid Blast (Cost: 20)" },
    'Guardian': { passive: "Passive: High HP, Block reduces damage by 90% and grants mana.", a1: "Shield Block (Hold to block and gain mana)", a2: "Ghost Dash (Cost: 30, Teleport & Smash)" },
    'GravityMage': { passive: "Passive: Gravity scales slam damage.", a1: "Gravity Surge (Slows and sinks opponent)", a2: "Crushing Fall (Slam into opponent for huge damage)" },
    'Duelist': { passive: "Passive: Draw cards to build your hand (max 3). Collect 5 Exodia pieces to win!", a1: "Draw/Cycle", a2: "Play Card" },
    ...(window.AnimeCharacterInfo || {})
};

const upgradeCosts = { health: 2, mana: 2, speed: 3, damage: 3, potionPower: 2, potionDrops: 2, ultimateFocus: 4 };
const STORY_STORAGE_KEY = 'manaBrawlStoryUnlocks';
const REWARD_STORAGE_KEY = 'manaBrawlRewards';
const STORY_BASE_ORDER = [
    'Priest',
    'Devil',
    'Fighter',
    'Mage',
    'Barbarian',
    'Spearman',
    'Necromancer',
    'Assassin',
    'Trapper',
    'Gambler',
    'Sniper',
    'Alchemist',
    'Guardian',
    'GravityMage',
    'Duelist'
];

let p1Selected = null;
let p2Selected = null;
let selectedMap = 'Random';
let selectedModifier = 'Random';
let selectedGameSpeed = 'Normal';
let selectedStocks = 1;
let p2IsNPC = false;
let selectedNPCLevel = 'Adept';
let currentGame = null;
let matchState = null;
let draftState = null;
let randomClassMode = false;
let applyingRandomSelection = false;
let storyMode = false;
let storyUnlockedClasses = new Set(['Broker']);
let storyCurrentOpponent = null;
let storySelectedOpponent = null;
let unlockedRewards = new Set();

function isAnimeClass(className) {
    return className === 'Duelist' || (window.AnimeCharacterNames || []).includes(className);
}

function randomizeClasses() {
    if (storyMode) return;
    randomClassMode = true;
    applyingRandomSelection = true;
    let classes = Object.keys(charMap);
    
    const animeToggle = document.getElementById('anime-char-toggle');
    if (animeToggle && !animeToggle.checked) {
        classes = classes.filter(c => !isAnimeClass(c));
    }

    const p1Char = classes[Math.floor(Math.random() * classes.length)];
    const p2Char = classes[Math.floor(Math.random() * classes.length)];

    document.querySelectorAll('#p1-select .char-btn').forEach(btn => {
        if (btn.getAttribute('data-char') === p1Char) btn.click();
    });
    document.querySelectorAll('#p2-select .char-btn').forEach(btn => {
        if (btn.getAttribute('data-char') === p2Char) btn.click();
    });
    applyingRandomSelection = false;
    updateRandomClassHint();
}

function updateInfo(player, charName) {
    const infoDiv = document.getElementById(`${player}-info`);
    const info = charInfo[charName];
    const ultimate = window.UltimateDescriptions?.[charName];
    const meta = getCharacterMeta(charName);
    const rewardText = unlockedRewards.has(charName)
        ? `<div class="ability reward-line"><strong>Reward:</strong> ${getRewardName(charName)}</div>`
        : '';
    if (info) {
        infoDiv.innerHTML = `
            <div class="char-info-tags">
                <span>${meta.role}</span>
                <span>${meta.difficulty}</span>
            </div>
            <div class="ability"><strong>Passive:</strong> ${info.passive}</div>
            <div class="ability"><strong>Ability 1 (F/K):</strong> ${info.a1}</div>
            <div class="ability"><strong>Ability 2 (G/L):</strong> ${info.a2}</div>
            <div class="ability"><strong>Ultimate (R/O):</strong> ${ultimate ? `${ultimate.name} - ${ultimate.description}` : 'Arcane Burst when fully charged.'}</div>
            ${rewardText}
        `;
    }
}

function getCharacterMeta(className) {
    const defaults = window.DefaultCharacterSelectMeta || {
        role: 'Specialist',
        difficulty: 'Medium',
        stats: { hp: 3, mana: 3, speed: 3, range: 3, damage: 4, scaling: 4 }
    };
    const animeDefaults = isAnimeClass(className)
        ? { role: 'Crossover', difficulty: 'Hard', stats: { hp: 3, mana: 4, speed: 4, range: 4, damage: 4, scaling: 4 } }
        : {};
    return {
        ...defaults,
        ...animeDefaults,
        ...(window.CharacterSelectMeta?.[className] || {}),
        stats: {
            ...(defaults.stats || {}),
            ...(animeDefaults.stats || {}),
            ...(window.CharacterSelectMeta?.[className]?.stats || {})
        }
    };
}

function getCharacterSpritePath(className) {
    const spriteMap = {
        Priest: 'priest.png',
        Devil: 'devil.png',
        Fighter: 'fighter.png',
        Mage: 'mage.png',
        Barbarian: 'barbarian.png',
        Spearman: 'Spearman.png',
        Necromancer: 'necromancer.png',
        Assassin: 'assassin.png',
        Trapper: 'traper.png',
        Broker: 'broker.png',
        Gambler: 'gambler.png',
        Sniper: 'sniper.png',
        Alchemist: 'alchemist.png',
        Guardian: 'guardian.png',
        GravityMage: 'gravity_mage.png',
        Duelist: 'duelist.png',
        Sinbad: 'baal.png',
        Vader: 'vader.png'
    };
    const fileName = spriteMap[className] || `${className.toLowerCase()}.png`;
    return `imges/${fileName}`;
}

function renderStatPips(value) {
    const filled = Math.max(0, Math.min(5, Math.round(value || 0)));
    return Array.from({ length: 5 }, (_, index) => `<span class="${index < filled ? 'filled' : ''}"></span>`).join('');
}

function decorateCharacterButtons() {
    const statRows = [
        ['HP', 'hp'],
        ['Mana', 'mana'],
        ['Speed', 'speed'],
        ['Range', 'range'],
        ['Damage', 'damage'],
        ['Scaling', 'scaling']
    ];

    document.querySelectorAll('.char-btn[data-char]').forEach(btn => {
        const className = btn.getAttribute('data-char');
        const meta = getCharacterMeta(className);
        const displayName = formatClassName(className);
        const reward = unlockedRewards.has(className) ? getRewardName(className) : '';
        btn.innerHTML = `
            <div class="char-card-head">
                <img class="char-card-portrait" src="${getCharacterSpritePath(className)}" alt="">
                <div class="char-card-main">
                    <strong>${displayName}</strong>
                    <span>${meta.role} | ${meta.difficulty}</span>
                </div>
                ${reward ? '<div class="char-card-reward">Unlocked</div>' : ''}
            </div>
            <div class="char-card-details">
                <div class="char-card-stats">
                    ${statRows.map(([label, key]) => `
                        <div><span>${label}</span><div>${renderStatPips(meta.stats[key])}</div></div>
                    `).join('')}
                </div>
                ${reward ? `<div class="char-card-title">${reward}</div>` : ''}
            </div>
        `;
    });
}

function checkStart() {
    const startBtn = document.getElementById('start-btn');
    const canStartStory = storyMode
        && p1Selected
        && p2Selected
        && storyUnlockedClasses.has(p1Selected)
        && canSelectStoryBoss(p2Selected);
    startBtn.disabled = storyMode ? !canStartStory : !(p1Selected && p2Selected);
}

function updateRandomClassHint() {
    const hint = document.getElementById('random-class-hint');
    if (!hint) return;
    hint.textContent = randomClassMode
        ? 'Random classes are locked in: both players reroll every round.'
        : '';
}

function getModifierInfo(modifier) {
    return window.ModifierDescriptions?.[modifier] || window.ModifierDescriptions?.None;
}

function updateModifierDescription(modifier) {
    const description = document.getElementById('modifier-description');
    const info = getModifierInfo(modifier);
    if (description && info) {
        description.innerHTML = `<strong>${info.name}:</strong> ${info.description}`;
    }
}

function getGameSpeedInfo(speed) {
    return window.GameSpeedDefinitions?.[speed] || window.GameSpeedDefinitions?.Normal || {
        name: speed || 'Normal',
        description: 'Standard health and damage.',
        healthMultiplier: 1,
        damageMultiplier: 1,
        timeScale: 1
    };
}

function updateGameSpeedDescription(speed) {
    const description = document.getElementById('game-speed-description');
    const info = getGameSpeedInfo(speed);
    if (description && info) {
        description.innerHTML = `<strong>${info.name}:</strong> ${info.description}`;
    }
}

function updateStockDescription() {
    const value = document.getElementById('stock-value');
    const description = document.getElementById('stock-description');
    if (value) value.textContent = selectedStocks === 1 ? '1 life' : `${selectedStocks} lives`;
    if (description) {
        description.textContent = selectedStocks === 1
            ? 'Classic rounds: one KO sends you to the shop.'
            : `Stock set: each fighter has ${selectedStocks} lives before the shop or random reroll.`;
    }
}

function getNPCLevelInfo(level) {
    return window.NPCLevelDefinitions?.[level] || window.NPCLevelDefinitions?.Adept || {
        name: level || 'Adept',
        description: 'Balanced NPC behavior.',
        ai: {},
        upgradePriority: ['damage', 'health', 'mana', 'speed']
    };
}

function updateNPCLevelDescription() {
    const description = document.getElementById('npc-level-description');
    const info = getNPCLevelInfo(selectedNPCLevel);
    if (description && info) description.textContent = info.description || '';
}

function updateNPCLevelVisibility() {
    const panel = document.getElementById('npc-level-panel');
    if (panel) panel.style.display = p2IsNPC ? 'flex' : 'none';
    updateNPCLevelDescription();
}

function resolveRoundModifier(mode, previousModifier = null) {
    const modifierPool = window.ModifierPool || ['None', 'Low Gravity', 'Heavy Gravity', 'Arcane Surge', 'Mana Drought', 'Sudden Death', 'Orb Storm', 'Ultimate Fever', 'Haste', 'Glass Cannon', 'Hazard Rush'];
    if (mode !== 'Random') return mode;

    const available = modifierPool.filter(modifier => modifier !== previousModifier);
    const pool = available.length > 0 ? available : modifierPool;
    return pool[Math.floor(Math.random() * pool.length)];
}

function getStoryRoster() {
    const orderedClasses = [...STORY_BASE_ORDER, ...(window.AnimeCharacterNames || [])];
    const orderedSet = new Set(orderedClasses);
    const fallbackClasses = Object.keys(charMap).filter(className => className !== 'Broker' && !orderedSet.has(className));
    return [...orderedClasses, ...fallbackClasses].filter(className => charMap[className] && className !== 'Broker');
}

function getUnlockedStoryBosses() {
    return getStoryRoster().filter(className => storyUnlockedClasses.has(className));
}

function loadStoryProgress() {
    storyUnlockedClasses = new Set(['Broker']);
    loadRewards();
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORY_STORAGE_KEY) || '[]');
        saved.forEach(className => {
            if (charMap[className]) storyUnlockedClasses.add(className);
        });
    } catch (error) {
        storyUnlockedClasses = new Set(['Broker']);
    }
}

function saveStoryProgress() {
    try {
        window.localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify([...storyUnlockedClasses]));
    } catch (error) {
        // Story progress still works for the current session if storage is unavailable.
    }
}

function loadRewards() {
    unlockedRewards = new Set();
    try {
        const saved = JSON.parse(window.localStorage.getItem(REWARD_STORAGE_KEY) || '[]');
        saved.forEach(className => {
            if (charMap[className]) unlockedRewards.add(className);
        });
    } catch (error) {
        unlockedRewards = new Set();
    }
    renderUnlockablesPanel();
}

function saveRewards() {
    try {
        window.localStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify([...unlockedRewards]));
    } catch (error) {
        // Cosmetic rewards can still be shown for the current session.
    }
}

function getRewardName(className) {
    return window.UnlockableRewards?.[className] || `${formatClassName(className)} Badge`;
}

function awardStoryReward(className) {
    if (!className || unlockedRewards.has(className)) return null;
    unlockedRewards.add(className);
    saveRewards();
    renderUnlockablesPanel();
    return getRewardName(className);
}

function renderUnlockablesPanel() {
    const lists = document.querySelectorAll('.unlockables-list');
    if (!lists.length) return;

    const rewardEntries = Object.keys(window.UnlockableRewards || {})
        .filter(className => charMap[className])
        .sort((a, b) => getStoryRoster().indexOf(a) - getStoryRoster().indexOf(b));

    const markup = rewardEntries.map(className => {
        const unlocked = unlockedRewards.has(className);
        const classLabel = formatClassName(className);
        const rule = getStoryBossRule(className);
        const status = unlocked ? 'Unlocked' : 'Locked';
        const requirement = `Beat ${classLabel} in Story Mode`;
        const detail = rule ? `${rule.map} | ${rule.modifier}` : 'Story Mode boss fight';
        return `
            <div class="unlockable-item ${unlocked ? 'unlocked' : 'locked'}">
                <div class="unlockable-top">
                    <strong>${getRewardName(className)}</strong>
                    <span>${status}</span>
                </div>
                <div class="unlockable-class">${classLabel}</div>
                <div class="unlockable-how">${requirement}</div>
                <div class="unlockable-detail">${detail}</div>
            </div>
        `;
    }).join('');

    lists.forEach(list => {
        list.innerHTML = markup;
    });
}

function getNextStoryOpponent() {
    return getStoryRoster().find(className => !storyUnlockedClasses.has(className)) || null;
}

function getStoryBossSelectionStatus(className) {
    if (!className || className === 'Broker') return 'locked';
    if (className === storyCurrentOpponent && !storyUnlockedClasses.has(className)) return 'next';
    if (storyUnlockedClasses.has(className)) return 'rematch';
    return 'locked';
}

function canSelectStoryBoss(className) {
    const status = getStoryBossSelectionStatus(className);
    return status === 'next' || status === 'rematch';
}

function selectStoryOpponent(preferredOpponent = null) {
    storyCurrentOpponent = getNextStoryOpponent();
    const rematchBosses = getUnlockedStoryBosses();
    const fallbackOpponent = storyCurrentOpponent || rematchBosses[0] || null;
    storySelectedOpponent = canSelectStoryBoss(preferredOpponent) ? preferredOpponent : fallbackOpponent;
    p2Selected = storySelectedOpponent;
    return storySelectedOpponent;
}

function selectStoryBossForFight(className) {
    if (!canSelectStoryBoss(className)) return false;
    storySelectedOpponent = className;
    selectCharacterForPlayer('p2', className);
    updateStorySelectionUI();
    return true;
}

function getStoryBossRule(className) {
    return window.StoryBossRules?.[className] || {
        map: 'Central Arena',
        modifier: 'None'
    };
}

function storyProgressText() {
    const total = getStoryRoster().length + 1;
    return `${storyUnlockedClasses.size} / ${total} classes unlocked`;
}

function updateStorySelectionUI() {
    const status = document.getElementById('story-mode-status');
    if (status) {
        if (storyMode) {
            const nextName = storyCurrentOpponent ? formatClassName(storyCurrentOpponent) : 'All cleared';
            const selectedName = storySelectedOpponent ? formatClassName(storySelectedOpponent) : 'None';
            const selectedLabel = storySelectedOpponent === storyCurrentOpponent ? 'Next boss' : 'Rematch boss';
            const rule = storySelectedOpponent ? getStoryBossRule(storySelectedOpponent) : null;
            const ruleText = rule ? ` Map: <strong>${rule.map}</strong>. Modifier: <strong>${rule.modifier}</strong>.` : '';
            status.style.display = 'block';
            status.innerHTML = `<strong>Story Mode:</strong> Start as Broker, defeat each buffed Nightmare boss to unlock them. Next unlock: <strong>${nextName}</strong>. ${selectedLabel}: <strong>${selectedName}</strong>.${ruleText} Pick any defeated boss on Player 2 to rematch. ${storyProgressText()}.`;
        } else {
            status.style.display = 'none';
            status.textContent = '';
        }
    }

    document.querySelectorAll('#p1-select .char-btn').forEach(btn => {
        const className = btn.getAttribute('data-char');
        const locked = storyMode && !storyUnlockedClasses.has(className);
        btn.classList.toggle('locked', locked);
        btn.setAttribute('title', locked ? 'Locked in Story Mode. Defeat this class to unlock it.' : '');
    });

    decorateCharacterButtons();
    renderUnlockablesPanel();

    document.querySelectorAll('#p2-select .char-btn').forEach(btn => {
        const className = btn.getAttribute('data-char');
        const bossStatus = getStoryBossSelectionStatus(className);
        btn.classList.toggle('locked', storyMode && bossStatus === 'locked');
        btn.classList.toggle('story-next', storyMode && bossStatus === 'next');
        btn.classList.toggle('story-rematch', storyMode && bossStatus === 'rematch');
        btn.classList.toggle('selected', storyMode && className === storySelectedOpponent);
        btn.setAttribute('title', storyMode
            ? (bossStatus === 'next'
                ? 'Next Story boss.'
                : (bossStatus === 'rematch' ? 'Defeated boss. Click to rematch.' : 'Locked Story boss. Defeat earlier bosses to unlock it.'))
            : '');
    });

    const npcToggle = document.getElementById('p2-npc-mode');
    const npcLevelSelect = document.getElementById('npc-level-select');
    const randomBtn = document.getElementById('random-btn');
    if (randomBtn) randomBtn.disabled = storyMode;
    if (storyMode) {
        if (npcToggle) {
            npcToggle.checked = true;
            npcToggle.disabled = true;
        }
        if (npcLevelSelect) {
            npcLevelSelect.value = 'Nightmare';
            npcLevelSelect.disabled = true;
        }
        p2IsNPC = true;
        selectedNPCLevel = 'Nightmare';
        updateNPCLevelVisibility();
    } else {
        if (npcToggle) npcToggle.disabled = false;
        if (npcLevelSelect) npcLevelSelect.disabled = false;
    }

    checkStart();
}

function selectCharacterForPlayer(player, className) {
    const selector = `#${player}-select .char-btn`;
    document.querySelectorAll(selector).forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-char') === className);
    });
    if (player === 'p1') p1Selected = className;
    else p2Selected = className;
    updateInfo(player, className);
}

function buildNewMatchState() {
    const storyOpponent = storyMode ? storySelectedOpponent : p2Selected;
    return {
        round: 1,
        endless: true,
        score: { p1: 0, p2: 0 },
        coins: { p1: 0, p2: 0 },
        upgrades: {
            p1: { health: 0, mana: 0, speed: 0, damage: 0, potionPower: 0, potionDrops: 0, ultimateFocus: 0 },
            p2: { health: 0, mana: 0, speed: 0, damage: 0, potionPower: 0, potionDrops: 0, ultimateFocus: 0 }
        },
        talents: { p1: [], p2: [] },
        randomClassMode,
        currentClasses: { p1: p1Selected, p2: storyOpponent },
        npcLevel: selectedNPCLevel,
        modifierMode: selectedModifier,
        modifier: null,
        gameSpeed: selectedGameSpeed,
        stocksPerRound: selectedStocks,
        storyMode,
        storyOpponent,
        lastRoundSummary: null,
        recentReward: null
    };
}

function startGame() {
    if (storyMode) {
        p2IsNPC = true;
        selectedNPCLevel = 'Nightmare';
        storyCurrentOpponent = getNextStoryOpponent();
        if (!canSelectStoryBoss(storySelectedOpponent)) selectStoryOpponent(p2Selected);
        else p2Selected = storySelectedOpponent;
    }
    if (!p1Selected || !p2Selected) return;

    matchState = buildNewMatchState();
    startTalentDraft();
}

function startTalentDraft() {
    draftState = {
        currentPlayer: 'p1',
        remainingTalentIds: (window.TalentDefinitions || []).map(talent => talent.id),
        picks: { p1: [], p2: [] },
        requiredPicks: 3
    };

    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('talent-draft-screen').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'none';
    document.getElementById('draft-start-fight').style.display = 'none';
    const recap = document.getElementById('round-recap');
    const reward = document.getElementById('reward-recap');
    if (recap) recap.innerHTML = '';
    if (reward) {
        reward.style.display = 'none';
        reward.textContent = '';
    }
    renderTalentDraft();
}

function completeTalentDraft() {
    if (!isDraftComplete()) return;

    matchState.talents = {
        p1: [...draftState.picks.p1],
        p2: [...draftState.picks.p2]
    };

    document.getElementById('talent-draft-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'none';
    launchRound();
}

function launchRound() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roundClasses = resolveRoundClasses();
    const p1Class = charMap[roundClasses.p1];
    const p2Class = charMap[roundClasses.p2];
    const storyRule = matchState.storyMode ? getStoryBossRule(roundClasses.p2) : null;
    const roundMap = storyRule ? storyRule.map : selectedMap;
    matchState.modifier = storyRule ? storyRule.modifier : resolveRoundModifier(matchState.modifierMode, matchState.modifier);
    matchState.storyRule = storyRule;
    updateRoundClassLabels(roundClasses);

    currentGame = new Game(ctx, p1Class, p2Class, roundMap, p2IsNPC, {
        matchState,
        roundNumber: matchState.round,
        modifier: matchState.modifier,
        npcLevel: matchState.npcLevel,
        gameSpeed: matchState.gameSpeed,
        stocksPerRound: matchState.stocksPerRound,
        storyMode: matchState.storyMode,
        storyBoss: matchState.storyMode,
        upgrades: matchState.upgrades,
        talents: matchState.talents,
        onRoundEnd: handleRoundEnd
    });
    currentGame.start();
}

function resolveRoundClasses() {
    if (matchState.storyMode) {
        storyCurrentOpponent = getNextStoryOpponent();
        if (!canSelectStoryBoss(storySelectedOpponent)) selectStoryOpponent(matchState.storyOpponent || p2Selected);
        matchState.currentClasses = { p1: p1Selected, p2: storySelectedOpponent };
        matchState.storyOpponent = storySelectedOpponent;
        return matchState.currentClasses;
    }

    if (!matchState.randomClassMode) {
        matchState.currentClasses = { p1: p1Selected, p2: p2Selected };
        return matchState.currentClasses;
    }

    let classes = Object.keys(charMap);
    const animeToggle = document.getElementById('anime-char-toggle');
    if (animeToggle && !animeToggle.checked) {
        classes = classes.filter(c => !isAnimeClass(c));
    }

    const previous = matchState.currentClasses || {};
    const p1Pool = classes.filter(className => className !== previous.p1);
    const p2Pool = classes.filter(className => className !== previous.p2);
    matchState.currentClasses = {
        p1: p1Pool[Math.floor(Math.random() * p1Pool.length)] || classes[0],
        p2: p2Pool[Math.floor(Math.random() * p2Pool.length)] || classes[0]
    };
    return matchState.currentClasses;
}

function formatClassName(className) {
    if (className === 'GravityMage') return 'Gravity Mage';
    return window.AnimeDisplayNames?.[className] || className;
}

function updateRoundClassLabels(roundClasses) {
    const p1Name = document.querySelector('#p1-hud .name');
    const p2Name = document.querySelector('#p2-hud .name');
    const shopP1Name = document.querySelector('#shop-p1 h2');
    const shopP2Name = document.querySelector('#shop-p2 h2');
    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const p2Label = matchState?.storyMode ? 'Story Boss' : (p2IsNPC ? `NPC (${npcInfo.name})` : 'Player 2');

    const p1Text = `Player 1 - ${formatClassName(roundClasses.p1)}`;
    const p2Text = `${p2Label} - ${formatClassName(roundClasses.p2)}`;
    if (p1Name) p1Name.textContent = p1Text;
    if (p2Name) p2Name.textContent = p2Text;
    if (shopP1Name) shopP1Name.textContent = p1Text;
    if (shopP2Name) shopP2Name.textContent = p2Text;
}

function getTalentById(talentId) {
    return (window.TalentDefinitions || []).find(talent => talent.id === talentId);
}

function renderPickedTalents(playerTag) {
    const list = document.getElementById(`${playerTag}-drafted-talents`);
    const count = document.getElementById(`draft-${playerTag}-count`);
    if (!list || !count || !draftState) return;

    const picks = draftState.picks[playerTag];
    count.textContent = `${picks.length} / ${draftState.requiredPicks}`;
    list.innerHTML = picks.map(talentId => {
        const talent = getTalentById(talentId);
        if (!talent) return '';
        return `
            <div class="drafted-talent">
                <strong>${talent.name}</strong>
                <span>${talent.description}</span>
            </div>
        `;
    }).join('');
}

function isDraftComplete() {
    return draftState
        && draftState.picks.p1.length >= draftState.requiredPicks
        && draftState.picks.p2.length >= draftState.requiredPicks;
}

function renderTalentDraft() {
    if (!draftState) return;

    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const currentLabel = draftState.currentPlayer === 'p1' ? 'Player 1' : (p2IsNPC ? `NPC (${npcInfo.name})` : 'Player 2');
    const status = document.getElementById('draft-status');
    const options = document.getElementById('talent-options');
    const startFightBtn = document.getElementById('draft-start-fight');

    document.getElementById('draft-p1')?.classList.toggle('active', draftState.currentPlayer === 'p1' && !isDraftComplete());
    document.getElementById('draft-p2')?.classList.toggle('active', draftState.currentPlayer === 'p2' && !isDraftComplete());
    renderPickedTalents('p1');
    renderPickedTalents('p2');

    if (isDraftComplete()) {
        if (status) status.textContent = 'Draft complete. Start the fight when ready.';
        if (options) options.innerHTML = '';
        if (startFightBtn) startFightBtn.style.display = 'inline-block';
        return;
    }

    if (status) status.textContent = `${currentLabel}, choose a talent.`;
    if (startFightBtn) startFightBtn.style.display = 'none';
    if (!options) return;

    options.innerHTML = draftState.remainingTalentIds.map(talentId => {
        const talent = getTalentById(talentId);
        if (!talent) return '';
        return `
            <button class="talent-btn" data-talent="${talent.id}">
                <strong>${talent.name}</strong>
                <span>${talent.description}</span>
            </button>
        `;
    }).join('');

    options.querySelectorAll('.talent-btn').forEach(btn => {
        btn.addEventListener('click', () => pickTalent(btn.getAttribute('data-talent')));
    });

    if (draftState.currentPlayer === 'p2' && p2IsNPC) {
        window.setTimeout(autoPickNPCTalent, 300);
    }
}

function pickTalent(talentId) {
    if (!draftState || isDraftComplete()) return;
    if (!draftState.remainingTalentIds.includes(talentId)) return;

    const playerTag = draftState.currentPlayer;
    if (draftState.picks[playerTag].length >= draftState.requiredPicks) return;

    draftState.picks[playerTag].push(talentId);
    draftState.remainingTalentIds = draftState.remainingTalentIds.filter(id => id !== talentId);

    if (!isDraftComplete()) {
        draftState.currentPlayer = playerTag === 'p1' ? 'p2' : 'p1';
    }

    renderTalentDraft();
}

function autoPickNPCTalent() {
    if (!draftState || draftState.currentPlayer !== 'p2' || !p2IsNPC || isDraftComplete()) return;
    const remaining = draftState.remainingTalentIds;
    if (remaining.length === 0) return;
    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const talentPriority = [
        'deep-reserves',
        'vital-spark',
        'shadow-step',
        'spellbreaker',
        'duelist-stance',
        'siphon-hits',
        'vampiric-core',
        'warheart',
        'quick-cast',
        'ultimate-spark',
        'mirror-guard',
        'windrunner',
        'sharp-edge',
        'quick-boots',
        'starlit-focus',
        'arcane-vessel',
        'mana-bloom',
        'iron-skin',
        'colossus-blood',
        'spring-step'
    ];
    const shouldUsePriority = Math.random() < (npcInfo.ai?.draftSkill ?? 1);
    const bestTalent = shouldUsePriority
        ? talentPriority.find(talentId => remaining.includes(talentId)) || remaining[0]
        : remaining[Math.floor(Math.random() * remaining.length)];
    pickTalent(bestTalent);
}

function handleRoundEnd(winnerTag, roundData = {}) {
    matchState.score[winnerTag] += 1;
    const loserTag = winnerTag === 'p1' ? 'p2' : 'p1';
    matchState.coins[winnerTag] += matchState.storyMode && winnerTag === 'p1' ? 4 : 3;
    matchState.coins[loserTag] += matchState.storyMode && loserTag === 'p2' ? 0 : 2;
    matchState.lastRoundSummary = {
        winnerTag,
        loserTag,
        duration: roundData.duration || 0,
        mapName: roundData.mapName || matchState.storyRule?.map || selectedMap,
        modifier: roundData.modifier || matchState.modifier || 'None',
        stats: roundData.stats || { p1: {}, p2: {} },
        stocksPerRound: roundData.stocksPerRound || matchState.stocksPerRound || 1,
        stocksRemaining: roundData.stocksRemaining || null,
        classes: { ...(matchState.currentClasses || {}) },
        roundNumber: matchState.round
    };
    matchState.recentReward = null;
    const storyOpponent = matchState.storyMode ? matchState.storyOpponent : null;
    const unlockedNewStoryBoss = matchState.storyMode
        && winnerTag === 'p1'
        && storyOpponent
        && storyOpponent === storyCurrentOpponent
        && !storyUnlockedClasses.has(storyOpponent);

    if (unlockedNewStoryBoss) {
        storyUnlockedClasses.add(storyOpponent);
        saveStoryProgress();
        matchState.recentReward = awardStoryReward(storyOpponent);
        selectStoryOpponent();
        matchState.storyOpponent = storySelectedOpponent;
        matchState.lastStoryResult = 'progress';
    } else if (matchState.storyMode && winnerTag === 'p1' && storyOpponent) {
        selectStoryOpponent(storyCurrentOpponent || storyOpponent);
        matchState.storyOpponent = storySelectedOpponent;
        matchState.lastStoryResult = 'rematch';
    } else if (matchState.storyMode && winnerTag === 'p2' && storyOpponent) {
        storySelectedOpponent = storyOpponent;
        p2Selected = storyOpponent;
        matchState.storyOpponent = storySelectedOpponent;
        matchState.lastStoryResult = 'loss';
    }

    matchState.round += 1;
    if (unlockedNewStoryBoss && !storyCurrentOpponent) {
        showFinalWinner('p1');
        return;
    }
    showShop(winnerTag);
}

function autoSpendNPCUpgrades() {
    if (!p2IsNPC) return;

    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const priorities = npcInfo.upgradePriority || ['damage', 'health', 'mana', 'speed'];
    const defaultExtras = ['ultimateFocus', 'potionPower', 'potionDrops'];
    const desperateHealth = matchState.score.p1 > matchState.score.p2
        ? ['health', 'damage', 'ultimateFocus', 'mana', 'potionPower', 'speed', 'potionDrops']
        : [...priorities, ...defaultExtras];
    const order = matchState.modifier === 'Arcane Surge'
        ? ['mana', 'damage', 'ultimateFocus', 'potionPower', 'health', 'speed', 'potionDrops']
        : desperateHealth;

    let bought = true;
    while (bought) {
        bought = false;
        for (const upgrade of order) {
            if (matchState.coins.p2 >= upgradeCosts[upgrade]) {
                buyUpgrade('p2', upgrade);
                bought = true;
                break;
            }
        }
    }
}

function formatStatNumber(value) {
    return Math.round(value || 0).toString();
}

function getPlayerRoundLabel(playerTag, summary = matchState?.lastRoundSummary) {
    const className = summary?.classes?.[playerTag] || matchState?.currentClasses?.[playerTag] || '';
    if (playerTag === 'p1') return `Player 1 - ${formatClassName(className)}`;
    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const prefix = matchState?.storyMode ? 'Story Boss' : (p2IsNPC ? `NPC (${npcInfo.name})` : 'Player 2');
    return `${prefix} - ${formatClassName(className)}`;
}

function renderRoundRecap() {
    const recap = document.getElementById('round-recap');
    const reward = document.getElementById('reward-recap');
    const summary = matchState?.lastRoundSummary;
    if (!recap || !summary) return;

    const p1 = summary.stats.p1 || {};
    const p2 = summary.stats.p2 || {};
    const winnerLabel = getPlayerRoundLabel(summary.winnerTag, summary);
    const duration = summary.duration ? `${Math.floor(summary.duration / 60)}:${String(Math.floor(summary.duration % 60)).padStart(2, '0')}` : '--';
    const winnerStats = summary.stats[summary.winnerTag] || {};
    const loserStats = summary.stats[summary.loserTag] || {};
    const stockText = summary.stocksPerRound > 1 ? ` | ${summary.stocksPerRound}-stock` : '';
    const chips = [
        ['Damage', winnerStats.damageDealt],
        ['Taken', winnerStats.damageTaken],
        ['Mana', winnerStats.manaGained],
        ['Pickups', winnerStats.pickups],
        ['Ult', winnerStats.ultimates],
        ['Enemy dmg', loserStats.damageDealt]
    ];

    recap.innerHTML = `
        <div class="recap-head">
            <div>
                <strong>${winnerLabel}</strong>
                <span>Round ${summary.roundNumber}${stockText} | ${duration} | ${summary.mapName} | ${summary.modifier}</span>
            </div>
        </div>
        <div class="recap-vs">
            <span>${getPlayerRoundLabel('p1', summary)}</span>
            <strong>${formatStatNumber(p1.damageDealt)} - ${formatStatNumber(p2.damageDealt)}</strong>
            <span>${getPlayerRoundLabel('p2', summary)}</span>
        </div>
        <div class="recap-chips">
            ${chips.map(chip => `
                <div class="recap-chip"><span>${chip[0]}</span><strong>${formatStatNumber(chip[1])}</strong></div>
            `).join('')}
        </div>
    `;

    if (reward) {
        if (matchState.recentReward) {
            reward.style.display = 'block';
            reward.innerHTML = `<strong>Unlocked:</strong> ${matchState.recentReward}`;
        } else {
            reward.style.display = 'none';
            reward.textContent = '';
        }
    }
}

function showShop(winnerTag) {
    renderRoundRecap();
    if (matchState.storyMode) {
        const won = winnerTag === 'p1';
        const nextRule = storyCurrentOpponent ? getStoryBossRule(storyCurrentOpponent) : null;
        const nextText = storyCurrentOpponent
            ? `Next boss: ${formatClassName(storyCurrentOpponent)} on ${nextRule.map} with ${nextRule.modifier}.`
            : 'All classes unlocked.';
        const defeatedName = formatClassName(matchState.currentClasses.p2);
        document.getElementById('shop-status').textContent = won
            ? (matchState.lastStoryResult === 'progress'
                ? `Unlocked ${defeatedName}. ${nextText} ${storyProgressText()} Spend your points, then continue.`
                : `Won rematch against ${defeatedName}. ${nextText} ${storyProgressText()} Spend your points, then continue.`)
            : `Defeated by ${defeatedName}. Retry the same boss after spending your points.`;
        autoSpendNPCUpgrades();
        updateShopUI();
        document.getElementById('shop-screen').style.display = 'block';
        updateStorySelectionUI();
        renderRoundRecap();
        return;
    }

    const nextClassText = matchState.randomClassMode ? ' Next round will reroll both classes.' : '';
    const npcInfo = getNPCLevelInfo(matchState?.npcLevel || selectedNPCLevel);
    const winnerLabel = winnerTag === 'p1' ? 'Player 1' : (p2IsNPC ? `NPC (${npcInfo.name})` : 'Player 2');
    document.getElementById('shop-status').textContent = `${winnerLabel} won round ${matchState.round - 1}. Score: ${matchState.score.p1} - ${matchState.score.p2}. Spend your points, then continue.${nextClassText}`;
    autoSpendNPCUpgrades();
    updateShopUI();
    document.getElementById('shop-screen').style.display = 'block';
    renderRoundRecap();
}

function updateShopUI() {
    document.getElementById('shop-p1-coins').textContent = `Coins: ${matchState.coins.p1}`;
    document.getElementById('shop-p2-coins').textContent = `Coins: ${matchState.coins.p2}`;
}

function buyUpgrade(playerTag, upgrade) {
    const cost = upgradeCosts[upgrade];
    if (matchState.coins[playerTag] < cost) return;
    matchState.coins[playerTag] -= cost;
    matchState.upgrades[playerTag][upgrade] += 1;
    updateShopUI();
}

function continueAfterShop() {
    document.getElementById('shop-screen').style.display = 'none';
    if (matchState?.storyMode) {
        if (!canSelectStoryBoss(storySelectedOpponent)) selectStoryOpponent(matchState.storyOpponent || p2Selected);
        p2Selected = storySelectedOpponent;
        matchState.npcLevel = 'Nightmare';
        matchState.storyOpponent = storySelectedOpponent;
        updateStorySelectionUI();
    }
    launchRound();
}

function showFinalWinner(winnerTag) {
    const winnerText = storyMode && winnerTag === 'p1'
        ? 'Story Complete! Every class is unlocked.'
        : (winnerTag === 'p1' ? 'Player 1 Wins the Match!' : 'Player 2 Wins the Match!');
    document.getElementById('winner-text').innerText = winnerText;
    document.getElementById('game-over').style.display = 'block';
}

function restartMatch(randomClasses = false) {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'none';

    if (randomClasses) {
        randomizeClasses();
    } else {
        randomClassMode = false;
    }

    matchState = buildNewMatchState();
    startTalentDraft();
}

document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('title-screen');
    const selectionScreen = document.getElementById('selection-screen');
    const playBtn = document.getElementById('to-selection-btn');
    const storyBtn = document.getElementById('story-mode-btn');
    const titleUnlockablesBtn = document.getElementById('title-unlockables-btn');
    const titleUnlockablesPanel = document.getElementById('title-unlockables-panel');
    const animeToggle = document.getElementById('anime-char-toggle');
    const stockSlider = document.getElementById('stock-slider');
    if (window.addAnimeCharacterButtons) window.addAnimeCharacterButtons();
    loadRewards();
    decorateCharacterButtons();

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            storyMode = false;
            if (titleScreen) titleScreen.style.display = 'none';
            if (selectionScreen) selectionScreen.style.display = 'block';

            // Hide/Show anime characters based on toggle
            const showAnime = animeToggle ? animeToggle.checked : true;
            document.querySelectorAll('.char-btn.anime-char').forEach(btn => {
                btn.style.display = showAnime ? 'block' : 'none';
            });
            
            // If p1 or p2 had an anime character selected and it's disabled, clear it
            if (!showAnime) {
                if (isAnimeClass(p1Selected)) {
                    p1Selected = null;
                    document.getElementById('p1-info').innerHTML = '';
                }
                if (isAnimeClass(p2Selected)) {
                    p2Selected = null;
                    document.getElementById('p2-info').innerHTML = '';
                }
                document.querySelectorAll('.char-btn.anime-char').forEach(b => b.classList.remove('selected'));
                checkStart();
            }
            updateStorySelectionUI();
        });
    }

    if (storyBtn) {
        storyBtn.addEventListener('click', () => {
            storyMode = true;
            loadStoryProgress();
            p2IsNPC = true;
            selectedNPCLevel = 'Nightmare';
            randomClassMode = false;
            if (animeToggle) animeToggle.checked = true;
            document.querySelectorAll('.char-btn.anime-char').forEach(btn => {
                btn.style.display = 'block';
            });
            selectStoryOpponent();
            const starter = storyUnlockedClasses.has(p1Selected) ? p1Selected : 'Broker';
            selectCharacterForPlayer('p1', starter);
            if (storySelectedOpponent) selectCharacterForPlayer('p2', storySelectedOpponent);
            if (titleScreen) titleScreen.style.display = 'none';
            if (selectionScreen) selectionScreen.style.display = 'block';
            updateStorySelectionUI();
        });
    }

    if (titleUnlockablesBtn && titleUnlockablesPanel) {
        titleUnlockablesBtn.addEventListener('click', () => {
            renderUnlockablesPanel();
            const isOpen = titleUnlockablesPanel.style.display !== 'none';
            titleUnlockablesPanel.style.display = isOpen ? 'none' : 'block';
            titleUnlockablesBtn.classList.toggle('active', !isOpen);
        });
    }

    if (stockSlider) {
        selectedStocks = Number(stockSlider.value) || selectedStocks;
        stockSlider.addEventListener('input', (e) => {
            selectedStocks = Number(e.target.value) || 1;
            updateStockDescription();
        });
        updateStockDescription();
    }

    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (storyMode) return;
            document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedMap = e.target.getAttribute('data-map');
        });
    });

    document.querySelectorAll('.modifier-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (storyMode) return;
            document.querySelectorAll('.modifier-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedModifier = e.target.getAttribute('data-modifier');
            updateModifierDescription(selectedModifier);
        });

        const modifier = btn.getAttribute('data-modifier');
        const info = getModifierInfo(modifier);
        if (info) btn.setAttribute('title', info.description);
    });

    document.querySelectorAll('.game-speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.game-speed-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedGameSpeed = e.target.getAttribute('data-speed');
            updateGameSpeedDescription(selectedGameSpeed);
        });

        const speed = btn.getAttribute('data-speed');
        const info = getGameSpeedInfo(speed);
        if (info) btn.setAttribute('title', info.description);
    });

    const npcToggle = document.getElementById('p2-npc-mode');
    if (npcToggle) {
        npcToggle.addEventListener('change', (e) => {
            p2IsNPC = e.target.checked;
            updateNPCLevelVisibility();
        });
    }

    const npcLevelSelect = document.getElementById('npc-level-select');
    if (npcLevelSelect) {
        selectedNPCLevel = npcLevelSelect.value || selectedNPCLevel;
        npcLevelSelect.addEventListener('change', (e) => {
            selectedNPCLevel = e.target.value;
            updateNPCLevelDescription();
        });
    }

    document.querySelectorAll('#p1-select .char-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedButton = e.currentTarget;
            const chosen = selectedButton.getAttribute('data-char');
            if (storyMode && !storyUnlockedClasses.has(chosen)) return;
            document.querySelectorAll('#p1-select .char-btn').forEach(b => b.classList.remove('selected'));
            selectedButton.classList.add('selected');
            p1Selected = chosen;
            if (!applyingRandomSelection) {
                randomClassMode = false;
                updateRandomClassHint();
            }
            updateInfo('p1', p1Selected);
            updateStorySelectionUI();
            checkStart();
        });
    });

    document.querySelectorAll('#p2-select .char-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedButton = e.currentTarget;
            const chosen = selectedButton.getAttribute('data-char');
            if (storyMode) {
                selectStoryBossForFight(chosen);
                checkStart();
                return;
            }
            document.querySelectorAll('#p2-select .char-btn').forEach(b => b.classList.remove('selected'));
            selectedButton.classList.add('selected');
            p2Selected = chosen;
            if (!applyingRandomSelection) {
                randomClassMode = false;
                updateRandomClassHint();
            }
            updateInfo('p2', p2Selected);
            checkStart();
        });
    });

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('draft-start-fight')?.addEventListener('click', completeTalentDraft);
    document.getElementById('random-btn').addEventListener('click', randomizeClasses);
    document.getElementById('rematch-same')?.addEventListener('click', () => restartMatch(false));
    document.getElementById('rematch-random')?.addEventListener('click', () => restartMatch(true));
    document.getElementById('shop-continue')?.addEventListener('click', continueAfterShop);

    document.querySelectorAll('.shop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            buyUpgrade(btn.getAttribute('data-player'), btn.getAttribute('data-upgrade'));
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && p1Selected && p2Selected && document.getElementById('selection-screen').style.display !== 'none') {
            startGame();
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
            e.preventDefault();
        }
    });

    const hint = document.createElement('div');
    hint.className = 'key-hint';
    hint.textContent = "Press Enter to Start. Ultimates use R / O once your gold bar is full.";
    const selectionScreenForHints = document.querySelector('#selection-screen');
    if (selectionScreenForHints) selectionScreenForHints.appendChild(hint);
    const randomHint = document.createElement('div');
    randomHint.id = 'random-class-hint';
    randomHint.className = 'key-hint random-class-hint';
    if (selectionScreenForHints) selectionScreenForHints.appendChild(randomHint);
    updateModifierDescription(selectedModifier);
    updateGameSpeedDescription(selectedGameSpeed);
    updateStockDescription();
    updateNPCLevelVisibility();
    loadStoryProgress();
    updateStorySelectionUI();
    updateRandomClassHint();
});
