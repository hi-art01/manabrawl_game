const ProjectileSpriteCache = {};
const ProjectileSpriteMap = {
    hakoware_marker: 'imges/apr.png',
    hakoware_bankruptcy: 'imges/nenblockingversionofapr.png'
};

function getProjectileSprite(src) {
    if (typeof Image === 'undefined') return null;
    if (!ProjectileSpriteCache[src]) {
        const image = new Image();
        image.src = src;
        ProjectileSpriteCache[src] = image;
    }
    return ProjectileSpriteCache[src];
}

class Projectile {
    constructor(x, y, vx, vy, owner, color, damage, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner; // 'p1' or 'p2'
        this.width = 20;
        this.height = 20;
        this.color = color;
        this.damage = damage;
        this.type = type; // 'normal', 'steal', etc.
        this.active = true;
        this.timer = 0;
    }

    update(dt, game) {
        if (this.homingTarget && this.homingTarget.health > 0) {
            const sourceX = this.x + this.width / 2;
            const sourceY = this.y + this.height / 2;
            const targetX = this.homingTarget.x + this.homingTarget.width / 2;
            const targetY = this.homingTarget.y + this.homingTarget.height / 2;
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const speed = this.homingSpeed || Math.max(1, Math.hypot(this.vx, this.vy));
            const turnRate = this.homingTurnRate || 0.08;

            this.vx += ((dx / dist) * speed - this.vx) * turnRate;
            this.vy += ((dy / dist) * speed - this.vy) * turnRate;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.timer += dt || 0.016; // approx 60fps

        if (this.duration) {
            this.duration--;
            if (this.duration <= 0) {
                this.active = false;
                if (this.onEnd) this.onEnd();
            }
        }

        // Out of bounds
        const w = game ? game.width : 1200;
        const h = game ? game.height : 800;
        if (this.x < -200 || this.x > w + 200 || this.y < -200 || this.y > h + 200) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const spriteSrc = ProjectileSpriteMap[this.type];
        if (spriteSrc) {
            const sprite = getProjectileSprite(spriteSrc);
            if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
                ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();
                return;
            }
        }
        
        // Custom Drawing logic based on type
        if (this.type === 'roulette_wheel') {
            ctx.rotate(this.timer * 15);
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, this.width/2, i * Math.PI/4, (i+1) * Math.PI/4);
                ctx.fillStyle = i === 0 ? '#22c55e' : (i % 2 === 0 ? '#111827' : '#ef4444');
                ctx.fill();
                ctx.stroke();
            }
            // Inner circle
            ctx.beginPath();
            ctx.arc(0, 0, this.width/6, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();
            ctx.restore();
            return;
        }
        
