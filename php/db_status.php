<?php
header('Content-Type: application/json');
// Prevent accidental whitespace output
ob_start();

require_once __DIR__ . '/config.php';

$response = [
    'connected' => false,
    'error' => null,
    'host' => isset($db_host) ? $db_host : null,
    'database' => isset($db_name) ? $db_name : null,
];

try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_errno) {
        $response['error'] = $conn->connect_error;
    } else {
        $response['connected'] = true;
    }
} catch (Throwable $e) {
    $response['error'] = $e->getMessage();
}

// Clear any buffered output and return only JSON
ob_end_clean();
echo json_encode($response);
exit;
