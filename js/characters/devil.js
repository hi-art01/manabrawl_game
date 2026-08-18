class Devil extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxMana = 60;
        this.mana = 0; // Start empty again
        this.pactCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.damageMultiplier = 1;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        if (this.pactCooldown > 0) {
            this.pactCooldown -= dt;
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    onHit(target, damage) {
        // Gain mana on dealing damage
        this.gainMana(15);
    }

    ability1(game) {
        // Shadow Claw (Melee)
        if (this.spendMana(0)) {
            let dir = this.facingDirection;

            // Create a short-lived, short-range projectile to act as a melee hitbox
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -40), // Offset for melee range
                this.y + 20,
                0, // No independent movement
                0,
                this.tag,
                '#400000', // Dark Red
                4 * this.damageMultiplier,
                'claw'
            );
            p.width = 40;
            p.height = 60;
            p.duration = 5; // Very short duration (5 frames)

            // We need to manually move it with the player if we wanted true attached melee, 
            // but for now a static hitbox that appears in front is fine for a "swipe".
            // Since speed is 0, it stays in place.

            // Custom update to make it move with player? 
            // The game engine simple projectile doesn't tracking owners. 
            // A static burst in front is acceptable for "Melee".

            game.addProjectile(p);
        }
    }

    ability2(game) {
        // Dark Pact: Permanent Damage Boost
        if (this.pactCooldown <= 0 && this.spendMana(50)) {
            this.pactCooldown = 10.0; // 10 second cooldown
            this.damageMultiplier += 0.5;
            this.takeDamage(10); // Sacrifice health? "devil" theme.
            console.log("Devil Dark Pact: Damage Multiplier is now " + this.damageMultiplier);
        }
    }
}
