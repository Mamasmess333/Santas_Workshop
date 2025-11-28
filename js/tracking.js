/**
 * Progress Tracking System
 * Tracks game sessions, moves, completion times, and difficulty progression
 */

class TrackingSystem {
    constructor() {
        this.currentSessionId = null;
        this.sessionStartTime = null;
    }

    /**
     * Start a new game session
     */
    async startSession(puzzleSize, difficultyLevel) {
        try {
            const response = await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'start_session',
                    puzzle_size: puzzleSize,
                    difficulty_level: difficultyLevel
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.session_id) {
                this.currentSessionId = data.session_id;
                this.sessionStartTime = Date.now();
                return data.session_id;
            }
        } catch (error) {
            console.error('Error starting session:', error);
        }
        
        return null;
    }

    /**
     * Record a move
     */
    async recordMove(fromRow, fromCol, toRow, toCol) {
        if (!this.currentSessionId) {
            return;
        }

        try {
            await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'record_move',
                    session_id: this.currentSessionId,
                    tile_position_from: fromRow * 100 + fromCol,
                    tile_position_to: toRow * 100 + toCol
                })
            });
        } catch (error) {
            console.error('Error recording move:', error);
        }
    }

    /**
     * Record puzzle completion
     */
    async recordCompletion(puzzleSize, timeSeconds, moves) {
        if (!this.currentSessionId) {
            // Start session if not started
            await this.startSession(puzzleSize, 'medium');
        }

        try {
            const response = await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'complete_session',
                    session_id: this.currentSessionId,
                    puzzle_size: puzzleSize,
                    time_seconds: timeSeconds,
                    moves: moves,
                    completed: true
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Calculate and save performance metrics
                await this.savePerformanceMetrics(timeSeconds, moves);
                
                // Update player behavior
                await this.updatePlayerBehavior(puzzleSize, timeSeconds, moves);
            }
            
            // Reset session
            this.currentSessionId = null;
            this.sessionStartTime = null;
            
            return data.success;
        } catch (error) {
            console.error('Error recording completion:', error);
            return false;
        }
    }

    /**
     * Save performance metrics
     */
    async savePerformanceMetrics(timeSeconds, moves) {
        if (!this.currentSessionId) return;

        // Calculate efficiency score
        const optimalMoves = this.estimateOptimalMoves(window.gameController ? window.gameController.currentSize : 4);
        const efficiencyScore = optimalMoves > 0 ? (optimalMoves / moves) * 100 : 0;
        const optimalMoveRatio = optimalMoves > 0 ? moves / optimalMoves : 1;

        try {
            await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save_metrics',
                    session_id: this.currentSessionId,
                    efficiency_score: efficiencyScore,
                    optimal_move_ratio: optimalMoveRatio,
                    difficulty_adjustment: window.adaptiveSystem ? window.adaptiveSystem.getSkillLevel() : 1.0
                })
            });
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }

    /**
     * Update player behavior statistics
     */
    async updatePlayerBehavior(puzzleSize, timeSeconds, moves) {
        try {
            await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_behavior',
                    puzzle_size: puzzleSize,
                    completion_time: timeSeconds,
                    moves: moves
                })
            });
        } catch (error) {
            console.error('Error updating player behavior:', error);
        }
    }

    /**
     * Update player skill level
     */
    async updatePlayerSkill(skillLevel, difficulty) {
        try {
            await fetch('php/tracking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_skill',
                    skill_level: skillLevel,
                    difficulty: difficulty
                })
            });
        } catch (error) {
            console.error('Error updating skill:', error);
        }
    }

    /**
     * Get user's game history
     */
    async getGameHistory(limit = 10) {
        try {
            const response = await fetch(`php/tracking.php?action=get_history&limit=${limit}`);
            const data = await response.json();
            
            if (data.success) {
                return data.history || [];
            }
        } catch (error) {
            console.error('Error getting game history:', error);
        }
        
        return [];
    }

    /**
     * Get player statistics
     */
    async getPlayerStats() {
        try {
            const response = await fetch('php/tracking.php?action=get_stats');
            const data = await response.json();
            
            if (data.success) {
                return data.stats || {};
            }
        } catch (error) {
            console.error('Error getting player stats:', error);
        }
        
        return {};
    }

    /**
     * Estimate optimal moves for puzzle size
     */
    estimateOptimalMoves(puzzleSize) {
        return puzzleSize * puzzleSize * 2;
    }
}

// Initialize tracking system
document.addEventListener('DOMContentLoaded', () => {
    window.trackingSystem = new TrackingSystem();
});

