<?php
/**
 * Leaderboard API (Santa's List)
 * Displays top players by puzzle size
 */

require_once 'config.php';

header('Content-Type: application/json');

$mysqli = getMySQLiConnection();

$size = $_GET['size'] ?? 'all';
$sort = $_GET['sort'] ?? 'time';

try {
    $query = "SELECT gs.puzzle_size, gs.moves, gs.time_seconds, gs.created_at, u.username 
              FROM game_sessions gs 
              INNER JOIN users u ON gs.user_id = u.id 
              WHERE gs.completed = 1";
    
    $params = [];
    $types = '';
    
    if ($size !== 'all') {
        $query .= " AND gs.puzzle_size = ?";
        $params[] = intval($size);
        $types .= 'i';
    }
    // Show only each user's best score per puzzle size
    $query = "SELECT t.puzzle_size, t.moves, t.time_seconds, t.created_at, t.username
        FROM (
            SELECT gs.puzzle_size, gs.moves, gs.time_seconds, gs.created_at, u.username,
                   ROW_NUMBER() OVER (PARTITION BY gs.user_id, gs.puzzle_size ORDER BY gs.time_seconds ASC, gs.moves ASC) as rn
            FROM game_sessions gs
            INNER JOIN users u ON gs.user_id = u.id
            WHERE gs.completed = 1";
    if ($size !== 'all') {
        $query .= " AND gs.puzzle_size = ?";
    }
    $query .= " ) t WHERE t.rn = 1 ORDER BY t.time_seconds ASC, t.moves ASC LIMIT 100";
    $stmt = $mysqli->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
    $stmt->close();
    
    sendJSONResponse([
        'success' => true,
        'leaderboard' => $leaderboard
    ]);
    
} catch (Exception $e) {
    error_log("Leaderboard error: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Error loading leaderboard'
    ], 500);
}

