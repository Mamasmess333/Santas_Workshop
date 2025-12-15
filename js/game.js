/**
 * Game Logic and Controls
 * Handles timer, move counter, shuffle, reset, and UI interactions
 */

class GameController {
  /**
   * Record a loss if the user exits during an active game
   */
  async recordLossOnExit() {
    if (
      this.isGameActive &&
      window.trackingSystem &&
      window.trackingSystem.currentSessionId
    ) {
      // Record as incomplete/loss
      await window.trackingSystem.recordCompletion(
        this.currentSize,
        this.timer,
        this.puzzle ? this.puzzle.getMoveCount() : 0,
        false
      );
    }
  }
  constructor() {
    this.puzzle = null;
    this.currentSize = 4;
    this.timer = 0;
    this.timerInterval = null;
    this.isPaused = false;
    this.isGameActive = false;
    this.gridElement = null;
    this.swapMode = false;
    this.swapFirst = null;

    this.initializeGame();
  }

  /**
   * Initialize the game
   */
  initializeGame() {
    this.gridElement = document.getElementById("puzzle-grid");
    if (!this.gridElement) {
      console.error("Puzzle grid element not found");
      return;
    }

    // Get initial size from select
    const sizeSelect = document.getElementById("puzzle-size-select");
    if (sizeSelect) {
      this.currentSize = parseInt(sizeSelect.value);
      sizeSelect.addEventListener("change", (e) => {
        this.changeSize(parseInt(e.target.value));
      });
    }

    // Initialize puzzle
    this.puzzle = new Puzzle(this.currentSize);
    this.puzzle.shuffle();
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
    const shuffleBtn = document.getElementById("shuffle-btn");
    const resetBtn = document.getElementById("reset-btn");
    const hintBtn = document.getElementById("hint-btn");
    const previewBtn = document.getElementById("preview-btn");
    const swapToggleBtn = document.getElementById("swap-toggle-btn");

    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", () => this.shuffle());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.reset());
    }

    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        if (
          window.audioSystem &&
          typeof window.audioSystem.playMagicSound === "function"
        ) {
          window.audioSystem.playMagicSound();
        }
        if (window.hintSystem) {
          window.hintSystem.showHint();
        }
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        if (window.hintSystem) {
          window.hintSystem.showPreview();
        }
      });
    }

    if (swapToggleBtn) {
      swapToggleBtn.addEventListener("click", () => {
        this.swapMode = !this.swapMode;
        this.swapFirst = null;
        swapToggleBtn.textContent = this.swapMode
          ? "Swap Adjacent (On)"
          : "Swap Adjacent";
      });
    }
  }

  /**
   * Render the puzzle grid
   */
  renderGrid() {
    if (!this.gridElement || !this.puzzle) return;

    // Clear existing grid
    this.gridElement.innerHTML = "";
    this.gridElement.className = `puzzle-grid size-${this.currentSize}`;

    const grid = this.puzzle.getGrid();
    const movableTiles = this.puzzle.getMovableTiles();
    const movablePositions = new Set(
      movableTiles.map((t) => `${t.row},${t.col}`)
    );

    // Create tiles
    for (let row = 0; row < this.currentSize; row++) {
      for (let col = 0; col < this.currentSize; col++) {
        const value = grid[row][col];
        const tile = document.createElement("div");
        tile.className = "puzzle-tile";

        if (value === 0) {
          tile.classList.add("empty");
        } else {
          tile.textContent = value;
          tile.dataset.row = row;
          tile.dataset.col = col;
          tile.dataset.value = value;

          // Add movable class if tile can be moved
          if (movablePositions.has(`${row},${col}`)) {
            tile.classList.add("movable");
          }

          // Add click handler
          tile.addEventListener("click", () => this.handleTileClick(row, col));
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
      // Only start session and timer on first move
      if (window.trackingSystem && !window.trackingSystem.currentSessionId) {
        window.trackingSystem.startSession(
          this.currentSize,
          this.getDifficultyLevel()
        );
      }
      this.startGame();
    }

    // Swap adjacent mode: select two adjacent non-empty tiles to swap
    if (this.swapMode) {
      const value = this.puzzle.grid[row][col];
      if (value === 0) {
        // ignore empty
      } else if (!this.swapFirst) {
        this.swapFirst = { row, col };
        // highlight selection briefly
        const selector = `.puzzle-tile[data-row='${row}'][data-col='${col}']`;
        const el = this.gridElement.querySelector(selector);
        if (el) {
          el.classList.add("hint-highlight");
          setTimeout(() => el.classList.remove("hint-highlight"), 600);
        }
      } else {
        const r1 = this.swapFirst.row,
          c1 = this.swapFirst.col;
        const r2 = row,
          c2 = col;
        const adjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
        if (adjacent && this.puzzle.swapAdjacent(r1, c1, r2, c2)) {
          this.swapFirst = null;
          this.renderGrid();
          this.updateMoveCounter();
          this.playMoveSound();
          if (this.puzzle.isSolved()) {
            this.handleWin();
          }
          return;
        } else {
          // invalid second selection, reset
          this.swapFirst = null;
        }
      }
      return;
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

    this.gridElement.addEventListener("dragstart", (e) => {
      if (
        e.target.classList.contains("puzzle-tile") &&
        !e.target.classList.contains("empty")
      ) {
        draggedTile = e.target;
        e.target.style.opacity = "0.5";
      }
    });

    this.gridElement.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("puzzle-tile")) {
        e.target.style.opacity = "1";
      }
    });

    this.gridElement.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.gridElement.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.target;

      if (target.classList.contains("empty") && draggedTile) {
        const row = parseInt(draggedTile.dataset.row);
        const col = parseInt(draggedTile.dataset.col);
        this.handleTileClick(row, col);
      }
    });

    // Make tiles draggable
    this.gridElement.addEventListener("mouseover", (e) => {
      if (
        e.target.classList.contains("puzzle-tile") &&
        !e.target.classList.contains("empty")
      ) {
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
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      timerElement.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }

  /**
   * Update move counter display
   */
  updateMoveCounter() {
    const moveCounter = document.getElementById("move-counter");
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
      easy: 0.5,
      medium: 1,
      hard: 1.5,
      expert: 2,
    };
    const numMoves = Math.floor(
      baseMoves * (difficultyMultiplier[difficulty] || 1)
    );

    this.puzzle.shuffle(numMoves);
    this.renderGrid();
    this.moves = 0;
    this.updateMoveCounter();
    this.startGame();
    // Play shuffle sound effect
    if (
      window.audioSystem &&
      typeof window.audioSystem.playShuffleSound === "function"
    ) {
      window.audioSystem.playShuffleSound();
    }
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
    // Play reset sound effect
    if (
      window.audioSystem &&
      typeof window.audioSystem.playResetSound === "function"
    ) {
      window.audioSystem.playResetSound();
    }
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

    const moves = this.puzzle.getMoveCount();
    const time = this.timer;

    // Award power-ups based on completion stats
    if (window.powerUpSystem) {
      // >10 min: 3 time freeze
      if (time > 600) {
        window.powerUpSystem.unlockPowerUp("timeFreeze", 3);
      }
      // >250 moves: 5 undo move
      if (moves > 250) {
        window.powerUpSystem.unlockPowerUp("moveUndo", 5);
      }
      // Any completion: 3 extra hints
      window.powerUpSystem.unlockPowerUp("extraHints", 3);
      // Optionally, show notification
      if (window.powerUpSystem.showAwardNotification) {
        let msg = "You earned:";
        if (time > 600) msg += " 3x Time Freeze";
        if (moves > 250) msg += (time > 600 ? ", " : " ") + "5x Undo Move";
        msg += (time > 600 || moves > 250 ? ", " : " ") + "3x Extra Hints!";
        window.powerUpSystem.showAwardNotification(msg);
      }
    }

    if (window.victorySystem) {
      window.victorySystem.showVictory(time, moves);
    }

    // Track progress
    if (window.trackingSystem) {
      window.trackingSystem.recordCompletion(this.currentSize, time, moves);
    }
  }

  /**
   * Get current difficulty level
   */
  getDifficultyLevel() {
    const difficultyElement = document.getElementById("difficulty-level");
    if (difficultyElement) {
      return difficultyElement.textContent.toLowerCase();
    }
    return "medium";
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
      isActive: this.isGameActive,
    };
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Navigation/exit warning and loss tracking
  let exitModal = null;
  function showExitModal(e) {
    if (!exitModal) {
      exitModal = document.createElement("div");
      exitModal.id = "exit-warning-modal";
      exitModal.style.position = "fixed";
      exitModal.style.top = "0";
      exitModal.style.left = "0";
      exitModal.style.width = "100vw";
      exitModal.style.height = "100vh";
      exitModal.style.background = "rgba(0,0,0,0.7)";
      exitModal.style.display = "flex";
      exitModal.style.alignItems = "center";
      exitModal.style.justifyContent = "center";
      exitModal.style.zIndex = "9999";
      exitModal.innerHTML = `<div style="background:#fff;padding:2em 3em;border-radius:10px;text-align:center;max-width:90vw;">
          <h2>Warning</h2>
          <p>If you leave this page, your current game will be counted as a loss in your analytics.</p>
          <button id="exit-modal-stay">Stay on this page</button>
          <button id="exit-modal-leave">Leave anyway</button>
        </div>`;
      document.body.appendChild(exitModal);
      document.getElementById("exit-modal-stay").onclick = () => {
        exitModal.style.display = "none";
      };
      document.getElementById("exit-modal-leave").onclick = () => {
        exitModal.style.display = "none";
        window.removeEventListener("beforeunload", beforeUnloadHandler);
        window.location.href = e.target.href || "/";
      };
    } else {
      exitModal.style.display = "flex";
    }
  }

  function beforeUnloadHandler(event) {
    if (window.gameController && window.gameController.isGameActive) {
      // Record loss
      if (window.trackingSystem && window.trackingSystem.currentSessionId) {
        window.trackingSystem.recordCompletion(
          window.gameController.currentSize,
          window.gameController.timer,
          window.gameController.puzzle
            ? window.gameController.puzzle.getMoveCount()
            : 0,
          false
        );
      }
      event.preventDefault();
      event.returnValue =
        "If you leave, your current game will be counted as a loss.";
      return event.returnValue;
    }
  }
  window.addEventListener("beforeunload", beforeUnloadHandler);

  // Intercept navigation clicks
  document.body.addEventListener(
    "click",
    function (e) {
      if (window.gameController && window.gameController.isGameActive) {
        let el = e.target;
        while (el && el.tagName !== "A") el = el.parentElement;
        if (el && el.tagName === "A" && el.href && !el.href.endsWith("#")) {
          e.preventDefault();
          showExitModal(e);
        }
      }
    },
    true
  );
  window.gameController = new GameController();
  // Transition music to game mode
  if (window.audioSystem) {
    window.audioSystem.transitionToGameMusic();
    window.audioSystem.setMusicIntensity(0.5);
  }
  // Trigger story modal for initial puzzle if needed
  if (window.storySystem && window.gameController) {
    setTimeout(() => {
      window.storySystem.onPuzzleSizeChange(window.gameController.currentSize);
    }, 500);
  }
});
