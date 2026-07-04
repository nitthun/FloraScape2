/**
 * FloraScape - Flower Class Hierarchy
 * Contains base Flower class and specialized sub-classes for Daisy, Tulip, Rose, Sunflower, Lavender.
 * Each flower handles its own growth, swaying physics, and canvas rendering.
 */

class Flower {
    constructor(x, y, species, chosenColorName = null) {
        this.x = x;
        this.y = y;
        this.species = species;

        // Growth
        this.growth = 0.0;
        this.baseGrowthSpeed = 0.0008 + Math.random() * 0.0006;
        
        // --- Added for Phase 4 Smoother Mouse Sway ---
        this.currentMouseSway = 0;
        this.maxHeight = 100 + Math.random() * 120;
        this.height = 0;

        // Sway physics
        this.phase = Math.random() * Math.PI * 2;
        this.flexibility = 0.6 + Math.random() * 0.4;

        // Audio
        this.hasPlayedBloomSound = false;

        // Colors
        this.colors = this.generateColors(chosenColorName);

        // ── Lifecycle ──────────────────────────────────────────
        // stages: 'growing' → 'bloomed' → 'pollinated' → 'fruiting' → 'seeding' → 'withering'
        this.lifecycle = 'growing';
        this.lifecycleTimer = 0;  // frames in current stage

        // Fruit
        this.fruitGrowth = 0;     // 0→1 fruit size
        this.fruitColor = `hsl(${20 + Math.floor(Math.random()*30)}, 80%, 38%)`;

        // Seed particles released
        this.seeds = [];          // [{x, y, vx, vy, life, maxLife}]
        this.seedsReleased = false;

        // Pollen particles
        this.pollenParticles = []; // [{x, y, vx, vy, life, maxLife, alpha}]
        this.pollenTimer = 0;

        // Fade out when withering
        this.opacity = 1;
    }

