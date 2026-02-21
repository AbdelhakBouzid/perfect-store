import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("meta.profile");
  }, [t, i18n.language]);

  return (
    <SiteLayout>
      <Container>
        <section className="surface-card mx-auto max-w-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t("profile.title")}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t("profile.subtitle")}</p>
        </section>
      </Container>
    </SiteLayout>
  );
}
