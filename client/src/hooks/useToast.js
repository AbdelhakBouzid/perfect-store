import { useEffect, useState } from "react";

export default function useToast(durationMs = 2300) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

  return [message, setMessage];
}

