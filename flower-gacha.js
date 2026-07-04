/**
 * FloraScape - Gacha System and 20 New Flowers
 * Extends the existing Flower classes with 20 new species using procedural generation and custom draw routines.
 */

// ─── Procedural Flower Helper ───────────────────────────────────────────────
class GenericFlower extends Flower {
    constructor(x, y, species, colorName, config) {
        super(x, y, species, colorName);
        this.config = config; // Contains petalCount, petalShape, centerSize, etc.
        // Support custom center color if defined
        if (config.customCenter) {
            this.colors.center = config.customCenter;
        }
    }

    drawFlowerHead(ctx, size, env) {
        ctx.save();
        ctx.scale(size, size);

        // Custom draw logic based on config
        if (this.config.customDraw) {
            this.config.customDraw(ctx, this.colors);
        } else {
            this._drawProcedural(ctx);
        }

        ctx.restore();
    }

    _drawProcedural(ctx) {
        const { petals, petalsRows, petalWidth, petalLength, centerSize, hasPoints, isFrilly } = this.config;
        
        // Draw Petals
        const rows = petalsRows || 1;
        for (let r = 0; r < rows; r++) {
            const currentPetals = petals - (r * 2);
            if (currentPetals <= 0) break;
            const currentLength = petalLength * (1 - (r * 0.15));
            const angleStep = (Math.PI * 2) / currentPetals;
            const offset = (r * Math.PI) / currentPetals; // Stagger rows
            
            ctx.fillStyle = r === 0 ? this.colors.petals : this._lighten(this.colors.petals, 20);
            
            for (let i = 0; i < currentPetals; i++) {
                ctx.save();
                ctx.rotate(i * angleStep + offset);
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                if (isFrilly) {
                    ctx.quadraticCurveTo(petalWidth, -currentLength * 0.3, petalWidth * 1.2, -currentLength * 0.6);
                    ctx.lineTo(petalWidth * 0.5, -currentLength * 0.8);
                    ctx.lineTo(0, -currentLength);
                    ctx.lineTo(-petalWidth * 0.5, -currentLength * 0.8);
                    ctx.quadraticCurveTo(-petalWidth * 1.2, -currentLength * 0.6, -petalWidth, -currentLength * 0.3);
                } else if (hasPoints) {
                    ctx.lineTo(petalWidth, -currentLength * 0.5);
                    ctx.lineTo(0, -currentLength);
                    ctx.lineTo(-petalWidth, -currentLength * 0.5);
                } else {
                    ctx.quadraticCurveTo(petalWidth, -currentLength * 0.5, 0, -currentLength);
                    ctx.quadraticCurveTo(-petalWidth, -currentLength * 0.5, 0, 0);
                }
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Draw Center
        ctx.beginPath();
        ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.center;
        ctx.fill();
    }

    _lighten(color, percent) {
        // Simple lighten for HSL or Hex, assuming HSL for simplicity if standard
        if (color.startsWith('hsl')) {
            return color.replace(/(\d+)%\)/, (match, p1) => `${Math.min(100, parseInt(p1) + percent)}%)`);
        }
        return color; // Fallback
    }
}

// ─── Define 20 New Flowers ──────────────────────────────────────────────────
const NewFlowersConfig = {
    // 1. Marigold
    'marigold': { petals: 24, petalsRows: 4, petalWidth: 6, petalLength: 15, centerSize: 5, isFrilly: true },
    // 2. Sakura
    'sakura': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, -10, 5, -20);
            ctx.lineTo(0, -16); // Cleft
            ctx.lineTo(-5, -20);
            ctx.quadraticCurveTo(-8, -10, 0, 0);
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
    }},
    // 3. Lotus
    'lotus': { petals: 12, petalsRows: 3, petalWidth: 8, petalLength: 22, centerSize: 6, hasPoints: true },
    // 4. Dandelion
    'dandelion': { customDraw: (ctx) => {
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.5;
        for (let i = 0; i < 60; i++) {
            ctx.save(); ctx.rotate((i * Math.PI * 2) / 60);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, -18); ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, -18, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#a3e635'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
    }},
    // 5. Bluebell
    'bluebell': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(15, 5, 10, 20);
        ctx.lineTo(5, 18); ctx.lineTo(0, 22); ctx.lineTo(-5, 18);
        ctx.lineTo(-10, 20); ctx.quadraticCurveTo(-15, 5, 0, -5); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 15, 2, 0, Math.PI*2); ctx.fill();
    }},
    // 6. Hibiscus
    'hibiscus': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        for(let i=0; i<5; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/5);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(15,-10,12,-25); ctx.quadraticCurveTo(0,-30,-12,-25); ctx.quadraticCurveTo(-15,-10,0,0); ctx.fill();
            ctx.restore();
        }
        // Stamen
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(5, -15, 10, -30); ctx.stroke();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(10, -30, 3, 0, Math.PI*2); ctx.fill();
    }},
    // 7. Peony
    'peony': { petals: 20, petalsRows: 5, petalWidth: 12, petalLength: 20, centerSize: 3, isFrilly: true },
    // 8. Daffodil
    'daffodil': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        for(let i=0; i<6; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/6);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(6,-10); ctx.lineTo(0,-22); ctx.lineTo(-6,-10); ctx.fill();
            ctx.restore();
        }
        // Trumpet
        ctx.fillStyle = colors.center; ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1; ctx.stroke();
    }},
    // 9. Carnation
    'carnation': { petals: 30, petalsRows: 4, petalWidth: 7, petalLength: 16, centerSize: 2, isFrilly: true },
    // 10. Morning Glory
    'morning_glory': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        ctx.beginPath(); ctx.arc(0,0,18,0,Math.PI*2); ctx.fill();
        // Star pattern inside
        ctx.fillStyle = '#ffffff';
        for(let i=0; i<5; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/5);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(2, -8); ctx.lineTo(0, -18); ctx.lineTo(-2, -8); ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
    }},
    // 11. Iris
    'iris': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        // Falls (down)
        for(let i=0; i<3; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/3);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(10,15,0,25); ctx.quadraticCurveTo(-10,15,0,0); ctx.fill();
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(0, 10, 2, 6, 0, 0, Math.PI*2); ctx.fill(); // Yellow beard
            ctx.restore();
        }
        // Standards (up)
        ctx.fillStyle = colors.petals;
        for(let i=0; i<3; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/3 + Math.PI/3);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(8,-15,0,-20); ctx.quadraticCurveTo(-8,-15,0,0); ctx.fill();
            ctx.restore();
        }
    }},
    // 12. Chrysanthemum
    'chrysanthemum': { petals: 40, petalsRows: 6, petalWidth: 2, petalLength: 18, centerSize: 4 },
    // 13. Poinsettia
    'poinsettia': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        for(let r=0; r<2; r++){
            const count = r === 0 ? 5 : 4;
            const offset = r === 0 ? 0 : Math.PI/4;
            for(let i=0; i<count; i++){
                ctx.save(); ctx.rotate(i*Math.PI*2/count + offset);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(8,-12,0,-25); ctx.quadraticCurveTo(-8,-12,0,0); ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-23); ctx.stroke(); // Vein
                ctx.restore();
            }
        }
        ctx.fillStyle = '#facc15'; // Cyathia
        for(let i=0; i<4; i++){
            ctx.beginPath(); ctx.arc(Math.cos(i)*3, Math.sin(i)*3, 1.5, 0, Math.PI*2); ctx.fill();
        }
    }},
    // 14. Water Lily
    'water_lily': { customDraw: (ctx, colors) => {
        // Pad
        ctx.fillStyle = '#15803d';
        ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 1.8); ctx.lineTo(0,0); ctx.fill();
        // Flower
        ctx.fillStyle = colors.petals;
        for(let r=0; r<3; r++){
            const count = 8 - r*2;
            for(let i=0; i<count; i++){
                ctx.save(); ctx.rotate(i*Math.PI*2/count + r*0.2);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(5, -8); ctx.lineTo(0, -18+r*3); ctx.lineTo(-5, -8); ctx.fill();
                ctx.restore();
            }
        }
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
    }},
    // 15. Poppy
    'poppy': { petals: 4, petalsRows: 1, petalWidth: 16, petalLength: 18, centerSize: 5, isFrilly: true, customCenter: '#1f2937' },
    // 16. Violet
    'violet': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        // 5 petals: 2 top, 2 side, 1 bottom
        const angles = [-0.6, 0.6, -1.8, 1.8, 3.14];
        const sizes = [12, 12, 14, 14, 16];
        for(let i=0; i<5; i++){
            ctx.save(); ctx.rotate(angles[i]);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(8,sizes[i]*0.5,0,sizes[i]); ctx.quadraticCurveTo(-8,sizes[i]*0.5,0,0); ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0,0,2,0,Math.PI*2); ctx.fill();
    }},
    // 17. Zinnia
    'zinnia': { petals: 16, petalsRows: 5, petalWidth: 5, petalLength: 14, centerSize: 6 },
    // 18. Pansy
    'pansy': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        // 5 large petals
        for(let i=0; i<5; i++){
            ctx.save(); ctx.rotate(i*Math.PI*2/5);
            ctx.beginPath(); ctx.arc(0, -10, 10, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
        // Face pattern
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath(); ctx.arc(-5, -5, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, -5, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(5, 8, 0, 12); ctx.quadraticCurveTo(-5, 8, 0, 0); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
    }},
    // 19. Snapdragon
    'snapdragon': { customDraw: (ctx, colors) => {
        ctx.fillStyle = colors.petals;
        // Spike
        for(let y=0; y>-30; y-=6){
            ctx.beginPath();
            ctx.ellipse(0, y, 6 - y*-0.1, 4, 0, 0, Math.PI*2);
            ctx.fill();
            // Lips
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(0, y+2, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = colors.petals;
        }
    }},
    // 20. Aster
    'aster': { petals: 30, petalsRows: 2, petalWidth: 3, petalLength: 16, centerSize: 5 }
};

// Register all 20 new flowers into the Factory
Object.keys(NewFlowersConfig).forEach(species => {
    window.FlowerFactory[species] = (x, y, colorName) => {
        return new GenericFlower(x, y, species, colorName, NewFlowersConfig[species]);
    };
});

// ─── Gacha System ───────────────────────────────────────────────────────────
window.GachaSystem = {
    // Rarity definitions and weights
    pools: [
        { 
            name: 'Common', 
            probability: 0.40, 
            color: '#94a3b8', 
            species: ['daisy', 'sunflower', 'cosmos', 'marigold', 'dandelion', 'pansy', 'violet', 'zinnia'] 
        },
        { 
            name: 'Uncommon', 
            probability: 0.30, 
            color: '#4ade80', 
            species: ['tulip', 'lavender', 'lily', 'carnation', 'morning_glory', 'aster', 'daffodil', 'bluebell'] 
        },
        { 
            name: 'Rare', 
            probability: 0.18, 
            color: '#60a5fa', 
            species: ['rose', 'hydrangea', 'hibiscus', 'iris', 'chrysanthemum', 'poppy', 'snapdragon'] 
        },
        { 
            name: 'Epic', 
            probability: 0.10, 
            color: '#c084fc', 
            species: ['orchid', 'peony', 'water_lily', 'poinsettia'] 
        },
        { 
            name: 'Legendary', 
            probability: 0.02, 
            color: '#fbbf24', 
            species: ['sakura', 'lotus'] 
        }
    ],

    rollFlower: function() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const pool of this.pools) {
            cumulative += pool.probability;
            if (rand <= cumulative) {
                const randomSpecies = pool.species[Math.floor(Math.random() * pool.species.length)];
                return {
                    rarity: pool.name,
                    color: pool.color,
                    species: randomSpecies
                };
            }
        }
        // Fallback
        return { rarity: 'Common', color: '#94a3b8', species: 'daisy' };
    }
};
