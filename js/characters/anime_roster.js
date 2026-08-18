const AnimeCharacterNames = [
    'Gojo',
    'Sukuna',
    'Killua',
    'Knuckle',
    'Sinbad',
    'Aladdin',
    'Alibaba',
    'Mahoraga',
    'Escanor',
    'Saber',
    'Archer',
    'Lancer',
    'Gilgamesh',
    'RiderZero',
    'RiderStayNight',
    'CasterZero',
    'CasterStayNight',
    'AssassinZero',
    'AssassinStayNight',
    'BerserkerZero',
    'BerserkerStayNight',
    'Vader'
];

const AnimeDisplayNames = {
    Gojo: 'Gojo',
    Sukuna: 'Sukuna',
    Killua: 'Killua',
    Knuckle: 'Knuckle',
    Sinbad: 'Sinbad',
    Vader: 'Darth Vader',
    Aladdin: 'Aladdin',
    Alibaba: 'Alibaba',
    Mahoraga: 'Mahoraga',
    Escanor: 'Escanor',
    Saber: 'Artoria Pendragon',
    Archer: 'EMIYA',
    Lancer: 'Cu Chulainn',
    Gilgamesh: 'Gilgamesh',
    RiderZero: 'Iskandar',
    RiderStayNight: 'Medusa',
    CasterZero: 'Gilles de Rais',
    CasterStayNight: 'Medea',
    AssassinZero: 'Hassan of Hundred Faces',
    AssassinStayNight: 'Sasaki Kojiro',
    BerserkerZero: 'Lancelot',
    BerserkerStayNight: 'Heracles'
};

function animeCenter(entity) {
    return {
        x: entity.x + entity.width / 2,
        y: entity.y + entity.height / 2
    };
}

function animeForwardAim(caster, speed, vy = 0) {
    return { vx: caster.facingDirection * speed, vy };
}

function animeProjectile(game, options) {
    const p = new Projectile(
        options.x,
        options.y,
        options.vx || 0,
        options.vy || 0,
        options.owner,
        options.color,
        options.damage || 0,
        options.type
    );
    p.width = options.width || p.width;
    p.height = options.height || p.height;
    p.duration = options.duration || p.duration;
    if (options.knockback) p.knockback = options.knockback;
    if (options.onHit) p.onHit = options.onHit;
    if (options.onEnd) p.onEnd = options.onEnd;
    if (options.update) p.update = options.update;
    if (options.draw) p.draw = options.draw;
    if (options.drawDirection) p.drawDirection = options.drawDirection;
    if (options.homingTarget) p.homingTarget = options.homingTarget;
    if (options.homingSpeed) p.homingSpeed = options.homingSpeed;
    if (options.homingTurnRate) p.homingTurnRate = options.homingTurnRate;
    game.addProjectile(p);
    return p;
}

function animeFrontX(caster, width) {
    return caster.facingDirection === 1 ? caster.x + caster.width : caster.x - width;
}

function animeArea(game, caster, options) {
    return animeProjectile(game, {
        x: options.x,
        y: options.y,
        vx: 0,
        vy: 0,
        owner: options.owner || caster.tag,
        color: options.color,
        damage: (options.damage || 0) * caster.damageMultiplier,
        type: options.type,
        width: options.width,
        height: options.height,
        duration: options.duration || 14,
        knockback: options.knockback,
        onHit: options.onHit,
        drawDirection: options.drawDirection
    });
}

function animeSureHit(game, caster, move) {
    const target = caster.getOpponent(game);
    if (!target) return 0;

    const type = move.type || 'anime_sure_hit';
    const baseDamage = (move.damage || 0) * caster.damageMultiplier;
    const damage = game.scaleDamageForSpeed ? game.scaleDamageForSpeed(baseDamage, caster.tag) : baseDamage;
    const healthBefore = target.health;
    const previousDamageType = target.incomingDamageType;
    const previousDodgeChance = target.dodgeChance;

    target.incomingDamageType = type;
    target.dodgeChance = 0;
    target.takeDamage(damage);
    target.dodgeChance = previousDodgeChance;
    target.incomingDamageType = previousDamageType || null;

    const damageDealt = Math.max(0, healthBefore - target.health);
    if (move.onHit) move.onHit(target, caster, game);
    if (move.knockback) target.x += caster.facingDirection * move.knockback;
    if (caster.onHit) caster.onHit(target, damage);
    if (game.applyTalentOnHit) game.applyTalentOnHit(caster, target, damageDealt);
    return damageDealt;
}

function animeSlash(game, caster, move) {
    const width = move.width || 92;
    const height = move.height || 96;
    return animeArea(game, caster, {
        x: animeFrontX(caster, width),
        y: caster.y + (move.yOffset || 24),
        width,
        height,
        color: move.color,
        damage: move.damage,
        type: move.type || 'anime_slash',
        duration: move.duration || 10,
        knockback: caster.facingDirection * (move.knockback || 32),
        onHit: move.onHit ? target => move.onHit(target, caster, game) : undefined,
        drawDirection: caster.facingDirection
    });
}

function animeShot(game, caster, move) {
    const speed = move.speed || 13;
    const aim = animeForwardAim(caster, speed, move.vy || 0);
    const width = move.width || 34;
    const height = move.height || 24;
    return animeProjectile(game, {
        x: caster.x + caster.width / 2 - width / 2,
        y: caster.y + (move.yOffset || 48),
        vx: aim.vx,
        vy: aim.vy,
        owner: caster.tag,
        color: move.color,
        damage: (move.damage || 0) * caster.damageMultiplier,
        type: move.type || 'anime_bolt',
        width,
        height,
        duration: move.duration || 70,
        knockback: caster.facingDirection * (move.knockback || 0),
        onHit: move.onHit ? target => move.onHit(target, caster, game) : undefined,
        drawDirection: caster.facingDirection
    });
}

function animeField(game, caster, move) {
    const target = caster.getOpponent(game);
    const center = target ? animeCenter(target) : { x: caster.x + caster.facingDirection * 220, y: caster.y + 70 };
    const width = move.width || 220;
    const height = move.height || 180;
    const areaOptions = {
        x: center.x - width / 2,
        y: center.y - height / 2,
        width,
        height,
        color: move.color,
        damage: move.damage,
        type: move.type || 'anime_field',
        duration: move.duration || 24,
        knockback: caster.facingDirection * (move.knockback || 0),
        onHit: move.onHit,
        owner: move.owner
    };

    if ((move.damage || 0) <= 0 && !move.onHit) return animeArea(game, caster, areaOptions);
    return animeDelayedArea(game, caster, areaOptions, move.delay || 1);
}

function animeVolley(game, caster, move) {
    const count = move.count || 5;
    for (let i = 0; i < count; i++) {
        const lane = i - (count - 1) / 2;
        const speed = (move.speed || 12) + i * 0.4;
        const aim = animeForwardAim(caster, speed, (move.vy || 0) + lane * 0.85);
        animeProjectile(game, {
            x: caster.x + caster.width / 2 - (move.width || 26) / 2,
            y: caster.y + (move.yOffset || 50) + lane * 18,
            vx: aim.vx,
            vy: aim.vy + lane * (move.spread || 0.55),
            owner: caster.tag,
            color: move.color,
            damage: (move.damage || 8) * caster.damageMultiplier,
            type: move.type || 'anime_bolt',
            width: move.width || 26,
            height: move.height || 18,
            duration: move.duration || 72,
            knockback: caster.facingDirection * (move.knockback || 0),
            onHit: move.onHit
        });
    }
}

function animeDelayedArea(game, caster, options, delaySeconds = 1) {
    const warning = animeProjectile(game, {
        x: options.x,
        y: options.y,
        vx: 0,
        vy: 0,
        owner: 'effect',
        color: options.warningColor || 'rgba(255, 255, 255, 0.22)',
        damage: 0,
        type: options.warningType || 'delayed_strike_warning',
        width: options.width,
        height: options.height,
        duration: Math.max(12, Math.round(delaySeconds * 60))
    });
    warning.drawDirection = options.drawDirection;

    window.setTimeout(() => {
        if (!game.running || caster.health <= 0) return;
        animeArea(game, caster, options);
    }, delaySeconds * 1000);

    return warning;
}

