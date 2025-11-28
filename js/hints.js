/**
 * Magic Hints and Preview System
 * Provides optimal move suggestions and puzzle preview
 */

class HintSystem {
    constructor() {
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.hintCooldown = 0;
        this.cooldownTime = 5; // seconds
        this.previewActive = false;
    }

    /**
     * Show a hint (highlight next optimal move)
     */
    showHint() {
        if (this.hintsUsed >= this.maxHints) {
            this.showMessage('No more hints available!');
            return;
        }

        if (this.hintCooldown > 0) {
            this.showMessage(`Hint cooldown: ${this.hintCooldown}s`);
            return;
        }

        if (!window.gameController || !window.gameController.puzzle) {
            return;
        }

        const puzzle = window.gameController.puzzle;
        const optimalMove = this.findOptimalMove(puzzle);

        if (optimalMove) {
            this.highlightTile(optimalMove.row, optimalMove.col);
            this.hintsUsed++;
            this.hintCooldown = this.cooldownTime;
            this.startCooldownTimer();
            this.updateHintButton();
        } else {
            this.showMessage('No hint available at this time.');
        }
    }

    /**
     * Find optimal next move using simple heuristic
     */
    findOptimalMove(puzzle) {
        const grid = puzzle.getGrid();
        const size = puzzle.size;
        const emptyPos = puzzle.getEmptyPosition();
        const movableTiles = puzzle.getMovableTiles();

        if (movableTiles.length === 0) {
            return null;
        }

        // Find the tile that should be in the empty position
        const targetValue = this.getTargetValue(emptyPos, size);
        
        // Check if any movable tile is the target
        for (const tile of movableTiles) {
            if (tile.value === targetValue) {
                return { row: tile.row, col: tile.col };
            }
        }

        // Otherwise, find the tile closest to its correct position
        let bestMove = null;
        let bestScore = Infinity;

        for (const tile of movableTiles) {
            const correctPos = this.getCorrectPosition(tile.value, size);
            const distance = Math.abs(tile.row - correctPos.row) + Math.abs(tile.col - correctPos.col);
            
            if (distance < bestScore) {
                bestScore = distance;
                bestMove = { row: tile.row, col: tile.col };
            }
        }

        return bestMove;
    }

    /**
     * Get target value for a position
     */
    getTargetValue(pos, size) {
        const expected = pos.row * size + pos.col + 1;
        return expected === size * size ? 0 : expected;
    }

    /**
     * Get correct position for a tile value
     */
    getCorrectPosition(value, size) {
        if (value === 0) {
            return { row: size - 1, col: size - 1 };
        }
        const row = Math.floor((value - 1) / size);
        const col = (value - 1) % size;
        return { row, col };
    }

    /**
     * Highlight a tile as a hint
     */
    highlightTile(row, col) {
        const tiles = document.querySelectorAll('.puzzle-tile');
        tiles.forEach(tile => {
            tile.classList.remove('hint-highlight');
            if (parseInt(tile.dataset.row) === row && parseInt(tile.dataset.col) === col) {
                tile.classList.add('hint-highlight');
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    tile.classList.remove('hint-highlight');
                }, 3000);
            }
        });

        // Show hint indicator
        this.showHintIndicator();
    }

    /**
     * Show hint indicator animation
     */
    showHintIndicator() {
        const indicator = document.getElementById('hint-indicator');
        if (indicator) {
            indicator.textContent = '✨ Hint!';
            indicator.classList.remove('hidden');
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 2000);
        }
    }

    /**
     * Show puzzle preview (solution preview)
     */
    showPreview() {
        if (this.previewActive) {
            this.hidePreview();
            return;
        }

        if (!window.gameController || !window.gameController.puzzle) {
            return;
        }

        const puzzle = window.gameController.puzzle;
        const grid = puzzle.getGrid();
        const size = puzzle.size;
        const gridElement = document.getElementById('puzzle-grid');

        if (!gridElement) return;

        // Create preview overlay
        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'preview-overlay';
        previewOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 10px;
        `;

        // Create solved grid preview
        const previewGrid = document.createElement('div');
        previewGrid.className = `puzzle-grid size-${size}`;
        previewGrid.style.cssText = 'opacity: 0.9; transform: scale(0.8);';

        let num = 1;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                
                if (row === size - 1 && col === size - 1) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = num++;
                }
                
                previewGrid.appendChild(tile);
            }
        }

        previewOverlay.appendChild(previewGrid);
        gridElement.style.position = 'relative';
        gridElement.appendChild(previewOverlay);

        this.previewActive = true;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hidePreview();
        }, 5000);
    }

    /**
     * Hide puzzle preview
     */
    hidePreview() {
        const previewOverlay = document.querySelector('.preview-overlay');
        if (previewOverlay) {
            previewOverlay.remove();
        }
        this.previewActive = false;
    }

    /**
     * Start cooldown timer
     */
    startCooldownTimer() {
        const interval = setInterval(() => {
            this.hintCooldown--;
            if (this.hintCooldown <= 0) {
                clearInterval(interval);
                this.hintCooldown = 0;
            }
        }, 1000);
    }

    /**
     * Update hint button display
     */
    updateHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            const remaining = this.maxHints - this.hintsUsed;
            hintBtn.textContent = `Use Magic ✨ (${remaining} left)`;
            
            if (remaining === 0) {
                hintBtn.disabled = true;
                hintBtn.style.opacity = '0.5';
            }
        }
    }

    /**
     * Show message to user
     */
    showMessage(message) {
        // Simple alert for now, can be enhanced with toast notifications
        const indicator = document.getElementById('hint-indicator');
        if (indicator) {
            indicator.textContent = message;
            indicator.classList.remove('hidden');
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 2000);
        }
    }

    /**
     * Reset hints for new game
     */
    reset() {
        this.hintsUsed = 0;
        this.hintCooldown = 0;
        this.updateHintButton();
    }

    /**
     * Get remaining hints
     */
    getRemainingHints() {
        return this.maxHints - this.hintsUsed;
    }
}

// Initialize hint system
document.addEventListener('DOMContentLoaded', () => {
    window.hintSystem = new HintSystem();
});

