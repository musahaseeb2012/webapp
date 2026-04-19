// Main menu functionality
const mainMenu = document.getElementById('mainMenu');
const todoListBtn = document.getElementById('todoListBtn');
const notesBtn = document.getElementById('notesBtn');
const calendarBtn = document.getElementById('calendarBtn');
const tipsBtn = document.getElementById('tipsBtn');
const shopBtn = document.getElementById('shopBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const appContainer = document.querySelector('.container');
const notesContainer = document.getElementById('notesContainer');
const noteEditor = document.getElementById('noteEditor');
const calendarContainer = document.getElementById('calendarContainer');
const shopContainer = document.getElementById('shopContainer');
const backToMenuFromNotes = document.getElementById('backToMenuFromNotes');
const backToNotesList = document.getElementById('backToNotesList');
const backToMenuFromCalendar = document.getElementById('backToMenuFromCalendar');
const backToMenuFromShop = document.getElementById('backToMenuFromShop');
const addNewNoteBtn = document.getElementById('addNewNoteBtn');
const tipsModal = document.getElementById('tipsModal');
const closeTips = document.getElementById('closeTips');

// Start with menu visible, apps hidden
appContainer.style.display = 'none';
notesContainer.style.display = 'none';
noteEditor.style.display = 'none';
calendarContainer.style.display = 'none';
shopContainer.style.display = 'none';

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
        renderNotes();
    }
});

// Open Calendar (if unlocked)
calendarBtn.addEventListener('click', () => {
    if (!calendarBtn.classList.contains('locked')) {
        mainMenu.classList.add('hidden');
        calendarContainer.style.display = 'block';
        renderCalendar();
    }
});

// Open Note Editor for new note
addNewNoteBtn.addEventListener('click', () => {
    openNoteEditor();
});

// Open Tips Modal
tipsBtn.addEventListener('click', () => {
    tipsModal.style.display = 'flex';
    updateTipsProgress();
});

// Open Shop
shopBtn.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    shopContainer.style.display = 'block';
    renderShop();
    setupShopTabs();
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

// Back to notes list from editor
backToNotesList.addEventListener('click', () => {
    noteEditor.style.display = 'none';
    notesContainer.style.display = 'block';
    clearNoteForm();
});

// Back to menu from Calendar
backToMenuFromCalendar.addEventListener('click', () => {
    calendarContainer.style.display = 'none';
    mainMenu.classList.remove('hidden');
});

