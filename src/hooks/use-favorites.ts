import { useState, useEffect, useCallback } from "react";

type FavType = "card" | "voucher" | "guide" | "banking";

function getKey(type: FavType) { return `cardperks_favs_${type}`; }

function loadFavs(type: FavType): Set<string> {
  try {
    const raw = localStorage.getItem(getKey(type));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export function useFavorites(type: FavType) {
  const [favs, setFavs] = useState<Set<string>>(() => loadFavs(type));

  useEffect(() => {
    localStorage.setItem(getKey(type), JSON.stringify([...favs]));
  }, [favs, type]);

  const toggle = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const isFav = useCallback((id: string) => favs.has(id), [favs]);
  const count = favs.size;
  return { toggle, isFav, count };
}
