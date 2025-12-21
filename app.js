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

// Create confetti effect
function createConfetti(isMilestone = false) {
    const colors = isMilestone
        ? ['#ffd700', '#ffcc00', '#fff', '#ffeb3b', '#ffc107', '#ffdf00']  // Gold/yellow variations for milestones
        : ['#ffd700', '#ffcc00', '#fff', '#ffeb3b'];

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
