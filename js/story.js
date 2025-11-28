/**
 * Christmas Story Mode
 * Holiday narrative that unfolds as players progress
 */

class StorySystem {
    constructor() {
        this.currentLevel = 0;
        this.dialogueSeen = new Set();
        this.storyProgress = {
            4: false,  // 4x4 level
            6: false,  // 6x6 level
            8: false,  // 8x8 level
            10: false  // 10x10 level
        };
        
        this.dialogues = {
            4: [
                {
                    character: 'santa',
                    text: "Ho ho ho! Welcome to my workshop, young elf!",
                    portrait: '🎅'
                },
                {
                    character: 'mrs_claus',
                    text: "Santa, the toys are all mixed up! Can you help organize them?",
                    portrait: '👵'
                },
                {
                    character: 'santa',
                    text: "Of course! Let's start with the smaller puzzles first.",
                    portrait: '🎅'
                }
            ],
            6: [
                {
                    character: 'santa',
                    text: "Great job! The workshop is getting more organized!",
                    portrait: '🎅'
                },
                {
                    character: 'mrs_claus',
                    text: "But there are more toys to organize. Can you handle a bigger challenge?",
                    portrait: '👵'
                }
            ],
            8: [
                {
                    character: 'santa',
                    text: "You're doing wonderfully! The workshop is almost ready!",
                    portrait: '🎅'
                },
                {
                    character: 'mrs_claus',
                    text: "Just a few more puzzles and we'll be ready for Christmas Eve!",
                    portrait: '👵'
                }
            ],
            10: [
                {
                    character: 'santa',
                    text: "This is the final challenge! The biggest puzzle in the workshop!",
                    portrait: '🎅'
                },
                {
                    character: 'mrs_claus',
                    text: "If you can solve this, the workshop will be perfectly organized!",
                    portrait: '👵'
                },
                {
                    character: 'santa',
                    text: "You've been amazing! Thank you for helping us prepare for Christmas!",
                    portrait: '🎅'
                }
            ]
        };
        
        this.loadStoryProgress();
    }

    /**
     * Load story progress from database
     */
    async loadStoryProgress() {
        try {
            const response = await fetch('php/game.php?action=get_story_progress');
            const data = await response.json();
            
            if (data.success && data.progress) {
                this.storyProgress = { ...this.storyProgress, ...data.progress };
                this.dialogueSeen = new Set(data.dialogue_seen || []);
            }
        } catch (error) {
            console.error('Error loading story progress:', error);
        }
    }

    /**
     * Check if story should trigger for a puzzle size
     */
    checkStoryTrigger(puzzleSize) {
        if (!this.storyProgress.hasOwnProperty(puzzleSize)) {
            return false;
        }

        // Trigger story when starting a new level
        if (!this.storyProgress[puzzleSize]) {
            this.showStory(puzzleSize);
            return true;
        }

        return false;
    }

    /**
     * Show story dialogue for a level
     */
    showStory(level) {
        const dialogues = this.dialogues[level];
        if (!dialogues || dialogues.length === 0) {
            return;
        }

        let currentDialogueIndex = 0;
        const overlay = document.getElementById('story-overlay');
        const portrait = document.getElementById('character-portrait');
        const text = document.getElementById('dialogue-text');
        const continueBtn = document.getElementById('continue-btn');

        if (!overlay || !portrait || !text || !continueBtn) {
            return;
        }

        // Show overlay
        overlay.classList.remove('hidden');

        const showDialogue = (index) => {
            if (index >= dialogues.length) {
                // End of dialogue
                this.endStory(level);
                return;
            }

            const dialogue = dialogues[index];
            portrait.textContent = dialogue.portrait;
            text.textContent = dialogue.text;

            // Update character styling
            if (dialogue.character === 'santa') {
                portrait.style.borderColor = 'var(--christmas-red)';
            } else {
                portrait.style.borderColor = 'var(--christmas-green)';
            }

            // Mark dialogue as seen
            const dialogueKey = `${level}-${index}`;
            this.dialogueSeen.add(dialogueKey);
        };

        // Show first dialogue
        showDialogue(0);

        // Continue button handler
        const handleContinue = () => {
            currentDialogueIndex++;
            showDialogue(currentDialogueIndex);
        };

        continueBtn.onclick = handleContinue;
    }

    /**
     * End story and mark level as completed
     */
    async endStory(level) {
        const overlay = document.getElementById('story-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        this.storyProgress[level] = true;
        await this.saveStoryProgress(level);
    }

    /**
     * Save story progress to database
     */
    async saveStoryProgress(level) {
        try {
            const response = await fetch('php/game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save_story_progress',
                    level: level,
                    dialogue_seen: Array.from(this.dialogueSeen),
                    choices_made: []
                })
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving story progress:', error);
            return false;
        }
    }

    /**
     * Trigger story when puzzle size changes
     */
    onPuzzleSizeChange(newSize) {
        if ([4, 6, 8, 10].includes(newSize)) {
            this.checkStoryTrigger(newSize);
        }
    }

    /**
     * Get story progress
     */
    getStoryProgress() {
        return { ...this.storyProgress };
    }
}

// Initialize story system
document.addEventListener('DOMContentLoaded', () => {
    window.storySystem = new StorySystem();
    
    // Listen for puzzle size changes
    const sizeSelect = document.getElementById('puzzle-size-select');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => {
            const newSize = parseInt(e.target.value);
            if (window.storySystem) {
                setTimeout(() => {
                    window.storySystem.onPuzzleSizeChange(newSize);
                }, 500);
            }
        });
    }
});

