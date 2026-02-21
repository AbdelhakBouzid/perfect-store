import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";

export default function PolicyPage({ policyKey }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("meta.policy");
  }, [t, i18n.language]);

  return (
    <SiteLayout>
      <Container>
        <section className="surface-card mx-auto max-w-3xl space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {t(`policy.${policyKey}.title`)}
          </h1>
          <p className="leading-7 text-slate-600 dark:text-slate-300">{t(`policy.${policyKey}.body`)}</p>
          <Button to="/products" variant="secondary">
            {t("policy.back")}
          </Button>
        </section>
      </Container>
    </SiteLayout>
  );
}
