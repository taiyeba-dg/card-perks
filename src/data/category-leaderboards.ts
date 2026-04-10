import { CARD_V3_MASTER } from "./card-v3-master";
import { cards, type CreditCard } from "./cards";
import type { CardV3Data, CategoryRate } from "./card-v3-types";

// Re-export enhanced category definitions from standalone data file
export {
  BEST_FOR_CATEGORIES,
  getCategoryBySlug as getCategoryBySlugV2,
  getSeasonalFeatured,
  searchCategories,
  type BestForCategoryDef,
} from "./best-for/best-for-categories";
export { CATEGORY_TIPS, getTipsForCategory } from "./best-for/best-for-tips";
export { getBentoLayout, getSeasonalFeaturedCategories, findMultiCategoryWinners } from "./best-for/best-for-mappings";

// Legacy CategoryDef kept for backward compatibility with existing components
export interface CategoryDef {
  slug: string;
  label: string;
  emoji: string;
  v3Keys: string[]; // keys in CardV3Data.categories to check
  relatedSlugs: string[];
  isSpecial?: "forex" | "lounge" | "rent" | "insurance" | "cashback" | "beginner" | "upi" | "jewellery" | "government" | "subscriptions" | "hotels" | "premium" | "lifestyle" | "emi" | "wallets";
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "dining", label: "Dining & Restaurants", emoji: "\u{1F355}", v3Keys: ["dining"], relatedSlugs: ["online-shopping", "entertainment", "grocery"] },
  { slug: "grocery", label: "Groceries", emoji: "\u{1F6D2}", v3Keys: ["grocery"], relatedSlugs: ["dining", "utilities", "online-shopping"] },
  { slug: "online-shopping", label: "Online Shopping", emoji: "\u{1F6CD}\uFE0F", v3Keys: ["online"], relatedSlugs: ["dining", "grocery", "entertainment"] },
  { slug: "travel", label: "Travel & Flights", emoji: "\u2708\uFE0F", v3Keys: ["travel"], relatedSlugs: ["forex", "lounge", "fuel"] },
  { slug: "fuel", label: "Fuel", emoji: "\u26FD", v3Keys: ["fuel"], relatedSlugs: ["travel", "utilities", "grocery"] },
  { slug: "entertainment", label: "Entertainment", emoji: "\u{1F3AC}", v3Keys: ["entertainment"], relatedSlugs: ["dining", "online-shopping", "grocery"] },
  { slug: "pharmacy", label: "Pharmacy & Healthcare", emoji: "\u{1F48A}", v3Keys: ["pharmacy", "base"], relatedSlugs: ["grocery", "utilities", "education"] },
  { slug: "telecom", label: "Telecom & Recharges", emoji: "\u{1F4F1}", v3Keys: ["telecom", "base"], relatedSlugs: ["utilities", "online-shopping", "entertainment"] },
  { slug: "education", label: "Education", emoji: "\u{1F3EB}", v3Keys: ["education", "base"], relatedSlugs: ["utilities", "online-shopping", "pharmacy"] },
  { slug: "utilities", label: "Utilities & Bills", emoji: "\u{1F3E0}", v3Keys: ["utilities", "base"], relatedSlugs: ["telecom", "fuel", "grocery"] },
  { slug: "forex", label: "International Spending", emoji: "\u{1F30D}", v3Keys: ["forex", "base"], relatedSlugs: ["travel", "lounge", "online-shopping"], isSpecial: "forex" },
  { slug: "lounge", label: "Airport Lounge Access", emoji: "\u2708\uFE0F", v3Keys: ["lounge"], relatedSlugs: ["travel", "forex", "fuel"], isSpecial: "lounge" },
  { slug: "rent", label: "Rent Payments", emoji: "\u{1F3E2}", v3Keys: ["base"], relatedSlugs: ["utilities", "insurance"], isSpecial: "rent" },
  { slug: "insurance", label: "Insurance Premiums", emoji: "\u{1F6E1}\uFE0F", v3Keys: ["base"], relatedSlugs: ["rent", "utilities"], isSpecial: "insurance" },
  { slug: "cashback", label: "Flat Cashback", emoji: "\u{1F4B0}", v3Keys: ["base"], relatedSlugs: ["grocery", "online-shopping", "beginner"], isSpecial: "cashback" },
  { slug: "beginner", label: "First Credit Card", emoji: "\u2B50", v3Keys: ["base"], relatedSlugs: ["cashback", "upi"], isSpecial: "beginner" },
  { slug: "upi", label: "UPI Spending", emoji: "\u{1F4F2}", v3Keys: ["base"], relatedSlugs: ["beginner", "cashback"], isSpecial: "upi" },
  { slug: "gold-jewellery", label: "Gold & Jewellery", emoji: "\u{1F48E}", v3Keys: ["jewellery", "base"], relatedSlugs: ["online-shopping", "emi", "premium"], isSpecial: "jewellery" },
  { slug: "government-tax", label: "Government & Tax", emoji: "\u{1F3DB}\uFE0F", v3Keys: ["government", "base"], relatedSlugs: ["utilities", "insurance", "rent"], isSpecial: "government" },
  { slug: "subscriptions", label: "OTT & Subscriptions", emoji: "\u{1F4FA}", v3Keys: ["entertainment", "base"], relatedSlugs: ["entertainment", "online-shopping", "cashback"], isSpecial: "subscriptions" },
  { slug: "hotels", label: "Hotels & Stays", emoji: "\u{1F3E8}", v3Keys: ["travel", "base"], relatedSlugs: ["travel", "forex", "lounge"], isSpecial: "hotels" },
  { slug: "premium", label: "Premium / Super-Premium", emoji: "\u{1F451}", v3Keys: ["base"], relatedSlugs: ["travel", "lounge", "hotels"], isSpecial: "premium" },
  { slug: "lifestyle", label: "Lifestyle & Offline", emoji: "\u{1F6CD}\uFE0F", v3Keys: ["offline", "base"], relatedSlugs: ["online-shopping", "dining", "entertainment"], isSpecial: "lifestyle" },
  { slug: "emi", label: "EMI & Large Purchases", emoji: "\u{1F504}", v3Keys: ["base"], relatedSlugs: ["online-shopping", "gold-jewellery", "premium"], isSpecial: "emi" },
  { slug: "wallets", label: "Wallet Loads", emoji: "\u{1F4F1}", v3Keys: ["base"], relatedSlugs: ["upi", "cashback", "online-shopping"], isSpecial: "wallets" },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export interface LeaderboardEntry {
  card: CreditCard;
  v3: CardV3Data;
  rawRate: number;
  rawLabel: string;
  effectiveRate: number; // rawRate × best redemption value
  bestRedemptionValue: number;
  bestRedemptionLabel: string;
  cap: number | null;
  capPeriod: string | null;
  minTxn: number | null;
  note: string | null;
  hasPortalBoost: boolean;
  portalRate?: number;
  portalName?: string;
  portalMerchant?: string;
}

