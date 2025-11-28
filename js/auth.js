/**
 * Authentication Helpers
 * Handles user login, registration, and session management
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.checkAuthStatus();
    }

    /**
     * Check if user is authenticated
     */
    async checkAuthStatus() {
        try {
            const response = await fetch('php/auth.php?action=check');
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                return true;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
        
        return false;
    }

    /**
     * Handle login form submission
     */
    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');

            try {
                const response = await fetch('php/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    this.currentUser = data.user;
                    window.location.href = 'game.html';
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = data.message || 'Login failed. Please check your credentials.';
                        errorMsg.classList.remove('hidden');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'An error occurred. Please try again.';
                    errorMsg.classList.remove('hidden');
                }
            }
        });
    }

    /**
     * Handle registration form submission
     */
    setupRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const errorMsg = document.getElementById('error-message');

            // Validate passwords match
            if (password !== passwordConfirm) {
                if (errorMsg) {
                    errorMsg.textContent = 'Passwords do not match.';
                    errorMsg.classList.remove('hidden');
                }
                return;
            }

            // Validate password length
            if (password.length < 6) {
                if (errorMsg) {
                    errorMsg.textContent = 'Password must be at least 6 characters.';
                    errorMsg.classList.remove('hidden');
                }
                return;
            }

            try {
                const response = await fetch('php/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'register',
                        username: username,
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Auto-login after registration
                    this.currentUser = data.user;
                    window.location.href = 'game.html';
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = data.message || 'Registration failed. Please try again.';
                        errorMsg.classList.remove('hidden');
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'An error occurred. Please try again.';
                    errorMsg.classList.remove('hidden');
                }
            }
        });
    }

    /**
     * Handle logout
     */
    async logout() {
        try {
            const response = await fetch('php/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'logout'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = null;
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Setup logout button
     */
    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    window.authSystem.setupLoginForm();
    window.authSystem.setupRegisterForm();
    window.authSystem.setupLogoutButton();
});

