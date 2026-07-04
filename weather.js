/**
 * FloraScape - Weather & Environment System
 * Handles time-of-day gradient transitions, celestial bodies, wind math, rain particles, and fireflies.
 */

class Environment {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Environment values
        this.timeOfDay = 12.0; // 0.0 to 24.0 (Hours)
        this.windSpeed = 1.2;  // Slider speed multiplier
        this.windAngle = 0.05; // Base angle (swaying to the right)
        this.windOffset = 0.0; // Time-based accumulation for sway calculations
        this.rainEnabled = false;
        
        // Autopilot state (Phase 2 & 5)
        this.autopilot = true;
        this.onWeatherChange = null; // callback to update UI
        this.autopilotTimer = 0;
        
        this.weatherState = 'clear'; // clear, rain, fog
        this.fogDensity = 0;
        
        // Particle systems
        this.particles = [];
        this.fireflies = [];
        this.clouds = [];
        this.grassPatches = [];
        
        this.horizonY = this.canvas.height * 0.65;
        this.groundHeight = this.canvas.height - this.horizonY;
        
        this.initClouds();
        this.initGrass();
        this.initFireflies(40);
    }

    /**
     * Set up some initial clouds drifting across the sky
     */
    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.3) + 50,
                width: Math.random() * 120 + 80,
                height: Math.random() * 40 + 20,
                speed: Math.random() * 0.15 + 0.05
            });
        }
    }

    /**
     * Reinitialize clouds when resizing window
     */
    resize() {
        this.horizonY = this.canvas.height * 0.65;
        this.groundHeight = this.canvas.height - this.horizonY;
        this.clouds = [];
        this.initClouds();
        this.initGrass();
    }
    
    /**
     * Initialize scattered grass patches across the meadow
     */
    initGrass() {
        this.grassPatches = [];
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        const flowerColors = ['#fca5a5', '#fde047', '#93c5fd', '#d8b4fe', '#fdba74', '#ffffff'];
        for (let i = 0; i < 250; i++) {
            const x = Math.random() * w;
            const y = this.horizonY + Math.random() * this.groundHeight;
            const scale = this.getDepthScale(y);
            
            let color = '#4ade80'; // Default mid (brighter to stand out from gradient)
            if (y < this.horizonY + h * 0.1) color = '#86efac'; // Back
            else if (y > this.horizonY + h * 0.25) color = '#22c55e'; // Front
            
            const hasFlower = Math.random() < 0.25; // 25% chance of being a tiny wildflower patch
            const fColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            
            this.grassPatches.push({
                x, y, scale, color,
                hasFlower, flowerColor: fColor,
                blades: Math.floor(4 + Math.random() * 4), // 4-7 blades
                height: 14 + Math.random() * 12
            });
        }
    }

    /**
     * Get Depth Scale based on Y coordinate for 3D perspective
     */
    getDepthScale(y) {
        if (y < this.horizonY) return 0.3;
        const depth = (y - this.horizonY) / this.groundHeight;
        return 0.3 + depth * 0.7; // From 30% scale at horizon to 100% scale at bottom
    }

    /**
     * Initialize nocturnal firefly particles
     */
    initFireflies(count) {
        this.fireflies = [];
        for (let i = 0; i < count; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.6) + (this.canvas.height * 0.25),
                vx: Math.random() * 0.4 - 0.2,
                vy: Math.random() * 0.4 - 0.2,
                size: Math.random() * 2 + 1,
                alpha: Math.random(),
                pulseSpeed: Math.random() * 0.02 + 0.01,
                colorAngle: Math.random() * 360
            });
        }
    }

    /**
     * Linearly interpolate between two RGB arrays
     */
    interpolateColor(colorA, colorB, factor) {
        const result = [];
        for (let i = 0; i < 3; i++) {
            result.push(Math.round(colorA[i] + (colorB[i] - colorA[i]) * factor));
        }
        return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
    }

    /**
     * Get sky gradient colors based on time of day (24-hour scale)
     */
    getSkyGradient() {
        const hour = this.timeOfDay;
        
        // Define key colors at different times
        // Format: [R, G, B]
        const colors = {
            midnight: [8, 10, 24],      // Deep night sky
            dawnSky: [34, 25, 62],      // Sunrise start
            dawnGold: [235, 120, 68],   // Sunrise highlight
            dayBlue: [56, 189, 248],    // Vibrant Midday sky
            dayWhite: [186, 230, 253],  // Midday bottom gradient
            sunsetGold: [239, 68, 68],  // Sunset base
            sunsetViolet: [88, 28, 135], // Sunset peak
        };
        
        let topColor, bottomColor;

        if (hour >= 0 && hour < 5) {
            // Late night -> Early dawn
            const f = hour / 5;
            topColor = this.interpolateColor(colors.midnight, colors.dawnSky, f);
            bottomColor = this.interpolateColor([2, 3, 10], colors.midnight, f);
        } else if (hour >= 5 && hour < 7) {
            // Sunrise (Dawn)
            const f = (hour - 5) / 2;
            topColor = this.interpolateColor(colors.dawnSky, colors.dayBlue, f);
            bottomColor = this.interpolateColor(colors.dawnGold, colors.dayWhite, f);
        } else if (hour >= 7 && hour < 16) {
            // Daytime
            const f = (hour - 7) / 9;
            topColor = this.interpolateColor(colors.dayBlue, colors.dayBlue, f); // Constant daytime blue
            bottomColor = this.interpolateColor(colors.dayWhite, [254, 253, 246], f);
        } else if (hour >= 16 && hour < 19) {
            // Sunset (Dusk)
            const f = (hour - 16) / 3;
            topColor = this.interpolateColor(colors.dayBlue, colors.sunsetViolet, f);
            bottomColor = this.interpolateColor(colors.dayWhite, colors.sunsetGold, f);
        } else if (hour >= 19 && hour < 21) {
            // Twilight
            const f = (hour - 19) / 2;
            topColor = this.interpolateColor(colors.sunsetViolet, colors.midnight, f);
            bottomColor = this.interpolateColor(colors.sunsetGold, [12, 10, 30], f);
        } else {
            // Night
            const f = (hour - 21) / 3;
            topColor = this.interpolateColor(colors.midnight, colors.midnight, f);
            bottomColor = this.interpolateColor([12, 10, 30], [2, 3, 10], f);
        }

        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, bottomColor);
        
        return grad;
    }

    /**
     * Update environment states (animations, particles, wind offset)
     */
    update() {
        // Autopilot updates (Phase 2 & 5)
        if (this.autopilot) {
            // 1. Time progression: VERY slow (0.0005 hours per frame) -> Phase 5
            this.timeOfDay = (this.timeOfDay + 0.0005) % 24;

            // 2. Wind modulation: Slow, natural sine oscillation between 0.6 and 3.4
            const baseWind = 1.6 + Math.sin(this.windOffset * 0.08) * 1.0;
            this.windSpeed = this.windSpeed + (baseWind - this.windSpeed) * 0.005;

            // 3. Weather simulation: Check to toggle rain or fog every ~40 seconds
            this.autopilotTimer++;
            if (this.autopilotTimer > 2000) {
                this.autopilotTimer = 0;
                
                const rand = Math.random();
                if (rand < 0.15) {
                    this.weatherState = 'rain';
                    this.rainEnabled = true;
                } else if (rand < 0.3) {
                    this.weatherState = 'fog';
                    this.rainEnabled = false;
                } else {
                    this.weatherState = 'clear';
                    this.rainEnabled = false;
                }

                if (window.floraAudio) {
                    window.floraAudio.setRain(this.rainEnabled);
                }
            }
            
            // Handle fog transition
            if (this.weatherState === 'fog') {
                this.fogDensity = Math.min(0.6, this.fogDensity + 0.001);
            } else {
                this.fogDensity = Math.max(0, this.fogDensity - 0.002);
            }

            // Trigger UI update callback
            if (this.onWeatherChange) {
                this.onWeatherChange({
                    timeOfDay: this.timeOfDay,
                    windSpeed: this.windSpeed,
                    rainEnabled: this.rainEnabled
                });
            }
        }

        // Accumulate wind time offset for smooth swaying math
        // Wind speed influences how fast it cycles through the sine wave
        this.windOffset += 0.015 * this.windSpeed;
        
        // Add random turbulence to wind
        this.windAngle = 0.05 + Math.sin(this.windOffset * 0.5) * 0.06 * this.windSpeed;

        // Update clouds
        this.clouds.forEach(cloud => {
            // Cloud speed varies based on wind speed setting
            cloud.x += cloud.speed * (0.5 + this.windSpeed * 0.4);
            if (cloud.x - cloud.width > this.canvas.width) {
                cloud.x = -cloud.width;
                cloud.y = Math.random() * (this.canvas.height * 0.3) + 50;
            }
        });

        // Update Rain Particles
        if (this.rainEnabled) {
            // Add new raindrops (scaled with wind speed)
            const dropCount = Math.floor(2 + this.windSpeed);
            for (let i = 0; i < dropCount; i++) {
                this.particles.push({
                    x: Math.random() * (this.canvas.width + 300) - 150, // extend bounds for slanted rain
                    y: -20,
                    targetY: this.horizonY + Math.random() * this.groundHeight, // splash anywhere on hills
                    vy: Math.random() * 10 + 15, // fall velocity
                    vx: (this.windSpeed * 1.5) * (this.windAngle > 0 ? 1 : -1), // wind slant
                    length: Math.random() * 20 + 15,
                    opacity: Math.random() * 0.4 + 0.3
                });
            }
        }

        // Move rain particles and handle collisions
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.type === 'splash') continue;
            
            p.x += p.vx;
            p.y += p.vy;

            // Ground level check
            if (p.targetY && p.y >= p.targetY) {
                // Spawn ripple splash effect
                this.particles[i] = {
                    type: 'splash',
                    x: p.x,
                    y: p.targetY,
                    radius: 1,
                    maxRadius: Math.random() * 5 + 3,
                    opacity: 0.5,
                    growthSpeed: 0.4
                };
            }
        }

        // Update splash ripples
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.type === 'splash') {
                p.radius += p.growthSpeed;
                p.opacity -= 0.05;
                if (p.opacity <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Update Fireflies (only float significantly at night)
        const isNight = this.timeOfDay > 19 || this.timeOfDay < 5;
        this.fireflies.forEach(f => {
            // Wandering random movements
            f.x += f.vx + Math.sin(this.windOffset + f.colorAngle) * 0.15;
            f.y += f.vy + Math.cos(this.windOffset * 0.5 + f.colorAngle) * 0.1;
            
            // Pulse glow alpha
            f.alpha += f.pulseSpeed;
            if (f.alpha > 1 || f.alpha < 0) {
                f.pulseSpeed = -f.pulseSpeed;
            }

            // Wrap bounds
            if (f.x < 0) f.x = this.canvas.width;
            if (f.x > this.canvas.width) f.x = 0;
            if (f.y < 0) f.y = this.canvas.height - this.groundHeight;
            if (f.y > this.canvas.height - this.groundHeight) f.y = this.canvas.height * 0.3;
        });
    }

    /**
     * Draw the sky, stars, sun, moon, clouds, and particles
     */
    draw() {
        const h = this.canvas.height;
        const w = this.canvas.width;

        // 1. Draw Sky Background Gradient
        this.ctx.fillStyle = this.getSkyGradient();
        this.ctx.fillRect(0, 0, w, h);

        // 2. Draw Stars (if night)
        const nightFactor = this.getNightFactor();
        if (nightFactor > 0.05) {
            this.drawStars(nightFactor);
        }

        // 3. Draw Sun or Moon
        this.drawCelestialBodies();

        // 4. Draw Clouds
        this.drawClouds();

        // 5. Draw Soil/Grass Base Layer
        this.drawGround();

        // 6. Draw Rain / Splash Particles
        this.drawParticles();

        // 7. Draw Fireflies (glow effect)
        if (nightFactor > 0.1) {
            this.drawFireflies(nightFactor);
        }
    }

    /**
     * Calculate how dark it is (0.0 = daytime, 1.0 = pitch black midnight)
     */
    getNightFactor() {
        const hour = this.timeOfDay;
        if (hour >= 20 || hour < 4) return 1.0;
        if (hour >= 4 && hour < 6) return 1.0 - (hour - 4) / 2; // fade out
        if (hour >= 18 && hour < 20) return (hour - 18) / 2;    // fade in
        return 0.0;
    }

    /**
     * Render background stars based on night darkness
     */
    drawStars(opacity) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
        
        // Seeded random stars so they don't jump around
        let starSeed = 12345;
        const starRandom = () => {
            const x = Math.sin(starSeed++) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i < 60; i++) {
            const x = starRandom() * this.canvas.width;
            const y = starRandom() * (this.canvas.height * 0.5);
            const size = starRandom() * 1.5 + 0.5;
            
            // Twinkle effect using sine
            const twinkle = Math.sin(this.windOffset * 2 + i) * 0.4 + 0.6;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * twinkle * 0.8})`;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    /**
     * Draw the Sun or Moon along an arc path
     */
    drawCelestialBodies() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const hour = this.timeOfDay;

        // Coordinate calculations (moves from bottom-left to top-middle to bottom-right)
        // Day arc: hour 6 to 18
        // Night arc: hour 18 to 6
        
        let isDay = hour >= 6 && hour < 18;
        let progress = 0;
        
        if (isDay) {
            progress = (hour - 6) / 12; // 0.0 at dawn, 1.0 at dusk
        } else {
            progress = hour >= 18 ? (hour - 18) / 12 : (hour + 6) / 12; // night progress
        }

        // Path math (ellipse arc)
        const cx = w * progress;
        const cy = h * 0.55 - Math.sin(progress * Math.PI) * (h * 0.4);

        this.ctx.save();
        
        if (isDay) {
            // Draw Sun
            const radius = 45;
            
            // Sun glow gradient
            const sunGlow = this.ctx.createRadialGradient(cx, cy, 5, cx, cy, radius * 3);
            sunGlow.addColorStop(0, 'rgba(255, 253, 230, 1)');
            sunGlow.addColorStop(0.2, 'rgba(251, 191, 36, 0.6)');
            sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            
            this.ctx.fillStyle = sunGlow;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner Sun Core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Sunbeams (subtle lines)
            if (this.windSpeed < 3.5) { // not during storm
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4 + (this.windOffset * 0.1);
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx + Math.cos(angle) * (radius + 5), cy + Math.sin(angle) * (radius + 5));
                    this.ctx.lineTo(cx + Math.cos(angle) * (radius * 2), cy + Math.sin(angle) * (radius * 2));
                    this.ctx.stroke();
                }
            }
        } else {
            // Draw Moon
            const radius = 35;
            
            // Moon Glow
            const moonGlow = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 2.5);
            moonGlow.addColorStop(0, 'rgba(224, 242, 254, 0.5)');
            moonGlow.addColorStop(0.3, 'rgba(186, 230, 253, 0.15)');
            moonGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
            
            this.ctx.fillStyle = moonGlow;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Moon crescent shape
            this.ctx.fillStyle = '#f8fafc';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner dark shade representing the shadow to make it a crescent moon
            this.ctx.fillStyle = this.getSkyColorAtPoint(cx, cy);
            this.ctx.beginPath();
            // Offset a little to the right and top
            this.ctx.arc(cx + 8, cy - 6, radius - 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    /**
     * Helper to sample sky background color approximate values (reduces edge artifact in moon)
     */
    getSkyColorAtPoint(x, y) {
        const hour = this.timeOfDay;
        if (hour >= 20 || hour < 4) return '#050711';
        if (hour >= 16 && hour < 19) return '#401b5a'; // Twilight violet
        return '#0c0f1d';
    }

    /**
     * Draw fluffy, drifting clouds
     */
    drawClouds() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        
        // Adjust cloud opacity during sunset/night
        const isNight = this.timeOfDay > 19 || this.timeOfDay < 5;
        const hour = this.timeOfDay;
        
        if (isNight) {
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        } else if (hour >= 16 && hour < 19) {
            // Pinkish sunset clouds
            this.ctx.fillStyle = 'rgba(254, 205, 211, 0.7)';
        } else {
            // Bright white fluffy clouds for daytime
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        }

        this.clouds.forEach(c => {
            const cx = c.x;
            const cy = c.y;
            
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, c.height * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cx + c.width * 0.25, cy - c.height * 0.3, c.height, 0, Math.PI * 2);
            this.ctx.arc(cx + c.width * 0.5, cy - c.height * 0.2, c.height * 1.1, 0, Math.PI * 2);
            this.ctx.arc(cx + c.width * 0.75, cy, c.height * 0.8, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }

    _drawGrassyHill(ctx, p0, p1, p2, p3, fillStyle, fringeColor, h, baseScale) {
        // Draw the smooth base hill
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.lineTo(p3.x, h);
        ctx.lineTo(p0.x, h);
        ctx.fill();

        // Draw grass fringe along the curve
        ctx.fillStyle = fringeColor;
        ctx.beginPath();
        
        const w = p3.x - p0.x;
        const stepCount = Math.floor(w / (8 * baseScale));
        
        for (let i = 0; i <= stepCount; i++) {
            const t = i / stepCount;
            const mt = 1 - t;
            
            // Cubic bezier interpolation for X and Y
            const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
            const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
            
            // Use deterministic height based on x
            const hGrass = (10 + (Math.sin(x * 77) * 0.5 + 0.5) * 15) * baseScale;
            const tilt = Math.sin(this.windOffset + x * 0.02) * 8 * this.windSpeed * baseScale;
            
            ctx.moveTo(x - 2 * baseScale, y + 2);
            ctx.quadraticCurveTo(x, y - hGrass * 0.5, x + tilt, y - hGrass);
            ctx.quadraticCurveTo(x + 2 * baseScale, y - hGrass * 0.5, x + 4 * baseScale, y + 2);
        }
        ctx.fill();
    }

    /**
     * Draw the dirt floor and silhouette blades of background grass
     */
    drawGround() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const horizon = this.horizonY;
        const ctx = this.ctx;
        
        ctx.save();
        
        let isNight = (this.timeOfDay < 5 || this.timeOfDay >= 19);
        let alpha = isNight ? 0.35 : 1.0;
        
        // Hill 1 (Back)
        const grad1 = ctx.createLinearGradient(0, horizon, 0, h);
        grad1.addColorStop(0, `rgba(167, 243, 208, ${alpha})`); // Emerald 200
        grad1.addColorStop(1, `rgba(52, 211, 153, ${alpha})`);  // Emerald 400
        
        const s1 = this.getDepthScale(horizon + h * 0.05);
        this._drawGrassyHill(ctx, 
            {x: 0, y: horizon + h * 0.05}, 
            {x: w * 0.3, y: horizon - h * 0.02}, 
            {x: w * 0.7, y: horizon + h * 0.08}, 
            {x: w, y: horizon + h * 0.02}, 
            grad1,
            isNight ? `rgba(6, 78, 59, ${alpha})` : grad1,
            h, s1);
        
        // Hill 2 (Mid)
        const grad2 = ctx.createLinearGradient(0, horizon + h * 0.05, 0, h);
        grad2.addColorStop(0, `rgba(134, 239, 172, ${alpha})`); // Green 300
        grad2.addColorStop(1, `rgba(34, 197, 94, ${alpha})`);   // Green 500
        
        const s2 = this.getDepthScale(horizon + h * 0.1);
        this._drawGrassyHill(ctx,
            {x: 0, y: horizon + h * 0.1},
            {x: w * 0.4, y: horizon + h * 0.04},
            {x: w * 0.8, y: horizon + h * 0.12},
            {x: w, y: horizon + h * 0.06},
            grad2,
            isNight ? `rgba(6, 78, 59, ${alpha})` : grad2,
            h, s2);
        
        // Hill 3 (Front)
        const grad3 = ctx.createLinearGradient(0, horizon + h * 0.15, 0, h);
        grad3.addColorStop(0, `rgba(74, 222, 128, ${alpha})`); // Green 400
        grad3.addColorStop(1, `rgba(21, 128, 61, ${alpha})`);  // Green 700
        
        const s3 = this.getDepthScale(horizon + h * 0.25);
        this._drawGrassyHill(ctx,
            {x: 0, y: horizon + h * 0.25},
            {x: w * 0.25, y: horizon + h * 0.15},
            {x: w * 0.7, y: horizon + h * 0.3},
            {x: w, y: horizon + h * 0.2},
            grad3,
            isNight ? `rgba(6, 78, 59, ${alpha})` : grad3,
            h, s3);
        
        // Draw scattered Grass Patches & Wildflowers
        this.grassPatches.forEach(patch => {
            ctx.save();
            ctx.translate(patch.x, patch.y);
            
            // Draw a subtle dirt/shadow base
            ctx.fillStyle = isNight ? `rgba(2, 44, 34, ${alpha})` : `rgba(20, 83, 45, 0.25)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, patch.blades * 2.5 * patch.scale, 2.5 * patch.scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Blades
            ctx.fillStyle = isNight ? `rgba(6, 78, 59, ${alpha})` : patch.color;
            
            for (let i = 0; i < patch.blades; i++) {
                ctx.save();
                
                // Fan out blades naturally
                const maxFan = 0.6; // radians
                const fanTilt = (i / (patch.blades <= 1 ? 1 : patch.blades - 1) - 0.5) * maxFan;
                const windTilt = Math.sin(this.windOffset + patch.x * 0.02) * 0.3 * this.windSpeed;
                ctx.rotate(fanTilt + windTilt);
                
                // Height variation: taller in the middle
                const centerDist = Math.abs(i - (patch.blades - 1)/2) / (patch.blades/2);
                const hFactor = 0.6 + 0.4 * (1 - centerDist); // 0.6 at edges, 1.0 at center
                // Deterministic tiny random jitter per blade
                const jitter = Math.sin(patch.x * 99 + i * 11) * 0.15;
                const hGrass = patch.height * patch.scale * (hFactor + jitter);
                const wGrass = 2.5 * patch.scale;
                
                ctx.beginPath();
                ctx.moveTo(-wGrass, 0);
                ctx.quadraticCurveTo(-wGrass * 0.5, -hGrass * 0.5, 0, -hGrass);
                ctx.quadraticCurveTo(wGrass * 0.5, -hGrass * 0.5, wGrass, 0);
                ctx.fill();
                
                ctx.restore();
            }
            
            // Tiny wildflowers in some patches
            if (patch.hasFlower && !isNight) {
                const windTilt = Math.sin(this.windOffset + patch.x * 0.02) * 4 * this.windSpeed * patch.scale;
                ctx.fillStyle = patch.flowerColor;
                ctx.beginPath();
                // Draw 2-3 tiny dots representing small wild flowers
                ctx.arc(windTilt - 2 * patch.scale, -patch.height * patch.scale * 0.7, 1.8 * patch.scale, 0, Math.PI * 2);
                ctx.arc(windTilt + 3 * patch.scale, -patch.height * patch.scale * 0.6, 1.5 * patch.scale, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    /**
     * Draw weather effects (Rain or Rain Splashes)
     */
    drawParticles() {
        this.ctx.save();
        
        this.particles.forEach(p => {
            if (p.type === 'splash') {
                // Splash ripple
                this.ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.ellipse(p.x, p.y, p.radius, p.radius * 0.3, 0, 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                // Raindrop line
                this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
                this.ctx.lineWidth = 1.2;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx * 0.8, p.y + p.length);
                this.ctx.stroke();
            }
        });
        
        this.ctx.restore();
    }

    /**
     * Draw glowing firefly particles
     */
    drawFireflies(nightOpacity) {
        this.ctx.save();
        
        this.fireflies.forEach(f => {
            const glowRadius = f.size * (2 + f.alpha * 3);
            
            // Radial gradient glow
            const glow = this.ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, glowRadius);
            glow.addColorStop(0, `rgba(253, 254, 203, ${f.alpha * nightOpacity})`);
            glow.addColorStop(0.3, `rgba(234, 250, 12, ${f.alpha * 0.4 * nightOpacity})`);
            glow.addColorStop(1, 'rgba(234, 250, 12, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();

            // Firefly core
            this.ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha * nightOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, f.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }
}

// Attach to window so other scripts can access
window.Environment = Environment;
