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
        // User registration (MySQLi)
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
        
        $mysqli = getMySQLiConnection();
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        if (!$stmt) {
            error_log('Prepare failed: ' . $mysqli->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $mysqli->error
            ], 500);
        }
        $stmt->bind_param("ss", $username, $email);
        if (!$stmt->execute()) {
            error_log('Execute failed: ' . $stmt->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $stmt->error
            ], 500);
        }
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Username or email already exists'
            ], 400);
        }
        $stmt->close();
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        // Insert user
        $stmt = $mysqli->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        if (!$stmt) {
            error_log('Prepare failed: ' . $mysqli->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $mysqli->error
            ], 500);
        }
        $stmt->bind_param("sss", $username, $email, $passwordHash);
        if (!$stmt->execute()) {
            error_log('Execute failed: ' . $stmt->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $stmt->error
            ], 500);
        }
        $userId = $stmt->insert_id;
        $stmt->close();
        
        // Create user profile
        $stmt = $mysqli->prepare("INSERT INTO user_profiles (user_id, preferences, theme_settings) VALUES (?, '{}', '{}')");
        if (!$stmt) {
            error_log('Prepare failed: ' . $mysqli->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $mysqli->error
            ], 500);
        }
        $stmt->bind_param("i", $userId);
        if (!$stmt->execute()) {
            error_log('Execute failed: ' . $stmt->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $stmt->error
            ], 500);
        }
        $stmt->close();
        
        // Create user preferences
        $stmt = $mysqli->prepare("INSERT INTO user_preferences (user_id, difficulty_preference, theme_preference) VALUES (?, 'adaptive', 'default')");
        if (!$stmt) {
            error_log('Prepare failed: ' . $mysqli->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $mysqli->error
            ], 500);
        }
        $stmt->bind_param("i", $userId);
        if (!$stmt->execute()) {
            error_log('Execute failed: ' . $stmt->error);
            sendJSONResponse([
                'success' => false,
                'message' => 'Database error: ' . $stmt->error
            ], 500);
        }
        $stmt->close();
        
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
        
        exit;
    }
    
    if ($action === 'login') {
        // User login (MySQLi)
        $username = sanitizeInput($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Username and password are required'
            ], 400);
        }
        
        $mysqli = getMySQLiConnection();
        $stmt = $mysqli->prepare("SELECT id, username, email, password_hash FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        
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
        
        exit;
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

