let tasks = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setMinDate();
    setupEventListeners();
    checkReminders();
    setInterval(checkReminders, 60000); // Check every minute
});

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').setAttribute('min', today);
}

function setupEventListeners() {
    document.getElementById('taskForm').addEventListener('submit', addTask);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
}

function addTask(e) {
    e.preventDefault();

    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        category: document.getElementById('taskCategory').value,
        priority: document.getElementById('taskPriority').value,
        date: document.getElementById('taskDate').value,
        time: document.getElementById('taskTime').value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    e.target.reset();
    
    showNotification('Task added successfully! 🎉');
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
        showNotification(task.completed ? 'Task completed! ✅' : 'Task reopened');
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('Task deleted');
    }
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    let filteredTasks = tasks;

    // Apply filters
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = tasks.filter(t => t.priority === 'high');
    }

    // Sort by date and priority
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
    });

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span>📁 ${task.category}</span>
                <span>📅 ${formatDate(task.date)}</span>
                ${task.time ? `<span>🕐 ${task.time}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="action-btn complete-btn" onclick="toggleComplete(${task.id})">
                    ${task.completed ? '↩️ Reopen' : '✓ Complete'}
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('pendingTasks').textContent = tasks.filter(t => !t.completed).length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
}

function checkReminders() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks.forEach(task => {
        if (!task.completed) {
            const taskDate = new Date(task.date);
            
            // Check if task is due tomorrow
            if (taskDate.toDateString() === tomorrow.toDateString() && !task.reminderSent) {
                showNotification(`⏰ Reminder: "${task.title}" is due tomorrow!`);
                task.reminderSent = true;
                saveTasks();
            }
            
            // Check if task is overdue
            if (taskDate < now && taskDate.toDateString() !== now.toDateString()) {
                // Task is overdue
            }
        }
    });
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Manager', { body: message });
    } else {
        alert(message);
    }
}

function saveTasks() {
    const tasksData = JSON.stringify(tasks);
    const encoded = btoa(tasksData);
    document.cookie = `studentTasks=${encoded}; path=/; max-age=31536000`;
}

function loadTasks() {
    const cookies = document.cookie.split(';');
    const tasksCookie = cookies.find(c => c.trim().startsWith('studentTasks='));
    
    if (tasksCookie) {
        try {
            const encoded = tasksCookie.split('=')[1];
            const decoded = atob(encoded);
            tasks = JSON.parse(decoded);
        } catch (e) {
            tasks = [];
        }
    }
    
    renderTasks();
    updateStats();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}