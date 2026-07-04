/**
 * FloraScape - Main Coordinator Script (Phase 3 — Living Ecosystem)
 * Wires together: Environment, Flowers, Insects, Learning Mode
 * Features:
 *  - Ground-only planting (Shift+Click = summon insect at position)
 *  - Color picker & species selector
 *  - Autopilot weather syncs sliders
 *  - InsectManager (butterfly / bee)
 *  - Seed germination callback (onSeedLanded)
 *  - LearningMode (click a flower to open diagram)
 *  - Growth stimuli: temperature (time) + soil moisture (rain)
 */

// ─── Global State ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

window.onerror = function(message, source, lineno, colno, error) {
    alert("Error: " + message + " at " + source + ":" + lineno);
    return false;
};

let env = null;
const flowers = [];
let insectMgr = null;
let animalMgr = null; // Added in Phase 5
let learnMode = null;
const magicParticles = []; // For fun mouse interaction
let isDragging = false;

// Floating texts for Gacha announcements
const floatingTexts = [];

// Collection State
let unlockedFlowers = {};

// Toolbar & Tools State
let currentTool = 'plant'; // 'plant', 'magic', 'summon', 'inspect'

let selectedFlowerType = 'daisy';
let selectedColorName = 'white';

function renderColorPalette() {
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.remove('locked');
        dot.classList.remove('active');
        if (dot.dataset.color === selectedColorName) {
            dot.classList.add('active');
        }
    });
}


// ─── DOM Elements ─────────────────────────────────────────────────────────────
const timeSlider   = document.getElementById('time-slider');
const timeValueLabel = document.getElementById('time-value');
const windSlider   = document.getElementById('wind-slider');
const windValueLabel = document.getElementById('wind-value');
const soundBtn     = document.getElementById('sound-btn');
const rainBtn      = document.getElementById('rain-btn');
const autoBtn      = document.getElementById('auto-btn');
const clearBtn     = document.getElementById('clear-btn');
const instructionBanner = document.getElementById('instructions');
const closeInstructionsBtn = document.getElementById('close-instructions-btn');
const weatherStatusText = document.getElementById('weather-status-text');
const autoWeatherToggle = document.getElementById('auto-weather-toggle');


const soundOnIcon  = document.querySelector('.sound-on-icon');
const soundOffIcon = document.querySelector('.sound-off-icon');

