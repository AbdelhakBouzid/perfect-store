import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitch() {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="flex items-center rounded-xl border border-white/20 bg-black/20 p-1">
      {languages.map((item) => {
        const isActive = item === language;
        return (
          <button
            key={item}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              isActive ? "bg-white/25 text-white" : "text-white/70 hover:text-white"
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
