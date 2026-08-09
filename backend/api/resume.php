<?php
// ResumeForge resume API (no login — anonymous device ID)
//   PUT resume.php                    body: { deviceId, data }
//   GET resume.php                    ?deviceId=xxx
//   POST resume.php?action=download   body: { deviceId, data }  -> counts + snapshots a download
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'download') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        fail_api('Invalid request body.');
    }
    $deviceId = trim($body['deviceId'] ?? '');
    if ($deviceId === '' || strlen($deviceId) > 64) {
        fail_api('Invalid device ID.');
    }

    $snapshot = null;
    if (isset($body['data'])) {
        $encoded = json_encode($body['data']);
        if ($encoded !== false) {
            $snapshot = $encoded;
        }
    }

    $conn = db();

    $stmt = $conn->prepare('UPDATE resumes SET downloads = downloads + 1 WHERE device_id = ?');
    $stmt->bind_param('s', $deviceId);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare('INSERT INTO download_log (device_id, data) VALUES (?, ?)');
    $stmt->bind_param('ss', $deviceId, $snapshot);
    $stmt->execute();
    $stmt->close();

    respond(['ok' => true]);
}

if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        fail_api('Invalid request body.');
    }

    $deviceId = trim($body['deviceId'] ?? '');
    $data = $body['data'] ?? null;

    if ($deviceId === '' || strlen($deviceId) > 64) {
        fail_api('Invalid device ID.');
    }
    if ($data === null) {
        fail_api('No resume data supplied.');
    }

    $json = json_encode($data);
    if ($json === false) {
        fail_api('Invalid resume data.');
    }

    $conn = db();

    $stmt = $conn->prepare('INSERT INTO resumes (device_id, data) VALUES (?, ?)
                            ON DUPLICATE KEY UPDATE data = VALUES(data)');
    $stmt->bind_param('ss', $deviceId, $json);
    if (!$stmt->execute()) {
        fail_api('Could not save resume.', 500);
    }
    $stmt->close();

    respond(['ok' => true]);
}

if ($method === 'GET') {
    $deviceId = trim($_GET['deviceId'] ?? '');
    if ($deviceId === '') {
        fail_api('Missing device ID.');
    }

    $conn = db();

    $stmt = $conn->prepare('SELECT data FROM resumes WHERE device_id = ?');
    $stmt->bind_param('s', $deviceId);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        $stmt->close();
        respond(['ok' => true, 'data' => null]);
    }
    $stmt->bind_result($data);
    $stmt->fetch();
    $stmt->close();

    respond(['ok' => true, 'data' => json_decode($data, true)]);
}

fail_api('Method not allowed.', 405);
