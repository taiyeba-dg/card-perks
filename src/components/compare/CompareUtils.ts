import type { CreditCard } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";
import { getMasterCard } from "@/data/card-v3-master";

export interface CompareCard {
  card: CreditCard;
  v3: CardV3Data | null;
}

export function getCompareCards(selected: CreditCard[]): CompareCard[] {
  return selected.map((card) => ({ card, v3: getMasterCard(card.id)?.enrichment ?? null }));
}

// Winner logic: returns card id of winner, null if tied
export function findWinner(
  values: { cardId: string; value: number }[],
  direction: "highest" | "lowest"
): string | null {
  if (values.length < 2) return null;
  const sorted = [...values].sort((a, b) =>
    direction === "highest" ? b.value - a.value : a.value - b.value
  );
  if (sorted[0].value === sorted[1].value) return null; // tie
  return sorted[0].cardId;
}

export function parseFee(fee: string): number {
  return parseInt(fee.replace(/[₹,]/g, "")) || 0;
}

export function parsePercent(s: string): number {
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function parseIncome(s: string): number {
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function formatCurrency(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// Count wins across all tabs for verdict
export function countWins(
  compareCards: CompareCard[],
  metrics: { values: { cardId: string; value: number }[]; direction: "highest" | "lowest" }[]
): Record<string, number> {
  const wins: Record<string, number> = {};
  compareCards.forEach((cc) => (wins[cc.card.id] = 0));
  metrics.forEach(({ values, direction }) => {
    const w = findWinner(values, direction);
    if (w) wins[w] = (wins[w] || 0) + 1;
  });
  return wins;
}
