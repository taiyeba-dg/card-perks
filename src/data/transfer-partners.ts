/**
 * Transfer Partners Registry — Centralized loyalty program data
 *
 * Single source of truth for airline/hotel transfer partners.
 * Cards reference partner IDs; this file defines the programs.
 *
 * Replaces transfer partner data embedded in:
 * - card-v3-data.ts (per-card transferPartners arrays)
 * - redemption-calc-data.json (duplicated partner lists)
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface LoyaltyProgram {
  /** Unique identifier */
  id: string;
  /** Full program name */
  name: string;
  /** Type of loyalty program */
  type: "airline" | "hotel";
  /** Airline alliance if applicable */
  alliance: "Star Alliance" | "Oneworld" | "SkyTeam" | "None" | null;
  /** Currency name used by the program */
  currencyName: string;
  /** Approximate value per point/mile in INR */
  approxValueInr: number;
  /** Program website */
  url: string;
  /** Key redemption sweet spots */
  sweetSpots: string[];
  /** Additional notes */
  note: string | null;
}

export interface CardTransferPartner {
  /** Loyalty program ID */
  programId: string;
  /** Transfer ratio as display string (e.g., "2:1") */
  ratio: string;
  /** Numeric ratio: how many card points per 1 program point */
  ratioNumeric: number;
  /** Minimum points required for transfer */
  minPoints: number;
  /** Typical transfer time */
  transferTime: string;
  /** Transfer fee */
  fee: string;
}

// ─── Loyalty Program Definitions ────────────────────────────────────────