// Back to menu from Shop
backToMenuFromShop.addEventListener('click', () => {
    shopContainer.style.display = 'none';
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
let events = {};
let currentDate = new Date();
let selectedDateStr = null;
let points = 0;
let purchasedThemes = ['default'];
let currentTheme = 'default';
let purchasedBackgrounds = ['default'];
let currentBackground = 'default';

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

// Load events from localStorage
function loadEvents() {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
}

// Load points and themes
function loadPointsAndThemes() {
    const savedPoints = localStorage.getItem('points');
    if (savedPoints) {
        points = parseInt(savedPoints);
        updatePointsDisplay();
    }

    const savedPurchasedThemes = localStorage.getItem('purchasedThemes');
    if (savedPurchasedThemes) {
        purchasedThemes = JSON.parse(savedPurchasedThemes);
    }

    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(currentTheme);
    }

    const savedPurchasedBackgrounds = localStorage.getItem('purchasedBackgrounds');
    if (savedPurchasedBackgrounds) {
        purchasedBackgrounds = JSON.parse(savedPurchasedBackgrounds);
    }

    const savedBackground = localStorage.getItem('currentBackground');
    if (savedBackground) {
        currentBackground = savedBackground;
        applyBackground(currentBackground);
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

    // Calendar unlocks at 20 completed tasks
    if (totalCompletedCount >= 20) {
        calendarBtn.classList.remove('locked');
        calendarBtn.querySelector('.lock-icon').style.display = 'none';
        calendarBtn.querySelector('.option-description').textContent = 'Track your schedule';
    } else {
        calendarBtn.classList.add('locked');
        calendarBtn.querySelector('.lock-icon').style.display = 'block';
        calendarBtn.querySelector('.option-description').textContent = `Complete ${20 - totalCompletedCount} more task${20 - totalCompletedCount !== 1 ? 's' : ''} to unlock`;
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

    const calendarProgress = document.getElementById('calendarProgress');
    calendarProgress.textContent = `${Math.min(totalCompletedCount, 20)}/20`;

    if (totalCompletedCount >= 20) {
        calendarProgress.style.color = '#00ff00';
        calendarProgress.textContent += ' ✓';
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Save points and themes
function savePoints() {
    localStorage.setItem('points', points);
}

function savePurchasedThemes() {
    localStorage.setItem('purchasedThemes', JSON.stringify(purchasedThemes));
}

function saveCurrentTheme() {
    localStorage.setItem('currentTheme', currentTheme);
}

function savePurchasedBackgrounds() {
    localStorage.setItem('purchasedBackgrounds', JSON.stringify(purchasedBackgrounds));
}

function saveCurrentBackground() {
    localStorage.setItem('currentBackground', currentBackground);
}

// Update points display
function updatePointsDisplay() {
    document.getElementById('menuPoints').textContent = points;
    document.getElementById('shopPoints').textContent = points;
}

// Show points notification
function showPointsNotification() {
    const notification = document.getElementById('pointsNotification');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
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

            // Add 5 points
            points += 5;
            savePoints();
            updatePointsDisplay();
            showPointsNotification();

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
        localStorage.removeItem('events');
        localStorage.removeItem('points');
        localStorage.removeItem('purchasedThemes');
        localStorage.removeItem('currentTheme');
        localStorage.removeItem('purchasedBackgrounds');
        localStorage.removeItem('currentBackground');
        todos = [];
        totalCompletedCount = 0;
        currentFilter = 'all';
        notes = [];
        editingNoteId = null;
        events = {};
        selectedDateStr = null;
        points = 0;
        purchasedThemes = ['default'];
        currentTheme = 'default';
        purchasedBackgrounds = ['default'];
        currentBackground = 'default';

        // Reset filter buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');

        updateTotalCompleted();
        renderTodos();
        renderNotes();
        clearNoteForm();
        updatePointsDisplay();
        applyTheme('default');

        // Return to menu
        noteEditor.style.display = 'none';
        notesContainer.style.display = 'none';
        calendarContainer.style.display = 'none';
        eventEditor.style.display = 'none';
        shopContainer.style.display = 'none';
        appContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
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
const notesList = document.getElementById('notesList');

// Open note editor (new or existing)
function openNoteEditor(noteId = null) {
    notesContainer.style.display = 'none';
    noteEditor.style.display = 'block';

    if (noteId !== null) {
        // Edit existing note
        const note = notes.find(n => n.id === noteId);
        if (note) {
            noteTitle.value = note.title === 'Untitled' ? '' : note.title;
            noteContent.value = note.content;
            editingNoteId = noteId;
        }
    } else {
        // New note
        clearNoteForm();
    }

    noteTitle.focus();
}

// Save note
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

    saveNotes();

    // Go back to notes list
    noteEditor.style.display = 'none';
    notesContainer.style.display = 'block';
    clearNoteForm();
    renderNotes();
}

// Delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    }
}

// Clear note form
function clearNoteForm() {
    noteTitle.value = '';
    noteContent.value = '';
    editingNoteId = null;
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
        notesList.innerHTML = '<div class="empty-state">No notes yet. Click "Add New Note" to get started!</div>';
        return;
    }

    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';

        const preview = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;

        noteCard.innerHTML = `
            <div class="note-card-header">
                <h3 class="note-card-title">${note.title}</h3>
                <span class="note-card-date">${formatDate(note.updatedAt)}</span>
            </div>
            <p class="note-card-content">${preview}</p>
            <div class="note-card-actions">
                <button class="note-edit-btn" onclick="openNoteEditor(${note.id})">Edit</button>
                <button class="note-delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;

        notesList.appendChild(noteCard);
    });
}

// Event listeners for notes
saveNoteBtn.addEventListener('click', saveNote);

noteTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        noteContent.focus();
    }
});

// Calendar functionality
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthEl = document.getElementById('currentMonth');
const calendarDaysEl = document.getElementById('calendarDays');
const selectedDateEl = document.getElementById('selectedDate');
const eventsListEl = document.getElementById('eventsList');
const addEventBtn = document.getElementById('addEventBtn');
const eventEditor = document.getElementById('eventEditor');
const closeEventEditor = document.getElementById('closeEventEditor');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');
const eventTime = document.getElementById('eventTime');
const saveEventBtn = document.getElementById('saveEventBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');

// Navigate months
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Event editor controls
addEventBtn.addEventListener('click', () => {
    eventEditor.style.display = 'flex';
    eventTitle.focus();
});

closeEventEditor.addEventListener('click', () => {
    eventEditor.style.display = 'none';
    clearEventForm();
});

cancelEventBtn.addEventListener('click', () => {
    eventEditor.style.display = 'none';
    clearEventForm();
});

eventEditor.addEventListener('click', (e) => {
    if (e.target === eventEditor) {
        eventEditor.style.display = 'none';
        clearEventForm();
    }
});

saveEventBtn.addEventListener('click', saveEvent);

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Clear calendar
    calendarDaysEl.innerHTML = '';

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarDaysEl.appendChild(emptyCell);
    }

    // Add days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Highlight today
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayCell.classList.add('today');
        }

        // Highlight if has events
        if (events[dateStr] && events[dateStr].length > 0) {
            dayCell.classList.add('has-events');
            const eventDot = document.createElement('div');
            eventDot.className = 'event-dot';
            dayCell.appendChild(eventDot);
        }

        // Click handler
        dayCell.addEventListener('click', () => selectDate(dateStr, day, month, year));

        calendarDaysEl.appendChild(dayCell);
    }
}

// Select a date
function selectDate(dateStr, day, month, year) {
    selectedDateStr = dateStr;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    selectedDateEl.textContent = `${monthNames[month]} ${day}, ${year}`;

    addEventBtn.style.display = 'block';
    renderEvents();

    // Highlight selected day
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    event.target.classList.add('selected');
}

// Render events for selected date
function renderEvents() {
    if (!selectedDateStr) return;

    eventsListEl.innerHTML = '';
    const dateEvents = events[selectedDateStr] || [];

    if (dateEvents.length === 0) {
        eventsListEl.innerHTML = '<div class="empty-state">No events for this day</div>';
        return;
    }

    dateEvents.forEach((evt, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        eventCard.innerHTML = `
            <div class="event-card-header">
                <span class="event-time">${evt.time || 'All day'}</span>
                <button class="delete-event-btn" onclick="deleteEvent(${index})">✕</button>
            </div>
            <h4 class="event-title">${evt.title}</h4>
            ${evt.description ? `<p class="event-description">${evt.description}</p>` : ''}
        `;

        eventsListEl.appendChild(eventCard);
    });
}

// Save event
function saveEvent() {
    const title = eventTitle.value.trim();

    if (!title) {
        alert('Please enter an event title!');
        return;
    }

    if (!selectedDateStr) {
        alert('Please select a date first!');
        return;
    }

    const event = {
        title: title,
        description: eventDescription.value.trim(),
        time: eventTime.value
    };

    if (!events[selectedDateStr]) {
        events[selectedDateStr] = [];
    }

    events[selectedDateStr].push(event);
    saveEvents();
    renderCalendar();
    renderEvents();

    eventEditor.style.display = 'none';
    clearEventForm();
}

// Delete event
function deleteEvent(index) {
    if (confirm('Delete this event?')) {
        events[selectedDateStr].splice(index, 1);
        if (events[selectedDateStr].length === 0) {
            delete events[selectedDateStr];
        }
        saveEvents();
        renderCalendar();
        renderEvents();
    }
}

// Clear event form
function clearEventForm() {
    eventTitle.value = '';
    eventDescription.value = '';
    eventTime.value = '';
}

// Themes data
const themes = [
    {
        id: 'default',
        name: 'Crimson Bolt',
        colors: { primary: '#dc143c', secondary: '#1e90ff' },
        bg: { color1: 'rgba(220, 20, 60, 0.4)', color2: 'rgba(30, 144, 255, 0.3)', accent: 'rgba(138, 43, 226, 0.25)' },
        cost: 0,
        icon: '⚡'
    },
    {
        id: 'ocean',
        name: 'Ocean Wave',
        colors: { primary: '#00CED1', secondary: '#1E90FF' },
        bg: { color1: 'rgba(0, 206, 209, 0.4)', color2: 'rgba(30, 144, 255, 0.35)', accent: 'rgba(64, 224, 208, 0.25)' },
        cost: 50,
        icon: '🌊'
    },
    {
        id: 'sunset',
        name: 'Sunset Glow',
        colors: { primary: '#FF6347', secondary: '#FFD700' },
        bg: { color1: 'rgba(255, 99, 71, 0.4)', color2: 'rgba(255, 215, 0, 0.35)', accent: 'rgba(255, 140, 0, 0.3)' },
        cost: 75,
        icon: '🌅'
    },
    {
        id: 'forest',
        name: 'Forest Green',
        colors: { primary: '#228B22', secondary: '#90EE90' },
        bg: { color1: 'rgba(34, 139, 34, 0.4)', color2: 'rgba(144, 238, 144, 0.3)', accent: 'rgba(46, 139, 87, 0.3)' },
        cost: 100,
        icon: '🌲'
    },
    {
        id: 'purple',
        name: 'Royal Purple',
        colors: { primary: '#9370DB', secondary: '#DA70D6' },
        bg: { color1: 'rgba(147, 112, 219, 0.4)', color2: 'rgba(218, 112, 214, 0.35)', accent: 'rgba(186, 85, 211, 0.3)' },
        cost: 125,
        icon: '👑'
    },
    {
        id: 'fire',
        name: 'Blazing Fire',
        colors: { primary: '#FF4500', secondary: '#FF8C00' },
        bg: { color1: 'rgba(255, 69, 0, 0.45)', color2: 'rgba(255, 140, 0, 0.4)', accent: 'rgba(255, 99, 71, 0.35)' },
        cost: 150,
        icon: '🔥'
    },
    {
        id: 'ice',
        name: 'Arctic Ice',
        colors: { primary: '#4682B4', secondary: '#87CEEB' },
        bg: { color1: 'rgba(70, 130, 180, 0.4)', color2: 'rgba(135, 206, 235, 0.35)', accent: 'rgba(176, 224, 230, 0.3)' },
        cost: 150,
        icon: '❄️'
    },
    {
        id: 'gold',
        name: 'Golden Luxury',
        colors: { primary: '#FFD700', secondary: '#FFA500' },
        bg: { color1: 'rgba(255, 215, 0, 0.45)', color2: 'rgba(255, 165, 0, 0.4)', accent: 'rgba(218, 165, 32, 0.35)' },
        cost: 200,
        icon: '✨'
    }
];

// Backgrounds data
const backgrounds = [
    {
        id: 'default',
        name: 'Dark Gradient',
        preview: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        style: `linear-gradient(135deg,rgba(0, 0, 0, 0.8) 0%,rgba(20, 0, 10, 0.9) 25%,rgba(10, 0, 30, 0.85) 50%,rgba(20, 0, 10, 0.9) 75%,rgba(0, 0, 0, 0.8) 100%),linear-gradient(180deg, #000000 0%, #0a0a0a 100%)`,
        cost: 0,
        icon: '🌑'
    },
    {
        id: 'stars',
        name: 'Starry Night',
        preview: 'radial-gradient(circle, #000428 0%, #004e92 100%)',
        style: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 1%),radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 1%),radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 1%),radial-gradient(circle at 90% 40%, rgba(255, 255, 255, 0.12) 0%, transparent 1%),radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 1%),linear-gradient(180deg, #000428 0%, #004e92 100%)`,
        cost: 100,
        icon: '⭐'
    },
    {
        id: 'aurora',
        name: 'Aurora Borealis',
        preview: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
        style: `linear-gradient(135deg,rgba(26, 42, 108, 0.4) 0%,rgba(178, 31, 31, 0.4) 33%,rgba(253, 187, 45, 0.4) 66%,rgba(26, 42, 108, 0.4) 100%),radial-gradient(ellipse at 50% 30%, rgba(0, 255, 157, 0.2) 0%, transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 100%)`,
        cost: 150,
        icon: '🌌'
    },
    {
        id: 'matrix',
        name: 'Digital Matrix',
        preview: 'repeating-linear-gradient(0deg, #000 0px, #001a00 2px)',
        style: `repeating-linear-gradient(0deg,rgba(0, 26, 0, 0.5) 0px,rgba(0, 0, 0, 0.8) 2px,rgba(0, 0, 0, 0.9) 4px),linear-gradient(90deg,rgba(0, 255, 0, 0.03) 0%,transparent 100%),linear-gradient(180deg, #000000 0%, #001a00 100%)`,
        cost: 175,
        icon: '💻'
    },
    {
        id: 'neon',
        name: 'Neon Grid',
        preview: 'linear-gradient(90deg, #ff00ff 0%, #00ffff 100%)',
        style: `repeating-linear-gradient(90deg,transparent 0px,transparent 48px,rgba(255, 0, 255, 0.1) 48px,rgba(255, 0, 255, 0.1) 50px),repeating-linear-gradient(0deg,transparent 0px,transparent 48px,rgba(0, 255, 255, 0.1) 48px,rgba(0, 255, 255, 0.1) 50px),linear-gradient(135deg, #0a0015 0%, #15001a 100%)`,
        cost: 200,
        icon: '🎮'
    },
    {
        id: 'galaxy',
        name: 'Deep Galaxy',
        preview: 'radial-gradient(circle, #240b36 0%, #0d0221 100%)',
        style: `radial-gradient(ellipse at 20% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.25) 0%, transparent 50%),radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 60%),radial-gradient(circle at 10% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 2%),radial-gradient(circle at 90% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 2%),linear-gradient(180deg, #0d0221 0%, #240b36 100%)`,
        cost: 250,
        icon: '🌠'
    }
];