function animeCastMove(caster, game, move) {
    if (!move) return;
    if (move.kind === 'slash') animeSlash(game, caster, move);
    else if (move.kind === 'shot') animeShot(game, caster, move);
    else if (move.kind === 'field') animeField(game, caster, move);
    else if (move.kind === 'volley') animeVolley(game, caster, move);
    else if (move.kind === 'surround') animeSurroundingSwords(game, caster, move);
    else if (move.kind === 'dash') {
        caster.x = caster.clampToArena(game, caster.x + caster.facingDirection * (move.distance || 130));
        animeSlash(game, caster, move);
    } else if (move.kind === 'radial') {
        caster.fireRadialUltimate(game, move.count || 12, move.speed || 8, move.damage || 12, move.color, move.type || 'anime_bolt', move.size || 28, move.duration || 50);
    } else if (move.kind === 'beam') {
        const beamWidth = move.width || game.width;
        const beamX = caster.facingDirection === 1
            ? caster.x + caster.width
            : Math.max(-190, caster.x - beamWidth);
        const visibleBeamWidth = caster.facingDirection === 1
            ? beamWidth
            : Math.max(24, caster.x - beamX);

        animeArea(game, caster, {
            x: beamX,
            y: caster.y + (move.yOffset || 56),
            width: visibleBeamWidth,
            height: move.height || 36,
            color: move.color,
            damage: move.damage,
            type: move.type || 'anime_beam',
            duration: move.duration || 16,
            knockback: caster.facingDirection * (move.knockback || 60),
            onHit: move.onHit,
            drawDirection: caster.facingDirection
        });
    } else if (move.kind === 'sure_hit') {
        const target = caster.getOpponent(game);
        animeSureHit(game, caster, move);
        if (!target) return;

        const center = animeCenter(target);
        const width = move.width || 260;
        const height = move.height || 220;
        animeArea(game, caster, {
            x: center.x - width / 2,
            y: center.y - height / 2,
            width,
            height,
            color: move.visualColor || move.color,
            damage: 0,
            type: move.visualType || move.type || 'anime_field',
            duration: move.duration || 18,
            owner: 'effect'
        });
    }
}

function animeSurroundingSwords(game, caster, move) {
    const count = move.count || 20;
    const speed = move.speed || 15;
    const target = caster.tag === 'p1' ? game.player2 : game.player1;
    for (let i = 0; i < count; i++) {
        const lane = i - (count - 1) / 2;
        const delay = i * (move.staggerMs || 28);
        window.setTimeout(() => {
            if (!game.running || caster.health <= 0) return;
            const width = move.width || 46;
            const x = caster.facingDirection === 1 ? caster.x + caster.width : caster.x - width;
            const y = caster.y + 42 + lane * 9;
            const shotSpeed = speed + (i % 4) * 0.8;
            const drift = lane * (move.spread || 0.16);
            animeProjectile(game, {
                x,
                y,
                vx: caster.facingDirection * shotSpeed,
                vy: drift,
                owner: caster.tag,
                color: move.color || '#e5e7eb',
                damage: (move.damage || 18) * caster.damageMultiplier,
                type: move.type || 'blade_volley',
                width,
                height: move.height || 12,
                duration: move.duration || 90,
                knockback: caster.facingDirection * (move.knockback || 12),
                homingTarget: move.homing ? target : null,
                homingSpeed: move.homing ? shotSpeed : null,
                homingTurnRate: move.homingTurnRate || 0.1
            });
        }, delay);
    }
}

class ConfiguredAnimeFighter extends Character {
    constructor(x, y, color, config) {
        super(x, y, color);
        this.config = config;
        this.className = config.className;
        this.maxHealth = config.maxHealth || 100;
        this.health = this.maxHealth;
        this.maxMana = config.maxMana || 120;
        this.mana = config.startMana || Math.floor(this.maxMana * 0.45);
        this.width = config.width || this.width;
        this.height = config.height || this.height;
        this.speed = config.speed || 6;
        this.jumpForce = config.jumpForce || this.jumpForce;
        this.damageMultiplier = config.damageMultiplier || 1;
        this.spriteFlipped = !!config.spriteFlipped;
        this.ability1Cooldown = 0;
        this.ability2Cooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana((this.config.manaRegen || 7) * dt);
        if (this.ability1Cooldown > 0) this.ability1Cooldown -= dt;
        if (this.ability2Cooldown > 0) this.ability2Cooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.ability1Cooldown > 0) return;
        const move = this.config.ability1;
        if (this.spendMana(move.cost || 0)) {
            animeCastMove(this, game, move);
            this.ability1Cooldown = move.cooldown || 0.35;
        }
    }

    ability2(game) {
        if (this.ability2Cooldown > 0) return;
        const move = this.config.ability2;
        if (this.spendMana(move.cost || 0)) {
            animeCastMove(this, game, move);
            this.ability2Cooldown = move.cooldown || 0.65;
        }
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);
        if (game.showAnnouncement) game.showAnnouncement(this.config.ultimateName || this.getUltimateName(this.className), this.config.ultimateColor || this.config.color || '#facc15');
        const ultimate = this.config.ultimate;
        if (ultimate.boostDamage) this.temporaryDamageBoost(ultimate.boostDamage, ultimate.boostMs || 6000);
        if (ultimate.reduction) this.temporaryUltimateReduction(ultimate.reduction, ultimate.boostMs || 6000);
        animeCastMove(this, game, ultimate);
        if (ultimate.extra) ultimate.extra(this, game);
        return true;
    }
}

function defineAnimeClass(config) {
    return class extends ConfiguredAnimeFighter {
        constructor(x, y, color) {
            super(x, y, color, config);
        }
    };
}

class Gojo extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Gojo';
        this.maxHealth = 95;
        this.health = 95;
        this.maxMana = 170;
        this.mana = 85;
        this.speed = 6.2;
        this.spriteFlipped = true;
        this.blueOrb = null;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana(9 * dt);
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (!this.spendMana(30)) return;
        if (this.blueOrb && this.blueOrb.active) this.blueOrb.active = false;
        const orb = animeProjectile(game, {
            x: this.x + this.facingDirection * 170,
            y: this.y + 34,
            owner: 'effect',
            color: 'rgba(59, 130, 246, 0.78)',
            damage: 0,
            type: 'gojo_blue',
            width: 96,
            height: 96,
            duration: 420
        });
        orb.ownerTag = this.tag;
        orb.update = function(dt, gameRef) {
            Projectile.prototype.update.call(this, dt, gameRef);
            [gameRef.player1, gameRef.player2].forEach(player => {
                if (!player || player.tag === this.ownerTag) return;
                const dx = this.x + this.width / 2 - (player.x + player.width / 2);
                const dy = this.y + this.height / 2 - (player.y + player.height / 2);
                const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                if (dist < 360) {
                    player.x += dx / dist * 4.2;
                    player.y += dy / dist * 1.5;
                    player.vy -= 0.25;
                }
            });
        };
        this.blueOrb = orb;
    }

    ability2(game) {
        if (!this.spendMana(35)) return;
        const red = animeShot(game, this, {
            color: '#ef4444',
            damage: 24,
            type: 'gojo_red',
            width: 54,
            height: 54,
            speed: 15,
            duration: 70,
            knockback: 72
        });
        red.ownerCaster = this;
        red.update = function(dt, gameRef) {
            Projectile.prototype.update.call(this, dt, gameRef);
            const blue = this.ownerCaster.blueOrb;
            if (!blue || !blue.active) return;
            if (this.x < blue.x + blue.width && this.x + this.width > blue.x && this.y < blue.y + blue.height && this.y + this.height > blue.y) {
                this.active = false;
                blue.active = false;
                this.ownerCaster.spawnPurple(gameRef, blue.x + blue.width / 2, blue.y + blue.height / 2);
            }
        };
    }

    spawnPurple(game, x, y) {
        animeArea(game, this, {
            x: x - 190,
            y: y - 190,
            width: 380,
            height: 380,
            color: 'rgba(168, 85, 247, 0.62)',
            damage: 58,
            type: 'gojo_purple',
            duration: 32,
            knockback: this.facingDirection * 118,
            onHit: target => {
                target.vy = -18;
            }
        });
        this.fireRadialUltimate(game, 14, 8, 12, '#c084fc', 'gojo_purple', 26, 42);
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        if (game.showAnnouncement) game.showAnnouncement('Unlimited Void', '#a78bfa');
        const voidHit = {
            damage: 42,
            type: 'unlimited_void',
            onHit: target => {
                target.manaLockTimer = Math.max(target.manaLockTimer || 0, 2.5);
                const oldSpeed = target.speed;
                target.speed = Math.min(target.speed, 1);
                window.setTimeout(() => {
                    if (target.speed <= 1.1) target.speed = oldSpeed;
                }, 2500);
            }
        };
        animeSureHit(game, this, voidHit);
        animeField(game, this, {
            width: 520,
            height: 420,
            color: 'rgba(147, 197, 253, 0.45)',
            damage: 0,
            type: 'unlimited_void',
            duration: 44,
            owner: 'effect'
        });
        return true;
    }
}

