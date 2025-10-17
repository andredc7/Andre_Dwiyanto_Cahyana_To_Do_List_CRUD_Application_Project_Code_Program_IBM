// Simple To-Do CRUD with localStorage
const STORAGE_KEY = 'andre_dc_todos_v1';

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  todoList.innerHTML = '';

  const filtered = todos.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (q && !t.title.toLowerCase().includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Tidak ada tugas.';
    li.style.color = '#6b7280';
    li.style.padding = '10px';
    todoList.appendChild(li);
    return;
  }

  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const left = document.createElement('div');
    left.className = 'todo-left';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = item.completed;
    checkbox.addEventListener('change', () => {
      item.completed = checkbox.checked;
      save();
      render();
    });

    const title = document.createElement('span');
    title.className = 'todo-title';
    if (item.completed) title.classList.add('completed');
    title.textContent = item.title;

    label.appendChild(checkbox);
    label.appendChild(title);
    left.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => handleEdit(item.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Hapus';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Hapus tugas ini?')) {
        todos = todos.filter(t => t.id !== item.id);
        save();
        render();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);

    todoList.appendChild(li);
  });
}

function handleEdit(id) {
  const item = todos.find(t => t.id === id);
  const newTitle = prompt('Edit tugas:', item.title);
  if (newTitle === null) return;
  const trimmed = newTitle.trim();
  if (trimmed.length === 0) {
    alert('Judul tidak boleh kosong.');
    return;
  }
  item.title = trimmed;
  save();
  render();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  const newTodo = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.unshift(newTodo);
  todoInput.value = '';
  save();
  render();
});

searchInput.addEventListener('input', render);
filterSelect.addEventListener('change', render);

// initial render
render();
