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
        // Background music - homepage part 1 (loops to part 2)
        this.backgroundMusic = new Audio('assets/hompagepart1.wav');
        this.backgroundMusicPart2 = new Audio('assets/hompagepart2.wav');
        this.backgroundMusic.loop = false; // Will transition to part 2
        this.backgroundMusicPart2.loop = true; // Part 2 loops
        this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        this.backgroundMusicPart2.volume = this.currentVolume * this.musicIntensity;
        
        // Set up transition from part 1 to part 2
        this.backgroundMusic.addEventListener('ended', () => {
            this.backgroundMusicPart2.currentTime = 0;
            this.backgroundMusicPart2.play();
        });
        
        // Sound effects (create audio objects for each)
        this.sounds = {
            move: new Audio(), // No specific file yet - optional
            complete: new Audio('assets/match(new).wav'), // Puzzle completion
            hint: new Audio(), // Optional
            badge: new Audio(), // Optional
            error: new Audio(), // Optional
            scoreboard: new Audio('assets/scoreboard.wav') // Leaderboard sound
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
        if (url) {
            if (this.backgroundMusic) {
                this.backgroundMusic.src = url;
                this.backgroundMusic.load();
            }
        }
        // Default to homepage music if no URL provided
        if (this.backgroundMusic && !this.backgroundMusic.src) {
            this.backgroundMusic.src = 'assets/hompagepart1.wav';
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
     * Play scoreboard sound
     */
    playScoreboardSound() {
        if (this.sounds.scoreboard && this.soundEffectsEnabled) {
            this.sounds.scoreboard.volume = 0.7;
            this.sounds.scoreboard.currentTime = 0;
            this.sounds.scoreboard.play().catch(e => {
                console.warn('Could not play scoreboard sound:', e);
            });
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            if (this.backgroundMusicPart2) {
                this.backgroundMusicPart2.pause();
                this.backgroundMusicPart2.currentTime = 0;
            }
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
        if (this.backgroundMusicPart2) {
            this.backgroundMusicPart2.volume = this.currentVolume * this.musicIntensity;
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
    
    // Load and optionally auto-play background music on homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        // Auto-play on homepage
        window.audioSystem.loadBackgroundMusic('assets/hompagepart1.wav');
        // Optional: auto-play (browsers require user interaction first)
        // window.audioSystem.playBackgroundMusic();
    }
    
    // Start with low intensity
    window.audioSystem.setMusicIntensity(0.3);
});