class Sukuna extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Sukuna';
        this.maxHealth = 115;
        this.health = 115;
        this.maxMana = 135;
        this.mana = 60;
        this.speed = 5.7;
        this.spriteFlipped = true;
        this.fugaChargeTimer = 0;
        this.cleaveCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana(7 * dt);
        if (this.cleaveCooldown > 0) this.cleaveCooldown -= dt;
        if (this.fugaChargeTimer > 0) {
            this.fugaChargeTimer -= dt;
            if (this.fugaChargeTimer <= 0) this.fireFuga(game);
        }
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.cleaveCooldown > 0) return;
        this.cleaveCooldown = 0.55;
        this.spawnCleaveFlurry(game);
        this.gainMana(4);
    }

    spawnCleaveFlurry(game) {
        const cuts = [
            { y: 18, x: 0, width: 142, height: 28, delay: 0 },
            { y: 46, x: 12, width: 158, height: 30, delay: 35 },
            { y: 74, x: -4, width: 148, height: 28, delay: 70 },
            { y: 102, x: 18, width: 132, height: 26, delay: 105 }
        ];

        cuts.forEach((cut, index) => {
            window.setTimeout(() => {
                if (!game.running || this.health <= 0) return;
                const x = animeFrontX(this, cut.width) + this.facingDirection * cut.x;
                animeArea(game, this, {
                    x,
                    y: this.y + cut.y,
                    width: cut.width,
                    height: cut.height,
                    color: index % 2 === 0 ? 'rgba(248, 113, 113, 0.72)' : 'rgba(254, 202, 202, 0.66)',
                    damage: 6,
                    type: 'sukuna_slash',
                    duration: 9,
                    knockback: this.facingDirection * 9,
                    drawDirection: this.facingDirection
                });
            }, cut.delay);
        });
    }

    ability2(game) {
        if (this.fugaChargeTimer > 0) return;
        if (!this.spendMana(45)) return;
        this.fugaChargeTimer = 1;
        if (game.showAnnouncement) game.showAnnouncement('Fuga charging...', '#f97316');
    }

    fireFuga(game) {
        animeShot(game, this, {
            color: '#fb923c',
            damage: 48,
            type: 'fuga_arrow',
            width: 88,
            height: 28,
            speed: 18,
            duration: 75,
            knockback: 95
        });
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        if (game.showAnnouncement) game.showAnnouncement('Malevolent Shrine', '#ef4444');
        const target = this.getOpponent(game);
        const cx = target ? target.x + target.width / 2 : this.x + this.facingDirection * 250;
        for (let i = 0; i < 14; i++) {
            window.setTimeout(() => {
                if (!game.running) return;
                const liveTarget = this.getOpponent(game);
                const hitCenter = liveTarget ? animeCenter(liveTarget) : { x: cx, y: this.y + 70 };
                animeSureHit(game, this, {
                    damage: 8,
                    type: 'shrine_cut',
                    knockback: 12 * (Math.random() > 0.5 ? 1 : -1)
                });
                animeArea(game, this, {
                    x: hitCenter.x - 80 + (Math.random() - 0.5) * 120,
                    y: hitCenter.y - 12 + (Math.random() - 0.5) * 90,
                    width: 160,
                    height: 24,
                    color: 'rgba(239, 68, 68, 0.62)',
                    damage: 0,
                    type: 'shrine_cut',
                    duration: 12,
                    knockback: (Math.random() > 0.5 ? 1 : -1) * 45,
                    owner: 'effect'
                });
            }, i * 75);
        }
        animeSureHit(game, this, {
            damage: 20,
            type: 'malevolent_shrine'
        });
        animeField(game, this, {
            width: 620,
            height: 450,
            color: 'rgba(127, 29, 29, 0.22)',
            damage: 0,
            type: 'malevolent_shrine',
            duration: 34,
            owner: 'effect'
        });
        return true;
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.fugaChargeTimer > 0) {
            ctx.fillStyle = '#fb923c';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('FUGA', this.x + this.width / 2, this.y - 35);
        }
    }
}

class Killua extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Killua';
        this.maxHealth = 90;
        this.health = 90;
        this.maxMana = 130;
        this.mana = 70;
        this.speed = 7.1;
        this.baseSpeed = this.speed;
        this.godspeedActive = false;
        this.godspeedDamageApplied = false;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        this.speed = this.godspeedActive ? this.baseSpeed + 3.4 : this.baseSpeed;
        if (this.godspeedActive && !this.godspeedDamageApplied) {
            this.damageMultiplier += 0.35;
            this.godspeedDamageApplied = true;
        } else if (!this.godspeedActive && this.godspeedDamageApplied) {
            this.damageMultiplier = Math.max(0.1, this.damageMultiplier - 0.35);
            this.godspeedDamageApplied = false;
        }
        super.update(keys, game, dt, platforms);
        if (this.godspeedActive) {
            this.mana = Math.max(0, this.mana - 16 * dt);
            this.dodgeChance = Math.max(this.dodgeChance, 0.22);
            if (this.mana <= 0) {
                this.godspeedActive = false;
                this.dodgeChance = 0;
                if (this.godspeedDamageApplied) {
                    this.damageMultiplier = Math.max(0.1, this.damageMultiplier - 0.35);
                    this.godspeedDamageApplied = false;
                }
            }
        } else {
            this.gainMana(9 * dt);
        }
        if (!this.godspeedActive && this.dodgeChance > 0) {
            this.dodgeChance = 0;
        }
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (!this.spendMana(18)) return;
        animeShot(game, this, {
            color: '#7dd3fc',
            damage: 22,
            type: 'killua_lightning',
            width: 42,
            height: 18,
            speed: 17,
            duration: 60,
            knockback: 26,
            aim: true,
            onHit: target => {
                target.vy -= 7;
            }
        });
    }

    ability2(game) {
        if (!this.spendMana(26)) return;
        [-1, 1].forEach(lane => {
            const yoyo = animeShot(game, this, {
                color: '#e5e7eb',
                damage: 16,
                type: 'killua_yoyo',
                width: 34,
                height: 34,
                speed: 12,
                duration: 54,
                vy: lane * 3,
                knockback: 52
            });
            yoyo.caster = this;
            yoyo.returning = false;
            yoyo.update = function(dt, gameRef) {
                this.timer += dt || 0.016;
                if (!this.returning && this.timer > 0.45) this.returning = true;
                if (this.returning && this.caster) {
                    const center = this.caster.getCenter();
                    const dx = center.x - (this.x + this.width / 2);
                    const dy = center.y - (this.y + this.height / 2);
                    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    this.vx = (dx / dist) * 16;
                    this.vy = (dy / dist) * 16;
                    if (dist < 28) {
                        this.active = false;
                        return;
                    }
                }
                Projectile.prototype.update.call(this, dt, gameRef);
            };
        });
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);
        this.godspeedActive = true;
        if (game.showAnnouncement) game.showAnnouncement('Godspeed', '#7dd3fc');
        this.fireRadialUltimate(game, 12, 8, 9, '#bae6fd', 'killua_lightning', 18, 36);
        return true;
    }
}

class Knuckle extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Knuckle';
        this.maxHealth = 115;
        this.health = 115;
        this.maxMana = 120;
        this.mana = 70;
        this.speed = 5.8;
        this.hakowareTarget = null;
        this.hakowareMarker = null;
        this.hakowareRate = 3.2;
        this.hakowareSuperTimer = 0;
        this.strikeCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana(7 * dt);
        if (this.hakowareSuperTimer > 0) this.hakowareSuperTimer -= dt;
        if (this.strikeCooldown > 0) this.strikeCooldown -= dt;
        const target = this.hakowareTarget;
        if (target && target.health <= 0 && this.hakowareMarker) this.hakowareMarker.active = false;
        if (this.hakowareMarker && this.hakowareMarker.active && target && target.health > 0) {
            this.hakowareMarker.x = target.x + target.width / 2 - this.hakowareMarker.width / 2;
            this.hakowareMarker.y = target.y - this.hakowareMarker.height - 8;
        }
        if (target && target.health > 0 && target.manaLockTimer <= 0) {
            const rate = this.hakowareRate * (this.hakowareSuperTimer > 0 ? 2 : 1);
            target.hakowareDebt = Math.min(100, (target.hakowareDebt || 0) + rate * dt);
            if (target.hakowareDebt >= 100) {
                target.hakowareDebt = 0;
                target.manaLockTimer = 8;
                target.manaLockLabel = 'BANKRUPT';
                this.hakowareTarget = null;
                if (this.hakowareMarker) this.hakowareMarker.active = false;
                animeProjectile(game, {
                    x: target.x - 36,
                    y: target.y - 58,
                    vx: 0,
                    vy: 0,
                    owner: 'effect',
                    color: '#facc15',
                    damage: 0,
                    type: 'hakoware_bankruptcy',
                    width: target.width + 72,
                    height: target.height + 72,
                    duration: 90
                });
                if (game.showAnnouncement) game.showAnnouncement('Hakoware Bankruptcy!', '#facc15');
            }
        }
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.strikeCooldown > 0) return;
        this.strikeCooldown = 0.55;
        animeSlash(game, this, {
            color: 'rgba(251, 146, 60, 0.7)',
            damage: 26,
            type: 'knuckle_punch',
            width: 98,
            height: 78,
            knockback: 55,
            onHit: target => {
                this.applyHakoware(target, game, 12);
            }
        });
    }

    ability2(game) {
        if (!this.spendMana(38)) return;
        animeShot(game, this, {
            color: '#facc15',
            damage: 8,
            type: 'hakoware_marker',
            width: 44,
            height: 44,
            speed: 11,
            duration: 60,
            aim: true,
            onHit: target => {
                target.gainMana(26);
                this.applyHakoware(target, game, 22);
            }
        });
    }

    applyHakoware(target, game, amount) {
        if (!target) return;
        this.hakowareTarget = target;
        target.hakowareDebt = Math.min(100, (target.hakowareDebt || 0) + amount);
        if (!this.hakowareMarker || !this.hakowareMarker.active) {
            this.hakowareMarker = animeProjectile(game, {
                x: target.x + target.width / 2 - 18,
                y: target.y - 44,
                vx: 0,
                vy: 0,
                owner: 'effect',
                color: '#facc15',
                damage: 0,
                type: 'hakoware_marker',
                width: 36,
                height: 36,
                duration: 99999
            });
        }
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.hakowareSuperTimer = 9;
        this.gainMana(this.maxMana);
        if (this.hakowareTarget) this.hakowareTarget.hakowareDebt = Math.min(100, (this.hakowareTarget.hakowareDebt || 0) + 30);
        if (game.showAnnouncement) game.showAnnouncement('Hakoware Interest Spike', '#facc15');
        return true;
    }
}

