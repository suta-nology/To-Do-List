/* ── MIRAILIST FIREBASE INIT ── */

const firebaseConfig = {
  apiKey:            "AIzaSyCFwGjvMpFAn-NjFYXjxFyK3J8rdrHpTWI",
  authDomain:        "mirai-list-f1366.firebaseapp.com",
  projectId:         "mirai-list-f1366",
  storageBucket:     "mirai-list-f1366.firebasestorage.app",
  messagingSenderId: "517643597211",
  appId:             "1:517643597211:web:f9a2519a5893d23b8ddd3e",
};

firebase.initializeApp(firebaseConfig);

const _auth = firebase.auth();
const _db   = firebase.firestore();
