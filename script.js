/* ═══════════════════════════════════════════════
   Weekly To-Do — script.js
   Auth tiers:
     guest  → today only       (1 day)
     user   → today + 2 days   (3 days)
     admin  → today + 29 days  (30 days)
═══════════════════════════════════════════════ */

/* ── CONSTANTS ── */

const DAY_SHORT  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const MONTH_NAME = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TIER_LIMITS = { guest: 1, user: 3, admin: 30 };

/* ── BUILT-IN ACCOUNTS ── */

const BUILTIN = [
  { username: "suta",  password: "admin123", role: "admin" },
];

/* ── SESSION ── */

function getRole()     { return localStorage.getItem("wl_role")     || null; }
function getUsername() { return localStorage.getItem("wl_username") || "guest"; }

function getDayLimit() {
  return TIER_LIMITS[getRole()] ?? 1;
}

function getDataKey() {
  return `weeklyTodo_${getUsername()}`;
}

/* ── DATA ── */

let data       = {};
let weekOffset = 0;

function loadData() {
  data = JSON.parse(localStorage.getItem(getDataKey()) || "{}");
}

function persist() {
  localStorage.setItem(getDataKey(), JSON.stringify(data));
}

/* ── REGISTERED USERS (localStorage) ── */

function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem("wl_users") || "[]");
}

function saveRegisteredUsers(arr) {
  localStorage.setItem("wl_users", JSON.stringify(arr));
}

function findAccount(username, password) {
  const builtin = BUILTIN.find(a => a.username === username && a.password === password);
  if (builtin) return builtin;
  return getRegisteredUsers().find(a => a.username === username && a.password === password) || null;
}

function usernameExists(username) {
  const all = [...BUILTIN, ...getRegisteredUsers()];
  return all.some(a => a.username.toLowerCase() === username.toLowerCase());
}

/* ── GUEST EXPIRY (data cleared on new day) ── */

function checkGuestExpiry() {
  if (getRole() !== "guest") return;
  const loginDate = localStorage.getItem("wl_loginDate");
  const today = todayKey();
  if (loginDate && loginDate !== today) {
    localStorage.removeItem(`weeklyTodo_guest`);
    localStorage.setItem("wl_loginDate", today);
    data = {};
  }
}

/* ── AUTH ACTIONS ── */

function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");

  if (!username || !password) {
    errEl.textContent = "ユーザー名とパスワードを入力してください。";
    return;
  }

  const found = findAccount(username, password);
  if (!found) {
    errEl.textContent = "ユーザー名またはパスワードが違います。";
    return;
  }

  localStorage.setItem("wl_role",     found.role);
  localStorage.setItem("wl_username", found.username);
  localStorage.removeItem("wl_loginDate");
  enterApp();
}

function loginAsGuest() {
  localStorage.setItem("wl_role",      "guest");
  localStorage.setItem("wl_username",  "guest");
  localStorage.setItem("wl_loginDate", todayKey());
  enterApp();
}

function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirm").value;
  const errEl    = document.getElementById("registerError");

  if (!username)           { errEl.textContent = "ユーザー名を入力してください。";    return; }
  if (password.length < 6) { errEl.textContent = "パスワードは6文字以上にしてください。"; return; }
  if (password !== confirm) { errEl.textContent = "パスワードが一致しません。";         return; }
  if (usernameExists(username)) { errEl.textContent = "このユーザー名は既に使われています。"; return; }

  const users = getRegisteredUsers();
  users.push({ username, password, role: "user" });
  saveRegisteredUsers(users);

  localStorage.setItem("wl_role",     "user");
  localStorage.setItem("wl_username", username);
  localStorage.removeItem("wl_loginDate");
  enterApp();
}

function logout() {
  localStorage.removeItem("wl_role");
  localStorage.removeItem("wl_username");
  localStorage.removeItem("wl_loginDate");
  weekOffset = 0;
  data = {};
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
  // Reset forms
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").textContent = "";
  showLogin();
}

/* ── AUTH PANEL TOGGLES ── */

function showLogin() {
  document.getElementById("loginPanel").classList.remove("hidden");
  document.getElementById("registerPanel").classList.add("hidden");
}

