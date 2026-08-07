import { useState } from 'react';

let counter = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${counter++}`;

const ICONS = {
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  summary: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  graduation: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </>
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false, type = 'text' }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function Section({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="ed-section">
      <button type="button" className="ed-section-head" onClick={() => setOpen((o) => !o)}>
        <span className="ed-section-icon">
          <Icon name={icon} size={18} />
        </span>
        <span className="ed-section-title">{title}</span>
        <span className="chevron">{open ? '\u2212' : '\u002B'}</span>
      </button>
      {open && <div className="ed-section-body">{children}</div>}
    </section>
  );
}

function PersonalEditor({ personal, onChange }) {
  const set = (key) => (value) => onChange({ ...personal, [key]: value });
  return (
    <div className="grid-2">
      <Field label="Full Name" value={personal.name} onChange={set('name')} placeholder="Jane Cooper" />
      <Field label="Job Title" value={personal.title} onChange={set('title')} placeholder="Senior Product Designer" />
      <Field label="Email" type="email" value={personal.email} onChange={set('email')} placeholder="jane@example.com" />
      <Field label="Phone" value={personal.phone} onChange={set('phone')} placeholder="+1 555 000 1234" />
      <Field label="Location" value={personal.location} onChange={set('location')} placeholder="San Francisco, CA" />
      <Field label="Website" value={personal.website} onChange={set('website')} placeholder="jane.design" />
    </div>
  );
}

function ExperienceEditor({ items, onChange }) {
  const updateItem = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () =>
    onChange([
      ...items,
      { id: uid('exp'), role: '', company: '', location: '', start: '', end: '', current: false, description: '' },
    ]);

  return (
    <div className="list-editor">
      {items.map((item, idx) => (
        <div className="list-card" key={item.id}>
          <div className="list-card-head">
            <span className="list-card-num">{idx + 1}</span>
            <span className="list-card-title">{item.role || item.company || 'New position'}</span>
            <button type="button" className="icon-btn" onClick={() => removeItem(item.id)} aria-label="Remove">
              <Icon name="trash" size={16} />
            </button>
          </div>
          <div className="grid-2">
            <Field label="Job Title" value={item.role} onChange={(v) => updateItem(item.id, { role: v })} placeholder="Product Designer" />
            <Field label="Company" value={item.company} onChange={(v) => updateItem(item.id, { company: v })} placeholder="Acme Inc." />
            <Field label="Location" value={item.location} onChange={(v) => updateItem(item.id, { location: v })} placeholder="City, State" />
            <div className="grid-2">
              <Field label="Start" value={item.start} onChange={(v) => updateItem(item.id, { start: v })} placeholder="2020" />
              <Field label="End" value={item.end} onChange={(v) => updateItem(item.id, { end: v })} placeholder="Present" />
            </div>
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={item.current} onChange={(e) => updateItem(item.id, { current: e.target.checked })} />
            <span>I currently work here</span>
          </label>
          <Field
            textarea
            label="Description & Achievements"
            value={item.description}
            onChange={(v) => updateItem(item.id, { description: v })}
            placeholder="Responsibilities and measurable achievements…"
          />
        </div>
      ))}
      <button type="button" className="btn-add" onClick={addItem}>
        <Icon name="plus" size={16} /> Add Experience
      </button>
    </div>
  );
}

function EducationEditor({ items, onChange }) {
  const updateItem = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () =>
    onChange([...items, { id: uid('edu'), school: '', degree: '', field: '', start: '', end: '', description: '' }]);

  return (
    <div className="list-editor">
      {items.map((item, idx) => (
        <div className="list-card" key={item.id}>
          <div className="list-card-head">
            <span className="list-card-num">{idx + 1}</span>
            <span className="list-card-title">{item.school || item.degree || 'New entry'}</span>
            <button type="button" className="icon-btn" onClick={() => removeItem(item.id)} aria-label="Remove">
              <Icon name="trash" size={16} />
            </button>
          </div>
          <div className="grid-2">
            <Field label="School" value={item.school} onChange={(v) => updateItem(item.id, { school: v })} placeholder="University name" />
            <Field label="Degree" value={item.degree} onChange={(v) => updateItem(item.id, { degree: v })} placeholder="B.Sc." />
            <Field label="Field of Study" value={item.field} onChange={(v) => updateItem(item.id, { field: v })} placeholder="Computer Science" />
            <div className="grid-2">
              <Field label="Start" value={item.start} onChange={(v) => updateItem(item.id, { start: v })} placeholder="2016" />
              <Field label="End" value={item.end} onChange={(v) => updateItem(item.id, { end: v })} placeholder="2020" />
            </div>
          </div>
          <Field textarea label="Notes" value={item.description} onChange={(v) => updateItem(item.id, { description: v })} placeholder="Achievements, GPA, activities…" />
        </div>
      ))}
      <button type="button" className="btn-add" onClick={addItem}>
        <Icon name="plus" size={16} /> Add Education
      </button>
    </div>
  );
}

function SkillsEditor({ items, onChange }) {
  const updateItem = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () => onChange([...items, { id: uid('sk'), name: '', level: 70 }]);

  return (
    <div className="list-editor">
      {items.map((item, idx) => (
        <div className="skill-row" key={item.id}>
          <span className="skill-idx">{idx + 1}</span>
          <input type="text" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Skill name" />
          <input type="range" min="0" max="100" value={item.level} onChange={(e) => updateItem(item.id, { level: Number(e.target.value) })} />
          <span className="skill-val">{item.level}%</span>
          <button type="button" className="icon-btn" onClick={() => removeItem(item.id)} aria-label="Remove">
            <Icon name="trash" size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={addItem}>
        <Icon name="plus" size={16} /> Add Skill
      </button>
    </div>
  );
}

function LanguagesEditor({ items, onChange }) {
  const [value, setValue] = useState('');
  const add = () => {
    const name = value.trim();
    if (!name) return;
    onChange([...items, { id: uid('lg'), name }]);
    setValue('');
  };

  return (
    <div className="chips-wrap">
      {items.map((it) => (
        <span className="chip" key={it.id}>
          {it.name}
          <button type="button" onClick={() => onChange(items.filter((l) => l.id !== it.id))} aria-label={`Remove ${it.name}`}>
            ×
          </button>
        </span>
      ))}
      <div className="chip-add">
        <input
          type="text"
          value={value}
          placeholder="Add a language…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-chip-add" onClick={add} aria-label="Add language">
          <Icon name="plus" size={15} />
        </button>
      </div>
    </div>
  );
}

export default function EditorPanel({ data, update }) {
  return (
    <div className="editor-panel">
      <div className="editor-intro">
        <h2>Edit your resume</h2>
        <p>Fill in your details — the preview updates instantly as you type.</p>
      </div>

      <Section icon="user" title="Personal Details">
        <PersonalEditor personal={data.personal} onChange={(v) => update('personal', v)} />
      </Section>

      <Section icon="summary" title="Professional Summary">
        <Field
          textarea
          label="Summary"
          value={data.summary}
          onChange={(v) => update('summary', v)}
          placeholder="A short paragraph that highlights your experience and strengths."
        />
      </Section>

      <Section icon="briefcase" title="Work Experience">
        <ExperienceEditor items={data.experience} onChange={(v) => update('experience', v)} />
      </Section>

      <Section icon="graduation" title="Education">
        <EducationEditor items={data.education} onChange={(v) => update('education', v)} />
      </Section>

      <Section icon="star" title="Skills">
        <SkillsEditor items={data.skills} onChange={(v) => update('skills', v)} />
      </Section>

      <Section icon="globe" title="Languages">
        <LanguagesEditor items={data.languages} onChange={(v) => update('languages', v)} />
      </Section>
    </div>
  );
}
