/* ═══════════════════════════════════════════════
   APP.JS — Calendar-based To-Do Board
   Layout: Month calendar grid + Day detail panel
═══════════════════════════════════════════════ */

/* ── State ── */

let data         = {};
let selectedDate = null;     // currently selected day key (YYYY-MM-DD)
let calYear      = 0;
let calMonth     = 0;        // 0-11

/* ── Data per user ── */

function getDataKey() { return `weeklyTodo_${getUsername()}`; }

function loadData() {
  data = JSON.parse(localStorage.getItem(getDataKey()) || "{}");
}

function persist() {
  localStorage.setItem(getDataKey(), JSON.stringify(data));
}

/* ── Date helpers ── */

function toKey(date) { return date.toISOString().slice(0, 10); }

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function keyToDate(key) { return new Date(key + "T00:00:00"); }

/* ── Tier / lock ── */

function isDayLocked(dateKey) {
  const today  = new Date(); today.setHours(0,0,0,0);
  const target = keyToDate(dateKey);
  const diff   = Math.round((target - today) / 86400000);
  if (diff < 0) return false;           // past days: always accessible
  return diff >= getDayLimit();
}

/* ── Calendar grid data ── */

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Convert Sunday (0) to 7 to keep Mon as first column
  let startDow = firstDay.getDay();
  if (startDow === 0) startDow = 7;
  const padBefore = startDow - 1;

  const days = [];
  // Previous month padding
  for (let i = padBefore; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastDate; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Next month padding (fill to complete last row)
  let next = 1;
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false });
  }
  return days;
}

/* ── Month navigation ── */

function canGoNextMonth() {
  const limit          = getDayLimit();
  const nextMonthFirst = new Date(calYear, calMonth + 1, 1);
  const today          = new Date(); today.setHours(0,0,0,0);
  return Math.round((nextMonthFirst - today) / 86400000) < limit;
}

function prevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  // Select today if it's in this month, otherwise first accessible day
  const today = todayKey();
  const d     = keyToDate(today);
  selectedDate = (d.getFullYear() === calYear && d.getMonth() === calMonth)
    ? today
    : toKey(new Date(calYear, calMonth, 1));
  render();
}

function nextMonth() {
  if (!canGoNextMonth()) return;
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  // Select first accessible day of new month
  const days = getCalendarDays(calYear, calMonth);
  const first = days.find(({ date, isCurrentMonth }) => isCurrentMonth && !isDayLocked(toKey(date)));
  selectedDate = first ? toKey(first.date) : selectedDate;
  render();
}

/* ── Main render ── */

function render() {
  renderCalendar();
  renderDayPanel(selectedDate);
  updateProgress();
}

/* ── Calendar grid ── */

function renderCalendar() {
  const grid    = document.getElementById("calGrid");
  const label   = document.getElementById("calMonthLabel");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");

  // Month/year label
  const months = t("calMonths");
  label.textContent = `${months[calMonth]} ${calYear}`;

  // Nav buttons
  prevBtn.textContent = t("calPrev");
  nextBtn.textContent = t("calNext");
  nextBtn.disabled    = !canGoNextMonth();
  nextBtn.title       = nextBtn.disabled ? t("lockedMsg") : "";

  grid.innerHTML = "";

  // Day-of-week headers
  t("calDow").forEach(name => {
    const h = document.createElement("div");
    h.className   = "cal-dow";
    h.textContent = name;
    grid.appendChild(h);
  });

  // Day cells
  const today = todayKey();
  getCalendarDays(calYear, calMonth).forEach(({ date, isCurrentMonth }) => {
    const key       = toKey(date);
    const isToday   = key === today;
    const isLocked  = isDayLocked(key);
    const isSelected = key === selectedDate;
    const tasks     = data[key] || [];
    const done      = tasks.filter(t => t.done).length;

    const cell = document.createElement("div");
    cell.className = [
      "cal-day",
      !isCurrentMonth    ? "other-month" : "",
      isToday            ? "is-today"    : "",
      isLocked           ? "is-locked"   : "",
      isSelected         ? "is-selected" : "",
    ].filter(Boolean).join(" ");
    cell.dataset.key = key;

    // Day number
    const numEl = document.createElement("span");
    numEl.className   = "cal-num";
    numEl.textContent = date.getDate();
    cell.appendChild(numEl);

    if (!isLocked && tasks.length > 0) {
      // Task indicator strip: colored bar at bottom
      const bar = document.createElement("div");
      bar.className = "cal-bar";
      const pct = Math.round((done / tasks.length) * 100);
      bar.style.setProperty("--pct", pct + "%");
      bar.setAttribute("title", `${done}/${tasks.length}`);
      cell.appendChild(bar);

      // Task count badge
      const badge = document.createElement("span");
      badge.className   = "cal-count";
      badge.textContent = tasks.length;
      cell.appendChild(badge);
    }

    if (isLocked) {
      const lockEl = document.createElement("span");
      lockEl.className   = "cal-lock";
      lockEl.textContent = "🔒";
      cell.appendChild(lockEl);
    }

    if (!isLocked) {
      cell.addEventListener("click", () => selectDay(key));
    }

    grid.appendChild(cell);
  });
}

