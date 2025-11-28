/**
 * Gift & Reward System
 * Comprehensive achievement system with unique gifts
 */

class GiftSystem {
    constructor() {
        this.gifts = [];
        this.achievements = {
            firstCompletion: false,
            speedRunner: false,
            perfectSolver: false,
            levelMaster: false,
            holidayHero: false,
            adaptiveChampion: false
        };
        
        this.loadGifts();
    }

    /**
     * Load user's gifts from database
     */
    async loadGifts() {
        try {
            const response = await fetch('php/game.php?action=get_gifts');
            const data = await response.json();
            
            if (data.success && data.gifts) {
                this.gifts = data.gifts;
                this.updateAchievements();
            }
        } catch (error) {
            console.error('Error loading gifts:', error);
        }
    }

    /**
     * Check achievements after puzzle completion
     */
    async checkAchievements(timeSeconds, moves) {
        const puzzleSize = window.gameController ? window.gameController.currentSize : 4;
        const newGifts = [];

        // First Completion
        if (!this.achievements.firstCompletion) {
            await this.unlockGift('First Completion', 'firstCompletion');
            newGifts.push('First Completion');
        }

        // Speed Runner (fast completion)
        const speedThreshold = this.getSpeedThreshold(puzzleSize);
        if (timeSeconds <= speedThreshold && !this.achievements.speedRunner) {
            await this.unlockGift('Speed Runner', 'speedRunner');
            newGifts.push('Speed Runner');
        }

        // Perfect Solver (minimal moves)
        const optimalMoves = this.estimateOptimalMoves(puzzleSize);
        if (moves <= optimalMoves * 1.2 && !this.achievements.perfectSolver) {
            await this.unlockGift('Perfect Solver', 'perfectSolver');
            newGifts.push('Perfect Solver');
        }

        // Level Master (all sizes completed)
        if (await this.checkAllSizesCompleted() && !this.achievements.levelMaster) {
            await this.unlockGift('Level Master', 'levelMaster');
            newGifts.push('Level Master');
        }

        // Holiday Hero (100 games played)
        const totalGames = await this.getTotalGamesPlayed();
        if (totalGames >= 100 && !this.achievements.holidayHero) {
            await this.unlockGift('Holiday Hero', 'holidayHero');
            newGifts.push('Holiday Hero');
        }

        // Adaptive Champion (mastered all difficulty levels)
        if (window.adaptiveSystem) {
            const skillLevel = window.adaptiveSystem.getSkillLevel();
            if (skillLevel >= 1.75 && !this.achievements.adaptiveChampion) {
                await this.unlockGift('Adaptive Champion', 'adaptiveChampion');
                newGifts.push('Adaptive Champion');
            }
        }

        // Show gift notifications
        if (newGifts.length > 0) {
            this.showGiftNotification(newGifts);
        }
    }

    /**
     * Unlock a gift
     */
    async unlockGift(giftName, giftType) {
        try {
            const response = await fetch('php/game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'unlock_gift',
                    gift_type: giftType,
                    description: giftName
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.gifts.push({
                    type: giftType,
                    name: giftName,
                    unlocked_at: new Date().toISOString()
                });
                this.achievements[giftType] = true;
                
                // Play badge sound
                if (window.audioSystem) {
                    window.audioSystem.playBadgeSound();
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error unlocking gift:', error);
        }
        
        return false;
    }

    /**
     * Show gift notification with animation
     */
    showGiftNotification(giftNames) {
        giftNames.forEach((giftName, index) => {
            setTimeout(() => {
                this.createGiftAnimation(giftName);
            }, index * 500);
        });
    }

    /**
     * Create gift animation (appearing from under tree)
     */
    createGiftAnimation(giftName) {
        const container = document.body;
        const gift = document.createElement('div');
        gift.className = 'gift-notification';
        gift.innerHTML = `
            <div class="gift-icon">🎁</div>
            <div class="gift-text">${giftName} Unlocked!</div>
        `;
        gift.style.cssText = `
            position: fixed;
            bottom: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            padding: 20px 30px;
            border-radius: 10px;
            border: 3px solid var(--christmas-gold);
            z-index: 4000;
            text-align: center;
            box-shadow: var(--shadow-lg);
        `;
        
        container.appendChild(gift);
        
        // Animate gift appearing
        gift.animate([
            { bottom: '-100px', opacity: 0 },
            { bottom: '50px', opacity: 1 },
            { bottom: '50px', opacity: 1 },
            { bottom: '-100px', opacity: 0 }
        ], {
            duration: 3000,
            easing: 'ease-in-out'
        }).onfinish = () => gift.remove();
    }

    /**
     * Get speed threshold for puzzle size
     */
    getSpeedThreshold(puzzleSize) {
        const thresholds = {
            3: 30,   // 30 seconds for 3x3
            4: 60,   // 1 minute for 4x4
            6: 180,  // 3 minutes for 6x6
            8: 360,  // 6 minutes for 8x8
            10: 600  // 10 minutes for 10x10
        };
        return thresholds[puzzleSize] || 60;
    }

    /**
     * Estimate optimal moves for puzzle size
     */
    estimateOptimalMoves(puzzleSize) {
        return puzzleSize * puzzleSize * 2;
    }

    /**
     * Check if all puzzle sizes have been completed
     */
    async checkAllSizesCompleted() {
        try {
            const response = await fetch('php/game.php?action=check_levels');
            const data = await response.json();
            
            if (data.success) {
                const sizes = [3, 4, 6, 8, 10];
                return sizes.every(size => data.completed_sizes.includes(size));
            }
        } catch (error) {
            console.error('Error checking levels:', error);
        }
        return false;
    }

    /**
     * Get total games played
     */
    async getTotalGamesPlayed() {
        try {
            const response = await fetch('php/game.php?action=get_total_games');
            const data = await response.json();
            
            if (data.success) {
                return data.total_games || 0;
            }
        } catch (error) {
            console.error('Error getting total games:', error);
        }
        return 0;
    }

    /**
     * Update achievements based on loaded gifts
     */
    updateAchievements() {
        this.gifts.forEach(gift => {
            if (this.achievements.hasOwnProperty(gift.type)) {
                this.achievements[gift.type] = true;
            }
        });
    }

    /**
     * Get all unlocked gifts
     */
    getGifts() {
        return this.gifts;
    }

    /**
     * Get achievements status
     */
    getAchievements() {
        return { ...this.achievements };
    }
}

// Initialize gift system
document.addEventListener('DOMContentLoaded', () => {
    window.giftSystem = new GiftSystem();
});

