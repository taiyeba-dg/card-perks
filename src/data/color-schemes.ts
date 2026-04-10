/**
 * Color Schemes — Centralized color definitions
 *
 * Single source of truth for brand colors, portal colors, and chart palettes.
 *
 * Replaces hardcoded colors scattered across:
 * - FamilyBankingContent.tsx / MobileBankingLayout.tsx (bank colors)
 * - DesktopVouchersLayout.tsx (portal colors)
 * - MyCardsMobile.tsx / MyCardsDesktop.tsx (chart palettes)
 * - DistributionDonut.tsx (donut colors)
 */

// ─── Bank Brand Colors ──────────────────────────────────────────────────

export const BANK_COLORS: Record<string, string> = {
  hdfc: "#003D8F",
  icici: "#F58220",
  axis: "#97144D",
  kotak: "#ED1C24",
  sbi: "#0033A0",
  amex: "#006FCF",
  "au-bank": "#EC6608",
  bob: "#F15A29",
  federal: "#003DA5",
  hsbc: "#DB0011",
  idfc: "#9C1D26",
  indusind: "#174B8B",
  rbl: "#21409A",
  sc: "#0072AA",
  "yes-bank": "#0066B3",
  onecard: "#000000",
  cred: "#1A1A2E",
  jupiter: "#7C3AED",
  scapia: "#FF5722",
  slice: "#6366F1",
};

// ─── Portal Brand Colors ────────────────────────────────────────────────

export const PORTAL_COLORS: Record<string, string> = {
  "HDFC SmartBuy": "#004B8D",
  Gyftr: "#004B8D",
  "Axis Edge Rewards": "#6B2FA0",
  "Axis GRAB DEALS": "#6B2FA0",
  "ICICI Rewards": "#F37920",
  iShop: "#F37920",
  "ICICI Pockets": "#F37920",
  "SBI Rewardz": "#1A5276",
  "Kotak Rewards": "#ED1C24",
  Maximize: "#333333",
  Magnify: "#555555",
  MagicPin: "#E91E63",
  SaveSage: "#666666",
  "Tata Neu": "#5C2D91",
};

// ─── Chart Color Palettes ───────────────────────────────────────────────

/** General-purpose pie chart palette (8 colors) */
export const PIE_COLORS = [
  "#D4AF37", "#276EF1", "#E23744", "#F97316",
  "#006838", "#9333EA", "#10B981", "#EC4899",
] as const;

/** Gold-toned donut chart palette (10 colors) */
export const DONUT_COLORS = [
  "#D4AF37", "#C49B2F", "#8B7536", "#A89254", "#6B8E6B",
  "#5B7B8F", "#8B6BB5", "#B56B8B", "#6BB5A8", "#B5A86B",
] as const;

/** Stack optimizer distribution palette (5 colors) */
export const OPTIMIZER_COLORS = [
  "hsl(43, 55%, 56%)", "#6366f1", "#ec4899", "#14b8a6", "#f97316",
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────

/** Get bank color by bank ID, falls back to neutral gray */
export function getBankColor(bankId: string): string {
  return BANK_COLORS[bankId] ?? "#6B7280";
}

/** Get portal color by portal name, falls back to neutral gray */
export function getPortalColor(portalName: string): string {
  return PORTAL_COLORS[portalName] ?? "#6B7280";
}

/** Get a color from the pie palette by index (wraps around) */
export function getPieColor(index: number): string {
  return PIE_COLORS[index % PIE_COLORS.length];
}

/** Get a color from the donut palette by index (wraps around) */
export function getDonutColor(index: number): string {
  return DONUT_COLORS[index % DONUT_COLORS.length];
}
