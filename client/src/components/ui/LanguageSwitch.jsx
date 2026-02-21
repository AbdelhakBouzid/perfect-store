import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitch() {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900">
      {languages.map((item) => {
        const isActive = item === language;
        return (
          <button
            key={item}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-accent-600 text-white dark:bg-accent-500"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
            onClick={() => setLanguage(item)}
            type="button"
          >
            {t(`language.${item}`)}
          </button>
        );
      })}
    </div>
  );
}
