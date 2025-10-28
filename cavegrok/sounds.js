// Web Audio API Sound System for CaveGrok
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.soundEnabled = true;
        this.masterVolume = 0.3;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSoundPreferences();
            console.log('Sound system initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.soundEnabled = false;
        }
    }

    loadSoundPreferences() {
        const saved = localStorage.getItem('soundEnabled');
        if (saved !== null) {
            this.soundEnabled = saved === 'true';
        }
    }

    saveSoundPreferences() {
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundPreferences();
        console.log('Sound', this.soundEnabled ? 'enabled' : 'disabled');
    }

    // Create oscillator with envelope
    createOscillator(frequency, type = 'sine', duration = 0.5) {
        if (!this.audioContext || !this.soundEnabled) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        // Envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }

    // Create noise generator
    createNoise(duration = 0.5, filterFreq = 1000) {
        if (!this.audioContext || !this.soundEnabled) return null;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(filterFreq, this.audioContext.currentTime);
        
        const gainNode = this.audioContext.createGain();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        return { noise, gainNode };
    }

    // Menu sounds
    playMenuSelect() {
        const sound = this.createOscillator(800, 'square', 0.1);
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }

    playMenuHover() {
        const sound = this.createOscillator(600, 'sine', 0.05);
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.05);
        }
    }

    // Game state sounds
    playGameStart() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Ascending chord
        const frequencies = [261.63, 329.63, 392.00]; // C, E, G
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                const sound = this.createOscillator(freq, 'triangle', 0.3);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + 0.3);
                }
            }, i * 100);
        });
    }

    playGameOver() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Descending dramatic sound
        const sound = this.createOscillator(220, 'sawtooth', 1.0);
        if (sound) {
            sound.oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 1.0);
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 1.0);
        }
    }

    playVictory() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Victory fanfare - C major scale up
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const sound = this.createOscillator(freq, 'triangle', 0.2);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + 0.2);
                }
            }, i * 80);
        });
    }

    // Player action sounds
    playThrust() {
        const noise = this.createNoise(0.1, 200);
        if (noise) {
            noise.noise.start();
            noise.noise.stop(this.audioContext.currentTime + 0.1);
        }
    }

    playLanding() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Soft landing thud
        const sound = this.createOscillator(150, 'triangle', 0.3);
        if (sound) {
            sound.oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.3);
        }
    }

    playCrash() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Crash sound with noise and low frequency
        const noise = this.createNoise(0.8, 500);
        const bass = this.createOscillator(60, 'square', 0.8);
        
        if (noise) {
            noise.noise.start();
            noise.noise.stop(this.audioContext.currentTime + 0.8);
        }
        if (bass) {
            bass.oscillator.start();
            bass.oscillator.stop(this.audioContext.currentTime + 0.8);
        }
    }

    // Collectible sounds
    playGemCollect() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Shimmering sound - ascending frequencies
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                const sound = this.createOscillator(freq, 'sine', 0.15);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + 0.15);
                }
            }, i * 50);
        });
    }

    // Environment sounds
    playAmbientCave() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Dripping water sound
        const sound = this.createOscillator(800, 'sine', 0.1);
        if (sound) {
            sound.oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }

    // Enemy sounds
    playEnemyShoot() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Laser-like sound
        const sound = this.createOscillator(1200, 'square', 0.2);
        if (sound) {
            sound.oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.2);
        }
    }

    playEnemyExplode() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Explosion sound
        const noise = this.createNoise(0.5, 800);
        const bass = this.createOscillator(100, 'square', 0.5);
        
        if (noise) {
            noise.noise.start();
            noise.noise.stop(this.audioContext.currentTime + 0.5);
        }
        if (bass) {
            bass.oscillator.start();
            bass.oscillator.stop(this.audioContext.currentTime + 0.5);
        }
    }

    // Main play function that maps old sound names to new ones
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        switch(soundName) {
            case 'menuSelect':
            case 'button':
                this.playMenuSelect();
                break;
            case 'menuHover':
                this.playMenuHover();
                break;
            case 'gameStart':
            case 'start':
                this.playGameStart();
                break;
            case 'gameOver':
            case 'crash':
                this.playGameOver();
                break;
            case 'victory':
            case 'levelComplete':
                this.playVictory();
                break;
            case 'thrust':
            case 'engine':
                this.playThrust();
                break;
            case 'landing':
                this.playLanding();
                break;
            case 'gemCollect':
            case 'collect':
                this.playGemCollect();
                break;
            case 'ambient':
                this.playAmbientCave();
                break;
            case 'enemyShoot':
            case 'shoot':
                this.playEnemyShoot();
                break;
            case 'enemyExplode':
            case 'explode':
                this.playEnemyExplode();
                break;
            default:
                console.warn('Unknown sound:', soundName);
        }
    }
}

// Create global sound system instance
window.soundSystem = new SoundSystem();

// Expose functions globally for backward compatibility
window.playSound = (soundName) => window.soundSystem.playSound(soundName);
window.toggleSound = () => window.soundSystem.toggleSound(); 