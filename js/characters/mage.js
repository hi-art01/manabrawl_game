class Mage extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxMana = 300; // High start
        this.mana = 300;    // Starts full
        this.novaCooldown = 0;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        if (this.novaCooldown > 0) {
            this.novaCooldown -= dt;
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Ice Shard
        if (this.spendMana(10)) {
            const dir = this.facingDirection;
            game.addProjectile(new Projectile(
                this.x + (dir === 1 ? this.width : 0),
                this.y + 10,
                dir * 12,
                0,
                this.tag,
                'cyan',
                15,
                'ice'
            ));
        }
    }

    ability2(game) {
        // Lightning Nova (Radial Area)
        if (this.novaCooldown <= 0 && this.spendMana(50)) {
            this.novaCooldown = 5.0; // 5 second cooldown
            // Visual / Logic specific construction
            // We use the projectile system but make it a static, short-lived large box
            const size = 300;
            const p = new Projectile(
                this.x + this.width / 2 - size / 2,
                this.y + this.height / 2 - size / 2,
                0,
                0,
                this.tag,
                'rgba(150, 50, 255, 0.5)', // Semi-transparent purple
                30,
                'nova'
            );
            p.width = size;
            p.height = size;
            p.activeTime = 10; // Frames? Or integrate checks

            // Custom lifetime hack or just rely on it flying out of bounds if we gave it speed?
            // Since speed is 0, we need a lifetime mechanism or hack it.
            // Let's give it a tiny velocity so it doesn't get culled instantly but maybe add a lifetime to Projectile if needed.
            // For now, let's make it move extremely slowly up so it eventually disappears or add lifetime logic.
            // Actually, `game.js` culls if out of bounds. 0 speed means it stays forever.
            // Let's add lifetime support to Projectile or just move it offscreen eventually?
            // Better: update Mage.js to handle it?

            // Let's modify Projectile class slightly if possible, or just hack it:
            // Give it 0.001 speed so it technically moves? No, that doesn't help removal.
            // Re-use logic: let's shoot it UP fast but make it huge so it hits instantly?
            // No, user wants area around him.

            // Let's just create 2 projectiles flying left/right large?
            // "Just all around him"

            // I'll create a static projectile and I will add a lifetime property to Projectile class separately 
            // OR I will assume I can edit Projectile.js. I'll do that next.

            p.duration = 20; // 20 frames
            game.addProjectile(p);
        }
    }
}
