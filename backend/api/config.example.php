<?php
// ------------------------------------------------------------------
// ResumeForge API config (EXAMPLE — copy to config.php and edit)
// ------------------------------------------------------------------
// 1. Copy this file to config.php
// 2. Edit the four $db* values with your MySQL credentials
// ------------------------------------------------------------------

$dbHost = 'Localhost';            // e.g. sql110.infinityfree.com
$dbName = 'resumeforge';          // database name
$dbUser = 'root';                 // database user
$dbPass = '';                     // database password

// ------------------------------------------------------------------
// CORS - allow the GitHub Pages frontend to call this API
// ------------------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function db() {
    global $dbHost, $dbName, $dbUser, $dbPass;
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_errno) {
        respond(['ok' => false, 'error' => 'Database connection failed.'], 500);
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function respond($payload, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function fail_api($msg, $status = 400) {
    respond(['ok' => false, 'error' => $msg], $status);
}
