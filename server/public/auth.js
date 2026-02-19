const SERVER = window.APP_CONFIG?.BACKEND_URL || "http://localhost:5000";
const API = `${SERVER}/api`;
const TOKEN_KEY = "ps_user_token_v1";
const LANG_KEY = "ps_lang_v1";
const langEl = document.getElementById("lang");
const submitBtn = document.getElementById("submitBtn");
const toastEl = document.getElementById("toast");

const tr={en:{login:"Login",register:"Register",noAccount:"Create account",hasAccount:"Already have an account?",ok:"Success"},fr:{login:"Connexion",register:"Inscription",noAccount:"Créer un compte",hasAccount:"Vous avez déjà un compte ?",ok:"Succès"},ar:{login:"تسجيل الدخول",register:"إنشاء حساب",noAccount:"أنشئ حساباً",hasAccount:"لديك حساب؟",ok:"تم بنجاح"}};
let lang=localStorage.getItem(LANG_KEY)||"en";
langEl.value=lang; applyLang();
langEl.addEventListener("change",()=>{lang=langEl.value;localStorage.setItem(LANG_KEY,lang);applyLang();});
submitBtn.addEventListener("click",handleSubmit);

function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.querySelectorAll("[data-i18n]").forEach(n=>n.textContent=tr[lang][n.dataset.i18n]||n.textContent);}
function toast(msg){toastEl.textContent=msg;toastEl.hidden=false;setTimeout(()=>toastEl.hidden=true,1800);}

async function handleSubmit(){
  const mode = submitBtn.dataset.mode;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if(!email || !password) return toast("Missing fields");

  const payload = mode === "register"
    ? { fullName: document.getElementById("fullName").value.trim(), email, password }
    : { email, password };

  const res = await fetch(`${API}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  const data = await res.json();
  if(!res.ok) return toast(data.error || "Request failed");
  localStorage.setItem(TOKEN_KEY, data.token);
  toast(tr[lang].ok);
  setTimeout(()=>{ window.location.href = "./index.html"; }, 700);
}
