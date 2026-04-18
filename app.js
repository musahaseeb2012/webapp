// Main menu functionality
const mainMenu = document.getElementById('mainMenu');
const todoListBtn = document.getElementById('todoListBtn');
const notesBtn = document.getElementById('notesBtn');
const tipsBtn = document.getElementById('tipsBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const appContainer = document.querySelector('.container');
const notesContainer = document.getElementById('notesContainer');
const backToMenuFromNotes = document.getElementById('backToMenuFromNotes');
const tipsModal = document.getElementById('tipsModal');
const closeTips = document.getElementById('closeTips');

// Start with menu visible, apps hidden
appContainer.style.display = 'none';
notesContainer.style.display = 'none';

// Open To-Do List
todoListBtn.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    appContainer.style.display = 'block';
});

// Open Notes (if unlocked)
notesBtn.addEventListener('click', () => {
    if (!notesBtn.classList.contains('locked')) {
        mainMenu.classList.add('hidden');
        notesContainer.style.display = 'block';
    }
});

// Open Tips Modal
tipsBtn.addEventListener('click', () => {
    tipsModal.style.display = 'flex';
    updateTipsProgress();
});

// Close Tips Modal
closeTips.addEventListener('click', () => {
    tipsModal.style.display = 'none';
});

// Close Tips Modal when clicking outside
tipsModal.addEventListener('click', (e) => {
    if (e.target === tipsModal) {
        tipsModal.style.display = 'none';
    }
});

// Back to menu from To-Do List
backToMenuBtn.addEventListener('click', () => {
    appContainer.style.display = 'none';
    mainMenu.classList.remove('hidden');
});

// Back to menu from Notes
backToMenuFromNotes.addEventListener('click', () => {
    notesContainer.style.display = 'none';
    mainMenu.classList.remove('hidden');
});

// Get DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
let todos = [];
let currentFilter = 'all';
let totalCompletedCount = 0;
let notes = [];
let editingNoteId = null;

// Load todos from localStorage on page load
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }

    // Load total completed count
    const savedTotal = localStorage.getItem('totalCompleted');
    if (savedTotal) {
        totalCompletedCount = parseInt(savedTotal);
        updateTotalCompleted();
    }

    // Check unlock status
    checkUnlockStatus();
}

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Save and update total completed count
function updateTotalCompleted() {
    localStorage.setItem('totalCompleted', totalCompletedCount);
    document.getElementById('totalCompleted').textContent = totalCompletedCount;
    checkUnlockStatus();
}

// Check and update unlock status for features
function checkUnlockStatus() {
    // Notes unlock at 10 completed tasks
    if (totalCompletedCount >= 10) {
        notesBtn.classList.remove('locked');
        notesBtn.querySelector('.lock-icon').style.display = 'none';
        notesBtn.querySelector('.option-description').textContent = 'Organize your thoughts';
    } else {
        notesBtn.classList.add('locked');
        notesBtn.querySelector('.lock-icon').style.display = 'block';
        notesBtn.querySelector('.option-description').textContent = `Complete ${10 - totalCompletedCount} more task${10 - totalCompletedCount !== 1 ? 's' : ''} to unlock`;
    }
}

