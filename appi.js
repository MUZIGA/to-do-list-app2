
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
