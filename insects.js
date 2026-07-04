/**
 * FloraScape - Insect System (Phase 3)
 * Butterflies: wander between flowers with Bézier curves, gentle wing-flap animation
 * Bees: target nearest bloomed flower, collect pollen, pollinate it, move on
 * Both can be summoned by Shift+Click or via the sidebar buttons
 */

// ─── Butterfly ────────────────────────────────────────────────────────────────
class Butterfly {
    constructor(x, y, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;

        // Wing colors - vivid random hues
        const hues = [20, 45, 280, 320, 170, 10, 200];
        const h1 = hues[Math.floor(Math.random() * hues.length)];
        this.colorWing = `hsl(${h1}, 90%, 65%)`;
        this.colorWingDark = `hsl(${h1}, 80%, 40%)`;
        this.colorAccent = `hsl(${(h1 + 60) % 360}, 95%, 75%)`;

        this.size = 10 + Math.random() * 8;

        // Flight path: wanders between random target points
        this.tx = Math.random() * canvas.width;
        this.ty = Math.random() * (canvas.height * 0.55) + canvas.height * 0.15;
        this.speed = 0.5 + Math.random() * 0.8;

        // Bézier control point (changes each "leg" of journey)
        this.cx = (this.x + this.tx) / 2 + (Math.random() - 0.5) * 200;
        this.cy = (this.y + this.ty) / 2 + (Math.random() - 0.5) * 120;
        this.t = 0; // parametric progress 0→1

        // Wing animation
        this.flapAngle = Math.random() * Math.PI * 2;
        this.flapSpeed = 0.12 + Math.random() * 0.08;

        // Pollination
        this.pollinationCooldown = 0;
        this.dead = false;
        this.age = 0;
        this.maxAge = 1800 + Math.random() * 1200; // ~30-50s at 60fps
    }

    _newTarget() {
        const ox = this.x, oy = this.y;
        this.tx = 80 + Math.random() * (this.canvas.width - 160);
        this.ty = this.canvas.height * 0.12 + Math.random() * (this.canvas.height * 0.55);
        this.cx = (ox + this.tx) / 2 + (Math.random() - 0.5) * 220;
        this.cy = (oy + this.ty) / 2 - Math.random() * 100;
        this.t = 0;
    }

