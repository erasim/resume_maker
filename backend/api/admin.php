<?php
// ResumeForge admin API
//   POST admin.php?action=login     body: { username, password }  -> token
//   GET  admin.php?action=resumes   Bearer token                  -> all resumes
//   POST admin.php?action=logout    Bearer token
require __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? '';

function adminAuth($conn) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/Bearer\s+(\w+)/i', $auth, $m)) {
        fail_api('Not authenticated.', 401);
    }
    $token = $m[1];

    $stmt = $conn->prepare('SELECT admin_id FROM admin_sessions WHERE token = ?');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        $stmt->close();
        fail_api('Invalid or expired session.', 401);
    }
    $stmt->bind_result($adminId);
    $stmt->fetch();
    $stmt->close();
    return $adminId;
}

if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        fail_api('Invalid request body.');
    }
    $username = trim($data['username'] ?? '');
    $password = (string)($data['password'] ?? '');

    if ($username === '' || $password === '') {
        fail_api('Username and password are required.');
    }

    $conn = db();

    $stmt = $conn->prepare('SELECT id, pass_hash FROM admins WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        $stmt->close();
        fail_api('Invalid admin credentials.', 401);
    }
    $stmt->bind_result($adminId, $hash);
    $stmt->fetch();
    $stmt->close();

    if (!password_verify($password, $hash)) {
        fail_api('Invalid admin credentials.', 401);
    }

    $token = bin2hex(random_bytes(32));
    $stmt = $conn->prepare('INSERT INTO admin_sessions (admin_id, token) VALUES (?, ?)');
    $stmt->bind_param('is', $adminId, $token);
    $stmt->execute();
    $stmt->close();

    respond(['ok' => true, 'token' => $token]);
}

if ($action === 'resumes') {
    $conn = db();
    adminAuth($conn);

    $resumes = [];
    $result = $conn->query('SELECT dl.id, dl.device_id, dl.data AS snapshot, dl.downloaded_at, r.data AS current_data
                            FROM download_log dl
                            LEFT JOIN resumes r ON r.device_id = dl.device_id
                            ORDER BY dl.downloaded_at DESC, dl.id DESC');
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $decoded = json_decode($row['snapshot'], true);
            if (!is_array($decoded)) {
                $decoded = json_decode($row['current_data'], true);
            }
            if (!is_array($decoded)) {
                $decoded = null;
            }
            $name = '';
            if (is_array($decoded) && isset($decoded['personal']['name'])) {
                $name = (string)$decoded['personal']['name'];
            }
            $resumes[] = [
                'id' => (int)$row['id'],
                'device_id' => $row['device_id'],
                'name' => $name,
                'downloaded_at' => $row['downloaded_at'],
                'data' => $decoded,
            ];
        }
    }

    respond(['ok' => true, 'resumes' => $resumes]);
}

if ($action === 'stats') {
    $conn = db();
    adminAuth($conn);

    $stats = [];

    $r = $conn->query('SELECT COUNT(*) AS c FROM resumes');
    $stats['totalResumes'] = (int)($r ? $r->fetch_assoc()['c'] : 0);

    $r = $conn->query('SELECT COUNT(*) AS c FROM download_log');
    $stats['totalDownloads'] = (int)($r ? $r->fetch_assoc()['c'] : 0);

    $r = $conn->query('SELECT COUNT(DISTINCT device_id) AS c FROM resumes');
    $stats['devices'] = (int)($r ? $r->fetch_assoc()['c'] : 0);

    $r = $conn->query('SELECT COUNT(*) AS c FROM resumes WHERE DATE(updated_at) = CURDATE()');
    $stats['todayResumes'] = (int)($r ? $r->fetch_assoc()['c'] : 0);

    $r = $conn->query('SELECT COUNT(*) AS c FROM download_log WHERE DATE(downloaded_at) = CURDATE()');
    $stats['todayDownloads'] = (int)($r ? $r->fetch_assoc()['c'] : 0);

    // Activity for the last 14 days
    $activity = [];
    for ($i = 13; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-$i days"));
        $activity[$d] = ['date' => $d, 'resumes' => 0, 'downloads' => 0];
    }

    $r = $conn->query('SELECT DATE(updated_at) AS d, COUNT(*) AS c FROM resumes
                       WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE(updated_at)');
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            if (isset($activity[$row['d']])) {
                $activity[$row['d']]['resumes'] = (int)$row['c'];
            }
        }
    }

    $r = $conn->query('SELECT DATE(downloaded_at) AS d, COUNT(*) AS c FROM download_log
                       WHERE downloaded_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE(downloaded_at)');
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            if (isset($activity[$row['d']])) {
                $activity[$row['d']]['downloads'] = (int)$row['c'];
            }
        }
    }

    $stats['activity'] = array_values($activity);

    $recent = [];
    $res = $conn->query('SELECT device_id, data, downloads, updated_at FROM resumes ORDER BY updated_at DESC LIMIT 10');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $decoded = json_decode($row['data'], true);
            $name = '';
            if (is_array($decoded) && isset($decoded['personal']['name'])) {
                $name = (string)$decoded['personal']['name'];
            }
            $recent[] = [
                'device_id' => $row['device_id'],
                'name' => $name,
                'downloads' => (int)$row['downloads'],
                'updated_at' => $row['updated_at'],
            ];
        }
    }
    $stats['recent'] = $recent;

    respond(['ok' => true, 'stats' => $stats]);
}

if ($action === 'logout') {
    $conn = db();
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(\w+)/i', $auth, $m)) {
        $stmt = $conn->prepare('DELETE FROM admin_sessions WHERE token = ?');
        $stmt->bind_param('s', $m[1]);
        $stmt->execute();
        $stmt->close();
    }
    respond(['ok' => true]);
}

fail_api('Unknown action.', 404);
