// app.js - Andre DC To-Do List
// Struktur data: { id, text, date, done, createdAt }

const SELECTORS = {
  form: '#todo-form',
  input: '#todo-input',
  date: '#todo-date',
  list: '#todo-list',
  search: '#search',
  filter: '#filter',
  clearAll: '#clear-all'
};

const $ = sel => document.querySelector(sel);

const LS_KEY = 'andre_dc_todos_v1';

// util: generate id
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

let todos = [];

// load from localStorage
function loadTodos() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Gagal memuat todos:', e);
    todos = [];
  }
}

// save to localStorage
function saveTodos() {
  localStorage.setItem(LS_KEY, JSON.stringify(todos));
}

// render
function render() {
  const list = $(SELECTORS.list);
  list.innerHTML = '';

  const q = $(SELECTORS.search).value.trim().toLowerCase();
  const filter = $(SELECTORS.filter).value;

  const filtered = todos.filter(t => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'done' && !t.done) return false;
    if (q && !t.text.toLowerCase().includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    const el = document.createElement('p');
    el.className = 'todo-empty';
    el.textContent = 'Belum ada tugas — ayo tambahkan!';
    list.appendChild(el);
    return;
  }

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');
    li.dataset.id = t.id;

    li.innerHTML = `
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(t.text)}</div>
        <div class="todo-meta">${t.date ? `Jadwal: ${t.date} • ` : ''}Dibuat: ${new Date(t.createdAt).toLocaleString()}</div>
      </div>
      <div class="actions">
        <button class="action-btn toggle" title="Tandai selesai">${t.done ? '↺' : '✓'}</button>
        <button class="action-btn edit" title="Edit">✎</button>
        <button class="action-btn remove" title="Hapus">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// escape html to avoid injection
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (s) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

// add new todo
function addTodo(text, date) {
  const t = {
    id: uid(),
    text: text.trim(),
    date: date || null,
    done: false,
    createdAt: Date.now()
  };
  todos.unshift(t);
  saveTodos();
  render();
}

// update todo by id
function updateTodo(id, updates) {
  const i = todos.findIndex(t => t.id === id);
  if (i === -1) return;
  todos[i] = { ...todos[i], ...updates };
  saveTodos();
  render();
}

// remove todo
function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

// clear all
function clearAll() {
  if (!confirm('Hapus semua tugas?')) return;
  todos = [];
  saveTodos();
  render();
}

// events
function bindEvents() {
  const form = $(SELECTORS.form);
  const input = $(SELECTORS.input);
  const date = $(SELECTORS.date);
  const list = $(SELECTORS.list);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    addTodo(text, date.value || null);
    input.value = '';
    date.value = '';
  });

  $(SELECTORS.search).addEventListener('input', () => render());
  $(SELECTORS.filter).addEventListener('change', () => render());
  $(SELECTORS.clearAll).addEventListener('click', clearAll);

  // event delegation for list
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.closest('.toggle')) {
      updateTodo(id, { done: !todos.find(t => t.id === id).done });
      return;
    }

    if (e.target.closest('.remove')) {
      if (confirm('Yakin ingin menghapus tugas ini?')) removeTodo(id);
      return;
    }

    if (e.target.closest('.edit')) {
      const todo = todos.find(t => t.id === id);
      const newText = prompt('Edit tugas:', todo.text);
      if (newText !== null) updateTodo(id, { text: newText.trim() });
    }
  });
}

// init
function init() {
  loadTodos();
  bindEvents();
  render();
}

init();