/* ── Select a day ── */

function selectDay(key) {
  if (isDayLocked(key)) return;
  selectedDate = key;
  // Update selected highlight without full re-render
  document.querySelectorAll(".cal-day").forEach(el => {
    el.classList.toggle("is-selected", el.dataset.key === key);
  });
  renderDayPanel(key);
}

/* ── Day detail panel ── */

function renderDayPanel(dateKey) {
  const panel = document.getElementById("dayPanel");
  panel.innerHTML = "";

  if (!dateKey) return;

  const isLocked = isDayLocked(dateKey);
  const date     = keyToDate(dateKey);
  const today    = todayKey();

  // Header
  const months  = t("calMonths");
  const dow     = t("calDow");
  const dowIdx  = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const dateStr = `${dow[dowIdx]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  const header = document.createElement("div");
  header.className = "panel-header";
  header.innerHTML = `
    <span class="panel-datestr">${dateStr}</span>
    ${dateKey === today ? `<span class="panel-today-badge" data-i18n="todayLabel">${t("todayLabel")}</span>` : ""}
  `;
  panel.appendChild(header);

  // Locked state
  if (isLocked) {
    const lockDiv = document.createElement("div");
    lockDiv.className = "panel-locked";
    lockDiv.innerHTML = `<span class="panel-lock-icon">🔒</span><p>${t("lockedMsg")}</p>`;
    panel.appendChild(lockDiv);
    return;
  }

  // Task list
  const tasks   = data[dateKey] || [];
  const listEl  = document.createElement("div");
  listEl.className = "panel-tasks";
  listEl.id        = "panelTaskList";

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className   = "panel-empty";
    empty.textContent = t("panelEmpty");
    listEl.appendChild(empty);
  } else {
    tasks.forEach(task => listEl.appendChild(buildTaskEl(task, dateKey)));
  }
  panel.appendChild(listEl);

  // Add task trigger button → opens notification modal
  const addWrap = document.createElement("div");
  addWrap.className = "panel-add-trigger";
  const addBtn = document.createElement("button");
  addBtn.className   = "panel-add-trigger-btn";
  addBtn.innerHTML   = `<span>＋</span><span>${t("addTaskBtn")}</span>`;
  addBtn.onclick     = () => openTaskModal(dateKey);
  addWrap.appendChild(addBtn);
  panel.appendChild(addWrap);
}

/* ── Build task element ── */

function buildTaskEl(task, dateKey) {
  const item = document.createElement("div");
  item.className = `panel-task${task.done ? " done" : ""}`;
  item.id        = `ptask-${task.id}`;
  item.innerHTML = `
    <button class="task-check${task.done ? " checked" : ""}"
            onclick="toggleTask('${dateKey}',${task.id})">${task.done ? "✓" : ""}</button>
    <span class="task-text">${escapeHtml(task.text)}</span>
    <button class="task-del" onclick="deleteTask('${dateKey}',${task.id})" title="Delete">×</button>
  `;
  return item;
}

/* ── Task Modal (notification bottom-sheet) ── */

let _modalDateKey = null;

function openTaskModal(dateKey) {
  _modalDateKey = dateKey;

  const modal      = document.getElementById("taskModal");
  const dateLabel  = document.getElementById("sheetDateLabel");
  const input      = document.getElementById("sheetInput");
  const cancelBtn  = document.getElementById("sheetCancelBtn");
  const addBtn     = document.getElementById("sheetAddBtn");

  // Update labels for current language
  const date   = keyToDate(dateKey);
  const months = t("calMonths");
  const dow    = t("calDow");
  const dowIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
  dateLabel.textContent = `${dow[dowIdx]}, ${date.getDate()} ${months[date.getMonth()]}`;

  input.placeholder       = t("addTaskPh");
  addBtn.textContent      = t("addTaskBtn");
  cancelBtn.textContent   = t("sheetCancel");
  input.value             = "";

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  setTimeout(() => input.focus(), 180);
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal");
  modal.classList.remove("open");
  document.body.style.overflow = "";
  document.getElementById("sheetInput").value = "";
  _modalDateKey = null;
}

function addFromSheet() {
  const input = document.getElementById("sheetInput");
  const text  = (input?.value || "").trim();
  if (!text || !_modalDateKey) return;

  if (!data[_modalDateKey]) data[_modalDateKey] = [];
  data[_modalDateKey].push({ id: Date.now(), text, done: false });
  persist();

  closeTaskModal();
  renderDayPanel(_modalDateKey);
  updateCalCell(_modalDateKey);
  updateProgress();
}

function handleSheetKey(e) {
  if (e.key === "Enter")  { e.preventDefault(); addFromSheet(); }
  if (e.key === "Escape") closeTaskModal();
}

/* ── Toggle done ── */

function toggleTask(dateKey, id) {
  const task = (data[dateKey] || []).find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  persist();

  // Animate in DOM
  const item  = document.getElementById(`ptask-${id}`);
  const check = item?.querySelector(".task-check");
  const text  = item?.querySelector(".task-text");
  if (item && check && text) {
    check.classList.add("pop");
    setTimeout(() => check.classList.remove("pop"), 220);
    item.classList.toggle("done", task.done);
    check.classList.toggle("checked", task.done);
    check.textContent = task.done ? "✓" : "";
    text.style.textDecoration = task.done ? "line-through" : "";
  }
  updateCalCell(dateKey);
  updateProgress();
}

/* ── Delete task ── */

function deleteTask(dateKey, id) {
  const item = document.getElementById(`ptask-${id}`);
  if (!item) return;
  item.classList.add("removing");
  setTimeout(() => {
    data[dateKey] = (data[dateKey] || []).filter(t => t.id !== id);
    persist();
    renderDayPanel(dateKey);
    updateCalCell(dateKey);
    updateProgress();
  }, 180);
}

/* ── Update just one calendar cell (no full re-render) ── */

function updateCalCell(dateKey) {
  const cell  = document.querySelector(`.cal-day[data-key="${dateKey}"]`);
  if (!cell) return;
  const tasks = data[dateKey] || [];
  const done  = tasks.filter(t => t.done).length;

  // Remove old indicators
  cell.querySelectorAll(".cal-bar, .cal-count").forEach(el => el.remove());

  if (!isDayLocked(dateKey) && tasks.length > 0) {
    const bar   = document.createElement("div");
    bar.className = "cal-bar";
    bar.style.setProperty("--pct", Math.round((done / tasks.length) * 100) + "%");
    bar.setAttribute("title", `${done}/${tasks.length}`);

    const badge = document.createElement("span");
    badge.className   = "cal-count";
    badge.textContent = tasks.length;

    cell.appendChild(bar);
    cell.appendChild(badge);
  }
}

/* ── Progress (current month, accessible days) ── */

function updateProgress() {
  let total = 0, done = 0;
  getCalendarDays(calYear, calMonth).forEach(({ date, isCurrentMonth }) => {
    if (!isCurrentMonth) return;
    const key   = toKey(date);
    if (isDayLocked(key)) return;
    const tasks = data[key] || [];
    total += tasks.length;
    done  += tasks.filter(t => t.done).length;
  });
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById("progressLabel").textContent = t("progressText", done, total);
  document.getElementById("progressFill").style.width  = pct + "%";
}

/* ── User chip ── */

function renderUserChip() {
  const role     = getRole();
  const username = getUsername();
  const badges   = { guest: t("badgeGuest"), user: t("badgeFree"), premium: t("badgePro"), admin: t("badgeAdmin") };

  document.getElementById("userAvatar").textContent = username[0].toUpperCase();
  document.getElementById("userName").textContent   = username;
  const badge = document.getElementById("tierBadge");
  badge.textContent = badges[role] || "FREE";
  badge.className   = `tier-badge ${role}`;
  document.getElementById("logoutBtn").textContent  = t("logoutBtn");
}

/* ── Util ── */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Init ── */

window.addEventListener("DOMContentLoaded", () => {
  if (!guardApp()) return;
  checkGuestExpiry();
  loadData();

  // Init calendar to current month
  const now  = new Date();
  calYear    = now.getFullYear();
  calMonth   = now.getMonth();
  selectedDate = todayKey();

  applyLang();
  renderUserChip();
  render();
});
