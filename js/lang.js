/* ═══════════════════════════════════════════════
   LANG.JS — Japanese / Indonesian / English
   Usage: t("key")  →  string for current lang
          applyLang()  →  update [data-i18n] DOM
          switchLang("en")  →  save + apply + re-render
═══════════════════════════════════════════════ */

const LANG = {

  /* ── JAPANESE ── */
  ja: {
    /* Auth pages */
    appTitle:       "Mirailist",
    appSub:         "未来を、一歩ずつ。",
    loginHeading:   "ログイン",
    loginBtn:       "ログイン",
    guestBtn:       "👤 ゲストとして入る",
    noAccount:      "アカウントをお持ちでない方は",
    registerLink:   "新規登録 →",
    registerHeading:"新規登録",
    registerBtn:    "アカウント作成",
    backToLogin:    "← ログインに戻る",
    usernamePh:     "ユーザー名",
    passwordPh:     "パスワード",
    password6Ph:    "パスワード（6文字以上）",
    confirmPh:      "パスワード確認",
    /* Errors */
    errEmpty:       "ユーザー名とパスワードを入力してください。",
    errWrong:       "ユーザー名またはパスワードが違います。",
    errNameReq:     "ユーザー名を入力してください。",
    errShort:       "パスワードは6文字以上にしてください。",
    errMismatch:    "パスワードが一致しません。",
    errTaken:       "このユーザー名は既に使われています。",
    /* Tier compare */
    tierGuestLabel: "ゲスト",
    tierFreeLabel:  "Free",
    tierProLabel:   "Premium / Admin",
    tierGuestDays:  "今日のみ",
    tierFreeDays:   "今日のみ",
    tierProDays:    "最大30日間",
    /* App header */
    logoutBtn:      "ログアウト",
    todayLabel:     "今日",
    /* Tier badges */
    badgeGuest:     "GUEST",
    badgeFree:      "FREE",
    badgePro:       "PRO",
    badgeAdmin:     "ADMIN",
    /* Calendar */
    calMonths:      ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    calDow:         ["月","火","水","木","金","土","日"],
    calPrev:        "‹",
    calNext:        "›",
    /* Day panel */
    panelEmpty:     "この日のタスクはありません",
    addTaskPh:      "タスクを入力…",
    addTaskBtn:     "追加",
    sheetCancel:    "キャンセル",
    lockedMsg:      "アップグレードでこの日を解放",
    /* Progress */
    progressText:   (d, t) => `${d} / ${t} 完了`,
  },

  /* ── INDONESIAN ── */
  id: {
    appTitle:       "Mirailist",
    appSub:         "Rencanakan masa depanmu, satu tugas dalam satu waktu.",
    loginHeading:   "Masuk",
    loginBtn:       "Masuk",
    guestBtn:       "👤 Masuk sebagai Tamu",
    noAccount:      "Belum punya akun?",
    registerLink:   "Daftar →",
    registerHeading:"Daftar Akun",
    registerBtn:    "Buat Akun",
    backToLogin:    "← Kembali ke Login",
    usernamePh:     "Nama pengguna",
    passwordPh:     "Kata sandi",
    password6Ph:    "Kata sandi (min. 6 karakter)",
    confirmPh:      "Konfirmasi kata sandi",
    errEmpty:       "Masukkan nama pengguna dan kata sandi.",
    errWrong:       "Nama pengguna atau kata sandi salah.",
    errNameReq:     "Masukkan nama pengguna.",
    errShort:       "Kata sandi minimal 6 karakter.",
    errMismatch:    "Kata sandi tidak cocok.",
    errTaken:       "Nama pengguna sudah dipakai.",
    tierGuestLabel: "Tamu",
    tierFreeLabel:  "Gratis",
    tierProLabel:   "Premium / Admin",
    tierGuestDays:  "Hari ini saja",
    tierFreeDays:   "Hari ini saja",
    tierProDays:    "Maks. 30 hari",
    logoutBtn:      "Keluar",
    todayLabel:     "Hari Ini",
    badgeGuest:     "TAMU",
    badgeFree:      "GRATIS",
    badgePro:       "PRO",
    badgeAdmin:     "ADMIN",
    calMonths:      ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
    calDow:         ["Sen","Sel","Rab","Kam","Jum","Sab","Min"],
    calPrev:        "‹",
    calNext:        "›",
    panelEmpty:     "Belum ada tugas untuk hari ini",
    addTaskPh:      "Ketik tugas…",
    addTaskBtn:     "Tambah",
    sheetCancel:    "Batal",
    lockedMsg:      "Upgrade untuk membuka hari ini",
    progressText:   (d, t) => `${d} / ${t} selesai`,
  },

  /* ── ENGLISH ── */
  en: {
    appTitle:       "Mirailist",
    appSub:         "Your future, one task at a time.",
    loginHeading:   "Sign In",
    loginBtn:       "Sign In",
    guestBtn:       "👤 Continue as Guest",
    noAccount:      "Don't have an account?",
    registerLink:   "Register →",
    registerHeading:"Create Account",
    registerBtn:    "Create Account",
    backToLogin:    "← Back to Sign In",
    usernamePh:     "Username",
    passwordPh:     "Password",
    password6Ph:    "Password (min. 6 characters)",
    confirmPh:      "Confirm password",
    errEmpty:       "Please enter your username and password.",
    errWrong:       "Incorrect username or password.",
    errNameReq:     "Please enter a username.",
    errShort:       "Password must be at least 6 characters.",
    errMismatch:    "Passwords do not match.",
    errTaken:       "That username is already taken.",
    tierGuestLabel: "Guest",
    tierFreeLabel:  "Free",
    tierProLabel:   "Premium / Admin",
    tierGuestDays:  "Today only",
    tierFreeDays:   "Today only",
    tierProDays:    "Up to 30 days",
    logoutBtn:      "Sign Out",
    todayLabel:     "Today",
    badgeGuest:     "GUEST",
    badgeFree:      "FREE",
    badgePro:       "PRO",
    badgeAdmin:     "ADMIN",
    calMonths:      ["January","February","March","April","May","June","July","August","September","October","November","December"],
    calDow:         ["Mo","Tu","We","Th","Fr","Sa","Su"],
    calPrev:        "‹",
    calNext:        "›",
    panelEmpty:     "No tasks for this day",
    addTaskPh:      "Type a task…",
    addTaskBtn:     "Add Task",
    sheetCancel:    "Cancel",
    lockedMsg:      "Upgrade to unlock this day",
    progressText:   (d, tt) => `${d} / ${tt} done`,
  },
};

/* ── Helpers ── */

function getLang()  { return localStorage.getItem("wlLang") || "en"; }
function setLang(l) { localStorage.setItem("wlLang", l); }

function t(key, ...args) {
  const lang = getLang();
  const val  = LANG[lang]?.[key] ?? LANG.en[key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}

function applyLang() {
  const lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = t(el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const val = t(el.dataset.i18nPh);
    if (val !== undefined) el.placeholder = val;
  });
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function switchLang(lang) {
  setLang(lang);
  applyLang();
  if (typeof render === "function") render();
}
