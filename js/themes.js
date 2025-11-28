/**
 * Dynamic Theme System
 * Changes themes based on player performance and time of day
 */

class ThemeSystem {
    constructor() {
        this.currentTheme = 'default';
        this.performanceTheme = 'default';
        this.timeTheme = 'default';
        this.treeLightsOn = false;
        
        this.initializeTheme();
        this.updateTimeBasedTheme();
        setInterval(() => this.updateTimeBasedTheme(), 60000); // Update every minute
    }

    /**
     * Initialize theme system
     */
    initializeTheme() {
        this.updateTimeBasedTheme();
        this.updatePerformanceTheme();
        this.applyTheme();
    }

    /**
     * Update theme based on time of day
     */
    updateTimeBasedTheme() {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hour * 60 + minutes;
        
        // 7:30 PM = 19:30 = 1170 minutes
        const sunsetTime = 19 * 60 + 30; // 7:30 PM
        
        if (timeInMinutes >= sunsetTime || timeInMinutes < 6 * 60) {
            // Night time (after 7:30 PM or before 6 AM)
            this.timeTheme = 'night';
            this.treeLightsOn = true;
        } else {
            // Day time
            this.timeTheme = 'day';
            this.treeLightsOn = false;
        }
        
        this.applyTheme();
    }

    /**
     * Update theme based on player performance
     */
    updatePerformanceTheme() {
        if (!window.adaptiveSystem) {
            this.performanceTheme = 'default';
            return;
        }

        const skillLevel = window.adaptiveSystem.getSkillLevel();
        
        if (skillLevel >= 1.5) {
            // High performance - brighter theme
            this.performanceTheme = 'bright';
        } else if (skillLevel < 0.75) {
            // Low performance - cozier theme
            this.performanceTheme = 'cozy';
        } else {
            this.performanceTheme = 'default';
        }
        
        this.applyTheme();
    }

    /**
     * Apply current theme to body
     */
    applyTheme() {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('day-theme', 'night-theme', 'performance-bright', 'performance-cozy');
        
        // Apply time-based theme
        if (this.timeTheme === 'day') {
            body.classList.add('day-theme');
        } else if (this.timeTheme === 'night') {
            body.classList.add('night-theme');
        }
        
        // Apply performance-based theme
        if (this.performanceTheme === 'bright') {
            body.classList.add('performance-bright');
        } else if (this.performanceTheme === 'cozy') {
            body.classList.add('performance-cozy');
        }
        
        // Update tree lighting
        this.updateTreeLighting();
    }

    /**
     * Update tree lighting based on time
     */
    updateTreeLighting() {
        const trees = document.querySelectorAll('.tree-decoration');
        trees.forEach(tree => {
            if (this.treeLightsOn) {
                tree.classList.add('lights-on');
                tree.classList.remove('lights-off');
            } else {
                tree.classList.add('lights-off');
                tree.classList.remove('lights-on');
            }
        });
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return {
            time: this.timeTheme,
            performance: this.performanceTheme,
            treeLights: this.treeLightsOn
        };
    }

    /**
     * Save theme preferences to database
     */
    async saveThemePreferences() {
        const theme = this.getCurrentTheme();
        
        try {
            const response = await fetch('php/game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save_theme',
                    theme: theme
                })
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving theme preferences:', error);
            return false;
        }
    }
}

// Initialize theme system
document.addEventListener('DOMContentLoaded', () => {
    window.themeSystem = new ThemeSystem();
    
    // Update performance theme when skill changes
    if (window.adaptiveSystem) {
        setInterval(() => {
            window.themeSystem.updatePerformanceTheme();
        }, 5000);
    }
});

