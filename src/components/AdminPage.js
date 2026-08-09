import { useState, useEffect } from 'react';
import { api } from '../api';
import ResumePreview from './ResumePreview';

const TOKEN_KEY = 'resumeforge-admin-token';

export default function AdminPage({ onExit, accent }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      return '';
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (t) => {
    setError('');
    setLoading(true);
    try {
      const s = await api.adminStats(t);
      const list = await api.adminListResumes(t);
      setStats(s.stats);
      setResumes(list.resumes || []);
    } catch (err) {
      if (err.status === 401) {
        setToken('');
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch (e) {
          // ignore
        }
      }
      setError(err.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear the admin print view once the print dialog closes.
  useEffect(() => {
    if (!printData) return;
    const done = () => setPrintData(null);
    window.addEventListener('afterprint', done);
    return () => window.removeEventListener('afterprint', done);
  }, [printData]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.adminLogin(username.trim(), password);
      setToken(res.token);
      try {
        localStorage.setItem(TOKEN_KEY, res.token);
      } catch (err) {
        // ignore
      }
      await load(res.token);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.adminLogout(token);
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      // ignore
    }
    setToken('');
    setStats(null);
    setResumes([]);
    setPreviewData(null);
    setPassword('');
  };

  const handleDownload = (data) => {
    setPrintData(data);
    setTimeout(() => window.print(), 150);
  };

  const maxResumes = stats ? Math.max(1, ...stats.activity.map((a) => a.resumes)) : 1;
  const maxDownloads = stats ? Math.max(1, ...stats.activity.map((a) => a.downloads)) : 1;

  return (
    <div
      className={printData ? 'admin-page admin-printing' : 'admin-page'}
      style={{ '--accent': accent || '#4f46e5' }}
    >
      {printData && (
        <div className="print-resume">
          <ResumePreview data={printData} layout="classic" />
        </div>
      )}

      <div className="admin-shell">
        <div className="admin-topbar">
          <div className="admin-topbar-brand">
            <div className="brand-logo">RF</div>
            <div>
              <h1>Admin Panel</h1>
              <p>Website analytics &amp; saved resumes</p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-btn" onClick={onExit}>
              &larr; Back to app
            </button>
            {token && (
              <>
                <button type="button" className="admin-btn" onClick={() => load(token)} disabled={loading}>
                  {loading ? 'Loading\u2026' : 'Refresh'}
                </button>
                <button type="button" className="admin-btn" onClick={logout}>
                  Log out
                </button>
              </>
            )}
          </div>
        </div>

        {!token ? (
          <div className="admin-login-card">
            <h2>Sign in</h2>
            <form onSubmit={login} className="admin-login">
              <div className="admin-field">
                <label htmlFor="admin-username">Admin username</label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <div className="admin-error">{error}</div>}
              <button type="submit" className="admin-submit" disabled={loading}>
                {loading ? 'Signing in\u2026' : 'Sign in'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {error && <div className="admin-error">{error}</div>}
            {loading && !stats && <p className="admin-empty">Loading analytics\u2026</p>}

            {stats && (
              <div className="admin-analytics">
                <div className="stat-cards">
                  <div className="stat-card">
                    <span className="stat-num">{stats.totalResumes}</span>
                    <span className="stat-label">Resumes created</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">{stats.totalDownloads}</span>
                    <span className="stat-label">PDF downloads</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">{stats.devices}</span>
                    <span className="stat-label">Devices using site</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">{stats.todayDownloads}</span>
                    <span className="stat-label">Downloads today</span>
                  </div>
                </div>

                <div className="chart-wrap">
                  <div className="chart-head">
                    <span>Activity &mdash; last 14 days</span>
                    <span className="chart-legend">
                      <span className="legend-dot dot-resume" /> Resumes
                      <span className="legend-dot dot-download" /> Downloads
                    </span>
                  </div>
                  <div className="chart">
                    {stats.activity.map((d) => (
                      <div
                        className="chart-col"
                        key={d.date}
                        title={`${d.date}: ${d.resumes} resume(s), ${d.downloads} download(s)`}
                      >
                        <div className="chart-bars">
                          <div
                            className="bar bar-resume"
                            style={{ height: `${Math.max(3, Math.round((d.resumes / maxResumes) * 70))}px` }}
                          />
                          <div
                            className="bar bar-download"
                            style={{ height: `${Math.max(3, Math.round((d.downloads / maxDownloads) * 70))}px` }}
                          />
                        </div>
                        <span className="chart-label">{d.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-section">
                  <div className="admin-section-head">
                    <span>All resumes</span>
                    <span className="admin-count">{resumes.length}</span>
                  </div>
                  {resumes.length === 0 ? (
                    <p className="admin-empty">No resumes saved on the server yet.</p>
                  ) : (
                    <ul className="admin-list">
                      {resumes.map((r) => (
                        <li key={r.id} className="admin-row">
                          <span className="admin-row-main">
                            <span className="admin-name">{r.name || 'Untitled resume'}</span>
                            <span className="admin-device">{r.device_id}</span>
                          </span>
                          <span className="admin-row-side">
                            <span className="admin-date">{new Date(r.downloaded_at).toLocaleString()}</span>
                            <span className="admin-actions">
                              <button type="button" className="admin-btn" onClick={() => setPreviewData(r.data)}>
                                Preview
                              </button>
                              <button type="button" className="admin-btn" onClick={() => handleDownload(r.data)}>
                                Download PDF
                              </button>
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {previewData && (
        <div className="admin-preview-overlay" onClick={() => setPreviewData(null)}>
          <div className="admin-preview-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-preview-head">
              <span>Preview resume</span>
              <button type="button" className="admin-close" onClick={() => setPreviewData(null)} aria-label="Close preview">
                &times;
              </button>
            </div>
            <div className="admin-preview-body">
              <ResumePreview data={previewData} layout="classic" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