export const LOYALTY_PROGRAMS: Record<string, LoyaltyProgram> = {
  intermiles: {
    id: "intermiles",
    name: "InterMiles",
    type: "airline",
    alliance: "None",
    currencyName: "InterMiles",
    approxValueInr: 0.30,
    url: "https://www.intermiles.com",
    sweetSpots: [
      "Domestic flights from 15,000 miles",
      "International economy from 30,000 miles",
      "Hotel stays from 5,000 miles",
    ],
    note: "India's largest independent frequent flyer program. Can be used across multiple airlines.",
  },
  "singapore-krisflyer": {
    id: "singapore-krisflyer",
    name: "Singapore Airlines KrisFlyer",
    type: "airline",
    alliance: "Star Alliance",
    currencyName: "KrisFlyer Miles",
    approxValueInr: 1.20,
    url: "https://www.singaporeair.com/krisflyer",
    sweetSpots: [
      "SIN-DEL business class ~62,000 miles",
      "Star Alliance partner awards",
      "SQ Suites for aspirational redemptions",
    ],
    note: "One of the most valuable transfer partners for Indian premium cardholders. Star Alliance coverage makes it very versatile.",
  },
  "british-airways": {
    id: "british-airways",
    name: "British Airways Executive Club",
    type: "airline",
    alliance: "Oneworld",
    currencyName: "Avios",
    approxValueInr: 0.80,
    url: "https://www.britishairways.com/executive-club",
    sweetSpots: [
      "Short-haul flights from 4,000 Avios",
      "BOM/DEL-LHR economy from 13,000 Avios + carrier surcharge",
      "Oneworld partner awards",
    ],
    note: "Avios are distance-based, making short-haul redemptions excellent value. Watch for fuel surcharges on BA metal.",
  },
  "marriott-bonvoy": {
    id: "marriott-bonvoy",
    name: "Marriott Bonvoy",
    type: "hotel",
    alliance: null,
    currencyName: "Marriott Bonvoy Points",
    approxValueInr: 0.55,
    url: "https://www.marriott.com/loyalty",
    sweetSpots: [
      "Category 1-4 hotels from 5,000-20,000 points/night",
      "5th night free on award stays",
      "Transfer to 40+ airline partners at 3:1 ratio",
    ],
    note: "Largest hotel loyalty program globally. Points can also be converted to airline miles (3:1 ratio, bonus 5K miles per 60K transferred).",
  },
  "itc-hotels": {
    id: "itc-hotels",
    name: "ITC Hotels",
    type: "hotel",
    alliance: null,
    currencyName: "ITC Points",
    approxValueInr: 0.40,
    url: "https://www.itchotels.com",
    sweetSpots: [
      "ITC Luxury Collection stays",
      "Welcomhotel properties",
      "Dining at ITC restaurants",
    ],
    note: "India-focused hotel chain. Best for domestic luxury stays at ITC Grand properties.",
  },
  "qatar-airways": {
    id: "qatar-airways",
    name: "Qatar Airways Privilege Club",
    type: "airline",
    alliance: "Oneworld",
    currencyName: "Avios",
    approxValueInr: 0.80,
    url: "https://www.qatarairways.com/privilege-club",
    sweetSpots: [
      "QSuites business class redemptions",
      "Oneworld partner awards",
      "DOH connections to Europe/Americas",
    ],
    note: "Now uses Avios (merged with BA). QSuites is a top business class product.",
  },
  vistara: {
    id: "vistara",
    name: "Club Vistara",
    type: "airline",
    alliance: "None",
    currencyName: "CV Points",
    approxValueInr: 0.50,
    url: "https://www.airindia.com",
    sweetSpots: [
      "Domestic economy from 3,000 CV Points",
      "Domestic business from 6,000 CV Points",
      "Upgrades from economy to business",
    ],
    note: "Vistara merged with Air India. CV Points may transition to Air India's program. Use points sooner rather than later.",
  },
  "singapore-airlines": {
    id: "singapore-airlines",
    name: "Singapore Airlines",
    type: "airline",
    alliance: "Star Alliance",
    currencyName: "KrisFlyer Miles",
    approxValueInr: 1.20,
    url: "https://www.singaporeair.com/krisflyer",
    sweetSpots: [
      "Same as KrisFlyer — this is the parent program",
    ],
    note: "Same program as KrisFlyer. Some cards reference it by airline name rather than program name.",
  },
  "various-airlines": {
    id: "various-airlines",
    name: "Various Airlines (via Marriott)",
    type: "airline",
    alliance: null,
    currencyName: "Airline Miles",
    approxValueInr: 0.30,
    url: "https://www.marriott.com/loyalty/earn/transfer-points.mi",
    sweetSpots: [
      "40+ airline partners available",
      "Bonus 5,000 miles per 60,000 points transferred",
    ],
    note: "Marriott Bonvoy points can be transferred to 40+ airline programs. Ratio is typically 3:1.",
  },
};

// ─── Card → Transfer Partner Mappings ───────────────────────────────────

