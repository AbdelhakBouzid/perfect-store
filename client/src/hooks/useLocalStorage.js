import { useEffect, useState } from "react";

function readValue(key, initialValue) {
  if (typeof window === "undefined") return initialValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initialValue;
  } catch (_error) {
    return initialValue;
  }
}

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Ignore storage write failures.
    }
  }, [key, value]);

  return [value, setValue];
}

