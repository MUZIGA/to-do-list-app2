
// ======================
// Weekly Planner Logic
// ======================
(function () {
  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  const STORAGE_KEY = "weekly_planner_v1";

  let tasks = [];
  let draggedId = null;
  let currentWeekStart = startOfWeek(new Date());
// DOM refs
  const todoColumn = document.getElementById("todoColumn");
  const weekGrid = document.querySelector(".col-span-7.grid");
  const titleInput = document.getElementById("titleInput");
  const dueInput = document.getElementById("dueInput");
  const priorityInput = document.getElementById("priorityInput");
  const destinationInput = document.getElementById("destinationInput");
  const filter = document.getElementById("filter");
  const clearCompleted = document.getElementById("clearCompleted");
  const printBtn = document.getElementById("printBtn");
  const weekLabel = document.getElementById("weekLabel");
  const template = document.getElementById("taskTemplate");
// ===== Helpers =====
  function genId() { return "t_" + Math.random().toString(36).slice(2, 9); }
  function load() { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  function startOfWeek(date) {
    const d = new Date(date);
    const diff = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function formatDateForColumn(weekStart, dayKey) {
    const idx = DAYS.indexOf(dayKey);
    const d = new Date(weekStart);
    d.setDate(d.getDate() + idx);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
// ===== UI =====
  function createDayCols() {
    weekGrid.innerHTML = "";
    DAYS.forEach(d => {
      const col = document.createElement("div");
      col.className = "bg-white p-3 rounded-lg shadow-sm min-h-[260px] flex flex-col";
      col.dataset.day = d;

      const header = document.createElement("div");
      header.className = "flex items-center justify-between mb-3";
      header.innerHTML = `<div class="text-sm font-semibold">${DAY_LABELS[d]}</div>
                          <div class="text-xs text-gray-500">${formatDateForColumn(currentWeekStart, d)}</div>`;
      col.appendChild(header);

      const container = document.createElement("div");
      container.className = "space-y-3 flex-1";
      container.dataset.container = d;
      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("drop", handleDrop);
      col.appendChild(container);

      weekGrid.appendChild(col);
    });
    updateWeekLabel();
  }

  function updateWeekLabel() {
    const start = currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weekLabel.textContent = `Week: ${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;
  }

  function clearAllColumns() {
    todoColumn.innerHTML = "";
    document.querySelectorAll("[data-container]").forEach(c => c.innerHTML = "");
  }

  function render() {
    clearAllColumns();
    const f = filter.value;
    const list = tasks.slice().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pr = { high: 0, medium: 1, low: 2 };
      if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
      if (a.due && b.due) return new Date(a.due) - new Date(b.due);
      return 0;
    });

    list.forEach(t => {
      if (f === "pending" && t.completed) return;
      if (f === "completed" && !t.completed) return;
      const el = createTaskElement(t);
      const container = t.day === "todo" ? todoColumn : document.querySelector(`[data-container="${t.day}"]`);
      container?.appendChild(el);
    });
  }

  function createTaskElement(task) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector("article");
    article.dataset.id = task.id;
    if (task.completed) article.classList.add("opacity-60", "line-through");

    node.querySelector(".taskTitle").textContent = task.title;
    let metaText = task.priority ? `${capitalize(task.priority)} priority` : "";
    if (task.due) metaText += (metaText ? " · " : "") + `Due ${new Date(task.due).toLocaleDateString()}`;
    node.querySelector(".taskMeta").textContent = metaText;
    // drag events
    article.addEventListener("dragstart", ev => {
      draggedId = task.id;
      article.classList.add("dragging");
      ev.dataTransfer.effectAllowed = "move";
    });
    article.addEventListener("dragend", () => {
      draggedId = null;
      article.classList.remove("dragging");
    });

    return node;
  }

  // ===== Drag & Drop =====
  function handleDragOver(ev) { ev.preventDefault(); ev.dataTransfer.dropEffect = "move"; }
  function handleDrop(ev) {
    ev.preventDefault();
    const dest = this.dataset.container;
    const idx = tasks.findIndex(t => t.id === draggedId);
    if (idx !== -1) { tasks[idx].day = dest; save(); render(); }
  }

  // ===== Actions =====
  function addTaskFromForm() {
    const title = titleInput.value.trim();
    if (!title) return;
    tasks.push({
      id: genId(),
      title,
      due: dueInput.value || null,
      priority: priorityInput.value || "medium",
      day: destinationInput.value || "todo",
      completed: false
    });
    save(); render();
    titleInput.value = ""; dueInput.value = ""; priorityInput.value = "medium";
  }

  function toggleComplete(id) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.completed = !t.completed; save(); render(); }
  }

  function openEditPrompt(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const newTitle = prompt("Edit title", t.title);
    if (newTitle !== null) t.title = newTitle.trim() || t.title;
    const newDue = prompt("Edit due date (YYYY-MM-DD)", t.due || "");
    if (newDue !== null) t.due = newDue.trim() || null;
    const newPriority = prompt("Priority (low, medium, high)", t.priority);
    if (newPriority && ["low","medium","high"].includes(newPriority.toLowerCase())) t.priority = newPriority.toLowerCase();
    save(); render();
  }

  function clearCompletedTasks() {
    if (confirm("Remove all completed tasks?")) {
      tasks = tasks.filter(t => !t.completed);
      save(); render();
    }
  }

  // ===== Init =====
  function seedIfEmpty() {
    if (tasks.length) return;
    tasks = [
      { id: genId(), title: "Plan Monday meeting", due: null, priority: "high", day: "mon", completed: false },
      { id: genId(), title: "Finish module homework", due: null, priority: "medium", day: "wed", completed: false },
      { id: genId(), title: "Grocery list", due: null, priority: "low", day: "todo", completed: false },
      { id: genId(), title: "Review PRs", due: null, priority: "high", day: "fri", completed: false },
    ];
    save();
  }

  function init() {
    destinationInput.innerHTML = '<option value="todo">To-Do</option>' + DAYS.map(d => `<option value="${d}">${DAY_LABELS[d]}</option>`).join("");
    createDayCols();
    load(); seedIfEmpty(); render();
  }

  // Event bindings
  document.getElementById("addBtn").addEventListener("click", addTaskFromForm);
  clearCompleted.addEventListener("click", clearCompletedTasks);
  filter.addEventListener("change", render);
  document.getElementById("prevWeek").addEventListener("click", () => { currentWeekStart.setDate(currentWeekStart.getDate()-7); createDayCols(); render(); });
  document.getElementById("nextWeek").addEventListener("click", () => { currentWeekStart.setDate(currentWeekStart.getDate()+7); createDayCols(); render(); });
  printBtn.addEventListener("click", () => window.print());

  init();
})();
