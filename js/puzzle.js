/**
 * Core Puzzle Mechanics
 * Handles tile movement, win detection, solvability checks, and multiple puzzle sizes
 */

class Puzzle {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.emptyPos = { row: size - 1, col: size - 1 };
        this.totalTiles = size * size - 1;
        this.moves = 0;
        this.initializeGrid();
    }

    /**
     * Initialize the grid with numbers 1 to n-1, with empty space at the end
     */
    initializeGrid() {
        this.grid = [];
        let num = 1;
        for (let row = 0; row < this.size; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                if (row === this.size - 1 && col === this.size - 1) {
                    this.grid[row][col] = 0; // Empty space
                } else {
                    this.grid[row][col] = num++;
                }
            }
        }
        this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    }

    /**
     * Get the current grid state
     */
    getGrid() {
        return this.grid.map(row => [...row]);
    }

    /**
     * Check if a tile at (row, col) can be moved (adjacent to empty space)
     */
    canMove(row, col) {
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * Move a tile at (row, col) to the empty space
     * Returns true if move was successful
     */
    move(row, col) {
        if (!this.canMove(row, col)) {
            return false;
        }

        // Swap tile with empty space
        const temp = this.grid[row][col];
        this.grid[row][col] = 0;
        this.grid[this.emptyPos.row][this.emptyPos.col] = temp;
        
        // Update empty position
        this.emptyPos = { row, col };
        this.moves++;
        return true;
    }

    /**
     * Check if the puzzle is solved (tiles in correct order)
     */
    isSolved() {
        let expected = 1;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (row === this.size - 1 && col === this.size - 1) {
                    // Last position should be empty (0)
                    if (this.grid[row][col] !== 0) {
                        return false;
                    }
                } else {
                    if (this.grid[row][col] !== expected) {
                        return false;
                    }
                    expected++;
                }
            }
        }
        return true;
    }

    /**
     * Get all movable tiles (adjacent to empty space)
     */
    getMovableTiles() {
        const movable = [];
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 },  // Left
            { row: 0, col: 1 }    // Right
        ];

        for (const dir of directions) {
            const newRow = this.emptyPos.row + dir.row;
            const newCol = this.emptyPos.col + dir.col;
            
            if (this.isValidPosition(newRow, newCol)) {
                movable.push({ row: newRow, col: newCol, value: this.grid[newRow][newCol] });
            }
        }

        return movable;
    }

    /**
     * Check if position is valid
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    /**
     * Shuffle the puzzle using strategic row/column moves
     * Ensures the puzzle remains solvable
     */
    shuffle(numMoves = 100) {
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 },  // Left
            { row: 0, col: 1 }    // Right
        ];

        let lastDirection = null;
        
        for (let i = 0; i < numMoves; i++) {
            const validMoves = [];
            
            for (const dir of directions) {
                const newRow = this.emptyPos.row + dir.row;
                const newCol = this.emptyPos.col + dir.col;
                
                // Avoid moving back to previous position
                if (this.isValidPosition(newRow, newCol) && 
                    !(lastDirection && dir.row === -lastDirection.row && dir.col === -lastDirection.col)) {
                    validMoves.push(dir);
                }
            }

            if (validMoves.length > 0) {
                const randomDir = validMoves[Math.floor(Math.random() * validMoves.length)];
                const newRow = this.emptyPos.row + randomDir.row;
                const newCol = this.emptyPos.col + randomDir.col;
                
                this.move(newRow, newCol);
                lastDirection = randomDir;
            }
        }

        this.moves = 0; // Reset move counter after shuffle
    }

    /**
     * Check if the puzzle configuration is solvable
     * Uses inversion count and empty tile position parity
     */
    isSolvable() {
        // Flatten grid to 1D array (excluding empty space)
        const flat = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== 0) {
                    flat.push(this.grid[row][col]);
                }
            }
        }

        // Count inversions
        let inversions = 0;
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[i] > flat[j]) {
                    inversions++;
                }
            }
        }

        // For even-sized grids, solvability depends on:
        // (inversions + empty_row_from_bottom) % 2 === 0
        // For odd-sized grids:
        // inversions % 2 === 0
        const emptyRowFromBottom = this.size - this.emptyPos.row;
        
        if (this.size % 2 === 0) {
            // Even-sized grid
            return (inversions + emptyRowFromBottom) % 2 === 0;
        } else {
            // Odd-sized grid
            return inversions % 2 === 0;
        }
    }

    /**
     * Get the position of a specific tile value
     */
    getTilePosition(value) {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === value) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Get the empty position
     */
    getEmptyPosition() {
        return { ...this.emptyPos };
    }

    /**
     * Reset the puzzle to solved state
     */
    reset() {
        this.initializeGrid();
        this.moves = 0;
    }

    /**
     * Get move count
     */
    getMoveCount() {
        return this.moves;
    }

    /**
     * Set puzzle size and reinitialize
     */
    setSize(newSize) {
        this.size = newSize;
        this.totalTiles = newSize * newSize - 1;
        this.initializeGrid();
        this.moves = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Puzzle;
}

