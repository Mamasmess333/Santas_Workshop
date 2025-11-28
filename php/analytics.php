<?php
/**
 * Analytics API
 * Provides player behavior, puzzle popularity, and system performance metrics
 */

require_once 'config.php';

header('Content-Type: application/json');

if (!isAuthenticated()) {
    sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
}

$pdo = getDBConnection();
$type = $_GET['type'] ?? 'player_behavior';

try {
    switch ($type) {
        case 'player_behavior':
            // Get player behavior analytics
            $userId = getCurrentUserId();
            
            $stmt = $pdo->prepare("
                SELECT 
                    puzzle_size,
                    AVG(time_seconds) as avg_completion_time,
                    COUNT(*) as total_games,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100 as win_rate,
                    MAX(created_at) as last_played
                FROM game_sessions
                WHERE user_id = ?
                GROUP BY puzzle_size
            ");
            $stmt->execute([$userId]);
            $behavior = $stmt->fetchAll();
            
            sendJSONResponse([
                'success' => true,
                'behavior' => $behavior
            ]);
            break;
            
        case 'puzzle_popularity':
            // Get puzzle popularity stats
            $stmt = $pdo->prepare("
                SELECT 
                    puzzle_size,
                    COUNT(*) as total_plays,
                    AVG(CASE WHEN completed = 1 THEN 1 ELSE 0 END) * 100 as avg_completion_rate,
                    AVG(time_seconds) as avg_time
                FROM game_sessions
                GROUP BY puzzle_size
            ");
            $stmt->execute();
            $popularity = $stmt->fetchAll();
            
            sendJSONResponse([
                'success' => true,
                'popularity' => $popularity
            ]);
            break;
            
        case 'system_performance':
            // Get system performance metrics
            $stmt = $pdo->prepare("
                SELECT 
                    query_type,
                    AVG(response_time) as avg_response_time,
                    COUNT(*) as query_count
                FROM system_performance
                WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY query_type
            ");
            $stmt->execute();
            $performance = $stmt->fetchAll();
            
            sendJSONResponse([
                'success' => true,
                'performance' => $performance
            ]);
            break;
            
        case 'personal_bests':
            // Get personal best times per puzzle size
            $userId = getCurrentUserId();
            
            $stmt = $pdo->prepare("
                SELECT 
                    puzzle_size,
                    MIN(time_seconds) as best_time,
                    MIN(moves) as best_moves,
                    COUNT(*) as total_completions
                FROM game_sessions
                WHERE user_id = ? AND completed = 1
                GROUP BY puzzle_size
            ");
            $stmt->execute([$userId]);
            $bests = $stmt->fetchAll();
            
            sendJSONResponse([
                'success' => true,
                'personal_bests' => $bests
            ]);
            break;
            
        default:
            sendJSONResponse(['success' => false, 'message' => 'Invalid analytics type'], 400);
    }
    
} catch (PDOException $e) {
    error_log("Analytics error: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Error loading analytics'
    ], 500);
}

