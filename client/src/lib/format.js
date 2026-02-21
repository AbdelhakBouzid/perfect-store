export function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

