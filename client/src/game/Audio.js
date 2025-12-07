export class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.context) return;
        
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    scan() {
        this.init();
        this.playTone(800, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.15), 80);
    }

    lidar() {
        this.init();
        this.playTone(300, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(600, 0.15, 'sine', 0.2), 100);
    }

    drill() {
        this.init();
        this.playTone(150, 0.3, 'square', 0.1);
        setTimeout(() => this.playTone(200, 0.2, 'square', 0.08), 150);
    }

    drillHit() {
        this.init();
        this.playTone(400, 0.2, 'sine', 0.3);
        this.playTone(500, 0.15, 'sine', 0.25);
        setTimeout(() => this.playTone(600, 0.2, 'sine', 0.2), 100);
    }

    excavate() {
        this.init();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.playTone(100 + Math.random() * 100, 0.1, 'sawtooth', 0.08);
            }, i * 50);
        }
    }

    discovery() {
        this.init();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sine', 0.25);
            }, i * 120);
        });
    }

    terraquest() {
        this.init();
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(200 + i * 100, 0.15, 'sine', 0.2);
            }, i * 80);
        }
    }

    victory() {
        this.init();
        const melody = [523, 659, 784, 880, 1047, 1319, 1568];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, 'sine', 0.3);
            }, i * 150);
        });
    }

    error() {
        this.init();
        this.playTone(200, 0.2, 'square', 0.15);
        setTimeout(() => this.playTone(150, 0.3, 'square', 0.12), 150);
    }

    click() {
        this.init();
        this.playTone(1000, 0.05, 'sine', 0.1);
    }
}

export const audio = new AudioManager();