class Escanor extends ConfiguredAnimeFighter {
    constructor(x, y, color) {
        super(x, y, color, {
            className: 'Escanor',
            maxHealth: 120,
            maxMana: 135,
            startMana: 70,
            width: 92,
            height: 166,
            speed: 5.2,
            manaRegen: 8,
            ability1: { kind: 'slash', cost: 10, color: '#f97316', damage: 28, type: 'sun_slash', width: 120, height: 92, knockback: 48 },
            ability2: { kind: 'shot', cost: 40, color: '#facc15', damage: 40, type: 'cruel_sun', width: 78, height: 78, speed: 10, duration: 70, knockback: 70, aim: true },
            ultimateName: 'The One',
            ultimateColor: '#facc15',
            ultimate: { kind: 'field', color: 'rgba(250, 204, 21, 0.55)', damage: 74, type: 'the_one_sun', width: 430, height: 430, duration: 36, boostDamage: 0.55, reduction: 0.35, boostMs: 9000 }
        });
    }
}

class Sinbad extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Sinbad';
        this.maxHealth = 100;
        this.health = 100;
        this.maxMana = 150;
        this.mana = 75;
        this.speed = 6;
        this.baseSpeed = this.speed;
        this.spriteFlipped = true;
        this.activeDjinn = null;
        this.djinnTimer = 0;
        this.normalSprite = 'imges/baal.png';
        this.ability1Cooldown = 0;
        this.ability2Cooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.djinnForms = [
            {
                name: 'Baal',
                label: 'Baal: Lightning Tyrant',
                sprite: 'imges/baal.png',
                color: '#38bdf8',
                speedBonus: 1,
                damageBoost: 0.22,
                ability1: { kind: 'dash', cost: 12, color: '#38bdf8', damage: 30, type: 'baal_lightning_sword', width: 140, height: 88, distance: 150, knockback: 65 },
                ability2: { kind: 'beam', cost: 34, color: 'rgba(56, 189, 248, 0.7)', damage: 42, type: 'baal_bararaq', width: 900, height: 44, duration: 14, knockback: 90, onHit: target => { target.vy -= 12; } }
            },
            {
                name: 'Valefor',
                label: 'Valefor: Ice Mirage',
                sprite: 'imges/valefor.png',
                color: '#bfdbfe',
                speedBonus: 0.6,
                damageBoost: 0.05,
                ability1: { kind: 'shot', cost: 14, color: '#bfdbfe', damage: 22, type: 'valefor_ice_mirror', width: 52, height: 52, speed: 13, aim: true, knockback: 22, onHit: target => { target.speed = Math.max(2, target.speed - 1.2); window.setTimeout(() => target.speed += 1.2, 1600); } },
                ability2: { kind: 'field', cost: 36, color: 'rgba(191, 219, 254, 0.48)', damage: 30, type: 'valefor_frost_prison', width: 310, height: 240, duration: 34, onHit: target => { target.vy = Math.min(target.vy, -8); } }
            },
            {
                name: 'Focalor',
                label: 'Focalor: Wind Emperor',
                sprite: 'imges/focalor.png',
                color: '#5eead4',
                speedBonus: 1.4,
                damageBoost: 0.12,
                ability1: { kind: 'slash', cost: 10, color: '#5eead4', damage: 24, type: 'focalor_wind_blade', width: 160, height: 70, knockback: 70 },
                ability2: { kind: 'field', cost: 34, color: 'rgba(94, 234, 212, 0.46)', damage: 34, type: 'focalor_tornado', width: 270, height: 340, duration: 38, knockback: 86, onHit: target => { target.vy -= 16; } }
            },
            {
                name: 'Zepar',
                label: 'Zepar: Commanding Voice',
                sprite: 'imges/zepar.png',
                color: '#f472b6',
                speedBonus: 0.3,
                damageBoost: 0,
                ability1: { kind: 'shot', cost: 12, color: '#f472b6', damage: 16, type: 'zepar_command_note', width: 48, height: 36, speed: 14, aim: true, onHit: target => { target.manaLockTimer = Math.max(target.manaLockTimer || 0, 1.1); } },
                ability2: { kind: 'field', cost: 40, color: 'rgba(244, 114, 182, 0.48)', damage: 18, type: 'zepar_domination', width: 340, height: 260, duration: 36, onHit: target => { target.invertedControlsTimer = Math.max(target.invertedControlsTimer || 0, 2.2); } }
            }
        ];
        this.loadSprite();
        this.image.src = this.normalSprite;
    }

    getCurrentKit() {
        if (this.activeDjinn) return this.activeDjinn;
        return {
            color: '#38bdf8',
            ability1: { kind: 'slash', cost: 18, color: '#38bdf8', damage: 24, type: 'sinbad_sword', width: 112, height: 88, knockback: 45 },
            ability2: { kind: 'shot', cost: 42, color: '#a78bfa', damage: 36, type: 'sinbad_djinn_storm', width: 64, height: 64, speed: 12, aim: true, knockback: 50 }
        };
    }

    update(keys, game, dt, platforms) {
        const formSpeed = this.activeDjinn ? this.activeDjinn.speedBonus : 0;
        this.speed = this.baseSpeed + formSpeed;
        super.update(keys, game, dt, platforms);
        this.gainMana((this.activeDjinn ? 13 : 9) * dt);

        if (this.ability1Cooldown > 0) this.ability1Cooldown -= dt;
        if (this.ability2Cooldown > 0) this.ability2Cooldown -= dt;

        if (this.djinnTimer > 0) {
            this.djinnTimer -= dt;
            if (this.djinnTimer <= 0) {
                if (this.activeDjinn) this.damageMultiplier = Math.max(0.1, this.damageMultiplier - (this.activeDjinn.damageBoost || 0));
                this.activeDjinn = null;
                this.djinnTimer = 0;
                this.image.src = this.normalSprite;
            }
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.ability1Cooldown > 0) return;
        const move = this.getCurrentKit().ability1;
        if (this.spendMana(move.cost || 0)) {
            animeCastMove(this, game, move);
            this.ability1Cooldown = this.activeDjinn ? 0.22 : 0.4;
        }
    }

    ability2(game) {
        if (this.ability2Cooldown > 0) return;
        const move = this.getCurrentKit().ability2;
        if (this.spendMana(move.cost || 0)) {
            animeCastMove(this, game, move);
            this.ability2Cooldown = this.activeDjinn ? 0.55 : 0.75;
        }
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);

        if (this.activeDjinn) this.damageMultiplier = Math.max(0.1, this.damageMultiplier - (this.activeDjinn.damageBoost || 0));
        this.activeDjinn = this.djinnForms[Math.floor(Math.random() * this.djinnForms.length)];
        this.djinnTimer = 12;
        this.damageMultiplier += this.activeDjinn.damageBoost || 0;
        if (this.activeDjinn.sprite) this.image.src = this.activeDjinn.sprite;

        if (game.showAnnouncement) game.showAnnouncement(this.activeDjinn.label, this.activeDjinn.color);
        this.fireRadialUltimate(game, 12, 7, 10, this.activeDjinn.color, 'djinn_equip_spark', 24, 36);
        return true;
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.activeDjinn) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = this.activeDjinn.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 62 + Math.sin(this.djinnTimer * 5) * 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = this.activeDjinn.color;
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.activeDjinn.name} ${Math.ceil(this.djinnTimer)}s`, this.x + this.width / 2, this.y - 34);
            ctx.restore();
        }
    }
}

class Mahoraga extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Mahoraga';
        this.maxHealth = 140;
        this.health = 140;
        this.maxMana = 115;
        this.mana = 55;
        this.width = 96;
        this.height = 168;
        this.speed = 5.3;
        this.manaRegen = 7;
        this.adaptingType = null;
        this.adaptationHits = 0;
        this.adaptationProgress = {};
        this.adaptedTypes = new Set();
        this.lastHitType = null;
        this.strikeCooldown = 0;
        this.adaptCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        if (this.health <= 0) {
            this.health = 0;
            return;
        }
        super.update(keys, game, dt, platforms);
        this.gainMana(this.manaRegen * dt);
        this.heal(this.manaRegen * dt);
        if (this.strikeCooldown > 0) this.strikeCooldown -= dt;
        if (this.adaptCooldown > 0) this.adaptCooldown -= dt;
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.adaptCooldown > 0) return;
        const type = this.chooseAdaptationType(game);
        if (!type || this.adaptedTypes.has(type)) return;
        if (!this.spendMana(18)) return;
        this.adaptingType = type;
        this.adaptationHits = this.getAdaptationProgress(type);
        this.adaptCooldown = 0.7;
        const progressText = this.adaptationHits > 0 ? ` ${this.adaptationHits}/7` : '';
        if (game.showAnnouncement) game.showAnnouncement(`Adapting to ${this.formatAdaptationName(type)}${progressText}`, '#e5e7eb');
    }

    ability2(game) {
        if (this.strikeCooldown > 0 || !this.spendMana(24)) return;
        animeSlash(game, this, {
            color: 'rgba(229, 231, 235, 0.78)',
            damage: 34,
            type: 'sword_of_extermination',
            width: 150,
            height: 96,
            knockback: 70
        });
        this.strikeCooldown = 0.75;
    }

    takeDamage(amount) {
        const type = this.incomingDamageType || 'basic_attack';
        this.lastHitType = type;
        this.ignoredIncomingDamageType = null;
        if (this.adaptedTypes.has(type)) {
            this.dodgeTextTimer = 0.55;
            this.ignoredIncomingDamageType = type;
            return;
        }
        super.takeDamage(amount);
        if (this.health <= 0) {
            this.health = 0;
            return;
        }
        if (this.adaptingType === type) {
            this.adaptationHits = Math.min(7, this.getAdaptationProgress(type) + 1);
            this.adaptationProgress[type] = this.adaptationHits;
            if (this.adaptationHits >= 7) this.completeAdaptation(type);
        }
    }

    completeAdaptation(type) {
        if (!type) return;
        this.adaptedTypes.add(type);
        this.adaptationProgress[type] = 7;
        if (this.adaptingType === type) {
            this.adaptingType = null;
            this.adaptationHits = 0;
        }
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);
        const type = this.chooseAdaptationType(game) || this.lastHitType;
        if (type) this.completeAdaptation(type);
        if (game.showAnnouncement) game.showAnnouncement(`Mahoraga adapted to ${this.formatAdaptationName(type || 'enemy moves')}`, '#e5e7eb');
        this.fireRadialUltimate(game, 10, 7, 8, '#e5e7eb', 'adaptation_wheel', 22, 34);
        return true;
    }

    chooseAdaptationType(game) {
        if (this.adaptingType && !this.adaptedTypes.has(this.adaptingType)) return this.adaptingType;
        const strongestBasic = this.getStrongestEnemyBasicMoveType(game);
        if (strongestBasic) return strongestBasic;
        if (this.lastHitType && !this.adaptedTypes.has(this.lastHitType)) return this.lastHitType;
        return this.getEnemyMoveTypes(game).find(type => !this.adaptedTypes.has(type)) || null;
    }

    getAdaptationProgress(type) {
        if (!type) return 0;
        return Math.max(0, this.adaptationProgress[type] || 0);
    }

    peekEnemyMoveType(game) {
        return this.chooseAdaptationType(game);
    }

    getStrongestEnemyBasicMoveType(game) {
        const options = this.getEnemyBasicMoveOptions(game)
            .filter(move => move.type && !this.adaptedTypes.has(move.type))
            .sort((a, b) => (b.damage || 0) - (a.damage || 0));
        return options.length ? options[0].type : null;
    }

    estimateMoveDamage(move) {
        if (!move) return 0;
        const baseDamage = move.damage || 0;
        if (move.kind === 'volley' || move.kind === 'surround') return baseDamage * (move.count || 1);
        if (move.kind === 'radial') return baseDamage * Math.min(move.count || 1, 4);
        return baseDamage;
    }

    getEnemyBasicMoveOptions(game) {
        const enemy = this.getOpponent(game);
        if (!enemy) return [];

        const options = [];
        const addMove = move => {
            if (move && move.type) options.push({ type: move.type, damage: this.estimateMoveDamage(move) });
        };

        if (enemy.config) {
            addMove(enemy.config.ability1);
            addMove(enemy.config.ability2);
        }

        const knownBasics = {
            Priest: [{ type: 'light', damage: 15 }],
            Devil: [{ type: 'claw', damage: 4 }],
            Fighter: [{ type: 'steal', damage: 20 }, { type: 'normal', damage: 45 }],
            Mage: [{ type: 'ice', damage: 15 }, { type: 'nova', damage: 30 }],
            Barbarian: [{ type: 'heavy_swing', damage: 15 }],
            Spearman: [{ type: 'spear_thrust', damage: 12 }, { type: 'spear_throw', damage: 50 }],
            Assassin: [{ type: 'stab', damage: 8 }],
            Trapper: [{ type: 'trap', damage: 40 }, { type: 'explosion', damage: 25 }],
            Broker: [{ type: 'swipe', damage: 12 }, { type: 'product', damage: 8 }],
            Sniper: [{ type: 'snipe', damage: 1998 }],
            Alchemist: [{ type: 'bullet', damage: 10 }, { type: 'acid', damage: 15 }],
            Guardian: [{ type: 'basic_attack', damage: 40 }],
            GravityMage: [{ type: 'gravity_surge', damage: 10 }, { type: 'basic_attack', damage: 80 }],
            Duelist: [{ type: 'monster', damage: 40 }, { type: 'card_barrage', damage: 25 }],
            Gojo: [{ type: 'gojo_blue', damage: 0 }, { type: 'gojo_red', damage: 24 }],
            Sukuna: [{ type: 'sukuna_slash', damage: 24 }, { type: 'fuga_arrow', damage: 48 }],
            Killua: [{ type: 'killua_lightning', damage: 22 }, { type: 'killua_yoyo', damage: 32 }],
            Knuckle: [{ type: 'knuckle_punch', damage: 26 }, { type: 'hakoware_marker', damage: 8 }],
            Sinbad: [{ type: 'sinbad_sword', damage: 24 }, { type: 'sinbad_djinn_storm', damage: 36 }],
            Mahoraga: [{ type: 'sword_of_extermination', damage: 34 }],
            Lancer: [{ type: 'lancer_thrust', damage: 25 }, { type: 'gae_bolg_throw', damage: 44 }],
            AssassinZero: [{ type: 'shadow_knife', damage: 20 }, { type: 'counter_cut', damage: 36 }],
            BerserkerStayNight: [{ type: 'axe_smash', damage: 33 }, { type: 'leap_slam', damage: 44 }]
        };

        (knownBasics[enemy.className || enemy.constructor.name] || []).forEach(move => {
            if (!options.some(option => option.type === move.type)) options.push(move);
        });

        return options;
    }

    getEnemyMoveTypes(game) {
        const enemy = this.getOpponent(game);
        if (!enemy) return [];
        const moves = [];
        const addMove = move => {
            if (move && move.type && !moves.includes(move.type)) moves.push(move.type);
        };
        if (enemy.config) {
            addMove(enemy.config.ability1);
            addMove(enemy.config.ability2);
            addMove(enemy.config.ultimate);
        }
        const known = {
            Gojo: ['gojo_blue', 'gojo_red', 'unlimited_void'],
            Sukuna: ['sukuna_slash', 'fuga_arrow', 'malevolent_shrine'],
            Killua: ['killua_lightning', 'killua_yoyo'],
            Knuckle: ['knuckle_punch', 'hakoware_marker', 'hakoware_bankruptcy'],
            Sinbad: ['sinbad_sword', 'sinbad_djinn_storm', 'baal_lightning_sword', 'baal_bararaq', 'valefor_ice_mirror', 'focalor_wind_blade', 'focalor_tornado', 'zepar_command_note', 'zepar_domination'],
            Mahoraga: ['sword_of_extermination', 'adaptation_wheel'],
            Lancer: ['lancer_thrust', 'gae_bolg_throw', 'gae_bolg_curse'],
            AssassinZero: ['shadow_knife', 'counter_cut'],
            BerserkerStayNight: ['axe_smash', 'leap_slam', 'god_hand']
        };
        (known[enemy.className] || []).forEach(type => {
            if (!moves.includes(type)) moves.push(type);
        });
        return moves;
    }

    formatAdaptationName(type) {
        return String(type || '').replace(/_/g, ' ');
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        if (this.adaptingType) {
            ctx.fillText(`ADAPT ${this.adaptationHits}/7`, this.x + this.width / 2, this.y - 78);
        }
        if (this.adaptedTypes.size > 0) {
            ctx.fillText(`IMMUNE ${this.adaptedTypes.size}`, this.x + this.width / 2, this.y - 94);
        }
        ctx.restore();
    }
}

class Vader extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Vader';
        this.maxHealth = 118;
        this.health = 118;
        this.maxMana = 130;
        this.mana = 65;
        this.speed = 5.6;
        this.ability1Cooldown = 0;
        this.ability2Cooldown = 0;
        this.forceChoke = null;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana(7 * dt);
        if (this.ability1Cooldown > 0) this.ability1Cooldown -= dt;
        if (this.ability2Cooldown > 0) this.ability2Cooldown -= dt;
        this.updateForceChoke(game, dt);

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.ability1Cooldown > 0) return;
        animeSlash(game, this, {
            color: '#ef4444',
            damage: 28,
            type: 'lightsaber_swing',
            width: 126,
            height: 90,
            knockback: 46
        });
        this.ability1Cooldown = 0.42;
    }

    ability2(game) {
        if (this.ability2Cooldown > 0 || !this.spendMana(28)) return;
        const width = 250;
        animeArea(game, this, {
            x: animeFrontX(this, width),
            y: this.y + 18,
            width,
            height: 112,
            color: 'rgba(148, 163, 184, 0.42)',
            damage: 18,
            type: 'force_push',
            duration: 12,
            knockback: this.facingDirection * 112,
            onHit: target => {
                target.vy -= 8;
            },
            drawDirection: this.facingDirection
        });
        this.ability2Cooldown = 0.82;
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        const target = this.getOpponent(game);
        if (!target) return false;

        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.gainMana(this.maxMana);
        if (game.showAnnouncement) game.showAnnouncement('Force Choke', '#ef4444');
        this.startForceChoke(game, target);
        return true;
    }

    startForceChoke(game, target) {
        if (this.forceChoke && this.forceChoke.effect) this.forceChoke.effect.active = false;

        const sequence = ['jump', 'right', 'down', 'left'];
        const labels = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const effect = animeProjectile(game, {
            x: target.x - 34,
            y: target.y - 54,
            vx: 0,
            vy: 0,
            owner: 'effect',
            color: 'rgba(239, 68, 68, 0.5)',
            damage: 0,
            type: 'force_choke',
            width: target.width + 68,
            height: target.height + 92,
            duration: 520
        });

        effect.escapeLabels = labels;
        effect.escapeProgress = 0;
        effect.draw = function(ctx) {
            const pulse = 0.5 + Math.sin(this.timer * 12) * 0.5;
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;

            ctx.save();
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.55 + pulse * 0.25})`;
            ctx.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(cx, cy, this.width * (0.22 + i * 0.13), this.height * (0.16 + i * 0.08), this.timer * 1.4 + i, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
            ctx.fillRect(cx - 128, this.y - 30, 256, 23);
            ctx.fillStyle = '#fee2e2';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const remaining = this.escapeLabels.slice(this.escapeProgress).join(' ');
            ctx.fillText(`ESCAPE: ${remaining}`, cx, this.y - 18);
            ctx.restore();
        };

        this.forceChoke = {
            target,
            effect,
            sequence,
            labels,
            progress: 0,
            elapsed: 0,
            tick: 0,
            aiEscapeTimer: 0,
            prevInputs: { jump: false, right: false, down: false, left: false }
        };
    }

    updateForceChoke(game, dt) {
        const state = this.forceChoke;
        if (!state) return;

        const target = state.target;
        if (!game.running || this.health <= 0 || !target || target.health <= 0 || state.elapsed >= 8) {
            this.endForceChoke();
            return;
        }

        state.elapsed += dt;
        state.tick += dt;
        target.vx *= 0.55;
        target.vy = Math.min(target.vy, -2.2);

        if (state.effect) {
            state.effect.x = target.x - 34;
            state.effect.y = target.y - 54;
            state.effect.escapeProgress = state.progress;
        }

        if (state.tick >= 0.34) {
            state.tick = 0;
            const damage = game.scaleDamageForSpeed ? game.scaleDamageForSpeed(5.5 * this.damageMultiplier, this.tag) : 5.5 * this.damageMultiplier;
            const healthBefore = target.health;
            target.incomingDamageType = 'force_choke';
            target.takeDamage(damage);
            target.incomingDamageType = null;
            const dealt = Math.max(0, healthBefore - target.health);
            if (dealt > 0) {
                if (this.onHit) this.onHit(target, dealt);
                if (game.applyTalentOnHit) game.applyTalentOnHit(this, target, dealt);
            }
        }

        if (game.p2IsNPC && target.tag === 'p2') {
            state.aiEscapeTimer += dt;
            if (state.aiEscapeTimer >= 0.55) {
                state.aiEscapeTimer = 0;
                this.advanceForceChokeEscape(state);
            }
            return;
        }

        const targetInputs = game.currentInputs?.[target.tag] || {};
        const directionKeys = ['jump', 'right', 'down', 'left'];
        for (const key of directionKeys) {
            const isPressed = !!targetInputs[key];
            const wasPressed = !!state.prevInputs[key];
            if (isPressed && !wasPressed) {
                if (key === state.sequence[state.progress]) {
                    this.advanceForceChokeEscape(state);
                } else {
                    state.progress = key === state.sequence[0] ? 1 : 0;
                    if (state.effect) state.effect.escapeProgress = state.progress;
                }
            }
            state.prevInputs[key] = isPressed;
        }
    }

    advanceForceChokeEscape(state) {
        state.progress += 1;
        if (state.effect) state.effect.escapeProgress = state.progress;
        if (state.progress >= state.sequence.length) this.endForceChoke();
    }

    endForceChoke() {
        if (this.forceChoke && this.forceChoke.effect) this.forceChoke.effect.active = false;
        this.forceChoke = null;
    }
}

