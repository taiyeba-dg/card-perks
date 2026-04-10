import { BEST_FOR_CATEGORIES, type BestForCategoryDef } from "./best-for-categories";

// -- Bento Grid Layout Mapping --
export interface BentoTile {
  category: BestForCategoryDef;
  gridArea: string;      // CSS grid-area name
  colSpan: number;       // Grid column span
  rowSpan: number;       // Grid row span
}

export function getBentoLayout(): BentoTile[] {
  const sorted = [...BEST_FOR_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.map((cat, i) => {
    if (cat.tileSize === "hero" || cat.tileSize === "large") {
      return { category: cat, gridArea: `tile-${i}`, colSpan: 2, rowSpan: 1 };
    }
    if (cat.tileSize === "medium") {
      return { category: cat, gridArea: `tile-${i}`, colSpan: 1, rowSpan: 1 };
    }
    return { category: cat, gridArea: `tile-${i}`, colSpan: 1, rowSpan: 1 };
  });
}

// -- Seasonal Featured Logic --
export function getSeasonalFeaturedCategories(count: number = 3): BestForCategoryDef[] {
  const month = new Date().getMonth() + 1;
  return BEST_FOR_CATEGORIES
    .filter((c) => c.seasonalMonths.includes(month))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, count);
}

// -- Cross-Category Winners --
// Given leaderboard results, find cards that rank #1 in multiple categories
export function findMultiCategoryWinners(
  leaderboards: Record<string, { cardId: string; cardName: string; rate: number }[]>
): { cardId: string; cardName: string; categories: string[]; avgRate: number }[] {
  const cardMap = new Map<string, { name: string; categories: string[]; rates: number[] }>();

  for (const [slug, entries] of Object.entries(leaderboards)) {
    if (entries.length > 0) {
      const top = entries[0];
      const existing = cardMap.get(top.cardId) || { name: top.cardName, categories: [], rates: [] };
      existing.categories.push(slug);
      existing.rates.push(top.rate);
      cardMap.set(top.cardId, existing);
    }
  }

  return Array.from(cardMap.entries())
    .filter(([, data]) => data.categories.length > 1)
    .map(([cardId, data]) => ({
      cardId,
      cardName: data.name,
      categories: data.categories,
      avgRate: data.rates.reduce((a, b) => a + b, 0) / data.rates.length,
    }))
    .sort((a, b) => b.categories.length - a.categories.length);
}
