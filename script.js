// StudyTrack: a beginner-friendly task planner built with vanilla JavaScript.
const STORAGE_KEY = "studytrack.tasks.v1";
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const subjectFilter = document.getElementById("subject-filter");
const toast = document.getElementById("toast");

let tasks = loadTasks();
let currentView = "all";
let editingTaskId = null;
let timerSeconds = FOCUS_SECONDS;
let timerRunning = false;
let isBreak = false;
let timerInterval = null;

// Read previously saved tasks. If browser storage is unavailable, start with an empty list.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast("Browser storage is unavailable. Your changes may not persist.");
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function todayString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dueLabel(task) {
  if (task.completed) return "Completed";
  if (task.date < todayString()) return `Overdue · ${formatDate(task.date)}`;
  if (task.date === todayString()) return "Due today";
  return `Due ${formatDate(task.date)}`;
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("greeting").textContent = `${greeting} 👋`;
  document.getElementById("today-label").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  }).toUpperCase();
}

function getVisibleTasks() {
  let visible = [...tasks];
  if (currentView === "today") visible = visible.filter(task => task.date === todayString() && !task.completed);
  if (currentView === "upcoming") visible = visible.filter(task => task.date > todayString() && !task.completed);
  if (currentView === "completed") visible = visible.filter(task => task.completed);
  const subject = subjectFilter.value;
  if (subject !== "all") visible = visible.filter(task => task.subject === subject);
  return visible.sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    return a.date.localeCompare(b.date);
  });
}

