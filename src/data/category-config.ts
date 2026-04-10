/**
 * Category Config — Centralized category definitions
 *
 * Single source of truth for all spending category metadata:
 * icons, display names, colors, V3 key mappings, and chart palettes.
 *
 * Replaces hardcoded category data scattered across:
 * - CategoryRewardsSection.tsx
 * - MyCardsMobile.tsx / MyCardsDesktop.tsx
 * - CardAnalytics.tsx
 * - SpendingStep.tsx
 * - RewardsTab.tsx
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface SpendCategory {
  /** V3 category key used in card-v3-data.ts enrichment */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Emoji icon for lightweight UI */
  emoji: string;
  /** Lucide icon component name (import separately in components) */
  lucideIcon: string;
  /** Brand color hex for charts and badges */
  color: string;
  /** Whether this is a primary (always visible) category */
  isPrimary: boolean;
  /** Sort order for display */
  sortOrder: number;
}

// ─── Master Category List ───────────────────────────────────────────────

export const CATEGORIES: SpendCategory[] = [
  { id: "dining",        displayName: "Dining",          emoji: "🍕", lucideIcon: "UtensilsCrossed", color: "#E23744", isPrimary: true,  sortOrder: 1 },
  { id: "grocery",       displayName: "Grocery",         emoji: "🛒", lucideIcon: "ShoppingCart",    color: "#F97316", isPrimary: true,  sortOrder: 2 },
  { id: "online",        displayName: "Online Shopping", emoji: "🛍️", lucideIcon: "ShoppingBag",     color: "#F8C534", isPrimary: true,  sortOrder: 3 },
  { id: "travel",        displayName: "Travel",          emoji: "✈️", lucideIcon: "Plane",           color: "#276EF1", isPrimary: true,  sortOrder: 4 },
  { id: "fuel",          displayName: "Fuel",            emoji: "⛽", lucideIcon: "Fuel",            color: "#006838", isPrimary: true,  sortOrder: 5 },
  { id: "entertainment", displayName: "Entertainment",   emoji: "🎬", lucideIcon: "Tv",              color: "#9333EA", isPrimary: true,  sortOrder: 6 },
  { id: "utilities",     displayName: "Utilities",       emoji: "🏠", lucideIcon: "Home",            color: "#10B981", isPrimary: false, sortOrder: 7 },
  { id: "pharmacy",      displayName: "Pharmacy",        emoji: "💊", lucideIcon: "Pill",            color: "#EC4899", isPrimary: false, sortOrder: 8 },
  { id: "telecom",       displayName: "Telecom",         emoji: "📱", lucideIcon: "Smartphone",      color: "#06B6D4", isPrimary: false, sortOrder: 9 },
  { id: "education",     displayName: "Education",       emoji: "🏫", lucideIcon: "GraduationCap",   color: "#8B5CF6", isPrimary: false, sortOrder: 10 },
  { id: "rent",          displayName: "Rent",            emoji: "₹",  lucideIcon: "Banknote",        color: "#EF4444", isPrimary: false, sortOrder: 11 },
  { id: "base",          displayName: "Others / Base",   emoji: "💳", lucideIcon: "CreditCard",      color: "#6B7280", isPrimary: false, sortOrder: 12 },
];

/** Quick lookup by category ID */
export const CATEGORY_MAP: Record<string, SpendCategory> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

/** Primary categories (always visible in compact UIs) */
export const PRIMARY_CATEGORIES = CATEGORIES.filter((c) => c.isPrimary);

/** Advanced/secondary categories (shown in expanded views) */
export const ADVANCED_CATEGORIES = CATEGORIES.filter((c) => !c.isPrimary);

// ─── Emoji Icons Lookup ─────────────────────────────────────────────────

/** Category ID → emoji. Drop-in replacement for scattered CATEGORY_ICONS objects. */
export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.emoji])
);

/** Category ID → display name. Drop-in replacement for scattered CATEGORY_NAMES objects. */
export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.displayName])
);

/** Category ID → hex color */
export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.color])
);

// ─── User Spend Key → V3 Category Key Mapping ──────────────────────────

/**
 * Maps user-facing spending category names to V3 data keys.
 * Used by My Cards pages where user tracks spending in friendly categories
 * that don't match V3 keys exactly.
 */
export const USER_SPEND_TO_V3: Record<string, string> = {
  shopping: "online",
  food: "dining",
  travel: "travel",
  fuel: "fuel",
  electronics: "online",
  entertainment: "entertainment",
  bills: "utilities",
  groceries: "grocery",
  health: "base",
  others: "base",
  other: "base",
};

/**
 * Maps V3 category keys to compare/rewards-tab spending keys.
 * Inverse of the user spend mapping for the compare tool.
 */
export const V3_TO_SPEND_KEY: Record<string, string> = {
  dining: "dining",
  grocery: "groceries",
  fuel: "fuel",
  travel: "travel",
  online: "online-shopping",
  entertainment: "entertainment",
  utilities: "bills",
  base: "other",
  pharmacy: "health",
};

// ─── Card Finder Priority Mapping ───────────────────────────────────────

/**
 * Maps card finder priority selections to V3 category keys.
 * Used in SpendingStep.tsx for the "What matters most?" question.
 */
export const PRIORITY_TO_V3_CATEGORIES: Record<string, string[]> = {
  "dining-ent": ["dining", "entertainment"],
  "travel-benefits": ["travel"],
  lounge: ["travel"],
  "low-forex": ["travel"],
};

// ─── Cap Period Colors (for reward cap display) ─────────────────────────

export const CAP_PERIOD_COLORS: Record<string, string> = {
  Monthly: "bg-blue-500/15 text-blue-400",
  Quarterly: "bg-purple-500/15 text-purple-400",
  Annual: "bg-gold/15 text-gold",
  "Per Txn": "bg-secondary text-muted-foreground",
};

// ─── Helpers ────────────────────────────────────────────────────────────

/** Get category by ID, falls back to "base" */
export function getCategory(id: string): SpendCategory {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP["base"];
}

/** Get emoji for a category */
export function getCategoryEmoji(id: string): string {
  return CATEGORY_MAP[id]?.emoji ?? "💳";
}

/** Get display name for a category */
export function getCategoryName(id: string): string {
  return CATEGORY_MAP[id]?.displayName ?? "Other";
}

/** Get color for a category */
export function getCategoryColor(id: string): string {
  return CATEGORY_MAP[id]?.color ?? "#6B7280";
}

/** Map a user spend key to V3 key */
export function mapToV3Key(userKey: string): string {
  return USER_SPEND_TO_V3[userKey] ?? userKey;
}
