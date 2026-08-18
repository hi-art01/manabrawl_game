class Turret {
    constructor(x, y, owner, target) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.owner = owner;
        this.target = target;
        this.facingDirection = target && target.x < x ? -1 : 1;
        this.active = true;
        this.health = 50;
        this.fireTimer = 0;
        this.fireRate = 1.0; // Seconds between shots
        this.color = '#7f8c8d'; // Gray metallic
        this.duration = 600; // 10 seconds at 60fps? No, dt-based. Let's use 10 seconds.
        this.lifeTimer = 10.0;
    }

    update(dt, game) {
        this.lifeTimer -= dt;
        if (this.lifeTimer <= 0) this.active = false;

        this.fireTimer += dt;
        if (this.fireTimer >= this.fireRate) {
            this.fire(game);
            this.fireTimer = 0;
        }

        // Turret takes damage if hit? For now, let's just make it timed.
    }

    fire(game) {
        const speed = 8;
        const sourceX = this.x + this.width / 2;
        const sourceY = this.y + this.height / 2;
        const targetX = this.target ? this.target.x + this.target.width / 2 : sourceX + this.facingDirection * 200;
        const targetY = this.target ? this.target.y + this.target.height / 2 : sourceY;
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        if (dx !== 0) this.facingDirection = dx < 0 ? -1 : 1;

        const p = new Projectile(
            sourceX - 5,
            sourceY - 5,
            vx,
            vy,
            this.owner,
            '#f1c40f', // yellow
            10,
            'bullet'
        );
        p.width = 10;
        p.height = 10;
        game.addProjectile(p);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Base
        ctx.fillRect(this.x, this.y + 20, this.width, 20);
        // Head
        ctx.fillRect(this.x + 10, this.y, 20, 25);

        // Cannon (fixed when placed)
        let angle = this.facingDirection === 1 ? 0 : Math.PI;
        if (this.target) {
            const sourceX = this.x + this.width / 2;
            const sourceY = this.y + 12;
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;
            angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        }

        ctx.save();
        ctx.translate(this.x + 20, this.y + 12);
        ctx.rotate(angle);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, -5, 25, 10);
        ctx.restore();

        // Timer bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x, this.y - 10, this.width, 4);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(this.x, this.y - 10, this.width * (this.lifeTimer / 10.0), 4);
    }
}

class Alchemist extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        this.maxMana = 100;
        this.mana = 40;
        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Passive Mana Regen (5 per second)
        this.gainMana(5 * dt);

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Deploy Turret
        if (this.spendMana(50)) {
            const target = (this.tag === 'p1') ? game.player2 : game.player1;
            const turret = new Turret(this.x, this.y + this.height - 40, this.tag, target);
            game.minions.push(turret);
            console.log("Alchemist deployed turret!");
        }
    }

    ability2(game) {
        // Acid Blast
        if (this.spendMana(20)) {
            const dir = this.facingDirection;
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -30),
                this.y + 30,
                dir * 10,
                0,
                this.tag,
                '#2ecc71', // Emerald green
                15,
                'acid'
            );
            p.width = 30;
            p.height = 15;
            game.addProjectile(p);
        }
    }
}
