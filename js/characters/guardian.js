class Guardian extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxHealth = 150; // Tankier
        this.health = 150;
        this.maxMana = 80;
        this.mana = 20;

        this.isBlocking = false;
        this.isDashing = false;
        this.dashTimer = 0;

        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
        this.manaRegenTimer = 0; // For passive mana regen
    }

    takeDamage(amount) {
        if (this.isBlocking) {
            const reducedDamage = amount * (1 - this.damageReduction);
            const blockedAmount = amount - reducedDamage;
            // Gain mana proportional to blocked damage (e.g., 50%)
            this.gainMana(blockedAmount * 0.5);
            super.takeDamage(reducedDamage);
        } else {
            super.takeDamage(amount);
        }
    }

    update(keys, game, dt, platforms) {
        // Passive Mana Regen (very slow - 2 mana per second)
        this.manaRegenTimer += dt;
        if (this.manaRegenTimer >= 1.0) {
            this.gainMana(2);
            this.manaRegenTimer = 0;
        }

        // Reset states
        this.isBlocking = false;
        this.damageReduction = 0;

        // Ability 1: Shield Block (Hold F)
        if (keys.attack1) {
            if (this.mana > 0) {
                this.isBlocking = true;
                this.damageReduction = 0.9; // 90% reduction
                this.mana -= 10 * dt; // Drain mana while blocking
                if (this.mana < 0) this.mana = 0;
            }
        }

        // Ability 2: Shield Dash (Press G)
        if (keys.attack2 && !this.prevAttack2) {
            this.ability2(game);
        }

        // Handle teleport dash visual/damage logic here if needed, 
        // but ability2 will handle the movement.

        // If blocking, reduce movement speed
        const originalSpeed = this.speed;
        if (this.isBlocking) this.speed = 2;

        super.update(keys, game, dt, platforms);

        this.speed = originalSpeed; // Restore

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability2(game) {
        // Dash (Teleport-style like Sniper)
        const dashDistance = 250;
        const dir = this.facingDirection;
        const startX = this.x;
        const worldWidth = game && game.width ? game.width : 1200;
        const endX = Math.max(0, Math.min(worldWidth - this.width, startX + dir * dashDistance));

        if (endX === startX) return;

        if (this.spendMana(30)) {
            // Visual trail at OLD position
            const trail1 = new Projectile(this.x, this.y, 0, 0, this.tag, 'rgba(241, 196, 15, 0.5)', 0, 'dash_trail');
            trail1.width = this.width;
            trail1.height = this.height;
            trail1.duration = 15;
            game.addProjectile(trail1);

            // Damage along the path
            this.checkDashPathHit(game, startX, endX);

            this.x = endX;

            // Visual trail at NEW position
            const trail2 = new Projectile(this.x, this.y, 0, 0, this.tag, '#f1c40f', 0, 'dash_trail');
            trail2.width = this.width;
            trail2.height = this.height;
            trail2.duration = 10;
            game.addProjectile(trail2);

            console.log("Guardian Shield Teleport Dash!");
        }
    }

    checkDashPathHit(game, startX, endX) {
        const target = (this.tag === 'p1') ? game.player2 : game.player1;
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX) + this.width;
        const overlapsVertically = target.y < this.y + this.height && target.y + target.height > this.y;
        const overlapsHorizontally = target.x < maxX && target.x + target.width > minX;

        // Check if target is within the horizontal range of the dash path
        // and vertically aligned with the Guardian
        if (overlapsHorizontally && overlapsVertically) {
            const damage = game.scaleDamageForSpeed ? game.scaleDamageForSpeed(40, this.tag) : 40;
            target.takeDamage(damage);
            target.x += this.facingDirection * 35;
            target.vx = this.facingDirection * 15; // Strong knockback
        }
    }
    draw(ctx) {
        super.draw(ctx);

        // Draw Shield
        ctx.fillStyle = this.isBlocking ? '#f1c40f' : '#95a5a6';
        const shieldX = (this.facingDirection === 1) ? this.x + this.width - 5 : this.x - 5;
        ctx.fillRect(shieldX, this.y + 20, 10, 60);

        if (this.isBlocking) {
            // Visual glow for block
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
    }
}
