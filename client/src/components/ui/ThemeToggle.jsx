import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Button from "./Button";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? t("theme.light") : t("theme.dark");

  return (
    <Button className="min-w-[76px]" onClick={toggleTheme} size="sm" variant="ghost">
      {label}
    </Button>
  );
}
