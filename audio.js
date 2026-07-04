/**
 * FloraScape - Procedural Audio Engine
 * Uses Web Audio API to synthesize wind, rain, and flower blooming chimes dynamically.
 * No external audio files needed!
 */

class FloraAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        
        // Wind nodes
        this.windNoise = null;
        this.windFilter = null;
        this.windGain = null;
        
        // Rain nodes
        this.rainNoise = null;
        this.rainFilter = null;
        this.rainGain = null;
        
        // State variables
        this.currentWindSpeed = 1.2;
        this.isRaining = false;
        
        // Chime scale (C-major pentatonic for harmonious melodies: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
        this.chimeScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    }

    /**
     * Initialize the Web Audio Context and start the procedural sounds
     */
    init() {
        if (this.ctx) return; // Already initialized

        // Create audio context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // 1. Setup Wind Synthesizer
        this.setupWindSynth();

        // 2. Setup Rain Synthesizer
        this.setupRainSynth();

        // Start playback if not muted
        if (!this.isMuted) {
            this.resume();
        }
    }

    /**
     * Create white noise buffer for sound generation
     */
    createNoiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    /**
     * Synthesize Wind: White noise + modulated Bandpass filter + Gain
     */
    setupWindSynth() {
        // Create noise source
        this.windNoise = this.ctx.createBufferSource();
        this.windNoise.buffer = this.createNoiseBuffer();
        this.windNoise.loop = true;

        // Bandpass filter to capture the "whoosh" sound of wind
        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.Q.value = 3.0; // Filter resonance
        this.windFilter.frequency.value = 400; // Base frequency

        // Wind volume control
        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0.0; // Start at 0

        // Connect nodes
        this.windNoise.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.ctx.destination);

        // Start playing the noise loop
        this.windNoise.start(0);

        // Modulate wind parameters over time (LFO emulation)
        this.modulateWind();
    }

    /**
     * Modulate wind frequency and gain dynamically to simulate natural gusting
     */
    modulateWind() {
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const baseFreq = 150 + this.currentWindSpeed * 120;
        const speedMultiplier = this.currentWindSpeed / 5; // Normalize 0.1 to 5.0
        
        // Simulating wind gust fluctuations using multiple sine waves
        const fluctuation = Math.sin(time * 0.4) * 0.4 + Math.sin(time * 0.09) * 0.3 + 0.7; // Range: ~0.0 to ~1.4
        
        // Filter frequency modulation
        const targetFreq = baseFreq + (fluctuation * 350 * speedMultiplier);
        this.windFilter.frequency.setValueAtTime(this.windFilter.frequency.value, time);
        this.windFilter.frequency.exponentialRampToValueAtTime(Math.max(100, Math.min(2000, targetFreq)), time + 1.5);
        
        // Wind gain modulation (volume increases with gusts)
        let targetVolume = (0.05 + fluctuation * 0.15) * speedMultiplier;
        if (this.isMuted) targetVolume = 0;
        
        this.windGain.gain.setValueAtTime(this.windGain.gain.value, time);
        this.windGain.gain.linearRampToValueAtTime(targetVolume, time + 1.5);

        // Keep modulating recursively
        setTimeout(() => this.modulateWind(), 1500);
    }

    /**
     * Synthesize Rain: Pinkish/Highpass-filtered white noise + rapid gain spikes
     */
    setupRainSynth() {
        this.rainNoise = this.ctx.createBufferSource();
        this.rainNoise.buffer = this.createNoiseBuffer();
        this.rainNoise.loop = true;

        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainFilter.type = 'highpass';
        this.rainFilter.frequency.value = 1200; // Filter out low rumbles for crisp rain drops

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.value = 0.0;

        this.rainNoise.connect(this.rainFilter);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.ctx.destination);

        this.rainNoise.start(0);
        
        // Modulate rain sound to create a "pattering" effect
        this.modulateRain();
    }

    /**
     * Creates rain pattering intensity variations
     */
    modulateRain() {
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        let targetVolume = 0;

        if (this.isRaining && !this.isMuted) {
            // Rapid micro-variations for rain droplets
            targetVolume = 0.08 + Math.random() * 0.04;
        }

        this.rainGain.gain.setValueAtTime(targetVolume, time);
        
        // Rapid schedule interval for realistic rain texture
        setTimeout(() => this.modulateRain(), 50 + Math.random() * 50);
    }

    /**
     * Set current wind speed and update wind synthesizer values
     * @param {number} speed - wind speed value from 0.1 to 5.0
     */
    setWindSpeed(speed) {
        this.currentWindSpeed = speed;
        if (this.ctx && !this.isMuted) {
            const time = this.ctx.currentTime;
            const targetVolume = (0.05 + (speed / 5) * 0.15);
            this.windGain.gain.linearRampToValueAtTime(targetVolume, time + 0.5);
        }
    }

    /**
     * Set rain state and ramp rain audio volume
     * @param {boolean} raining - rain state
     */
    setRain(raining) {
        this.isRaining = raining;
        if (this.ctx) {
            const time = this.ctx.currentTime;
            const targetVolume = (raining && !this.isMuted) ? 0.1 : 0.0;
            this.rainGain.gain.linearRampToValueAtTime(targetVolume, time + 1.0);
        }
    }

    /**
     * Synthesize Chime: Clean, decaying sine oscillators in pentatonic harmonies
     */
    playChime() {
        if (!this.ctx || this.isMuted) return;

        const time = this.ctx.currentTime;
        
        // Select a random frequency from our pentatonic scale
        const index = Math.floor(Math.random() * this.chimeScale.length);
        const freq = this.chimeScale[index];
        
        // Create nodes
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const delay = this.ctx.createDelay();
        const feedback = this.ctx.createGain();
        
        // Set oscillator type (sine for pure round sound, triangle for bell-like tone)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Bell envelope
        gainNode.gain.setValueAtTime(0.0, time);
        gainNode.gain.linearRampToValueAtTime(0.12, time + 0.02); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 2.5); // Long decay

        // Subtle echo/delay effect for ambient depth
        delay.delayTime.setValueAtTime(0.4, time);
        feedback.gain.setValueAtTime(0.35, time); // Echo volume decay
        
        // Connections:
        // Osc -> Gain -> Destination
        // Gain -> Delay -> Feedback -> Delay (Feedback loop)
        // Delay -> Destination
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        gainNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(this.ctx.destination);

        // Play note
        osc.start(time);
        osc.stop(time + 3.0);
    }

    /**
     * Mute all audio sources
     */
    mute() {
        this.isMuted = true;
        if (this.ctx) {
            const time = this.ctx.currentTime;
            this.windGain.gain.linearRampToValueAtTime(0, time + 0.3);
            this.rainGain.gain.linearRampToValueAtTime(0, time + 0.3);
        }
    }

    /**
     * Resume audio sources
     */
    resume() {
        this.isMuted = false;
        if (this.ctx) {
            // Resume Context (Browsers require user click to resume context)
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const time = this.ctx.currentTime;
            this.setWindSpeed(this.currentWindSpeed);
            this.setRain(this.isRaining);
        }
    }

    /**
     * Toggle Mute State
     */
    toggleMute() {
        if (this.isMuted) {
            this.resume();
        } else {
            this.mute();
        }
        return this.isMuted;
    }
}

// Global instance
const floraAudio = new FloraAudioEngine();
window.floraAudio = floraAudio;
