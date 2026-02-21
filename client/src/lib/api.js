import { API_URL } from "./config";

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message = data && data.error ? data.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function api(path, options = {}) {
  return requestJson(`${API_URL}${path}`, options);
}

