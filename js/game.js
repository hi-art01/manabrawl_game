class Game {
    constructor(ctx, p1Class, p2Class, chosenMapName = 'Random', p2IsNPC = false, options = {}) {
        this.ctx = ctx;
        this.viewWidth = ctx.canvas.width;
        this.viewHeight = ctx.canvas.height;
        this.width = this.viewWidth;
        this.height = this.viewHeight;
        this.input = new InputHandler();
        this.lastTime = 0;
        this.p2IsNPC = p2IsNPC;
        this.onRoundEnd = options.onRoundEnd || null;
        this.matchState = options.matchState || null;
        this.modifier = options.modifier || 'None';
        this.roundNumber = options.roundNumber || 1;
        this.npcLevel = options.npcLevel || 'Adept';
        this.npcProfile = this.getNPCProfile(this.npcLevel);
        this.gameSpeed = options.gameSpeed || 'Normal';
        this.gameSpeedProfile = this.getGameSpeedProfile(this.gameSpeed);
        this.stocksPerRound = Math.max(1, Number(options.stocksPerRound) || 1);
        this.stockCounts = { p1: this.stocksPerRound, p2: this.stocksPerRound };
        this.storyMode = !!options.storyMode;
        this.storyBoss = !!options.storyBoss;

        let layout;
        if (chosenMapName === 'Random') {
            layout = MapLayouts[Math.floor(Math.random() * MapLayouts.length)];
        } else {
            layout = MapLayouts.find(m => m.name === chosenMapName) || MapLayouts[0];
        }

        this.width = layout.width || this.viewWidth;
        this.height = layout.height || this.viewHeight;
        this.fitToView = !!layout.fitToView;
        this.renderScale = this.fitToView ? Math.min(this.viewWidth / this.width, this.viewHeight / this.height) : 1;
        this.renderOffsetX = this.fitToView ? (this.viewWidth - this.width * this.renderScale) / 2 : 0;
        this.renderOffsetY = this.fitToView ? (this.viewHeight - this.height * this.renderScale) / 2 : 0;
        this.floorY = this.height - 100;
        this.platforms = layout.platforms;
        this.mapName = layout.name;
        this.mapTheme = this.getMapTheme(this.mapName);
        this.cameraX = 0;
        this.cameraY = 0;
        this.gravityMultiplier = this.getGravityMultiplier();
        this.manaGainMultiplier = this.getManaGainMultiplier();
        this.roundTimer = 0;
        this.suddenDeathActive = false;
        this.suddenDeathTick = 0;
        this.messageClearTimer = null;

        this.prevUltimate1 = false;
        this.prevUltimate2 = false;

        const p1SpawnX = layout.spawns?.p1 ?? 100;
        const p2SpawnX = layout.spawns?.p2 ?? this.width - 200;
        this.spawnPoints = {
            p1: { x: p1SpawnX, y: this.floorY - 100 },
            p2: { x: p2SpawnX, y: this.floorY - 100 }
        };
        this.player1 = new p1Class(p1SpawnX, this.floorY - 100, 'blue');
        this.player2 = new p2Class(p2SpawnX, this.floorY - 100, 'red');
        this.player1.tag = 'p1';
        this.player2.tag = 'p2';
        this.player2.facingDirection = -1;
        const initialFocusX = ((this.player1.x + this.player1.width / 2) + (this.player2.x + this.player2.width / 2)) / 2;
        const initialFocusY = ((this.player1.y + this.player1.height / 2) + (this.player2.y + this.player2.height / 2)) / 2;
        this.cameraX = this.fitToView ? 0 : Math.max(0, Math.min(Math.max(0, this.width - this.viewWidth), initialFocusX - this.viewWidth / 2));
        this.cameraY = this.fitToView ? 0 : Math.max(0, Math.min(Math.max(0, this.height - this.viewHeight), initialFocusY - this.viewHeight / 2));

        this.wrapManaGain(this.player1);
        this.wrapManaGain(this.player2);
        this.wrapDamageTracking(this.player1);
        this.wrapDamageTracking(this.player2);
        this.applyUpgrades(this.player1, options.upgrades?.p1 || {});
        this.applyUpgrades(this.player2, options.upgrades?.p2 || {});
        this.applyTalents(this.player1, options.talents?.p1 || []);
        this.applyTalents(this.player2, options.talents?.p2 || []);
        if (this.p2IsNPC) this.applyNPCBoost(this.player2);
        if (this.storyBoss) this.applyStoryBossBoost(this.player2);
        this.applyModifierStats(this.player1);
        this.applyModifierStats(this.player2);
        this.applyGameSpeedStats(this.player1);
        this.applyGameSpeedStats(this.player2);

        this.minions = [];
        this.projectiles = [];
        this.potions = [];
        this.ultimateOrbs = [];
        this.hazardWarnings = [];
        this.visualEffects = [];
        this.screenShake = 0;
        this.mapIdentityTimer = 0;
        this.mapPulse = 0;
        this.roundStats = this.createRoundStats();
        this.hazardTimer = this.getHazardDelay(true);
        this.potionSpawnTimer = this.getPotionSpawnDelay(true);
        this.ultimateOrbTimer = this.getUltimateOrbDelay(true);
        this.running = true;
        console.log("Starting on Map: " + this.mapName);
    }

    createRoundStats() {
        return {
            p1: { damageDealt: 0, damageTaken: 0, healing: 0, manaGained: 0, pickups: 0, ultimates: 0, hazardsTaken: 0 },
            p2: { damageDealt: 0, damageTaken: 0, healing: 0, manaGained: 0, pickups: 0, ultimates: 0, hazardsTaken: 0 }
        };
    }

    getStatsFor(playerOrTag) {
        const tag = typeof playerOrTag === 'string' ? playerOrTag : playerOrTag?.tag;
        return tag && this.roundStats ? this.roundStats[tag] : null;
    }

    showAnnouncement(text, color = '#facc15') {
        const messageArea = document.getElementById('message-area');
        if (!messageArea) return;

        messageArea.textContent = text;
        messageArea.style.color = color;
        if (this.messageClearTimer) window.clearTimeout(this.messageClearTimer);
        this.messageClearTimer = window.setTimeout(() => {
            messageArea.textContent = '';
        }, 1200);
    }

    wrapManaGain(player) {
        const originalGainMana = player.gainMana.bind(player);
        player.gainMana = (amount) => {
            const manaBefore = player.mana || 0;
            originalGainMana(amount * this.manaGainMultiplier);
            const manaGained = Math.max(0, (player.mana || 0) - manaBefore);
            const stats = this.getStatsFor(player);
            if (stats) stats.manaGained += manaGained;
        };
    }

    getNPCProfile(level) {
        const definitions = window.NPCLevelDefinitions || {};
        return definitions[level] || definitions.Adept || {
            name: level || 'Adept',
            stats: {},
            ai: {},
            upgradePriority: ['damage', 'health', 'mana', 'speed']
        };
    }

    getAIValue(ai, key, fallback) {
        if (!this.p2IsNPC || !ai || ai.tag !== 'p2') return fallback;
        const value = this.npcProfile?.ai?.[key];
        return value === undefined ? fallback : value;
    }

    wrapDamageTracking(player) {
        const originalTakeDamage = player.takeDamage.bind(player);
        player.recentDamageEvents = [];
        player.takeDamage = (amount) => {
            const healthBefore = player.health;
            const damageType = player.incomingDamageType || 'direct';
            const result = originalTakeDamage(amount);
            const damageTaken = Math.max(0, healthBefore - player.health);
            if (damageTaken > 0) {
                const stats = this.getStatsFor(player);
                if (stats) {
                    stats.damageTaken += damageTaken;
                    if (damageType === 'map_hazard' || damageType === 'hazard_line' || damageType === 'sudden_death') {
                        stats.hazardsTaken += damageTaken;
                    }
                }
                this.recordDamageTaken(player, damageTaken, damageType);
            }
            return result;
        };

        const originalHeal = player.heal.bind(player);
        player.heal = (amount) => {
            const healthBefore = player.health || 0;
            const result = originalHeal(amount);
            const healed = Math.max(0, (player.health || 0) - healthBefore);
            const stats = this.getStatsFor(player);
            if (stats) stats.healing += healed;
            return result;
        };
    }

    recordDamageTaken(player, amount, damageType) {
        if (!this.p2IsNPC || player.tag !== 'p2' || damageType === 'sudden_death') return;

        const aiConfig = this.npcProfile?.ai || {};
        const windowSeconds = aiConfig.adaptWindow || 3;
        const now = this.roundTimer;
        player.recentDamageEvents = (player.recentDamageEvents || [])
            .filter(event => now - event.time <= windowSeconds);
        player.recentDamageEvents.push({ time: now, amount, damageType });

        const recentDamage = player.recentDamageEvents.reduce((total, event) => total + event.amount, 0);
        const recentHits = player.recentDamageEvents.length;
        const hitLimit = aiConfig.adaptAfterHits || 3;
        const damageLimit = aiConfig.adaptDamageTaken || 40;

        if (recentHits >= hitLimit || recentDamage >= damageLimit) {
            this.triggerAIAdaptation(player, damageType);
        }
    }

    triggerAIAdaptation(ai, damageType) {
        if ((ai.aiAdaptCooldown || 0) > 0) return;

        const aiConfig = this.npcProfile?.ai || {};
        const target = ai.tag === 'p1' ? this.player2 : this.player1;
        const combatAbsDist = target ? Math.abs((target.x + target.width / 2) - (ai.x + ai.width / 2)) : 0;
        const desiredRange = this.getAIDesiredRange(ai);
        const pickup = this.getBestAIPickup(ai, 95);

        let mode = 'retreat';
        if (pickup && (ai.health < ai.maxHealth * 0.55 || ai.mana < ai.maxMana * 0.35 || ai.ultimateCharge < (ai.ultimateRequirement || 100) * 0.7)) {
            mode = 'seek_pickup';
        } else if (damageType === 'map_hazard' || damageType === 'hazard_line') {
            mode = 'reposition';
        } else if (combatAbsDist > desiredRange + 150) {
            mode = 'close_gap';
        }

        ai.aiAdaptMode = mode;
        ai.aiAdaptTimer = Math.max(ai.aiAdaptTimer || 0, aiConfig.adaptDuration || 2.2);
        ai.aiAdaptCooldown = aiConfig.adaptCooldown || 3;
        ai.recentDamageEvents = [];

        if ((aiConfig.avoidance || 0) >= 0.8 && this.showAnnouncement) {
            this.showAnnouncement(`${this.npcProfile.name} NPC adapts!`, '#93c5fd');
        }
    }

    updateAIState(dt) {
        if (!this.p2IsNPC) return;

        const ai = this.player2;
        const stats = this.npcProfile?.stats || {};
        const className = this.getAIClassName(ai);
        const regen = className === 'Mahoraga'
            ? (stats.mahoragaHealthRegenBonus || 0)
            : (stats.healthRegen || 0);
        if (regen > 0 && ai.health > 0) ai.heal(regen * dt);

        ai.aiAdaptTimer = Math.max(0, (ai.aiAdaptTimer || 0) - dt);
        ai.aiAdaptCooldown = Math.max(0, (ai.aiAdaptCooldown || 0) - dt);
        if (ai.aiAdaptTimer <= 0) ai.aiAdaptMode = null;

        const windowSeconds = this.npcProfile?.ai?.adaptWindow || 3;
        ai.recentDamageEvents = (ai.recentDamageEvents || [])
            .filter(event => this.roundTimer - event.time <= windowSeconds);
    }

    getGravityMultiplier() {
        if (this.modifier === 'Low Gravity') return 0.55;
        if (this.modifier === 'Heavy Gravity') return 1.35;
        return 1;
    }

    getManaGainMultiplier() {
        if (this.modifier === 'Arcane Surge') return 2;
        if (this.modifier === 'Mana Drought') return 0.6;
        return 1;
    }

    getGameSpeedProfile(speed) {
        const definitions = window.GameSpeedDefinitions || {};
        return definitions[speed] || definitions.Normal || {
            name: speed || 'Normal',
            healthMultiplier: 1,
            damageMultiplier: 1,
            timeScale: 1,
            description: 'Standard health and damage.'
        };
    }

    applyGameSpeedStats(player) {
        const healthMultiplier = this.gameSpeedProfile.healthMultiplier || 1;
        const previousMaxHealth = player.maxHealth || 1;
        const healthRatio = previousMaxHealth > 0 ? player.health / previousMaxHealth : 1;

        player.maxHealth = Math.max(25, Math.round(player.maxHealth * healthMultiplier));
        player.health = Math.max(1, Math.min(player.maxHealth, Math.round(player.maxHealth * healthRatio)));

        if (player.baseStats) {
            player.baseStats.maxHealth = player.maxHealth;
        }
    }

    scaleDamageForSpeed(amount, ownerTag) {
        const baseAmount = amount || 0;
        if (ownerTag !== 'p1' && ownerTag !== 'p2') return baseAmount;
        return baseAmount * (this.gameSpeedProfile.damageMultiplier || 1);
    }

    getPotionSpawnDelay(initial = false) {
        const dropLevel = Math.max(this.player1?.potionDropLevel || 0, this.player2?.potionDropLevel || 0);
        const multiplier = Math.max(0.45, 1 - dropLevel * 0.12);
        if (this.modifier === 'Orb Storm') return initial ? Math.max(3, 8 * multiplier) : (7 + Math.random() * 4) * multiplier;
        return initial ? Math.max(5, 15 * multiplier) : (15 + Math.random() * 10) * multiplier;
    }

    getUltimateOrbDelay(initial = false) {
        if (this.modifier === 'Ultimate Fever') return initial ? 7 : 7 + Math.random() * 4;
        if (this.modifier === 'Orb Storm') return initial ? 10 : 9 + Math.random() * 4;
        return initial ? 18 : 18 + Math.random() * 8;
    }

    getHazardDelay(initial = false) {
        if (this.modifier === 'Hazard Rush') return initial ? 3 : 4 + Math.random() * 2;
        return initial ? 6 : 8 + Math.random() * 4;
    }

    applyModifierStats(player) {
        if (this.modifier === 'Haste') {
            player.speed += 1.5;
            player.minimumAbilityCooldown = Math.max(0.3, player.minimumAbilityCooldown - 0.15);
        }

        if (this.modifier === 'Glass Cannon') {
            player.damageMultiplier += 0.35;
            player.maxHealth = Math.max(45, player.maxHealth - 25);
        }

        if (this.modifier === 'Ultimate Fever') {
            player.gainUltimateCharge(40);
        }

        player.health = Math.min(player.health, player.maxHealth);
        if (this.modifier === 'Glass Cannon') player.health = player.maxHealth;

        if (player.baseStats) {
            player.baseStats.maxHealth = player.maxHealth;
            player.baseStats.maxMana = player.maxMana;
            player.baseStats.speed = player.speed;
            player.baseStats.damageMultiplier = player.damageMultiplier;
            player.baseStats.jumpForce = player.jumpForce;
        }
    }

    applyUpgrades(player, upgrades) {
        const healthLevels = upgrades.health || 0;
        const manaLevels = upgrades.mana || 0;
        const speedLevels = upgrades.speed || 0;
        const damageLevels = upgrades.damage || 0;
        const potionPowerLevels = upgrades.potionPower || 0;
        const potionDropLevels = upgrades.potionDrops || 0;
        const ultimateFocusLevels = upgrades.ultimateFocus || 0;

        player.maxHealth += healthLevels * 20;
        player.health = player.maxHealth;
        player.maxMana += manaLevels * 20;
        player.mana = player.maxMana;
        player.speed += speedLevels;
        player.damageMultiplier += damageLevels * 0.15;
        player.potionPowerLevel = potionPowerLevels;
        player.potionDropLevel = potionDropLevels;
        player.ultimateRequirement = Math.max(60, 100 - ultimateFocusLevels * 8);
        player.ultimateCharge = Math.min(player.ultimateCharge, player.ultimateRequirement);
        player.ultimateReady = player.ultimateCharge >= player.ultimateRequirement;
    }

    applyTalents(player, talentIds) {
        const talents = window.TalentDefinitions || [];
        player.talentIds = talentIds;
        player.talentNames = [];
        player.talentEffects = {
            maxHealth: 0,
            maxMana: 0,
            speed: 0,
            jumpForce: 0,
            damageMultiplier: 0,
            dodgeChance: 0,
            damageReduction: 0,
            manaRegen: 0,
            lifeSteal: 0,
            ultimateStart: 0,
            potionManaBonus: 0,
            potionHeal: 0,
            potionUltimateBonus: 0,
            orbUltimateBonus: 0,
            orbManaBonus: 0,
            orbHeal: 0,
            onHitManaFlat: 0,
            onHitUltimateFlat: 0,
            manaBurnOnHit: 0,
            manaGainOnBurn: 0,
            manaOnDamageTaken: 0,
            ultimateOnDamageTaken: 0,
            healOnDodge: 0,
            manaOnDodge: 0,
            manaOnJump: 0,
            ultimateOnJump: 0,
            airborneManaRegen: 0,
            fullManaUltimateRegen: 0,
            cooldownReduction: 0,
            pickupSpeed: 0,
            pickupBoostDuration: 0,
            lowHealthThreshold: 0,
            lowHealthManaRegen: 0,
            lowHealthDamageMultiplier: 0,
            lowHealthDamageReduction: 0,
            secondWindThreshold: 0,
            secondWindHeal: 0,
            secondWindMana: 0,
            secondWindUltimate: 0,
            ultimateRefund: 0,
            hazardDamageReduction: 0
        };

        const numericEffectKeys = Object.keys(player.talentEffects);

        talentIds.forEach(id => {
            const talent = talents.find(item => item.id === id);
            if (!talent) return;

            const effects = talent.effects || {};
            player.talentNames.push(talent.name);

            numericEffectKeys.forEach(key => {
                const value = effects[key] || 0;
                if (key === 'lowHealthThreshold' || key === 'secondWindThreshold' || key === 'pickupBoostDuration') {
                    player.talentEffects[key] = Math.max(player.talentEffects[key], value);
                } else {
                    player.talentEffects[key] += value;
                }
            });

            player.maxHealth += effects.maxHealth || 0;
            player.maxMana += effects.maxMana || 0;
            player.speed += effects.speed || 0;
            player.jumpForce += effects.jumpForce || 0;
            player.damageMultiplier += effects.damageMultiplier || 0;
            player.dodgeChance += effects.dodgeChance || 0;
            player.talentDamageReduction += effects.damageReduction || 0;
            player.talentManaRegen += effects.manaRegen || 0;
            player.talentLifeSteal += effects.lifeSteal || 0;

            if (effects.ultimateStart) {
                player.gainUltimateCharge(effects.ultimateStart);
            }
        });

        if (player.talentEffects.cooldownReduction > 0) {
            player.minimumAbilityCooldown = Math.max(0.25, player.minimumAbilityCooldown - player.talentEffects.cooldownReduction);
        }

        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.dodgeChance = Math.min(player.dodgeChance, 0.35);
        player.talentDamageReduction = Math.min(player.talentDamageReduction, 0.45);
        player.talentLifeSteal = Math.min(player.talentLifeSteal, 0.35);

        if (player.baseStats) {
            player.baseStats.maxHealth = player.maxHealth;
            player.baseStats.maxMana = player.maxMana;
            player.baseStats.speed = player.speed;
            player.baseStats.damageMultiplier = player.damageMultiplier;
            player.baseStats.jumpForce = player.jumpForce;
            player.baseStats.minimumAbilityCooldown = player.minimumAbilityCooldown;
        }
    }

    applyNPCBoost(player) {
        const stats = this.npcProfile?.stats || {};
        const healthBoost = stats.maxHealth || 0;
        const manaBoost = stats.maxMana || 0;
        const speedBoost = stats.speed || 0;
        const damageBoost = stats.damageMultiplier || 0;
        const manaRegenBoost = stats.manaRegen || 0;
        const cooldownReduction = stats.cooldownReduction || 0;

        if (player.talentEffects) {
            player.talentEffects.maxHealth += healthBoost;
            player.talentEffects.maxMana += manaBoost;
            player.talentEffects.speed += speedBoost;
            player.talentEffects.damageMultiplier += damageBoost;
            player.talentEffects.manaRegen += manaRegenBoost;
            player.talentEffects.cooldownReduction += cooldownReduction;
        }

        player.maxHealth += healthBoost;
        player.health = player.maxHealth;
        player.maxMana += manaBoost;
        player.mana = player.maxMana;
        player.speed += speedBoost;
        player.damageMultiplier += damageBoost;
        player.talentManaRegen += manaRegenBoost;
        if (cooldownReduction > 0) {
            player.minimumAbilityCooldown = Math.max(0.25, player.minimumAbilityCooldown - cooldownReduction);
        }
        player.gainUltimateCharge(stats.ultimateStart || 0);

        if (player.baseStats) {
            player.baseStats.maxHealth = player.maxHealth;
            player.baseStats.maxMana = player.maxMana;
            player.baseStats.speed = player.speed;
            player.baseStats.damageMultiplier = player.damageMultiplier;
            player.baseStats.minimumAbilityCooldown = player.minimumAbilityCooldown;
        }
    }

    applyStoryBossBoost(player) {
        player.maxHealth += 60;
        const bossClassName = player.className || player.constructor.name;
        if (bossClassName === 'Mahoraga') player.maxHealth *= 4;
        player.health = player.maxHealth;
        player.maxMana += 35;
        player.mana = player.maxMana;
        player.speed += 0.45;
        player.damageMultiplier += 0.28;
        player.minimumAbilityCooldown = Math.max(0.2, (player.minimumAbilityCooldown || 0.5) - 0.08);
        player.gainUltimateCharge(100);

        if (player.baseStats) {
            player.baseStats.maxHealth = player.maxHealth;
            player.baseStats.maxMana = player.maxMana;
            player.baseStats.speed = player.speed;
            player.baseStats.damageMultiplier = player.damageMultiplier;
            player.baseStats.minimumAbilityCooldown = player.minimumAbilityCooldown;
        }
    }

    updateTalentEffects(dt) {
        [this.player1, this.player2].forEach(player => {
            if (player.talentManaRegen > 0) {
                player.gainMana(player.talentManaRegen * dt);
            }

            const effects = player.talentEffects || {};
            const lowHealthThreshold = effects.lowHealthThreshold || effects.secondWindThreshold || 0.4;
            const isLowHealth = player.health <= player.maxHealth * lowHealthThreshold;

            this.syncConditionalTalentStat(player, 'lowHealthDamageMultiplier', 'damageMultiplier', effects.lowHealthDamageMultiplier || 0, isLowHealth);
            this.syncConditionalTalentStat(player, 'pickupSpeed', 'speed', effects.pickupSpeed || 0, (player.talentPickupBoostTimer || 0) > 0);

            if (player.talentPickupBoostTimer > 0) {
                player.talentPickupBoostTimer = Math.max(0, player.talentPickupBoostTimer - dt);
            }

            if (isLowHealth && effects.lowHealthManaRegen > 0) {
                player.gainMana(effects.lowHealthManaRegen * dt);
            }

            if (!player.grounded && effects.airborneManaRegen > 0) {
                player.gainMana(effects.airborneManaRegen * dt);
            }

            if (player.mana >= player.maxMana && effects.fullManaUltimateRegen > 0) {
                player.gainUltimateCharge(effects.fullManaUltimateRegen * dt);
            }

            this.tryTriggerSecondWind(player);
        });
    }

    syncConditionalTalentStat(player, key, stat, amount, active) {
        if (!amount) return;
        if (!player.talentConditionalStats) player.talentConditionalStats = {};
        const alreadyApplied = player.talentConditionalStats[key] || 0;

        if (active && !alreadyApplied) {
            player[stat] += amount;
            player.talentConditionalStats[key] = amount;
        } else if (!active && alreadyApplied) {
            player[stat] -= alreadyApplied;
            player.talentConditionalStats[key] = 0;
        }
    }

    tryTriggerSecondWind(player) {
        const effects = player.talentEffects || {};
        if (!effects.secondWindHeal || player.talentSecondWindUsed) return;

        const threshold = effects.secondWindThreshold || 0.35;
        if (player.health > player.maxHealth * threshold) return;

        player.talentSecondWindUsed = true;
        player.heal(effects.secondWindHeal);
        if (effects.secondWindMana) player.gainMana(effects.secondWindMana);
        if (effects.secondWindUltimate) player.gainUltimateCharge(effects.secondWindUltimate);
        if (this.showAnnouncement) {
            const label = player.tag === 'p1' ? 'Player 1' : (this.p2IsNPC ? 'NPC' : 'Player 2');
            this.showAnnouncement(`${label} Second Wind!`, '#34d399');
        }
    }

    applyTalentOnHit(owner, target, damageDealt) {
        if (damageDealt <= 0) return;

        const effects = owner.talentEffects || {};
        if (owner.talentLifeSteal > 0) owner.heal(damageDealt * owner.talentLifeSteal);
        if (effects.onHitManaFlat) owner.gainMana(effects.onHitManaFlat);
        if (effects.onHitUltimateFlat) owner.gainUltimateCharge(effects.onHitUltimateFlat);

        if (effects.manaBurnOnHit && target.spendMana) {
            const manaBefore = target.mana || 0;
            target.mana = Math.max(0, manaBefore - effects.manaBurnOnHit);
            const burnedMana = Math.max(0, manaBefore - (target.mana || 0));
            if (burnedMana > 0 && effects.manaGainOnBurn) {
                owner.gainMana(effects.manaGainOnBurn);
            }
        }
    }

    applyTalentPickupEffects(player) {
        const effects = player.talentEffects || {};
        if (effects.pickupSpeed && effects.pickupBoostDuration) {
            player.talentPickupBoostTimer = Math.max(player.talentPickupBoostTimer || 0, effects.pickupBoostDuration);
        }
    }

    collectPotion(player) {
        const effects = player.talentEffects || {};
        const potionLevel = player.potionPowerLevel || 0;
        player.gainMana(50 + potionLevel * 14 + (effects.potionManaBonus || 0));
        const potionHeal = (effects.potionHeal || 0) + potionLevel * 5;
        if (potionHeal) player.heal(potionHeal);
        if (effects.potionUltimateBonus) player.gainUltimateCharge(effects.potionUltimateBonus);
        this.applyTalentPickupEffects(player);
        const stats = this.getStatsFor(player);
        if (stats) stats.pickups += 1;
        this.addBurst(player.x + player.width / 2, player.y + player.height / 2, '#38bdf8', 16, 'Mana');
    }

    collectUltimateOrb(player) {
        const effects = player.talentEffects || {};
        player.gainUltimateCharge(50 + (effects.orbUltimateBonus || 0));
        if (effects.orbManaBonus) player.gainMana(effects.orbManaBonus);
        if (effects.orbHeal) player.heal(effects.orbHeal);
        this.applyTalentPickupEffects(player);
        const stats = this.getStatsFor(player);
        if (stats) stats.pickups += 1;
        this.addBurst(player.x + player.width / 2, player.y + player.height / 2, '#facc15', 18, 'Super');
    }

    addBurst(x, y, color = '#facc15', count = 10, label = null) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 210;
            this.visualEffects.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 5,
                color,
                life: 0.38 + Math.random() * 0.28,
                maxLife: 0.66,
                kind: 'particle'
            });
        }

        if (label) {
            this.visualEffects.push({
                x,
                y: y - 12,
                vx: 0,
                vy: -38,
                color,
                life: 0.72,
                maxLife: 0.72,
                label,
                kind: 'text'
            });
        }
    }

    addHitEffect(x, y, damage, color = '#f8fafc') {
        const size = Math.min(36, 10 + damage * 0.35);
        this.screenShake = Math.min(14, this.screenShake + Math.max(3, damage * 0.08));
        this.visualEffects.push({
            x,
            y,
            radius: size,
            color,
            life: 0.22,
            maxLife: 0.22,
            kind: 'ring'
        });
        this.visualEffects.push({
            x,
            y: y - 8,
            vx: 0,
            vy: -44,
            color: '#ffffff',
            life: 0.52,
            maxLife: 0.52,
            label: Math.round(damage).toString(),
            kind: 'text'
        });
        this.addBurst(x, y, color, Math.min(18, 5 + Math.round(damage / 8)));
    }

    updateVisualEffects(dt) {
        this.screenShake = Math.max(0, this.screenShake - dt * 24);
        this.visualEffects.forEach(effect => {
            effect.life -= dt;
            effect.x += (effect.vx || 0) * dt;
            effect.y += (effect.vy || 0) * dt;
            if (effect.kind === 'particle') effect.vy += 420 * dt;
        });
        this.visualEffects = this.visualEffects.filter(effect => effect.life > 0);
    }

    updateMapIdentity(dt) {
        this.mapPulse += dt;
        this.mapIdentityTimer += dt;

        if (this.mapName === 'Sky Pillars') {
            const gust = Math.sin(this.roundTimer * 1.8) * 0.42;
            [this.player1, this.player2].forEach(player => {
                if (!player.grounded) player.x = Math.max(0, Math.min(this.width - player.width, player.x + gust));
            });
            return;
        }

        if (this.mapName === 'Lava Caverns') {
            if (this.mapIdentityTimer >= 1) {
                [this.player1, this.player2].forEach(player => {
                    if (player.grounded && player.y + player.height >= this.floorY - 2) {
                        player.incomingDamageType = 'map_hazard';
                        player.takeDamage(2);
                        player.incomingDamageType = null;
                        this.addBurst(player.x + player.width / 2, player.y + player.height, '#fb923c', 4);
                    }
                });
                this.mapIdentityTimer = 0;
            }
            return;
        }

        if (this.mapName === 'Floating Isles') {
            if (this.mapIdentityTimer >= 7) {
                const rx = 80 + Math.random() * (this.width - 160);
                this.potions.push(new Potion(rx, -40));
                this.showAnnouncement('Island bloom!', '#bef264');
                this.mapIdentityTimer = 0;
            }
            return;
        }

        if (this.mapName === 'Celestial Tower') {
            [this.player1, this.player2].forEach(player => {
                if (player.y < this.height * 0.42) player.gainUltimateCharge(4 * dt);
            });
            return;
        }

        if (this.mapName === 'Chaos Bridges') {
            if (this.mapIdentityTimer >= 5.5) {
                const target = Math.random() > 0.5 ? this.player1 : this.player2;
                this.queueHazardColumn(target.x + target.width / 2 - 32, Math.max(80, target.y - 120), 64, 220, 1, '#f472b6', 12, 0.75);
                this.mapIdentityTimer = 0;
            }
            return;
        }

        if (this.mapName === 'Titan Expanse') {
            const distance = Math.abs((this.player1.x + this.player1.width / 2) - (this.player2.x + this.player2.width / 2));
            if (distance > 720) {
                this.player1.gainUltimateCharge(2 * dt);
                this.player2.gainUltimateCharge(2 * dt);
            }
        }
    }

    getMapTheme(name) {
        const themes = {
            'Central Arena': {
                skyTop: '#2f3640',
                skyBottom: '#0f1720',
                accent: 'rgba(255, 210, 120, 0.14)',
                floorTop: '#7f5539',
                floorBottom: '#3d2b1f',
                platformTop: '#d9c7a2',
                platformFace: '#6f4e37',
                platformEdge: '#f7e7c6',
                haze: 'rgba(255,255,255,0.05)'
            },
            'Sky Pillars': {
                skyTop: '#7dd3fc',
                skyBottom: '#e0f2fe',
                accent: 'rgba(255,255,255,0.35)',
                floorTop: '#94a3b8',
                floorBottom: '#475569',
                platformTop: '#f8fafc',
                platformFace: '#cbd5e1',
                platformEdge: '#ffffff',
                haze: 'rgba(255,255,255,0.18)'
            },
            'Floating Isles': {
                skyTop: '#22c55e',
                skyBottom: '#0f766e',
                accent: 'rgba(255,255,200,0.18)',
                floorTop: '#4d7c0f',
                floorBottom: '#365314',
                platformTop: '#bef264',
                platformFace: '#4d7c0f',
                platformEdge: '#ecfccb',
                haze: 'rgba(255,255,255,0.08)'
            },
            'Lava Caverns': {
                skyTop: '#2b0b0b',
                skyBottom: '#5b1a10',
                accent: 'rgba(255,120,60,0.18)',
                floorTop: '#ff7a18',
                floorBottom: '#7c2d12',
                platformTop: '#f59e0b',
                platformFace: '#7c2d12',
                platformEdge: '#fde68a',
                haze: 'rgba(255,180,120,0.07)'
            },
            'Celestial Tower': {
                skyTop: '#1d4ed8',
                skyBottom: '#312e81',
                accent: 'rgba(250,245,255,0.22)',
                floorTop: '#cbd5e1',
                floorBottom: '#64748b',
                platformTop: '#f8fafc',
                platformFace: '#94a3b8',
                platformEdge: '#ffffff',
                haze: 'rgba(255,255,255,0.14)'
            },
            'Chaos Bridges': {
                skyTop: '#111827',
                skyBottom: '#1f2937',
                accent: 'rgba(244,114,182,0.12)',
                floorTop: '#f97316',
                floorBottom: '#7c2d12',
                platformTop: '#fdba74',
                platformFace: '#9a3412',
                platformEdge: '#ffedd5',
                haze: 'rgba(255,255,255,0.05)'
            },
            'Titan Expanse': {
                skyTop: '#172554',
                skyBottom: '#14532d',
                accent: 'rgba(250,204,21,0.13)',
                floorTop: '#4ade80',
                floorBottom: '#166534',
                platformTop: '#bbf7d0',
                platformFace: '#15803d',
                platformEdge: '#fef3c7',
                haze: 'rgba(255,255,255,0.08)'
            }
        };

        return themes[name] || themes['Central Arena'];
    }

    addProjectile(proj) {
        this.projectiles.push(proj);
    }

    start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const rawDt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        const dt = rawDt * (this.gameSpeedProfile.timeScale || 1);
        this.lastTime = timestamp;

        this.update(dt);
        this.checkCollisions();
        this.draw();

        if (this.running) {
            requestAnimationFrame((time) => this.loop(time));
        }
    }

    update(dt) {
        this.roundTimer += dt;
        this.updateMapIdentity(dt);
        this.updateHazards(dt);
        this.updateSuddenDeath(dt);
        this.updateAIState(dt);
        this.updateVisualEffects(dt);

        const p1Keys = {
            left: this.input.isDown('KeyA'),
            right: this.input.isDown('KeyD'),
            jump: this.input.isDown('KeyW'),
            down: this.input.isDown('KeyS'),
            attack1: this.input.isDown('KeyF'),
            attack2: this.input.isDown('KeyG'),
            ultimate: this.input.isDown('KeyR')
        };

        let p2Keys;
        if (this.p2IsNPC) {
            p2Keys = this.getAIInput(this.player2, this.player1);
        } else {
            p2Keys = {
                left: this.input.isDown('ArrowLeft'),
                right: this.input.isDown('ArrowRight'),
                jump: this.input.isDown('ArrowUp'),
                down: this.input.isDown('ArrowDown'),
                attack1: this.input.isDown('KeyK'),
                attack2: this.input.isDown('KeyL'),
                ultimate: this.input.isDown('KeyO')
            };
        }

        this.currentInputs = { p1: p1Keys, p2: p2Keys };
        this.player1.update(p1Keys, this, dt, this.platforms);
        this.handleUltimateInput(this.player1, p1Keys.ultimate, 'p1');
        this.player2.update(p2Keys, this, dt, this.platforms);
        this.handleUltimateInput(this.player2, p2Keys.ultimate, 'p2');
        this.updateTalentEffects(dt);

        this.projectiles.forEach(p => p.update(dt, this));
        this.projectiles = this.projectiles.filter(p => p.active);

        if (this.minions) {
            this.minions.forEach(m => m.update(dt, this));
            this.minions = this.minions.filter(m => m.active);
        }

        this.potionSpawnTimer -= dt;
        if (this.potionSpawnTimer <= 0) {
            const dropLevel = Math.max(this.player1?.potionDropLevel || 0, this.player2?.potionDropLevel || 0);
            const dropCount = 1 + Math.floor(dropLevel / 2) + (dropLevel > 0 && Math.random() < dropLevel * 0.18 ? 1 : 0);
            for (let i = 0; i < dropCount; i++) {
                const rx = Math.random() * (this.width - 50) + 25;
                this.potions.push(new Potion(rx, -50 - i * 28));
            }
            this.potionSpawnTimer = this.getPotionSpawnDelay();
        }

        this.ultimateOrbTimer -= dt;
        if (this.ultimateOrbTimer <= 0) {
            const rx = Math.random() * (this.width - 80) + 40;
            this.ultimateOrbs.push(new UltimateOrb(rx, -60));
            this.ultimateOrbTimer = this.getUltimateOrbDelay();
        }

        this.potions.forEach(p => p.update(dt, this));
        this.potions = this.potions.filter(p => p.active);
        this.ultimateOrbs.forEach(o => o.update(dt, this));
        this.ultimateOrbs = this.ultimateOrbs.filter(o => o.active);

        this.processDefeats();
    }

    processDefeats() {
        const p1Defeated = this.player1.health <= 0 && !(this.player1.tryAvoidRoundLoss && this.player1.tryAvoidRoundLoss(this));
        const p2Defeated = this.player2.health <= 0 && !(this.player2.tryAvoidRoundLoss && this.player2.tryAvoidRoundLoss(this));
        if (!p1Defeated && !p2Defeated) return;

        if (p1Defeated) this.stockCounts.p1 -= 1;
        if (p2Defeated) this.stockCounts.p2 -= 1;

        const p1Out = this.stockCounts.p1 <= 0;
        const p2Out = this.stockCounts.p2 <= 0;

        if (p1Out || p2Out) {
            const winnerTag = p1Out && !p2Out ? 'p2' : 'p1';
            this.roundOver(winnerTag);
            return;
        }

        const message = p1Defeated && p2Defeated
            ? `Double KO! Stocks ${this.stockCounts.p1} - ${this.stockCounts.p2}`
            : `${p1Defeated ? 'Player 1' : 'Player 2'} lost a stock!`;
        this.showAnnouncement(message, '#facc15');
        this.resetForNextStock({ p1: p1Defeated, p2: p2Defeated });
    }

    resetForNextStock(defeated = {}) {
        if (defeated.p1) this.resetPlayerForStock(this.player1, this.spawnPoints.p1, 1);
        if (defeated.p2) this.resetPlayerForStock(this.player2, this.spawnPoints.p2, -1);
    }

    resetPlayerForStock(player, spawn, facingDirection) {
        player.x = spawn.x;
        player.y = -player.height - 40;
        player.vx = 0;
        player.vy = 2;
        player.grounded = false;
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.ultimateCharge = 0;
        player.ultimateReady = false;
        player.facingDirection = facingDirection;
        player.immune = false;
        player.incomingDamageType = null;
        player.minimumAbilityCooldowns = { ability1: 0, ability2: 0 };
        player.manaLockTimer = 0;
        player.invertedControlsTimer = 0;
        player.ultimateImmunityTimer = Math.max(player.ultimateImmunityTimer || 0, 1.5);
        player.gamblerJackpotTimer = 0;
        player.infiniteManaTimer = 0;
    }

    handleUltimateInput(player, pressed, tag) {
        if (tag === 'p1') {
            if (pressed && !this.prevUltimate1) {
                if (player.useUltimate(this)) {
                    const stats = this.getStatsFor(player);
                    if (stats) stats.ultimates += 1;
                    this.addBurst(player.x + player.width / 2, player.y + player.height / 2, '#facc15', 26, 'Ultimate');
                    this.screenShake = Math.max(this.screenShake, 9);
                }
            }
            this.prevUltimate1 = pressed;
        } else {
            if (pressed && !this.prevUltimate2) {
                if (player.useUltimate(this)) {
                    const stats = this.getStatsFor(player);
                    if (stats) stats.ultimates += 1;
                    this.addBurst(player.x + player.width / 2, player.y + player.height / 2, '#facc15', 26, 'Ultimate');
                    this.screenShake = Math.max(this.screenShake, 9);
                }
            }
            this.prevUltimate2 = pressed;
        }
    }

    updateSuddenDeath(dt) {
        if (this.modifier !== 'Sudden Death') return;
        if (this.roundTimer < 30) return;

        this.suddenDeathActive = true;
        this.suddenDeathTick += dt;
        if (this.suddenDeathTick >= 1) {
            [this.player1, this.player2].forEach(player => {
                player.incomingDamageType = 'sudden_death';
                player.takeDamage(4);
                player.incomingDamageType = null;
            });
            this.suddenDeathTick = 0;
        }
    }

    updateHazards(dt) {
        this.hazardTimer -= dt;
        if (this.hazardTimer <= 0) {
            this.spawnMapHazard();
            this.hazardTimer = this.getHazardDelay();
        }

        this.hazardWarnings.forEach(w => {
            w.timer -= dt;
            if (w.timer <= 0 && !w.triggered) {
                w.triggered = true;
                w.trigger(this);
            }
        });
        this.hazardWarnings = this.hazardWarnings.filter(w => !w.triggered);
    }

    spawnMapHazard() {
        if (this.mapName === 'Sky Pillars') {
            const side = Math.random() > 0.5 ? 1 : -1;
            this.hazardWarnings.push({
                type: 'wind',
                x: side === 1 ? this.width - 220 : 0,
                y: 120,
                w: 220,
                h: this.floorY - 120,
                timer: 1.2,
                triggered: false,
                trigger: (game) => {
                    [game.player1, game.player2].forEach(player => {
                        if ((side === 1 && player.x > game.width / 2) || (side === -1 && player.x < game.width / 2)) {
                            player.x += side === 1 ? -120 : 120;
                        }
                    });
                }
            });
            return;
        }

        if (this.mapName === 'Floating Isles') {
            const x = 200 + Math.random() * (this.width - 400);
            this.queueHazardColumn(x, 0, 40, this.floorY, 1, '#fde68a', 18, 1.1);
            return;
        }

        if (this.mapName === 'Lava Caverns') {
            const x = 150 + Math.random() * (this.width - 300);
            this.queueHazardColumn(x, this.floorY - 180, 60, 180, -1, '#fb923c', 22, 0.9);
            return;
        }

        if (this.mapName === 'Celestial Tower') {
            const x = 560 + Math.random() * 160;
            this.queueHazardColumn(x, 0, 70, this.floorY, 1, '#dbeafe', 20, 1.0);
            return;
        }

        if (this.mapName === 'Chaos Bridges') {
            const y = 180 + Math.random() * 340;
            this.hazardWarnings.push({
                type: 'bolt',
                x: 0,
                y,
                w: this.width,
                h: 24,
                timer: 0.9,
                triggered: false,
                trigger: (game) => {
                    const bolt = new Projectile(0, y, 0, 0, 'hazard', 'rgba(244, 114, 182, 0.7)', 18, 'hazard_line');
                    bolt.width = game.width;
                    bolt.height = 24;
                    bolt.duration = 14;
                    game.addProjectile(bolt);
                }
            });
            return;
        }

        const x = this.width / 2 - 60;
        this.queueHazardColumn(x, 120, 120, this.floorY - 120, 1, '#fcd34d', 16, 1.0);
    }

    queueHazardColumn(x, y, w, h, dir, color, damage, warningTime) {
        this.hazardWarnings.push({
            type: 'column',
            x,
            y,
            w,
            h,
            timer: warningTime,
            triggered: false,
            trigger: (game) => {
                const hazard = new Projectile(x, y, 0, 0, 'hazard', color, damage, 'map_hazard');
                hazard.width = w;
                hazard.height = h;
                hazard.duration = 18;
                hazard.knockback = dir * 20;
                game.addProjectile(hazard);
            }
        });
    }

    roundOver(winnerTag) {
        if (!this.running) return;
        this.running = false;
        if (this.onRoundEnd) {
            this.onRoundEnd(winnerTag, {
                mapName: this.mapName,
                modifier: this.modifier,
                stats: JSON.parse(JSON.stringify(this.roundStats || {})),
                duration: this.roundTimer,
                stocksPerRound: this.stocksPerRound,
                stocksRemaining: { ...this.stockCounts }
            });
        }
    }

    checkCollisions() {
        const p1 = this.player1;
        const p2 = this.player2;

        this.projectiles.forEach(proj => {
            const targets = [];
            if (proj.owner === 'p1') targets.push(p2);
            else if (proj.owner === 'p2') targets.push(p1);
            else if (proj.owner === 'hazard') targets.push(p1, p2);

            targets.forEach(target => {
                if (!proj.active) return;
                if (proj.x < target.x + target.width &&
                    proj.x + proj.width > target.x &&
                    proj.y < target.y + target.height &&
                    proj.y + proj.height > target.y) {

                    const impactType = proj.type || 'unknown_attack';
                    const impactDamage = this.scaleDamageForSpeed(proj.damage, proj.owner);
                    const targetHealthBefore = target.health;
                    let wasAdapted = false;
                    target.incomingDamageType = impactType;
                    const isInstantKill = proj.instantKill || (impactType === 'snipe' && proj.damage >= 900);
                    if (isInstantKill) {
                        target.health = 0;
                        target.ultimateReady = false;
                        target.ultimateCharge = 0;
                        target.ultimateImmunityTimer = 0;
                        target.ignoredIncomingDamageType = null;
                    } else {
                        target.takeDamage(impactDamage);
                        wasAdapted = target.ignoredIncomingDamageType === impactType;
                        if (wasAdapted) target.ignoredIncomingDamageType = null;
                    }
                    target.incomingDamageType = null;
                    const damageDealt = Math.max(0, targetHealthBefore - target.health);
                    if (damageDealt > 0) {
                        const ownerStats = this.getStatsFor(proj.owner);
                        if (ownerStats) ownerStats.damageDealt += damageDealt;
                        this.addHitEffect(
                            target.x + target.width / 2,
                            target.y + target.height / 2,
                            damageDealt,
                            proj.owner === 'hazard' ? '#fb7185' : (proj.color || '#f8fafc')
                        );
                    }
                    if (wasAdapted) {
                        if (proj.type !== 'map_hazard' && proj.type !== 'hazard_line') proj.active = false;
                        return;
                    }
                    if (proj.onHit) proj.onHit(target);

                    if (proj.owner === 'p1' || proj.owner === 'p2') {
                        const owner = proj.owner === 'p1' ? p1 : p2;
                        if (owner.onHit) owner.onHit(target, impactDamage);
                        this.applyTalentOnHit(owner, target, damageDealt);
                    }

                    if (proj.knockback) {
                        target.x += proj.knockback;
                    }

                    if (proj.isSpear) {
                        proj.vx = 0;
                        proj.vy = 0;
                    } else if (proj.type !== 'map_hazard' && proj.type !== 'hazard_line') {
                        proj.active = false;
                    }

                    if (proj.type === 'steal') {
                        const attacker = proj.owner === 'p1' ? p1 : p2;
                        if (attacker.gainMana) attacker.gainMana(20);
                        if (target.spendMana) target.spendMana(20);
                    }
                }
            });

            if (proj.isPickup) {
                const ownerObj = proj.owner === 'p1' ? p1 : p2;
                if (proj.x < ownerObj.x + ownerObj.width &&
                    proj.x + proj.width > ownerObj.x &&
                    proj.y < ownerObj.y + ownerObj.height &&
                    proj.y + proj.height > ownerObj.y) {
                    if (ownerObj.retrieveSpear) {
                        ownerObj.retrieveSpear();
                        proj.active = false;
                    }
                }
            }
        });

        [this.player1, this.player2].forEach(player => {
            this.potions.forEach(pot => {
                if (pot.active &&
                    pot.x < player.x + player.width &&
                    pot.x + pot.width > player.x &&
                    pot.y < player.y + player.height &&
                    pot.y + pot.height > player.y) {
                    this.collectPotion(player);
                    pot.active = false;
                }
            });

            this.ultimateOrbs.forEach(orb => {
                if (orb.active &&
                    orb.x < player.x + player.width &&
                    orb.x + orb.width > player.x &&
                    orb.y < player.y + player.height &&
                    orb.y + orb.height > player.y) {
                    this.collectUltimateOrb(player);
                    orb.active = false;
                }
            });
        });
    }

    getDangerWarningForAI(ai) {
        return this.hazardWarnings.find(warning => {
            const overlapX = ai.x + ai.width > warning.x - 20 && ai.x < warning.x + warning.w + 20;
            const overlapY = ai.y + ai.height > warning.y - 20 && ai.y < warning.y + warning.h + 20;
            return overlapX && overlapY;
        });
    }

    applyHazardAvoidance(ai, keys, warning) {
        if (!warning) return false;

        const warningCenterX = warning.x + warning.w / 2;
        const aiCenterX = ai.x + ai.width / 2;

        if (warning.type === 'wind') {
            if (warningCenterX < this.width / 2) keys.right = true;
            else keys.left = true;
            if (ai.grounded) keys.jump = true;
            return true;
        }

        if (warning.w >= this.width - 10) {
            if (ai.grounded) keys.jump = true;
            return true;
        }

        if (aiCenterX < warningCenterX) keys.left = true;
        else keys.right = true;

        if (warning.h > 120 && ai.grounded && Math.random() < 0.7) {
            keys.jump = true;
        }
        return true;
    }

    getPriorityTargetX(ai, target) {
        let bestX = target.x;
        let bestScore = 0;

        this.ultimateOrbs.forEach(orb => {
            if (!orb.active) return;
            const dist = Math.abs(orb.x - ai.x);
            let score = 140 - dist * 0.3;
            if (ai.ultimateCharge < (ai.ultimateRequirement || 100)) score += 80;
            if (ai.ultimateReady) score -= 100;
            if (this.suddenDeathActive) score += 20;
            if (score > bestScore) {
                bestScore = score;
                bestX = orb.x;
            }
        });

        this.potions.forEach(potion => {
            if (!potion.active) return;
            const dist = Math.abs(potion.x - ai.x);
            let score = 110 - dist * 0.25;
            if (ai.mana < ai.maxMana * 0.35) score += 70;
            if (ai.health < ai.maxHealth * 0.35) score += 10;
            if (this.modifier === 'Arcane Surge') score += 15;
            if (score > bestScore) {
                bestScore = score;
                bestX = potion.x;
            }
        });

        return bestX;
    }

    getAIClassName(ai) {
        return ai.className || ai.constructor.name;
    }

    getPriorityTargetForAI(ai, target) {
        const pickupBias = this.getAIValue(ai, 'pickupBias', 1);
        let best = {
            type: 'enemy',
            x: target.x + target.width / 2,
            y: target.y + target.height / 2,
            score: 0
        };

        this.ultimateOrbs.forEach(orb => {
            if (!orb.active) return;
            const dist = Math.abs(orb.x - ai.x);
            let score = 165 - dist * 0.22;
            if (ai.ultimateCharge < (ai.ultimateRequirement || 100)) score += 120;
            if (ai.ultimateReady) score -= 90;
            if (ai.health < ai.maxHealth * 0.45) score += 35;
            if (this.modifier === 'Orb Storm') score += 15;
            score *= pickupBias;
            if (score > best.score) {
                best = { type: 'orb', x: orb.x, y: orb.y, score };
            }
        });

        this.potions.forEach(potion => {
            if (!potion.active) return;
            const dist = Math.abs(potion.x - ai.x);
            let score = 125 - dist * 0.2;
            if (ai.mana < ai.maxMana * 0.45) score += 85;
            if (this.getAIClassName(ai) === 'Mage' && ai.mana < ai.maxMana * 0.8) score += 35;
            if (this.modifier === 'Arcane Surge') score += 20;
            score *= pickupBias;
            if (score > best.score) {
                best = { type: 'potion', x: potion.x, y: potion.y, score };
            }
        });

        return best;
    }

    getBestAIPickup(ai, minScore = 0) {
        const pickupBias = this.getAIValue(ai, 'pickupBias', 1);
        let best = null;

        this.potions.forEach(potion => {
            if (!potion.active) return;
            const dist = Math.abs(potion.x - ai.x);
            let score = 105 - dist * 0.18;
            if (ai.mana < ai.maxMana * 0.45) score += 80;
            if (ai.health < ai.maxHealth * 0.5) score += 20;
            score *= pickupBias;
            if (score >= minScore && (!best || score > best.score)) {
                best = { type: 'potion', x: potion.x, y: potion.y, score };
            }
        });

        this.ultimateOrbs.forEach(orb => {
            if (!orb.active) return;
            const dist = Math.abs(orb.x - ai.x);
            let score = 130 - dist * 0.2;
            if (ai.ultimateCharge < (ai.ultimateRequirement || 100)) score += 105;
            if (ai.ultimateReady) score -= 85;
            if (ai.health < ai.maxHealth * 0.45) score += 20;
            score *= pickupBias;
            if (score >= minScore && (!best || score > best.score)) {
                best = { type: 'orb', x: orb.x, y: orb.y, score };
            }
        });

        return best;
    }

    shouldAIUseDefense(ai) {
        if (!this.p2IsNPC || !ai || ai.tag !== 'p2') return true;
        let chance = this.getAIValue(ai, 'avoidance', 0.7);
        if ((ai.aiAdaptTimer || 0) > 0) chance += 0.18;
        if (ai.health < ai.maxHealth * 0.45) chance += 0.12;
        return Math.random() < Math.min(0.98, chance);
    }

    useAIDefensiveAbility(ai, keys, className, combatAbsDist) {
        if (className === 'Guardian' && ai.mana > 12) keys.attack1 = true;
        if (className === 'Assassin' && ai.mana >= 40) keys.attack2 = true;
        if (className === 'Sniper' && ai.mana >= 15 && combatAbsDist < 260) keys.attack2 = true;
        if (className === 'Barbarian' && ai.mana >= 50 && ai.health < ai.maxHealth * 0.7) keys.attack2 = true;
        if (className === 'Priest' && ai.mana >= 40 && ai.health < ai.maxHealth * 0.7) keys.attack1 = true;
    }

    applyAIAdaptation(ai, target, keys, className, combatDist, combatAbsDist, desiredRange) {
        if ((ai.aiAdaptTimer || 0) <= 0) return false;

        const mode = ai.aiAdaptMode || 'retreat';
        if (mode === 'seek_pickup') {
            const pickup = this.getBestAIPickup(ai, 0);
            if (pickup) {
                const pickupDist = pickup.x - (ai.x + ai.width / 2);
                keys.left = pickupDist < -20;
                keys.right = pickupDist > 20;
                if (pickup.y < ai.y - 80 && ai.grounded) keys.jump = true;
                this.useAIDefensiveAbility(ai, keys, className, combatAbsDist);
                return true;
            }
        }

        if (mode === 'reposition') {
            const centerDist = this.width / 2 - (ai.x + ai.width / 2);
            keys.left = centerDist < -35;
            keys.right = centerDist > 35;
            if (ai.grounded) keys.jump = true;
            return true;
        }

        if (mode === 'close_gap') {
            if (combatDist > 0) keys.right = true;
            else keys.left = true;
            if (ai.grounded && Math.floor(this.roundTimer * 5) % 2 === 0) keys.jump = true;
            return false;
        }

        if (combatDist > 0) keys.left = true;
        else keys.right = true;
        if (ai.x < 70) {
            keys.left = false;
            keys.right = true;
        } else if (ai.x + ai.width > this.width - 70) {
            keys.left = true;
            keys.right = false;
        }
        if (ai.grounded) keys.jump = true;
        if (combatAbsDist < Math.max(120, desiredRange * 0.65)) {
            this.useAIDefensiveAbility(ai, keys, className, combatAbsDist);
            keys.attack1 = false;
            if (className !== 'Guardian' && className !== 'Assassin' && className !== 'Sniper' && className !== 'Priest' && className !== 'Barbarian') {
                keys.attack2 = false;
            }
        }
        return true;
    }

    applyAILevelPressure(ai, target, keys, className, combatAbsDist, desiredRange, isFacingTarget) {
        if (!this.p2IsNPC || ai.tag !== 'p2' || !isFacingTarget) return;

        const chance = this.getAIValue(ai, 'bonusAttackChance', 0);
        if (combatAbsDist < desiredRange + 170 && Math.random() < chance) keys.attack1 = true;
        if (ai.mana > ai.maxMana * 0.45 && combatAbsDist < desiredRange + 220 && Math.random() < chance * 0.75) {
            keys.attack2 = true;
        }
        if ((ai.aiAdaptTimer || 0) > 0 && ai.aiAdaptMode === 'close_gap' && combatAbsDist < desiredRange + 140 && Math.random() < chance * 1.5) {
            keys.attack2 = true;
        }
    }

    applyAILevelActionFilter(ai, keys) {
        if (!this.p2IsNPC || !ai || ai.tag !== 'p2') return keys;

        const followThrough = this.getAIValue(ai, 'followThrough', 1);
        if (keys.attack1 && Math.random() > followThrough) keys.attack1 = false;
        if (keys.attack2 && Math.random() > followThrough) keys.attack2 = false;
        if (keys.ultimate && Math.random() > this.getAIValue(ai, 'ultimateChance', 1)) keys.ultimate = false;
        return keys;
    }

    getIncomingProjectileThreat(ai) {
        return this.projectiles.find(projectile => {
            if (!projectile.active) return false;
            if (projectile.owner === ai.tag || projectile.owner === 'effect') return false;
            if (projectile.owner !== 'p1' && projectile.owner !== 'p2' && projectile.owner !== 'hazard') return false;

            const expandedTop = ai.y - 35;
            const expandedBottom = ai.y + ai.height + 35;
            const verticalOverlap = projectile.y + projectile.height > expandedTop && projectile.y < expandedBottom;
            if (!verticalOverlap) return false;

            if (projectile.owner === 'hazard') {
                return projectile.x < ai.x + ai.width + 50 && projectile.x + projectile.width > ai.x - 50;
            }

            const projectileCenter = projectile.x + projectile.width / 2;
            const aiCenter = ai.x + ai.width / 2;
            const approaching = (projectile.vx > 0 && projectileCenter < aiCenter) || (projectile.vx < 0 && projectileCenter > aiCenter);
            return approaching && Math.abs(projectileCenter - aiCenter) < 280;
        });
    }

    applyProjectileAvoidance(ai, keys, threat) {
        if (!threat) return false;

        const threatCenter = threat.x + threat.width / 2;
        const aiCenter = ai.x + ai.width / 2;
        if (threatCenter < aiCenter) keys.right = true;
        else keys.left = true;

        if (ai.x < 60) {
            keys.left = false;
            keys.right = true;
        } else if (ai.x + ai.width > this.width - 60) {
            keys.left = true;
            keys.right = false;
        }

        if (ai.grounded) keys.jump = true;

        const className = this.getAIClassName(ai);
        if (className === 'Guardian' && ai.mana > 12) keys.attack1 = true;
        if (className === 'Assassin' && ai.mana >= 40) keys.attack2 = true;
        if (className === 'Sniper' && ai.mana >= 15) keys.attack2 = true;
        if (ai.ultimateReady && ai.health < ai.maxHealth * 0.55) keys.ultimate = true;
        return true;
    }

    getAIDesiredRange(ai) {
        const className = this.getAIClassName(ai);
        const ranges = {
            Assassin: 55,
            Barbarian: 65,
            Devil: 75,
            Guardian: 80,
            Spearman: ai.mana >= 40 && !ai.disarmed ? 280 : 145,
            Lancer: ai.mana >= 34 && !ai.disarmed ? 280 : 145,
            Fighter: 330,
            Trapper: 230,
            GravityMage: ai.grounded ? 250 : 90,
            Broker: ai.dealerLevel && ai.dealerLevel >= 5 ? 280 : 520,
            Priest: 380,
            Mage: 450,
            Necromancer: 440,
            Alchemist: 360,
            Gambler: ai.currentClass ? 260 : 310,
            Sniper: 560,
            Duelist: 360,
            Gojo: 390,
            Sukuna: 115,
            Killua: 250,
            Knuckle: 95,
            Sinbad: 260,
            Vader: 170,
            Mahoraga: 120,
            Aladdin: 430,
            Alibaba: 210,
            Escanor: 150,
            Saber: 145,
            Archer: 520,
            Lancer: 190,
            Gilgamesh: 470,
            RiderZero: 170,
            RiderStayNight: 240,
            CasterZero: 430,
            CasterStayNight: 460,
            AssassinZero: 280,
            AssassinStayNight: 120,
            BerserkerZero: 120,
            BerserkerStayNight: 85
        };
        return ranges[className] || 260;
    }

    moveAITowardRange(ai, target, priority, desiredRange, keys) {
        const targetCenter = target.x + target.width / 2;
        const aiCenter = ai.x + ai.width / 2;

        if (priority.type !== 'enemy' && priority.score > 55) {
            const pickupDist = priority.x - aiCenter;
            if (Math.abs(pickupDist) > 24) {
                if (pickupDist > 0) keys.right = true;
                else keys.left = true;
            }
            if (priority.y < ai.y - 80 && ai.grounded) keys.jump = true;
            return;
        }

        const combatDist = targetCenter - aiCenter;
        const absDist = Math.abs(combatDist);
        const tooFar = absDist > desiredRange + 35;
        const tooClose = absDist < Math.max(35, desiredRange - 45);

        if (tooFar) {
            if (combatDist > 0) keys.right = true;
            else keys.left = true;
        } else if (tooClose) {
            if (combatDist > 0) keys.left = true;
            else keys.right = true;
        }

        if (ai.x < 35) {
            keys.left = false;
            keys.right = true;
        } else if (ai.x + ai.width > this.width - 35) {
            keys.left = true;
            keys.right = false;
        }

        if (target.y < ai.y - 105 && ai.grounded) keys.jump = true;
        if (target.y > ai.y + 160 && absDist < 110) keys.down = true;
    }

    shouldAIUltimate(ai, target, className, combatAbsDist) {
        if (!ai.ultimateReady) return false;
        const ultimateChance = this.getAIValue(ai, 'ultimateChance', 1);
        if (this.storyBoss && this.roundTimer > 1.2 && combatAbsDist < 760) return Math.random() < 0.92;
        if (this.npcLevel === 'Nightmare' && this.roundTimer > 1.8 && combatAbsDist < 640) return Math.random() < 0.72;
        if (target.health < target.maxHealth * 0.38) return Math.random() < Math.min(0.98, 0.9 * ultimateChance);
        if (ai.health < ai.maxHealth * 0.42) return Math.random() < Math.min(0.98, 0.85 * ultimateChance);
        if (this.suddenDeathActive && combatAbsDist < 500) return Math.random() < Math.min(0.98, 0.8 * ultimateChance);

        const ranges = {
            Sniper: 900,
            Mage: 560,
            Necromancer: 620,
            Broker: 520,
            Alchemist: 520,
            Priest: 360,
            Trapper: 340,
            Fighter: 500,
            Spearman: 500,
            GravityMage: 460,
            Duelist: 520,
            Gojo: 560,
            Sukuna: 420,
            Killua: 460,
            Knuckle: 320,
            Sinbad: 480,
            Vader: 430,
            Mahoraga: 360,
            Aladdin: 540,
            Alibaba: 460,
            Escanor: 420,
            Saber: 540,
            Archer: 620,
            Lancer: 480,
            Gilgamesh: 680,
            RiderZero: 460,
            RiderStayNight: 440,
            CasterZero: 560,
            CasterStayNight: 560,
            AssassinZero: 430,
            AssassinStayNight: 340,
            BerserkerZero: 360,
            BerserkerStayNight: 300,
            Gambler: 460,
            Assassin: 240,
            Barbarian: 280,
            Devil: 280,
            Guardian: 290
        };
        return combatAbsDist < (ranges[className] || 380) && Math.random() < Math.min(0.95, 0.55 * ultimateChance);
    }

    getAIInput(ai, target) {
        const keys = {
            left: false,
            right: false,
            jump: false,
            down: false,
            attack1: false,
            attack2: false,
            ultimate: false
        };

        const className = this.getAIClassName(ai);
        const meleeClasses = ['Devil', 'Barbarian', 'Spearman', 'Assassin', 'Guardian', 'Sukuna', 'Knuckle', 'Vader', 'Mahoraga', 'Escanor', 'Saber', 'Lancer', 'RiderZero', 'AssassinStayNight', 'BerserkerZero', 'BerserkerStayNight'];
        const isMelee = meleeClasses.includes(className);
        const isRanged = !isMelee;
        const dangerWarning = this.getDangerWarningForAI(ai);

        if (dangerWarning && this.shouldAIUseDefense(ai) && this.applyHazardAvoidance(ai, keys, dangerWarning)) {
            if (ai.ultimateReady && ai.health < ai.maxHealth * 0.45) keys.ultimate = true;
            return this.applyAILevelActionFilter(ai, keys);
        }

        const projectileThreat = this.getIncomingProjectileThreat(ai);
        if (projectileThreat && this.shouldAIUseDefense(ai) && this.applyProjectileAvoidance(ai, keys, projectileThreat)) {
            return this.applyAILevelActionFilter(ai, keys);
        }

        const desiredRange = this.getAIDesiredRange(ai);
        const combatDist = (target.x + target.width / 2) - (ai.x + ai.width / 2);
        const combatAbsDist = Math.abs(combatDist);

        if (this.applyAIAdaptation(ai, target, keys, className, combatDist, combatAbsDist, desiredRange)) {
            return this.applyAILevelActionFilter(ai, keys);
        }

        const priority = this.getPriorityTargetForAI(ai, target);
        this.moveAITowardRange(ai, target, priority, desiredRange, keys);

        const yDist = target.y - ai.y;

        if ((className === 'Spearman' || className === 'Lancer') && ai.disarmed) {
            const thrownSpear = this.projectiles.find(p => p.isSpear && p.owner === ai.tag);
            if (thrownSpear) {
                const spearDist = thrownSpear.x - ai.x;
                if (Math.abs(spearDist) > 30) {
                    if (spearDist > 0) keys.right = true;
                    else keys.left = true;
                }
                if (thrownSpear.y < ai.y - 50) keys.jump = true;
                return this.applyAILevelActionFilter(ai, keys);
            }
        }

        if (this.suddenDeathActive && combatAbsDist > 120) {
            keys.left = false;
            keys.right = false;
            if (combatDist > 0) keys.right = true;
            else keys.left = true;
        }

        if (yDist < -100 && ai.grounded && Math.random() < 0.22) keys.jump = true;
        if (this.modifier === 'Low Gravity' && target.y < ai.y - 80 && ai.grounded && Math.random() < 0.3) keys.jump = true;

        const isFacingTarget = (combatDist > 0 && ai.facingDirection === 1) || (combatDist < 0 && ai.facingDirection === -1);
        if (this.shouldAIUltimate(ai, target, className, combatAbsDist)) keys.ultimate = true;

        if (isFacingTarget) {
            const nightmarePressure = this.npcLevel === 'Nightmare' ? 1.35 : 1;
            if (className === 'Mage') {
                if (ai.mana > 220 && combatAbsDist < 560 && Math.random() < (this.modifier === 'Arcane Surge' ? 0.22 : 0.12) * nightmarePressure) keys.attack2 = true;
                if (ai.mana > 20 && combatAbsDist < 650 && Math.random() < 0.28 * nightmarePressure) keys.attack1 = true;
                else if (combatAbsDist < 100 && Math.random() < 0.05 * nightmarePressure) keys.attack1 = true;
            } else if (className === 'Broker') {
                if (ai.mana >= 20 && ai.dealerLevel < 8 && Math.random() < 0.28 * nightmarePressure) keys.attack1 = true;
                if (ai.dealerLevel >= 3 && combatAbsDist < 540 && Math.random() < 0.38 * nightmarePressure) keys.attack2 = true;
                if (combatAbsDist < 100 && Math.random() < 0.28) {
                    keys.down = true;
                    keys.attack2 = true;
                }
            } else if (className === 'GravityMage') {
                if (ai.mana >= 40 && combatAbsDist < 460 && Math.random() < 0.18) keys.attack1 = true;
                if (ai.mana >= 30 && !ai.grounded && yDist > 65 && combatAbsDist < 150 && Math.random() < 0.38) keys.attack2 = true;
            } else if (className === 'Guardian') {
                if (combatAbsDist < 110 && Math.random() < 0.48) keys.attack1 = true;
                if (ai.mana >= 30 && combatAbsDist < 260 && Math.random() < 0.32) keys.attack2 = true;
            } else if (className === 'Alchemist') {
                if (ai.mana >= 50 && Math.random() < 0.16) keys.attack1 = true;
                if (ai.mana >= 20 && combatAbsDist < 480 && Math.random() < 0.28) keys.attack2 = true;
            } else if (className === 'Spearman' || className === 'Lancer') {
                if (!ai.disarmed) {
                    if (combatAbsDist < 180 && Math.random() < 0.5) keys.attack1 = true;
                    const throwCost = className === 'Lancer' ? 34 : 40;
                    if (ai.mana >= throwCost && combatAbsDist > 170 && combatAbsDist < 560 && Math.random() < 0.2) keys.attack2 = true;
                }
            } else if (className === 'Priest') {
                if (ai.health < ai.maxHealth * 0.68 && ai.mana >= 40 && Math.random() < 0.28) keys.attack1 = true;
                if (ai.mana >= 20 && combatAbsDist < 560 && Math.random() < 0.32) keys.attack2 = true;
            } else if (className === 'Devil') {
                if (combatAbsDist < 130 && Math.random() < 0.58) keys.attack1 = true;
                if (ai.health > ai.maxHealth * 0.45 && ai.mana >= 50 && Math.random() < 0.18) keys.attack2 = true;
            } else if (className === 'Fighter') {
                if (combatAbsDist < 560 && Math.random() < 0.42) keys.attack1 = true;
                if (ai.mana >= 30 && combatAbsDist > 110 && combatAbsDist < 460 && Math.random() < 0.28) keys.attack2 = true;
            } else if (className === 'Barbarian') {
                if (combatAbsDist < 135 && Math.random() < 0.52) keys.attack1 = true;
                if (ai.health < ai.maxHealth * 0.72 && ai.mana >= 50 && (ai.rageTimer || 0) <= 0 && Math.random() < 0.28) keys.attack2 = true;
            } else if (className === 'Necromancer') {
                const minionCount = this.minions ? this.minions.filter(m => m.owner === ai.tag).length : 0;
                if (minionCount < 3 && ai.mana >= 20 && Math.random() < 0.26) keys.attack1 = true;
                if (minionCount < 2 && ai.mana >= 60 && Math.random() < 0.22) keys.attack2 = true;
            } else if (className === 'Assassin') {
                if (combatAbsDist < 85 && Math.random() < 0.68) keys.attack1 = true;
                if ((ai.health < ai.maxHealth * 0.6 || (combatAbsDist > 180 && combatAbsDist < 430)) && ai.mana >= 40 && Math.random() < 0.24) keys.attack2 = true;
            } else if (className === 'Trapper') {
                if (ai.mana >= 20 && combatAbsDist > 80 && combatAbsDist < 340 && Math.random() < 0.28) keys.attack1 = true;
                if (combatAbsDist < 260 && Math.random() < 0.34) keys.attack2 = true;
            } else if (className === 'Gambler') {
                if (ai.mana >= 30 && !ai.currentClass && Math.random() < 0.3) keys.attack1 = true;
                if (ai.currentClass) {
                    if (combatAbsDist < 440 && Math.random() < 0.34) keys.attack1 = true;
                    if (combatAbsDist < 340 && Math.random() < 0.3) keys.attack2 = true;
                }
                if (!ai.currentClass && ai.mana >= 10 && ai.mana < 30 && Math.random() < 0.16) keys.attack2 = true;
            } else if (className === 'Sniper') {
                if (ai.mana >= ai.maxMana && combatAbsDist > 180 && Math.random() < 0.48) keys.attack1 = true;
                if (combatAbsDist < 220 && ai.mana >= 15 && Math.random() < 0.42) keys.attack2 = true;
            } else if (className === 'Duelist') {
                if ((!ai.currentCard || Math.random() < 0.12) && Math.random() < 0.3) keys.attack1 = true;
                if (ai.currentCard && ai.mana >= ai.currentCard.mana) {
                    if (ai.currentCard.type === 'monster' && combatAbsDist > 130 && Math.random() < 0.34) keys.attack2 = true;
                    if (ai.currentCard.type === 'trap' && combatAbsDist < 180 && Math.random() < 0.45) keys.attack2 = true;
                    if (ai.currentCard.type === 'spell' && Math.random() < 0.3) keys.attack2 = true;
                    if (ai.currentCard.type === 'exodia') keys.attack2 = true;
                }
            } else if ((window.AnimeCharacterNames || []).includes(className)) {
                if (combatAbsDist < desiredRange + 180 && Math.random() < 0.38) keys.attack1 = true;
                if (ai.mana >= ai.maxMana * 0.25 && combatAbsDist < desiredRange + 260 && Math.random() < 0.28) keys.attack2 = true;
                if (className === 'Gojo' && ai.blueOrb && ai.blueOrb.active && ai.mana >= 35 && Math.random() < 0.42) keys.attack2 = true;
                if (className === 'Sukuna' && ai.mana >= 45 && combatAbsDist > 130 && Math.random() < 0.32) keys.attack2 = true;
                if (className === 'Knuckle' && !ai.hakowareTarget && ai.mana >= 38 && Math.random() < 0.36) keys.attack2 = true;
                if (className === 'Killua' && combatAbsDist < 260 && ai.mana >= 26 && Math.random() < 0.34) keys.attack2 = true;
                if (className === 'Vader') {
                    if (combatAbsDist < 150 && Math.random() < 0.5) keys.attack1 = true;
                    if (ai.mana >= 28 && combatAbsDist < 360 && Math.random() < 0.36) keys.attack2 = true;
                }
            } else {
                if (isRanged) {
                    if (combatAbsDist < 620 && Math.random() < 0.28) keys.attack1 = true;
                    if (ai.mana >= 30 && combatAbsDist < 520 && Math.random() < 0.2) keys.attack2 = true;
                } else {
                    if (combatAbsDist < 115 && Math.random() < 0.48) keys.attack1 = true;
                    if (ai.mana >= 30 && combatAbsDist < 180 && Math.random() < 0.28) keys.attack2 = true;
                }
            }
        }

        this.applyAILevelPressure(ai, target, keys, className, combatAbsDist, desiredRange, isFacingTarget);
        return this.applyAILevelActionFilter(ai, keys);
    }

    drawBackground() {
        const theme = this.mapTheme;
        const bg = this.ctx.createLinearGradient(0, 0, 0, this.height);
        bg.addColorStop(0, theme.skyTop);
        bg.addColorStop(1, theme.skyBottom);
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = theme.accent;
        this.ctx.beginPath();
        this.ctx.arc(170, 130, 100, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.width - 180, 170, 140, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = theme.haze;
        const hazeCount = Math.ceil(this.width / 260) + 1;
        for (let i = 0; i < hazeCount; i++) {
            const x = (i * 260) - 40;
            const y = 80 + (i % 2) * 90;
            this.ctx.fillRect(x, y, 220, 24);
        }

        this.drawMapIdentityBackground();
    }

    drawMapIdentityBackground() {
        const pulse = 0.5 + Math.sin(this.mapPulse * 2.4) * 0.5;
        this.ctx.save();
        if (this.mapName === 'Sky Pillars') {
            this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.14 + pulse * 0.12})`;
            this.ctx.lineWidth = 3;
            for (let y = 150; y < this.floorY; y += 95) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                for (let x = 0; x <= this.width; x += 80) {
                    this.ctx.lineTo(x, y + Math.sin(this.mapPulse * 3 + x * 0.02) * 18);
                }
                this.ctx.stroke();
            }
        } else if (this.mapName === 'Lava Caverns') {
            this.ctx.fillStyle = `rgba(251, 146, 60, ${0.18 + pulse * 0.12})`;
            for (let x = 0; x < this.width; x += 80) {
                const h = 20 + Math.sin(this.mapPulse * 4 + x * 0.03) * 10;
                this.ctx.fillRect(x, this.floorY + 18 - h, 42, h);
            }
        } else if (this.mapName === 'Floating Isles') {
            this.ctx.fillStyle = `rgba(190, 242, 100, ${0.16 + pulse * 0.08})`;
            for (let i = 0; i < 18; i++) {
                const x = (i * 173 + this.mapPulse * 18) % this.width;
                const y = 110 + (i % 5) * 92;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8 + (i % 3) * 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (this.mapName === 'Celestial Tower') {
            this.ctx.fillStyle = `rgba(219, 234, 254, ${0.12 + pulse * 0.12})`;
            for (let x = 170; x < this.width; x += 260) {
                this.ctx.fillRect(x, 0, 34, this.floorY);
            }
        } else if (this.mapName === 'Chaos Bridges') {
            this.ctx.strokeStyle = `rgba(244, 114, 182, ${0.18 + pulse * 0.15})`;
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                this.ctx.beginPath();
                const y = 130 + i * 72;
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y + Math.sin(this.mapPulse * 5 + i) * 45);
                this.ctx.stroke();
            }
        } else if (this.mapName === 'Titan Expanse') {
            this.ctx.strokeStyle = `rgba(250, 204, 21, ${0.12 + pulse * 0.08})`;
            this.ctx.lineWidth = 6;
            for (let x = 220; x < this.width; x += 360) {
                this.ctx.strokeRect(x, 180, 150, this.floorY - 260);
            }
        }
        this.ctx.restore();
    }

    drawFloor() {
        const theme = this.mapTheme;
        const floorGradient = this.ctx.createLinearGradient(0, this.floorY, 0, this.height);
        floorGradient.addColorStop(0, theme.floorTop);
        floorGradient.addColorStop(1, theme.floorBottom);
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, this.floorY, this.width, 100);
        this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
        this.ctx.fillRect(0, this.floorY, this.width, 6);
    }

    drawPlatforms() {
        const theme = this.mapTheme;
        this.platforms.forEach(p => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            this.ctx.fillRect(p.x + 6, p.y + 8, p.w, p.h);
            this.ctx.fillStyle = theme.platformFace;
            this.ctx.fillRect(p.x, p.y, p.w, p.h);
            this.ctx.fillStyle = theme.platformTop;
            this.ctx.fillRect(p.x, p.y, p.w, Math.max(6, Math.floor(p.h / 3)));
            this.ctx.strokeStyle = theme.platformEdge;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(p.x, p.y, p.w, p.h);
        });
    }

    drawHazards() {
        this.hazardWarnings.forEach(w => {
            this.ctx.save();
            this.ctx.fillStyle = w.type === 'wind' ? 'rgba(125, 211, 252, 0.22)' : 'rgba(248, 113, 113, 0.25)';
            this.ctx.fillRect(w.x, w.y, w.w, w.h);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(w.x, w.y, w.w, w.h);
            this.ctx.restore();
        });
    }

    drawVisualEffects() {
        this.visualEffects.forEach(effect => {
            const alpha = Math.max(0, Math.min(1, effect.life / effect.maxLife));
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            if (effect.kind === 'text') {
                this.ctx.fillStyle = effect.color;
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                this.ctx.lineWidth = 4;
                this.ctx.strokeText(effect.label, effect.x, effect.y);
                this.ctx.fillText(effect.label, effect.x, effect.y);
            } else if (effect.kind === 'ring') {
                this.ctx.strokeStyle = effect.color;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius * (1.4 - alpha * 0.4), 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = effect.color;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        });
    }

    updateCamera() {
        if (this.fitToView) {
            this.cameraX = 0;
            this.cameraY = 0;
            return;
        }

        const center1 = this.player1.x + this.player1.width / 2;
        const center2 = this.player2.x + this.player2.width / 2;
        const focusX = (center1 + center2) / 2;
        const targetX = focusX - this.viewWidth / 2;
        const maxX = Math.max(0, this.width - this.viewWidth);
        this.cameraX += (Math.max(0, Math.min(maxX, targetX)) - this.cameraX) * 0.12;

        const centerY1 = this.player1.y + this.player1.height / 2;
        const centerY2 = this.player2.y + this.player2.height / 2;
        const focusY = (centerY1 + centerY2) / 2;
        const targetY = focusY - this.viewHeight / 2;
        const maxY = Math.max(0, this.height - this.viewHeight);
        this.cameraY += (Math.max(0, Math.min(maxY, targetY)) - this.cameraY) * 0.12;
    }

    draw() {
        this.updateCamera();
        this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);

        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
        }
        if (this.fitToView) {
            this.ctx.translate(this.renderOffsetX, this.renderOffsetY);
            this.ctx.scale(this.renderScale, this.renderScale);
        } else {
            this.ctx.translate(-this.cameraX, -this.cameraY);
        }
        this.drawBackground();

        this.drawFloor();
        this.drawPlatforms();
        this.drawHazards();

        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        this.projectiles.forEach(p => p.draw(this.ctx));
        if (this.minions) this.minions.forEach(m => m.draw(this.ctx));
        this.potions.forEach(p => p.draw(this.ctx));
        this.ultimateOrbs.forEach(o => o.draw(this.ctx));
        this.drawVisualEffects();
        this.ctx.restore();

        if (this.mapName) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.mapName, this.viewWidth / 2, 40);
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('p1-health').style.width = (this.player1.health / this.player1.maxHealth * 100) + '%';
        document.getElementById('p1-mana').style.width = (this.player1.mana / this.player1.maxMana * 100) + '%';
        document.getElementById('p2-health').style.width = (this.player2.health / this.player2.maxHealth * 100) + '%';
        document.getElementById('p2-mana').style.width = (this.player2.mana / this.player2.maxMana * 100) + '%';
        document.getElementById('p1-ultimate').style.width = Math.min(100, this.player1.ultimateCharge / (this.player1.ultimateRequirement || 100) * 100) + '%';
        document.getElementById('p2-ultimate').style.width = Math.min(100, this.player2.ultimateCharge / (this.player2.ultimateRequirement || 100) * 100) + '%';

        const roundDisplay = document.getElementById('round-display');
        const modifierDisplay = document.getElementById('modifier-display');
        const modifierDetail = document.getElementById('modifier-detail');
        const gameSpeedDisplay = document.getElementById('game-speed-display');
        const scoreDisplay = document.getElementById('score-display');
        const stockDisplay = document.getElementById('stock-display');
        const modifierInfo = window.ModifierDescriptions?.[this.modifier];
        if (roundDisplay) roundDisplay.textContent = `Round ${this.roundNumber}`;
        if (gameSpeedDisplay) gameSpeedDisplay.textContent = `Speed: ${this.gameSpeedProfile.name || this.gameSpeed}`;
        if (modifierDisplay) modifierDisplay.textContent = `Modifier: ${this.modifier}${this.suddenDeathActive ? ' | Sudden Death!' : ''}`;
        if (modifierDetail) modifierDetail.textContent = modifierInfo ? modifierInfo.description : '';
        if (scoreDisplay && this.matchState) scoreDisplay.textContent = `${this.matchState.score.p1} - ${this.matchState.score.p2}`;
        if (stockDisplay) stockDisplay.textContent = `Stocks: ${this.stockCounts.p1} - ${this.stockCounts.p2}`;
    }
}