function renderTasks() {
  const visible = getVisibleTasks();
  taskList.innerHTML = "";
  emptyState.style.display = visible.length ? "none" : "block";

  visible.forEach(task => {
    const row = document.createElement("article");
    row.className = `task-row${task.completed ? " is-complete" : ""}`;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.completed;
    check.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "not completed" : "completed"}`);
    check.addEventListener("change", () => toggleTask(task.id));

    const details = document.createElement("div");
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const subject = document.createElement("span");
    subject.className = "subject-tag";
    subject.textContent = task.subject;
    const due = document.createElement("span");
    due.textContent = dueLabel(task);
    meta.append(subject, due);
    details.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority;
    const edit = document.createElement("button");
    edit.className = "task-action";
    edit.type = "button";
    edit.textContent = "✎";
    edit.title = "Edit task";
    edit.setAttribute("aria-label", `Edit ${task.title}`);
    edit.addEventListener("click", () => openModal(task));
    const remove = document.createElement("button");
    remove.className = "task-action";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Delete task";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", () => deleteTask(task.id));
    actions.append(priority, edit, remove);
    row.append(check, details, actions);
    taskList.append(row);
  });
  renderStats();
  renderSubjects();
}

function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("total-count").textContent = total;
  document.getElementById("completed-count").textContent = completed;
  document.getElementById("pending-count").textContent = pending;
  document.getElementById("progress-percent").textContent = progress;
  document.getElementById("progress-fill").style.width = `${progress}%`;
}

function renderSubjects() {
  const subjects = ["C Programming", "Mathematics", "Physics", "Data Structures", "Other"];
  const container = document.getElementById("subject-breakdown");
  container.innerHTML = "";
  subjects.forEach(subjectName => {
    const subjectTasks = tasks.filter(task => task.subject === subjectName);
    const completed = subjectTasks.filter(task => task.completed).length;
    const percent = subjectTasks.length ? Math.round(completed / subjectTasks.length * 100) : 0;
    const row = document.createElement("div");
    row.className = "subject-row";
    const name = document.createElement("span");
    name.className = "subject-name";
    name.textContent = subjectName;
    const count = document.createElement("span");
    count.className = "subject-count";
    count.textContent = `${completed}/${subjectTasks.length}`;
    const track = document.createElement("div");
    track.className = "subject-track";
    const fill = document.createElement("div");
    fill.className = "subject-fill";
    fill.style.width = `${percent}%`;
    track.append(fill);
    row.append(name, count, track);
    container.append(row);
  });
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
  const task = tasks.find(item => item.id === id);
  showToast(task.completed ? "Nice work — task completed!" : "Task moved back to pending.");
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  if (!confirm(`Delete "${task.title}"?`)) return;
  tasks = tasks.filter(item => item.id !== id);
  saveTasks();
  renderTasks();
  showToast("Task deleted.");
}

function openModal(task = null) {
  editingTaskId = task ? task.id : null;
  taskForm.reset();
  document.getElementById("modal-title").textContent = task ? "Edit task" : "Add a new task";
  document.getElementById("task-title").value = task ? task.title : "";
  document.getElementById("task-subject").value = task ? task.subject : "C Programming";
  document.getElementById("task-priority").value = task ? task.priority : "Medium";
  document.getElementById("task-date").value = task ? task.date : todayString();
  taskModal.hidden = false;
  document.getElementById("task-title").focus();
}

function closeModal() {
  taskModal.hidden = true;
  editingTaskId = null;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = String(formData.get("title")).trim();
  if (!title) return;
  const taskData = {
    title,
    subject: String(formData.get("subject")),
    priority: String(formData.get("priority")),
    date: String(formData.get("date")),
    completed: false
  };
  if (editingTaskId) {
    const oldTask = tasks.find(task => task.id === editingTaskId);
    tasks = tasks.map(task => task.id === editingTaskId ? { ...taskData, id: editingTaskId, completed: oldTask.completed } : task);
    showToast("Task updated.");
  } else {
    tasks.push({ ...taskData, id: makeId(), completed: false });
    showToast("Task added. You can do this!");
  }
  saveTasks();
  closeModal();
  renderTasks();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.getElementById("open-modal").addEventListener("click", () => openModal());
document.getElementById("empty-add").addEventListener("click", () => openModal());
document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("cancel-modal").addEventListener("click", closeModal);
taskModal.addEventListener("click", event => { if (event.target === taskModal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !taskModal.hidden) closeModal(); });
subjectFilter.addEventListener("change", renderTasks);

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    currentView = button.dataset.view;
    const headings = { all: "Your tasks", today: "Today's tasks", upcoming: "Upcoming tasks", completed: "Completed tasks" };
    document.getElementById("task-heading").textContent = headings[currentView];
    renderTasks();
  });
});

// Pomodoro timer: 25 minutes of focus, followed by a 5-minute break.
function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timer-display").textContent = `${minutes}:${seconds}`;
  document.getElementById("timer-mode").textContent = isBreak ? "BREAK SESSION" : "FOCUS SESSION";
  const elapsed = (isBreak ? BREAK_SECONDS : FOCUS_SECONDS) - timerSeconds;
  const total = isBreak ? BREAK_SECONDS : FOCUS_SECONDS;
  const degrees = Math.max(0, Math.min(360, elapsed / total * 360));
  document.querySelector(".timer-ring").style.background = `conic-gradient(#7664e8 ${degrees}deg,#e9e5ff ${degrees}deg)`;
}

function stopTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("timer-toggle").textContent = "Start focus";
}

document.getElementById("timer-toggle").addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
    document.getElementById("timer-hint").textContent = "Timer paused. Resume whenever you're ready.";
    return;
  }
  timerRunning = true;
  document.getElementById("timer-toggle").textContent = "Pause timer";
  document.getElementById("timer-hint").textContent = "One thing at a time. Stay focused.";
  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      stopTimer();
      isBreak = !isBreak;
      timerSeconds = isBreak ? BREAK_SECONDS : FOCUS_SECONDS;
      document.getElementById("timer-hint").textContent = isBreak ? "Focus session complete! Take a short break." : "Break finished. Ready for another focus session?";
      showToast(isBreak ? "Focus session complete — take a break!" : "Break over — time to focus!");
    }
    updateTimerDisplay();
  }, 1000);
});

document.getElementById("timer-reset").addEventListener("click", () => {
  stopTimer();
  isBreak = false;
  timerSeconds = FOCUS_SECONDS;
  updateTimerDisplay();
  document.getElementById("timer-hint").textContent = "Timer reset. Start when you're ready.";
});

updateGreeting();
renderTasks();
updateTimerDisplay();
