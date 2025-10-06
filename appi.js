
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
