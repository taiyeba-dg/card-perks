/**
 * Spending Presets — Centralized spending profile definitions
 *
 * Single source of truth for all spending preset profiles used across:
 * - Card Finder (finderTypes.ts)
 * - Compare Tool (RewardsTab.tsx)
 * - Fee Worth Calculator (MobileFeeWorthCalc.tsx)
 * - Rewards Calculator (MobileRewardsCalc.tsx)
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface SpendingPreset {
  id: string;
  label: string;
  emoji: string;
  /** Monthly spend amounts keyed by V3 category */
  values: Record<string, number>;
  /** Total monthly spend */
  totalMonthly: number;
}

export interface QuickPreset {
  id: string;
  label: string;
  /** Monthly spend amounts keyed by V3 category (fewer categories) */
  values: Record<string, number>;
  totalMonthly: number;
}

// ─── Full Spending Presets (5 personas) ─────────────────────────────────

export const SPENDING_PRESETS: SpendingPreset[] = [
  {
    id: "student",
    label: "Student",
    emoji: "🎓",
    values: {
      dining: 3000, grocery: 1000, online: 5000, travel: 0, fuel: 0,
      entertainment: 1500, pharmacy: 500, telecom: 500, education: 3000,
      utilities: 2000, rent: 0, other: 1000,
    },
    totalMonthly: 17500,
  },
  {
    id: "professional",
    label: "Professional",
    emoji: "💼",
    values: {
      dining: 8000, grocery: 5000, online: 10000, travel: 5000, fuel: 5000,
      entertainment: 3000, pharmacy: 1000, telecom: 1000, education: 0,
      utilities: 5000, rent: 15000, other: 6000,
    },
    totalMonthly: 64000,
  },
  {
    id: "family",
    label: "Family",
    emoji: "👨‍👩‍👧‍👦",
    values: {
      dining: 5000, grocery: 15000, online: 8000, travel: 3000, fuel: 8000,
      entertainment: 2000, pharmacy: 3000, telecom: 1500, education: 5000,
      utilities: 8000, rent: 30000, other: 10000,
    },
    totalMonthly: 98500,
  },
  {
    id: "traveler",
    label: "Traveler",
    emoji: "✈️",
    values: {
      dining: 10000, grocery: 3000, online: 5000, travel: 25000, fuel: 2000,
      entertainment: 2000, pharmacy: 1000, telecom: 500, education: 0,
      utilities: 3000, rent: 0, other: 8000,
    },
    totalMonthly: 59500,
  },
  {
    id: "high-spender",
    label: "High Spender",
    emoji: "💰",
    values: {
      dining: 20000, grocery: 15000, online: 30000, travel: 30000, fuel: 10000,
      entertainment: 8000, pharmacy: 5000, telecom: 2000, education: 3000,
      utilities: 10000, rent: 50000, other: 17000,
    },
    totalMonthly: 200000,
  },
];

// ─── Quick Presets (3 tiers for calculators) ────────────────────────────

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "casual",
    label: "₹30K",
    values: { grocery: 5000, dining: 4000, fuel: 3000, online: 8000, travel: 2000, utilities: 8000 },
    totalMonthly: 30000,
  },
  {
    id: "premium",
    label: "₹80K",
    values: { grocery: 12000, dining: 12000, fuel: 6000, online: 20000, travel: 15000, utilities: 15000 },
    totalMonthly: 80000,
  },
  {
    id: "heavy",
    label: "₹1.5L",
    values: { grocery: 20000, dining: 25000, fuel: 10000, online: 35000, travel: 30000, utilities: 30000 },
    totalMonthly: 150000,
  },
];

// ─── Compare Tool Spend Key Mapping ─────────────────────────────────────

/**
 * Maps compare tool's spending keys to V3 category keys.
 * The compare tool uses user-friendly names that differ from V3 keys.
 */
export const COMPARE_SPEND_TO_V3: Record<string, string> = {
  "online-shopping": "online",
  dining: "dining",
  groceries: "grocery",
  fuel: "fuel",
  travel: "travel",
  bills: "utilities",
  entertainment: "entertainment",
  rent: "rent",
  insurance: "base",
  international: "travel",
  health: "pharmacy",
  other: "base",
};

// ─── Helpers ────────────────────────────────────────────────────────────

export function getPreset(id: string): SpendingPreset | undefined {
  return SPENDING_PRESETS.find((p) => p.id === id);
}

export function getQuickPreset(id: string): QuickPreset | undefined {
  return QUICK_PRESETS.find((p) => p.id === id);
}

/** Convert compare-tool spend values to V3 keys */
export function mapCompareSpendToV3(compareValues: Record<string, number>): Record<string, number> {
  const v3Values: Record<string, number> = {};
  for (const [key, amount] of Object.entries(compareValues)) {
    const v3Key = COMPARE_SPEND_TO_V3[key] ?? "base";
    v3Values[v3Key] = (v3Values[v3Key] ?? 0) + amount;
  }
  return v3Values;
}
