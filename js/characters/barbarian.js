class Barbarian extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxHealth = 150; // Massively Nerfed HP (was 200)
        this.health = 150;
        this.maxMana = 60; // Standard mana? Or low?
        this.mana = 0;
        this.speed = 3; // Slow
        this.damageMultiplier = 1;

        // Ability state
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.prevAttack2 = false;
        this.rageTimer = 0;
        this.attackCooldown = 0;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Handle Rage Timer
        if (this.rageTimer > 0) {
            this.rageTimer -= dt;
            if (this.rageTimer <= 0) {
                this.damageReduction = 0;
                this.color = this.originalColor || 'orange'; // Revert color
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Heavy Swing (Slow, High Damage)
        // No mana cost? Or low? Let's make it free basic attack but slow.
        // Actually, let's stick to standard mana builder pattern if desired,
        // OR make it a builder.
        // "Slow attack but massive health".

        // Let's make it a Builder (0 cost)
        if (this.attackCooldown <= 0 && this.spendMana(0)) {
            const dir = this.facingDirection;
            // Large slow hitbox
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -60), // Reach 60
                this.y + 10,
                0, 0,
                this.tag,
                '#8B4513', // SaddleBrown
                15 * this.damageMultiplier, // High damage per hit
                'heavy_swing'
            );
            p.width = 60;
            p.height = 80;
            p.duration = 10; // Lasts longer (slow swing)

            // TODO: Add startup delay mechanism if we want to be fancy.
            // For now, instant huge hitbox.
            game.addProjectile(p);

            // Gain mana?
            // this.gainMana(10); // Standard builder

            this.attackCooldown = 0.8; // 0.8 second cooldown
        }
    }

    // Override onHit to gain mana on basic attacks
    onHit(target, damage) {
        // Barbarian gains mana by hitting things?
        this.gainMana(10);
    }

    ability2(game) {
        // Ultimate: Rage (Reduces damage)
        // Let's say cost 50?
        if (this.spendMana(50)) {
            this.damageReduction = 0.7; // 70% reduction!
            this.rageTimer = 5; // 5 Seconds

            // Visual flair
            this.originalColor = this.color;
            this.color = '#ff4400'; // Gloomy red

            console.log("Barbarian RAGE MODE ACTIVATED");
        }
    }
}
