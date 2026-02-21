const SERVER = window.APP_CONFIG?.BACKEND_URL || "http://localhost:5000";
const API = `${SERVER}/api`;
const TOKEN_KEY = "ps_user_token_v1";
const LANG_KEY = "ps_lang_v1";

const submitBtn = document.getElementById("submitBtn");
const toastEl = document.getElementById("toast");
const langEn = document.getElementById("langEn");
const langFr = document.getElementById("langFr");
const langAr = document.getElementById("langAr");

const tr = {
  en: {
    login: "Sign in",
    register: "Sign up",
    ok: "Success"
  },
  fr: {
    login: "Connexion",
    register: "Créer un compte",
    ok: "Succès"
  },
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    ok: "تم بنجاح"
  }
};

let lang = localStorage.getItem(LANG_KEY) || "en";
applyLang();

if (langEn) langEn.addEventListener("click", (e) => setLang(e, "en"));
if (langFr) langFr.addEventListener("click", (e) => setLang(e, "fr"));
if (langAr) langAr.addEventListener("click", (e) => setLang(e, "ar"));
if (submitBtn) submitBtn.addEventListener("click", handleSubmit);

function setLang(e, nextLang) {
  e.preventDefault();
  lang = nextLang;
  localStorage.setItem(LANG_KEY, lang);
  applyLang();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((n) => {
    n.textContent = tr[lang][n.dataset.i18n] || n.textContent;
  });
}

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.hidden = false;
  setTimeout(() => {
    toastEl.hidden = true;
  }, 1800);
}

async function handleSubmit() {
  const mode = submitBtn?.dataset.mode;
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  if (!mode || !email || !password) return toast("Missing fields");

  const payload = mode === "register"
    ? { fullName: document.getElementById("fullName")?.value.trim(), email, password }
    : { email, password };

  const res = await fetch(`${API}/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) return toast(data.error || "Request failed");

  localStorage.setItem(TOKEN_KEY, data.token);
  toast(tr[lang].ok);
  setTimeout(() => {
    window.location.href = "./index.html";
  }, 700);
}
