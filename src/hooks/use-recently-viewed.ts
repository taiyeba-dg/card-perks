import { useCallback, useEffect, useState } from "react";

export type RecentItem = {
  id: string;
  type: "card" | "voucher";
  name: string;
  image?: string;
  color: string;
  href: string;
  viewedAt: number;
};

const KEY = "cardperks_recently_viewed";
const MAX = 5;

function load(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: RecentItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

/** Call `record(item)` on any page to push it to the recents list (deduped, capped at 5). */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>(load);

  // Keep localStorage in sync
  useEffect(() => {
    save(items);
  }, [items]);

  const record = useCallback((item: Omit<RecentItem, "viewedAt">) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  return { items, record };
}