var Aladdin = defineAnimeClass({
    className: 'Aladdin',
    maxHealth: 85,
    maxMana: 180,
    startMana: 100,
    speed: 6.3,
    spriteFlipped: true,
    manaRegen: 12,
    ability1: { kind: 'shot', cost: 14, color: '#60a5fa', damage: 20, type: 'anime_bolt', speed: 15, aim: true },
    ability2: { kind: 'field', cost: 45, color: 'rgba(96, 165, 250, 0.42)', damage: 26, type: 'anime_field', width: 260, height: 210, knockback: 18, onHit: target => { target.vy -= 12; } },
    ultimateName: 'Ugo Giant Hand',
    ultimateColor: '#60a5fa',
    ultimate: { kind: 'sure_hit', color: 'rgba(96, 165, 250, 0.58)', damage: 70, type: 'anime_giant_fist', width: 360, height: 360, duration: 24, knockback: 120 }
});

var Alibaba = defineAnimeClass({
    className: 'Alibaba',
    maxHealth: 105,
    maxMana: 135,
    startMana: 70,
    speed: 6.1,
    spriteFlipped: true,
    manaRegen: 8,
    ability1: { kind: 'slash', cost: 12, color: '#fb923c', damage: 26, type: 'flame_sword', width: 124, height: 86, knockback: 44 },
    ability2: { kind: 'beam', cost: 42, color: 'rgba(251, 146, 60, 0.68)', damage: 34, type: 'amon_flame', width: 720, height: 42, duration: 14, knockback: 72 },
    ultimateName: 'Amon Djinn Equip',
    ultimateColor: '#fb923c',
    ultimate: { kind: 'field', color: 'rgba(251, 146, 60, 0.58)', damage: 68, type: 'amon_inferno', width: 400, height: 300, duration: 32, boostDamage: 0.35, boostMs: 7500 }
});