// ─── Init ─────────────────────────────────────────────────────────────────────
function initApp() {
    resizeCanvas();

    env = new Environment(canvas, ctx);

    // Autopilot callback → sync sliders + rain btn
    env.onWeatherChange = (state) => {
        timeSlider.value = state.timeOfDay;
        updateTimeLabel(state.timeOfDay);
        windSlider.value = Math.min(5, Math.max(0.1, state.windSpeed));
        updateWindLabel(state.windSpeed);
        if (state.rainEnabled) {
            rainBtn.classList.add('active');
            rainBtn.querySelector('span').textContent = 'ปิดฝนตก';
        } else {
            rainBtn.classList.remove('active');
            rainBtn.querySelector('span').textContent = 'เปิดฝนตก';
        }
        updateWeatherText();
    };

    updateTimeLabel(parseFloat(timeSlider.value));
    updateWindLabel(parseFloat(windSlider.value));

    // Insect manager
    insectMgr = new InsectManager(canvas);

    // Animal manager (Phase 5)
    animalMgr = new AnimalManager(canvas, env);

    // Learning mode
    learnMode = new LearningMode(canvas, flowers);

    // Export flowers for cross-breeding
    window.flowers = flowers;

    // Seed germination callback
    window.onSeedLanded = (sx, sy, species, color = null) => {
        // Plant exactly at the seed's Y coordinate (which is near the mother plant)
        const finalColor = color || 'red';
        const factory = window.FlowerFactory[species];
        if (factory && flowers.length < 150) {
            const seedling = factory(sx, sy, finalColor);
            seedling.growth = 0;
            seedling.baseGrowthSpeed *= 0.7; // seedlings grow slightly slower
            flowers.push(seedling);
            
            // Fun visual pop effect
            for (let i = 0; i < 8; i++) {
                magicParticles.push({
                    x: sx + (Math.random() - 0.5) * 20,
                    y: sy + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -1 - Math.random() * 2,
                    life: 20 + Math.random() * 20,
                    size: 2 + Math.random() * 4,
                    color: '250, 204, 21' // Gold/Yellow sparkle
                });
            }
            
            if (window.floraAudio && !window.floraAudio.isMuted) {
                window.floraAudio.playChime();
            }
        }
    };
    
    renderColorPalette();

    window.addEventListener('resize', resizeCanvas);
    setupUIEventListeners();
    setupCanvasListeners();

    autoPlantFlowers(12);

    requestAnimationFrame(mainLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (env) env.resize(canvas.width, canvas.height);
}

// ─── Collection UI ─────────────────────────────────────────────────────────────
const FLOWER_EMOJI = {
    daisy: '🏵️', tulip: '🌷', rose: '🌹', sunflower: '🌻',
    lavender: '💜', orchid: '🌸', lotus: '🌸', cherry: '🌸',
    lily: '🥏', iris: '💜', cosmos: '🏵️', peony: '🌸',
};

function updateCollectionUI(species, rarityInfo) {
    // Remove empty state
    const emptyEl = document.querySelector('.collection-empty');
    if (emptyEl) emptyEl.remove();

    if (!unlockedFlowers[species]) {
        unlockedFlowers[species] = { count: 1, rarity: rarityInfo.rarity, color: rarityInfo.color };

        const list = document.getElementById('collectionList');
        if (list) {
            const emoji = FLOWER_EMOJI[species] || '🌼';
            const rarity = rarityInfo.rarity || 'common';
            const item = document.createElement('div');
            item.className = 'collection-item';
            item.style.setProperty('--rarity-color', rarityInfo.color);
            item.id = `collect-${species}`;
            item.innerHTML = `
                <span class="flower-emoji">${emoji}</span>
                <div class="item-info">
                    <div class="name">${species}</div>
                    <div class="rarity-label">${rarity}</div>
                </div>
                <span class="count">x1</span>
            `;
            list.prepend(item);
        }
    } else {
        unlockedFlowers[species].count++;
        const countSpan = document.querySelector(`#collect-${species} .count`);
        if (countSpan) countSpan.textContent = `x${unlockedFlowers[species].count}`;
    }

    // Update total badge
    const totalBadge = document.getElementById('collection-total');
    if (totalBadge) totalBadge.textContent = Object.keys(unlockedFlowers).length;
}

// ─── Main Loop ────────────────────────────────────────────────────────────────
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    env.update();
    env.draw();

    // Remove dead flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
        if (flowers[i].dead) flowers.splice(i, 1);
    }



    // Depth sort
    flowers.sort((a, b) => a.y - b.y);
    flowers.forEach(f => {
        f.update(env);
        f.draw(env, ctx);
    });

    // Update Managers
    if (insectMgr) insectMgr.update(env, flowers);
    if (animalMgr) animalMgr.update(flowers); // Phase 5

    // Insects
    insectMgr.draw(ctx);
    
    // Animals
    if (animalMgr) animalMgr.draw(ctx);



    // Floating Texts (Gacha)
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 1.5; // Float up faster
        ft.life -= 1.5;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / 100);
        ctx.font = 'bold 24px "Mali", sans-serif';
        ctx.textAlign = 'center';
        
        // Glowing effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.fillStyle = ft.color;
        
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Water/Magic Particles
    ctx.globalCompositeOperation = 'screen';
    for (let i = magicParticles.length - 1; i >= 0; i--) {
        const p = magicParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity for water
        p.life--;
        
        const color = p.color || '96, 165, 250'; // Default to light blue water
        ctx.fillStyle = `rgba(${color}, ${p.life / 20})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.life <= 0) magicParticles.splice(i, 1);
    }
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(mainLoop);
}

// ─── UI Event Listeners ───────────────────────────────────────────────────────
function setupUIEventListeners() {
    // Autopilot toggle
    autoWeatherToggle.addEventListener('change', () => {
        env.autopilot = autoWeatherToggle.checked;
        timeSlider.disabled = autoWeatherToggle.checked;
        windSlider.disabled = autoWeatherToggle.checked;
    });

    // Time slider (manual)
    timeSlider.addEventListener('input', (e) => {
        if (!env.autopilot) {
            env.timeOfDay = parseFloat(e.target.value);
            updateTimeLabel(parseFloat(e.target.value));
            updateWeatherText();
        }
    });

    // Wind slider (manual)
    windSlider.addEventListener('input', (e) => {
        if (!env.autopilot) {
            const v = parseFloat(e.target.value);
            env.windSpeed = v;
            updateWindLabel(v);
            if (window.floraAudio) window.floraAudio.setWindSpeed(v);
        }
    });

    // Sound toggle
    soundBtn.addEventListener('click', () => {
        if (!window.floraAudio.ctx) {
            window.floraAudio.init();
            soundBtn.classList.remove('pulse-effect');
        }
        const isMuted = window.floraAudio.toggleMute();
        soundOnIcon.classList.toggle('hidden', isMuted);
        soundOffIcon.classList.toggle('hidden', !isMuted);
        soundBtn.style.background = isMuted
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(192,132,252,0.15)';
    });

    // Rain toggle
    rainBtn.addEventListener('click', () => {
        const raining = !env.rainEnabled;
        env.rainEnabled = raining;
        rainBtn.classList.toggle('active', raining);
        rainBtn.querySelector('span').textContent = raining ? 'ปิดฝนตก' : 'เปิดฝนตก';
        if (window.floraAudio) window.floraAudio.setRain(raining);
        updateWeatherText();
    });

    // Flower species cards
    document.querySelectorAll('.flower-card').forEach(card => {
        card.addEventListener('click', () => {

            document.querySelectorAll('.flower-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedFlowerType = card.dataset.flower;
            renderColorPalette();
        });
    });

    // Color dots
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            if (dot.classList.contains('locked')) return; // Ignore if locked
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            selectedColorName = dot.dataset.color;
        });
    });



    // Auto-plant button
    autoBtn.addEventListener('click', () => {
        autoPlantFlowers(16);
        if (window.floraAudio && !window.floraAudio.isMuted) {
            window.floraAudio.playChime();
            setTimeout(() => window.floraAudio.playChime(), 120);
        }
    });

    // Clear flowers button
    clearBtn.addEventListener('click', () => {
        flowers.length = 0;
    });

    // Close instructions
    closeInstructionsBtn.addEventListener('click', () => {
        instructionBanner.style.opacity = '0';
        instructionBanner.style.transition = 'opacity 0.5s';
        setTimeout(() => { instructionBanner.style.display = 'none'; }, 500);
    });

    // ─── Reset Game Logic ────────────────────────────────────────────
    function resetGame() {
        // Clear all dynamic data structures
        flowers.length = 0;
        floatingTexts.length = 0;
        Object.keys(unlockedFlowers).forEach(k => delete unlockedFlowers[k]);
        // Reset UI Collections
        const list = document.getElementById('collectionList');
        if (list) {
            list.innerHTML = `<div class="collection-empty"><span>🌱</span><p>เริ่มปลูกดอกไม้<br>เพื่อเพิ่มในสวน</p></div>`;
        }
        const totalBadge = document.getElementById('collection-total');
        if (totalBadge) totalBadge.textContent = '0';
        // Reset canvas (clear)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Hide any modals or overlays
        if (window.learningMode) window.learningMode.hide();
        // Re-plant initial flowers
        autoPlantFlowers(12);
    }

    // ─── Reset Game Button Handler ───────────────────────────────────────────────
    document.getElementById('reset-game-btn').addEventListener('click', () => {
        resetGame();
        // Optional sound feedback
        if (window.floraAudio) {
            if (!window.floraAudio.ctx) window.floraAudio.init();
            window.floraAudio.playChime();
        }
    });


    // Toolbar Tools --- ---
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            updateCanvasCursor();
        });
    });
}

function updateCanvasCursor() {
    canvas.className = ''; // clear all
    canvas.classList.add('cursor-' + currentTool);
}

// ─── Canvas Click / Touch ─────────────────────────────────────────────────────
function setupCanvasListeners() {
    updateCanvasCursor();

    const handle = (clientX, clientY) => {
        // Sidebar guard
        if (window.innerWidth > 768 && clientX < 365) return;

        if (currentTool === 'inspect') {
            const hit = learnMode.hitTestFlowers(clientX, clientY, env);
            if (hit) {
                learnMode.open(hit);
            }
            return;
        }



        if (currentTool === 'plant') {
            const horizonY = env.horizonY || (canvas.height * 0.65);
            
            // Limit plant area to below horizon
            if (clientY < horizonY) {
                showNoPlantHint(clientX, clientY);
                return;
            }

            // Use Gacha System if available, otherwise fallback
            let speciesToPlant = selectedFlowerType;
            let rarityInfo = null;
            if (window.GachaSystem) {
                rarityInfo = window.GachaSystem.rollFlower();
                speciesToPlant = rarityInfo.species;
            }

            const factory = window.FlowerFactory[speciesToPlant];
            if (factory && flowers.length < 150) {
                flowers.push(factory(clientX, clientY, selectedColorName));
                
                // Add magical planting particles colored by rarity
                let dustColor = rarityInfo ? rarityInfo.color : '#a78bfa';
                // Convert hex to rgb for particle if needed (roughly)
                const hex2rgb = (hex) => {
                    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
                    return `${r}, ${g}, ${b}`;
                };
                dustColor = hex2rgb(dustColor);

                for (let i = 0; i < 15; i++) {
                    magicParticles.push({
                        x: clientX + (Math.random() - 0.5) * 20,
                        y: clientY + (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 5,
                        vy: -2 - Math.random() * 4,
                        life: 30 + Math.random() * 20,
                        size: 3 + Math.random() * 5,
                        color: dustColor
                    });
                }

                // Show Gacha Popup if Rare or higher
                if (rarityInfo && rarityInfo.rarity !== 'Common' && rarityInfo.rarity !== 'Uncommon') {
                    let star = rarityInfo.rarity === 'Legendary' ? '🌟' : rarityInfo.rarity === 'Epic' ? '⭐' : '✨';
                    floatingTexts.push({
                        x: clientX,
                        y: clientY - 40,
                        text: `${star} ${rarityInfo.rarity}: ${speciesToPlant.toUpperCase()}!`,
                        color: rarityInfo.color,
                        life: 100
                    });
                }
                
                // Add to Collection UI
                if (rarityInfo) {
                    updateCollectionUI(speciesToPlant, rarityInfo);
                }
                
                if (window.floraAudio) {
                    if (!window.floraAudio.ctx) window.floraAudio.init();
                    window.floraAudio.playChime();
                }
            }
            return;
        }
    };

    const handleMove = (x, y) => {
        env.mouseX = x;
        env.mouseY = y;
        
        if (isDragging && currentTool === 'water') {
            // Spawn water drops
            for (let i = 0; i < 3; i++) {
                magicParticles.push({
                    x: x + (Math.random() - 0.5) * 15,
                    y: y + (Math.random() - 0.5) * 15,
                    vx: (Math.random() - 0.5) * 1,
                    vy: Math.random() * 3 + 2, // falling down
                    life: 20 + Math.random() * 10,
                    size: 1.5 + Math.random() * 2
                });
            }
            
            // Boost flower growth near the watering can
            for (const f of flowers) {
                const scale = env.getDepthScale ? env.getDepthScale(f.y) : 1;
                const dx = x - f.x;
                const dy = y - (f.y - f.height * scale); // check near the flower head
                if (Math.sqrt(dx*dx + dy*dy) < 50 * scale) {
                    if (f.lifecycle === 'growing') f.growth = Math.min(1.0, f.growth + 0.05);
                    else if (f.lifecycle === 'bloomed') f.lifecycleTimer += 20;
                }
            }
        }
    };

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        handle(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        env.mouseX = undefined;
        env.mouseY = undefined;
    });

    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        const t = e.touches[0];
        handle(t.clientX, t.clientY, false);
        handleMove(t.clientX, t.clientY);
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
    }, { passive: true });
    
    window.addEventListener('touchend', () => {
        isDragging = false;
        env.mouseX = undefined;
        env.mouseY = undefined;
    });
}

// ─── No-plant hint ────────────────────────────────────────────────────────────
function showNoPlantHint(x, y) {
    const start = performance.now();
    const draw = (now) => {
        const t = Math.max(0, Math.min((now - start) / 500, 1));
        ctx.save();
        ctx.strokeStyle = `rgba(239,68,68,${(1-t)*0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, t * 32, 0, Math.PI * 2);
        ctx.stroke();
        // Cross
        const cs = 8 * (1-t*0.5);
        ctx.beginPath();
        ctx.moveTo(x-cs, y-cs); ctx.lineTo(x+cs, y+cs);
        ctx.moveTo(x+cs, y-cs); ctx.lineTo(x-cs, y+cs);
        ctx.stroke();
        ctx.restore();
        if (t < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
}


// ─── Label helpers ────────────────────────────────────────────────────────────
function updateTimeLabel(val) {
    const labels = [
        [0,   5,  'กลางคืน (ดึก)'],
        [5,   7,  'รุ่งเช้า (พระอาทิตย์ขึ้น)'],
        [7,   11, 'สายๆ'],
        [11,  14, 'เที่ยงวัน'],
        [14,  16, 'บ่ายแก่ๆ'],
        [16,  19, 'พลบค่ำ (พระอาทิตย์ตก)'],
        [19,  22, 'หัวค่ำ'],
        [22,  25, 'กลางคืน (ดึก)'],
    ];
    const entry = labels.find(([lo, hi]) => val >= lo && val < hi);
    timeValueLabel.textContent = entry ? entry[2] : 'กลางคืน';
}

function updateWindLabel(val) {
    let text = val < 0.8 ? 'นิ่งสงบ'
             : val < 1.8 ? 'ลมอ่อนๆ'
             : val < 3.0 ? 'ลมโชยสบาย'
             : val < 4.2 ? 'ลมพัดแรง'
             : 'พายุฤดูร้อน';
    windValueLabel.textContent = text;
}

function updateWeatherText() {
    const h = env.timeOfDay;
    let text = 'ปลอดโปร่ง';
    if (env.rainEnabled) text = env.windSpeed >= 3.5 ? 'พายุฝนฟ้าคะนอง' : 'ฝนโปรยปราย';
    else if (env.windSpeed >= 4.0) text = 'ลมพายุเกรี้ยวกราด';
    else if (h >= 11 && h < 14) text = 'แดดจ้า ท้องฟ้าใส';
    else if (h >= 16 && h < 19) text = 'ท้องฟ้าส้มระยิบระยับ';
    else if (h >= 20 || h < 4) text = 'คืนเดือนหงาย ท้องฟ้ามีดาว';
    weatherStatusText.textContent = `สภาพอากาศ: ${text}`;
}

// ─── Auto-plant ───────────────────────────────────────────────────────────────
function autoPlantFlowers(count) {
    // Pick from all available flowers
    const allCards = Array.from(document.querySelectorAll('.flower-card'));
    const allSpecies = allCards.map(card => card.dataset.flower);
        
    const allColors  = ['red','pink','orange','yellow','purple','blue','white'];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        
        const horizon = env.horizonY || (canvas.height * 0.65);
        const y = horizon + Math.random() * (canvas.height - horizon);
        
        let type = 'daisy';
        let colorName = allColors[Math.floor(Math.random() * allColors.length)];
        
        if (window.GachaSystem) {
            type = window.GachaSystem.rollFlower().species;
        } else {
            type = allSpecies[Math.floor(Math.random() * allSpecies.length)];
        }
        
        const factory = window.FlowerFactory[type];
        if (factory && flowers.length < 150) {
            const f = factory(x, y, colorName);
            f.growth = 0.3 + Math.random() * 0.7;
            f.height = f.maxHeight * f.growth;
            if (f.growth >= 1.0) f.lifecycle = 'bloomed';
            flowers.push(f);
        }
    }
}

// ─── Save / Load System ───────────────────────────────────────────────────────
function saveGame() {
    // Save minimal data for each flower
    const savedFlowers = flowers.map(f => ({
        x: f.x,
        y: f.y,
        species: f.species,
        colorName: f.colorName,
        growth: f.growth,
        lifecycle: f.lifecycle,
        lifecycleTimer: f.lifecycleTimer
    }));

    const data = {
        flowers: savedFlowers
    };

    localStorage.setItem('floraScapeSave', JSON.stringify(data));
}

function loadGame() {
    try {
        const raw = localStorage.getItem('floraScapeSave');
        if (!raw) return;
        
        const data = JSON.parse(raw);
        
        // Restore Flowers
        if (Array.isArray(data.flowers) && data.flowers.length > 0) {
            flowers.length = 0; // Clear existing if any
            for (const sf of data.flowers) {
                const factory = window.FlowerFactory[sf.species];
                if (factory) {
                    const f = factory(sf.x, sf.y, sf.colorName);
                    f.growth = sf.growth || 0;
                    f.lifecycle = sf.lifecycle || 'growing';
                    f.lifecycleTimer = sf.lifecycleTimer || 0;
                    if (f.maxHeight) f.height = f.maxHeight * f.growth;
                    flowers.push(f);
                    
                    // Add to collection
                    if (window.GachaSystem) {
                        let rInfo = { rarity: 'Common', color: '#94a3b8', species: sf.species };
                        for (const p of window.GachaSystem.pools) {
                            if (p.species.includes(sf.species)) {
                                rInfo = { rarity: p.name, color: p.color, species: sf.species };
                                break;
                            }
                        }
                        updateCollectionUI(sf.species, rInfo);
                    }
                }
            }
        }
        
        renderColorPalette();
        
    } catch(e) {
        console.error('Failed to load save data:', e);
    }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    loadGame();
    // Auto-save every 5 seconds
    setInterval(saveGame, 5000);
});
