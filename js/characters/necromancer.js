class Minion {
    constructor(x, y, owner, type) {
        this.x = x;
        this.y = y;
        this.owner = owner; // 'p1' or 'p2'
        this.type = type; // 'skeleton', 'golem'
        this.active = true;

        if (type === 'skeleton') {
            this.width = 45; // Increased from 30
            this.height = 75; // Increased from 50
            this.speed = 2;
            this.health = 30;
            this.color = 'white';
            this.damage = 10;
        } else {
            // Dragon (replaces Archer)
            this.width = 80; // Increased from 60
            this.height = 60; // Increased from 45
            this.speed = 3;
            this.health = 40;
            this.color = '#ff4500'; // OrangeRed
            this.damage = 12;
            this.isRanged = true;
            this.isFlying = true;
            this.shootTimer = 0;
            this.hoverHeight = 150; // Height above target
        }

        this.vy = 0;
        this.facingDirection = 1; // Track facing direction for sprite flipping

        // Load sprite
        this.image = new Image();
        if (type === 'skeleton') {
            this.image.src = 'imges/necmin.png';
        } else {
            this.image.src = 'imges/necrdrag.png';
        }
    }

    update(dt, game) {
        let target = (this.owner === 'p1') ? game.player2 : game.player1;
        const prevY = this.y;

        if (this.isFlying) {
            // Flying Physics: Hover above target
            const targetY = target.y - this.hoverHeight;
            const yDiff = targetY - this.y;
            this.vy = yDiff * 0.05; // Smooth hover
            this.y += this.vy;

            // Kiting AI: Stay far away
            let dist = target.x - this.x;
            let dir = Math.sign(dist);
            let absDist = Math.abs(dist);

            if (absDist < 250) {
                this.x -= dir * this.speed; // Flee
                this.facingDirection = -dir; // Face away from target
            } else if (absDist > 400) {
                this.x += dir * this.speed; // Approach
                this.facingDirection = dir; // Face toward target
            }
        } else {
            // Standard Ground Physics (Skeleton)
            this.vy += 1;
            this.y += this.vy;

            let dx = 0;
            if (target.x > this.x + 10) {
                dx = this.speed;
                this.facingDirection = 1; // Face right
            } else if (target.x < this.x - 10) {
                dx = -this.speed;
                this.facingDirection = -1; // Face left
            }
            this.x += dx;

            // Floor/Platform Collision
            let grounded = false;
            const floorY = game.floorY || 700;
            if (this.y + this.height >= floorY) {
                this.y = floorY - this.height;
                this.vy = 0;
                grounded = true;
            }

            if (game.platforms) {
                game.platforms.forEach(p => {
                    if (this.x + this.width > p.x && this.x < p.x + p.w) {
                        const prevFeet = prevY + this.height;
                        if (this.vy >= 0 && prevFeet <= p.y && this.y + this.height >= p.y) {
                            this.y = p.y - this.height;
                            this.vy = 0;
                            grounded = true;
                        }
                    }
                });
            }

            if (grounded && (target.y < this.y - 120)) {
                this.vy = -18;
            }
        }

        // Behavior: Shooting / Contact Damage
        if (this.isRanged) {
            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                const sourceX = this.x + this.width / 2;
                const sourceY = this.y + this.height / 2;
                const targetCenterX = target.x + target.width / 2;
                const targetCenterY = target.y + target.height / 2;
                const dx = targetCenterX - sourceX;
                const dy = targetCenterY - sourceY;
                const dist = Math.max(1, Math.hypot(dx, dy));
                const speed = 12;
                const vx = (dx / dist) * speed;
                const vy = (dy / dist) * speed;
                if (dx !== 0) this.facingDirection = dx < 0 ? -1 : 1;

                const p = new Projectile(
                    sourceX,
                    sourceY,
                    vx,
                    vy,
                    this.owner,
                    '#ff4500', // Fireball color
                    this.damage,
                    'fireball'
                );
                p.width = 15;
                p.height = 15;
                game.addProjectile(p);
                this.shootTimer = 1.2; // Fast fire rate
            }
        } else {
            if (this.x < target.x + target.width &&
                this.x + this.width > target.x &&
                this.y < target.y + target.height &&
                this.y + this.height > target.y) {
                if (!this.attackTimer) this.attackTimer = 0;
                this.attackTimer -= dt;
                if (this.attackTimer <= 0) {
                    const damage = game.scaleDamageForSpeed ? game.scaleDamageForSpeed(this.damage, this.owner) : this.damage;
                    target.takeDamage(damage);
                    this.attackTimer = 1.0;
                }
            }
        }

        this.health -= 5 * dt;
        if (this.health <= 0) this.die(game);
    }

    die(game) {
        this.active = false;
        // Owner gains mana
        let ownerObj = (this.owner === 'p1') ? game.player1 : game.player2;
        if (ownerObj.gainMana && ownerObj.constructor.name === "Necromancer") {
            ownerObj.gainMana(20); // Big refund
        }
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
            ctx.save();
            if (this.facingDirection === 1) {
                // Flip horizontally when facing right (sprites natively face left)
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.image, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // Fallback to rectangle
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Necromancer extends Character {
    constructor(x, y, color) {
        super(x, y, color);
        // Stats
        this.maxHealth = 80; // Squishy
        this.health = 80;
        this.maxMana = 100;
        this.mana = 100; // Starts at max
        this.speed = 4;
        this.damageMultiplier = 1;

        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = true;
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Slow Passive Mana Regen (2 mana per second)
        this.manaTimer = (this.manaTimer || 0) + dt;
        if (this.manaTimer >= 1.0) {
            this.gainMana(2);
            this.manaTimer = 0;
        }

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    ability1(game) {
        // Summon Skeleton (Small, Cheap)
        if (this.spendMana(20)) {
            const dir = this.facingDirection;
            const m = new Minion(
                this.x + (dir * 40),
                this.y,
                this.tag,
                'skeleton'
            );
            game.minions.push(m);
        }
    }

    ability2(game) {
        // Summon Dragon (Flying ranged)
        if (this.spendMana(60)) {
            const dir = this.facingDirection;
            const m = new Minion(
                this.x + (dir * 50),
                this.y - 100, // Spawn higher up
                this.tag,
                'dragon'
            );
            game.minions.push(m);
        }
    }
}
