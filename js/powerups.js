/**
 * Holiday Magic Power-up System
 * Power-ups that players can earn and use during gameplay
 */

class PowerUpSystem {
    constructor() {
        this.powerUps = {
            timeFreeze: { unlocked: false, available: 0, cooldown: 0 },
            extraHints: { unlocked: false, available: 0, cooldown: 0 },
            moveUndo: { unlocked: false, available: 0, cooldown: 0 },
            tilePreview: { unlocked: false, available: 0, cooldown: 0 },
            speedBoost: { unlocked: false, available: 0, cooldown: 0 },
            shuffleProtection: { unlocked: false, available: 0, cooldown: 0 }
        };
        
        this.moveHistory = [];
        this.timeFreezeActive = false;
        this.timeFreezeEndTime = 0;
        
        this.loadPowerUps();
        this.renderPowerUps();
    }

    /**
     * Load power-ups from database
     */
    async loadPowerUps() {
        try {
            const response = await fetch('php/game.php?action=get_powerups');
            const data = await response.json();
            
            if (data.success && data.powerups) {
                data.powerups.forEach(powerup => {
                    if (this.powerUps.hasOwnProperty(powerup.type)) {
                        this.powerUps[powerup.type].unlocked = true;
                        this.powerUps[powerup.type].available = powerup.quantity || 1;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading power-ups:', error);
        }
    }

    /**
     * Unlock power-up through achievements
     */
    async unlockPowerUp(powerUpType) {
        if (!this.powerUps.hasOwnProperty(powerUpType)) {
            return false;
        }

        if (this.powerUps[powerUpType].unlocked) {
            return true; // Already unlocked
        }

        try {
            const response = await fetch('php/game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'unlock_powerup',
                    powerup_type: powerUpType
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.powerUps[powerUpType].unlocked = true;
                this.powerUps[powerUpType].available = 1;
                this.renderPowerUps();
                return true;
            }
        } catch (error) {
            console.error('Error unlocking power-up:', error);
        }
        
        return false;
    }

    /**
     * Use Time Freeze power-up (pause timer for 30 seconds)
     */
    useTimeFreeze() {
        if (!this.powerUps.timeFreeze.unlocked || this.powerUps.timeFreeze.available <= 0) {
            return false;
        }

        if (this.timeFreezeActive) {
            return false; // Already active
        }

        this.timeFreezeActive = true;
        this.timeFreezeEndTime = Date.now() + 30000; // 30 seconds
        
        // Pause game timer
        if (window.gameController) {
            window.gameController.pauseGame();
        }

        this.powerUps.timeFreeze.available--;
        this.renderPowerUps();

        // Auto-resume after 30 seconds
        setTimeout(() => {
            this.endTimeFreeze();
        }, 30000);

        return true;
    }

    /**
     * End time freeze
     */
    endTimeFreeze() {
        if (this.timeFreezeActive) {
            this.timeFreezeActive = false;
            if (window.gameController) {
                window.gameController.resumeGame();
            }
        }
    }

    /**
     * Use Extra Hints power-up (gain 2 additional hints)
     */
    useExtraHints() {
        if (!this.powerUps.extraHints.unlocked || this.powerUps.extraHints.available <= 0) {
            return false;
        }

        if (window.hintSystem) {
            window.hintSystem.maxHints += 2;
            window.hintSystem.updateHintButton();
        }

        this.powerUps.extraHints.available--;
        this.renderPowerUps();
        return true;
    }

    /**
     * Use Move Undo power-up (reverse last move)
     */
    useMoveUndo() {
        if (!this.powerUps.moveUndo.unlocked || this.powerUps.moveUndo.available <= 0) {
            return false;
        }

        if (this.moveHistory.length === 0) {
            return false; // No moves to undo
        }

        const lastMove = this.moveHistory.pop();
        
        // Reverse the move
        if (window.gameController && window.gameController.puzzle) {
            const puzzle = window.gameController.puzzle;
            puzzle.move(lastMove.toRow, lastMove.toCol);
            window.gameController.renderGrid();
            window.gameController.updateMoveCounter();
        }

        this.powerUps.moveUndo.available--;
        this.renderPowerUps();
        return true;
    }

    /**
     * Use Tile Preview power-up (show next 3 optimal moves)
     */
    useTilePreview() {
        if (!this.powerUps.tilePreview.unlocked || this.powerUps.tilePreview.available <= 0) {
            return false;
        }

        if (window.hintSystem) {
            // Show preview for next 3 moves
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    window.hintSystem.showHint();
                }, i * 1000);
            }
        }

        this.powerUps.tilePreview.available--;
        this.renderPowerUps();
        return true;
    }

    /**
     * Use Speed Boost power-up (2x timer for 1 minute)
     */
    useSpeedBoost() {
        if (!this.powerUps.speedBoost.unlocked || this.powerUps.speedBoost.available <= 0) {
            return false;
        }

        // This would require modifying the timer display logic
        // For now, just mark as used
        this.powerUps.speedBoost.available--;
        this.renderPowerUps();
        return true;
    }

    /**
     * Use Shuffle Protection power-up (prevent accidental shuffle)
     */
    useShuffleProtection() {
        if (!this.powerUps.shuffleProtection.unlocked || this.powerUps.shuffleProtection.available <= 0) {
            return false;
        }

        // Add confirmation to shuffle button
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            const originalOnClick = shuffleBtn.onclick;
            shuffleBtn.onclick = () => {
                if (confirm('Are you sure you want to shuffle? This will reset your progress.')) {
                    if (originalOnClick) originalOnClick();
                }
            };
        }

        this.powerUps.shuffleProtection.available--;
        this.renderPowerUps();
        return true;
    }

