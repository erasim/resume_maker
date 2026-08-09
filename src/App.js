import { useState, useEffect, useRef } from 'react';
import { initialData } from './data/defaults';
import EditorPanel from './components/EditorPanel';
import ResumePreview from './components/ResumePreview';
import AdminPage from './components/AdminPage';
import { api } from './api';
import './App.css';

const THEMES = [
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Teal', color: '#0d9488' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Amber', color: '#d97706' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Slate', color: '#475569' },
];

const LAYOUTS = [
  { id: 'classic', label: 'Classic sidebar', cls: 'classic' },
  { id: 'modern', label: 'Modern banner', cls: 'modern' },
  { id: 'minimal', label: 'Minimal clean', cls: 'minimal' },
  { id: 'sidebar-right', label: 'Sidebar right', cls: 'sidebar-right' },
];

const DATA_KEY = 'resumeforge-data';
const SETTINGS_KEY = 'resumeforge-settings';
const DEVICE_KEY = 'resumeforge-device-id';
const DOWNLOADS_KEY = 'resumeforge-downloads';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

function loadDownloads() {
  try {
    const raw = localStorage.getItem(DOWNLOADS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = 'dev-' + crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return 'dev-' + Math.random().toString(36).slice(2);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.personal && Array.isArray(parsed.experience)) {
        return parsed;
      }
    }
  } catch (e) {
    // corrupted or unavailable storage — fall back to sample data
  }
  return clone(initialData);
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    // ignore
  }
  return {};
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [accent, setAccent] = useState(() => loadSettings().accent || THEMES[0].color);
  const [layout, setLayout] = useState(() => loadSettings().layout || 'classic');
  const [downloads, setDownloads] = useState(() => loadDownloads());
  const [showDownloads, setShowDownloads] = useState(false);
  const [adminPrint, setAdminPrint] = useState(null);
  const [route, setRoute] = useState(() => window.location.hash);
  const deviceIdRef = useRef(getDeviceId());
  const hydratedRef = useRef(false);
  const editedRef = useRef(false);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const update = (section, patch) => {
    editedRef.current = true;
    setData((d) => ({ ...d, [section]: patch }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch (e) {
      // storage unavailable — resume simply won't persist
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ accent, layout }));
    } catch (e) {
      // ignore
    }
  }, [accent, layout]);

  // Clear the admin print view once the print dialog closes.
  useEffect(() => {
    if (!adminPrint) return;
    const done = () => setAdminPrint(null);
    window.addEventListener('afterprint', done);
    return () => window.removeEventListener('afterprint', done);
  }, [adminPrint]);

  // Load the saved resume from the server on start. Local storage stays
  // as a cache; server edits are applied unless the user is already typing.
  useEffect(() => {
    let cancelled = false;
    api
      .loadResume(deviceIdRef.current)
      .then((res) => {
        if (cancelled) return;
        hydratedRef.current = true;
        if (res.data && !editedRef.current) {
          setData(res.data);
          try {
            localStorage.setItem(DATA_KEY, JSON.stringify(res.data));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {
        if (!cancelled) hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced autosave to the server. Skipped until the server copy has
  // been loaded (or the load failed) so defaults never overwrite it.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => {
      api.saveResume(deviceIdRef.current, data).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [data]);

  const handleReset = () => {
    try {
      localStorage.removeItem(DATA_KEY);
    } catch (e) {
      // ignore
    }
    editedRef.current = true;
    setData(clone(initialData));
  };

  const handlePrint = async () => {
    try {
      await api.saveResume(deviceIdRef.current, data);
    } catch (e) {
      // offline — still allow the print/download
    }
    api.recordDownload(deviceIdRef.current, data).catch(() => {});
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: (data.personal && data.personal.name) || 'Untitled resume',
      layout,
      at: new Date().toISOString(),
    };
    const next = [entry, ...downloads].slice(0, 50);
    setDownloads(next);
    try {
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
    window.print();
  };

  const handleClearDownloads = () => {
    setDownloads([]);
    try {
      localStorage.removeItem(DOWNLOADS_KEY);
    } catch (e) {
      // ignore
    }
  };

  if (route === '#/admin') {
    return <AdminPage onExit={() => setRoute('#/')} accent={accent} />;
  }

  return (
    <div className={adminPrint ? 'app admin-printing' : 'app'} style={{ '--accent': accent }}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">RF</div>
          <div className="brand-text">
            <h1>ResumeForge</h1>
            <p>Build a resume that gets you hired</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="layout-picker" title="Layout">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                className={`layout-btn${layout === l.id ? ' active' : ''}`}
                onClick={() => setLayout(l.id)}
                title={l.label}
                aria-label={l.label}
              >
                <span className={`layout-thumb ${l.cls}`} />
              </button>
            ))}
          </div>
          <div className="theme-picker" title="Accent color">
            {THEMES.map((t) => (
              <button
                key={t.name}
                className={`swatch${accent === t.color ? ' active' : ''}`}
                style={{ background: t.color }}
                onClick={() => setAccent(t.color)}
                aria-label={t.name}
              />
            ))}
          </div>
          <button className="btn-ghost" onClick={handleReset}>
            Reset
          </button>
          <button className="btn-ghost btn-admin" onClick={() => setRoute('#/admin')} title="Admin: view analytics and all resumes">
            Admin
          </button>
          <div className="downloads-wrap">
            <button className="btn-ghost" onClick={() => setShowDownloads((s) => !s)} title="Resumes you have downloaded">
              <DownloadIcon /> Downloads{downloads.length > 0 && <span className="badge">{downloads.length}</span>}
            </button>
            {showDownloads && (
              <div className="downloads-panel">
                <div className="downloads-head">
                  <span>Downloaded resumes</span>
                  {downloads.length > 0 && (
                    <button type="button" onClick={handleClearDownloads}>
                      Clear
                    </button>
                  )}
                </div>
                {downloads.length === 0 ? (
                  <p className="downloads-empty">No downloads yet. Click Download PDF to save one.</p>
                ) : (
                  <ul className="downloads-list">
                    {downloads.map((d) => (
                      <li key={d.id}>
                        <span className="dl-name">{d.name}</span>
                        <span className="dl-meta">
                          {d.layout} · {new Date(d.at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button className="btn-print" onClick={handlePrint}>
            <PrintIcon /> Download PDF
          </button>
        </div>
      </header>

      <main className="app-body">
        <aside className="editor">
          <EditorPanel data={data} update={update} />
        </aside>
        <section className="preview-area">
          <ResumePreview data={data} layout={layout} />
        </section>
      </main>

      {adminPrint && (
        <div className="print-resume">
          <ResumePreview data={adminPrint} layout="classic" />
        </div>
      )}
    </div>
  );
}
