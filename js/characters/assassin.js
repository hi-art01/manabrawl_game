class Assassin extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        // Stats
        this.maxHealth = 80; // Squishy
        this.health = 80;
        this.maxMana = 50;
        this.mana = 0;
        this.speed = 10; // SUPER FAST
        this.damageMultiplier = 1;

        // State
        this.immune = false;
        this.stealthTimer = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.attackCooldown = 0;
        this.vanishCooldown = 0;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Stealth Timer Logic
        if (this.stealthTimer > 0) {
            this.stealthTimer -= dt;
            if (this.stealthTimer <= 0) {
                // Stealth ends
                this.immune = false;
                this.color = this.originalColor || 'black'; // Revert color
                // Re-enable collisions? (Handled by immune flag)
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.vanishCooldown > 0) this.vanishCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Stab (Close Range, High Damage, Free/Builder)
        if (this.attackCooldown <= 0 && this.spendMana(0)) {
            const dir = this.facingDirection;
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -30),
                this.y + 30,
                0, 0,
                this.tag,
                '#333', // Dark Grey
                8 * this.damageMultiplier, // Nerfed damage (was 15)
                'stab'
            );
            p.width = 30; // Very short range
            p.height = 10;
            p.duration = 5; // Very quick
            game.addProjectile(p);

            this.attackCooldown = 0.2; // Super small cooldown


            // Gain mana
            // this.gainMana(10); // Standard builder logic if needed
        }
    }

    onHit(target, damage) {
        this.gainMana(15);
    }

    ability2(game) {
        // Ultimate: Stealth / Smoke Bomb
        // Become transparent and immune to damage
        if (this.immune || this.vanishCooldown > 0) return;
        if (this.spendMana(40)) {
            this.immune = true;
            this.stealthTimer = 1.6;
            this.vanishCooldown = 5.5;

            this.originalColor = this.color;
            this.color = 'rgba(0, 0, 0, 0.2)'; // Very transparent

            console.log("Assassin Vanished!");
        }
    }

    draw(ctx) {
        // Custom draw to handle transparency if color name doesn't support rgba
        // But Canvas fillStyle supports rgba strings.
        super.draw(ctx);
    }
}
