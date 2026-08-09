<?php
// ResumeForge admin setup (ONE-TIME)
// Visit this page once on your server to create the first admin account.
// DELETE THIS FILE from the server after the account is created.
require __DIR__ . '/config.php';

$done = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = (string)($_POST['password'] ?? '');
    $confirm = (string)($_POST['confirm'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Username and password are required.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } else {
        $conn = db();

        $check = $conn->query('SELECT COUNT(*) AS c FROM admins');
        $count = 0;
        if ($check && $row = $check->fetch_assoc()) {
            $count = (int)$row['c'];
        }
        if ($count > 0) {
            $error = 'An admin account already exists. Delete this file for security.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare('INSERT INTO admins (username, pass_hash) VALUES (?, ?)');
            $stmt->bind_param('ss', $username, $hash);
            if ($stmt->execute()) {
                $done = true;
            } else {
                $error = 'Could not create admin: ' . $stmt->error;
            }
            $stmt->close();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ResumeForge Admin Setup</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; width: 340px; box-shadow: 0 20px 50px rgba(15,23,42,.15); }
    h1 { font-size: 20px; margin: 0 0 4px; color: #0f172a; }
    p { color: #64748b; font-size: 13px; margin: 0 0 18px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin: 12px 0 6px; }
    input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
    button { width: 100%; margin-top: 18px; padding: 11px; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
    .err { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-top: 14px; }
    .ok { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; font-size: 13px; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ResumeForge admin setup</h1>
    <p>Create the first admin account, then delete this file.</p>
    <?php if ($done): ?>
      <div class="ok">Admin <strong><?php echo htmlspecialchars($username); ?></strong> created. You can now close this page and delete <code>setup.php</code>.</div>
    <?php else: ?>
      <form method="post">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" required>
        <label for="password">Password (min 6 chars)</label>
        <input id="password" name="password" type="password" required>
        <label for="confirm">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required>
        <button type="submit">Create admin</button>
      </form>
      <?php if ($error): ?><div class="err"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
    <?php endif; ?>
  </div>
</body>
</html>