    /**
     * Record a move for undo functionality
     */
    recordMove(fromRow, fromCol, toRow, toCol) {
        this.moveHistory.push({
            fromRow,
            fromCol,
            toRow,
            toCol,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.moveHistory.length > 50) {
            this.moveHistory.shift();
        }
    }

    /**
     * Render power-ups UI
     */
    renderPowerUps() {
        const container = document.getElementById('powerups-container');
        if (!container) return;

        container.innerHTML = '';

        const powerUpTypes = [
            { key: 'timeFreeze', name: 'Time Freeze', icon: '⏸️', action: () => this.useTimeFreeze() },
            { key: 'extraHints', name: 'Extra Hints', icon: '💡', action: () => this.useExtraHints() },
            { key: 'moveUndo', name: 'Undo Move', icon: '↩️', action: () => this.useMoveUndo() },
            { key: 'tilePreview', name: 'Tile Preview', icon: '👁️', action: () => this.useTilePreview() },
            { key: 'speedBoost', name: 'Speed Boost', icon: '⚡', action: () => this.useSpeedBoost() },
            { key: 'shuffleProtection', name: 'Shuffle Protection', icon: '🛡️', action: () => this.useShuffleProtection() }
        ];

        powerUpTypes.forEach(powerup => {
            const powerUp = this.powerUps[powerup.key];
            const item = document.createElement('div');
            item.className = 'powerup-item';
            
            if (!powerUp.unlocked || powerUp.available <= 0) {
                item.classList.add('disabled');
            }

            item.innerHTML = `
                <div class="powerup-icon">${powerup.icon}</div>
                <div class="powerup-name">${powerup.name}</div>
                <div class="powerup-count">${powerUp.available}</div>
            `;

            if (powerUp.unlocked && powerUp.available > 0) {
                item.addEventListener('click', powerup.action);
            }

            container.appendChild(item);
        });
    }

    /**
     * Check time freeze status
     */
    isTimeFrozen() {
        return this.timeFreezeActive && Date.now() < this.timeFreezeEndTime;
    }
}

// Initialize power-up system
document.addEventListener('DOMContentLoaded', () => {
    window.powerUpSystem = new PowerUpSystem();
});