// Render shop
function renderShop() {
    renderThemes();
    renderBackgrounds();
}

// Setup shop tabs
function setupShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const tabName = tab.dataset.tab;
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

function renderThemes() {
    const themeGrid = document.getElementById('themeGrid');
    themeGrid.innerHTML = '';

    themes.forEach(theme => {
        const isPurchased = purchasedThemes.includes(theme.id);
        const isActive = currentTheme === theme.id;

        const themeCard = document.createElement('div');
        themeCard.className = `theme-card ${isActive ? 'active' : ''}`;
        themeCard.style.borderColor = theme.colors.primary;

        themeCard.innerHTML = `
            <div class="theme-icon">${theme.icon}</div>
            <h3 class="theme-name">${theme.name}</h3>
            <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);"></div>
            ${isPurchased
                ? (isActive
                    ? '<button class="theme-btn active-btn">Active ✓</button>'
                    : `<button class="theme-btn apply-btn" onclick="applyTheme('${theme.id}')">Apply</button>`)
                : `<button class="theme-btn buy-btn" onclick="buyTheme('${theme.id}')">${theme.cost === 0 ? 'Free' : theme.cost + ' pts'}</button>`
            }
        `;

        themeGrid.appendChild(themeCard);
    });
}

function renderBackgrounds() {
    const backgroundGrid = document.getElementById('backgroundGrid');
    backgroundGrid.innerHTML = '';

    backgrounds.forEach(bg => {
        const isPurchased = purchasedBackgrounds.includes(bg.id);
        const isActive = currentBackground === bg.id;

        const bgCard = document.createElement('div');
        bgCard.className = `theme-card ${isActive ? 'active' : ''}`;

        bgCard.innerHTML = `
            <div class="theme-icon">${bg.icon}</div>
            <h3 class="theme-name">${bg.name}</h3>
            <div class="theme-preview" style="background: ${bg.preview}; height: 100px;"></div>
            ${isPurchased
                ? (isActive
                    ? '<button class="theme-btn active-btn">Active ✓</button>'
                    : `<button class="theme-btn apply-btn" onclick="applyBackground('${bg.id}')">Apply</button>`)
                : `<button class="theme-btn buy-btn" onclick="buyBackground('${bg.id}')">${bg.cost === 0 ? 'Free' : bg.cost + ' pts'}</button>`
            }
        `;

        backgroundGrid.appendChild(bgCard);
    });
}

