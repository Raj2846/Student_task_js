// Load tasks from localStorage when the page starts
document.addEventListener("DOMContentLoaded", loadTasks);

const taskName = document.getElementById("taskName");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Add task button click
addTaskBtn.addEventListener("click", addTask);

function addTask() {
    const name = taskName.value.trim();
    const date = taskDate.value;

    if (name === "") {
        alert("Please enter a task name.");
        return;
    }

    const task = {
        name: name,
        date: date,
        completed: false
    };

    addTaskToUI(task);
    saveTask(task);

    taskName.value = "";
    taskDate.value = "";
}

function addTaskToUI(task) {
    const li = document.createElement("li");
    li.classList.add("task");

    li.innerHTML = `
        <span class="${task.completed ? "completed" : ""}">
            ${task.name} 
            <small style="color: gray;">${task.date ? " | Due: " + task.date : ""}</small>
        </span>

        <div class="buttons">
            <button class="complete-btn">Complete</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    // Complete task
    li.querySelector(".complete-btn").addEventListener("click", () => {
        li.querySelector("span").classList.toggle("completed");
        task.completed = !task.completed;
        updateLocalStorage();
    });

    // Delete task
    li.querySelector(".delete-btn").addEventListener("click", () => {
        li.remove();
        removeTask(task);
    });

    taskList.appendChild(li);
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => addTaskToUI(task));
}

function removeTask(taskToRemove) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter(
        task => !(task.name === taskToRemove.name && task.date === taskToRemove.date)
    );
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

function updateLocalStorage() {
    const tasks = [];
    document.querySelectorAll("#taskList .task").forEach(li => {
        const name = li.querySelector("span").childNodes[0].nodeValue.trim();
        const dateText = li.querySelector("small").innerText.replace("Due: ", "");
        const completed = li.querySelector("span").classList.contains("completed");

        tasks.push({
            name,
            date: dateText || "",
            completed
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
