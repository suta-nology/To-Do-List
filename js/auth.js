/* ═══════════════════════════════════════
   AUTH.JS — Login, Register, Session
═══════════════════════════════════════ */

/* guest & free (user) = today only (1 day)
   premium & admin      = 30 days ahead       */
const TIER_LIMITS = { guest: 1, user: 1, premium: 30, admin: 30 };

const BUILTIN_ACCOUNTS = [
  { username: "suta",    password: "admin123",   role: "admin"   },
  { username: "premium", password: "premium123", role: "premium" },
];

/* ── Session ── */

function getRole()     { return localStorage.getItem("wl_role")     || null; }
function getUsername() { return localStorage.getItem("wl_username") || "guest"; }
function getDayLimit() { return TIER_LIMITS[getRole()] ?? 1; }

function setSession(role, username) {
  localStorage.setItem("wl_role",     role);
  localStorage.setItem("wl_username", username);
}

function clearSession() {
  localStorage.removeItem("wl_role");
  localStorage.removeItem("wl_username");
  localStorage.removeItem("wl_loginDate");
}

/* ── Registered users (localStorage) ── */

function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem("wl_users") || "[]");
}

function saveRegisteredUsers(arr) {
  localStorage.setItem("wl_users", JSON.stringify(arr));
}

function findAccount(username, password) {
  const b = BUILTIN_ACCOUNTS.find(a => a.username === username && a.password === password);
  if (b) return b;
  return getRegisteredUsers().find(a => a.username === username && a.password === password) || null;
}

function usernameExists(username) {
  return [...BUILTIN_ACCOUNTS, ...getRegisteredUsers()]
    .some(a => a.username.toLowerCase() === username.toLowerCase());
}

/* ── Login (index.html) ── */

function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");

  if (!username || !password) {
    errEl.textContent = t("errEmpty");
    return;
  }

  const found = findAccount(username, password);
  if (!found) {
    errEl.textContent = t("errWrong");
    return;
  }

  setSession(found.role, found.username);
  window.location.href = "app.html";
}

function loginAsGuest() {
  setSession("guest", "guest");
  localStorage.setItem("wl_loginDate", new Date().toISOString().slice(0, 10));
  window.location.href = "app.html";
}

function handleLoginKey(e) {
  if (e.key === "Enter") login();
}

/* ── Register (register.html) ── */

function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirm").value;
  const errEl    = document.getElementById("registerError");

  if (!username)            { errEl.textContent = t("errNameReq");  return; }
  if (password.length < 6) { errEl.textContent = t("errShort");    return; }
  if (password !== confirm) { errEl.textContent = t("errMismatch"); return; }
  if (usernameExists(username)) { errEl.textContent = t("errTaken"); return; }

  const users = getRegisteredUsers();
  users.push({ username, password, role: "user" });
  saveRegisteredUsers(users);

  setSession("user", username);
  window.location.href = "app.html";
}

function handleRegisterKey(e) {
  if (e.key === "Enter") register();
}

/* ── Logout (app.html) ── */

function logout() {
  clearSession();
  window.location.href = "index.html";
}

/* ── Guest expiry check (app.html) ── */

function checkGuestExpiry() {
  if (getRole() !== "guest") return;
  const loginDate = localStorage.getItem("wl_loginDate");
  const today     = new Date().toISOString().slice(0, 10);
  if (loginDate && loginDate !== today) {
    localStorage.removeItem("weeklyTodo_guest");
    localStorage.setItem("wl_loginDate", today);
  }
}

/* ── Page guards ── */

function guardApp() {
  if (!getRole()) { window.location.href = "index.html"; return false; }
  return true;
}

function redirectIfLoggedIn() {
  if (getRole()) { window.location.href = "app.html"; return true; }
  return false;
}
