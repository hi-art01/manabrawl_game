class Spearman extends Character {
    constructor(x, y, color) {
        super(x, y, color);

        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxMana = 80;
        this.mana = 0;
        this.maxMana = 80;
        this.mana = 0;
        this.speed = 8; // Faster!
        this.damageMultiplier = 1;

        // State
        this.disarmed = false;
        this.thrustCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        if (this.thrustCooldown > 0) this.thrustCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Thrust (Mid Range)
        if (this.disarmed) {
            // Weak Punch if disarmed
            // Free
            const dir = this.facingDirection;
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -30),
                this.y + 30,
                0, 0,
                this.tag,
                '#555',
                2 * this.damageMultiplier, // Very weak
                'punch'
            );
            p.width = 30;
            p.height = 30;
            p.duration = 5;
            game.addProjectile(p);
            return;
        }

        // Spear Thrust
        if (this.thrustCooldown > 0) return; // Cooldown check

        if (this.spendMana(0)) {
            const dir = this.facingDirection;
            // Long narrow hitbox
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -130), // Increased Range 130
                this.y + 30, // Adjusted height
                0, 0,
                this.tag,
                '#FFD700', // Gold
                12 * this.damageMultiplier,
                'spear_thrust'
            );
            p.width = 130; // Larger Reach
            p.height = 20; // Thicker
            p.duration = 8;
            p.knockback = dir * 50; // KNOCKBACK!
            game.addProjectile(p);

            // Cooldown
            this.thrustCooldown = 0.6; // 0.6 seconds cooldown
        }
    }

    // Gain mana on hit
    onHit(target, damage) {
        this.gainMana(damage);
    }

    ability2(game) {
        // Spear Throw (Ultimate)
        // High Damage, but disarms self
        if (!this.disarmed && this.spendMana(40)) {
            const dir = this.facingDirection;

            // The flying spear
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : 0),
                this.y + 20,
                dir * 25, // Very Fast
                0,
                this.tag,
                '#FFD700',
                50 * this.damageMultiplier, // INSANE DAMAGE
                'spear_throw'
            );
            p.width = 80;
            p.height = 10;

            // It needs to stop eventually and become a pickup
            // Hack: Use `duration` logic in Game to allow it to stop?
            // Or better: Projectile detects bounds or collision and becomes pickup?
            // "Must retrieve it".

            // Let's make it pass through, then stop at wall or floor?
            // Engine simply deletes out of bounds.
            // Let's give it drag? Or just stop after X frames.

            // Logic: It travels for 0.5s dealing damage. Then stops and becomes pickup.
            // But Projectile.js is simple.
            // Let's modify Projectile in place or add logic here?

            // Let's use `activeTime` (renamed to duration?).
            // If I set duration, it disappears.

            // Let's create a special projectile type or handle logic in update?
            // I can't easily modify individual projectile logic without access to class.

            // Let's set it to stop after distance?
            // Hack: I'll simulate it stopping by replacing it with a pickup projectile later?
            // No, async is hard.

            // SIMPLE APPROACH:
            // It travels fast. 
            // I'll make it bouncy? No.

            // Feature: "Retrieval".
            // Implementation: The projectile stops moving but stays active (check collision with owner).
            // But it needs to stop dealing damage to Enemy?
            // Or it can keep hurting if they walk on it? "must retrieve".

            // Let's add customized update property to instance if JS allows.
            p.isSpear = true;
            p.timer = 0;

            p.update = function (dt, game) {
                // Custom override!
                if (!this.stopped) {
                    this.x += this.vx;
                    this.y += this.vy;
                    // Apply Gravity slightly?
                    this.vy += 0.5;

                    const floorY = game ? (game.floorY || 700) : 700;
                    const worldW = game ? (game.width || 1200) : 1200;

                    // Check hitting floor
                    if (this.y > floorY) {
                        this.y = floorY;
                        this.vx = 0;
                        this.vy = 0;
                        this.stopped = true;
                        this.isPickup = true; // Enable pickup logic in Game.js
                        this.damage = 0; // Safe to touch
                        // Transform to Square
                        this.width = 40;
                        this.height = 40;
                        this.y = floorY - 40; // Adjust position to sit on floor
                    }

                    // Check bounds
                    if (this.x < 0 || this.x > worldW) {
                        this.vx = 0;
                        this.stopped = true;
                        this.isPickup = true;
                        this.damage = 0;
                        // Transform to Square
                        this.width = 40;
                        this.height = 40;
                        // Clamp
                        if (this.x < 0) this.x = 0;
                        if (this.x > worldW) this.x = worldW - 40;
                    }
                }
            };

            game.addProjectile(p);
            this.disarmed = true;
            this.color = '#888'; // Greyed out
        }
    }

    retrieveSpear() {
        this.disarmed = false;
        this.color = this.originalColor || 'orange'; // Need to store original color somewhere... 
        // Or just hardcode logic.
        // Let's guess color based on player? 
        // Wait, Character.js stores `this.color`.
        this.color = 'gold'; // Spearman color
    }
}
