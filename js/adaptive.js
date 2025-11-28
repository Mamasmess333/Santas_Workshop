/**
 * Adaptive Difficulty System
 * Tracks player performance and adjusts difficulty in real-time
 */

class AdaptiveDifficulty {
    constructor() {
        this.playerSkill = 1.0; // Base skill level (0.5 = easy, 2.0 = expert)
        this.recentPerformance = [];
        this.maxRecentGames = 10;
        this.difficultyLevels = ['easy', 'medium', 'hard', 'expert'];
    }

    /**
     * Calculate player skill based on recent performance
     */
    calculateSkillLevel(completionTime, moves, puzzleSize, optimalMoves) {
        // Normalize completion time (faster = better)
        const timeScore = this.normalizeTime(completionTime, puzzleSize);
        
        // Calculate move efficiency (fewer moves = better)
        const moveEfficiency = optimalMoves > 0 ? optimalMoves / moves : 1.0;
        
        // Combined performance score
        const performanceScore = (timeScore * 0.6) + (moveEfficiency * 0.4);
        
        // Update recent performance
        this.recentPerformance.push(performanceScore);
        if (this.recentPerformance.length > this.maxRecentGames) {
            this.recentPerformance.shift();
        }
        
        // Calculate average performance
        const avgPerformance = this.recentPerformance.reduce((a, b) => a + b, 0) / this.recentPerformance.length;
        
        // Update skill level (adaptive learning)
        this.playerSkill = Math.max(0.5, Math.min(2.0, avgPerformance * 1.5));
        
        return this.getDifficultyFromSkill();
    }

    /**
     * Normalize completion time based on puzzle size
     */
    normalizeTime(timeSeconds, puzzleSize) {
        // Expected time increases with puzzle size
        const baseTime = puzzleSize * 10; // Base time per size
        const normalized = Math.max(0.1, Math.min(1.0, baseTime / timeSeconds));
        return normalized;
    }

    /**
     * Get difficulty level from skill score
     */
    getDifficultyFromSkill() {
        if (this.playerSkill < 0.75) {
            return 'easy';
        } else if (this.playerSkill < 1.25) {
            return 'medium';
        } else if (this.playerSkill < 1.75) {
            return 'hard';
        } else {
            return 'expert';
        }
    }

    /**
     * Get current difficulty level
     */
    getCurrentDifficulty() {
        return this.getDifficultyFromSkill();
    }

    /**
     * Get shuffle complexity based on difficulty
     */
    getShuffleComplexity(difficulty = null) {
        const level = difficulty || this.getCurrentDifficulty();
        const complexities = {
            'easy': 30,
            'medium': 50,
            'hard': 80,
            'expert': 120
        };
        return complexities[level] || 50;
    }

    /**
     * Update difficulty display
     */
    updateDifficultyDisplay() {
        const difficultyElement = document.getElementById('difficulty-level');
        if (difficultyElement) {
            const difficulty = this.getCurrentDifficulty();
            difficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
    }

    /**
     * Record game completion for skill tracking
     */
    recordCompletion(puzzleSize, timeSeconds, moves) {
        // Estimate optimal moves (minimum moves for puzzle size)
        const optimalMoves = this.estimateOptimalMoves(puzzleSize);
        
        const difficulty = this.calculateSkillLevel(timeSeconds, moves, puzzleSize, optimalMoves);
        this.updateDifficultyDisplay();
        
        // Save to database if tracking system available
        if (window.trackingSystem) {
            window.trackingSystem.updatePlayerSkill(this.playerSkill, difficulty);
        }
        
        return difficulty;
    }

    /**
     * Estimate optimal moves for a puzzle size
     */
    estimateOptimalMoves(puzzleSize) {
        // Rough estimate: optimal moves scale with puzzle size
        return puzzleSize * puzzleSize * 2;
    }

    /**
     * Get player skill level
     */
    getSkillLevel() {
        return this.playerSkill;
    }

    /**
     * Reset skill tracking
     */
    reset() {
        this.playerSkill = 1.0;
        this.recentPerformance = [];
        this.updateDifficultyDisplay();
    }
}

// Initialize adaptive difficulty system
document.addEventListener('DOMContentLoaded', () => {
    window.adaptiveSystem = new AdaptiveDifficulty();
    window.adaptiveSystem.updateDifficultyDisplay();
});

