import { useState, useEffect } from "react";

/**
 * Returns `true` for at least `minMs` milliseconds, then `false`.
 * Use to show skeleton loaders with a minimum display time.
 * Set to 0 for instant rendering of static/local data.
 */
export function useMinLoading(minMs = 0) {
  const [loading, setLoading] = useState(minMs > 0);

  useEffect(() => {
    if (minMs <= 0) return;
    const timer = setTimeout(() => setLoading(false), minMs);
    return () => clearTimeout(timer);
  }, [minMs]);

  return loading;
}