var Saber = defineAnimeClass({
    className: 'Saber',
    maxHealth: 110,
    maxMana: 125,
    startMana: 65,
    speed: 6.2,
    ability1: { kind: 'slash', cost: 8, color: '#93c5fd', damage: 25, type: 'anime_slash', width: 116, height: 88, knockback: 42 },
    ability2: { kind: 'beam', cost: 36, color: 'rgba(147, 197, 253, 0.65)', damage: 34, type: 'invisible_air', width: 520, height: 30, duration: 12, knockback: 68 },
    ultimateName: 'Excalibur',
    ultimateColor: '#facc15',
    ultimate: { kind: 'beam', color: 'rgba(250, 204, 21, 0.72)', damage: 86, type: 'excalibur_beam', width: 1280, height: 80, duration: 24, knockback: 130 }
});

var Archer = defineAnimeClass({
    className: 'Archer',
    maxHealth: 95,
    maxMana: 145,
    startMana: 80,
    speed: 6,
    ability1: { kind: 'shot', cost: 16, color: '#e5e7eb', damage: 24, type: 'anime_bolt', width: 42, height: 12, speed: 18, aim: true },
    ability2: { kind: 'volley', cost: 42, color: '#f87171', damage: 15, type: 'blade_volley', count: 7, speed: 14, width: 38, height: 12, knockback: 12 },
    ultimateName: 'Unlimited Blade Works',
    ultimateColor: '#f87171',
    ultimate: { kind: 'surround', color: '#e5e7eb', damage: 24, type: 'blade_volley', count: 24, speed: 18, width: 46, height: 12, duration: 95, homing: true, homingTurnRate: 0.13 }
});

