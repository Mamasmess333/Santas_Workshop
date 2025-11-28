/**
 * Victory and Celebration System
 * Handles win animations, effects, and celebration sounds
 */

class VictorySystem {
    constructor() {
        this.victoryModal = null;
        this.confettiParticles = [];
    }

    /**
     * Show victory screen with animations
     */
    showVictory(timeSeconds, moves) {
        // Play completion sound
        if (window.audioSystem) {
            window.audioSystem.playCompleteSound();
        }

        // Calculate efficiency rating
        const efficiency = this.calculateEfficiency(timeSeconds, moves);
        
        // Show victory modal
        this.displayVictoryModal(timeSeconds, moves, efficiency);
        
        // Create celebration effects
        this.createConfetti();
        this.createSnowflakes();
        
        // Track completion
        if (window.trackingSystem) {
            const puzzleSize = window.gameController ? window.gameController.currentSize : 4;
            window.trackingSystem.recordCompletion(puzzleSize, timeSeconds, moves);
        }

        // Check for achievements
        if (window.giftSystem) {
            window.giftSystem.checkAchievements(timeSeconds, moves);
        }
    }

    /**
     * Display victory modal
     */
    displayVictoryModal(timeSeconds, moves, efficiency) {
        const modal = document.getElementById('victory-modal');
        if (!modal) return;

        this.victoryModal = modal;
        
        // Update content
        const timeElement = document.getElementById('victory-time');
        const movesElement = document.getElementById('victory-moves');
        const efficiencyElement = document.getElementById('victory-efficiency');

        if (timeElement) {
            const minutes = Math.floor(timeSeconds / 60);
            const seconds = timeSeconds % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        if (movesElement) {
            movesElement.textContent = moves;
        }

        if (efficiencyElement) {
            efficiencyElement.textContent = efficiency;
        }

        // Show modal
        modal.classList.remove('hidden');

        // Set up buttons
        const playAgainBtn = document.getElementById('play-again-btn');
        const nextLevelBtn = document.getElementById('next-level-btn');

        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.handlePlayAgain());
        }

        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => this.handleNextLevel());
        }
    }

    /**
     * Calculate efficiency rating
     */
    calculateEfficiency(timeSeconds, moves) {
        // Simple efficiency calculation
        // Lower time and moves = higher efficiency
        const timeScore = Math.max(0, 100 - (timeSeconds / 10));
        const moveScore = Math.max(0, 100 - (moves / 5));
        const efficiency = Math.round((timeScore + moveScore) / 2);
        
        if (efficiency >= 90) return 'Perfect! ⭐⭐⭐';
        if (efficiency >= 75) return 'Excellent! ⭐⭐';
        if (efficiency >= 60) return 'Great! ⭐';
        return 'Good!';
    }

    /**
     * Create confetti effect
     */
    createConfetti() {
        const colors = ['#DC143C', '#228B22', '#FFD700', '#FFFFFF'];
        const container = document.body;
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                z-index: 3000;
                pointer-events: none;
                border-radius: 50%;
            `;
            
            container.appendChild(confetti);
            
            // Animate confetti
            const duration = 3 + Math.random() * 2;
            const horizontal = (Math.random() - 0.5) * 200;
            
            confetti.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${horizontal}px, ${window.innerHeight + 100}px) rotate(720deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
            }).onfinish = () => confetti.remove();
        }
    }

    /**
     * Create snowflake effect
     */
    createSnowflakes() {
        const container = document.body;
        
        for (let i = 0; i < 50; i++) {
            const snowflake = document.createElement('div');
            snowflake.textContent = '❄';
            snowflake.style.cssText = `
                position: fixed;
                font-size: ${10 + Math.random() * 20}px;
                left: ${Math.random() * 100}%;
                top: -20px;
                z-index: 3000;
                pointer-events: none;
                opacity: ${0.5 + Math.random() * 0.5};
            `;
            
            container.appendChild(snowflake);
            
            const duration = 4 + Math.random() * 3;
            const horizontal = (Math.random() - 0.5) * 100;
            
            snowflake.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 0.8 },
                { transform: `translate(${horizontal}px, ${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            }).onfinish = () => snowflake.remove();
        }
    }

    /**
     * Handle play again button
     */
    handlePlayAgain() {
        this.hideVictoryModal();
        
        if (window.gameController) {
            window.gameController.reset();
            window.gameController.shuffle();
        }

        // Reset hints
        if (window.hintSystem) {
            window.hintSystem.reset();
        }
    }

    /**
     * Handle next level button
     */
    handleNextLevel() {
        this.hideVictoryModal();
        
        if (window.gameController) {
            const currentSize = window.gameController.currentSize;
            const sizes = [3, 4, 6, 8, 10];
            const currentIndex = sizes.indexOf(currentSize);
            
            if (currentIndex < sizes.length - 1) {
                const nextSize = sizes[currentIndex + 1];
                window.gameController.changeSize(nextSize);
                
                // Update size select
                const sizeSelect = document.getElementById('puzzle-size-select');
                if (sizeSelect) {
                    sizeSelect.value = nextSize;
                }
            }
            
            window.gameController.shuffle();
        }

        // Reset hints
        if (window.hintSystem) {
            window.hintSystem.reset();
        }
    }

    /**
     * Hide victory modal
     */
    hideVictoryModal() {
        if (this.victoryModal) {
            this.victoryModal.classList.add('hidden');
        }
    }
}

// Initialize victory system
document.addEventListener('DOMContentLoaded', () => {
    window.victorySystem = new VictorySystem();
});

