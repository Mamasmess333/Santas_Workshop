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
        this.musicLoopTimeout = null;
        this.musicMode = 'home'; // 'home', 'game', or 'login'
        this.musicFiles = {
            home: 'assets/michael_bubl___its_beginning_to_look_a_lot_like_christmas_official_instrumental.wav',
            game: 'assets/michael_bubl___its_beginning_to_look_a_lot_like_christmas_official_instrumental.wav',
            login: 'assets/skating.wav'
        };
        this.musicFile = this.musicFiles.home;
        this.initializeAudio();
    }

    /**
     * Initialize audio elements
     */
    initializeAudio() {
        // Single background music file, will be swapped for each mode
        this.backgroundMusic = new Audio(this.musicFile);
        this.backgroundMusic.loop = false;
        this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        this.backgroundMusic.preload = 'auto';

        // Sound effects (create audio objects for each)
        this.sounds = {
            move: new Audio('assets/bell shake.wav'),
            complete: new Audio('assets/christmas bells.wav'),
            shuffle: new Audio('assets/shuffle.wav'),
            reset: new Audio('assets/reset.wav'),
            magic: new Audio('assets/fairy dust.wav'),
            hint: new Audio(),
            badge: new Audio(),
            error: new Audio(),
            scoreboard: new Audio('assets/jingle_bell_rock_instrumental.wav')
        };

    }

    /**
     * Play magic (fairy dust) sound effect: first 4 seconds only
     */
    playMagicSound() {
        const sound = this.sounds['magic'];
        if (sound && this.soundEffectsEnabled) {
            sound.volume = 0.5;
            sound.currentTime = 0;
            sound.play().catch(() => { });
            // Fade out over the last 1 second
            if (sound._magicTimeout) clearTimeout(sound._magicTimeout);
            if (sound._magicFadeInterval) clearInterval(sound._magicFadeInterval);
            sound._magicTimeout = setTimeout(() => {
                let fadeDuration = 1000; // ms
                let fadeSteps = 10;
                let step = 0;
                let initialVolume = 0.5;
                sound._magicFadeInterval = setInterval(() => {
                    step++;
                    sound.volume = initialVolume * (1 - step / fadeSteps);
                    if (step >= fadeSteps) {
                        clearInterval(sound._magicFadeInterval);
                        sound.pause();
                        sound.currentTime = 0;
                        sound.volume = initialVolume;
                    }
                }, fadeDuration / fadeSteps);
            }, 3000); // Start fade after 3s
        }
    }

    /**
     * Play shuffle sound effect at 40% volume
     */
    playShuffleSound() {
        this.playSound('shuffle', 0.4); // 60% quieter
    }

    /**
     * Play reset sound effect at 40% volume
     */
    playResetSound() {
        const sound = this.sounds['reset'];
        if (sound && this.soundEffectsEnabled) {
            sound.volume = 0.4;
            // Wait for metadata to load if needed
            if (sound.readyState >= 1 && sound.duration && sound.duration > 3) {
                sound.currentTime = Math.max(0, sound.duration - 3);
                sound.play().catch(() => { });
            } else {
                sound.addEventListener('loadedmetadata', function handler() {
                    sound.removeEventListener('loadedmetadata', handler);
                    sound.currentTime = Math.max(0, sound.duration - 3);
                    sound.play().catch(() => { });
                });
                // In case metadata is already loaded
                if (sound.duration && sound.duration > 3) {
                    sound.currentTime = Math.max(0, sound.duration - 3);
                    sound.play().catch(() => { });
                }
            }
        }
    }

    /**
     * Play homepage music: loop first 32s
     */
    playHomepageMusic() {
        this._swapMusic('home');
        this.musicMode = 'home';
        if (!this.backgroundMusic) return;
        this.stopBackgroundMusic();
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.play().catch(() => { });
        this.isMusicPlaying = true;
        // Loop first 32s
        this.backgroundMusic.ontimeupdate = () => {
            if (this.musicMode === 'home' && this.backgroundMusic.currentTime >= 32) {
                this.backgroundMusic.currentTime = 0;
                this.backgroundMusic.play();
            }
        };
    }

    playLoginMusic() {
        this._swapMusic('login');
        this.musicMode = 'login';
        if (!this.backgroundMusic) return;
        this.stopBackgroundMusic();
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.loop = true;
        this.backgroundMusic.ontimeupdate = null;
        this.backgroundMusic.onended = null;
        this.backgroundMusic.play().catch(() => { });
        this.isMusicPlaying = true;
    }

    _swapMusic(mode) {
        if (!this.musicFiles[mode]) return;
        // If already using the correct file, do nothing
        if (this.backgroundMusic && this.backgroundMusic.src && this.backgroundMusic.src.includes(this.musicFiles[mode])) return;
        // Otherwise, replace the audio element
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.ontimeupdate = null;
            this.backgroundMusic.onended = null;
        }
        this.backgroundMusic = new Audio(this.musicFiles[mode]);
        this.backgroundMusic.loop = (mode === 'login');
        this.backgroundMusic.volume = this.currentVolume * this.musicIntensity;
        this.backgroundMusic.preload = 'auto';
    }

    /**
     * Play game music: start at 33s, play full song, loop whole song
     */
    playGameMusic() {
        this.musicMode = 'game';
        if (!this.backgroundMusic) return;
        this.stopBackgroundMusic();
        this.backgroundMusic.currentTime = 33;
        this.backgroundMusic.play().catch(() => { });
        this.isMusicPlaying = true;
        // Remove custom looping, loop whole song
        this.backgroundMusic.ontimeupdate = null;
        this.backgroundMusic.onended = () => {
            if (this.musicMode === 'game') {
                this.backgroundMusic.currentTime = 33;
                this.backgroundMusic.play();
            }
        };
    }

    /**
     * Load and play background music
     */


    /**
     * Play background music
     */
    playBackgroundMusic() {
        // Default: play homepage music
        this.playHomepageMusic();
    }

    /**
     * Call this when navigating to game page
     */
    transitionToGameMusic() {
        this.playGameMusic();
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
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isMusicPlaying = false;
            this.backgroundMusic.ontimeupdate = null;
            this.backgroundMusic.onended = null;
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
        this.playSound('move', 0.3);
    }

    /**
     * Play completion sound
     */
    playCompleteSound() {
        this.playSound('complete', 0.1); // 50% volume
        // Stop completion sound on any user interaction
        const completeAudio = this.sounds.complete;
        const stopComplete = () => {
            if (completeAudio) {
                completeAudio.pause();
                completeAudio.currentTime = 0;
            }
            document.removeEventListener('mousedown', stopComplete);
            document.removeEventListener('keydown', stopComplete);
            document.removeEventListener('touchstart', stopComplete);
        };
        document.addEventListener('mousedown', stopComplete);
        document.addEventListener('keydown', stopComplete);
        document.addEventListener('touchstart', stopComplete);
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
            // If move sound, stop after 0.5s
            if (soundName === 'move') {
                if (sound._moveTimeout) clearTimeout(sound._moveTimeout);
                sound._moveTimeout = setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 700);
            }
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
    // Homepage: loop first 32s, but only after user interaction
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        let musicStarted = false;
        const startMusic = () => {
            if (!musicStarted) {
                window.audioSystem.playHomepageMusic();
                window.audioSystem.setMusicIntensity(0.3);
                musicStarted = true;
                document.removeEventListener('click', startMusic);
            }
        };
        document.addEventListener('click', startMusic);
    }
});

