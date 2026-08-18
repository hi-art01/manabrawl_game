class Duelist extends Character {
    constructor(x, y, color) {
        super(x, y, color);

        // Stats - Balanced but mana-hungry
        this.maxHealth = 90;
        this.health = 90;
        this.maxMana = 150;
        this.mana = 30;
        this.speed = 6;
        this.damageMultiplier = 1;

        // Duelist State
        this.hand = []; // Current cards in hand
        this.maxHandSize = 3;
        this.currentCard = null; // Currently selected card
        this.drawCooldown = 0;
        this.monsterActive = false;

        // Card Types
        this.cardPool = [
            { name: 'Dark Magician', type: 'monster', damage: 35, mana: 50, color: '#9B59B6', sprite: 'imges/dark_magician.png' },
            { name: 'Blue-Eyes', type: 'monster', damage: 40, mana: 80, color: '#3498DB', sprite: 'imges/blue-eyes.png' },
            { name: 'Kuriboh', type: 'trap', shield: true, mana: 20, color: '#8B4513', sprite: 'imges/kuriboh.png' },
            { name: 'Mirror Force', type: 'spell', reflect: true, mana: 40, color: '#FFD700' },
            { name: 'Pot of Greed', type: 'spell', draw: 2, mana: 10, color: '#2ECC71' },
            { name: 'Monster Reborn', type: 'spell', heal: 30, mana: 35, color: '#E74C3C' },
            { name: 'Exodia Piece', type: 'exodia', mana: 0, color: '#FFD700' }
        ];

        this.exodiaPieces = 0; // Collect 5 to win instantly

        this.prevAttack1 = false;
        this.prevAttack2 = false;
        this.spriteFlipped = false;

        // Start with some cards
        this.drawCard();
        this.drawCard();
    }

    useUltimate(game) {
        if (this.activeGodSummon && this.activeGodSummon.active) {
            const god = this.activeGodSummon;
            if (god.godType === 'obelisk') {
                if (this.hand.length >= 2) {
                    this.hand.splice(0, 2);
                    this.currentCard = this.hand[0] || null;
                    god.damageBoostTimer = 4;
                    if (god.performSoulEnergyMax) god.performSoulEnergyMax(game);
                    if (game.showAnnouncement) game.showAnnouncement('Obelisk: SOUL ENERGY MAX!', '#3b82f6');
                } else if (game.showAnnouncement) {
                    game.showAnnouncement('Obelisk needs 2 cards to tribute!', '#93c5fd');
                }
                return true; 
            } else if (god.godType === 'ra') {
                if (this.health > 15) {
                    const sacrifice = this.health - 15; 
                    this.health = 15;
                    god.raSacrificePower = (god.raSacrificePower || 0) + sacrifice * 2;
                    if (god.performPhoenixBurn) god.performPhoenixBurn(game, sacrifice);
                    if (game.showAnnouncement) game.showAnnouncement('Ra: POINT-TO-POINT TRANSFER!', '#facc15');
                } else if (game.showAnnouncement) {
                    game.showAnnouncement('Ra needs more Life Points!', '#facc15');
                }
                return true;
            } else if (god.godType === 'slifer') {
                if (this.drawCard()) {
                     if (god.performSecondMouth) god.performSecondMouth(game, this);
                     if (game.showAnnouncement) game.showAnnouncement('Slifer: Second Mouth!', '#ef4444');
                } else {
                     if (god.performSecondMouth) god.performSecondMouth(game, this);
                     if (game.showAnnouncement) game.showAnnouncement('Slifer: Hand Full Thunder!', '#ef4444');
                }
                return true;
            }
        }
        
        return super.useUltimate(game);
    }

    update(keys, game, dt, platforms) {
        super.update(keys, game, dt, platforms);

        // Mana regen (slow)
        this.gainMana(3 * dt);

        // Safety check: Ensure we have cards (fixes initialization issues)
        if (this.hand.length === 0 && this.drawCooldown <= 0) {
            console.log("Hand empty, forcing draw...");
            this.drawCard();
        }

        if (this.drawCooldown > 0) this.drawCooldown -= dt;

        if (keys.attack1 && !this.prevAttack1) this.ability1(game);
        if (keys.attack2 && !this.prevAttack2) this.ability2(game);

        this.prevAttack1 = keys.attack1;
        this.prevAttack2 = keys.attack2;
    }

    drawCard() {
        if (this.hand.length < this.maxHandSize) {
            const card = this.cardPool[Math.floor(Math.random() * this.cardPool.length)];
            this.hand.push({ ...card }); // Clone card
            console.log("Drew: " + card.name);
            return true;
        }
        return false;
    }

    ability1(game) {
        // Draw Phase - Draw a card OR cycle through hand
        if (this.drawCooldown > 0) return;

        if (this.hand.length === 0) {
            // Draw new card
            if (this.drawCard()) {
                this.drawCooldown = 0.5;
            }
        } else {
            // Cycle to next card in hand (select it)
            const currentIndex = this.currentCard ? this.hand.indexOf(this.currentCard) : -1;
            const nextIndex = (currentIndex + 1) % this.hand.length;
            this.currentCard = this.hand[nextIndex];
            console.log("Selected: " + this.currentCard.name);
            this.drawCooldown = 0.3;
        }
    }

    ability2(game) {
        // Play the selected card!
        if (!this.currentCard) {
            // Auto-select first card if none selected
            if (this.hand.length > 0) {
                this.currentCard = this.hand[0];
            } else {
                return; // No cards to play
            }
        }

        const card = this.currentCard;

        if (!this.spendMana(card.mana)) return;

        // Remove card from hand
        const idx = this.hand.indexOf(card);
        if (idx > -1) this.hand.splice(idx, 1);
        this.currentCard = this.hand.length > 0 ? this.hand[0] : null;

        const dir = this.facingDirection;

        // Handle different card types
        if (card.type === 'monster') {
            // Summon a monster projectile
            const p = new Projectile(
                this.x + (dir === 1 ? this.width : -80),
                this.y - 20,
                card.name === 'Dark Magician' ? 0 : dir * 8, // Dark Magician stays still
                0,
                this.tag,
                card.color,
                card.name === 'Dark Magician' ? 0 : card.damage * this.damageMultiplier, // Dark Magician doesn't do contact damage
                'monster_' + card.name
            );
            p.width = 75;
            p.height = 150;
            p.duration = card.name === 'Dark Magician' ? 300 : 120; // Dark Magician lasts longer

            // Load sprite for the monster
            if (card.sprite) {
                p.image = new Image();
                p.image.src = card.sprite;
            }

            // Give it custom behavior
            p.isMonster = true;
            p.timer = 0;
            p.facingDir = dir;
            p.attackCooldown = 0;
            p.ownerTag = this.tag;
            p.monsterName = card.name;
            p.monsterDamage = card.damage * this.damageMultiplier;

            p.update = function (dt, gameRef) {
                this.timer += dt;

                if (this.monsterName === 'Dark Magician') {
                    // Dark Magician: Ranged attacker - stays still and shoots
                    // Slight hover motion
                    this.y += Math.sin(this.timer * 3) * 0.3;

                    // Shoot projectiles periodically
                    this.attackCooldown -= dt;
                    if (this.attackCooldown <= 0 && gameRef) {
                        // Create magic attack projectile
                        const magicBolt = new Projectile(
                            this.x + (this.facingDir === 1 ? this.width : -20),
                            this.y + 50,
                            this.facingDir * 15, // Fast projectile
                            0,
                            this.ownerTag,
                            '#9B59B6', // Purple magic
                            this.monsterDamage,
                            'dark_magic'
                        );
                        magicBolt.width = 30;
                        magicBolt.height = 20;
                        magicBolt.duration = 60;
                        gameRef.addProjectile(magicBolt);

                        this.attackCooldown = 1.5; // Attack every 1.5 seconds
                    }
                } else {
                    // Blue-Eyes: Flying dragon behavior (like Necromancer's dragon)
                    // Find target
                    let target = (this.ownerTag === 'p1') ? gameRef.player2 : gameRef.player1;

                    // Hover above target
                    const hoverHeight = 150;
                    const targetY = target.y - hoverHeight;
                    const yDiff = targetY - this.y;
                    this.y += yDiff * 0.05; // Smooth hover

                    // Kiting AI: Stay at optimal range (250-400px)
                    const dist = target.x - this.x;
                    const dir = Math.sign(dist);
                    const absDist = Math.abs(dist);

                    if (absDist < 250) {
                        this.x -= dir * 3; // Flee
                        this.facingDir = -dir;
                    } else if (absDist > 400) {
                        this.x += dir * 3; // Approach
                        this.facingDir = dir;
                    }

                    // Shoot fireballs periodically
                    this.attackCooldown -= dt;
                    if (this.attackCooldown <= 0 && gameRef) {
                        const sourceX = this.x + this.width / 2;
                        const sourceY = this.y + this.height / 2;
                        const targetCenterX = target.x + target.width / 2;
                        const targetCenterY = target.y + target.height / 2;
                        const dx = targetCenterX - sourceX;
                        const dy = targetCenterY - sourceY;
                        const dist = Math.max(1, Math.hypot(dx, dy));
                        const speed = 14;
                        const vx = (dx / dist) * speed;
                        const vy = (dy / dist) * speed;
                        if (dx !== 0) this.facingDir = dx < 0 ? -1 : 1;

                        const fireball = new Projectile(
                            sourceX,
                            sourceY,
                            vx,
                            vy,
                            this.ownerTag,
                            '#3498DB', // Blue fire
                            this.monsterDamage,
                            'blue_fire'
                        );
                        fireball.width = 25;
                        fireball.height = 25;
                        fireball.duration = 60;
                        gameRef.addProjectile(fireball);

                        this.attackCooldown = 1.0; // Attack every 1 second
                    }
                }

                // Check bounds
                if (this.x < -100 || this.x > 1400) {
                    this.active = false;
                }
            };

            // Override draw to use sprite
            p.draw = function (ctx) {
                if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
                    ctx.save();
                    if (this.facingDir === -1) {
                        ctx.translate(this.x + this.width, this.y);
                        ctx.scale(-1, 1);
                        ctx.drawImage(this.image, 0, 0, this.width, this.height);
                    } else {
                        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                    }
                    ctx.restore();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            };

            game.addProjectile(p);
            console.log("Summoned " + card.name + "!");

        } else if (card.type === 'trap' && card.shield) {
            // Kuriboh - Brief invulnerability with sprite
            this.invulnerable = true;
            this.kuribohActive = true;

            // Load Kuriboh image for shield effect
            if (!this.kuribohImage) {
                this.kuribohImage = new Image();
                this.kuribohImage.src = card.sprite;
            }

            const self = this;
            setTimeout(() => {
                self.invulnerable = false;
                self.kuribohActive = false;
            }, 2000);
            console.log("Kuriboh shields you!");

        } else if (card.type === 'spell' && card.reflect) {
            // Mirror Force - Create a reflective barrier
            const p = new Projectile(
                this.x + (dir === 1 ? this.width + 20 : -80),
                this.y - 20,
                0, 0,
                this.tag,
                '#FFD700',
                25 * this.damageMultiplier,
                'mirror_force'
            );
            p.width = 60;
            p.height = 120;
            p.duration = 45;
            game.addProjectile(p);
            console.log("Mirror Force activated!");

        } else if (card.type === 'spell' && card.draw) {
            // Pot of Greed - Draw 2 cards
            this.drawCard();
            this.drawCard();
            console.log("Pot of Greed! Draw 2 cards!");

        } else if (card.type === 'spell' && card.heal) {
            // Monster Reborn - Heal
            this.heal(card.heal);
            console.log("Monster Reborn heals you!");

        } else if (card.type === 'exodia') {
            // Exodia piece collected!
            this.exodiaPieces++;
            console.log("Exodia piece! (" + this.exodiaPieces + "/5)");

            if (this.exodiaPieces >= 5) {
                // INSTANT WIN - Deal massive damage
                console.log("EXODIA OBLITERATE!");
                const obliterate = new Projectile(
                    this.x - 200,
                    0,
                    0, 0,
                    this.tag,
                    '#FFD700',
                    9999, // Instant kill
                    'exodia'
                );
                obliterate.width = 1600;
                obliterate.height = 900;
                obliterate.duration = 60;
                game.addProjectile(obliterate);
            }
        }

        // Draw a new card after playing
        this.drawCard();
    }

    takeDamage(amount) {
        if (this.invulnerable) {
            console.log("Blocked by Kuriboh!");
            return;
        }
        super.takeDamage(amount);
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Kuriboh shield if active
        if (this.kuribohActive && this.kuribohImage && this.kuribohImage.complete) {
            ctx.drawImage(this.kuribohImage, this.x - 10, this.y - 10, this.width + 20, this.height + 20);
        }

        // Draw hand indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';

        // Show current card name
        if (this.currentCard) {
            ctx.fillStyle = this.currentCard.color;
            ctx.fillText(this.currentCard.name, this.x + this.width / 2, this.y - 25);
        }

        // Show hand size
        ctx.fillStyle = 'white';
        ctx.fillText('Hand: ' + this.hand.length, this.x + this.width / 2, this.y - 10);

        // Exodia progress
        if (this.exodiaPieces > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('Exodia: ' + this.exodiaPieces + '/5', this.x + this.width / 2, this.y - 40);
        }

        // Draw card slots below character
        const slotWidth = 20;
        const startX = this.x + (this.width - (slotWidth * this.hand.length)) / 2;

        this.hand.forEach((card, i) => {
            const isSelected = card === this.currentCard;
            ctx.fillStyle = isSelected ? card.color : '#333';
            ctx.strokeStyle = card.color;
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.fillRect(startX + i * (slotWidth + 2), this.y + this.height + 5, slotWidth, 25);
            ctx.strokeRect(startX + i * (slotWidth + 2), this.y + this.height + 5, slotWidth, 25);
        });
    }
}
