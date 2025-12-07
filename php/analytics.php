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

$mysqli = getMySQLiConnection();
$type = $_GET['type'] ?? 'player_behavior';

try {
    switch ($type) {
        case 'player_behavior':
            $userId = getCurrentUserId();
            $stmt = $mysqli->prepare("SELECT puzzle_size, AVG(time_seconds) as avg_completion_time, COUNT(*) as total_games, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100 as win_rate, MAX(created_at) as last_played FROM game_sessions WHERE user_id = ? GROUP BY puzzle_size");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $behavior = [];
            while ($row = $result->fetch_assoc()) {
                $behavior[] = $row;
            }
            $stmt->close();
            sendJSONResponse([
                'success' => true,
                'behavior' => $behavior
            ]);
            break;
            
        case 'puzzle_popularity':
            $stmt = $mysqli->prepare("SELECT puzzle_size, COUNT(*) as total_plays, AVG(CASE WHEN completed = 1 THEN 1 ELSE 0 END) * 100 as avg_completion_rate, AVG(time_seconds) as avg_time FROM game_sessions GROUP BY puzzle_size");
            $stmt->execute();
            $result = $stmt->get_result();
            $popularity = [];
            while ($row = $result->fetch_assoc()) {
                $popularity[] = $row;
            }
            $stmt->close();
            sendJSONResponse([
                'success' => true,
                'popularity' => $popularity
            ]);
            break;
            
        case 'system_performance':
            $stmt = $mysqli->prepare("SELECT query_type, AVG(response_time) as avg_response_time, COUNT(*) as query_count FROM system_performance WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY query_type");
            $stmt->execute();
            $result = $stmt->get_result();
            $performance = [];
            while ($row = $result->fetch_assoc()) {
                $performance[] = $row;
            }
            $stmt->close();
            sendJSONResponse([
                'success' => true,
                'performance' => $performance
            ]);
            break;
            
        case 'personal_bests':
            $userId = getCurrentUserId();
            $stmt = $mysqli->prepare("SELECT puzzle_size, MIN(time_seconds) as best_time, MIN(moves) as best_moves, COUNT(*) as total_completions FROM game_sessions WHERE user_id = ? AND completed = 1 GROUP BY puzzle_size");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $bests = [];
            while ($row = $result->fetch_assoc()) {
                $bests[] = $row;
            }
            $stmt->close();
            sendJSONResponse([
                'success' => true,
                'personal_bests' => $bests
            ]);
            break;
            
        case 'badges':
            $userId = getCurrentUserId();
            // Static badge definitions (could be moved to DB or config)
            $badgeDefinitions = [
                'first_win' => [
                    'name' => 'First Win',
                    'description' => 'Complete your first puzzle!',
                    'icon' => 'first_win.png'
                ],
                'speedster' => [
                    'name' => 'Speedster',
                    'description' => 'Finish a puzzle in under 60 seconds.',
                    'icon' => 'speedster.png'
                ],
                'persistent' => [
                    'name' => 'Persistent',
                    'description' => 'Play 50 games.',
                    'icon' => 'persistent.png'
                ],
                'holiday_hero' => [
                    'name' => 'Holiday Hero',
                    'description' => 'Win a puzzle on Christmas Day.',
                    'icon' => 'holiday_hero.png'
                ],
                // Add more badge definitions as needed
            ];

            $stmt = $mysqli->prepare("SELECT badge_type, unlocked_at FROM user_badges WHERE user_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $badges = [];
            while ($row = $result->fetch_assoc()) {
                $type = $row['badge_type'];
                if (isset($badgeDefinitions[$type])) {
                    $badges[] = [
                        'name' => $badgeDefinitions[$type]['name'],
                        'description' => $badgeDefinitions[$type]['description'],
                        'icon' => $badgeDefinitions[$type]['icon'],
                        'unlocked_at' => $row['unlocked_at']
                    ];
                }
            }
            $stmt->close();
            sendJSONResponse([
                'success' => true,
                'badges' => $badges
            ]);
            break;
        default:
            sendJSONResponse(['success' => false, 'message' => 'Invalid analytics type'], 400);
    }
    
} catch (Exception $e) {
    error_log("Analytics error: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Error loading analytics'
    ], 500);
}

