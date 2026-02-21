const rawApiUrl = String(import.meta.env.VITE_API_URL || "").trim();

export const API_BASE_URL = (rawApiUrl || "http://localhost:5000").replace(/\/+$/, "");
export const API_URL = `${API_BASE_URL}/api`;

export function toAbsoluteUploadUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).startsWith("/") ? String(path) : `/${String(path)}`;
  return `${API_BASE_URL}${normalized}`;
}