function showRegister() {
  document.getElementById("loginPanel").classList.add("hidden");
  document.getElementById("registerPanel").classList.remove("hidden");
}

function handleAuthKey(e, type) {
  if (e.key === "Enter") { type === "login" ? login() : register(); }
}

/* ── ENTER APP ── */

function enterApp() {
  checkGuestExpiry();
  loadData();
  renderUserChip();

  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");

  weekOffset = 0;
  render();
}

function renderUserChip() {
  const role     = getRole();
  const username = getUsername();

  const avatarEl = document.getElementById("userAvatar");
  const nameEl   = document.getElementById("userName");
  const badgeEl  = document.getElementById("tierBadge");

  avatarEl.textContent  = username[0].toUpperCase();
  nameEl.textContent    = username;

  const labels = { guest: "GUEST", user: "FREE", admin: "PRO" };
  badgeEl.textContent   = labels[role] || "FREE";
  badgeEl.className     = `user-tier-badge ${role}`;
}

/* ── WEEK HELPERS ── */

function getMonday(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(offset = weekOffset) {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);
  const mon  = getMonday(base);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toKey(date) { return date.toISOString().slice(0, 10); }
function todayKey()  { return toKey(new Date()); }

/* ── LOCKED DAY CHECK ── */

function isDayLocked(dateKey) {
  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const target  = new Date(dateKey + "T00:00:00");
  const daysDiff = Math.round((target - today) / 86400000);
  if (daysDiff < 0)  return false;              // past: always accessible
  return daysDiff >= getDayLimit();             // future beyond limit: locked
}

/* ── NAVIGATION ── */

function canGoForward() {
  const limit  = getDayLimit();
  const nextWeekDates = getWeekDates(weekOffset + 1);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  return nextWeekDates.some(d => {
    const diff = Math.round((d - today) / 86400000);
    return diff >= 0 && diff < limit;
  });
}

function changeWeek(dir) {
  if (dir > 0 && !canGoForward()) return;
  weekOffset += dir;
  render();
}

function goToday() {
  weekOffset = 0;
  render();
}

/* ── RENDER BOARD ── */

function render() {
  const dates = getWeekDates();
  const today = todayKey();
  const board = document.getElementById("board");
  board.innerHTML = "";

  // Week label
  const first = dates[0], last = dates[6];
  const sameMonth = first.getMonth() === last.getMonth();
  document.getElementById("weekLabel").textContent = sameMonth
    ? `${first.getDate()} – ${last.getDate()} ${MONTH_NAME[first.getMonth()]} ${first.getFullYear()}`
    : `${first.getDate()} ${MONTH_NAME[first.getMonth()]} – ${last.getDate()} ${MONTH_NAME[last.getMonth()]} ${last.getFullYear()}`;

  document.getElementById("todayBtn").disabled    = weekOffset === 0;
  document.getElementById("nextWeekBtn").disabled = !canGoForward();

  dates.forEach((date, i) => {
    const key      = toKey(date);
    const isToday  = key === today;
    const isPast   = key < today;
    const isLocked = isDayLocked(key);

    const col = document.createElement("div");
    col.className = [
      "day-col",
      isToday  ? "today"  : "",
      isPast && !isToday ? "past" : "",
      isLocked ? "locked" : "",
    ].filter(Boolean).join(" ");
    col.id = `col-${key}`;

    // Header
    col.innerHTML = `
      <div class="day-header">
        <span class="day-name">${DAY_SHORT[i]}</span>
        <span class="day-num">${date.getDate()}</span>
        ${isToday ? '<span class="today-badge">Today</span>' : ""}
        ${isLocked ? '<span class="lock-icon-sm">🔒</span>' : ""}
      </div>
    `;

    if (isLocked) {
      // Locked: show upgrade prompt, no task input
      const role = getRole();
      const lockMsg = role === "guest"
        ? "Freeプランで<br>3日間解放"
        : "Proプランで<br>最大30日解放";

      col.innerHTML += `
        <div class="task-list" id="tasks-${key}"></div>
        <div class="locked-body">
          <div class="locked-icon">🔒</div>
          <div class="locked-msg">${lockMsg}</div>
        </div>
      `;
    } else {
      col.innerHTML += `
        <div class="task-list" id="tasks-${key}"></div>
        <div class="add-area" id="add-area-${key}">
          <button class="add-btn" onclick="showInput('${key}')">＋ Add task</button>
          <div class="add-input-wrap" id="input-wrap-${key}">
            <input
              type="text"
              id="input-${key}"
              placeholder="Type and press Enter…"
              onkeydown="handleKey(event, '${key}')"
            />
          </div>
        </div>
      `;
    }

    board.appendChild(col);
    renderTasks(key);
  });

  updateProgress();
}

/* ── RENDER TASKS ── */

function renderTasks(key) {
  const container = document.getElementById(`tasks-${key}`);
  if (!container) return;

  const tasks = data[key] || [];
  container.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = `task-item${task.done ? " done" : ""}`;
    item.id = `task-${task.id}`;

    item.innerHTML = `
      <button class="task-check${task.done ? " checked" : ""}"
              onclick="toggleTask('${key}', ${task.id})">${task.done ? "✓" : ""}</button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="task-del" onclick="deleteTask('${key}', ${task.id})" title="Delete">×</button>
    `;
    container.appendChild(item);
  });
}

