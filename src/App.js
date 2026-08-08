import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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

const DATA_KEY = 'resumeforge-data';
const SETTINGS_KEY = 'resumeforge-settings';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

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

function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="10" y1="9" x2="8" y2="11" />
      <line x1="8" y1="9" x2="10" y2="11" />
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [accent, setAccent] = useState(loadSettings().accent || THEMES[0].color);
  const [layout, setLayout] = useState(loadSettings().layout || 'classic');
  const fileRef = useRef(null);

  const update = (section, patch) => setData((d) => ({ ...d, [section]: patch }));

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

  const handleReset = () => {
    try {
      localStorage.removeItem(DATA_KEY);
    } catch (e) {
      // ignore
    }
    setData(clone(initialData));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const finishImport = (parsed) => {
      if (parsed && typeof parsed === 'object' && parsed.personal && Array.isArray(parsed.experience)) {
        setData(parsed);
      } else {
        alert('That file is not a valid ResumeForge backup.');
      }
    };

    const parseExcel = (wb) => {
      const rows = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name] || {});

      const personalRow = rows('Personal')[0] || {};
      const personal = {
        name: String(personalRow.name || ''),
        title: String(personalRow.title || ''),
        email: String(personalRow.email || ''),
        phone: String(personalRow.phone || ''),
        location: String(personalRow.location || ''),
        website: String(personalRow.website || ''),
      };

      const summaryRows = XLSX.utils.sheet_to_json(wb.Sheets['Summary'] || {}, { header: 1 });
      const summary = String((summaryRows[1] && summaryRows[1][0]) || '');

      const experience = rows('Experience').map((r, i) => ({
        id: `exp-i-${i}-${Date.now().toString(36)}`,
        role: String(r.role || ''),
        company: String(r.company || ''),
        location: String(r.location || ''),
        start: String(r.start || ''),
        end: String(r.end || ''),
        current: String(r.current).toLowerCase() === 'true',
        description: String(r.description || ''),
      }));
      const education = rows('Education').map((r, i) => ({
        id: `edu-i-${i}-${Date.now().toString(36)}`,
        school: String(r.school || ''),
        degree: String(r.degree || ''),
        field: String(r.field || ''),
        start: String(r.start || ''),
        end: String(r.end || ''),
        description: String(r.description || ''),
      }));
      const skills = rows('Skills').map((r, i) => ({
        id: `sk-i-${i}-${Date.now().toString(36)}`,
        name: String(r.name || ''),
        level: Number(r.level) || 0,
      }));
      const languages = rows('Languages').map((r, i) => ({
        id: `lg-i-${i}-${Date.now().toString(36)}`,
        name: String(r.name || ''),
      }));

      finishImport({ personal, summary, experience, education, skills, languages });
    };

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (isExcel) {
          const wb = XLSX.read(reader.result, { type: 'array' });
          parseExcel(wb);
        } else {
          finishImport(JSON.parse(reader.result));
        }
      } catch (err) {
        alert(`Could not read file: ${err.message}`);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleExportExcel = () => {
    const { personal, summary, experience, education, skills, languages } = data;
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([personal], { header: ['name', 'title', 'email', 'phone', 'location', 'website'] }), 'Personal');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Professional Summary'], [summary]]), 'Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(experience), 'Experience');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(education), 'Education');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skills), 'Skills');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(languages), 'Languages');

    XLSX.writeFile(wb, 'resume-data.xlsx');
  };

  return (
    <div className="app" style={{ '--accent': accent }}>
      <input ref={fileRef} type="file" accept="application/json,.json,.xlsx,.xls" onChange={handleImportFile} style={{ display: 'none' }} />

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
          <button className="btn-ghost" onClick={handleExport} title="Download resume data as a JSON backup">
            <DownloadIcon /> Backup
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current.click()} title="Restore resume data from a JSON or Excel backup">
            <UploadIcon /> Restore
          </button>
          <button className="btn-ghost" onClick={handleExportExcel} title="Download resume data as an Excel (.xlsx) workbook">
            <ExcelIcon /> Export Excel
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
