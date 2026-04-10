import { type CreditCard } from "@/data/cards";

function parseNumeric(val: string): number | null {
  const match = val.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

const comparableFields: Record<string, "lowest" | "highest"> = {
  fee: "lowest", forexMarkup: "lowest", rewards: "highest", rating: "highest",
};

export function getWinner(field: string, selectedCards: CreditCard[]): string | null {
  const direction = comparableFields[field];
  if (!direction || selectedCards.length < 2) return null;
  let bestId: string | null = null;
  let bestVal: number | null = null;
  for (const card of selectedCards) {
    const raw = field === "rating" ? String(card.rating) : String(card[field as keyof CreditCard]);
    const num = parseNumeric(raw);
    if (num === null) continue;
    if (bestVal === null || (direction === "lowest" && num < bestVal) || (direction === "highest" && num > bestVal)) {
      bestVal = num; bestId = card.id;
    }
  }
  const allSame = selectedCards.every((c) => {
    const raw = field === "rating" ? String(c.rating) : String(c[field as keyof CreditCard]);
    return parseNumeric(raw) === bestVal;
  });
  return allSame ? null : bestId;
}

export function getWinnerLabel(field: string): string {
  return comparableFields[field] === "lowest" ? "Lowest" : "Best";
}
