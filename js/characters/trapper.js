class Trapper extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxMana = 80;
        this.mana = 40; // Start with some mana
        this.speed = 5;
        this.damageMultiplier = 1;

        // State
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.manaTimer = 0;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Passive Mana Regen
        this.manaTimer += dt;
        if (this.manaTimer >= 1.0) { // Every 1 second
            this.gainMana(5);
            this.manaTimer = 0;
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Place Trap
        if (this.spendMana(20)) {
            const p = new Projectile(
                this.x + this.width / 2 - 15, // Center
                this.y + this.height - 10,   // At feet
                0, 0,
                this.tag,
                'rgba(0,0,0,0)', // Invisible Trap
                40 * this.damageMultiplier,
                'trap'
            );
            p.width = 30;
            p.height = 10;
            p.duration = 60; // Lasts 60 seconds (basically forever)
            p.isTrap = true; // Special logic flag for Game.js?

            // Traps shouldn't move, but might fall? 
            // Default projectile doesn't have gravity unless custom update.
            // Let's add simple gravity to it so it lands on platforms if spawned in air.

            p.update = function (dt, game) {
                // Apply gravity
                this.vy += 1;
                this.y += this.vy;

                let onGround = false;

                // Use game.platforms instead of treatment of 'game' as an array
                if (game && game.platforms) {
                    game.platforms.forEach(plat => {
                        // Land on platforms
                        if (this.vy >= 0 &&
                            this.x + this.width > plat.x &&
                            this.x < plat.x + plat.w &&
                            this.y + this.height >= plat.y &&
                            this.y + this.height <= plat.y + 20) {

                            this.y = plat.y - this.height;
                            this.vy = 0;
                            onGround = true;
                        }
                    });
                }

                // Floor logic from game.floorY
                const floorY = (game && game.floorY) ? game.floorY : 700;
                if (this.y + this.height >= floorY) {
                    this.y = floorY - this.height;
                    this.vy = 0;
                    onGround = true;
                }

                if (onGround) {
                    this.vx = 0;
                }
            };

            game.addProjectile(p);
        }
    }

    ability2(game) {
        // Detonate All Traps (Free)
        if (this.spendMana(0)) {
            let count = 0;
            game.projectiles.forEach(p => {
                if (p.owner === this.tag && p.type === 'trap' && p.active) {
                    // Explode!
                    this.explodeTrap(game, p);
                    p.active = false; // Add new explosion projectile instead
                    count++;
                }
            });
            console.log("Detonated " + count + " traps.");
        }
    }

    explodeTrap(game, p) {
        // Create an AOE explosion projectile at trap location
        const explosion = new Projectile(
            p.x - 20, // Bigger area
            p.y - 40,
            0, 0,
            p.tag,
            'red',
            25 * this.damageMultiplier, // Increased damage
            'explosion'
        );
        explosion.width = 70;
        explosion.height = 70;
        explosion.duration = 0.2; // Instant burst
        game.addProjectile(explosion);
    }
}
