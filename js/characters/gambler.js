class Gambler extends Character {
    constructor(x, y, color) {
        super(x, y, color);

        this.maxHealth = 100;
        this.health = 100;
        this.maxMana = 100;
        this.mana = 20;
        this.speed = 6;
        this.damageMultiplier = 1;
        this.className = 'Gambler';
        this.spriteFlipped = false;

        this.baseStats = {
            width: this.width,
            height: this.height,
            maxHealth: this.maxHealth,
            maxMana: this.maxMana,
            speed: this.speed,
            damageMultiplier: this.damageMultiplier,
            jumpForce: this.jumpForce,
            spriteFlipped: this.spriteFlipped
        };

        this.currentClass = null;
        this.jackpotForm = null;
        this.jackpotTimer = 0;

        this.prevAttack1 = false;
        this.prevAttack2 = false;
    }

    update(keys, game, dt, platforms) {
        if (this.currentClass && this.jackpotForm) {
            this.jackpotTimer -= dt;
            if (this.jackpotTimer <= 0) {
                this.revertToGambler(true);
            } else {
                this.syncStateToForm();
                this.updateJackpotForm(keys, game, dt, platforms);
                this.syncStateFromForm();
                this.prevAttack1 = keys.attack1;
                this.prevAttack2 = keys.attack2;
                return;
            }
        }

        super.update(keys, game, dt, platforms);

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    transformToClass(className) {
        const TargetClass = charMap[className];
        if (!TargetClass || className === 'Gambler') return false;

        const transformed = new TargetClass(this.x, this.y, this.color);
        transformed.x = this.x;
        transformed.y = this.y;
        transformed.vx = this.vx;
        transformed.vy = this.vy;
        transformed.grounded = this.grounded;
        transformed.facingDirection = this.facingDirection;
        transformed.tag = this.tag;
        this.applyTalentEffectsToForm(transformed);
        transformed.infiniteManaTimer = this.infiniteManaTimer || 0;
        transformed.ultimateImmunityTimer = this.ultimateImmunityTimer || 0;
        transformed.gamblerJackpotTimer = this.gamblerJackpotTimer || 0;
        transformed.health = Math.min(this.health, transformed.maxHealth);
        transformed.mana = transformed.maxMana;

        this.currentClass = TargetClass;
        this.jackpotForm = transformed;
        this.jackpotTimer = 10;
        this.className = className;

        this.syncStateFromForm();
        return true;
    }

    applyTalentEffectsToForm(form) {
        if (!this.talentEffects) return;

        form.maxHealth += this.talentEffects.maxHealth || 0;
        form.maxMana += this.talentEffects.maxMana || 0;
        form.speed += this.talentEffects.speed || 0;
        form.jumpForce += this.talentEffects.jumpForce || 0;
        form.damageMultiplier += this.talentEffects.damageMultiplier || 0;
        form.dodgeChance += this.talentEffects.dodgeChance || 0;
        form.talentDamageReduction += this.talentEffects.damageReduction || 0;
        form.talentManaRegen += this.talentEffects.manaRegen || 0;
        form.talentLifeSteal += this.talentEffects.lifeSteal || 0;
        form.minimumAbilityCooldown = this.minimumAbilityCooldown;
        form.talentEffects = { ...this.talentEffects };
    }

    revertToGambler(refillMana = false) {
        const currentHealth = this.jackpotForm ? this.jackpotForm.health : this.health;
        const currentX = this.jackpotForm ? this.jackpotForm.x : this.x;
        const currentY = this.jackpotForm ? this.jackpotForm.y : this.y;
        const currentVx = this.jackpotForm ? this.jackpotForm.vx : this.vx;
        const currentVy = this.jackpotForm ? this.jackpotForm.vy : this.vy;
        const currentGrounded = this.jackpotForm ? this.jackpotForm.grounded : this.grounded;
        const currentFacing = this.jackpotForm ? this.jackpotForm.facingDirection : this.facingDirection;

        this.currentClass = null;
        this.jackpotForm = null;
        this.jackpotTimer = 0;
        this.className = 'Gambler';

        this.maxHealth = this.baseStats.maxHealth;
        this.maxMana = this.baseStats.maxMana;
        this.width = this.baseStats.width;
        this.height = this.baseStats.height;
        this.speed = this.baseStats.speed;
        this.damageMultiplier = this.baseStats.damageMultiplier;
        this.jumpForce = this.baseStats.jumpForce;
        this.spriteFlipped = this.baseStats.spriteFlipped;
        this.damageReduction = 0;
        this.immune = false;
        this.invulnerable = false;

        this.x = currentX;
        this.y = currentY;
        this.vx = currentVx;
        this.vy = currentVy;
        this.grounded = currentGrounded;
        this.facingDirection = currentFacing;
        this.health = Math.min(currentHealth, this.maxHealth);
        this.mana = refillMana ? this.maxMana : Math.min(this.mana, this.maxMana);

        this.loadSprite();
    }

    syncStateToForm() {
        if (!this.jackpotForm) return;

        this.jackpotForm.x = this.x;
        this.jackpotForm.y = this.y;
        this.jackpotForm.vx = this.vx;
        this.jackpotForm.vy = this.vy;
        this.jackpotForm.grounded = this.grounded;
        this.jackpotForm.tag = this.tag;
        this.jackpotForm.facingDirection = this.facingDirection;
        this.jackpotForm.health = this.health;
        this.jackpotForm.mana = this.mana;
        this.jackpotForm.infiniteManaTimer = this.infiniteManaTimer || 0;
        this.jackpotForm.ultimateImmunityTimer = this.ultimateImmunityTimer || 0;
        this.jackpotForm.gamblerJackpotTimer = this.gamblerJackpotTimer || 0;
    }

    updateJackpotForm(keys, game, dt, platforms) {
        if (!this.jackpotForm) return;

        const formName = this.className;
        const updateKeys = { ...keys, attack1: false, attack2: false };

        if (formName === 'Guardian') {
            updateKeys.attack1 = keys.attack1;
        }

        this.jackpotForm.prevAttack1 = this.prevAttack1;
        this.jackpotForm.prevAttack2 = this.prevAttack2;
        this.jackpotForm.update(updateKeys, game, dt, platforms);

        if (keys.attack1 && !this.prevAttack1) {
            if (formName === 'GravityMage') {
                this.jackpotForm.ability1(game);
            } else if (formName !== 'Guardian' && typeof this.jackpotForm.ability1 === 'function') {
                this.jackpotForm.ability1(game);
            }
        }

        if (keys.attack2 && !this.prevAttack2 && typeof this.jackpotForm.ability2 === 'function') {
            if (formName === 'Broker') {
                this.jackpotForm.ability2(keys, game);
            } else if (formName === 'GravityMage') {
                if (!this.jackpotForm.grounded) {
                    this.jackpotForm.ability2(game);
                }
            } else {
                this.jackpotForm.ability2(game);
            }
        }
    }

    syncStateFromForm() {
        if (!this.jackpotForm) return;

        this.x = this.jackpotForm.x;
        this.y = this.jackpotForm.y;
        this.width = this.jackpotForm.width;
        this.height = this.jackpotForm.height;
        this.vx = this.jackpotForm.vx;
        this.vy = this.jackpotForm.vy;
        this.grounded = this.jackpotForm.grounded;
        this.facingDirection = this.jackpotForm.facingDirection;
        this.health = this.jackpotForm.health;
        this.maxHealth = this.jackpotForm.maxHealth;
        this.mana = this.jackpotForm.mana;
        this.maxMana = this.jackpotForm.maxMana;
        this.speed = this.jackpotForm.speed;
        this.jumpForce = this.jackpotForm.jumpForce;
        this.damageMultiplier = this.jackpotForm.damageMultiplier;
        this.damageReduction = this.jackpotForm.damageReduction || 0;
        this.dodgeChance = this.jackpotForm.dodgeChance || 0;
        this.talentDamageReduction = this.jackpotForm.talentDamageReduction || 0;
        this.talentManaRegen = this.jackpotForm.talentManaRegen || 0;
        this.talentLifeSteal = this.jackpotForm.talentLifeSteal || 0;
        this.infiniteManaTimer = this.jackpotForm.infiniteManaTimer || 0;
        this.ultimateImmunityTimer = this.jackpotForm.ultimateImmunityTimer || 0;
        this.gamblerJackpotTimer = this.jackpotForm.gamblerJackpotTimer || 0;
        this.spriteFlipped = this.jackpotForm.spriteFlipped || false;
        this.image = this.jackpotForm.image;
    }

    takeDamage(amount) {
        if (this.currentClass && this.jackpotForm) {
            this.jackpotForm.takeDamage(amount);
            this.syncStateFromForm();
            return;
        }
        super.takeDamage(amount);
    }

    onHit(target, damage) {
        if (this.currentClass && this.jackpotForm && typeof this.jackpotForm.onHit === 'function') {
            this.jackpotForm.onHit(target, damage);
            this.syncStateFromForm();
        }
    }

    retrieveSpear() {
        if (this.currentClass && this.jackpotForm && typeof this.jackpotForm.retrieveSpear === 'function') {
            this.jackpotForm.retrieveSpear();
            this.syncStateFromForm();
        }
    }

    ability1(game) {
        if (this.currentClass) return;

        if (this.spendMana(30)) {
            const classes = Object.keys(charMap).filter(c => c !== 'Gambler');
            const randomClassName = classes[Math.floor(Math.random() * classes.length)];
            this.transformToClass(randomClassName);
        }
    }

    ability2(game) {
        if (this.currentClass) return;

        if (this.spendMana(10)) {
            if (Math.random() > 0.5) {
                const missingHealth = Math.max(0, this.maxHealth - this.health);
                if (missingHealth > 0) {
                    this.health += Math.floor(Math.random() * missingHealth) + 1;
                }
            } else {
                this.mana = Math.floor(Math.random() * this.maxMana) + 1;
            }
        }
    }

    draw(ctx) {
        if (this.currentClass && this.jackpotForm) {
            this.jackpotForm.draw(ctx);
        } else {
            super.draw(ctx);
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.className, this.x + this.width / 2, this.y - 10);

        if (this.currentClass && this.jackpotTimer > 0) {
            ctx.fillStyle = 'gold';
            ctx.fillRect(this.x, this.y - 5, (this.jackpotTimer / 10) * this.width, 3);
        }
    }
}
