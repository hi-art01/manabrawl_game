class Broker extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        // Stats
        this.maxHealth = 80;
        this.health = 80;
        this.maxMana = 100;
        this.mana = 0;
        this.speed = 5;
        this.damageMultiplier = 1;

        // Specialty
        this.dealerLevel = 1;
        this.maxDealerLevel = 12;
        this.manaRegenTimer = 0;

        // UI State
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Passive Mana Regen (5 per second)
        this.manaRegenTimer += dt;
        if (this.manaRegenTimer >= 1.0) {
            this.gainMana(5);
            this.manaRegenTimer = 0;
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(keys, game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Refine (Level Up)
        // Uses all current mana (must have at least 20)
        if (this.mana >= 20) {
            const levelsGained = Math.max(1, Math.floor(this.mana / 45));
            this.dealerLevel = Math.min(this.maxDealerLevel, this.dealerLevel + levelsGained);
            this.mana = 0; // Consume all mana
            console.log(`${this.tag} Leveled up! Level: ${this.dealerLevel}`);

            // Visual feedback
            const p = new Projectile(this.x, this.y, 0, 0, this.tag, 'lime', 0, 'level_up');
            p.width = this.width;
            p.height = this.height;
            p.duration = 10;
            game.addProjectile(p);
        }
    }

    getTransactionDamage(baseDamage, scale = 1) {
        const levelBonus = (this.dealerLevel - 1) * 12 * scale;
        const levelMultiplier = 1 + (this.dealerLevel - 1) * 0.16;
        return (baseDamage + levelBonus) * levelMultiplier * this.damageMultiplier;
    }

    ability2(keys, game) {
        // Transaction (Attack)
        const dir = this.facingDirection;

        if (keys.down) {
            // Melee Swipe: GAINS mana (Builder)
            this.gainMana(6 + this.dealerLevel * 3);

            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -40),
                this.y + 20,
                0, 0,
                this.tag,
                '#9932CC', // DarkOrchid
                this.getTransactionDamage(12, 0.85),
                'swipe'
            );
            p.width = 40;
            p.height = 60;
            p.duration = 8;
            game.addProjectile(p);
        } else {
            // Ranged Projectile: COSTS mana
            if (this.spendMana(10)) {
                const p = new Projectile(
                    this.x + (dir === 1 ? this.width : -20),
                    this.y + 30,
                    dir * 10,
                    0,
                    this.tag,
                    '#9932CC',
                    this.getTransactionDamage(8, 1),
                    'product'
                );
                p.width = 20;
                p.height = 20;
                game.addProjectile(p);
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Show Level above head
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${this.dealerLevel}`, this.x + this.width / 2, this.y - 10);
    }
}