export const CARD_TRANSFER_PARTNERS: Record<string, CardTransferPartner[]> = {
  "amex-gold-charge": [
    { programId: "intermiles", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "amex-mrcc": [
    { programId: "intermiles", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "2-3 days", fee: "None" },
  ],
  "amex-platinum-charge": [
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
    { programId: "intermiles", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "amex-platinum-reserve": [
    { programId: "intermiles", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "amex-platinum-travel": [
    { programId: "intermiles", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "au-zenith-plus": [
    { programId: "intermiles", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "3-5 days", fee: "None" },
    { programId: "itc-hotels", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "3-5 days", fee: "None" },
  ],
  "axis-atlas": [
    { programId: "intermiles", ratio: "2:1", ratioNumeric: 2, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
    { programId: "marriott-bonvoy", ratio: "5:2", ratioNumeric: 2.5, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "axis-magnus": [
    { programId: "intermiles", ratio: "5:4", ratioNumeric: 1.25, minPoints: 2500, transferTime: "3-5 days", fee: "None" },
    { programId: "itc-hotels", ratio: "1:1", ratioNumeric: 1, minPoints: 2000, transferTime: "2-3 days", fee: "None" },
  ],
  "axis-olympus": [
    { programId: "intermiles", ratio: "2:1", ratioNumeric: 2, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "axis-reserve": [
    { programId: "intermiles", ratio: "2:1", ratioNumeric: 2, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
    { programId: "marriott-bonvoy", ratio: "5:2", ratioNumeric: 2.5, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "club-vistara-sbi": [
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "5-7 days", fee: "None" },
  ],
  "hdfc-diners-club-black": [
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "2-3 days", fee: "None" },
  ],
  "hdfc-diners-club-black-metal": [
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "2-3 days", fee: "None" },
  ],
  "hdfc-diners-clubmiles": [
    { programId: "british-airways", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "3-5 days", fee: "None" },
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "3-5 days", fee: "None" },
  ],
  "hdfc-infinia-metal": [
    { programId: "singapore-krisflyer", ratio: "2:1", ratioNumeric: 2, minPoints: 5000, transferTime: "2-3 days", fee: "None" },
  ],
  "hsbc-travel-one": [
    { programId: "singapore-airlines", ratio: "1:1", ratioNumeric: 1, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
  "indusind-avios": [
    { programId: "british-airways", ratio: "1:1", ratioNumeric: 1, minPoints: 500, transferTime: "Instant", fee: "None" },
    { programId: "qatar-airways", ratio: "1:1", ratioNumeric: 1, minPoints: 500, transferTime: "Instant", fee: "None" },
  ],
  "marriott-bonvoy-hdfc": [
    { programId: "various-airlines", ratio: "3:1", ratioNumeric: 3, minPoints: 3000, transferTime: "3-5 days", fee: "None" },
  ],
  "sbi-miles-elite": [
    { programId: "vistara", ratio: "2:1", ratioNumeric: 2, minPoints: 1000, transferTime: "3-5 days", fee: "None" },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────

/** Get all transfer partners for a card */
export function getCardPartners(cardId: string): CardTransferPartner[] {
  return CARD_TRANSFER_PARTNERS[cardId] ?? [];
}

/** Get the loyalty program details */
export function getProgram(programId: string): LoyaltyProgram | undefined {
  return LOYALTY_PROGRAMS[programId];
}

/** Get all cards that can transfer to a specific program */
export function getCardsForProgram(programId: string): { cardId: string; partner: CardTransferPartner }[] {
  const results: { cardId: string; partner: CardTransferPartner }[] = [];
  for (const [cardId, partners] of Object.entries(CARD_TRANSFER_PARTNERS)) {
    const match = partners.find((p) => p.programId === programId);
    if (match) results.push({ cardId, partner: match });
  }
  return results;
}

/** Get the best transfer ratio for a program across all cards (lowest ratioNumeric = best) */
export function getBestRatioForProgram(programId: string): { cardId: string; ratio: string; ratioNumeric: number } | null {
  const cards = getCardsForProgram(programId);
  if (cards.length === 0) return null;
  const best = cards.sort((a, b) => a.partner.ratioNumeric - b.partner.ratioNumeric)[0];
  return { cardId: best.cardId, ratio: best.partner.ratio, ratioNumeric: best.partner.ratioNumeric };
}

/** Check if a card has any transfer partners */
export function hasTransferPartners(cardId: string): boolean {
  return (CARD_TRANSFER_PARTNERS[cardId]?.length ?? 0) > 0;
}

/** Get all unique programs across all cards */
export function getAllPrograms(): LoyaltyProgram[] {
  const programIds = new Set<string>();
  for (const partners of Object.values(CARD_TRANSFER_PARTNERS)) {
    for (const p of partners) programIds.add(p.programId);
  }
  return [...programIds].map((id) => LOYALTY_PROGRAMS[id]).filter(Boolean);
}

/** Get airline programs only */
export function getAirlinePrograms(): LoyaltyProgram[] {
  return getAllPrograms().filter((p) => p.type === "airline");
}

/** Get hotel programs only */
export function getHotelPrograms(): LoyaltyProgram[] {
  return getAllPrograms().filter((p) => p.type === "hotel");
}