class Lancer extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'Lancer';
        this.maxHealth = 105;
        this.health = 105;
        this.maxMana = 120;
        this.mana = 60;
        this.speed = 6.8;
        this.disarmed = false;
        this.thrustCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);
        this.gainMana(6 * dt);
        if (this.thrustCooldown > 0) this.thrustCooldown -= dt;
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (this.thrustCooldown > 0) return;
        if (this.disarmed) {
            animeSlash(game, this, { color: '#7f1d1d', damage: 5, type: 'knuckle_punch', width: 48, height: 44, knockback: 12 });
            this.thrustCooldown = 0.45;
            return;
        }
        animeSlash(game, this, { color: '#ef4444', damage: 25, type: 'lancer_thrust', width: 155, height: 38, knockback: 36 });
        this.thrustCooldown = 0.55;
    }

    ability2(game) {
        if (this.disarmed || !this.spendMana(34)) return;
        const dir = this.facingDirection;
        const spear = animeProjectile(game, {
            x: this.x + (dir === 1 ? this.width : 0),
            y: this.y + 24,
            vx: dir * 24,
            vy: -1,
            owner: this.tag,
            color: '#dc2626',
            damage: 44 * this.damageMultiplier,
            type: 'gae_bolg_throw',
            width: 88,
            height: 16,
            duration: 9999,
            knockback: dir * 75
        });
        spear.isSpear = true;
        spear.update = function(dt, gameRef) {
            if (!this.stopped) {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.45;
                const floorY = gameRef ? (gameRef.floorY || 700) : 700;
                const worldW = gameRef ? (gameRef.width || 1200) : 1200;
                if (this.y + this.height >= floorY || this.x < 0 || this.x > worldW - this.width) {
                    this.x = Math.max(0, Math.min(worldW - 40, this.x));
                    this.y = Math.min(floorY - 40, this.y);
                    this.vx = 0;
                    this.vy = 0;
                    this.stopped = true;
                    this.isPickup = true;
                    this.damage = 0;
                    this.width = 40;
                    this.height = 40;
                    this.type = 'gae_bolg_pickup';
                }
            }
        };
        this.disarmed = true;
    }

    retrieveSpear() {
        this.disarmed = false;
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        if (game.showAnnouncement) game.showAnnouncement('Gae Bolg', '#dc2626');
        animeField(game, this, { color: 'rgba(220, 38, 38, 0.52)', damage: 82, type: 'gae_bolg_curse', width: 300, height: 240, duration: 26, knockback: 95 });
        return true;
    }
}

var Gilgamesh = defineAnimeClass({
    className: 'Gilgamesh',
    maxHealth: 100,
    maxMana: 170,
    startMana: 100,
    speed: 5.8,
    ability1: { kind: 'volley', cost: 22, color: '#facc15', damage: 13, type: 'gate_sword', count: 5, speed: 15, width: 36, height: 12 },
    ability2: { kind: 'shot', cost: 40, color: '#f59e0b', damage: 24, type: 'enkidu_chain', width: 170, height: 22, speed: 13, aim: true, onHit: target => { const oldSpeed = target.speed; target.speed = Math.max(2, target.speed - 2); window.setTimeout(() => { target.speed = Math.max(target.speed, oldSpeed); }, 1800); } },
    ultimateName: 'Enuma Elish',
    ultimateColor: '#facc15',
    ultimate: { kind: 'beam', color: 'rgba(250, 204, 21, 0.75)', damage: 90, type: 'ea_beam', width: 1280, height: 96, duration: 26, knockback: 150 }
});

var RiderZero = defineAnimeClass({
    className: 'RiderZero',
    maxHealth: 120,
    maxMana: 120,
    startMana: 60,
    speed: 5.8,
    ability1: { kind: 'dash', cost: 18, color: '#a16207', damage: 28, type: 'chariot_charge', width: 140, height: 96, distance: 150, knockback: 72 },
    ability2: { kind: 'volley', cost: 40, color: '#d97706', damage: 14, type: 'phalanx_spear', count: 5, speed: 14, width: 62, height: 12, knockback: 18 },
    ultimateName: 'Ionioi Hetairoi',
    ultimateColor: '#f59e0b',
    ultimate: { kind: 'field', color: 'rgba(245, 158, 11, 0.2)', damage: 0, type: 'army_rally', width: 1, height: 1, duration: 1, extra: (caster, game) => {
        if (typeof Minion === 'undefined' || !game.minions) return;
        for (let i = 0; i < 10; i++) {
            const offset = (i - 4.5) * 42;
            const m = new Minion(Math.max(0, Math.min(game.width - 45, caster.x + offset)), caster.y, caster.tag, 'skeleton');
            m.health = 100;
            m.speed = 2.7;
            m.damage = 8;
            game.minions.push(m);
        }
    } }
});

var RiderStayNight = defineAnimeClass({
    className: 'RiderStayNight',
    maxHealth: 95,
    maxMana: 145,
    startMana: 80,
    speed: 7,
    ability1: { kind: 'dash', cost: 15, color: '#c084fc', damage: 23, type: 'rider_dagger', width: 104, height: 70, distance: 150, knockback: 38 },
    ability2: { kind: 'shot', cost: 38, color: '#a78bfa', damage: 12, type: 'mystic_eyes', width: 58, height: 58, speed: 11, duration: 66, onHit: target => { target.manaLockTimer = Math.max(target.manaLockTimer || 0, 1.2); target.manaLockLabel = 'PETRIFIED'; } },
    ultimateName: 'Bellerophon',
    ultimateColor: '#c084fc',
    ultimate: { kind: 'dash', color: '#c084fc', damage: 82, type: 'bellerophon_charge', width: 220, height: 130, distance: 260, knockback: 135 }
});

var CasterZero = defineAnimeClass({
    className: 'CasterZero',
    maxHealth: 92,
    maxMana: 170,
    startMana: 95,
    speed: 5.2,
    ability1: { kind: 'shot', cost: 20, color: '#22c55e', damage: 22, type: 'tentacle_lash', width: 78, height: 24, speed: 11, aim: true, knockback: 24 },
    ability2: { kind: 'field', cost: 44, color: 'rgba(34, 197, 94, 0.45)', damage: 30, type: 'dark_ritual', width: 280, height: 220, duration: 32 },
    ultimateName: 'Sea Monster',
    ultimateColor: '#22c55e',
    ultimate: { kind: 'field', color: 'rgba(34, 197, 94, 0.58)', damage: 78, type: 'sea_monster', width: 460, height: 360, duration: 46, knockback: 80 }
});

var CasterStayNight = defineAnimeClass({
    className: 'CasterStayNight',
    maxHealth: 88,
    maxMana: 185,
    startMana: 110,
    speed: 5.7,
    manaRegen: 13,
    ability1: { kind: 'volley', cost: 18, color: '#a78bfa', damage: 12, type: 'rune_bolt', count: 4, speed: 13, aim: true },
    ability2: { kind: 'shot', cost: 28, color: '#c084fc', damage: 10, type: 'mana_siphon', width: 60, height: 34, speed: 12, aim: true, duration: 70, onHit: (target, caster) => {
        const drained = Math.min(45, target.mana || 0);
        target.mana = Math.max(0, (target.mana || 0) - drained);
        caster.gainMana(drained + 18);
    } },
    ultimateName: 'Rule Breaker',
    ultimateColor: '#a78bfa',
    ultimate: { kind: 'dash', color: '#f472b6', damage: 74, type: 'rule_breaker', width: 150, height: 120, distance: 170, knockback: 35, onHit: (target, caster, game) => {
        target.ultimateCharge = 0;
        target.ultimateReady = false;
        target.manaLockTimer = Math.max(target.manaLockTimer || 0, 3.5);
        if (game && game.minions) {
            game.minions.forEach(minion => {
                if (minion.owner === target.tag) minion.owner = caster.tag;
            });
        }
        if (game && game.projectiles) {
            game.projectiles.forEach(projectile => {
                if (projectile.isMonster && projectile.ownerTag === target.tag) {
                    projectile.ownerTag = caster.tag;
                    projectile.owner = caster.tag;
                }
            });
        }
    } }
});

class HassanClone extends Character {
    constructor(source) {
        super(source.x - source.facingDirection * 58, source.y, source.color);
        this.className = 'AssassinZero';
        this.active = true;
        this.tag = source.tag;
        this.owner = source.tag;
        this.maxHealth = 60;
        this.health = 60;
        this.maxMana = 130;
        this.mana = 90;
        this.speed = 6.8;
        this.facingDirection = source.facingDirection;
        this.ability1Cooldown = 0;
        this.ability2Cooldown = 0;
        this.image.src = 'imges/assassinzero.png';
    }

    update(dt, game) {
        if (this.ability1Cooldown > 0) this.ability1Cooldown -= dt;
        if (this.ability2Cooldown > 0) this.ability2Cooldown -= dt;
        const target = this.tag === 'p1' ? game.player2 : game.player1;
        const keys = game.getAIInput ? game.getAIInput(this, target) : { left: false, right: false, jump: false, down: false, attack1: false, attack2: false };
        super.update(keys, game, dt, game.platforms);
        if (keys.attack1 && this.ability1Cooldown <= 0) {
            animeShot(game, this, { color: '#94a3b8', damage: 12, type: 'shadow_knife', width: 30, height: 10, speed: 15, aim: true });
            this.ability1Cooldown = 0.65;
        }
        if (keys.attack2 && this.ability2Cooldown <= 0) {
            animeSlash(game, this, { color: '#64748b', damage: 14, type: 'shadow_clone', width: 92, height: 70, knockback: 22 });
            this.ability2Cooldown = 1.1;
        }
    }
}

