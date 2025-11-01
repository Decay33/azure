// Sound System for Flip Dice Game
// Generates all sounds programmatically using Web Audio API

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = true;
        this.volume = 0.3; // Default volume
        
        this.initAudioContext();
    }

    // Initialize Web Audio Context
    initAudioContext() {
        try {
            // Create audio context with user gesture handling
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // Handle browser autoplay policies
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    this.audioContext.resume();
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    // Create a basic oscillator with envelope
    createOscillator(frequency, type = 'sine', duration = 0.1) {
        if (!this.enabled || !this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Connect oscillator to gain to master
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Envelope: quick attack, slow release
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Slow release
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return { oscillator, gainNode };
    }

    // Create noise for percussion-like sounds
    createNoise(duration = 0.1, filterFreq = 1000) {
        if (!this.enabled || !this.audioContext) return null;

        const bufferSize = this.audioContext.sampleRate * duration;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        // Add filter
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        
        const gainNode = this.audioContext.createGain();
        
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noiseSource.start(now);
        
        return { noiseSource, gainNode };
    }

    // Dice flip sound - mechanical click with slight pitch variation
    playDiceFlip() {
        if (!this.enabled) return;
        
        // Multiple quick clicks to simulate dice tumbling
        const baseFreq = 800 + Math.random() * 400; // Random pitch variation
        
        // Main click
        this.createOscillator(baseFreq, 'square', 0.05);
        
        // Secondary resonance
        setTimeout(() => {
            this.createOscillator(baseFreq * 0.7, 'triangle', 0.03);
        }, 20);
        
        // Subtle noise for texture
        this.createNoise(0.06, 2000);
    }

    // Match sound - pleasant chime progression
    playMatch(matchSize = 3) {
        if (!this.enabled) return;
        
        // Base frequencies for a major chord
        const baseFreqs = [523.25, 659.25, 783.99]; // C, E, G
        const multiplier = Math.min(matchSize / 3, 2); // Scale with match size
        
        baseFreqs.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq * multiplier, 'sine', 0.4);
                // Add harmonic
                this.createOscillator(freq * multiplier * 2, 'sine', 0.2);
            }, index * 50);
        });
    }

    // Combo sound - ascending arpeggio
    playCombo(comboLevel) {
        if (!this.enabled) return;
        
        const baseFreq = 440; // A4
        const scale = [1, 9/8, 5/4, 3/2, 5/3, 15/8]; // Just intonation scale
        
        for (let i = 0; i < Math.min(comboLevel, 6); i++) {
            setTimeout(() => {
                const freq = baseFreq * scale[i] * (1 + comboLevel * 0.1);
                this.createOscillator(freq, 'triangle', 0.3);
                // Add sparkle
                this.createOscillator(freq * 3, 'sine', 0.1);
            }, i * 80);
        }
    }

    // Level complete sound - triumphant fanfare
    playLevelComplete() {
        if (!this.enabled) return;
        
        // Fanfare progression: C - F - G - C
        const progression = [523.25, 698.46, 783.99, 1046.50];
        
        progression.forEach((freq, index) => {
            setTimeout(() => {
                // Main note
                this.createOscillator(freq, 'triangle', 0.5);
                // Harmony (fifth above)
                this.createOscillator(freq * 1.5, 'sine', 0.5);
                // Bass note
                this.createOscillator(freq / 2, 'sawtooth', 0.6);
            }, index * 200);
        });
        
        // Add celebratory noise burst
        setTimeout(() => {
            this.createNoise(0.3, 8000);
        }, 100);
    }

    // Game over sound - descending minor progression
    playGameOver() {
        if (!this.enabled) return;
        
        // Sad progression: Am - F - C - G
        const progression = [440, 349.23, 523.25, 392];
        
        progression.forEach((freq, index) => {
            setTimeout(() => {
                // Minor chord
                this.createOscillator(freq, 'sawtooth', 0.8);
                this.createOscillator(freq * 1.2, 'triangle', 0.8); // Minor third
                this.createOscillator(freq * 1.5, 'sine', 0.6); // Fifth
            }, index * 300);
        });
    }

    // Button click sound - quick pop
    playButtonClick() {
        if (!this.enabled) return;
        
        this.createOscillator(800, 'square', 0.05);
        setTimeout(() => {
            this.createOscillator(600, 'triangle', 0.03);
        }, 10);
    }

    // Dice drop sound - tumbling effect
    playDiceDrop() {
        if (!this.enabled) return;
        
        // Series of small impacts with decreasing intensity
        const impacts = [300, 250, 200, 150];
        
        impacts.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq + Math.random() * 100, 'square', 0.08);
                this.createNoise(0.05, 1000 - index * 200);
            }, index * 50);
        });
    }

    // Hint sound - gentle chime
    playHint() {
        if (!this.enabled) return;
        
        // Gentle ascending notes
        [523.25, 659.25, 783.99].forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sine', 0.6);
            }, index * 100);
        });
    }

    // Undo sound - reverse swoosh
    playUndo() {
        if (!this.enabled) return;
        
        // Descending sweep
        const startFreq = 1000;
        const endFreq = 300;
        const duration = 0.2;
        
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            const now = this.audioContext.currentTime;
            
            // Frequency sweep
            oscillator.frequency.setValueAtTime(startFreq, now);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            
            // Volume envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        }
    }

    // Arrow selection sound - soft bleep
    playArrowSelect() {
        if (!this.enabled) return;
        
        this.createOscillator(1200, 'sine', 0.1);
    }

    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    // Toggle sound on/off
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Get current state
    isEnabled() {
        return this.enabled;
    }

    // Cleanup - stop all sounds
    stopAllSounds() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                this.initAudioContext();
            });
        }
    }

    // Power-up earned sound
    playPowerupEarned() {
        if (!this.enabled) return;
        
        // Create a magical ascending chord progression
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sine', 0.4);
                // Add sparkle
                this.createOscillator(freq * 2, 'triangle', 0.2);
            }, index * 100);
        });
    }

    // Power-up selected sound
    playPowerupSelect() {
        if (!this.enabled) return;
        
        this.createOscillator(1200, 'triangle', 0.15);
        setTimeout(() => {
            this.createOscillator(1400, 'sine', 0.1);
        }, 50);
    }

    // Free move power-up used sound
    playFreeMoveUsed() {
        if (!this.enabled) return;
        
        // Create a "whoosh" effect with frequency sweep
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        }
    }

    // 3x3 Bomb explosion sound
    playBombExplosion() {
        if (!this.enabled) return;
        
        // Explosion with noise and bass thump
        this.createNoise(0.5, 800);
        
        // Bass thump
        setTimeout(() => {
            this.createOscillator(60, 'sine', 0.2);
        }, 10);
        
        // Crackling sounds
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createNoise(0.1, 1500 + Math.random() * 1000);
            }, i * 50);
        }
    }

    // Wild bomb clearing sound
    playWildBomb() {
        if (!this.enabled) return;
        
        // Create a mystical sweeping sound
        if (this.audioContext) {
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator1.connect(filter);
            oscillator2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator1.type = 'sine';
            oscillator2.type = 'triangle';
            filter.type = 'bandpass';
            
            oscillator1.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.8);
            
            oscillator2.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.8);
            
            filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(3000, this.audioContext.currentTime + 0.8);
            filter.Q.setValueAtTime(10, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.6);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 0.8);
            oscillator2.stop(this.audioContext.currentTime + 0.8);
        }
    }
}

// Export for use in main game
window.SoundSystem = SoundSystem; 