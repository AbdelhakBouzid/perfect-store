import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import LanguageSwitch from "../components/ui/LanguageSwitch";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("meta.settings");
  }, [t, i18n.language]);

  return (
    <SiteLayout>
      <Container>
        <section className="surface-card mx-auto max-w-2xl space-y-6 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t("settings.title")}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("settings.subtitle")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {t("settings.appearance")}
            </h2>
            <ThemeToggle />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {t("settings.language")}
            </h2>
            <LanguageSwitch />
          </div>
        </section>
      </Container>
    </SiteLayout>
  );
}
