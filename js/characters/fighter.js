class Fighter extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxMana = 60;
        this.mana = 0;
        this.comboCount = 0;
        this.lastAttackTime = 0;
        this.attackCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Reset combo if too slow (1 second window)
        if (Date.now() - this.lastAttackTime > 1000 && this.comboCount > 0) {
            this.comboCount = 0;
            console.log("Combo Reset");
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Shoot (Rapid Fire)
        if (this.attackCooldown > 0) return;

        this.comboCount++;
        this.lastAttackTime = Date.now();
        this.attackCooldown = 0.4; // Slightly faster fire rate

        const dir = this.facingDirection;
        const xPos = this.x + (dir === 1 ? this.width : 0);
        const yPos = this.y + 40;

        if (this.comboCount >= 3) {
            // Special: High Velocity Tracer (Mana Steal)
            game.addProjectile(new Projectile(
                xPos, yPos,
                dir * 20,
                0,
                this.tag,
                '#3498db', // Bright Blue Tracer
                20,
                'steal'
            ));
            this.comboCount = 0;
            console.log("Tracer Shot!");
        } else {
            // Normal Shot
            game.addProjectile(new Projectile(
                xPos, yPos,
                dir * 18,
                0,
                this.tag,
                '#f1c40f', // Yellow bullet
                8,
                'normal'
            ));
            console.log("Shoot!");
        }
    }

    ability2(game) {
        // Rapid Fire (3-shot burst)
        if (this.spendMana(30)) {
            const dir = this.facingDirection;
            const xPos = this.x + (dir === 1 ? this.width : 0);
            const yPos = this.y + 40;

            // Fire 3 shots in quick succession
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (this.health > 0) { // Only fire if still alive
                        const bullet = new Projectile(
                            xPos, yPos,
                            dir * 20,
                            0,
                            this.tag,
                            '#e74c3c', // Red bullet
                            15,
                            'normal'
                        );
                        bullet.width = 12;
                        bullet.height = 8;
                        game.addProjectile(bullet);
                    }
                }, i * 100); // 100ms delay between shots
            }
            console.log("Rapid Fire!");
        }
    }
}