        if (this.type === 'holy_beam' || this.type === 'divine_sanctuary') {
            ctx.rotate(this.timer * 2);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/6, this.width, this.height/3);
            ctx.fillRect(-this.width/6, -this.height/2, this.width/3, this.height);
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.width/1.5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'hell_claw' || this.type === 'hellfire') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(-this.width/2, this.height/2);
            ctx.lineTo(this.width/2, -this.height/2);
            ctx.lineTo(this.width/4, this.height/2);
            ctx.lineTo(this.width/2, this.height);
            ctx.lineTo(-this.width/4, 0);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'phalanx_spear') {
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.fillStyle = '#78350f'; // wood shaft
            ctx.fillRect(-this.width/2, -this.height/4, this.width, this.height/2);
            ctx.fillStyle = '#cbd5e1'; // metal tip
            ctx.beginPath();
            ctx.moveTo(this.width/2, -this.height/2);
            ctx.lineTo(this.width/2 + this.width/4, 0);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'grave_legion') {
            ctx.fillStyle = '#e2e8f0'; // skull
            ctx.globalAlpha = 0.8 + Math.sin(this.timer * 10) * 0.2;
            ctx.beginPath();
            ctx.arc(0, -this.height/8, this.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(-this.width/4, 0, this.width/2, this.height/2);
            ctx.fillStyle = '#0f172a'; // eyes
            ctx.beginPath();
            ctx.arc(-this.width/6, -this.height/6, this.width/8, 0, Math.PI*2);
            ctx.arc(this.width/6, -this.height/6, this.width/8, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'broker_syringe') {
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-this.width/2, -this.height/2, this.width*0.7, this.height);
            ctx.fillStyle = '#22c55e'; // green liquid
            ctx.fillRect(-this.width/2, -this.height/2, this.width*0.4, this.height);
            ctx.fillStyle = '#94a3b8'; // needle
            ctx.fillRect(this.width*0.2, -this.height/8, this.width*0.5, this.height/4);
            ctx.restore();
            return;
        }

        if (this.type === 'market_crash') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(-this.width/4, -this.height/2);
            ctx.lineTo(this.width/4, -this.height/2);
            ctx.lineTo(this.width/4, 0);
            ctx.lineTo(this.width/2, 0);
            ctx.lineTo(0, this.height/2);
            ctx.lineTo(-this.width/2, 0);
            ctx.lineTo(-this.width/4, 0);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'aegis_nova') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(-this.width/2, -this.height/2);
            ctx.lineTo(this.width/2, -this.height/2);
            ctx.lineTo(this.width/2, 0);
            ctx.bezierCurveTo(this.width/2, this.height/2, 0, this.height, 0, this.height);
            ctx.bezierCurveTo(0, this.height, -this.width/2, this.height/2, -this.width/2, 0);
            ctx.fill();
            
            // Inner highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2 + 10);
            ctx.lineTo(0, this.height - 10);
            ctx.lineTo(this.width/2 - 10, 0);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'singularity') {
            ctx.rotate(this.timer * -8);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, this.width/4, 0, Math.PI*2);
            ctx.fill();
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            for(let i=0; i<3; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.width/2, this.height/8, i * Math.PI/3, 0, Math.PI*2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'earthbreaker') {
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(-this.width/2, this.height/2);
            ctx.lineTo(-this.width/4, -this.height/2);
            ctx.lineTo(0, this.height/4);
            ctx.lineTo(this.width/4, -this.height/3);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.fill();
            ctx.restore();
            return;
        }
        
        if (this.type === 'jackpot_star') {
            ctx.rotate(this.timer * 5);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*this.width/2, -Math.sin((18+i*72)/180*Math.PI)*this.height/2);
                ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*this.width/4, -Math.sin((54+i*72)/180*Math.PI)*this.height/4);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'minefield_blast' || this.type === 'smoke_bomb') {
            ctx.fillStyle = this.type === 'smoke_bomb' ? '#94a3b8' : '#ef4444';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                ctx.arc(Math.cos(i*Math.PI/4) * this.width/3, Math.sin(i*Math.PI/4) * this.height/3, this.width/4, 0, Math.PI*2);
            }
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'slifer_lightning_column' || this.type === 'slifer_thunder_force') {
            ctx.fillStyle = 'rgba(127, 29, 29, 0.24)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#fee2e2';
            ctx.lineWidth = Math.max(4, this.width * 0.18);
            ctx.beginPath();
            for (let i = 0; i <= 9; i++) {
                const y = -this.height / 2 + (this.height / 9) * i;
                const x = Math.sin(this.timer * 24 + i * 1.7) * this.width * 0.45;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = Math.max(2, this.width * 0.09);
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'obelisk_stone_burst' || this.type === 'obelisk_fist_of_fate') {
            const boosted = this.width > 100;
            ctx.rotate(Math.sin(this.timer * 12) * 0.12);
            ctx.fillStyle = this.type === 'obelisk_fist_of_fate' ? 'rgba(37, 99, 235, 0.36)' : 'rgba(59, 130, 246, 0.25)';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.72, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = boosted ? '#1d4ed8' : '#2563eb';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = Math.max(4, this.width * 0.07);
            ctx.beginPath();
            ctx.moveTo(-this.width * 0.42, -this.height * 0.08);
            ctx.lineTo(-this.width * 0.24, -this.height * 0.42);
            ctx.lineTo(this.width * 0.04, -this.height * 0.36);
            ctx.lineTo(this.width * 0.28, -this.height * 0.42);
            ctx.lineTo(this.width * 0.46, -this.height * 0.1);
            ctx.lineTo(this.width * 0.36, this.height * 0.38);
            ctx.lineTo(-this.width * 0.34, this.height * 0.38);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#93c5fd';
            ctx.fillRect(-this.width * 0.28, -this.height * 0.1, this.width * 0.18, this.height * 0.16);
            ctx.fillRect(0, -this.height * 0.16, this.width * 0.18, this.height * 0.16);
            ctx.restore();
            return;
        }

        if (this.type === 'obelisk_ground_shatter') {
            ctx.fillStyle = 'rgba(37, 99, 235, 0.22)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 4;
            for (let i = 0; i < 7; i++) {
                const x = -this.width / 2 + (this.width / 6) * i;
                ctx.beginPath();
                ctx.moveTo(x, this.height / 2);
                ctx.lineTo(x + 18, 4);
                ctx.lineTo(x + 42, this.height / 2 - 6);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'ra_solar_sphere') {
            ctx.rotate(this.timer * 8);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
            for (let i = 0; i < 12; i++) {
                ctx.rotate(Math.PI / 6);
                ctx.fillRect(-this.width * 0.08, -this.height * 0.82, this.width * 0.16, this.height * 0.34);
            }
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.46, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff7ed';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'ra_blaze_cannon' || this.type === 'ra_phoenix_mode') {
            ctx.fillStyle = 'rgba(251, 146, 60, 0.28)';
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(0, -this.height * 0.46);
            ctx.lineTo(this.width * 0.22, -this.height * 0.08);
            ctx.lineTo(this.width * 0.48, -this.height * 0.22);
            ctx.lineTo(this.width * 0.24, this.height * 0.12);
            ctx.lineTo(this.width * 0.36, this.height * 0.44);
            ctx.lineTo(0, this.height * 0.22);
            ctx.lineTo(-this.width * 0.36, this.height * 0.44);
            ctx.lineTo(-this.width * 0.24, this.height * 0.12);
            ctx.lineTo(-this.width * 0.48, -this.height * 0.22);
            ctx.lineTo(-this.width * 0.22, -this.height * 0.08);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
            return;
        }

        const animeSlashTypes = [
            'anime_slash', 'sukuna_slash', 'shrine_cut', 'flame_sword', 'sun_slash',
            'lancer_thrust', 'rider_dagger', 'rule_breaker', 'shadow_clone',
            'katana_slash', 'counter_cut', 'cursed_blade', 'axe_smash',
            'leap_slam', 'knuckle_punch', 'chariot_charge', 'bellerophon_charge',
            'sinbad_sword', 'baal_lightning_sword', 'focalor_wind_blade',
            'sword_of_extermination'
        ];
        if (animeSlashTypes.includes(this.type)) {
            const drawDirection = this.drawDirection || (this.vx < 0 ? -1 : 1);
            if (drawDirection === -1) ctx.scale(-1, 1);
            ctx.rotate(Math.atan2(this.vy || 0, Math.abs(this.vx || 1)) * 0.18);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, -this.height * 0.05);
            ctx.quadraticCurveTo(0, -this.height * 0.62, this.width / 2, -this.height * 0.1);
            ctx.quadraticCurveTo(this.width * 0.18, this.height * 0.18, -this.width / 2, this.height * 0.42);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.68;
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'gojo_blue') {
            ctx.rotate(this.timer * -4);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.38)';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.78, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#dbeafe';
            ctx.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.width * 0.72, this.height * 0.22, i * Math.PI / 3, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'gojo_red') {
            ctx.rotate(this.timer * 5);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.34)';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.38, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fee2e2';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'gojo_purple') {
            ctx.rotate(this.timer * 2);
            const radius = Math.max(this.width, this.height) / 2;
            ctx.fillStyle = 'rgba(88, 28, 135, 0.52)';
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f0abfc';
            ctx.lineWidth = 5;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * 0.95, radius * 0.22, i * Math.PI / 4, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'unlimited_void') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 3;
            for (let i = 0; i < 12; i++) {
                ctx.beginPath();
                ctx.arc(Math.sin(this.timer * 2 + i) * this.width * 0.35, Math.cos(this.timer * 3 + i) * this.height * 0.32, 10 + (i % 3) * 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'fuga_arrow' || this.type === 'amon_flame' || this.type === 'amon_inferno' || this.type === 'cruel_sun' || this.type === 'the_one_sun') {
            ctx.rotate(Math.atan2(this.vy || 0, this.vx || 1));
            ctx.fillStyle = 'rgba(251, 146, 60, 0.32)';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(this.width, this.height) * 0.62, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, 0);
            ctx.quadraticCurveTo(-this.width * 0.1, -this.height * 0.62, this.width / 2, 0);
            ctx.quadraticCurveTo(-this.width * 0.1, this.height * 0.62, -this.width / 2, 0);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(this.width * 0.1, 0, Math.min(this.width, this.height) * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'malevolent_shrine') {
            ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 4;
            for (let i = 0; i < 7; i++) {
                const x = -this.width / 2 + i * this.width / 6;
                ctx.beginPath();
                ctx.moveTo(x, -this.height / 2);
                ctx.lineTo(x + Math.sin(this.timer * 8 + i) * 45, this.height / 2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'killua_lightning') {
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = Math.max(4, this.height * 0.25);
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, 0);
            for (let i = 1; i < 6; i++) {
                ctx.lineTo(-this.width / 2 + i * this.width / 5, (i % 2 ? -1 : 1) * this.height * 0.45);
            }
            ctx.stroke();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'killua_yoyo') {
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#7dd3fc';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.type === 'adaptation_wheel') {
            ctx.rotate(this.timer * 5);
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * this.width / 2, Math.sin(angle) * this.height / 2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'hakoware_marker') {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.46, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.fillStyle = '#111827';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('%', 0, 1);
            ctx.restore();
            return;
        }

        if (this.type === 'enkidu_chain') {
            ctx.rotate(Math.atan2(this.vy || 0, this.vx || 1));
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 3;
            for (let x = -this.width / 2 + 10; x < this.width / 2; x += 22) {
                ctx.strokeRect(x, -this.height / 2 + 3, 16, this.height - 6);
            }
            ctx.restore();
            return;
        }

        const animeBoltTypes = [
            'anime_bolt', 'anime_storm', 'rune_bolt', 'tentacle_lash', 'shadow_knife',
            'blade_volley', 'gate_sword', 'weapon_storm', 'gae_bolg_throw',
            'enkidu_chain', 'invisible_air', 'ea_beam', 'excalibur_beam',
            'sinbad_djinn_storm', 'djinn_equip_spark', 'baal_bararaq',
            'valefor_ice_mirror', 'zepar_command_note', 'mana_siphon'
        ];
        if (animeBoltTypes.includes(this.type)) {
            const drawVx = this.vx || this.drawDirection || 1;
            ctx.rotate(Math.atan2(this.vy || 0, drawVx));
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.width / 2, 0);
            ctx.lineTo(-this.width / 2, -this.height / 2);
            ctx.lineTo(-this.width * 0.18, 0);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.type === 'gae_bolg_pickup') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#fee2e2';
            ctx.lineWidth = 3;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
            return;
        }

        const animeFieldTypes = [
            'anime_field', 'anime_giant_fist', 'grand_magecraft', 'dark_ritual',
            'sea_monster', 'army_standard', 'gae_bolg_curse', 'mystic_eyes',
            'tsubame_gaeshi', 'twelve_labors', 'god_hand',
            'valefor_frost_prison', 'focalor_tornado', 'zepar_domination',
            'delayed_strike_warning', 'unlimited_void', 'malevolent_shrine',
            'amon_inferno', 'the_one_sun', 'gojo_purple'
        ];
        if (animeFieldTypes.includes(this.type)) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width / 2, this.height / 2, Math.sin(this.timer) * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.62;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.width * (0.18 + i * 0.13), this.height * (0.08 + i * 0.08), this.timer + i, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'elemental_cataclysm' || this.type === 'arcane_orb' || this.type.includes('slifer') || this.type.includes('obelisk') || this.type.includes('ra_')) {
            // General magical orb / god attack
            ctx.rotate(this.timer * 4);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for(let i=0; i<3; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.width/1.5, this.height/4, (i*Math.PI)/3, 0, Math.PI*2);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'chemical_flood') {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(0, 0, this.width/2, 0, Math.PI);
            ctx.lineTo(this.width/2, -this.height/4);
            ctx.lineTo(-this.width/2, -this.height/4);
            ctx.fill();
            // Bubbles
            ctx.fillStyle = '#22c55e';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc((Math.random()-0.5)*this.width, -this.height/2 + Math.random()*this.height/2, this.width/8, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        // Default Fallback
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}
