import { useState } from 'react';
import { hashPassword, loadUsers, saveUsers } from '../auth';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const name = username.trim();
    if (!name || !password) {
      setError('Please enter a username and password.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      if (mode === 'signup') {
        const users = loadUsers();
        if (users.some((u) => u.username === name)) {
          setError('That username is already taken — try signing in.');
          return;
        }
        users.push({ username: name, passHash: hash, createdAt: Date.now() });
        saveUsers(users);
      } else {
        const users = loadUsers();
        const found = users.find((u) => u.username === name);
        if (!found || found.passHash !== hash) {
          setError('Invalid username or password.');
          return;
        }
      }
      onLogin(name);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">RF</div>
          <h1>ResumeForge</h1>
          <p>{mode === 'signup' ? 'Create an account to start building' : 'Sign in to continue building'}</p>
        </div>

        <div className="auth-toggle">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>
            Sign In
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>
            Sign Up
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your name"
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirm password</label>
              <input
                id="auth-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait\u2026' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-note">
          Your account and resume are stored in this browser — no server required.
        </p>
      </div>
    </div>
  );
}
