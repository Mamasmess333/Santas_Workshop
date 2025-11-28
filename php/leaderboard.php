<?php
/**
 * Leaderboard API (Santa's List)
 * Displays top players by puzzle size
 */

require_once 'config.php';

header('Content-Type: application/json');

$pdo = getDBConnection();

$size = $_GET['size'] ?? 'all';
$sort = $_GET['sort'] ?? 'time';

try {
    $query = "SELECT gs.*, u.username 
              FROM game_sessions gs 
              INNER JOIN users u ON gs.user_id = u.id 
              WHERE gs.completed = 1";
    
    $params = [];
    
    if ($size !== 'all') {
        $query .= " AND gs.puzzle_size = ?";
        $params[] = intval($size);
    }
    
    // Sorting
    switch ($sort) {
        case 'time':
            $query .= " ORDER BY gs.time_seconds ASC, gs.moves ASC";
            break;
        case 'moves':
            $query .= " ORDER BY gs.moves ASC, gs.time_seconds ASC";
            break;
        case 'recent':
            $query .= " ORDER BY gs.created_at DESC";
            break;
        default:
            $query .= " ORDER BY gs.time_seconds ASC";
    }
    
    $query .= " LIMIT 100";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $leaderboard = $stmt->fetchAll();
    
    sendJSONResponse([
        'success' => true,
        'leaderboard' => $leaderboard
    ]);
    
} catch (PDOException $e) {
    error_log("Leaderboard error: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Error loading leaderboard'
    ], 500);
}

