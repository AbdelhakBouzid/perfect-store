export function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function formatPrice(value, language = "en") {
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(money(value));
}