/**
 * Parse a loungeVisits string like "Unlimited domestic, 4/year intl" into a
 * numeric score for ranking. Higher = better lounge access.
 */
function parseLoungeScore(lounge: string): number {
  if (!lounge || lounge === "None") return 0;
  let score = 0;
  const lower = lounge.toLowerCase();

  // Domestic
  if (lower.includes("unlimited domestic")) score += 100;
  else {
    const dm = lower.match(/(\d+)\/(?:year|yr)\s*domestic/i);
    if (dm) score += parseInt(dm[1], 10);
  }

  // International
  if (lower.includes("unlimited intl")) score += 50;
  else {
    const im = lower.match(/(\d+)\/(?:year|yr)\s*intl/i);
    if (im) score += parseInt(im[1], 10) * 2;
  }

  return score;
}

/**
 * Build the leaderboard for a given category slug.
 * Returns entries sorted by effectiveRate descending.
 * For "lounge", ranks by lounge access score instead of earning rate.
 */
export function buildLeaderboard(slug: string): LeaderboardEntry[] {
  const catDef = getCategoryBySlug(slug);
  if (!catDef) return [];

  // Special handling for lounge — rank by lounge access, not earning rate
  if (catDef.isSpecial === "lounge") {
    return buildLoungeLeaderboard();
  }

  const entries: LeaderboardEntry[] = [];

  for (const card of cards) {
    const v3 = CARD_V3_MASTER[card.id]?.enrichment;
    if (!v3) continue;

    // Find the best matching category rate.
    // If v3Keys has a specific key AND "base", only use the specific key —
    // don't fall through to base (which would make all categories identical).
    const hasSpecificKey = catDef.v3Keys.length > 1 || (catDef.v3Keys.length === 1 && catDef.v3Keys[0] !== "base");
    let catRate: CategoryRate | null = null;
    for (const key of catDef.v3Keys) {
      if (key === "base" && hasSpecificKey) continue; // skip base fallback when specific keys exist
      if (v3.categories[key]) {
        catRate = v3.categories[key];
        break;
      }
    }
    if (!catRate) continue;
    if (catRate.rate === 0) continue; // skip cards with 0 rate

    const bestRedemptionValue = v3.redemption.baseValue;
    const effectiveRate = catRate.rate * bestRedemptionValue;

    // Check for portal boosts
    let hasPortalBoost = false;
    let portalRate: number | undefined;
    let portalName: string | undefined;
    let portalMerchant: string | undefined;

    for (const portal of v3.portals) {
      for (const merchant of portal.merchants) {
        // Simple heuristic: check if merchant relates to category
        if (merchantMatchesCategory(merchant.name, slug)) {
          hasPortalBoost = true;
          const boostedEffective = merchant.effectiveRate * bestRedemptionValue;
          if (!portalRate || boostedEffective > portalRate) {
            portalRate = boostedEffective;
            portalName = portal.name;
            portalMerchant = merchant.name;
          }
        }
      }
    }

    entries.push({
      card,
      v3,
      rawRate: catRate.rate,
      rawLabel: catRate.label,
      effectiveRate,
      bestRedemptionValue,
      bestRedemptionLabel: `₹${bestRedemptionValue.toFixed(2)}/pt`,
      cap: catRate.cap,
      capPeriod: catRate.capPeriod,
      minTxn: catRate.minTxn,
      note: catRate.note,
      hasPortalBoost,
      portalRate,
      portalName,
      portalMerchant,
    });
  }

  // If fewer than 5 entries and category includes "base" as a fallback key,
  // do a second pass to include cards with base rate
  if (entries.length < 5 && catDef.v3Keys.includes("base")) {
    const existingIds = new Set(entries.map((e) => e.card.id));
    for (const card of cards) {
      const v3 = CARD_V3_MASTER[card.id]?.enrichment;
      if (!v3) continue;
      if (existingIds.has(card.id)) continue;

      const baseRate = v3.categories["base"];
      if (!baseRate || baseRate.rate === 0) continue;

      const bestRedemptionValue = v3.redemption.baseValue;
      const effectiveRate = baseRate.rate * bestRedemptionValue;

      let hasPortalBoost = false;
      let portalRate: number | undefined;
      let portalName: string | undefined;
      let portalMerchant: string | undefined;

      for (const portal of v3.portals) {
        for (const merchant of portal.merchants) {
          if (merchantMatchesCategory(merchant.name, slug)) {
            hasPortalBoost = true;
            const boostedEffective = merchant.effectiveRate * bestRedemptionValue;
            if (!portalRate || boostedEffective > portalRate) {
              portalRate = boostedEffective;
              portalName = portal.name;
              portalMerchant = merchant.name;
            }
          }
        }
      }

      entries.push({
        card,
        v3,
        rawRate: baseRate.rate,
        rawLabel: baseRate.label,
        effectiveRate,
        bestRedemptionValue,
        bestRedemptionLabel: `\u20B9${bestRedemptionValue.toFixed(2)}/pt`,
        cap: baseRate.cap,
        capPeriod: baseRate.capPeriod,
        minTxn: baseRate.minTxn,
        note: baseRate.note,
        hasPortalBoost,
        portalRate,
        portalName,
        portalMerchant,
      });
    }
  }

  entries.sort((a, b) => b.effectiveRate - a.effectiveRate);
  return entries;
}

