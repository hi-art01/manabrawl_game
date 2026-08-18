class Sniper extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        // Stats
        this.maxHealth = 70; // Low HP balance
        this.health = 70;
        this.maxMana = 100;
        this.mana = 0;
        this.speed = 4; // Moderate speed
        this.damageMultiplier = 2;

        this.manaRegenTimer = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.dashCooldown = 0;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Rapid Mana Regen (10 per second)
        this.manaRegenTimer += dt;
        if (this.manaRegenTimer >= 0.1) { // Every 0.1s
            this.gainMana(1);
            this.manaRegenTimer = 0;
        }

        if (this.dashCooldown > 0) this.dashCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Snipe (Full Mana only)
        if (this.mana >= 100) {
            this.spendMana(100);

            const dir = this.facingDirection;
            const roll = Math.random();
            const isInstakill = roll < 1 / 3; // Strict 1/3
            const damage = (isInstakill ? 999 : 5) * this.damageMultiplier; // Low damage on miss

            console.log(`Sniper roll: ${roll.toFixed(2)} - ${isInstakill ? "CRIT!" : "Normal"}`);

            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -100),
                this.y + 20,
                dir * 50, // Extremely fast
                0,
                this.tag,
                isInstakill ? 'red' : 'yellow',
                damage,
                'snipe'
            );
            p.width = 100;
            p.height = 4;
            p.duration = 40;
            p.instantKill = isInstakill;

            if (isInstakill) {
                p.onHit = (target) => {
                    target.health = 0;
                    target.ultimateReady = false;
                    target.ultimateCharge = 0;
                    target.ultimateImmunityTimer = 0;
                };
            } else {
                p.onHit = (target) => {
                    target.vy = -15; // Shoot up in air
                };
            }

            game.addProjectile(p);

            // Visual effect for insta-kill attempt
            if (isInstakill) {
                const flash = new Projectile(this.x, this.y, 0, 0, this.tag, 'rgba(255,0,0,0.5)', 0, 'flash');
                flash.width = game.width;
                flash.height = game.height;
                flash.duration = 5;
                game.addProjectile(flash);
            }
        }
    }

    ability2(game) {
        // Dash (Teleport-style)
        if (this.dashCooldown <= 0 && this.spendMana(15)) {
            const dashDistance = 300; // Far teleport
            const dir = this.facingDirection;

            // Visual trail at OLD position
            const trail1 = new Projectile(this.x, this.y, 0, 0, this.tag, 'rgba(255,255,255,0.5)', 0, 'dash_trail');
            trail1.width = this.width;
            trail1.height = this.height;
            trail1.duration = 15;
            game.addProjectile(trail1);

            // Instant move
            this.x += dir * dashDistance;
            this.dashCooldown = 1.0; // Slightly longer cooldown for power

            // Visual trail at NEW position
            const trail2 = new Projectile(this.x, this.y, 0, 0, this.tag, 'white', 0, 'dash_trail');
            trail2.width = this.width;
            trail2.height = this.height;
            trail2.duration = 10;
            game.addProjectile(trail2);

            console.log("Blink Dash!");
        }
    }
}
