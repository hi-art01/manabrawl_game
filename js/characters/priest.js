class Priest extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxMana = 60;
        this.mana = 50;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Passive Mana Regen
        this.gainMana(10 * dt); // 10 mana per second

        // Abilities
        if (keys.attack1 && !this.prevAttack1) {
            this.ability1(game);
        }
        if (keys.attack2 && !this.prevAttack2) {
            this.ability2(game);
        }

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Heal
        if (this.spendMana(40)) {
            this.heal(30);
            // Visual effect could be added here
            console.log("Priest Healed");
        }
    }

    ability2(game) {
        // Light Beam
        if (this.spendMana(20)) {
            let dir = this.facingDirection;
            // If facing logic existed, use that. For now, P1 shoots right, P2 shoots left?
            // Simple assumption based on start pos.
            // Better: use movement direction or target direction.
            // We'll assume P1 is on left, P2 on right for simple logic, standard fighter.

            game.addProjectile(new Projectile(
                this.x + (dir === 1 ? this.width : 0),
                this.y + 20,
                dir * 10,
                0,
                this.tag,
                'yellow',
                15,
                'light'
            ));
        }
    }
}
