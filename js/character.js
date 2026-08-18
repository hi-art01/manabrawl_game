class Character {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 75;
        this.height = 150;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = 22; // Increased to ensure top platforms are reachable
        this.grounded = false;
        this.health = 100;
        this.maxHealth = 100;
        this.mana = 0;
        this.maxMana = 60; // Lowered base mana for non-mage classes
        this.damageMultiplier = 1;
        this.facingDirection = 1; // 1 = Right, -1 = Left
        this.damageReduction = 0; // % reduction (0 to 1)
        this.spriteFlipped = false; // Set to true if native image faces LEFT
        this.ultimateCharge = 0;
        this.ultimateRequirement = 100;
        this.ultimateReady = false;
        this.dodgeChance = 0;
        this.talentDamageReduction = 0;
        this.talentManaRegen = 0;
        this.talentLifeSteal = 0;
        this.ultimateDamageReduction = 0;
        this.dodgeTextTimer = 0;
        this.infiniteManaTimer = 0;
        this.ultimateImmunityTimer = 0;
        this.gamblerJackpotTimer = 0;
        this.manaLockTimer = 0;
        this.hakowareDebt = 0;
        this.minimumAbilityCooldown = 0.5;
        this.minimumAbilityCooldowns = {
            ability1: 0,
            ability2: 0
        };

        // Sprite Support
        this.image = new Image();
        this.loadSprite();
        this.applyMinimumAbilityCooldowns();
    }

    applyMinimumAbilityCooldowns() {
        ['ability1', 'ability2'].forEach(abilityName => {
            const original = this[abilityName];
            if (typeof original !== 'function' || original.minimumCooldownWrapped) return;
            const wrapped = (...args) => {
                if (this.minimumAbilityCooldowns[abilityName] > 0) return false;
                const result = original.apply(this, args);
                this.minimumAbilityCooldowns[abilityName] = Math.max(
                    this.minimumAbilityCooldowns[abilityName],
                    this.minimumAbilityCooldown
                );
                return result;
            };
            wrapped.minimumCooldownWrapped = true;
            this[abilityName] = wrapped;
        });
    }

    loadSprite() {
        const mapping = {
            'Priest': 'priest.png',
            'Devil': 'devil.png',
            'Fighter': 'fighter.png',
            'Mage': 'mage.png',
            'Barbarian': 'barbarian.png',
            'Spearman': 'Spearman.png',
            'Necromancer': 'necromancer.png',
            'Assassin': 'assassin.png',
            'Trapper': 'traper.png',
            'Broker': 'broker.png',
            'Gambler': 'gambler.png',
            'Sniper': 'sniper.png',
            'Alchemist': 'alchemist.png',
            'Guardian': 'guardian.png',
            'GravityMage': 'gravity_mage.png',
            'Duelist': 'duelist.png',
            'Vader': 'vader.png'
        };
        const name = this.className || this.constructor.name;
        const fileName = mapping[name] || (name.toLowerCase() + '.png');
        this.image.src = 'imges/' + fileName;
    }

    takeDamage(amount) {
        if (this.ultimateImmunityTimer > 0) return;
        if (this.immune) return; // Assassin Immunity
        if (this.dodgeChance > 0 && Math.random() < this.dodgeChance) {
            this.dodgeTextTimer = 0.45;
            const dodgeEffects = this.talentEffects || {};
            if (dodgeEffects.healOnDodge) this.heal(dodgeEffects.healOnDodge);
            if (dodgeEffects.manaOnDodge) this.gainMana(dodgeEffects.manaOnDodge);
            return;
        }

        const talentEffects = this.talentEffects || {};
        if ((this.incomingDamageType === 'map_hazard' || this.incomingDamageType === 'hazard_line') && talentEffects.hazardDamageReduction) {
            amount = amount * (1 - talentEffects.hazardDamageReduction);
        }

        if (talentEffects.lowHealthDamageReduction) {
            const threshold = talentEffects.lowHealthThreshold || 0.4;
            if (this.health <= this.maxHealth * threshold) {
                amount = amount * (1 - talentEffects.lowHealthDamageReduction);
            }
        }

        // Apply damage reduction
        amount = amount * (1 - this.damageReduction);
        amount = amount * (1 - this.talentDamageReduction);
        amount = amount * (1 - this.ultimateDamageReduction);
        const healthBefore = this.health;
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        const damageTaken = Math.max(0, healthBefore - this.health);

        if (damageTaken > 0 && talentEffects.manaOnDamageTaken) {
            this.gainMana(damageTaken * talentEffects.manaOnDamageTaken);
        }
        if (damageTaken > 0 && talentEffects.ultimateOnDamageTaken) {
            this.gainUltimateCharge(damageTaken * talentEffects.ultimateOnDamageTaken);
        }
    }

    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }

    gainMana(amount) {
        this.mana += amount;
        if (this.mana > this.maxMana) this.mana = this.maxMana;
    }

    gainUltimateCharge(amount) {
        this.ultimateCharge += amount;
        const requirement = this.ultimateRequirement || 100;
        if (this.ultimateCharge >= requirement) {
            this.ultimateCharge = requirement;
            this.ultimateReady = true;
        }
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0) return false;
        if (!this.ultimateReady) return false;

        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);
        if (this.talentEffects && this.talentEffects.ultimateRefund) {
            this.gainUltimateCharge(this.talentEffects.ultimateRefund);
        }

        const className = this.getUltimateClassName();
        if (game.showAnnouncement) {
            game.showAnnouncement(this.getUltimateName(className), this.getUltimateColor(className));
        }

        switch (className) {
            case 'Priest':
                this.priestUltimate(game);
                break;
            case 'Devil':
                this.devilUltimate(game);
                break;
            case 'Fighter':
                this.fighterUltimate(game);
                break;
            case 'Mage':
                this.mageUltimate(game);
                break;
            case 'Barbarian':
                this.barbarianUltimate(game);
                break;
            case 'Spearman':
                this.spearmanUltimate(game);
                break;
            case 'Necromancer':
                this.necromancerUltimate(game);
                break;
            case 'Assassin':
                this.assassinUltimate(game);
                break;
            case 'Trapper':
                this.trapperUltimate(game);
                break;
            case 'Broker':
                this.brokerUltimate(game);
                break;
            case 'Gambler':
                this.gamblerUltimate(game);
                break;
            case 'Sniper':
                this.sniperUltimate(game);
                break;
            case 'Alchemist':
                this.alchemistUltimate(game);
                break;
            case 'Guardian':
                this.guardianUltimate(game);
                break;
            case 'GravityMage':
                this.gravityMageUltimate(game);
                break;
            case 'Duelist':
                this.duelistUltimate(game);
                break;
            default:
                this.arcaneBurstUltimate(game);
                break;
        }
        return true;
    }

    getUltimateClassName() {
        return this.className || this.constructor.name;
    }

    getUltimateName(className) {
        const names = {
            Priest: 'Divine Sanctuary',
            Devil: 'Hellgate',
            Fighter: 'Full Auto Barrage',
            Mage: 'Elemental Cataclysm',
            Barbarian: 'Earthbreaker',
            Spearman: 'Phalanx Storm',
            Necromancer: 'Grave Legion',
            Assassin: 'Death Mark',
            Trapper: 'Minefield',
            Broker: 'Market Crash',
            Gambler: 'Jackpot Finale',
            Sniper: 'Deadeye',
            Alchemist: 'Chemical Flood',
            Guardian: 'Aegis Nova',
            GravityMage: 'Singularity',
            Duelist: 'Egyptian God Summon'
        };
        return names[className] || 'Arcane Burst';
    }

    getUltimateColor(className) {
        const colors = {
            Priest: '#fde68a',
            Devil: '#ef4444',
            Fighter: '#f97316',
            Mage: '#a78bfa',
            Barbarian: '#fb923c',
            Spearman: '#facc15',
            Necromancer: '#a3e635',
            Assassin: '#94a3b8',
            Trapper: '#f87171',
            Broker: '#22c55e',
            Gambler: '#f472b6',
            Sniper: '#f43f5e',
            Alchemist: '#4ade80',
            Guardian: '#38bdf8',
            GravityMage: '#c084fc',
            Duelist: '#facc15'
        };
        return colors[className] || '#facc15';
    }

    getOpponent(game) {
        if (!game) return null;
        return this.tag === 'p1' ? game.player2 : game.player1;
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    clampToArena(game, x) {
        const worldW = game && game.width ? game.width : 1200;
        return Math.max(0, Math.min(worldW - this.width, x));
    }

    addUltimateProjectile(game, options) {
        const p = new Projectile(
            options.x,
            options.y,
            options.vx || 0,
            options.vy || 0,
            options.owner || (options.damage > 0 ? this.tag : 'effect'),
            options.color,
            (options.damage || 0) * (options.scaleDamage === false ? 1 : this.damageMultiplier),
            options.type
        );
        p.width = options.width || p.width;
        p.height = options.height || p.height;
        p.duration = options.duration || p.duration;
        if (options.knockback) p.knockback = options.knockback;
        if (options.onHit) p.onHit = options.onHit;
        if (options.onEnd) p.onEnd = options.onEnd;
        game.addProjectile(p);
        return p;
    }

    addUltimateArea(game, x, y, width, height, color, damage, type, duration = 18, knockback = 0) {
        return this.addUltimateProjectile(game, {
            x,
            y,
            vx: 0,
            vy: 0,
            color,
            damage,
            type,
            width,
            height,
            duration,
            knockback
        });
    }

    fireRadialUltimate(game, count, speed, damage, color, type, size = 24, duration = 40, angleOffset = 0) {
        const center = this.getCenter();
        for (let i = 0; i < count; i++) {
            const angle = angleOffset + (Math.PI * 2 * i) / count;
            this.addUltimateProjectile(game, {
                x: center.x - size / 2,
                y: center.y - size / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                damage,
                type,
                width: size,
                height: size,
                duration
            });
        }
    }

    temporaryDamageBoost(amount, ms) {
        this.damageMultiplier += amount;
        window.setTimeout(() => {
            this.damageMultiplier = Math.max(0.1, this.damageMultiplier - amount);
        }, ms);
    }

    temporaryUltimateReduction(amount, ms) {
        this.ultimateDamageReduction = Math.max(this.ultimateDamageReduction, amount);
        window.setTimeout(() => {
            if (this.ultimateDamageReduction <= amount) {
                this.ultimateDamageReduction = 0;
            }
        }, ms);
    }

    arcaneBurstUltimate(game) {
        this.fireRadialUltimate(game, 12, 10, 18, '#facc15', 'ultimate_burst');
        const center = this.getCenter();
        this.addUltimateArea(game, center.x - 100, center.y - 100, 200, 200, 'rgba(250, 204, 21, 0.35)', 28, 'ultimate_shockwave', 12);
    }

    priestUltimate(game) {
        const center = this.getCenter();
        this.heal(55);
        this.manaLockTimer = 0;
        this.invertedControlsTimer = 0;
        this.temporaryUltimateReduction(0.25, 4500);
        this.gainMana(35);
        this.addUltimateArea(game, center.x - 145, center.y - 145, 290, 290, 'rgba(253, 230, 138, 0.45)', 24, 'divine_sanctuary', 20);
        this.fireRadialUltimate(game, 10, 8, 12, '#fde68a', 'holy_beam', 18, 45);
    }

    devilUltimate(game) {
        if (this.health > 18) this.health -= 12;
        this.temporaryDamageBoost(0.45, 6000);
        const dir = this.facingDirection;
        for (let i = 0; i < 3; i++) {
            this.addUltimateProjectile(game, {
                x: this.x + (dir === 1 ? this.width + i * 24 : -100 - i * 24),
                y: this.y + 20 + i * 28,
                vx: dir * (8 + i * 2),
                vy: 0,
                color: 'rgba(239, 68, 68, 0.75)',
                damage: 18,
                type: 'hell_claw',
                width: 90,
                height: 30,
                duration: 28,
                knockback: dir * 24
            });
        }
        this.fireRadialUltimate(game, 8, 7, 14, '#7f1d1d', 'hellfire', 26, 38);
    }

    fighterUltimate(game) {
        const dir = this.facingDirection;
        for (let i = 0; i < 12; i++) {
            window.setTimeout(() => {
                if (this.health <= 0 || !game.running) return;
                const lane = (i % 3) - 1;
                this.addUltimateProjectile(game, {
                    x: this.x + (dir === 1 ? this.width : -16),
                    y: this.y + 42 + lane * 22,
                    vx: dir * 24,
                    vy: lane * 0.7,
                    color: i % 3 === 0 ? '#facc15' : '#fb923c',
                    damage: 11,
                    type: 'full_auto',
                    width: 18,
                    height: 8,
                    duration: 44
                });
            }, i * 55);
        }
    }

    mageUltimate(game) {
        const center = this.getCenter();
        this.addUltimateArea(game, center.x - 220, center.y - 220, 440, 440, 'rgba(168, 85, 247, 0.35)', 38, 'elemental_cataclysm', 22);
        this.fireRadialUltimate(game, 16, 9, 14, '#38bdf8', 'elemental_shard', 22, 48, Math.PI / 16);
        this.fireRadialUltimate(game, 8, 6, 18, '#c084fc', 'arcane_orb', 34, 52);
    }

    barbarianUltimate(game) {
        this.heal(25);
        this.temporaryUltimateReduction(0.45, 6500);
        const dirOptions = [-1, 1];
        dirOptions.forEach(dir => {
            this.addUltimateProjectile(game, {
                x: this.x + this.width / 2 - 90,
                y: (game.floorY || 700) - 72,
                vx: dir * 13,
                vy: 0,
                color: 'rgba(251, 146, 60, 0.72)',
                damage: 34,
                type: 'earthbreaker',
                width: 180,
                height: 70,
                duration: 42,
                knockback: dir * 70
            });
        });
    }

    spearmanUltimate(game) {
        if (this.disarmed) this.disarmed = false;
        const dir = this.facingDirection;
        [-2, -1, 0, 1, 2].forEach((lane, index) => {
            this.addUltimateProjectile(game, {
                x: this.x + (dir === 1 ? this.width : -110),
                y: this.y + 28 + lane * 18,
                vx: dir * (18 + index),
                vy: lane * 0.65,
                color: '#facc15',
                damage: lane === 0 ? 32 : 24,
                type: 'phalanx_spear',
                width: 110,
                height: 12,
                duration: 42,
                knockback: dir * 44
            });
        });
    }

    necromancerUltimate(game) {
        if (typeof Minion !== 'undefined' && game.minions) {
            for (let i = 0; i < 3; i++) {
                game.minions.push(new Minion(this.x + (i - 1) * 42, this.y, this.tag, 'skeleton'));
            }
            game.minions.push(new Minion(this.x + this.facingDirection * 80, this.y - 120, this.tag, 'dragon'));
        }
        const target = this.getOpponent(game);
        const x = target ? target.x + target.width / 2 - 130 : this.x - 90;
        const y = target ? target.y + target.height / 2 - 130 : this.y - 60;
        this.addUltimateArea(game, x, y, 260, 260, 'rgba(132, 204, 22, 0.32)', 28, 'grave_legion', 24);
    }

    assassinUltimate(game) {
        const target = this.getOpponent(game);
        this.immune = true;
        this.stealthTimer = Math.max(this.stealthTimer || 0, 1.6);
        if (target) {
            const side = target.x > this.x ? -1 : 1;
            this.x = this.clampToArena(game, target.x + side * (target.width + 26));
            this.y = Math.max(0, target.y);
            this.facingDirection = side === -1 ? 1 : -1;
        }
        const dir = this.facingDirection;
        this.addUltimateArea(game, this.x + (dir === 1 ? this.width : -100), this.y + 18, 100, 112, 'rgba(15, 23, 42, 0.85)', 48, 'death_mark', 12, dir * 58);
        this.addUltimateArea(game, this.x - 35, this.y - 20, this.width + 70, this.height + 40, 'rgba(148, 163, 184, 0.28)', 0, 'smoke_bomb', 22);
    }

    trapperUltimate(game) {
        const target = this.getOpponent(game);
        const targetX = target ? target.x : this.x;
        for (let i = 0; i < 5; i++) {
            this.addUltimateProjectile(game, {
                x: targetX - 150 + Math.random() * 300,
                y: this.y - 100 - i * 40,
                vx: 0,
                vy: 5, // Falls down
                color: '#ef4444',
                damage: 28,
                type: 'minefield_blast',
                width: 40,
                height: 40,
                duration: 600, // 10 seconds
                onHit: hitTarget => {
                    hitTarget.vy = -12; // Snap trap
                    hitTarget.speed = 1; // Slow down
                    window.setTimeout(() => hitTarget.speed += 4, 2000);
                }
            });
        }
    }

    brokerUltimate(game) {
        if (game.showAnnouncement) game.showAnnouncement('Market Manipulation!', '#22c55e');
        const target = this.getOpponent(game);
        const dir = this.facingDirection;
        this.addUltimateProjectile(game, {
            x: this.x + (dir === 1 ? this.width : -60),
            y: this.y + 40,
            vx: dir * 18,
            vy: 0,
            color: '#22c55e',
            damage: 25,
            type: 'broker_syringe',
            width: 60,
            height: 20,
            duration: 80,
            onHit: hitTarget => {
                hitTarget.invertedControlsTimer = Infinity; // Permanent
                if (game.showAnnouncement && hitTarget.tag === (target ? target.tag : null)) {
                    game.showAnnouncement('Controls Inverted Permanently!', '#ef4444');
                }
            }
        });
        
        // Also drop some market crash coins
        const centerX = target ? target.x + target.width / 2 : this.x + this.width / 2;
        for (let i = 0; i < 6; i++) {
            this.addUltimateProjectile(game, {
                x: centerX - 120 + Math.random() * 240,
                y: -40 - i * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: 10 + Math.random() * 4,
                color: '#facc15',
                damage: 15,
                type: 'market_crash',
                width: 24,
                height: 24,
                duration: 90
            });
        }
    }

    gamblerUltimate(game) {
        if (game.showAnnouncement) game.showAnnouncement('Spinning the Wheel...', '#fbbf24');
        const wheelCenter = this.getCenter();
        const isJackpot = Math.random() < 1 / 3;

        this.addUltimateProjectile(game, {
            x: wheelCenter.x - 100,
            y: wheelCenter.y - 150,
            vx: 0,
            vy: 0,
            color: '#ffffff',
            damage: 0,
            type: 'roulette_wheel',
            width: 200,
            height: 200,
            duration: 90, // 1.5 seconds spin
            onEnd: () => {
                if (isJackpot) {
                    this.health = this.maxHealth;
                    this.mana = this.maxMana;
                    this.infiniteManaTimer = 30;
                    this.ultimateImmunityTimer = 30;
                    this.gamblerJackpotTimer = 30;
                    if (game.showAnnouncement) game.showAnnouncement('RED! 30s God Mode', '#ef4444');
                    this.addUltimateArea(game, this.x - 80, this.y - 80, this.width + 160, this.height + 160, 'rgba(239, 68, 68, 0.48)', 34, 'gambler_true_jackpot', 26);
                    this.fireRadialUltimate(game, 16, 9, 16, '#ef4444', 'jackpot_star', 24, 55, Math.random() * Math.PI);
                } else {
                    if (game.showAnnouncement) game.showAnnouncement('Black. Missed...', '#111827');
                    this.heal(20 + Math.random() * 25);
                    this.gainMana(this.maxMana);
                    const colors = ['#f472b6', '#facc15', '#38bdf8', '#a78bfa'];
                    for (let i = 0; i < 3; i++) {
                        this.fireRadialUltimate(game, 8, 6 + i * 2, 10 + i * 4, colors[i], 'jackpot_star', 18 + i * 6, 42 + i * 8, Math.random() * Math.PI);
                    }
                    if (Math.random() < 0.5) this.gainUltimateCharge(35);
                }
            }
        });
    }

    sniperUltimate(game) {
        const target = this.getOpponent(game);
        const beamY = target ? target.y + target.height / 2 - 5 : this.y + 35;
        this.addUltimateProjectile(game, {
            x: 0,
            y: beamY,
            vx: 0,
            vy: 0,
            color: 'rgba(244, 63, 94, 0.82)',
            damage: 60,
            type: 'deadeye_beam',
            width: game.width,
            height: 10,
            duration: 9,
            onHit: hitTarget => {
                hitTarget.vy = -16;
                hitTarget.manaLockTimer = Math.max(hitTarget.manaLockTimer || 0, 1.5);
                hitTarget.ultimateCharge = Math.max(0, hitTarget.ultimateCharge - 25);
                if (hitTarget.ultimateCharge < (hitTarget.ultimateRequirement || 100)) hitTarget.ultimateReady = false;
            }
        });
    }

    alchemistUltimate(game) {
        const target = this.getOpponent(game);
        const cloudX = target ? target.x + target.width / 2 - 135 : this.x - 90;
        const cloudY = target ? target.y + target.height / 2 - 85 : this.y;
        this.addUltimateProjectile(game, {
            x: cloudX,
            y: cloudY,
            vx: 0,
            vy: 0,
            color: 'rgba(74, 222, 128, 0.65)',
            damage: 0,
            type: 'chemical_flood',
            width: 270,
            height: 170,
            duration: 120, // 2 seconds
            onHit: hitTarget => {
                hitTarget.damageReduction = -0.3; // Take 30% more damage
                window.setTimeout(() => hitTarget.damageReduction += 0.3, 4000);
            }
        });
        if (typeof Turret !== 'undefined' && game.minions && target) {
            game.minions.push(new Turret(Math.max(0, this.x - 60), this.y + this.height - 40, this.tag, target));
            game.minions.push(new Turret(Math.min(game.width - 40, this.x + this.width + 20), this.y + this.height - 40, this.tag, target));
        }
    }

    guardianUltimate(game) {
        this.heal(35);
        this.temporaryUltimateReduction(0.65, 5500);
        const center = this.getCenter();
        this.addUltimateArea(game, center.x - 160, center.y - 160, 320, 320, 'rgba(56, 189, 248, 0.38)', 28, 'aegis_nova', 22, this.facingDirection * 75);
    }

    gravityMageUltimate(game) {
        const target = this.getOpponent(game);
        if (target) {
            target.x += (this.x - target.x) * 0.35;
            target.vy = 14;
        }
        const centerX = target ? target.x + target.width / 2 : this.x + this.width / 2;
        const centerY = target ? target.y + target.height / 2 : this.y + this.height / 2;
        this.addUltimateArea(game, centerX - 165, centerY - 165, 330, 330, 'rgba(126, 34, 206, 0.46)', 36, 'singularity', 28);
        this.fireRadialUltimate(game, 12, 5, 12, '#c084fc', 'gravity_orbit', 20, 60);
    }

    duelistUltimate(game) {
        const gods = ['slifer', 'obelisk', 'ra'];
        const god = gods[Math.floor(Math.random() * gods.length)];
        const godData = {
            slifer: {
                name: 'Slifer the Sky Dragon',
                color: '#ef4444',
                sprite: 'imges/egyptian_god_slifer.png',
                width: 230,
                height: 190
            },
            obelisk: {
                name: 'Obelisk the Tormentor',
                color: '#3b82f6',
                sprite: 'imges/egyptian_god_obelisk.png',
                width: 220,
                height: 220
            },
            ra: {
                name: 'The Winged Dragon of Ra',
                color: '#facc15',
                sprite: 'imges/egyptian_god_ra.png',
                width: 225,
                height: 225
            }
        };
        const data = godData[god];

        if (game.showAnnouncement) {
            game.showAnnouncement(data.name + ' Summoned!', data.color);
        }

        const dir = this.facingDirection;
        const p = new Projectile(
            this.x + this.width / 2 - data.width / 2,
            this.y - data.height * 0.65,
            0, 0,
            'effect',
            data.color,
            0,
            'egyptian_god_summon'
        );
        p.width = data.width;
        p.height = data.height;
        p.lifeRemaining = 13;
        
        p.isMonster = true;
        p.timer = 0;
        p.attackCooldown = 0;
        p.facingDir = dir;
        p.ownerTag = this.tag;
        p.godType = god;
        p.godName = data.name;
        p.raSacrificePower = 0;
        p.damageBoostTimer = 0;
        p.phoenixTimer = 0;
        p.image = new Image();
        p.image.src = data.sprite;
        
        p.spawnSliferLightning = function(gameRef, ownerObj, target, forced = false) {
            if (!target) return;

            const handPower = Math.max(1, ownerObj.hand ? ownerObj.hand.length : 1);
            const boltCount = Math.min(5, forced ? handPower + 1 : handPower);
            const damage = (forced ? 18 : 12) + handPower * 5;
            const centerX = target.x + target.width / 2;

            for (let i = 0; i < boltCount; i++) {
                const offset = (i - (boltCount - 1) / 2) * 44;
                const jitter = (Math.random() - 0.5) * 28;
                const x = centerX + offset + jitter;
                const lightning = new Projectile(x - 18, 0, 0, 0, this.ownerTag, 'rgba(239, 68, 68, 0.7)', damage, 'slifer_lightning_column');
                lightning.width = 36;
                lightning.height = gameRef.floorY || gameRef.height || 800;
                lightning.duration = forced ? 18 : 12;
                lightning.knockback = x < centerX ? 18 : -18;
                lightning.onHit = hitTarget => {
                    if (hitTarget.sliferSlowed) return;
                    hitTarget.sliferSlowed = true;
                    hitTarget.speed = Math.max(2, hitTarget.speed - 1.5);
                    window.setTimeout(() => {
                        hitTarget.speed += 1.5;
                        hitTarget.sliferSlowed = false;
                    }, 1200);
                };
                gameRef.addProjectile(lightning);
            }
        };

        p.performSecondMouth = function(gameRef, ownerObj) {
            const target = this.ownerTag === 'p1' ? gameRef.player2 : gameRef.player1;
            this.attackCooldown = 0;
            this.spawnSliferLightning(gameRef, ownerObj, target, true);
        };

        p.performSoulEnergyMax = function(gameRef) {
            const target = this.ownerTag === 'p1' ? gameRef.player2 : gameRef.player1;
            const centerX = target ? target.x + target.width / 2 : this.x + this.width / 2;
            const centerY = target ? target.y + target.height / 2 : this.y + this.height / 2;

            if (gameRef.minions) {
                gameRef.minions.forEach(minion => {
                    if (minion.owner !== this.ownerTag) minion.active = false;
                });
            }

            if (gameRef.projectiles) {
                gameRef.projectiles.forEach(projectile => {
                    if (projectile.owner !== this.ownerTag && projectile.owner !== 'effect' && projectile !== this) {
                        projectile.active = false;
                    }
                });
            }

            const fist = new Projectile(centerX - 150, centerY - 150, 0, 0, this.ownerTag, 'rgba(37, 99, 235, 0.65)', 95, 'obelisk_fist_of_fate');
            fist.width = 300;
            fist.height = 300;
            fist.duration = 24;
            fist.knockback = centerX < this.x ? -135 : 135;
            gameRef.addProjectile(fist);

            const quake = new Projectile(0, (gameRef.floorY || 700) - 88, 0, 0, this.ownerTag, 'rgba(59, 130, 246, 0.34)', 34, 'obelisk_ground_shatter');
            quake.width = gameRef.width || 1280;
            quake.height = 88;
            quake.duration = 30;
            gameRef.addProjectile(quake);
        };

        p.performPhoenixBurn = function(gameRef, sacrifice) {
            const target = this.ownerTag === 'p1' ? gameRef.player2 : gameRef.player1;
            const center = target ? target.getCenter() : { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            const damage = 30 + sacrifice * 0.45;
            const phoenix = new Projectile(center.x - 130, center.y - 130, 0, 0, this.ownerTag, 'rgba(250, 204, 21, 0.62)', damage, 'ra_phoenix_mode');
            phoenix.width = 260;
            phoenix.height = 260;
            phoenix.duration = 28;
            phoenix.knockback = center.x < this.x ? -55 : 55;
            gameRef.addProjectile(phoenix);
            this.phoenixTimer = 3.5;
        };

        this.activeGodSummon = p;
        
        p.update = function(dt, gameRef) {
            this.timer += dt;
            this.lifeRemaining -= dt;

            const ownerObj = this.ownerTag === 'p1' ? gameRef.player1 : gameRef.player2;
            const target = this.ownerTag === 'p1' ? gameRef.player2 : gameRef.player1;

            if (this.lifeRemaining <= 0 || !ownerObj || !target) {
                this.active = false;
                if (ownerObj && ownerObj.activeGodSummon === this) ownerObj.activeGodSummon = null;
                return;
            }
            
            if (this.godType === 'slifer') {
                const desiredX = ownerObj.x + ownerObj.width / 2 - this.width / 2 - ownerObj.facingDirection * 80;
                const desiredY = 72 + Math.sin(this.timer * 2.4) * 10;
                this.x += (desiredX - this.x) * 0.08;
                this.y += (desiredY - this.y) * 0.08;
                
                this.attackCooldown -= dt;
                if (this.attackCooldown <= 0) {
                    this.spawnSliferLightning(gameRef, ownerObj, target);
                    this.attackCooldown = 0.78;
                }
            } else if (this.godType === 'obelisk') {
                const desiredY = (gameRef.floorY || 700) - this.height + 10;
                const targetCenter = target.x + target.width / 2;
                const selfCenter = this.x + this.width / 2;
                const dist = targetCenter - selfCenter;
                this.y += (desiredY - this.y) * 0.12;
                this.x += Math.sign(dist) * Math.min(3.2, Math.abs(dist) * 0.02);
                this.facingDir = dist >= 0 ? 1 : -1;
                
                if (this.damageBoostTimer > 0) this.damageBoostTimer -= dt;
                if (gameRef.projectiles) {
                    gameRef.projectiles.forEach(projectile => {
                        if (!projectile.active || projectile === this) return;
                        if (projectile.owner === this.ownerTag || projectile.owner === 'effect') return;
                        const dx = projectile.x + projectile.width / 2 - (this.x + this.width / 2);
                        const dy = projectile.y + projectile.height / 2 - (this.y + this.height / 2);
                        if (Math.sqrt(dx * dx + dy * dy) < 185) projectile.active = false;
                    });
                }

                this.attackCooldown -= dt;
                if (this.attackCooldown <= 0 && Math.abs(dist) < 235) {
                    const isBoosted = this.damageBoostTimer > 0;
                    const damage = isBoosted ? 105 : 48;
                    const knockbackAmount = isBoosted ? 120 : 58;
                    
                    const punch = new Projectile(this.x + this.width / 2 + Math.sign(dist) * 60, this.y + 88, Math.sign(dist) * 9, 0, this.ownerTag, '#3b82f6', damage, 'obelisk_stone_burst');
                    punch.width = isBoosted ? 128 : 86; 
                    punch.height = isBoosted ? 128 : 86; 
                    punch.duration = 20;
                    punch.knockback = Math.sign(dist) * knockbackAmount;
                    gameRef.addProjectile(punch);

                    const quake = new Projectile(Math.min(this.x, target.x) - 20, (gameRef.floorY || 700) - 56, 0, 0, this.ownerTag, 'rgba(59, 130, 246, 0.32)', isBoosted ? 28 : 14, 'obelisk_ground_shatter');
                    quake.width = Math.abs(dist) + 120;
                    quake.height = 56;
                    quake.duration = 18;
                    gameRef.addProjectile(quake);
                    this.attackCooldown = isBoosted ? 0.75 : 1.05;
                }
            } else if (this.godType === 'ra') {
                const desiredX = (gameRef.width || 1280) / 2 - this.width / 2 + Math.sin(this.timer * 1.6) * 70;
                const desiredY = 108 + Math.cos(this.timer * 1.9) * 18;
                this.x += (desiredX - this.x) * 0.055;
                this.y += (desiredY - this.y) * 0.055;
                if (this.phoenixTimer > 0) this.phoenixTimer -= dt;
                
                this.attackCooldown -= dt;
                if (this.attackCooldown <= 0) {
                    const addedPower = this.raSacrificePower || 0;
                    const phoenixBoost = this.phoenixTimer > 0 ? 18 : 0;
                    const damage = 26 + addedPower * 0.45 + phoenixBoost;
                    const beamWidth = Math.min(130, 46 + addedPower * 0.42 + phoenixBoost);
                    const beamSpeed = Math.min(25, 15 + addedPower * 0.06);
                    const dir = this.facingDir || ownerObj.facingDirection || 1;

                    const beam = new Projectile(this.x + this.width / 2, this.y + this.height / 2, dir * beamSpeed, 0, this.ownerTag, '#facc15', damage, 'ra_solar_sphere');
                    beam.width = beamWidth; beam.height = beamWidth; beam.duration = 80;
                    beam.onHit = hitTarget => {
                        hitTarget.vy -= 8;
                        const extraDamage = gameRef.scaleDamageForSpeed ? gameRef.scaleDamageForSpeed(8 + addedPower * 0.12, this.ownerTag) : 8 + addedPower * 0.12;
                        hitTarget.takeDamage(extraDamage);
                    };
                    gameRef.addProjectile(beam);
                    this.attackCooldown = this.phoenixTimer > 0 ? 0.48 : 0.84;
                }
            }
        };

        p.draw = function(ctx) {
            const pulse = 0.5 + Math.sin(this.timer * 5) * 0.5;
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const radius = Math.max(this.width, this.height) * (0.55 + pulse * 0.05);

            ctx.save();
            ctx.globalAlpha = 0.22 + pulse * 0.12;
            ctx.fillStyle = this.godType === 'slifer' ? 'rgba(239, 68, 68, 0.75)' : (this.godType === 'obelisk' ? 'rgba(59, 130, 246, 0.75)' : 'rgba(250, 204, 21, 0.78)');
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.72;
            ctx.strokeStyle = this.godType === 'ra' ? '#fde047' : '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(cx, cy, radius * 1.1, radius * 0.42, this.timer * 0.9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            const bob = Math.sin(this.timer * 2.2) * 5;
            const flip = this.facingDir === -1;
            if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
                if (flip) {
                    ctx.translate(this.x + this.width, this.y + bob);
                    ctx.scale(-1, 1);
                    ctx.drawImage(this.image, 0, 0, this.width, this.height);
                } else {
                    ctx.drawImage(this.image, this.x, this.y + bob, this.width, this.height);
                }
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y + bob, this.width, this.height);
            }
            ctx.restore();

            if (this.godType === 'obelisk' && this.damageBoostTimer > 0) {
                ctx.save();
                ctx.strokeStyle = '#bfdbfe';
                ctx.lineWidth = 5;
                ctx.strokeRect(this.x - 6, this.y - 6, this.width + 12, this.height + 12);
                ctx.restore();
            }
        };
        
        game.addProjectile(p);
    }

    oldDuelistCardBarrageUltimate(game) {
        if (this.hand && this.drawCard) {
            while (this.hand.length < this.maxHandSize) this.drawCard();
            this.currentCard = this.hand[0] || this.currentCard;
        }
        const target = this.getOpponent(game);
        const targetX = target ? target.x + target.width / 2 : this.x + this.facingDirection * 220;
        for (let i = 0; i < 5; i++) {
            this.addUltimateProjectile(game, {
                x: this.x + this.width / 2,
                y: this.y - 20 + i * 30,
                vx: (targetX > this.x ? 1 : -1) * (9 + i),
                vy: (i - 2) * 0.75,
                color: i % 2 === 0 ? '#facc15' : '#60a5fa',
                damage: 15,
                type: 'card_barrage',
                width: 34,
                height: 46,
                duration: 48
            });
        }
        if (target) {
            this.addUltimateArea(game, target.x - 40, target.y - 40, target.width + 80, target.height + 80, 'rgba(250, 204, 21, 0.32)', 26, 'destiny_draw', 18);
        }
    }

    spendMana(amount) {
        if (this.manaLockTimer > 0) return false;

        if (this.infiniteManaTimer > 0) {
            this.mana = this.maxMana;
            return true;
        }

        if (this.mana >= amount) {
            this.mana -= amount;
            return true;
        }
        return false;
    }

    update(keys, game, dt, platforms) {
        if (this.minimumAbilityCooldowns) {
            this.minimumAbilityCooldowns.ability1 = Math.max(0, this.minimumAbilityCooldowns.ability1 - dt);
            this.minimumAbilityCooldowns.ability2 = Math.max(0, this.minimumAbilityCooldowns.ability2 - dt);
        }

        // Store previous position for collision logic
        const prevY = this.y;

        // Apply Gravity
        this.vy += game && game.gravityMultiplier ? game.gravityMultiplier : 1;

        if (this.invertedControlsTimer > 0) {
            if (this.invertedControlsTimer !== Infinity) {
                this.invertedControlsTimer -= dt;
            }
        }

        // Horizontal Movement
        this.vx = 0;
        let leftKey = keys.left;
        let rightKey = keys.right;
        let jumpKey = keys.jump;
        let downKey = keys.down;
        
        if (this.invertedControlsTimer > 0) {
            leftKey = keys.right;
            rightKey = keys.left;
            jumpKey = keys.down;
            downKey = keys.jump;
        }

        if (leftKey) {
            this.vx = -this.speed;
            this.facingDirection = -1;
        }
        if (rightKey) {
            this.vx = this.speed;
            this.facingDirection = 1;
        }

        // Jump
        if (jumpKey && this.grounded) {
            this.vy = -this.jumpForce;
            this.grounded = false;
            const talentEffects = this.talentEffects || {};
            if (talentEffects.manaOnJump) this.gainMana(talentEffects.manaOnJump);
            if (talentEffects.ultimateOnJump) this.gainUltimateCharge(talentEffects.ultimateOnJump);
        }

        // Apply Velocity
        this.x += this.vx;
        this.y += this.vy;

        this.grounded = false; // Assume falling until collision found

        // Floor Collision
        const floorY = game.floorY || 700; // Fallback
        if (this.y + this.height >= floorY) {
            this.y = floorY - this.height;
            this.vy = 0;
            this.grounded = true;
        }

        // Platform Collision
        // If holding down, skip checking platforms (Drop down mechanic)
        if (platforms && !downKey) {
            platforms.forEach(p => {
                // Horizontal overlap
                if (this.x + this.width > p.x && this.x < p.x + p.w) {

                    // Vertical check: was character's feet above platform in previous frame?
                    const prevFeet = prevY + this.height;
                    if (this.vy >= 0 && prevFeet <= p.y && this.y + this.height >= p.y) {
                        this.y = p.y - this.height;
                        this.vy = 0;
                        this.grounded = true;
                    }
                }
            });
        }

        // Screen Boundaries
        const worldW = game.width || 1200;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > worldW) this.x = worldW - this.width;

        if (this.dodgeTextTimer > 0) {
            this.dodgeTextTimer -= dt;
        }

        if (this.infiniteManaTimer > 0) {
            this.infiniteManaTimer -= dt;
            this.mana = this.maxMana;
            if (this.infiniteManaTimer < 0) this.infiniteManaTimer = 0;
        }

        if (this.ultimateImmunityTimer > 0) {
            this.ultimateImmunityTimer -= dt;
            if (this.ultimateImmunityTimer < 0) this.ultimateImmunityTimer = 0;
        }

        if (this.gamblerJackpotTimer > 0) {
            this.gamblerJackpotTimer -= dt;
            if (this.gamblerJackpotTimer < 0) this.gamblerJackpotTimer = 0;
        }

        if (this.manaLockTimer > 0) {
            this.manaLockTimer -= dt;
            this.mana = 0;
            if (this.manaLockTimer < 0) this.manaLockTimer = 0;
            if (this.manaLockTimer === 0) this.manaLockLabel = null;
        }
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
            ctx.save();
            // Determine final flip based on both movement direction and native sprite orientation
            const needsFlip = this.spriteFlipped ? (this.facingDirection === 1) : (this.facingDirection === -1);

            if (needsFlip) {
                // Flip horizontally
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.image, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // Fallback to rectangle
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.dodgeTextTimer > 0) {
            ctx.fillStyle = '#7dd3fc';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('DODGE', this.x + this.width / 2, this.y - 28);
        }

        if (this.gamblerJackpotTimer > 0) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 15px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`JACKPOT ${Math.ceil(this.gamblerJackpotTimer)}s`, this.x + this.width / 2, this.y - 46);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
            ctx.fillRect(this.x, this.y - 16, (this.gamblerJackpotTimer / 30) * this.width, 5);
        }

        if (this.manaLockTimer > 0) {
            ctx.fillStyle = '#f97316';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.manaLockLabel || 'LOCKED'} ${Math.ceil(this.manaLockTimer)}s`, this.x + this.width / 2, this.y - 62);
        } else if (this.hakowareDebt > 0) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`APR ${Math.floor(this.hakowareDebt)}%`, this.x + this.width / 2, this.y - 62);
        }
    }
}
