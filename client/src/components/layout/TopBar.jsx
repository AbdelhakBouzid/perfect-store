import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import LanguageSwitch from "../ui/LanguageSwitch";
import ThemeToggle from "../ui/ThemeToggle";

export default function TopBar({ buyNowTo = "/products", showBuyNow = true, links = [], cartCount = 0 }) {
  const { t } = useTranslation();

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="flex items-center gap-3" to="/products">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/30 bg-white/20 text-sm font-bold">
            PS
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-white">{t("brand.name")}</p>
            <p className="text-xs text-white/70">{t("brand.tagline")}</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {showBuyNow ? (
            <Button to={buyNowTo} variant="secondary">
              {t("actions.buyNow")}
            </Button>
          ) : null}
          <span className="rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-xs text-white/85">
            {cartCount}
          </span>
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </div>

      {links.length ? (
        <nav className="flex flex-wrap items-center gap-2 border-t border-white/15 pt-4">
          {links.map((item) => (
            <Button key={item.to} size="sm" to={item.to} variant="ghost">
              {item.label}
            </Button>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
