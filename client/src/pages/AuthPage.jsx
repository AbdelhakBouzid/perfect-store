import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { api } from "../lib/api";
import { LANGUAGE_STORAGE_KEY, USER_TOKEN_STORAGE_KEY } from "../lib/storage";
import "../styles/auth.css";

const TRANSLATIONS = {
  en: {
    login: "Sign in",
    register: "Sign up",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    success: "Success",
    missing: "Missing fields",
    altLogin: "Or Sign in",
    altRegister: "Or Sign up"
  },
  fr: {
    login: "Connexion",
    register: "Creer un compte",
    fullName: "Nom complet",
    email: "Email",
    password: "Mot de passe",
    forgot: "Mot de passe oublie ?",
    success: "Succes",
    missing: "Champs manquants",
    altLogin: "Ou se connecter",
    altRegister: "Ou creer un compte"
  },
  ar: {
    login: "Sign in",
    register: "Sign up",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    success: "Success",
    missing: "Missing fields",
    altLogin: "Or Sign in",
    altRegister: "Or Sign up"
  }
};

function readInitialLanguage() {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [lang, setLang] = useState(readInitialLanguage);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, showToast] = useToast(1800);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = isRegister ? "Register - Perfect Store" : "Login - Perfect Store";
  }, [lang, isRegister]);

  function changeLang(nextLang) {
    setLang(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password || (isRegister && !fullName.trim())) {
      showToast(t.missing);
      return;
    }

    const payload = isRegister
      ? { fullName: fullName.trim(), email: email.trim(), password }
      : { email: email.trim(), password };

    try {
      const response = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_TOKEN_STORAGE_KEY, response.token);
      }

      showToast(t.success);
      setTimeout(() => navigate("/"), 700);
    } catch (error) {
      showToast(error.message || "Request failed");
    }
  }

  return (
    <>
      <main className="auth-layout">
        <section className="brand-panel">
          <div className="brand-copy">Share the Knowledge, Spread the Fun with SupShare</div>
        </section>

        <section className="form-panel">
          <div className="form-shell">
            <h1 className="form-title">{isRegister ? t.register : t.login}</h1>

            <form onSubmit={handleSubmit}>
              {isRegister ? (
                <input
                  className="input-field"
                  placeholder={t.fullName}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              ) : null}

              <input
                className="input-field"
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="input-field"
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {!isRegister ? (
                <div className="forgot-pass">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {t.forgot}
                  </a>
                </div>
              ) : null}

              <button className="input-submit" type="submit">
                {isRegister ? t.register : t.login}
              </button>

              <Link className="input-submit secondary" to={isRegister ? "/login" : "/register"}>
                {isRegister ? t.altLogin : t.altRegister}
              </Link>
            </form>
          </div>

          <nav className="mini-footer">
            <a href="#" onClick={(event) => { event.preventDefault(); changeLang("en"); }}>
              English(UK)
            </a>
            <a href="#" onClick={(event) => { event.preventDefault(); changeLang("fr"); }}>
              Francais(FR)
            </a>
            <a href="#" onClick={(event) => { event.preventDefault(); changeLang("ar"); }}>
              Arabic
            </a>
          </nav>
        </section>
      </main>

      <Toast message={toastMessage} />
    </>
  );
}

