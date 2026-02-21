import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Toast from "../components/Toast";
import GlassCard from "../components/layout/GlassCard";
import LayoutShell from "../components/layout/LayoutShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LanguageSwitch from "../components/ui/LanguageSwitch";
import Select from "../components/ui/Select";
import ThemeToggle from "../components/ui/ThemeToggle";
import useToast from "../hooks/useToast";
import { api } from "../lib/api";
import { USER_TOKEN_STORAGE_KEY } from "../lib/storage";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  day: "21",
  month: "2",
  year: "2026",
  gender: "male"
};

const SOCIAL_SHORTCUTS = ["G", "f", "t", "GH"];

function buildRange(from, to) {
  const size = to - from + 1;
  return Array.from({ length: size }, (_, index) => from + index);
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, showToast] = useToast(2300);

  useEffect(() => {
    document.title = isRegister ? t("meta.register") : t("meta.login");
  }, [isRegister, t, i18n.language]);

  const years = useMemo(() => buildRange(1985, 2026).reverse(), []);
  const months = useMemo(() => buildRange(1, 12), []);
  const days = useMemo(() => buildRange(1, 31), []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const hasRequiredData = isRegister
      ? form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.password
      : form.email.trim() && form.password;

    if (!hasRequiredData) {
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
    <LayoutShell centered>
      <GlassCard className="mx-auto max-w-5xl overflow-hidden border-white/30 p-0">
        <div className="grid min-h-[680px] lg:grid-cols-[1.1fr_0.9fr]">
          <aside className="relative hidden overflow-hidden border-r border-white/15 bg-white/12 p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -top-24 end-[-90px] h-72 w-72 rounded-full bg-white/20" />
            <div className="absolute start-12 top-20 h-8 w-8 rounded-full bg-orange-400/80 shadow-lg shadow-orange-500/40" />
            <div className="absolute end-16 top-36 h-4 w-4 rounded-full bg-yellow-300/80" />
            <div className="absolute bottom-24 start-20 h-6 w-6 rounded-full bg-lime-400/75" />

            <div className="relative z-10 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{t("brand.name")}</p>
              <div className="glass-card grid min-h-[360px] place-items-center bg-white/8 p-8">
                <div className="space-y-4 text-center">
                  <div className="mx-auto h-28 w-40 rounded-3xl border border-white/30 bg-white/20" />
                  <div className="text-5xl">💻</div>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-center text-2xl font-semibold leading-snug text-white">
              {t("auth.leftMessageTop")}
              <br />
              {t("auth.leftMessageBottom")}
            </p>
          </aside>

          <section className="flex flex-col bg-[#2f45c6]/70 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link className="text-base font-semibold text-white/90 hover:text-white" to="/products">
                {t("brand.name")}
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitch />
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-8 space-y-2 border-b border-white/30 pb-4">
              <h1 className="text-4xl font-extrabold text-white">
                {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
              </h1>
              <p className="text-white/80">
                {isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                <div className="text-end text-sm text-white/85">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {t("auth.forgotPassword")}
                  </a>
                </div>
              ) : null}

              {isRegister ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white/85">{t("auth.dateOfBirth")}</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Select onChange={(event) => setField("day", event.target.value)} value={form.day}>
                        {days.map((day) => (
                          <option key={`day-${day}`} value={String(day)}>
                            {day}
                          </option>
                        ))}
                      </Select>
                      <Select onChange={(event) => setField("month", event.target.value)} value={form.month}>
                        {months.map((month) => (
                          <option key={`month-${month}`} value={String(month)}>
                            {month}
                          </option>
                        ))}
                      </Select>
                      <Select onChange={(event) => setField("year", event.target.value)} value={form.year}>
                        {years.map((year) => (
                          <option key={`year-${year}`} value={String(year)}>
                            {year}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white/85">{t("auth.gender")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["male", "female"].map((gender) => (
                        <button
                          className={`surface-field text-start ${
                            form.gender === gender ? "border-cyan-200/90 bg-white/20" : ""
                          }`}
                          key={gender}
                          onClick={() => setField("gender", gender)}
                          type="button"
                        >
                          {t(`auth.${gender}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-white/78">
                    {t("auth.termsPrefix")}{" "}
                    <strong>{t("auth.termsService")}</strong> {t("auth.termsConnector")}{" "}
                    <strong>{t("auth.termsPrivacy")}</strong> {t("auth.termsSuffix")}
                  </p>
                </div>
              ) : null}

              <Button className="w-full" disabled={isSubmitting} type="submit" variant="primary">
                {isRegister ? t("auth.registerButton") : t("auth.loginButton")}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-3">
              {SOCIAL_SHORTCUTS.map((item) => (
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/20 text-sm font-semibold text-white"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 border-t border-white/30 pt-5">
              <Button className="w-full" to={isRegister ? "/login" : "/register"} variant="secondary">
                {isRegister ? t("auth.switchToLogin") : t("auth.switchToRegister")}
              </Button>
            </div>
          </section>
        </div>
      </GlassCard>

      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