class AssassinZero extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.className = 'AssassinZero';
        this.maxHealth = 82;
        this.health = 82;
        this.maxMana = 130;
        this.mana = 70;
        this.speed = 7.4;
        this.counterTimer = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.loadSprite();
    }

    update(keys, game, dt, platforms) {
        this.currentGame = game;
        if (this.counterTimer > 0) {
            this.counterTimer -= dt;
            keys = { ...keys, left: false, right: false, jump: false, down: false };
        }
        super.update(keys, game, dt, platforms);
        this.gainMana(7 * dt);
        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);
        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        if (!this.spendMana(12)) return;
        animeShot(game, this, { color: '#94a3b8', damage: 20, type: 'shadow_knife', width: 34, height: 12, speed: 17, aim: true });
    }

    ability2(game) {
        if (this.counterTimer > 0 || !this.spendMana(30)) return;
        this.counterTimer = 1;
        if (game.showAnnouncement) game.showAnnouncement('Counter Stance', '#94a3b8');
    }

    takeDamage(amount) {
        if (this.counterTimer > 0) {
            const game = this.currentGame;
            const target = game ? this.getOpponent(game) : null;
            if (target && game) {
                animeSlash(game, this, { color: '#94a3b8', damage: 36, type: 'counter_cut', width: 150, height: 90, knockback: this.facingDirection * 55 });
            }
            this.counterTimer = 0;
            return;
        }
        super.takeDamage(amount);
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        if (game.showAnnouncement) game.showAnnouncement('Hundred Faces', '#94a3b8');
        if (game.minions) game.minions.push(new HassanClone(this));
        return true;
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.counterTimer > 0) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 6, this.y - 6, this.width + 12, this.height + 12);
        }
    }
}

var AssassinStayNight = defineAnimeClass({
    className: 'AssassinStayNight',
    maxHealth: 90,
    maxMana: 125,
    startMana: 65,
    speed: 6.9,
    spriteFlipped: true,
    ability1: { kind: 'slash', cost: 8, color: '#93c5fd', damage: 24, type: 'katana_slash', width: 120, height: 72, knockback: 36 },
    ability2: { kind: 'dash', cost: 32, color: '#bfdbfe', damage: 40, type: 'counter_cut', width: 154, height: 88, distance: 180, knockback: 54 },
    ultimateName: 'Tsubame Gaeshi',
    ultimateColor: '#bfdbfe',
    ultimate: { kind: 'field', color: 'rgba(191, 219, 254, 0.62)', damage: 86, type: 'tsubame_gaeshi', width: 360, height: 280, duration: 24, knockback: 95 }
});

var BerserkerZero = defineAnimeClass({
    className: 'BerserkerZero',
    maxHealth: 125,
    maxMana: 115,
    startMana: 55,
    speed: 5.7,
    ability1: { kind: 'slash', cost: 8, color: '#64748b', damage: 28, type: 'cursed_blade', width: 118, height: 98, knockback: 58 },
    ability2: { kind: 'volley', cost: 36, color: '#94a3b8', damage: 14, type: 'weapon_storm', count: 7, speed: 13, width: 40, height: 14 },
    ultimateName: 'Knight of Owner',
    ultimateColor: '#94a3b8',
    ultimate: { kind: 'radial', color: '#94a3b8', damage: 22, type: 'weapon_storm', count: 20, speed: 10, size: 34, duration: 65, reduction: 0.25, boostMs: 6500 }
});

class BerserkerStayNight extends ConfiguredAnimeFighter {
    constructor(x, y, color) {
        super(x, y, color, {
            className: 'BerserkerStayNight',
            maxHealth: 150,
            maxMana: 95,
            startMana: 45,
            speed: 4.9,
            ability1: { kind: 'slash', cost: 6, color: '#7f1d1d', damage: 33, type: 'axe_smash', width: 128, height: 118, knockback: 70 },
            ability2: { kind: 'dash', cost: 30, color: '#991b1b', damage: 44, type: 'leap_slam', width: 150, height: 130, distance: 125, knockback: 90 },
            ultimateName: 'God Hand',
            ultimateColor: '#ef4444',
            ultimate: { kind: 'field', color: 'rgba(127, 29, 29, 0.56)', damage: 74, type: 'god_hand', width: 390, height: 330, duration: 36, reduction: 0.65, boostMs: 9000, extra: caster => { caster.heal(65); caster.ultimateImmunityTimer = Math.max(caster.ultimateImmunityTimer || 0, 1.2); } }
        });
    }

    tryAvoidRoundLoss(game) {
        if (!this.ultimateReady) return false;
        this.ultimateReady = false;
        this.ultimateCharge = 0;
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        this.ultimateImmunityTimer = 2;
        this.x = this.tag === 'p1' ? 100 : game.width - 200;
        this.y = game.floorY - this.height;
        this.vx = 0;
        this.vy = 0;
        if (game.showAnnouncement) game.showAnnouncement('God Hand: Extra Life', '#ef4444');
        return true;
    }

    useUltimate(game) {
        if (this.manaLockTimer > 0 || !this.ultimateReady) return false;
        if (game.showAnnouncement) game.showAnnouncement('God Hand is ready to revive Heracles', '#ef4444');
        return false;
    }
}

window.AnimeCharacterNames = AnimeCharacterNames;
window.AnimeDisplayNames = AnimeDisplayNames;
window.AnimeCharacterInfo = {
    Gojo: { passive: 'Passive: High mana regen and Limitless setup.', a1: 'Blue (30): stationary pull orb', a2: 'Red (35): knockback shot; hit Blue to make Purple' },
    Sukuna: { passive: 'Passive: Slashes build mana.', a1: 'Cleave: close slash', a2: 'Fuga (45): charge, then flame arrow' },
    Killua: { passive: 'Passive: Godspeed drains mana for speed and strength.', a1: 'Lightning Shot (18)', a2: 'Returning Yo-Yos (26)' },
    Knuckle: { passive: 'Passive: APR rises slowly until Hakoware bankrupts mana.', a1: 'Punch: applies/increases APR', a2: 'Hakoware Loan (38): gives mana and increases APR' },
    Sinbad: { passive: 'Passive: Super randomly equips Baal, Valefor, Focalor, or Zepar.', a1: 'Lightning Sword (18)', a2: 'Djinn Storm (42)' },
    Vader: { passive: 'Passive: Heavy saber control and steady mana regen.', a1: 'Lightsaber Swing', a2: 'Force Push (28)' },
    Mahoraga: { passive: 'Passive: Regenerates health and mana. Adapted move types deal no damage.', a1: 'Begin to Adapt (18): targets the strongest basic move; progress does not reset', a2: 'Sword of Extermination (24)' },
    Aladdin: { passive: 'Passive: Very high mana regen.', a1: 'Rukh Bolt (14)', a2: 'Gravity Magic (45)' },
    Alibaba: { passive: 'Passive: Flame sword pressure.', a1: 'Flame Sword (12)', a2: 'Amon Flame (42)' },
    Escanor: { passive: 'Passive: Heavy sun-powered brawler.', a1: 'Sun Slash (10)', a2: 'Cruel Sun (40)' },
    Saber: { passive: 'Passive: Durable sword duelist.', a1: 'Sword Slash (8)', a2: 'Invisible Air (36)' },
    Archer: { passive: 'Passive: Mid-range projectile specialist.', a1: 'Trace Arrow (16)', a2: 'Blade Volley (42)' },
    Lancer: { passive: 'Passive: Must retrieve Gae Bolg after throwing.', a1: 'Spear Thrust / Weak Punch', a2: 'Gae Bolg Throw (34)' },
    Gilgamesh: { passive: 'Passive: Gate of Babylon barrages.', a1: 'Gate Volley (22)', a2: 'Enkidu Chain (40): slows' },
    RiderZero: { passive: 'Passive: Heavy chariot pressure.', a1: 'Chariot Charge (18)', a2: 'Phalanx Spears (40)' },
    RiderStayNight: { passive: 'Passive: Fast hit-and-run rider.', a1: 'Dagger Dash (15)', a2: 'Mystic Eyes (38)' },
    CasterZero: { passive: 'Passive: Area-control caster.', a1: 'Tentacle Lash (20)', a2: 'Dark Ritual (44)' },
    CasterStayNight: { passive: 'Passive: High mana magecraft.', a1: 'Rune Bolts (18)', a2: 'Mana Siphon (28)' },
    AssassinZero: { passive: 'Passive: Super creates a permanent AI clone.', a1: 'Shadow Knife (12)', a2: 'Counter Stance (30)' },
    AssassinStayNight: { passive: 'Passive: Precise katana fighter.', a1: 'Katana Slash (8)', a2: 'Dashing Strike (32)' },
    BerserkerZero: { passive: 'Passive: Armor and weapon storms.', a1: 'Cursed Blade (8)', a2: 'Weapon Storm (36)' },
    BerserkerStayNight: { passive: 'Passive: Full super bar revives on death.', a1: 'Axe Smash (6)', a2: 'Leap Slam (30)' }
};

window.addAnimeCharacterButtons = function addAnimeCharacterButtons() {
    ['p1-select', 'p2-select'].forEach(selectId => {
        const select = document.getElementById(selectId);
        const info = select ? select.querySelector('.char-info') : null;
        if (!select || !info) return;

        AnimeCharacterNames.forEach(className => {
            if (select.querySelector(`.char-btn[data-char="${className}"]`)) return;
            const btn = document.createElement('div');
            btn.className = 'char-btn anime-char';
            btn.setAttribute('data-char', className);
            btn.textContent = AnimeDisplayNames[className] || className;
            select.insertBefore(btn, info);
        });

        const npcToggle = select.querySelector('.npc-toggle');
        if (selectId === 'p2-select' && npcToggle) {
            select.insertBefore(npcToggle, info);
        }
    });

    document.querySelectorAll('.char-btn[data-char="Duelist"]').forEach(btn => btn.classList.add('anime-char'));
};
