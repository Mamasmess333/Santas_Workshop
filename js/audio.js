/**
 * Audio Management System
 * Handles background music and sound effects with progressive intensity
 */

class AudioSystem {
    constructor() {
        this.backgroundMusic = null;
        this.currentVolume = 0.5;
        this.musicIntensity = 0.5; // 0.0 to 1.0
        this.isMusicPlaying = false;
        this.soundEffectsEnabled = true;
        this.moveSoundCount = 0;
        
        this.initializeAudio();
    }

    /**
     * Initialize audio elements
     */
    initializeAudio() {
        // Background music (will be loaded from assets/audio/)
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        
        // Sound effects (create audio objects for each)
        this.sounds = {
            move: new Audio(),
            complete: new Audio(),
            hint: new Audio(),
            badge: new Audio(),
            error: new Audio()
        };

        // Set up audio context for progressive intensity
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Load and play background music
     */
    loadBackgroundMusic(url) {
        if (this.backgroundMusic) {
            this.backgroundMusic.src = url || 'assets/audio/background.mp3';
            this.backgroundMusic.load();
        }
    }

    /**
     * Play background music
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicPlaying) {
            this.backgroundMusic.play().catch(e => {
                console.warn('Could not play background music:', e);
            });
            this.isMusicPlaying = true;
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isMusicPlaying = false;
        }
    }

    /**
     * Set music intensity (0.0 to 1.0)
     * Intensity increases as puzzle progresses
     */
    setMusicIntensity(intensity) {
        this.musicIntensity = Math.max(0.0, Math.min(1.0, intensity));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        }
    }

    /**
     * Update music intensity based on puzzle progress
     */
    updateIntensityFromProgress(progress) {
        // Progress: 0.0 (start) to 1.0 (complete)
        // Intensity increases as puzzle gets closer to completion
        const baseIntensity = 0.3;
        const maxIntensity = 1.0;
        const intensity = baseIntensity + (progress * (maxIntensity - baseIntensity));
        this.setMusicIntensity(intensity);
    }

    /**
     * Calculate puzzle progress
     */
    calculateProgress(puzzle) {
        if (!puzzle) return 0;

        const grid = puzzle.getGrid();
        const size = puzzle.size;
        let correctTiles = 0;
        let expected = 1;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (row === size - 1 && col === size - 1) {
                    if (grid[row][col] === 0) {
                        correctTiles++;
                    }
                } else {
                    if (grid[row][col] === expected) {
                        correctTiles++;
                    }
                    expected++;
                }
            }
        }

        return correctTiles / (size * size);
    }

    /**
     * Play move sound effect
     */
    playMoveSound() {
        if (!this.soundEffectsEnabled) return;

        // Throttle move sounds to avoid audio spam
        this.moveSoundCount++;
        if (this.moveSoundCount % 2 !== 0) return; // Play every other move

        this.playSound('move', 0.3);
    }

    /**
     * Play completion sound
     */
    playCompleteSound() {
        this.playSound('complete', 0.8);
        // Increase music intensity on completion
        this.setMusicIntensity(1.0);
    }

    /**
     * Play hint sound
     */
    playHintSound() {
        this.playSound('hint', 0.5);
    }

    /**
     * Play badge unlock sound
     */
    playBadgeSound() {
        this.playSound('badge', 0.7);
    }

    /**
     * Play error sound
     */
    playErrorSound() {
        this.playSound('error', 0.4);
    }

    /**
     * Play a sound effect
     */
    playSound(soundName, volume = 0.5) {
        const sound = this.sounds[soundName];
        if (sound && this.soundEffectsEnabled) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.warn(`Could not play ${soundName} sound:`, e);
            });
        }
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.currentVolume = Math.max(0.0, Math.min(1.0, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        }
    }

    /**
     * Toggle sound effects
     */
    toggleSoundEffects() {
        this.soundEffectsEnabled = !this.soundEffectsEnabled;
        return this.soundEffectsEnabled;
    }

    /**
     * Toggle background music
     */
    toggleBackgroundMusic() {
        if (this.isMusicPlaying) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.isMusicPlaying;
    }

    /**
     * Update audio based on game state
     */
    updateFromGameState() {
        if (window.gameController && window.gameController.puzzle) {
            const progress = this.calculateProgress(window.gameController.puzzle);
            this.updateIntensityFromProgress(progress);
        }
    }
}

// Initialize audio system
document.addEventListener('DOMContentLoaded', () => {
    window.audioSystem = new AudioSystem();
    
    // Try to load background music (if file exists)
    // window.audioSystem.loadBackgroundMusic('assets/audio/background.mp3');
    
    // Start with low intensity
    window.audioSystem.setMusicIntensity(0.3);
});

