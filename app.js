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
let completionHistory = {}; // Track completions by month (format: "YYYY-MM": count)

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

    // Load completion history
    const savedHistory = localStorage.getItem('completionHistory');
    if (savedHistory) {
        completionHistory = JSON.parse(savedHistory);
        renderMonthlyChart();
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

// Create F1 car racing through checkered flag celebration
function createConfetti(isMilestone = false) {
    // Create checkered flag at top left
    const flag = document.createElement('div');
    flag.className = 'checkered-flag';
    flag.textContent = '🏁';
    document.body.appendChild(flag);

    // Remove flag after animation
    setTimeout(() => flag.remove(), 2000);

    // Create one F1 car
    const car = document.createElement('div');
    car.className = 'f1-car';
    car.textContent = '🏎️';
    car.style.top = '10%';
    document.body.appendChild(car);

    // Remove car after animation completes
    setTimeout(() => car.remove(), 2000);
}

// Render monthly completion chart
function renderMonthlyChart() {
    const chartContainer = document.getElementById('monthlyChart');

    // Get last 6 months including current month
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7); // "YYYY-MM"
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        months.push({ key: monthKey, label: monthLabel });
    }

    // Find max value for scaling
    const values = months.map(m => completionHistory[m.key] || 0);
    const maxValue = Math.max(...values, 1); // At least 1 to avoid division by zero

    // Check if there's any data
    const hasData = values.some(v => v > 0);

    if (!hasData) {
        chartContainer.innerHTML = '<div class="chart-empty">No completed tasks yet. Complete some tasks to see your monthly progress!</div>';
        return;
    }

    // Create bars
    chartContainer.innerHTML = '';
    months.forEach(month => {
        const count = completionHistory[month.key] || 0;
        const heightPercent = (count / maxValue) * 100;

        const barContainer = document.createElement('div');
        barContainer.style.flex = '1';
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.style.justifyContent = 'flex-end';
        barContainer.style.position = 'relative';
        barContainer.style.height = '100%';

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = heightPercent + '%';
        bar.title = `${month.label}: ${count} task${count !== 1 ? 's' : ''}`;

        // Add value label on top of bar
        if (count > 0) {
            const valueLabel = document.createElement('span');
            valueLabel.className = 'chart-bar-value';
            valueLabel.textContent = count;
            bar.appendChild(valueLabel);
        }

        // Add month label below bar
        const label = document.createElement('span');
        label.className = 'chart-bar-label';
        label.textContent = month.label;

        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        chartContainer.appendChild(barContainer);
    });
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

            // Record completion in monthly history
            const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
            completionHistory[currentMonth] = (completionHistory[currentMonth] || 0) + 1;
            localStorage.setItem('completionHistory', JSON.stringify(completionHistory));
            renderMonthlyChart();

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

// Initialize the app
loadTodos();

// ===== JOURNAL FUNCTIONALITY =====

// Journal state
let journalEntries = [];

// Get journal DOM elements
const tabBtns = document.querySelectorAll('.tab-btn');
const todoSection = document.getElementById('todoSection');
const journalSection = document.getElementById('journalSection');
const journalInput = document.getElementById('journalInput');
const saveEntryBtn = document.getElementById('saveEntryBtn');
const charCount = document.getElementById('charCount');
const journalEntriesContainer = document.getElementById('journalEntries');

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide sections
        if (tab === 'todo') {
            todoSection.classList.add('active');
            journalSection.classList.remove('active');
        } else if (tab === 'journal') {
            journalSection.classList.add('active');
            todoSection.classList.remove('active');
        }
    });
});

// Character counter
journalInput.addEventListener('input', () => {
    const count = journalInput.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
});

// Load journal entries from localStorage
function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        journalEntries = JSON.parse(savedEntries);
        renderJournalEntries();
    }
}

// Save journal entries to localStorage
function saveJournalEntries() {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
}

// Save new entry
function saveEntry() {
    const content = journalInput.value.trim();

    if (content === '') {
        alert('Please write something before saving!');
        return;
    }

    const entry = {
        id: Date.now(),
        content: content,
        date: new Date().toISOString()
    };

    journalEntries.unshift(entry); // Add to beginning
    journalInput.value = '';
    charCount.textContent = '0 characters';
    saveJournalEntries();
    renderJournalEntries();

    // Show success feedback
    saveEntryBtn.textContent = '✅ Saved!';
    setTimeout(() => {
        saveEntryBtn.textContent = '💾 Save Entry';
    }, 2000);
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        journalEntries = journalEntries.filter(entry => entry.id !== id);
        saveJournalEntries();
        renderJournalEntries();
    }
}

// Format date
function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Render journal entries
function renderJournalEntries() {
    if (journalEntries.length === 0) {
        journalEntriesContainer.innerHTML = '<div class="entries-empty">No entries yet. Start writing to create your first entry!</div>';
        return;
    }

    journalEntriesContainer.innerHTML = '';
    journalEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';

        const header = document.createElement('div');
        header.className = 'entry-header';

        const dateSpan = document.createElement('div');
        dateSpan.className = 'entry-date';
        dateSpan.innerHTML = `📅 ${formatDate(entry.date)}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'entry-delete-btn';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.id));

        header.appendChild(dateSpan);
        header.appendChild(deleteBtn);

        const content = document.createElement('div');
        content.className = 'entry-content';
        content.textContent = entry.content;

        entryDiv.appendChild(header);
        entryDiv.appendChild(content);
        journalEntriesContainer.appendChild(entryDiv);
    });
}

// Event listeners
saveEntryBtn.addEventListener('click', saveEntry);

journalInput.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        saveEntry();
    }
});

// Initialize journal
loadJournalEntries();
