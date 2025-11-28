/**
 * Game Logic and Controls
 * Handles timer, move counter, shuffle, reset, and UI interactions
 */

class GameController {
    constructor() {
        this.puzzle = null;
        this.currentSize = 4;
        this.timer = 0;
        this.timerInterval = null;
        this.isPaused = false;
        this.isGameActive = false;
        this.gridElement = null;
        
        this.initializeGame();
    }

    /**
     * Initialize the game
     */
    initializeGame() {
        this.gridElement = document.getElementById('puzzle-grid');
        if (!this.gridElement) {
            console.error('Puzzle grid element not found');
            return;
        }

        // Get initial size from select
        const sizeSelect = document.getElementById('puzzle-size-select');
        if (sizeSelect) {
            this.currentSize = parseInt(sizeSelect.value);
            sizeSelect.addEventListener('change', (e) => {
                this.changeSize(parseInt(e.target.value));
            });
        }

        // Initialize puzzle
        this.puzzle = new Puzzle(this.currentSize);
        this.renderGrid();

        // Set up control buttons
        this.setupControls();

        // Set up drag and drop
        this.setupDragAndDrop();
    }

    /**
     * Set up control buttons
     */
    setupControls() {
        const shuffleBtn = document.getElementById('shuffle-btn');
        const resetBtn = document.getElementById('reset-btn');
        const hintBtn = document.getElementById('hint-btn');
        const previewBtn = document.getElementById('preview-btn');

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffle());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                if (window.hintSystem) {
                    window.hintSystem.showHint();
                }
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                if (window.hintSystem) {
                    window.hintSystem.showPreview();
                }
            });
        }
    }

    /**
     * Render the puzzle grid
     */
    renderGrid() {
        if (!this.gridElement || !this.puzzle) return;

        // Clear existing grid
        this.gridElement.innerHTML = '';
        this.gridElement.className = `puzzle-grid size-${this.currentSize}`;

        const grid = this.puzzle.getGrid();
        const movableTiles = this.puzzle.getMovableTiles();
        const movablePositions = new Set(
            movableTiles.map(t => `${t.row},${t.col}`)
        );

        // Create tiles
        for (let row = 0; row < this.currentSize; row++) {
            for (let col = 0; col < this.currentSize; col++) {
                const value = grid[row][col];
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                
                if (value === 0) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = value;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    tile.dataset.value = value;

                    // Add movable class if tile can be moved
                    if (movablePositions.has(`${row},${col}`)) {
                        tile.classList.add('movable');
                    }

                    // Add click handler
                    tile.addEventListener('click', () => this.handleTileClick(row, col));
                }

                this.gridElement.appendChild(tile);
            }
        }
    }

    /**
     * Handle tile click
     */
    handleTileClick(row, col) {
        if (!this.isGameActive && !this.isPaused) {
            this.startGame();
        }

        if (this.puzzle.move(row, col)) {
            this.updateMoveCounter();
            this.renderGrid();
            this.playMoveSound();

            // Check for win
            if (this.puzzle.isSolved()) {
                this.handleWin();
            }
        }
    }

    /**
     * Set up drag and drop functionality
     */
    setupDragAndDrop() {
        if (!this.gridElement) return;

        let draggedTile = null;

        this.gridElement.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('puzzle-tile') && !e.target.classList.contains('empty')) {
                draggedTile = e.target;
                e.target.style.opacity = '0.5';
            }
        });

        this.gridElement.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('puzzle-tile')) {
                e.target.style.opacity = '1';
            }
        });

        this.gridElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.gridElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target;
            
            if (target.classList.contains('empty') && draggedTile) {
                const row = parseInt(draggedTile.dataset.row);
                const col = parseInt(draggedTile.dataset.col);
                this.handleTileClick(row, col);
            }
        });

        // Make tiles draggable
        this.gridElement.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('puzzle-tile') && !e.target.classList.contains('empty')) {
                e.target.draggable = true;
            }
        });
    }

    /**
     * Start the game timer
     */
    startGame() {
        if (this.isGameActive) return;

        this.isGameActive = true;
        this.isPaused = false;
        this.timer = 0;
        this.updateTimer();

        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.isPaused = true;
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.isPaused = false;
    }

    /**
     * Stop the game timer
     */
    stopGame() {
        this.isGameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Update timer display
     */
    updateTimer() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Update move counter display
     */
    updateMoveCounter() {
        const moveCounter = document.getElementById('move-counter');
        if (moveCounter && this.puzzle) {
            moveCounter.textContent = this.puzzle.getMoveCount();
        }
    }

    /**
     * Shuffle the puzzle
     */
    shuffle() {
        if (!this.puzzle) return;

        // Calculate shuffle complexity based on difficulty
        const difficulty = this.getDifficultyLevel();
        const baseMoves = 50;
        const difficultyMultiplier = {
            'easy': 0.5,
            'medium': 1,
            'hard': 1.5,
            'expert': 2
        };
        const numMoves = Math.floor(baseMoves * (difficultyMultiplier[difficulty] || 1));

        this.puzzle.shuffle(numMoves);
        this.renderGrid();
        this.moves = 0;
        this.updateMoveCounter();
        this.startGame();
    }

    /**
     * Reset the puzzle to solved state
     */
    reset() {
        if (!this.puzzle) return;

        this.puzzle.reset();
        this.renderGrid();
        this.stopGame();
        this.timer = 0;
        this.updateTimer();
        this.updateMoveCounter();
    }

    /**
     * Change puzzle size
     */
    changeSize(newSize) {
        if (newSize === this.currentSize) return;

        this.currentSize = newSize;
        this.puzzle.setSize(newSize);
        this.renderGrid();
        this.stopGame();
        this.timer = 0;
        this.updateTimer();
        this.updateMoveCounter();
    }

    /**
     * Handle puzzle completion
     */
    handleWin() {
        this.stopGame();
        
        if (window.victorySystem) {
            window.victorySystem.showVictory(this.timer, this.puzzle.getMoveCount());
        }

        // Track progress
        if (window.trackingSystem) {
            window.trackingSystem.recordCompletion(this.currentSize, this.timer, this.puzzle.getMoveCount());
        }
    }

    /**
     * Get current difficulty level
     */
    getDifficultyLevel() {
        const difficultyElement = document.getElementById('difficulty-level');
        if (difficultyElement) {
            return difficultyElement.textContent.toLowerCase();
        }
        return 'medium';
    }

    /**
     * Play move sound effect
     */
    playMoveSound() {
        if (window.audioSystem) {
            window.audioSystem.playMoveSound();
        }
    }

    /**
     * Get game state for saving
     */
    getGameState() {
        return {
            size: this.currentSize,
            timer: this.timer,
            moves: this.puzzle ? this.puzzle.getMoveCount() : 0,
            grid: this.puzzle ? this.puzzle.getGrid() : null,
            isActive: this.isGameActive
        };
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

