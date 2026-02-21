import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Button from "./Button";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const icon = theme === "dark" ? "☀️" : "🌙";
  const label = theme === "dark" ? t("theme.light") : t("theme.dark");

  return (
    <Button
      aria-label={label}
      className="min-w-[84px]"
      onClick={toggleTheme}
      size="sm"
      title={label}
      variant="ghost"
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
