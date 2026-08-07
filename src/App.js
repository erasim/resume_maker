import { useState } from 'react';
import { initialData } from './data/defaults';
import EditorPanel from './components/EditorPanel';
import ResumePreview from './components/ResumePreview';
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

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState(initialData);
  const [accent, setAccent] = useState(THEMES[0].color);
  const [layout, setLayout] = useState('classic');

  const update = (section, patch) => setData((d) => ({ ...d, [section]: patch }));

  return (
    <div className="app" style={{ '--accent': accent }}>
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
          <button className="btn-ghost" onClick={() => setData(structuredClone(initialData))}>
            Reset
          </button>
          <button className="btn-print" onClick={() => window.print()}>
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
    </div>
  );
}
