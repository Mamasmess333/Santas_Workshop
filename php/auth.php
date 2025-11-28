<?php
/**
 * Authentication Endpoints
 * Handles user registration, login, logout, and session management
 */

require_once 'config.php';

header('Content-Type: application/json');

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? null);

// Handle different actions
if ($method === 'GET' && $action === 'check') {
    // Check authentication status
    if (isAuthenticated()) {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = ?");
        $stmt->execute([getCurrentUserId()]);
        $user = $stmt->fetch();
        
        if ($user) {
            sendJSONResponse([
                'success' => true,
                'authenticated' => true,
                'user' => $user
            ]);
        }
    }
    
    sendJSONResponse([
        'success' => true,
        'authenticated' => false
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? null;
    
    if ($action === 'register') {
        // User registration
        $username = sanitizeInput($input['username'] ?? '');
        $email = sanitizeInput($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        // Validation
        if (empty($username) || empty($email) || empty($password)) {
            sendJSONResponse([
                'success' => false,
                'message' => 'All fields are required'
            ], 400);
        }
        
        if (strlen($username) < 3 || strlen($username) > 50) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Username must be between 3 and 50 characters'
            ], 400);
        }
        
        if (!validateEmail($email)) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Invalid email address'
            ], 400);
        }
        
        if (strlen($password) < 6) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Password must be at least 6 characters'
            ], 400);
        }
        
        try {
            $pdo = getDBConnection();
            
            // Check if username or email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            
            if ($stmt->fetch()) {
                sendJSONResponse([
                    'success' => false,
                    'message' => 'Username or email already exists'
                ], 400);
            }
            
            // Hash password
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            
            // Insert user
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
            $stmt->execute([$username, $email, $passwordHash]);
            
            $userId = $pdo->lastInsertId();
            
            // Create user profile
            $stmt = $pdo->prepare("INSERT INTO user_profiles (user_id, preferences, theme_settings) VALUES (?, '{}', '{}')");
            $stmt->execute([$userId]);
            
            // Create user preferences
            $stmt = $pdo->prepare("INSERT INTO user_preferences (user_id, difficulty_preference, theme_preference) VALUES (?, 'adaptive', 'default')");
            $stmt->execute([$userId]);
            
            // Set session
            $_SESSION['user_id'] = $userId;
            $_SESSION['username'] = $username;
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $userId,
                    'username' => $username,
                    'email' => $email
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("Registration error: " . $e->getMessage());
            sendJSONResponse([
                'success' => false,
                'message' => 'Registration failed. Please try again.'
            ], 500);
        }
    }
    
    if ($action === 'login') {
        // User login
        $username = sanitizeInput($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Username and password are required'
            ], 400);
        }
        
        try {
            $pdo = getDBConnection();
            
            // Get user
            $stmt = $pdo->prepare("SELECT id, username, email, password_hash FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($password, $user['password_hash'])) {
                sendJSONResponse([
                    'success' => false,
                    'message' => 'Invalid username or password'
                ], 401);
            }
            
            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            sendJSONResponse([
                'success' => false,
                'message' => 'Login failed. Please try again.'
            ], 500);
        }
    }
    
    if ($action === 'logout') {
        // User logout
        session_destroy();
        sendJSONResponse([
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }
}

sendJSONResponse([
    'success' => false,
    'message' => 'Invalid request'
], 400);

