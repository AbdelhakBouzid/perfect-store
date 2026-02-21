import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/ba2i3-logo.svg";
import useCart from "../../hooks/useCart";
import { CART_STORAGE_KEY } from "../../lib/storage";
import Button from "../ui/Button";
import LanguageSwitch from "../ui/LanguageSwitch";
import ThemeToggle from "../ui/ThemeToggle";
import Container from "./Container";

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-accent-600 text-white"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        }`
      }
      onClick={onClick}
      to={to}
    >
      {children}
    </NavLink>
  );
}

function IconRoute({ to, emoji, label, badge }) {
  return (
    <Link
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-lg text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      to={to}
      title={label}
    >
      <span>{emoji}</span>
      {badge > 0 ? (
        <span className="absolute -end-1 -top-1 min-w-[18px] rounded-full bg-accent-600 px-1.5 text-center text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Navbar({ onOpenContact }) {
  const { t } = useTranslation();
  const { count } = useCart(CART_STORAGE_KEY);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-3" to="/products">
            <img alt="ba2i3 logo" className="h-12 w-auto object-contain sm:h-14" src={logo} />
            <div className="hidden sm:block">
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-50">{t("brand.name")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("brand.tagline")}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <NavItem to="/products">{t("nav.products")}</NavItem>
            <NavItem to="/login">{t("nav.login")}</NavItem>
            <NavItem to="/register">{t("nav.register")}</NavItem>
            <NavItem to="/admin">{t("nav.admin")}</NavItem>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <IconRoute badge={count} emoji="🛒" label={t("nav.cart")} to="/checkout" />
            <IconRoute emoji="👤" label={t("nav.profile")} to="/profile" />
            <IconRoute emoji="⚙️" label={t("nav.settings")} to="/settings" />
            <Button onClick={onOpenContact} size="sm" type="button" variant="secondary">
              {t("contact.button")}
            </Button>
            <LanguageSwitch />
            <ThemeToggle />
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              <NavItem onClick={closeMobileMenu} to="/products">
                {t("nav.products")}
              </NavItem>
              <NavItem onClick={closeMobileMenu} to="/login">
                {t("nav.login")}
              </NavItem>
              <NavItem onClick={closeMobileMenu} to="/register">
                {t("nav.register")}
              </NavItem>
              <NavItem onClick={closeMobileMenu} to="/admin">
                {t("nav.admin")}
              </NavItem>
            </div>

            <div className="flex items-center gap-2">
              <IconRoute badge={count} emoji="🛒" label={t("nav.cart")} to="/checkout" />
              <IconRoute emoji="👤" label={t("nav.profile")} to="/profile" />
              <IconRoute emoji="⚙️" label={t("nav.settings")} to="/settings" />
              <Button
                className="flex-1"
                onClick={() => {
                  closeMobileMenu();
                  onOpenContact?.();
                }}
                size="sm"
                type="button"
                variant="secondary"
              >
                {t("contact.button")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
