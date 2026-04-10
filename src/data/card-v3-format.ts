// Formatting utilities for CardPerks V3 unified data
// Reuses formatCur from fee-utils for Indian number formatting.

import { formatCur } from "@/lib/fee-utils";

import type {
  FeesV3,
  ForexV3,
  LoungeAccessDetailV3,
  LoungeAccessV3,
} from "./card-v3-unified-types";

// ---------------------------------------------------------------------------
// formatBaseRate
// ---------------------------------------------------------------------------
// Rate is already in the 0-100 range (3.3 means 3.3%). Returns "3.3% value".
// Handles 0 -> "0%", null/undefined -> "N/A".

export function formatBaseRate(rate: number | null | undefined): string {
  if (rate == null) return "N/A";
  if (rate === 0) return "0%";
  return `${rate}% value`;
}

// ---------------------------------------------------------------------------
// formatLoungeVisits
// ---------------------------------------------------------------------------
// Extracts a short label from the domestic lounge field.
// The field can be a plain string (batch data) or a LoungeAccessDetailV3 object.
// Returns "Unlimited", "8/quarter", "4/year", "None", etc.

export function formatLoungeVisits(
  lounge: LoungeAccessV3["domestic"] | null | undefined,
): string {
  if (lounge == null) return "None";

  // If it's a structured object, prefer the explicit fields
  if (typeof lounge === "object") {
    const detail = lounge as LoungeAccessDetailV3;
    if (detail.unlimited) return "Unlimited";
    if (detail.visitsPerQuarter != null) return `${detail.visitsPerQuarter}/quarter`;
    if (detail.visitsPerYear != null) return `${detail.visitsPerYear}/year`;
    // Fall through to text parsing on the visits string
    if (detail.visits) return parseLoungeString(detail.visits);
    return "None";
  }

  // Plain string from batch data e.g. "4 per year (1 per quarter)", "Unlimited", "None"
  return parseLoungeString(lounge);
}

function parseLoungeString(text: string): string {
  if (!text) return "None";

  const lower = text.toLowerCase().trim();
  if (lower === "none" || lower === "not available" || lower === "n/a") return "None";
  if (lower.includes("unlimited")) return "Unlimited";

  // Try to extract "N per quarter" pattern
  const quarterMatch = lower.match(/(\d+)\s*(?:per|\/)\s*quarter/);
  if (quarterMatch) return `${quarterMatch[1]}/quarter`;

  // Try to extract "N per year" pattern
  const yearMatch = lower.match(/(\d+)\s*(?:per|\/)\s*year/);
  if (yearMatch) return `${yearMatch[1]}/year`;

  // "N/year" already in the text like "16/year" from parenthetical
  const parentheticalYear = lower.match(/\((\d+)\/year\)/);
  if (parentheticalYear) return `${parentheticalYear[1]}/year`;

  // Fallback: try leading number + "per" pattern  e.g. "2 per quarter (requires ...)"
  const leadingNum = lower.match(/^(\d+)\s+per\s+(\w+)/);
  if (leadingNum) return `${leadingNum[1]}/${leadingNum[2]}`;

  // If we found a bare number at the start, assume per year
  const bareNum = lower.match(/^(\d+)/);
  if (bareNum) return `${bareNum[1]}/year`;

  return text;
}

// ---------------------------------------------------------------------------
// formatForex
// ---------------------------------------------------------------------------
// Returns the markupText or text field directly, or "N/A" if missing.
// If zeroMarkup is true, returns "0%".

export function formatForex(forex: ForexV3 | null | undefined): string {
  if (forex == null) return "N/A";
  if (forex.zeroMarkup) return "0%";
  if (forex.markup === 0) return "0%";
  if (forex.markupText) return forex.markupText;
  if (forex.text) return forex.text;
  if (forex.effectiveMarkupText) return forex.effectiveMarkupText;

  // If we only have the numeric markup, format it
  if (forex.markup != null) {
    // markup is 0-1 range (0.035 = 3.5%)
    const pct = forex.markup < 1 ? forex.markup * 100 : forex.markup;
    return `${pct}%`;
  }

  return "N/A";
}

// ---------------------------------------------------------------------------
// formatIncome
// ---------------------------------------------------------------------------
// Formats income in lakhs: 300000 -> "₹3L+/year", 1500000 -> "₹15L+/year"

export function formatIncome(income: number | null | undefined): string {
  if (income == null || income === 0) return "N/A";
  const lakhs = income / 100000;
  // Avoid decimals for whole-lakh values
  const formatted = lakhs % 1 === 0 ? lakhs.toString() : lakhs.toFixed(1);
  return `₹${formatted}L+/year`;
}

// ---------------------------------------------------------------------------
// formatTier
// ---------------------------------------------------------------------------
// Converts tier slugs to display names.

const TIER_MAP: Record<string, string> = {
  "entry": "Entry",
  "mid-range": "Mid Range",
  "semi-premium": "Semi Premium",
  "premium": "Premium",
  "super-premium": "Super Premium",
  "ultra-premium": "Ultra Premium",
  "co-branded": "Co-branded",
  "cashback": "Cashback",
  "points": "Points",
};

export function formatTier(tier: string | null | undefined): string {
  if (!tier) return "N/A";
  if (TIER_MAP[tier]) return TIER_MAP[tier];
  // Fallback: capitalize words and replace hyphens with spaces
  return tier
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// formatFeeDisplay
// ---------------------------------------------------------------------------
// Returns a formatted INR string for the annual fee.
// If annual is 0, returns "₹0 (Free)". Otherwise uses formatCur from fee-utils.

export function formatFeeDisplay(fees: FeesV3 | null | undefined): string {
  if (fees == null) return "N/A";
  if (fees.annual === 0) return "₹0 (Free)";
  return formatCur(fees.annual);
}