// Update tips progress display
function updateTipsProgress() {
    const notesProgress = document.getElementById('notesProgress');
    notesProgress.textContent = `${Math.min(totalCompletedCount, 10)}/10`;

    if (totalCompletedCount >= 10) {
        notesProgress.style.color = '#00ff00';
        notesProgress.textContent += ' ✓';
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Show achievement badge with celebration
function showAchievementBadge() {
    const badge = document.getElementById('achievementBadge');
    const messages = [
        { icon: '⭐', text: 'Amazing!', sub: 'Task Completed' },
        { icon: '🎉', text: 'Well Done!', sub: 'Keep It Up!' },
        { icon: '✨', text: 'Fantastic!', sub: 'You\'re Crushing It!' },
        { icon: '💖', text: 'Awesome!', sub: 'Task Complete!' },
        { icon: '🌟', text: 'Brilliant!', sub: 'You Did It!' }
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];
    badge.querySelector('.badge-icon').textContent = msg.icon;
    badge.querySelector('.badge-text').textContent = msg.text;
    badge.querySelector('.badge-subtext').textContent = msg.sub;

    badge.classList.add('show');

    // Create confetti
    createConfetti();

    // Hide after 2 seconds
    setTimeout(() => {
        badge.classList.remove('show');
    }, 2000);
}

// Show milestone badge for every 5 tasks
function showMilestoneBadge() {
    const badge = document.getElementById('milestoneBadge');
    badge.querySelector('.milestone-subtext').textContent = `${totalCompletedCount} Tasks Milestone!`;

    badge.classList.add('show');

    // Create extra special confetti with gold
    createConfetti(true);

    // Hide after 3 seconds (longer than regular)
    setTimeout(() => {
        badge.classList.remove('show');
    }, 3000);
}

// Create confetti effect
function createConfetti(isMilestone = false) {
    const colors = isMilestone
        ? ['#dc143c', '#1e90ff', '#ffd700', '#fff', '#0066cc', '#ffdf00']  // Add gold for milestones
        : ['#dc143c', '#1e90ff', '#fff', '#0066cc'];

    const count = isMilestone ? 100 : 50;  // Double confetti for milestones

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }, i * (isMilestone ? 20 : 30));  // Faster for milestones
    }
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        const wasCompleted = todo.completed;
        todo.completed = !todo.completed;

        // Show celebration only when marking as complete (not when unchecking)
        if (!wasCompleted && todo.completed) {
            // Increment total completed count
            totalCompletedCount++;
            updateTotalCompleted();

            // Check if this is a milestone (every 5 tasks)
            if (totalCompletedCount % 5 === 0) {
                // Show special milestone celebration
                showMilestoneBadge();
            } else {
                // Show regular achievement badge
                showAchievementBadge();
            }
        }

        saveTodos();
        renderTodos();
    }
}

// Clear completed todos
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// Filter todos
function filterTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = filterTodos();

    // Clear the list
    todoList.innerHTML = '';

    // Show empty state if no todos
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks to display</div>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            `;

            todoList.appendChild(li);
        });
    }

    // Update task count
    const activeTasks = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
}

// Event listeners
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Reset app functionality
const resetBtn = document.getElementById('resetApp');
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tasks and data? This cannot be undone.')) {
        localStorage.removeItem('todos');
        localStorage.removeItem('totalCompleted');
        localStorage.removeItem('notes');
        todos = [];
        totalCompletedCount = 0;
        currentFilter = 'all';
        notes = [];
        editingNoteId = null;

        // Reset filter buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');

        updateTotalCompleted();
        renderTodos();
        renderNotes();
        clearNoteForm();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        e.target.classList.add('active');

        // Update current filter
        currentFilter = e.target.dataset.filter;

        // Re-render todos
        renderTodos();
    });
});

// Notes functionality
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const clearNoteBtn = document.getElementById('clearNoteBtn');
const notesList = document.getElementById('notesList');

// Add a new note or update existing
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title && !content) {
        alert('Please enter a title or content for your note!');
        return;
    }

    if (editingNoteId !== null) {
        // Update existing note
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
            note.title = title || 'Untitled';
            note.content = content;
            note.updatedAt = Date.now();
        }
        editingNoteId = null;
        saveNoteBtn.textContent = 'Save Note';
    } else {
        // Create new note
        const note = {
            id: Date.now(),
            title: title || 'Untitled',
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        notes.unshift(note);
    }

    noteTitle.value = '';
    noteContent.value = '';
    saveNotes();
    renderNotes();
}

// Delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();

        // Clear form if we were editing this note
        if (editingNoteId === id) {
            clearNoteForm();
        }
    }
}

// Edit a note
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        noteTitle.value = note.title === 'Untitled' ? '' : note.title;
        noteContent.value = note.content;
        editingNoteId = id;
        saveNoteBtn.textContent = 'Update Note';
        noteTitle.focus();
    }
}

// Clear note form
function clearNoteForm() {
    noteTitle.value = '';
    noteContent.value = '';
    editingNoteId = null;
    saveNoteBtn.textContent = 'Save Note';
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

// Render notes list
function renderNotes() {
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">No notes yet. Start writing!</div>';
        return;
    }

    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';

        noteCard.innerHTML = `
            <div class="note-card-header">
                <h3 class="note-card-title">${note.title}</h3>
                <span class="note-card-date">${formatDate(note.updatedAt)}</span>
            </div>
            <p class="note-card-content">${note.content}</p>
            <div class="note-card-actions">
                <button class="note-edit-btn" onclick="editNote(${note.id})">Edit</button>
                <button class="note-delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;

        notesList.appendChild(noteCard);
    });
}

// Event listeners for notes
saveNoteBtn.addEventListener('click', saveNote);
clearNoteBtn.addEventListener('click', clearNoteForm);

noteTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        noteContent.focus();
    }
});

// Initialize the app
loadTodos();
loadNotes();