/* ── ADD INPUT UX ── */

function showInput(key) {
  const btn  = document.querySelector(`#add-area-${key} .add-btn`);
  const wrap = document.getElementById(`input-wrap-${key}`);
  const inp  = document.getElementById(`input-${key}`);
  btn.style.display  = "none";
  wrap.style.display = "block";
  inp.focus();
  inp.onblur = () => setTimeout(() => saveInput(key), 120);
}

function saveInput(key) {
  const inp  = document.getElementById(`input-${key}`);
  const wrap = document.getElementById(`input-wrap-${key}`);
  const btn  = document.querySelector(`#add-area-${key} .add-btn`);
  if (!inp) return;

  const text = inp.value.trim();
  if (text) {
    if (!data[key]) data[key] = [];
    data[key].push({ id: Date.now(), text, done: false });
    persist();
    inp.value = "";
    renderTasks(key);
    updateProgress();
  }
  wrap.style.display = "none";
  btn.style.display  = "flex";
}

function handleKey(e, key) {
  if (e.key === "Enter")  { e.preventDefault(); saveInput(key); }
  if (e.key === "Escape") { cancelInput(key); }
}

function cancelInput(key) {
  const inp  = document.getElementById(`input-${key}`);
  const wrap = document.getElementById(`input-wrap-${key}`);
  const btn  = document.querySelector(`#add-area-${key} .add-btn`);
  if (inp)  inp.value = "";
  if (wrap) wrap.style.display = "none";
  if (btn)  btn.style.display  = "flex";
}

/* ── TOGGLE DONE ── */

function toggleTask(key, id) {
  const arr  = data[key];
  if (!arr) return;
  const task = arr.find((t) => t.id === id);
  if (!task) return;

  task.done = !task.done;
  persist();

  const item  = document.getElementById(`task-${id}`);
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
  updateProgress();
}

/* ── DELETE ── */

function deleteTask(key, id) {
  const item = document.getElementById(`task-${id}`);
  if (item) {
    item.classList.add("removing");
    setTimeout(() => {
      data[key] = (data[key] || []).filter((t) => t.id !== id);
      persist();
      renderTasks(key);
      updateProgress();
    }, 200);
  }
}

/* ── PROGRESS (only unlocked days) ── */

function updateProgress() {
  const dates = getWeekDates();
  let total = 0, done = 0;

  dates.forEach((d) => {
    const key = toKey(d);
    if (isDayLocked(key)) return; // skip locked days
    const tasks = data[key] || [];
    total += tasks.length;
    done  += tasks.filter((t) => t.done).length;
  });

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById("progressLabel").textContent = `${done} / ${total} done`;
  document.getElementById("progressFill").style.width  = pct + "%";
}

/* ── UTIL ── */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── INIT ── */

window.addEventListener("DOMContentLoaded", () => {
  if (getRole()) {
    enterApp();
  }
  // Otherwise auth screen is shown by default (no extra code needed)
});
