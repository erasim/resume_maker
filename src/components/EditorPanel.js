import { useState } from 'react';
import { Icon } from './Icon';
import TodoEditor from './TodoEditor';

let counter = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${counter++}`;

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

      <Section icon="check" title="To-Do List">
        <TodoEditor />
      </Section>

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
