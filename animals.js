/**
 * FloraScape - Animal System (Phase 5)
 * Handles ground animals like Rabbits and Frogs.
 */

class Rabbit {
    constructor(canvas, env) {
        this.canvas = canvas;
        this.env = env;
        
        // Start from either left or right edge
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.x = Math.random() < 0.5 ? -20 : canvas.width + 20;
        const horizon = this.env.horizonY || (this.canvas.height * 0.65);
        this.groundY = horizon + Math.random() * (this.canvas.height - horizon);
        this.y = this.groundY;
        
        this.state = 'hopping'; // hopping, sniffing, idle
        this.stateTimer = 0;
        
        this.vx = 0;
        this.vy = 0;
        this.jumpPower = -4 - Math.random() * 2;
        this.speed = 1.5 + Math.random();
        this.gravity = 0.4;
        
        this.color = Math.random() < 0.5 ? '#f3f4f6' : '#d1d5db'; // White or light gray
        this.size = 12 + Math.random() * 4;
        
        this.dead = false;
        this.age = 0;
        this.maxAge = 3000; // Lives for a while before wandering off
    }

    update(flowers) {
        this.age++;
        if (this.age > this.maxAge) {
            // Wander off screen
            this.state = 'hopping';
            if (this.x < -100 || this.x > this.canvas.width + 100) {
                this.dead = true;
            }
        }
        
        this.stateTimer--;

        if (this.state === 'idle' || this.state === 'sniffing') {
            if (this.stateTimer <= 0) {
                this.state = 'hopping';
            }
        } else if (this.state === 'hopping') {
            // Apply gravity
            this.vy += this.gravity;
            this.y += this.vy;
            this.x += this.vx;

            // Hit ground
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.vx = 0;

                // Randomly decide next action
                if (Math.random() < 0.05 && this.age < this.maxAge - 300) {
                    this.state = 'idle';
                    this.stateTimer = 60 + Math.random() * 120;
                    
                    // Look for a nearby flower to sniff
                    for (const f of flowers) {
                        if (Math.abs(f.x - this.x) < 40 && f.lifecycle === 'bloomed') {
                            this.state = 'sniffing';
                            this.stateTimer = 100 + Math.random() * 100;
                            this.direction = f.x > this.x ? 1 : -1;
                            break;
                        }
                    }
                } else {
                    // Jump again
                    this.vy = this.jumpPower;
                    this.vx = this.speed * this.direction;
                    // Randomly change direction occasionally if not leaving
                    if (this.age < this.maxAge - 300 && Math.random() < 0.1 && this.x > 50 && this.x < this.canvas.width - 50) {
                        this.direction *= -1;
                    }
                }
            }
        }
    }

    draw(ctx) {
        const scale = this.env.getDepthScale ? this.env.getDepthScale(this.y) : 1;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction * scale, scale);
        
        // Body animation
        let bodyLift = 0;
        let earRotate = 0;
        
        if (this.state === 'hopping' && this.vy < 0) {
            bodyLift = -2;
            earRotate = -0.3;
        } else if (this.state === 'sniffing') {
            earRotate = Math.sin(this.age * 0.1) * 0.2; // twitch ears
        }

        // Draw body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.6 + bodyLift, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw head
        ctx.beginPath();
        ctx.ellipse(this.size * 0.7, -this.size + bodyLift, this.size * 0.6, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw ears
        ctx.save();
        ctx.translate(this.size * 0.5, -this.size * 1.4 + bodyLift);
        ctx.rotate(earRotate);
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.6, this.size * 0.2, this.size * 0.8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Inner ear
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.6, this.size * 0.1, this.size * 0.6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Tail
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-this.size * 0.9, -this.size * 0.5 + bodyLift, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(this.size * 0.8, -this.size * 1.1 + bodyLift, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Frog {
    constructor(canvas, env) {
        this.canvas = canvas;
        this.env = env;
        
        this.x = Math.random() * canvas.width;
        const horizon = this.env.horizonY || (this.canvas.height * 0.65);
        this.groundY = horizon + Math.random() * (this.canvas.height - horizon);
        this.y = this.groundY;
        
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.state = 'idle';
        this.stateTimer = 100 + Math.random() * 200;
        
        this.vx = 0;
        this.vy = 0;
        
        this.size = 8 + Math.random() * 3;
        this.dead = false;
    }

    update() {
        // Frogs leave when it stops raining
        if (!this.env.rainEnabled) {
            this.dead = true;
        }

        if (this.state === 'idle') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'hopping';
                this.vy = -3 - Math.random() * 3;
                this.vx = (1 + Math.random() * 2) * this.direction;
            }
        } else if (this.state === 'hopping') {
            this.vy += 0.5; // gravity
            this.y += this.vy;
            this.x += this.vx;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.vx = 0;
                this.state = 'idle';
                this.stateTimer = 60 + Math.random() * 150;
                
                if (Math.random() < 0.3) this.direction *= -1;
                
                if (this.x < -20 || this.x > this.canvas.width + 20) {
                    this.dead = true;
                }
            }
        }
    }

    draw(ctx) {
        const scale = this.env.getDepthScale ? this.env.getDepthScale(this.y) : 1;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction * scale, scale);
        
        let jumpExt = 0;
        if (this.state === 'hopping') jumpExt = -2;

        ctx.fillStyle = '#4ade80'; // Green

        // Body
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.5 + jumpExt, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.9 + jumpExt, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class AnimalManager {
    constructor(canvas, env) {
        this.canvas = canvas;
        this.env = env;
        this.animals = [];
        this.spawnTimer = 0;
    }

    update(flowers) {
        this.spawnTimer++;
        
        // Autopilot spawning
        if (this.env.autopilot) {
            // Spawn rabbit occasionally
            if (this.spawnTimer % 900 === 0 && Math.random() < 0.4) {
                if (this.animals.filter(a => a instanceof Rabbit).length < 2) {
                    this.animals.push(new Rabbit(this.canvas, this.env));
                }
            }
            
            // Spawn frog during rain
            if (this.env.rainEnabled && this.spawnTimer % 300 === 0 && Math.random() < 0.6) {
                if (this.animals.filter(a => a instanceof Frog).length < 4) {
                    this.animals.push(new Frog(this.canvas, this.env));
                }
            }
        }

        // Update animals
        for (let i = this.animals.length - 1; i >= 0; i--) {
            const a = this.animals[i];
            if (a.dead) {
                this.animals.splice(i, 1);
            } else {
                a.update(flowers);
            }
        }
    }

    draw(ctx) {
        for (const a of this.animals) {
            a.draw(ctx);
        }
    }
}

window.AnimalManager = AnimalManager;
