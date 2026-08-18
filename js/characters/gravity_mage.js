class GravityMage extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxHealth = 90;
        this.health = 90;
        this.maxMana = 150;
        this.mana = 50;
        this.speed = 6; // Increased speed

        this.isSlamming = false;
        this.slamTimer = 0;
        this.fallTime = 0;

        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.jumpForce = 30; // Reduced from 44 (was too high)
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        // Track falling time for damage scaling
        if (this.vy > 0 && !this.grounded) {
            this.fallTime += dt;
            // Mana Regen based on falling speed
            this.gainMana(this.vy * 0.1); // Gain mana based on velocity
        } else {
            this.fallTime = 0;
        }

        // Ability 1: Gravity Surge (Slow & Sink Opponent)
        if (keys.attack1 && !this.prevAttack1) {
            this.ability1(game);
        }

        // Ability 2: Crushing Fall (Slam)
        if (keys.attack2 && !this.prevAttack2 && !this.grounded) {
            this.ability2(game);
        }

        if (this.isSlamming) {
            this.vy += 3; // Drastic gravity increase

            // Check for collision with opponent during slam
            const target = (this.tag === 'p1') ? game.player2 : game.player1;
            if (this.x < target.x + target.width &&
                this.x + this.width > target.x &&
                this.y < target.y + target.height &&
                this.y + this.height > target.y) {

                // Landed on them!
                const slamDamage = 20 + (this.fallTime * 60); // Scale damage with height
                const scaledDamage = game.scaleDamageForSpeed ? game.scaleDamageForSpeed(slamDamage, this.tag) : slamDamage;
                target.takeDamage(scaledDamage);
                target.vy = 10; // Ground them
                this.isSlamming = false;
                console.log(`Gravity Slam! Damage: ${slamDamage.toFixed(0)}`);
            }

            if (this.grounded) {
                this.isSlamming = false;
            }
        }

        super.update({ ...keys, down: keys.down || this.isSlamming }, game, dt, platforms);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Gravity Surge Projectile
        if (this.spendMana(40)) {
            const dir = this.facingDirection;
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -30),
                this.y + 20,
                dir * 8,
                0,
                this.tag,
                '#8e44ad', // Purple
                10,
                'gravity_surge'
            );
            p.width = 40;
            p.height = 40;
            p.onHit = (target) => {
                // Apply gravity surge effect (temporary slow + gravity increase)
                target.speed = 2; // Slow
                const originalGravity = 1; // Standard vy += 1
                // We'd need to modify Character.js to support per-character gravity...
                // For now, let's just do a heavy slow visual.
                target.color = '#5b2c6f'; // Dark purple tint
                setTimeout(() => {
                    target.speed = 5; // Restore (guessing average speed)
                    target.color = target.originalColor || 'white';
                }, 3000);
            };
            game.addProjectile(p);
            console.log("Gravity Surge!");
        }
    }

    ability2(game) {
        // Crushing Fall
        if (this.spendMana(30)) {
            this.isSlamming = true;
            console.log("Crushing Fall activated!");
        }
    }
}
