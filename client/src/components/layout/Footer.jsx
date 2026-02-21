import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "./Container";

const POLICY_LINKS = [
  { key: "privacyPolicy", to: "/privacy-policy" },
  { key: "termsOfService", to: "/terms-of-service" },
  { key: "refundPolicy", to: "/refund-policy" },
  { key: "shippingPolicy", to: "/shipping-policy" }
];

const SOCIAL_LINKS = [
  { key: "facebook", label: "f", href: "https://www.facebook.com/share/17qjZ7UTwD/" },
  {
    key: "instagram",
    label: "◉",
    href: "https://www.instagram.com/ba2i3.store?igsh=OTV0dXV4cnBndGp1"
  }
];

export default function Footer({ onOpenContact }) {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/85 py-8 dark:border-slate-800 dark:bg-slate-950/75">
      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {POLICY_LINKS.map((item) => (
            <Link
              className="text-sm font-semibold text-slate-600 transition hover:text-accent-700 dark:text-slate-300 dark:hover:text-accent-300"
              key={item.to}
              to={item.to}
            >
              {t(`footer.${item.key}`)}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={onOpenContact}
            type="button"
          >
            {t("contact.button")}
          </button>
          {SOCIAL_LINKS.map((item) => (
            <a
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              href={item.href}
              key={item.key}
              rel="noreferrer"
              target="_blank"
            >
              {item.label}
            </a>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {new Date().getFullYear()} {t("brand.name")} · {t("footer.rights")}
        </p>
      </Container>
    </footer>
  );
}