// Buy theme
function buyTheme(themeId) {
    const theme = themes.find(t => t.id === themeId);

    if (!theme) return;

    if (points >= theme.cost) {
        points -= theme.cost;
        purchasedThemes.push(themeId);
        savePoints();
        savePurchasedThemes();
        updatePointsDisplay();
        renderShop();

        // Auto-apply purchased theme
        applyTheme(themeId);
    } else {
        alert(`Not enough points! You need ${theme.cost - points} more points.`);
    }
}

// Apply theme
function applyTheme(themeId) {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    currentTheme = themeId;
    saveCurrentTheme();

    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);

    // Update background
    document.body.style.backgroundImage = `
        linear-gradient(135deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(20, 0, 10, 0.9) 25%,
            rgba(10, 0, 30, 0.85) 50%,
            rgba(20, 0, 10, 0.9) 75%,
            rgba(0, 0, 0, 0.8) 100%
        ),
        radial-gradient(ellipse at 10% 20%, ${theme.bg.color1} 0%, transparent 50%),
        radial-gradient(ellipse at 90% 80%, ${theme.bg.color2} 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, ${theme.bg.accent} 0%, transparent 70%),
        linear-gradient(180deg, #000000 0%, #0a0a0a 100%)
    `;

    renderShop();
}

// Buy background
function buyBackground(bgId) {
    const bg = backgrounds.find(b => b.id === bgId);

    if (!bg) return;

    if (points >= bg.cost) {
        points -= bg.cost;
        purchasedBackgrounds.push(bgId);
        savePoints();
        savePurchasedBackgrounds();
        updatePointsDisplay();
        renderBackgrounds();

        // Auto-apply purchased background
        applyBackground(bgId);
    } else {
        alert(`Not enough points! You need ${bg.cost - points} more points.`);
    }
}

// Apply background
function applyBackground(bgId) {
    const bg = backgrounds.find(b => b.id === bgId);
    if (!bg) return;

    currentBackground = bgId;
    saveCurrentBackground();

    // Get current theme for overlay
    const theme = themes.find(t => t.id === currentTheme);

    // Apply background with theme overlay
    document.body.style.backgroundImage = `
        radial-gradient(ellipse at 10% 20%, ${theme.bg.color1} 0%, transparent 50%),
        radial-gradient(ellipse at 90% 80%, ${theme.bg.color2} 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, ${theme.bg.accent} 0%, transparent 70%),
        ${bg.style}
    `;

    renderBackgrounds();
}

// Initialize the app
loadTodos();
loadNotes();
loadEvents();
loadPointsAndThemes();
