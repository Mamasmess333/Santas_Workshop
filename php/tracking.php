<?php
/**
 * Progress Tracking API
 * Tracks game sessions, moves, completion times, and difficulty progression
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

if (!isAuthenticated()) {
    sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
}

$pdo = getDBConnection();

try {
    switch ($action) {
        case 'start_session':
            $puzzleSize = intval($input['puzzle_size'] ?? 4);
            $difficultyLevel = sanitizeInput($input['difficulty_level'] ?? 'medium');
            
            $stmt = $pdo->prepare("INSERT INTO game_sessions (user_id, puzzle_size, difficulty_level, completed) VALUES (?, ?, ?, 0)");
            $stmt->execute([getCurrentUserId(), $puzzleSize, $difficultyLevel]);
            
            $sessionId = $pdo->lastInsertId();
            sendJSONResponse(['success' => true, 'session_id' => $sessionId]);
            break;
            
        case 'record_move':
            $sessionId = intval($input['session_id'] ?? 0);
            $tilePositionFrom = intval($input['tile_position_from'] ?? 0);
            $tilePositionTo = intval($input['tile_position_to'] ?? 0);
            
            // Get current move number
            $stmt = $pdo->prepare("SELECT COUNT(*) as move_count FROM move_history WHERE session_id = ?");
            $stmt->execute([$sessionId]);
            $result = $stmt->fetch();
            $moveNumber = intval($result['move_count']) + 1;
            
            $stmt = $pdo->prepare("INSERT INTO move_history (session_id, move_number, tile_position_from, tile_position_to) VALUES (?, ?, ?, ?)");
            $stmt->execute([$sessionId, $moveNumber, $tilePositionFrom, $tilePositionTo]);
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'complete_session':
            $sessionId = intval($input['session_id'] ?? 0);
            $puzzleSize = intval($input['puzzle_size'] ?? 4);
            $timeSeconds = intval($input['time_seconds'] ?? 0);
            $moves = intval($input['moves'] ?? 0);
            $completed = boolval($input['completed'] ?? false);
            
            $stmt = $pdo->prepare("UPDATE game_sessions SET moves = ?, time_seconds = ?, completed = ? WHERE id = ?");
            $stmt->execute([$moves, $timeSeconds, $completed, $sessionId]);
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'save_metrics':
            $sessionId = intval($input['session_id'] ?? 0);
            $efficiencyScore = floatval($input['efficiency_score'] ?? 0);
            $optimalMoveRatio = floatval($input['optimal_move_ratio'] ?? 0);
            $difficultyAdjustment = floatval($input['difficulty_adjustment'] ?? 1.0);
            
            $stmt = $pdo->prepare("INSERT INTO performance_metrics (session_id, efficiency_score, optimal_move_ratio, difficulty_adjustment) VALUES (?, ?, ?, ?)");
            $stmt->execute([$sessionId, $efficiencyScore, $optimalMoveRatio, $difficultyAdjustment]);
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'update_behavior':
            $puzzleSize = intval($input['puzzle_size'] ?? 4);
            $completionTime = intval($input['completion_time'] ?? 0);
            $moves = intval($input['moves'] ?? 0);
            $userId = getCurrentUserId();
            
            // Check if record exists
            $stmt = $pdo->prepare("SELECT id, total_games FROM player_behavior WHERE user_id = ? AND puzzle_size = ?");
            $stmt->execute([$userId, $puzzleSize]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Update existing record
                $totalGames = intval($existing['total_games']) + 1;
                $stmt = $pdo->prepare("
                    UPDATE player_behavior 
                    SET avg_completion_time = (avg_completion_time * total_games + ?) / ?,
                        total_games = ?,
                        last_played = NOW()
                    WHERE user_id = ? AND puzzle_size = ?
                ");
                $stmt->execute([$completionTime, $totalGames, $totalGames, $userId, $puzzleSize]);
            } else {
                // Create new record
                $stmt = $pdo->prepare("INSERT INTO player_behavior (user_id, puzzle_size, avg_completion_time, total_games, win_rate) VALUES (?, ?, ?, 1, 100.0)");
                $stmt->execute([$userId, $puzzleSize, $completionTime]);
            }
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'update_skill':
            $skillLevel = floatval($input['skill_level'] ?? 1.0);
            $difficulty = sanitizeInput($input['difficulty'] ?? 'medium');
            
            // Update user preferences with skill level
            $stmt = $pdo->prepare("UPDATE user_preferences SET difficulty_preference = ? WHERE user_id = ?");
            $stmt->execute([$difficulty, getCurrentUserId()]);
            
            sendJSONResponse(['success' => true]);
            break;
            
        case 'get_history':
            $limit = intval($_GET['limit'] ?? 10);
            $userId = getCurrentUserId();
            
            $stmt = $pdo->prepare("SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
            $stmt->execute([$userId, $limit]);
            $history = $stmt->fetchAll();
            
            sendJSONResponse(['success' => true, 'history' => $history]);
            break;
            
        case 'get_stats':
            $userId = getCurrentUserId();
            
            // Get overall statistics
            $stmt = $pdo->prepare("
                SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_games,
                    AVG(CASE WHEN completed = 1 THEN time_seconds ELSE NULL END) as avg_time,
                    AVG(CASE WHEN completed = 1 THEN moves ELSE NULL END) as avg_moves
                FROM game_sessions
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $stats = $stmt->fetch();
            
            sendJSONResponse(['success' => true, 'stats' => $stats]);
            break;
            
        default:
            sendJSONResponse(['success' => false, 'message' => 'Invalid action'], 400);
    }
    
} catch (PDOException $e) {
    error_log("Tracking error: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Database error'
    ], 500);
}

