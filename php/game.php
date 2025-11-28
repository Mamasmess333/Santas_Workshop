<?php
/**
 * Game Data API
 * Handles game sessions, moves, badges, gifts, power-ups, and story progress
 */

require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? null;
}

if (!$action) {
    sendJSONResponse(['success' => false, 'message' => 'Action required'], 400);
}

$pdo = getDBConnection();

try {
    switch ($action) {
        case 'save_session':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $puzzleSize = intval($input['puzzle_size'] ?? 4);
            $moves = intval($input['moves'] ?? 0);
            $timeSeconds = intval($input['time_seconds'] ?? 0);
            $completed = boolval($input['completed'] ?? false);
            $difficultyLevel = sanitizeInput($input['difficulty_level'] ?? 'medium');
            
            $stmt = $pdo->prepare("INSERT INTO game_sessions (user_id, puzzle_size, difficulty_level, moves, time_seconds, completed) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([getCurrentUserId(), $puzzleSize, $difficultyLevel, $moves, $timeSeconds, $completed]);
            
            $sessionId = $pdo->lastInsertId();
            sendJSONResponse(['success' => true, 'session_id' => $sessionId]);
            break;
            
        case 'get_user_sessions':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $limit = intval($_GET['limit'] ?? 10);
            $stmt = $pdo->prepare("SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
            $stmt->execute([getCurrentUserId(), $limit]);
            $sessions = $stmt->fetchAll();
            
            sendJSONResponse(['success' => true, 'sessions' => $sessions]);
            break;
            
        case 'unlock_gift':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $giftType = sanitizeInput($input['gift_type'] ?? '');
            $description = sanitizeInput($input['description'] ?? '');
            
            // Check if gift already unlocked
            $stmt = $pdo->prepare("SELECT id FROM gifts WHERE user_id = ? AND gift_type = ?");
            $stmt->execute([getCurrentUserId(), $giftType]);
            
            if ($stmt->fetch()) {
                sendJSONResponse(['success' => false, 'message' => 'Gift already unlocked']);
            }
            
            $stmt = $pdo->prepare("INSERT INTO gifts (user_id, gift_type, description) VALUES (?, ?, ?)");
            $stmt->execute([getCurrentUserId(), $giftType, $description]);
            
            sendJSONResponse(['success' => true, 'message' => 'Gift unlocked']);
            break;
            
        case 'get_gifts':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $stmt = $pdo->prepare("SELECT * FROM gifts WHERE user_id = ? ORDER BY unlocked_at DESC");
            $stmt->execute([getCurrentUserId()]);
            $gifts = $stmt->fetchAll();
            
            sendJSONResponse(['success' => true, 'gifts' => $gifts]);
            break;
            
        case 'unlock_powerup':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $powerupType = sanitizeInput($input['powerup_type'] ?? '');
            
            // Check if power-up already unlocked
            $stmt = $pdo->prepare("SELECT id FROM user_badges WHERE user_id = ? AND badge_type = ? AND power_up_unlocked = ?");
            $stmt->execute([getCurrentUserId(), 'powerup', $powerupType]);
            
            if ($stmt->fetch()) {
                sendJSONResponse(['success' => false, 'message' => 'Power-up already unlocked']);
            }
            
            $stmt = $pdo->prepare("INSERT INTO user_badges (user_id, badge_type, power_up_unlocked) VALUES (?, 'powerup', ?)");
            $stmt->execute([getCurrentUserId(), $powerupType]);
            
            sendJSONResponse(['success' => true, 'message' => 'Power-up unlocked']);
            break;
            
        case 'get_powerups':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $stmt = $pdo->prepare("SELECT power_up_unlocked as type, COUNT(*) as quantity FROM user_badges WHERE user_id = ? AND badge_type = 'powerup' GROUP BY power_up_unlocked");
            $stmt->execute([getCurrentUserId()]);
            $powerups = $stmt->fetchAll();
            
            sendJSONResponse(['success' => true, 'powerups' => $powerups]);
            break;
            
        case 'save_story_progress':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $level = intval($input['level'] ?? 0);
            $dialogueSeen = json_encode($input['dialogue_seen'] ?? []);
            $choicesMade = json_encode($input['choices_made'] ?? []);
            
            // Check if progress exists
            $stmt = $pdo->prepare("SELECT id FROM story_progress WHERE user_id = ? AND level = ?");
            $stmt->execute([getCurrentUserId(), $level]);
            
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("UPDATE story_progress SET dialogue_seen = ?, choices_made = ? WHERE user_id = ? AND level = ?");
                $stmt->execute([$dialogueSeen, $choicesMade, getCurrentUserId(), $level]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO story_progress (user_id, level, dialogue_seen, choices_made) VALUES (?, ?, ?, ?)");
                $stmt->execute([getCurrentUserId(), $level, $dialogueSeen, $choicesMade]);
            }
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'get_story_progress':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $stmt = $pdo->prepare("SELECT level, dialogue_seen, choices_made FROM story_progress WHERE user_id = ?");
            $stmt->execute([getCurrentUserId()]);
            $progress = $stmt->fetchAll();
            
            $progressMap = [];
            $dialogueSeen = [];
            
            foreach ($progress as $p) {
                $progressMap[$p['level']] = true;
                $dialogueSeen = array_merge($dialogueSeen, json_decode($p['dialogue_seen'], true) ?? []);
            }
            
            sendJSONResponse([
                'success' => true,
                'progress' => $progressMap,
                'dialogue_seen' => $dialogueSeen
            ]);
            break;
            
        case 'check_levels':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $stmt = $pdo->prepare("SELECT DISTINCT puzzle_size FROM game_sessions WHERE user_id = ? AND completed = 1");
            $stmt->execute([getCurrentUserId()]);
            $completed = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            sendJSONResponse(['success' => true, 'completed_sizes' => $completed]);
            break;
            
        case 'get_total_games':
            if (!isAuthenticated()) {
                sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
            }
            
            $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM game_sessions WHERE user_id = ?");
            $stmt->execute([getCurrentUserId()]);
            $result = $stmt->fetch();
            
            sendJSONResponse(['success' => true, 'total_games' => intval($result['total'])]);
            break;
            
        default:
            sendJSONResponse(['success' => false, 'message' => 'Invalid action'], 400);
    }
} catch (PDOException $e) {
    error_log("Game API error: " . $e->getMessage());
    sendJSONResponse(['success' => false, 'message' => 'Database error'], 500);
}