    /**
     * Generate specific color palettes for this flower instance based on chosenColorName
     */
    generateColors(chosenColorName) {
        const hueVar = Math.floor(Math.random() * 14) - 7; // small variance (+- 7 deg)
        
        // Default color configurations based on chosenColorName
        const colorMap = {
            red: { h: 0, s: 85, l: 50 },
            pink: { h: 330, s: 85, l: 64 },
            orange: { h: 25, s: 90, l: 56 },
            yellow: { h: 50, s: 90, l: 55 },
            purple: { h: 275, s: 75, l: 60 },
            blue: { h: 205, s: 85, l: 55 },
            white: { h: 0, s: 0, l: 96 },
            // Rare Mutated Colors
            gold: { h: 45, s: 100, l: 65, special: 'gold' },
            glow: { h: 180, s: 100, l: 70, special: 'glow' },
            rainbow: { h: 0, s: 100, l: 60, special: 'rainbow' }
        };
        
        this.colorName = chosenColorName;
        
        let hue = 0;
        let sat = 85;
        let light = 55;
        let isCustom = false;
        
        if (chosenColorName && colorMap[chosenColorName]) {
            const cfg = colorMap[chosenColorName];
            hue = cfg.h + hueVar;
            sat = cfg.s;
            light = cfg.l;
            isCustom = true;
        }
        
        switch (this.species) {
            case 'daisy':
                return {
                    petals: isCustom ? (chosenColorName === 'white' ? 'rgba(255, 255, 255, 0.95)' : `hsl(${hue}, ${sat}%, ${light}%)`) : 'rgba(255, 255, 255, 0.95)',
                    center: `hsl(${45 + hueVar / 2}, 95%, 50%)`,
                    stem: `hsl(${110 + hueVar}, 45%, 35%)`,
                    leaf: `hsl(${110 + hueVar}, 45%, 28%)`
                };
            case 'tulip':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${[335, 15, 275][Math.floor(Math.random() * 3)] + hueVar}, 85%, 60%)`,
                    petalsDark: isCustom ? `hsl(${hue}, ${sat}%, ${light - 15}%)` : `hsl(${335 + hueVar}, 85%, 45%)`,
                    stem: `hsl(${120 + hueVar}, 40%, 36%)`,
                    leaf: `hsl(${120 + hueVar}, 40%, 28%)`
                };
            case 'rose':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${[0, 350, 45, 320][Math.floor(Math.random() * 4)] + hueVar}, 80%, 48%)`,
                    petalsDark: isCustom ? `hsl(${hue}, ${sat}%, ${light - 18}%)` : `hsl(${0 + hueVar}, 90%, 30%)`,
                    petalsLight: isCustom ? `hsl(${hue}, ${sat - 10}%, ${light + 14}%)` : `hsl(${0 + hueVar}, 85%, 62%)`,
                    stem: `hsl(${135 + hueVar}, 30%, 25%)`,
                    leaf: `hsl(${135 + hueVar}, 30%, 20%)`
                };
            case 'sunflower':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${42 + hueVar / 2}, 95%, 55%)`,
                    center: `hsl(${25 + hueVar}, 75%, 20%)`,
                    centerEdge: `hsl(${35 + hueVar}, 70%, 15%)`,
                    stem: `hsl(${100 + hueVar}, 50%, 35%)`,
                    leaf: `hsl(${100 + hueVar}, 55%, 26%)`
                };
            case 'lavender':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${265 + hueVar}, 70%, 65%)`,
                    petalsDark: isCustom ? `hsl(${hue}, ${sat}%, ${light - 12}%)` : `hsl(${265 + hueVar}, 65%, 45%)`,
                    petalsLight: isCustom ? `hsl(${hue}, ${sat - 10}%, ${light + 10}%)` : `hsl(${265 + hueVar}, 80%, 75%)`,
                    stem: `hsl(${120 + hueVar}, 25%, 38%)`,
                    leaf: `hsl(${120 + hueVar}, 20%, 30%)`
                };
            case 'lily':
                return {
                    petals: isCustom ? (chosenColorName === 'white' ? 'rgba(255, 255, 255, 0.95)' : `hsl(${hue}, ${sat}%, ${light}%)`) : 'rgba(255, 255, 255, 0.95)',
                    petalsDark: isCustom ? `hsl(${hue}, ${sat}%, ${light - 12}%)` : 'rgba(243, 244, 246, 0.9)',
                    center: `hsl(${45 + hueVar}, 90%, 55%)`,
                    stem: `hsl(${115 + hueVar}, 35%, 34%)`,
                    leaf: `hsl(${115 + hueVar}, 35%, 27%)`
                };
            case 'orchid':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${300 + hueVar}, 85%, 65%)`,
                    petalsDark: isCustom ? `hsl(${hue}, ${sat}%, ${light - 15}%)` : `hsl(${300 + hueVar}, 85%, 45%)`,
                    center: `hsl(${20 + hueVar}, 95%, 60%)`,
                    stem: `hsl(${125 + hueVar}, 30%, 32%)`,
                    leaf: `hsl(${125 + hueVar}, 25%, 25%)`
                };
            case 'cosmos':
                return {
                    petals: isCustom ? `hsl(${hue}, ${sat}%, ${light}%)` : `hsl(${[330, 345, 10][Math.floor(Math.random() * 3)] + hueVar}, 85%, 60%)`,
                    center: `hsl(${50 + hueVar}, 95%, 50%)`,
                    stem: `hsl(${105 + hueVar}, 45%, 36%)`,
                    leaf: `hsl(${105 + hueVar}, 50%, 25%)`
                };
            default:
                return { petals: '#ffffff', center: '#ffff00', stem: '#22c55e', leaf: '#15803d' };
        }
    }

    /**
     * Trigger pollination externally (called by insects)
     */
    pollinate() {
        if (this.lifecycle === 'bloomed') {
            this.lifecycle = 'pollinated';
            this.lifecycleTimer = 0;
        }
    }

    /**
     * Update flower growth + lifecycle + particles
     */
    update(env) {
        // ── Growth stimuli ────────────────────────────────────
        const hour = env.timeOfDay || 12;
        const tempBoost = 0.6 + 0.8 * Math.sin(Math.max(0, (hour - 6) / 12) * Math.PI); // peaks at midday
        const rainBoost = env.rainEnabled ? 2.2 : 1.0;
        const speedBoost = tempBoost * rainBoost;

        // ── Lifecycle state machine ───────────────────────────
        this.lifecycleTimer++;
        
        // Rare color dynamic updates
        if (this.colorName === 'rainbow') {
            this.rainbowHue = ((this.rainbowHue || 0) + 1) % 360;
            if (this.colors) this.colors.petals = `hsl(${this.rainbowHue}, 100%, 60%)`;
        }

        switch (this.lifecycle) {
            case 'growing':
                if (this.growth < 1.0) {
                    this.growth += this.baseGrowthSpeed * speedBoost;
                    if (this.growth >= 1.0) {
                        this.growth = 1.0;
                        this.lifecycle = 'bloomed';
                        this.lifecycleTimer = 0;
                        if (!this.hasPlayedBloomSound && window.floraAudio) {
                            window.floraAudio.playChime();
                            this.hasPlayedBloomSound = true;
                        }
                    }
                }
                break;

            case 'bloomed':
                // Auto-pollinate after long time if no insect arrives
                if (this.lifecycleTimer > 1800) {
                    this.pollinate();
                }
                // Emit pollen particles
                this._emitPollen(env);
                
                // Gamification: Removed (Phase 11 Zen mode)
                break;

            case 'pollinated':
                if (this.lifecycleTimer === 1) { // Just entered pollinated state
                    this.nextSeedColor = this.colorName;
                    
                    // Genetics Logic
                    const tier1 = {
                        'red+yellow': 'orange', 'yellow+red': 'orange',
                        'red+white': 'pink', 'white+red': 'pink',
                        'blue+red': 'purple', 'red+blue': 'purple',
                        'blue+yellow': 'white', 'yellow+blue': 'white'
                    };
                    const isTier1 = (c) => ['orange','pink','purple'].includes(c);
                    
                    // Cross-breeding check
                    if (window.flowers) {
                        for (const other of window.flowers) {
                            if (other !== this && other.species === this.species && other.lifecycle === 'bloomed') {
                                const dist = Math.abs(this.x - other.x);
                                if (dist < 150 && other.colorName !== this.colorName) {
                                    const combo = this.colorName + '+' + other.colorName;
                                    
                                    // Tier 4: Glow (5%) - Gold + Rainbow
                                    if ((this.colorName === 'gold' && other.colorName === 'rainbow') || (this.colorName === 'rainbow' && other.colorName === 'gold')) {
                                        if (Math.random() < 0.05) this.nextSeedColor = 'glow';
                                    }
                                    // Tier 3: Rainbow (10%) - Two Tier 1 mixed colors
                                    else if (isTier1(this.colorName) && isTier1(other.colorName)) {
                                        if (Math.random() < 0.10) this.nextSeedColor = 'rainbow';
                                    }
                                    // Tier 2: Gold (15%) - Yellow + Orange
                                    else if ((this.colorName === 'yellow' && other.colorName === 'orange') || (this.colorName === 'orange' && other.colorName === 'yellow')) {
                                        if (Math.random() < 0.15) this.nextSeedColor = 'gold';
                                    }
                                    // Tier 1: Basic Mix (30%)
                                    else if (tier1[combo]) {
                                        if (Math.random() < 0.30) this.nextSeedColor = tier1[combo];
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Spontaneous mutation (if not cross-bred)
                    if (this.nextSeedColor === this.colorName) {
                        if (Math.random() < 0.30) { // 30% chance for a random base color
                            const baseColors = ['red', 'pink', 'orange', 'yellow', 'purple', 'blue', 'white'];
                            // Make sure we actually pick a different base color
                            const otherBases = baseColors.filter(c => c !== this.colorName);
                            if (otherBases.length > 0) {
                                this.nextSeedColor = otherBases[Math.floor(Math.random() * otherBases.length)];
                            }
                        }
                    }
                }
                // Brief glow phase, then start fruiting
                if (this.lifecycleTimer > 90) {
                    this.lifecycle = 'fruiting';
                    this.lifecycleTimer = 0;
                }
                break;

            case 'fruiting':
                this.fruitGrowth = Math.min(1, this.fruitGrowth + 0.004);
                if (this.lifecycleTimer > 600) {
                    this.lifecycle = 'seeding';
                    this.lifecycleTimer = 0;
                }
                break;

            case 'seeding':
                if (!this.seedsReleased) {
                    this._releaseSeeds(env);
                    this.seedsReleased = true;
                    // Assign nextSeedColor to seeds
                    this.seeds.forEach(s => { s.color = this.nextSeedColor || this.colorName; });
                }
                
                // Update falling seeds
                if (this.seedsReleased) {
                    const groundY = this.y + (Math.random() - 0.5) * 40;
                    for (let i = this.seeds.length - 1; i >= 0; i--) {
                        const s = this.seeds[i];
                        if (!s.landed) {
                            s.x += s.vx + env.windSpeed * 0.6;
                            s.y += s.vy;
                            s.vy += 0.08; // Gravity
                            
                            if (s.y >= groundY) {
                                s.y = groundY;
                                // Bounce effect
                                if (Math.abs(s.vy) > 1.5) {
                                    s.vy = -s.vy * 0.3;
                                    s.vx = s.vx * 0.5;
                                    s.y -= 2;
                                } else {
                                    s.landed = true;
                                    s.life = 40 + Math.random() * 40; // Wait before sprout
                                }
                            }
                        } else {
                            s.life--;
                            if (s.life <= 0) {
                                // 20% chance to germinate (Phase 4 requirement)
                                if (Math.random() < 0.20 && window.onSeedLanded) {
                                    window.onSeedLanded(s.x, s.y, this.species, s.color);
                                }
                                this.seeds.splice(i, 1);
                            }
                        }
                    }
                }
                if (this.seeds.length === 0 && this.seedsReleased) {
                    this.lifecycle = 'withering';
                    this.lifecycleTimer = 0;
                }
                break;

            case 'withering':
                this.opacity = Math.max(0, this.opacity - 0.003);
                if (this.opacity <= 0) this.dead = true;
                break;
        }

        // Pollen removed for Phase 5
        this.height = this.maxHeight * this.growth;
    }

    _emitPollen(env) {
        // Disabled for Phase 5 to make screen cleaner
    }

    _releaseSeeds(env) {
        const count = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            this.seeds.push({
                x: this.x,
                y: this.y - this.height,
                vx: (Math.random() - 0.5) * 2.5,
                vy: -2 - Math.random() * 2,
                life: 80 + Math.random() * 80,
                maxLife: 160
            });
        }
    }

    /**
     * Compute current stem top point bending according to wind parameters and mouse interaction
     */
    getSway(env) {
        // Compute swaying force: combination of sine wave + wind velocity
        const baseSway = Math.sin(env.windOffset + this.phase) * 12 * env.windSpeed * this.flexibility;
        const constantTilt = env.windSpeed * 8 * this.flexibility;
        
        const windSway = (baseSway + constantTilt) * this.growth;
        
        // Mouse interaction (smooth bend away from cursor)
        let targetMouseSway = 0;
        if (env.mouseX !== undefined && env.mouseY !== undefined) {
            const headX = this.x + windSway + this.currentMouseSway;
            const headY = this.y - this.height;
            const dx = headX - env.mouseX;
            const dy = headY - env.mouseY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Influence radius is 100px
            if (dist < 100) {
                const force = Math.pow((100 - dist) / 100, 2); // easing curve
                targetMouseSway = Math.sign(dx) * force * 45 * this.flexibility * this.growth;
            }
        }
        
        // Smooth interpolation for mouse sway (less rigid)
        this.currentMouseSway += (targetMouseSway - this.currentMouseSway) * 0.12;
        
        return windSway + this.currentMouseSway;
    }

    /**
     * Render the flower onto the Canvas
     */
    draw(env, ctx) {
        if (this.height <= 0 || this.dead) return;

        const scale = env.getDepthScale ? env.getDepthScale(this.y) : 1;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.translate(-this.x, -this.y);

        const sway = this.getSway(env);
        const bx = this.x, by = this.y;
        const tx = this.x + sway;
        const ty = this.y - this.height;
        const cx = this.x + sway * 0.3;
        const cy = this.y - this.height * 0.5;

        // 1. Stem
        ctx.strokeStyle = this.colors.stem;
        ctx.lineWidth = Math.max(1.5, 3.5 * this.growth);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(cx, cy, tx, ty);
        ctx.stroke();

        // 2. Leaves
        this.drawLeaves(ctx, bx, by, cx, cy, tx, ty);

        // 3. Growth Phases (Seedling -> Budding -> Bloomed/Fruiting)
        if (this.growth > 0.15) {
            ctx.save();
            ctx.translate(tx, ty);
            const stemAngle = Math.atan2(ty - cy, tx - cx) + Math.PI / 2;
            ctx.rotate(stemAngle * 0.4);
            
            if (this.lifecycle === 'growing') {
                if (this.growth > 0.7) {
                    // Budding Phase (ตูม)
                    const budScale = (this.growth - 0.7) / 0.3; // 0 to 1
                    ctx.fillStyle = this.colors.leaf; // Green bud
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 5 * budScale, 7 * budScale, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Tip of bud showing a tiny bit of petal color
                    ctx.fillStyle = this.colors.petals;
                    ctx.beginPath();
                    ctx.arc(0, -5 * budScale, 3 * budScale, 0, Math.PI, true);
                    ctx.fill();
                }
                // Seedling Phase (growth < 0.7) -> Draw nothing at the tip, just stem and leaves
            } else {
                // Bloomed, Fruiting, Seeding, Withering
                const headScale = Math.min(1.0, this.growth);

                if (this.lifecycle === 'fruiting' || this.lifecycle === 'seeding') {
                    this._drawFruit(ctx, headScale);
                } else if (this.lifecycle === 'withering') {
                    // Wilted: draw tiny collapsed head
                    ctx.globalAlpha = this.opacity * 0.5;
                    this._drawFruit(ctx, headScale * 0.4);
                } else {
                    if (this.colorName === 'glow' || this.colorName === 'gold' || this.colorName === 'rainbow') {
                        ctx.shadowBlur = this.colorName === 'glow' ? 25 : 12;
                        ctx.shadowColor = this.colors.petals;
                    }
                    this.drawFlowerHead(ctx, headScale, env);
                    ctx.shadowBlur = 0;
                    
                    // Pollination glow ring
                    if (this.lifecycle === 'pollinated') {
                        ctx.strokeStyle = 'rgba(255, 230, 80, 0.6)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(0, 0, 18 * headScale * (1 + 0.1 * Math.sin(Date.now() * 0.01)), 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();
        }

        // 4. Flying seeds
        if (this.seeds.length > 0) {
            ctx.fillStyle = 'rgba(245, 220, 150, 0.85)';
            for (const s of this.seeds) {
                const prog = 1 - s.life / s.maxLife;
                ctx.globalAlpha = (1 - prog) * this.opacity;
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(prog * Math.PI * 4);
                // Seed shape: tiny oval with tail
                ctx.beginPath();
                ctx.ellipse(0, 0, 3, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Wispy tail
                ctx.strokeStyle = 'rgba(245, 220, 150, 0.4)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-4, -4);
                ctx.stroke();
                ctx.restore();
            }
            ctx.globalAlpha = this.opacity;
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    _drawFruit(ctx, scale) {
        // Small berry-like fruit cluster
        ctx.fillStyle = this.fruitColor;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, 7 * scale * this.fruitGrowth), 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(-2 * scale, -2 * scale, 2.5 * scale * this.fruitGrowth, 0, Math.PI * 2);
        ctx.fill();
        // Small stem nub
        ctx.strokeStyle = this.colors.stem;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -5 * scale);
        ctx.stroke();
    }

    /**
     * Render green leaves sticking out of the stem curve
     */
    drawLeaves(ctx, bx, by, cx, cy, tx, ty) {
        ctx.save();
        ctx.fillStyle = this.colors.leaf;
        
        // Midpoint 1 (Lower stem leaf)
        // Interpolate along quadratic curve t = 0.35
        const lx1 = 0.65 * 0.65 * bx + 2 * 0.65 * 0.35 * cx + 0.35 * 0.35 * tx;
        const ly1 = 0.65 * 0.65 * by + 2 * 0.65 * 0.35 * cy + 0.35 * 0.35 * ty;
        
        // Midpoint 2 (Upper stem leaf)
        // Interpolate at t = 0.7
        const lx2 = 0.3 * 0.3 * bx + 2 * 0.3 * 0.7 * cx + 0.7 * 0.7 * tx;
        const ly2 = 0.3 * 0.3 * by + 2 * 0.3 * 0.7 * cy + 0.7 * 0.7 * ty;

        const leafSize = 10 * this.growth;
        
        if (leafSize > 1) {
            // Draw Left leaf
            ctx.beginPath();
            ctx.ellipse(lx1, ly1, leafSize, leafSize * 0.4, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw Right leaf higher up
            ctx.beginPath();
            ctx.ellipse(lx2, ly2, leafSize * 0.8, leafSize * 0.3, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Dummy method, overriden by children
    drawFlowerHead(ctx, scale, env) {}
}

/**
 * ----------------------------------------------------
 * Species: DAISY (เดซี่)
 * ----------------------------------------------------
 */
class Daisy extends Flower {
    constructor(x, y) {
        super(x, y, 'daisy');
        this.petalCount = 12;
        this.maxHeight = 80 + Math.random() * 60; // daisies are shorter
    }

    drawFlowerHead(ctx, scale, env) {
        // Petal size
        const w = 4 * scale;
        const h = 18 * scale;
        
        // Draw radiating petals with gradient
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / this.petalCount);
            
            const grad = ctx.createLinearGradient(0, -h*0.1, 0, -h);
            grad.addColorStop(0, this.colors.petalsLight || '#fff');
            grad.addColorStop(1, this.colors.petals);
            ctx.fillStyle = grad;
            
            // Draw a single petal shape (more elegant)
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-w, -h * 0.4, -w, -h * 0.8, 0, -h);
            ctx.bezierCurveTo(w, -h * 0.8, w, -h * 0.4, 0, 0);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Yellow center disc (detailed)
        ctx.fillStyle = this.colors.center;
        ctx.beginPath();
        ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-2 * scale, -2 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * ----------------------------------------------------
 * Species: TULIP (ทิวลิป)
 * ----------------------------------------------------
 */
class Tulip extends Flower {
    constructor(x, y) {
        super(x, y, 'tulip');
        this.maxHeight = 110 + Math.random() * 70;
        this.flexibility = 0.5; // Stiff stems
    }

    drawFlowerHead(ctx, scale, env) {
        const w = 14 * scale;
        const h = 22 * scale;
        
        // Base cup outline
        ctx.fillStyle = this.colors.petalsDark;
        ctx.beginPath();
        // Left petal backing
        ctx.moveTo(-w * 0.7, 0);
        ctx.quadraticCurveTo(-w * 0.9, -h * 0.6, -w * 0.2, -h);
        ctx.quadraticCurveTo(0, -h * 0.5, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Right petal backing
        ctx.beginPath();
        ctx.moveTo(w * 0.7, 0);
        ctx.quadraticCurveTo(w * 0.9, -h * 0.6, w * 0.2, -h);
        ctx.quadraticCurveTo(0, -h * 0.5, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Main center overlay petal
        ctx.fillStyle = this.colors.petals;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-w * 0.8, -h * 0.2, -w * 0.7, -h * 0.9, 0, -h);
        ctx.bezierCurveTo(w * 0.7, -h * 0.9, w * 0.8, -h * 0.2, 0, 0);
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * ----------------------------------------------------
 * Species: ROSE (กุหลาบ)
 * ----------------------------------------------------
 */
class Rose extends Flower {
    constructor(x, y) {
        super(x, y, 'rose');
        this.maxHeight = 130 + Math.random() * 90;
        this.flexibility = 0.45;
    }

    drawFlowerHead(ctx, scale, env) {
        const size = 18 * scale;
        
        // Outer dark rose petals
        ctx.fillStyle = this.colors.petalsDark;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Outer petals layer 2 (improved shape)
        ctx.fillStyle = this.colors.petals;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-size, -size*0.4, -size*0.4, -size, 0, -size);
            ctx.bezierCurveTo(size*0.4, -size, size, -size*0.4, 0, 0);
            ctx.fill();
            // Subtle edge
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
        }

        // Inner rosebud spiral structure
        ctx.fillStyle = this.colors.petalsLight;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        
        // Spiral center swirl
        ctx.strokeStyle = this.colors.petalsDark;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        let angle = 0;
        let radius = 1;
        ctx.moveTo(0,0);
        while (radius < size * 0.45) {
            angle += 0.5;
            radius += 1 * scale;
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.stroke();
    }
}

/**
 * ----------------------------------------------------
 * Species: SUNFLOWER (ทานตะวัน)
 * ----------------------------------------------------
 */
class Sunflower extends Flower {
    constructor(x, y) {
        super(x, y, 'sunflower');
        this.petalCount = 18;
        this.maxHeight = 160 + Math.random() * 80; // sunflowers are tall
        this.flexibility = 0.35; // thick heavy stem sways less
    }

    drawFlowerHead(ctx, scale, env) {
        const rPetal = 22 * scale;
        const wPetal = 6 * scale;
        const centerRadius = 11 * scale;
        
        // Draw radial yellow petals
        ctx.fillStyle = this.colors.petals;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / this.petalCount);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-wPetal, -rPetal * 0.5, 0, -rPetal);
            ctx.quadraticCurveTo(wPetal, -rPetal * 0.5, 0, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }

        // Dark seed center disc
        ctx.fillStyle = this.colors.centerEdge;
        ctx.beginPath();
        ctx.arc(0, 0, centerRadius * 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.center;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, centerRadius), 0, Math.PI * 2);
        ctx.fill();

        // Draw sunflower seed grid (subtle dots texture)
        ctx.fillStyle = '#1e1008';
        for (let i = 0; i < 24; i++) {
            const angle = i * 2.4; // golden angle approx
            const dist = (i / 24) * centerRadius * 0.8;
            const px = Math.cos(angle) * dist;
            const py = Math.sin(angle) * dist;
            
            ctx.beginPath();
            ctx.arc(px, py, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * ----------------------------------------------------
 * Species: LAVENDER (ลาเวนเดอร์)
 * ----------------------------------------------------
 */
class Lavender extends Flower {
    constructor(x, y) {
        super(x, y, 'lavender');
        this.maxHeight = 120 + Math.random() * 80;
        this.flexibility = 0.7; // flexible stalks sway a lot
    }

    drawFlowerHead(ctx, scale, env) {
        // Lavender doesn't have a single head but a stalk of flower nodes
        // Drawing stacked clusters along the stem.
        // In our translate frame, (0,0) is the tip of the stem.
        
        const nodes = 7;
        const nodeSpacing = 8 * scale;
        
        for (let i = 0; i < nodes; i++) {
            const yOffset = i * nodeSpacing; // grow downwards along the stem
            const nodeScale = scale * (1 - (i / nodes) * 0.4); // nodes get smaller towards bottom
            
            ctx.save();
            ctx.translate(0, yOffset);
            
            // Draw small overlapping buds (ellipses) in a cluster
            ctx.fillStyle = this.colors.petals;
            
            // Center top bud
            ctx.beginPath();
            ctx.arc(0, -4 * nodeScale, 3 * nodeScale, 0, Math.PI * 2);
            ctx.fill();

            // Left bud
            ctx.fillStyle = this.colors.petalsDark;
            ctx.beginPath();
            ctx.ellipse(-4 * nodeScale, 0, 4 * nodeScale, 2.5 * nodeScale, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Right bud
            ctx.beginPath();
            ctx.ellipse(4 * nodeScale, 0, 4 * nodeScale, 2.5 * nodeScale, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Light highlight buds in center
            ctx.fillStyle = this.colors.petalsLight;
            ctx.beginPath();
            ctx.arc(0, 0, 2.5 * nodeScale, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

/**
 * ----------------------------------------------------
 * Species: LILY (ลิลลี่)
 * ----------------------------------------------------
 */
class Lily extends Flower {
    constructor(x, y, colorName = null) {
        super(x, y, 'lily', colorName);
        this.maxHeight = 100 + Math.random() * 80;
        this.flexibility = 0.55;
        this.petalCount = 6;
    }

    drawFlowerHead(ctx, scale, env) {
        const size = 16 * scale;

        // 6 radiating open petals
        ctx.fillStyle = this.colors.petals;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / this.petalCount);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-size * 0.4, -size * 0.3, -size * 0.5, -size, 0, -size * 1.1);
            ctx.bezierCurveTo(size * 0.5, -size, size * 0.4, -size * 0.3, 0, 0);
            ctx.closePath();
            ctx.fill();

            // Petal midrib stripe
            ctx.strokeStyle = this.colors.petalsDark;
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size * 1.0);
            ctx.stroke();
            ctx.restore();
        }

        // Stamens (protruding center)
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6 + Math.PI / 6);
            ctx.strokeStyle = `hsl(${40}, 50%, 55%)`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size * 0.55);
            ctx.stroke();
            // Anther dot
            ctx.fillStyle = this.colors.center;
            ctx.beginPath();
            ctx.arc(0, -size * 0.55, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

/**
 * ----------------------------------------------------
 * Species: ORCHID (กล้วยไม้)
 * ----------------------------------------------------
 */
class Orchid extends Flower {
    constructor(x, y, colorName = null) {
        super(x, y, 'orchid', colorName);
        this.maxHeight = 115 + Math.random() * 75;
        this.flexibility = 0.5;
    }

    drawFlowerHead(ctx, scale, env) {
        const w = 16 * scale;
        const h = 14 * scale;

        // 3 outer dorsal petals (sepals)
        ctx.fillStyle = this.colors.petalsDark;
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.8, w * 0.35, h * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2 lateral petals (wider butterfly wings)
        ctx.fillStyle = this.colors.petals;
        ctx.save();
        ctx.rotate(-Math.PI / 5);
        ctx.beginPath();
        ctx.ellipse(-w * 0.65, -h * 0.5, w * 0.6, h * 0.4, Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.rotate(Math.PI / 5);
        ctx.beginPath();
        ctx.ellipse(w * 0.65, -h * 0.5, w * 0.6, h * 0.4, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Labellum (lip petal - the distinctive tongue)
        ctx.fillStyle = this.colors.center;
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, 0);
        ctx.bezierCurveTo(-w * 0.5, h * 0.6, w * 0.5, h * 0.6, w * 0.4, 0);
        ctx.bezierCurveTo(w * 0.2, -h * 0.3, -w * 0.2, -h * 0.3, -w * 0.4, 0);
        ctx.closePath();
        ctx.fill();

        // Column center
        ctx.fillStyle = this.colors.petalsDark;
        ctx.beginPath();
        ctx.arc(0, -h * 0.15, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * ----------------------------------------------------
 * Species: COSMOS (คอสมอส)
 * ----------------------------------------------------
 */
class Cosmos extends Flower {
    constructor(x, y, colorName = null) {
        super(x, y, 'cosmos', colorName);
        this.maxHeight = 90 + Math.random() * 100;
        this.flexibility = 0.85; // Very flexible - sways dramatically
        this.petalCount = 8;
    }

    drawFlowerHead(ctx, scale, env) {
        const rPetal = 16 * scale;
        const wPetal = 4.5 * scale;

        // 8 slightly notched elongated petals
        ctx.fillStyle = this.colors.petals;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / this.petalCount);
            ctx.beginPath();
            ctx.moveTo(-wPetal * 0.5, 0);
            ctx.quadraticCurveTo(-wPetal, -rPetal * 0.5, -wPetal * 0.25, -rPetal);
            // Slight notch at petal tip
            ctx.lineTo(0, -rPetal * 0.88);
            ctx.lineTo(wPetal * 0.25, -rPetal);
            ctx.quadraticCurveTo(wPetal, -rPetal * 0.5, wPetal * 0.5, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Yellow disc florets center
        ctx.fillStyle = this.colors.center;
        ctx.beginPath();
        ctx.arc(0, 0, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tiny dots on center
        ctx.fillStyle = 'rgba(250, 230, 60, 0.7)';
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 3 * scale, Math.sin(a) * 3 * scale, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * ----------------------------------------------------
 * Species: HYDRANGEA (ไฮเดรนเยีย)
 * ----------------------------------------------------
 */
class Hydrangea extends Flower {
    constructor(x, y, colorName = null) {
        super(x, y, 'hydrangea', colorName);
        this.maxHeight = 90 + Math.random() * 50;
        this.flexibility = 0.7; // heavier head bends more
    }

    drawFlowerHead(ctx, scale, env) {
        const size = 28 * scale;
        
        // Base globe
        ctx.fillStyle = this.colors.petalsDark;
        ctx.beginPath();
        ctx.arc(0, -size*0.2, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw many small flowers
        const flowerCount = 35;
        for(let i = 0; i < flowerCount; i++) {
            const a = (i * 2.39996) + this.phase; // Golden ratio angle
            const r = (i / flowerCount) * size * 0.8;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r - size*0.2;
            
            const fs = 6 * scale; // individual small flower size
            
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(a);
            
            // 4 petals
            ctx.fillStyle = (i % 3 === 0) ? this.colors.petalsLight : this.colors.petals;
            for(let p = 0; p < 4; p++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.ellipse(0, -fs*0.5, fs*0.4, fs*0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Tiny center
            ctx.fillStyle = this.colors.center || '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, fs*0.2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

// Global lookup map to easily instantiate flowers by string key
// Updated to pass colorName through factory
const FlowerFactory = {
    daisy: (x, y, colorName) => new Daisy(x, y, colorName),
    tulip: (x, y, colorName) => new Tulip(x, y, colorName),
    rose: (x, y, colorName) => new Rose(x, y, colorName),
    sunflower: (x, y, colorName) => new Sunflower(x, y, colorName),
    lavender: (x, y, colorName) => new Lavender(x, y, colorName),
    lily: (x, y, colorName) => new Lily(x, y, colorName),
    orchid: (x, y, colorName) => new Orchid(x, y, colorName),
    cosmos: (x, y, colorName) => new Cosmos(x, y, colorName),
    hydrangea: (x, y, colorName) => new Hydrangea(x, y, colorName),
};

window.FlowerFactory = FlowerFactory;

