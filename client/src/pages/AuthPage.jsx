import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/ba2i3-logo.svg";
import LayoutShell from "../components/layout/LayoutShell";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LanguageSwitch from "../components/ui/LanguageSwitch";
import ThemeToggle from "../components/ui/ThemeToggle";
import SocialLinks from "../components/ui/SocialLinks";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { api } from "../lib/api";
import { USER_TOKEN_STORAGE_KEY } from "../lib/storage";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, showToast] = useToast(2200);

  useEffect(() => {
    document.title = isRegister ? t("meta.register") : t("meta.login");
  }, [isRegister, t, i18n.language]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const requiredOk = isRegister
      ? form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.password
      : form.email.trim() && form.password;

    if (!requiredOk) {
      showToast(t("auth.missingFields"));
      return;
    }

    const payload = isRegister
      ? {
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email.trim(),
          password: form.password
        }
      : {
          email: form.email.trim(),
          password: form.password
        };

    setIsSubmitting(true);
    try {
      const response = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (typeof window !== "undefined" && response?.token) {
        window.localStorage.setItem(USER_TOKEN_STORAGE_KEY, response.token);
      }

      showToast(isRegister ? t("auth.registerSuccess") : t("auth.loginSuccess"));
      setTimeout(() => navigate("/products"), 600);
    } catch (error) {
      showToast(error.message || t("auth.requestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LayoutShell>
      <Container className="flex min-h-screen items-center justify-center py-8">
        <section className="surface-card w-full max-w-lg p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-2">
            <Link className="text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100" to="/products">
              ← {t("actions.back")}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>

          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <img alt="ba2i3 logo" className="h-20 w-auto object-contain sm:h-24" src={logo} />
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
              {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  onChange={(event) => setField("firstName", event.target.value)}
                  placeholder={t("auth.firstName")}
                  value={form.firstName}
                />
                <Input
                  onChange={(event) => setField("lastName", event.target.value)}
                  placeholder={t("auth.lastName")}
                  value={form.lastName}
                />
              </div>
            ) : null}

            <Input
              onChange={(event) => setField("email", event.target.value)}
              placeholder={t("auth.email")}
              type="email"
              value={form.email}
            />
            <Input
              onChange={(event) => setField("password", event.target.value)}
              placeholder={t("auth.password")}
              type="password"
              value={form.password}
            />

            {!isRegister ? (
              <div className="text-end text-sm">
                <a
                  className="text-slate-500 transition hover:text-accent-700 dark:text-slate-400 dark:hover:text-accent-300"
                  href="#"
                  onClick={(event) => event.preventDefault()}
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit" variant="primary">
              {isRegister ? t("auth.registerButton") : t("auth.loginButton")}
            </Button>
          </form>

          <SocialLinks className="mt-6" />

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRegister ? t("auth.switchToLogin") : t("auth.switchToRegister")}{" "}
            <Link
              className="font-bold text-accent-700 hover:text-accent-800 dark:text-accent-300 dark:hover:text-accent-200"
              to={isRegister ? "/login" : "/register"}
            >
              {isRegister ? t("auth.loginButton") : t("auth.registerButton")}
            </Link>
          </div>
        </section>
      </Container>

      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
