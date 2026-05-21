/* ═══════════════════════════════════════
   AUTH.JS — Mirailist · Firebase Auth
═══════════════════════════════════════ */

const TIER_LIMITS = { guest: 1, user: 1, premium: 30, admin: 30 };

/* ── Session helpers (localStorage cache) ── */

function getRole()     { return localStorage.getItem("ml_role")     || null; }
function getUsername() { return localStorage.getItem("ml_username") || "guest"; }
function getDayLimit() { return TIER_LIMITS[getRole()] ?? 1; }

function setSession(role, username, uid) {
  localStorage.setItem("ml_role",     role);
  localStorage.setItem("ml_username", username);
  if (uid) localStorage.setItem("ml_uid", uid);
}

function clearSession() {
  ["ml_role","ml_username","ml_uid","ml_loginDate"].forEach(k => localStorage.removeItem(k));
}

/* ── Firebase helpers ── */

function _emailFromUsername(username) {
  return username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") + "@mirailist.app";
}

async function _lookupEmail(username) {
  try {
    const doc = await _db.collection("usernames").doc(username.toLowerCase()).get();
    if (doc.exists) return doc.data().email;
  } catch (_) {}
  return _emailFromUsername(username);
}

async function _syncUserFromFirestore(uid) {
  try {
    const doc  = await _db.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    const data = doc.data();
    setSession(data.role || "user", data.username || "user", uid);
    return data;
  } catch (e) {
    console.warn("Firestore sync failed:", e.message);
    return null;
  }
}

/* ── Login (index.html) ── */

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");

  if (!username || !password) { errEl.textContent = t("errEmpty"); return; }

  const btn = document.querySelector(".auth-btn-primary");
  if (btn) btn.disabled = true;

  try {
    const email = await _lookupEmail(username);
    const cred  = await _auth.signInWithEmailAndPassword(email, password);
    await _syncUserFromFirestore(cred.user.uid);
    window.location.href = "app.html";
  } catch (e) {
    errEl.textContent = t("errWrong");
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ── Guest login ── */

async function loginAsGuest() {
  try { await _auth.signInAnonymously(); } catch (_) {}
  setSession("guest", "guest", null);
  localStorage.setItem("ml_loginDate", new Date().toISOString().slice(0, 10));
  window.location.href = "app.html";
}

function handleLoginKey(e) { if (e.key === "Enter") login(); }

/* ── Register (register.html) ── */

async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirm").value;
  const errEl    = document.getElementById("registerError");

  if (!username)             { errEl.textContent = t("errNameReq");  return; }
  if (password.length < 6)  { errEl.textContent = t("errShort");    return; }
  if (password !== confirm)  { errEl.textContent = t("errMismatch"); return; }

  const btn = document.querySelector(".auth-btn-primary");
  if (btn) btn.disabled = true;

  try {
    // Check username uniqueness in Firestore
    const taken = await _db.collection("usernames").doc(username.toLowerCase()).get();
    if (taken.exists) { errEl.textContent = t("errTaken"); if (btn) btn.disabled = false; return; }

    const email = _emailFromUsername(username);
    const cred  = await _auth.createUserWithEmailAndPassword(email, password);
    const uid   = cred.user.uid;

    // Save user profile
    await _db.collection("users").doc(uid).set({
      username,
      email,
      role:      "user",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Username lookup index
    await _db.collection("usernames").doc(username.toLowerCase()).set({ uid, email });

    setSession("user", username, uid);
    window.location.href = "app.html";
  } catch (e) {
    errEl.textContent = e.code === "auth/email-already-in-use" ? t("errTaken") : t("errWrong");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function handleRegisterKey(e) { if (e.key === "Enter") register(); }

/* ── Logout (app.html) ── */

async function logout() {
  try { await _auth.signOut(); } catch (_) {}
  clearSession();
  window.location.href = "index.html";
}

/* ── Guest expiry check ── */

function checkGuestExpiry() {
  if (getRole() !== "guest") return;
  const loginDate = localStorage.getItem("ml_loginDate");
  const today     = new Date().toISOString().slice(0, 10);
  if (loginDate && loginDate !== today) {
    localStorage.removeItem("weeklyTodo_guest");
    localStorage.setItem("ml_loginDate", today);
  }
}

/* ── Page guards ── */

function guardApp() {
  if (!getRole()) { window.location.href = "index.html"; return false; }

  // Firebase Auth state listener — re-sync from Firestore (prevents tampering)
  if (typeof _auth !== "undefined") {
    _auth.onAuthStateChanged(async (user) => {
      if (user && !user.isAnonymous) {
        await _syncUserFromFirestore(user.uid);
      } else if (!user && getRole() !== "guest") {
        clearSession();
        window.location.href = "index.html";
      }
    });
  }
  return true;
}

function redirectIfLoggedIn() {
  if (getRole()) { window.location.href = "app.html"; return true; }

  // Also listen to Firebase session
  if (typeof _auth !== "undefined") {
    _auth.onAuthStateChanged((user) => {
      if (user) { window.location.href = "app.html"; }
    });
  }
  return false;
}