    update(env, flowers) {
        this.age++;
        if (this.age > this.maxAge) { this.dead = true; return; }

        // Bézier traversal
        this.t += (this.speed * 0.006) * (0.6 + env.windSpeed * 0.1);
        if (this.t >= 1) {
            // Bias towards bloomed flowers for a visit
            const targets = flowers.filter(f => f.lifecycle === 'bloomed');
            if (targets.length > 0 && Math.random() < 0.45) {
                const pick = targets[Math.floor(Math.random() * targets.length)];
                this.tx = pick.x + (Math.random() - 0.5) * 30;
                this.ty = pick.y - pick.height - 10;
                this.cx = (this.x + this.tx) / 2 + (Math.random() - 0.5) * 150;
                this.cy = Math.min(this.ty, this.y) - Math.random() * 80;
                this.t = 0;
            } else {
                this._newTarget();
            }
        }

        // Quadratic Bézier position
        const mt = 1 - this.t;
        this.x = mt * mt * this.x + 2 * mt * this.t * this.cx + this.t * this.t * this.tx;
        this.y = mt * mt * this.y + 2 * mt * this.t * this.cy + this.t * this.t * this.ty;

        // Wing flap
        this.flapAngle += this.flapSpeed;

        // Pollinate nearby bloomed flowers
        if (this.pollinationCooldown > 0) this.pollinationCooldown--;
        if (this.pollinationCooldown === 0) {
            for (const f of flowers) {
                if (f.lifecycle === 'bloomed') {
                    const dx = f.x - this.x, dy = (f.y - f.height) - this.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 30) {
                        f.pollinate();
                        this.pollinationCooldown = 180;
                        break;
                    }
                }
            }
        }
    }

    draw(ctx, env) {
        if (this.dead) return;
        const scale = env && env.getDepthScale ? env.getDepthScale(this.y) : 1;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        const flapY = Math.sin(this.flapAngle) * 0.7; // -0.7 to 0.7 = wing open/close
        const s = this.size;

        // Wind tilt
        const tilt = Math.sin(this.flapAngle * 0.3) * 0.15;
        ctx.rotate(tilt);

        // --- Left wings ---
        ctx.save();
        ctx.scale(-1, 1);
        this._drawWings(ctx, s, flapY);
        ctx.restore();

        // --- Right wings ---
        this._drawWings(ctx, s, flapY);

        // Body
        ctx.fillStyle = '#1e1b18';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.18, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = '#1e1b18';
        ctx.lineWidth = 1;
        for (const dir of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(dir * 2, -s * 0.5);
            ctx.quadraticCurveTo(dir * (s * 0.4), -s * 1.0, dir * (s * 0.5), -s * 1.1);
            ctx.stroke();
            // Antenna dot
            ctx.fillStyle = this.colorAccent;
            ctx.beginPath();
            ctx.arc(dir * (s * 0.5), -s * 1.1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawWings(ctx, s, flapY) {
        // Upper wing (larger)
        ctx.save();
        ctx.scale(1, flapY * 0.5 + 0.5); // squash Y to simulate perspective flap
        ctx.fillStyle = this.colorWing;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.1);
        ctx.bezierCurveTo(s * 0.3, -s * 0.9, s * 1.1, -s * 0.9, s * 1.0, -s * 0.2);
        ctx.bezierCurveTo(s * 0.9, s * 0.1, s * 0.3, s * 0.1, 0, -s * 0.1);
        ctx.closePath();
        ctx.fill();

        // Wing vein pattern
        ctx.strokeStyle = this.colorWingDark;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.1);
        ctx.bezierCurveTo(s * 0.4, -s * 0.5, s * 0.9, -s * 0.5, s * 1.0, -s * 0.2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Accent spot
        ctx.fillStyle = this.colorAccent;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(s * 0.6, -s * 0.5, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Lower wing (smaller)
        ctx.fillStyle = this.colorWingDark;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.1);
        ctx.bezierCurveTo(s * 0.3, s * 0.2, s * 0.8, s * 0.7, s * 0.6, s * 0.5);
        ctx.bezierCurveTo(s * 0.4, s * 0.4, s * 0.2, s * 0.2, 0, s * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// ─── Bee ─────────────────────────────────────────────────────────────────────
class Bee {
    constructor(x, y, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;

        this.size = 7 + Math.random() * 4;
        this.speed = 1.8 + Math.random() * 1.2;

        // Target flower
        this.target = null;
        this.atFlower = false;
        this.visitTimer = 0;

        // Jitter flight
        this.jx = 0;
        this.jy = 0;
        this.jitterTimer = 0;

        // Wing buzz
        this.buzzAngle = 0;
        this.buzzSpeed = 0.45;

        // Pollen collected
        this.hasPollen = false;
        this.pollenColor = '#facc15';

        this.dead = false;
        this.age = 0;
        this.maxAge = 2400 + Math.random() * 1200;
    }

    update(env, flowers) {
        this.age++;
        if (this.age > this.maxAge) { this.dead = true; return; }

        this.buzzAngle += this.buzzSpeed;

        // Find nearest bloomed flower as target
        if (!this.target || this.target.lifecycle !== 'bloomed') {
            const bloomed = flowers.filter(f => f.lifecycle === 'bloomed');
            if (bloomed.length > 0) {
                bloomed.sort((a, b) => {
                    const da = (a.x - this.x) ** 2 + (a.y - this.y) ** 2;
                    const db = (b.x - this.x) ** 2 + (b.y - this.y) ** 2;
                    return da - db;
                });
                this.target = bloomed[0];
                this.atFlower = false;
            } else {
                // Wander randomly if no flowers
                this._wander(env);
                return;
            }
        }

        const targetX = this.target.x;
        const targetY = this.target.y - this.target.height - 5;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
            // Arrived at flower - visit it
            if (!this.atFlower) {
                this.atFlower = true;
                this.visitTimer = 60 + Math.random() * 60;
                this.hasPollen = true;
                this.pollenColor = this.target.colors.center || '#facc15';
                this.target.pollinate();
            }

            // Hover & buzz over the flower
            this.x += Math.sin(this.buzzAngle * 3) * 1.5;
            this.y += Math.cos(this.buzzAngle * 2.5) * 0.8;

            this.visitTimer--;
            if (this.visitTimer <= 0) {
                this.target = null;
                this.atFlower = false;
            }
        } else {
            // Fly towards target with jitter
            this.jitterTimer++;
            if (this.jitterTimer > 8) {
                this.jx = (Math.random() - 0.5) * 3;
                this.jy = (Math.random() - 0.5) * 3;
                this.jitterTimer = 0;
            }
            const nx = dx / dist;
            const ny = dy / dist;
            this.x += nx * this.speed + this.jx;
            this.y += ny * this.speed + this.jy;
        }

        // Keep on screen
        this.x = Math.max(10, Math.min(this.canvas.width - 10, this.x));
        this.y = Math.max(10, Math.min(this.canvas.height * 0.85, this.y));
    }

    _wander(env) {
        this.jitterTimer++;
        if (this.jitterTimer > 20) {
            this.jx = (Math.random() - 0.5) * 120 + env.windSpeed * 2;
            this.jy = (Math.random() - 0.5) * 60;
            this.jitterTimer = 0;
        }
        this.x += this.jx * 0.05;
        this.y += this.jy * 0.05;
        this.x = Math.max(10, Math.min(this.canvas.width - 10, this.x));
        this.y = Math.max(10, Math.min(this.canvas.height * 0.8, this.y));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const s = this.size;
        const buzzY = Math.sin(this.buzzAngle * 4) * 0.6;

        // Buzz trail dots
        if (this.atFlower) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Wings (rapid translucent flap)
        const wingOpen = Math.abs(Math.sin(this.buzzAngle * 6));
        ctx.fillStyle = `rgba(200, 235, 255, ${0.5 + wingOpen * 0.3})`;

        // Left wing
        ctx.beginPath();
        ctx.ellipse(-s * 0.8, buzzY - s * 0.3, s * 0.85, s * 0.4, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(s * 0.8, buzzY - s * 0.3, s * 0.85, s * 0.4, Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();

        // Body (abdomen) - striped
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#1c1917';
            ctx.beginPath();
            const segW = s * (0.6 - i * 0.08);
            ctx.ellipse(0, i * s * 0.3 - s * 0.2, segW, s * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Head
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -s * 0.5, s * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.55, 1.5, 0, Math.PI * 2);
        ctx.arc(s * 0.15, -s * 0.55, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Pollen basket glow if carrying pollen
        if (this.hasPollen) {
            ctx.fillStyle = this.pollenColor;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(-s * 0.55, s * 0.2, s * 0.22, 0, Math.PI * 2);
            ctx.arc(s * 0.55, s * 0.2, s * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }
}

// ─── InsectManager ────────────────────────────────────────────────────────────
class InsectManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.insects = [];
    }

    spawnButterfly(x, y) {
        this.insects.push(new Butterfly(x, y, this.canvas));
    }

    spawnBee(x, y) {
        this.insects.push(new Bee(x, y, this.canvas));
    }

    spawnSwarm(type, count = 6) {
        for (let i = 0; i < count; i++) {
            const x = 100 + Math.random() * (this.canvas.width - 200);
            const y = 80 + Math.random() * (this.canvas.height * 0.45);
            if (type === 'butterfly') this.spawnButterfly(x, y);
            else this.spawnBee(x, y);
        }
    }

    clearAll() {
        this.insects = [];
    }

    update(env, flowers) {
        for (let i = this.insects.length - 1; i >= 0; i--) {
            this.insects[i].update(env, flowers);
            if (this.insects[i].dead) this.insects.splice(i, 1);
        }

        // Auto-spawn a butterfly or bee occasionally when there are flowers
        const bloomedCount = flowers.filter(f => f.lifecycle === 'bloomed').length;
        if (bloomedCount > 2 && this.insects.length < 15 && Math.random() < 0.0015) {
            const x = Math.random() < 0.5 ? -30 : this.canvas.width + 30;
            const y = this.canvas.height * 0.2 + Math.random() * this.canvas.height * 0.3;
            if (Math.random() < 0.55) this.spawnButterfly(x, y);
            else this.spawnBee(x, y);
        }
    }

    draw(ctx, env) {
        this.insects.forEach(ins => ins.draw(ctx, env));
    }
}

window.InsectManager = InsectManager;
