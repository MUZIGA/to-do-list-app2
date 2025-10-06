
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
