import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const STORAGE_KEY = 'resumeforge-todos';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupted storage
  }
  return [];
}

export default function TodoEditor() {
  const [todos, setTodos] = useState(loadTodos);
  const [text, setText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      // storage unavailable — todo list simply won't persist
    }
  }, [todos]);

  const add = () => {
    const value = text.trim();
    if (!value) return;
    setTodos((ts) => [...ts, { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, text: value, done: false }]);
    setText('');
  };

  const toggle = (id) => setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos((ts) => ts.filter((t) => t.id !== id));

  const doneCount = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <div className="todo">
      {todos.length > 0 && (
        <div className="todo-progress">
          <div className="todo-progress-bar">
            <div className="todo-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="todo-count">
            {doneCount}/{todos.length} done
          </span>
        </div>
      )}

      <ul className="todo-list">
        {todos.map((t) => (
          <li key={t.id} className={`todo-item${t.done ? ' done' : ''}`}>
            <label className="todo-label">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className="todo-text">{t.text}</span>
            </label>
            <button type="button" className="icon-btn" onClick={() => remove(t.id)} aria-label="Delete task">
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p className="todo-empty">No tasks yet — add a task to keep track of your resume work.</p>}

      <div className="todo-add">
        <input
          type="text"
          value={text}
          placeholder="Add a task… e.g. Add a profile photo"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-chip-add" onClick={add} aria-label="Add task">
          <Icon name="plus" size={15} />
        </button>
      </div>
    </div>
  );
}
