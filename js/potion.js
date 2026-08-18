class Potion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vy = 0;
        this.active = true;
        this.color = '#38bdf8';
    }

    update(dt, game) {
        // Gravity
        this.vy += (game && game.gravityMultiplier ? game.gravityMultiplier : 1) * 0.5;
        const prevY = this.y;
        this.y += this.vy;

        // Collision with floor
        const floorY = game.floorY || 700;
        if (this.y + this.height >= floorY) {
            this.y = floorY - this.height;
            this.vy = 0;
        }

        // Collision with platforms
        if (game.platforms) {
            game.platforms.forEach(p => {
                if (this.x + this.width > p.x && this.x < p.x + p.w) {
                    const prevFeet = prevY + this.height;
                    if (this.vy >= 0 && prevFeet <= p.y && this.y + this.height >= p.y) {
                        this.y = p.y - this.height;
                        this.vy = 0;
                    }
                }
            });
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(this.x + 6, this.y + 2, this.width - 12, this.height - 4);

        ctx.fillStyle = '#dbeafe';
        ctx.fillRect(this.x + 9, this.y, this.width - 18, 8);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 4, this.y + 9, this.width - 8, this.height - 11);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(this.x + 8, this.y + 13, 5, this.height - 18);

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 4, this.y + 9, this.width - 8, this.height - 11);
        ctx.strokeRect(this.x + 9, this.y, this.width - 18, 8);

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class UltimateOrb extends Potion {
    constructor(x, y) {
        super(x, y);
        this.width = 34;
        this.height = 34;
        this.color = '#facc15';
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff7ae';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i + Math.PI / 4;
            const inner = 8;
            const outer = 16;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2 + Math.cos(angle) * inner, this.y + this.height / 2 + Math.sin(angle) * inner);
            ctx.lineTo(this.x + this.width / 2 + Math.cos(angle) * outer, this.y + this.height / 2 + Math.sin(angle) * outer);
            ctx.stroke();
        }

        ctx.restore();
    }
}
