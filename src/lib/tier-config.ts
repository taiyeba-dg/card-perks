/**
 * Shared tier configuration — single source of truth for card tier labels and colors.
 * Colors reference CSS custom properties defined in index.css.
 */

export interface TierInfo {
  label: string;
  /** Full hsl color, e.g. "hsl(var(--tier-entry))" */
  color: string;
  /** Raw CSS variable name, e.g. "--tier-entry" — use for alpha: `hsl(var(${cssVar}) / 0.1)` */
  cssVar: string;
}

export const TIER_CONFIG: Record<string, TierInfo> = {
  entry:           { label: "Entry",         color: "hsl(var(--tier-entry))",         cssVar: "--tier-entry" },
  "mid-range":     { label: "Mid Range",     color: "hsl(var(--tier-mid-range))",     cssVar: "--tier-mid-range" },
  "semi-premium":  { label: "Semi Premium",  color: "hsl(var(--tier-semi-premium))",  cssVar: "--tier-semi-premium" },
  premium:         { label: "Premium",       color: "hsl(var(--tier-premium))",       cssVar: "--tier-premium" },
  "super-premium": { label: "Super Premium", color: "hsl(var(--tier-super-premium))", cssVar: "--tier-super-premium" },
  "ultra-premium": { label: "Ultra Premium", color: "hsl(var(--tier-ultra-premium))", cssVar: "--tier-ultra-premium" },
  "co-branded":    { label: "Co-branded",    color: "hsl(var(--tier-co-branded))",    cssVar: "--tier-co-branded" },
  cashback:        { label: "Cashback",      color: "hsl(var(--tier-cashback))",      cssVar: "--tier-cashback" },
  points:          { label: "Points",        color: "hsl(var(--tier-points))",        cssVar: "--tier-points" },
};

export const TIER_ORDER = [
  "entry", "cashback", "co-branded", "mid-range",
  "semi-premium", "premium", "super-premium", "ultra-premium", "points",
];

/** Returns an HSL color string for the given tier key. */
export function getTierColor(tier: string): string {
  return TIER_CONFIG[tier]?.color ?? TIER_CONFIG.entry.color;
}
