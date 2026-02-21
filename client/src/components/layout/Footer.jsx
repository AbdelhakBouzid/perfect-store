import { useTranslation } from "react-i18next";

const FOOTER_LINKS = ["privacy", "terms", "contact", "refund"];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-8 border-t border-white/20 pt-5">
      <nav className="flex flex-wrap items-center gap-4 text-sm text-white/80">
        {FOOTER_LINKS.map((key) => (
          <a
            key={key}
            className="transition hover:text-white"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            {t(`footer.${key}`)}
          </a>
        ))}
      </nav>
      <p className="mt-3 text-xs text-white/60">
        {new Date().getFullYear()} {t("brand.name")} - {t("footer.rights")}
      </p>
    </footer>
  );
}