/**
 * Build lounge leaderboard — ranks cards by lounge visit count/quality.
 * effectiveRate stores the lounge score (not a percentage).
 */
function buildLoungeLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (const card of cards) {
    const v3 = CARD_V3_MASTER[card.id]?.enrichment;
    if (!v3) continue;

    const loungeStr = card.lounge;
    const score = parseLoungeScore(loungeStr);
    if (score <= 0) continue;

    entries.push({
      card,
      v3,
      rawRate: score,
      rawLabel: loungeStr,
      effectiveRate: score,
      bestRedemptionValue: 1,
      bestRedemptionLabel: loungeStr,
      cap: null,
      capPeriod: null,
      minTxn: null,
      note: loungeStr,
      hasPortalBoost: false,
    });
  }

  entries.sort((a, b) => b.effectiveRate - a.effectiveRate);
  return entries;
}

function merchantMatchesCategory(merchant: string, slug: string): boolean {
  const m = merchant.toLowerCase();
  const map: Record<string, string[]> = {
    dining: ["swiggy", "zomato", "dineout", "eazydiner"],
    grocery: ["bigbasket", "blinkit", "zepto", "grofers", "jiomart"],
    "online-shopping": ["amazon", "flipkart", "myntra", "ajio", "tata"],
    travel: ["makemytrip", "flights", "hotels", "irctc", "cleartrip", "goibibo"],
    fuel: ["bpcl", "hpcl", "iocl", "fuel", "indianoil", "petrol"],
    entertainment: ["bookmyshow", "pvr", "netflix", "hotstar", "inox", "sonyliv", "prime video"],
    utilities: ["electricity", "gas", "water", "utility", "broadband"],
    telecom: ["jio", "airtel", "vi", "bsnl", "recharge"],
    pharmacy: ["apollo", "pharmeasy", "netmeds", "1mg", "medplus", "tata health"],
    education: ["coursera", "udemy", "byjus", "unacademy", "upgrad", "school", "college"],
    forex: ["international", "forex", "travel abroad"],
    lounge: ["lounge", "airport"],
    rent: ["rent", "nobroker", "cred rent", "magicbricks"],
    insurance: ["insurance", "premium", "lic", "term plan"],
    cashback: ["cashback"],
    beginner: [],
    upi: ["upi", "google pay", "phonepe", "bhim"],
    "gold-jewellery": ["tanishq", "kalyan", "malabar", "titan", "jewellery", "gold", "caratlane"],
    "government-tax": ["tax", "gst", "government", "municipal", "challan"],
    subscriptions: ["netflix", "hotstar", "prime", "spotify", "youtube", "swiggy one", "zomato gold"],
    hotels: ["marriott", "taj", "ihcl", "oyo", "airbnb", "hotel", "booking.com", "goibibo hotels"],
    premium: [],
    lifestyle: ["shoppers stop", "lifestyle", "westside", "reliance", "mall", "brand"],
    emi: ["emi", "no cost emi", "smartemi", "flexipay"],
    wallets: ["paytm", "phonepe", "amazon pay", "ola money", "freecharge", "mobikwik"],
  };
  const keywords = map[slug] || [];
  return keywords.some((kw) => m.includes(kw));
}

/**
 * Calculate annual earning at a given monthly spend, accounting for caps.
 */
export function calcAnnualEarning(entry: LeaderboardEntry, monthlySpend: number): number {
  const monthlyEarning = monthlySpend * (entry.effectiveRate / 100);
  
  if (entry.cap && entry.capPeriod) {
    const capValue = entry.cap * entry.bestRedemptionValue;
    const periods = entry.capPeriod === "Monthly" ? 12 : entry.capPeriod === "Quarterly" ? 4 : 1;
    const cappedAnnual = Math.min(monthlyEarning * 12, capValue * periods);
    return cappedAnnual;
  }
  
  return monthlyEarning * 12;
}
