/**
 * Exclusions Registry — Standardized reward exclusion definitions
 *
 * Single source of truth for what transactions are excluded from
 * earning rewards on each credit card.
 *
 * Replaces inconsistent exclusion strings scattered across:
 * - card-v3-data.ts (object format with category/mcc/note)
 * - rewards-calc-data.json (string arrays)
 * - feeworth-calc-data.json (string arrays)
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface ExclusionType {
  /** Unique identifier */
  id: string;
  /** Display name */
  displayName: string;
  /** MCC codes that trigger this exclusion (empty if not MCC-based) */
  mccCodes: string[];
  /** Short description */
  description: string;
  /** How common this exclusion is across cards */
  prevalence: "very-common" | "common" | "uncommon" | "rare";
}

export interface ExclusionSet {
  /** Unique set ID */
  id: string;
  /** Human-readable label */
  label: string;
  /** Exclusion type IDs in this set */
  exclusionIds: string[];
  /** Number of cards using this exact set */
  cardCount: number;
}

// ─── Exclusion Type Definitions ─────────────────────────────────────────

export const EXCLUSION_TYPES: Record<string, ExclusionType> = {
  fuel: {
    id: "fuel",
    displayName: "Fuel",
    mccCodes: ["5541", "5542"],
    description: "Fuel transactions at petrol pumps (surcharge waiver may still apply)",
    prevalence: "very-common",
  },
  "wallet-loads": {
    id: "wallet-loads",
    displayName: "Wallet Loads",
    mccCodes: ["6540"],
    description: "Mobile wallet top-ups and money transfers (Paytm, PhonePe, etc.)",
    prevalence: "very-common",
  },
  rent: {
    id: "rent",
    displayName: "Rent Payments",
    mccCodes: ["6513"],
    description: "Rent payments via CRED, NoBroker, MagicBricks, etc.",
    prevalence: "common",
  },
  emi: {
    id: "emi",
    displayName: "EMI Payments",
    mccCodes: [],
    description: "EMI conversions and installment payments",
    prevalence: "common",
  },
  gaming: {
    id: "gaming",
    displayName: "Gaming",
    mccCodes: [],
    description: "Online gaming, betting, and lottery transactions",
    prevalence: "uncommon",
  },
  utilities: {
    id: "utilities",
    displayName: "Utilities",
    mccCodes: [],
    description: "Electricity, water, gas, and broadband bill payments",
    prevalence: "uncommon",
  },
  insurance: {
    id: "insurance",
    displayName: "Insurance Premiums",
    mccCodes: [],
    description: "Insurance premium payments",
    prevalence: "rare",
  },
  government: {
    id: "government",
    displayName: "Government Payments",
    mccCodes: [],
    description: "Tax payments, government fees, and challan payments",
    prevalence: "rare",
  },
  "cash-withdrawal": {
    id: "cash-withdrawal",
    displayName: "Cash Withdrawal",
    mccCodes: [],
    description: "ATM cash advances and cash withdrawals",
    prevalence: "rare",
  },
  "non-bpcl-fuel": {
    id: "non-bpcl-fuel",
    displayName: "Non-BPCL Fuel",
    mccCodes: ["5541", "5542"],
    description: "Fuel at non-BPCL stations (BPCL co-branded cards only)",
    prevalence: "rare",
  },
  "rent-via-apps": {
    id: "rent-via-apps",
    displayName: "Rent via Apps",
    mccCodes: ["6513"],
    description: "Rent payments specifically via third-party apps",
    prevalence: "rare",
  },
};

// ─── Standard Exclusion Sets ────────────────────────────────────────────

export const EXCLUSION_SETS: Record<string, ExclusionSet> = {
  "fuel-wallet": {
    id: "fuel-wallet",
    label: "Fuel + Wallet Loads",
    exclusionIds: ["fuel", "wallet-loads"],
    cardCount: 75,
  },
  "fuel-only": {
    id: "fuel-only",
    label: "Fuel Only",
    exclusionIds: ["fuel"],
    cardCount: 27,
  },
  "fuel-rent-wallet": {
    id: "fuel-rent-wallet",
    label: "Fuel + Rent + Wallet Loads",
    exclusionIds: ["fuel", "rent", "wallet-loads"],
    cardCount: 25,
  },
  "wallet-only": {
    id: "wallet-only",
    label: "Wallet Loads Only",
    exclusionIds: ["wallet-loads"],
    cardCount: 8,
  },
  "emi-fuel": {
    id: "emi-fuel",
    label: "EMI + Fuel",
    exclusionIds: ["emi", "fuel"],
    cardCount: 10,
  },
  "fuel-gaming-wallet": {
    id: "fuel-gaming-wallet",
    label: "Fuel + Gaming + Wallet Loads",
    exclusionIds: ["fuel", "gaming", "wallet-loads"],
    cardCount: 8,
  },
  "rent-wallet": {
    id: "rent-wallet",
    label: "Rent + Wallet Loads",
    exclusionIds: ["rent", "wallet-loads"],
    cardCount: 6,
  },
  "fuel-gaming-utilities-wallet": {
    id: "fuel-gaming-utilities-wallet",
    label: "Fuel + Gaming + Utilities + Wallet Loads",
    exclusionIds: ["fuel", "gaming", "utilities", "wallet-loads"],
    cardCount: 3,
  },
  "gaming-wallet": {
    id: "gaming-wallet",
    label: "Gaming + Wallet Loads",
    exclusionIds: ["gaming", "wallet-loads"],
    cardCount: 2,
  },
  "government-insurance": {
    id: "government-insurance",
    label: "Government + Insurance",
    exclusionIds: ["government", "insurance"],
    cardCount: 1,
  },
  "emi-wallet": {
    id: "emi-wallet",
    label: "EMI + Wallet Loads",
    exclusionIds: ["emi", "wallet-loads"],
    cardCount: 1,
  },
  "emi-fuel-wallet": {
    id: "emi-fuel-wallet",
    label: "EMI + Fuel + Wallet Loads",
    exclusionIds: ["emi", "fuel", "wallet-loads"],
    cardCount: 1,
  },
  "emi-fuel-rent": {
    id: "emi-fuel-rent",
    label: "EMI + Fuel + Rent",
    exclusionIds: ["emi", "fuel", "rent"],
    cardCount: 1,
  },
  "emi-fuel-rent-wallet": {
    id: "emi-fuel-rent-wallet",
    label: "EMI + Fuel + Rent + Wallet Loads",
    exclusionIds: ["emi", "fuel", "rent", "wallet-loads"],
    cardCount: 1,
  },
  "emi-fuel-gaming-rent-wallet": {
    id: "emi-fuel-gaming-rent-wallet",
    label: "EMI + Fuel + Gaming + Rent + Wallet Loads",
    exclusionIds: ["emi", "fuel", "gaming", "rent", "wallet-loads"],
    cardCount: 1,
  },
  "fuel-rent": {
    id: "fuel-rent",
    label: "Fuel + Rent",
    exclusionIds: ["fuel", "rent"],
    cardCount: 1,
  },
  "fuel-rent-utilities": {
    id: "fuel-rent-utilities",
    label: "Fuel + Rent + Utilities",
    exclusionIds: ["fuel", "rent", "utilities"],
    cardCount: 1,
  },
  "fuel-utilities-wallet": {
    id: "fuel-utilities-wallet",
    label: "Fuel + Utilities + Wallet Loads",
    exclusionIds: ["fuel", "utilities", "wallet-loads"],
    cardCount: 1,
  },
  "non-bpcl-fuel-wallet": {
    id: "non-bpcl-fuel-wallet",
    label: "Non-BPCL Fuel + Wallet Loads",
    exclusionIds: ["non-bpcl-fuel", "wallet-loads"],
    cardCount: 1,
  },
  "rent-apps-wallet": {
    id: "rent-apps-wallet",
    label: "Rent via Apps + Wallet Loads",
    exclusionIds: ["rent-via-apps", "wallet-loads"],
    cardCount: 1,
  },
  "cash-emi": {
    id: "cash-emi",
    label: "Cash Withdrawal + EMI",
    exclusionIds: ["cash-withdrawal", "emi"],
    cardCount: 1,
  },
  "cash-emi-fuel": {
    id: "cash-emi-fuel",
    label: "Cash Withdrawal + EMI + Fuel",
    exclusionIds: ["cash-withdrawal", "emi", "fuel"],
    cardCount: 1,
  },
  none: {
    id: "none",
    label: "No Exclusions",
    exclusionIds: [],
    cardCount: 9,
  },
};

// ─── Card → Exclusion Set Mapping ───────────────────────────────────────

export const CARD_EXCLUSION_MAP: Record<string, string> = {
  // fuel-wallet (75 cards — largest group)
  "air-india-sbi-signature": "fuel-wallet",
  "amex-platinum-charge": "fuel-wallet",
  "amex-platinum-reserve": "fuel-wallet",
  "amex-platinum-travel": "fuel-wallet",
  "amex-smartearn": "fuel-wallet",
  "amplifi-fi-federal": "fuel-wallet",
  "au-zenith": "fuel-wallet",
  "axis-horizon": "fuel-wallet",
  "axis-neo": "fuel-wallet",
  "axis-olympus": "fuel-wallet",
  "axis-reserve": "fuel-wallet",
  "axis-select": "fuel-wallet",
  "axis-vistara-infinite": "fuel-wallet",
  "axis-vistara-signature": "fuel-wallet",
  "bob-cashback": "fuel-wallet",
  "bob-etihad": "fuel-wallet",
  "bob-etihad-premier": "fuel-wallet",
  "bob-premier": "fuel-wallet",
  "club-vistara-sbi-prime": "fuel-wallet",
  "cred-mint": "fuel-wallet",
  "hsbc-premier": "fuel-wallet",
  "hsbc-rupay-cashback": "fuel-wallet",
  "hsbc-taj": "fuel-wallet",
  "hsbc-travel-one": "fuel-wallet",
  "indusind-avios": "fuel-wallet",
  "indusind-club-vistara-explorer": "fuel-wallet",
  "indusind-indulge": "fuel-wallet",
  "indusind-pinnacle": "fuel-wallet",
  "indusind-pioneer-heritage": "fuel-wallet",
  "indusind-pioneer-legacy": "fuel-wallet",
  "indusind-platinum-aura-edge": "fuel-wallet",
  "indusind-tiger": "fuel-wallet",
  "irctc-sbi-platinum": "fuel-wallet",
  "irctc-sbi-premier": "fuel-wallet",
  "kotak-league-platinum": "fuel-wallet",
  "kotak-mojo": "fuel-wallet",
  "kotak-white": "fuel-wallet",
  "kotak-white-reserve": "fuel-wallet",
  "kotak-zen-signature": "fuel-wallet",
  "rbl-icon": "fuel-wallet",
  "rbl-insignia": "fuel-wallet",
  "rbl-platinum-maxima": "fuel-wallet",
  "rbl-shoprite": "fuel-wallet",
  "rbl-world-safari": "fuel-wallet",
  "sbi-doctors": "fuel-wallet",
  "sbi-indigo": "fuel-wallet",
  "sbi-indigo-elite": "fuel-wallet",
  "sbi-miles-elite": "fuel-wallet",
  "sbi-prime": "fuel-wallet",
  "sbi-pulse": "fuel-wallet",
  "sc-easemytrip": "fuel-wallet",
  "sc-rewards": "fuel-wallet",
  "sc-smart": "fuel-wallet",
  "yes-bank-ace": "fuel-wallet",
  "yes-bank-first-exclusive": "fuel-wallet",
  "yes-bank-first-preferred": "fuel-wallet",
  "yes-bank-marquee": "fuel-wallet",
  "yes-bank-reserv": "fuel-wallet",
  // Also mapped as fuel-wallet (capital W variants treated same)
  "amazon-pay-icici": "fuel-wallet",
  "hdfc-6e-rewards-indigo": "fuel-wallet",
  "hdfc-diners-club-privilege": "fuel-wallet",
  "hdfc-diners-clubmiles": "fuel-wallet",
  "hdfc-millennia": "fuel-wallet",
  "hdfc-moneyback-plus": "fuel-wallet",
  "hdfc-phonepe-uno": "fuel-wallet",
  "hdfc-regalia-first": "fuel-wallet",
  "irctc-hdfc": "fuel-wallet",
  "kotak-essentia": "fuel-wallet",
  "kotak-indigo": "fuel-wallet",
  "onecard-bob": "fuel-wallet",
  "onecard-csb": "fuel-wallet",
  "onecard-federal": "fuel-wallet",
  "onecard-indian-bank": "fuel-wallet",
  "onecard-sbm": "fuel-wallet",
  "supermoney-axis-rupay": "fuel-wallet",

  // fuel-only (27 cards)
  "au-vetta": "fuel-only",
  "bob-easy": "fuel-only",
  "bob-uni": "fuel-only",
  "federal-celesta": "fuel-only",
  "federal-imperio": "fuel-only",
  "federal-signet": "fuel-only",
  "hdfc-pixel-go": "fuel-only",
  "hdfc-pixel-play": "fuel-only",
  "hdfc-shoppers-stop": "fuel-only",
  "hdfc-shoppers-stop-black": "fuel-only",
  "hdfc-tata-neu-infinity": "fuel-only",
  "hdfc-tata-neu-plus": "fuel-only",
  "hsbc-platinum": "fuel-only",
  "hsbc-platinum-rupay": "fuel-only",
  "idfc-first-select": "fuel-only",
  "indusind-eazydiner-platinum": "fuel-only",
  "indusind-legend": "fuel-only",
  "indusind-platinum-rupay": "fuel-only",
  "ixigo-au": "fuel-only",
  "jupiter-edge-csb": "fuel-only",
  "kotak-811-credit-card": "fuel-only",
  "marriott-bonvoy-hdfc": "fuel-only",
  "onecard": "fuel-only",
  "sbi-apollo": "fuel-only",
  "sbi-simplyclick": "fuel-only",
  "sbi-simplysave": "fuel-only",
  "scapia-federal": "fuel-only",

  // fuel-rent-wallet (25 cards)
  "air-india-sbi-platinum": "fuel-rent-wallet",
  "amex-gold-charge": "fuel-rent-wallet",
  "axis-flex-google-pay": "fuel-rent-wallet",
  "axis-myzone": "fuel-rent-wallet",
  "axis-rewards": "fuel-rent-wallet",
  "axis-samsung-infinite": "fuel-rent-wallet",
  "sbi-flipkart": "fuel-rent-wallet",
  "sbi-paytm": "fuel-rent-wallet",
  "sbi-paytm-select": "fuel-rent-wallet",
  "sbi-phonepe": "fuel-rent-wallet",
  "sbi-phonepe-select": "fuel-rent-wallet",
  "sbi-styleup": "fuel-rent-wallet",
  "sbi-tata-neu-infinity": "fuel-rent-wallet",
  "sbi-tata-neu-plus": "fuel-rent-wallet",
  "sbi-titan": "fuel-rent-wallet",
  "slice-sbi": "fuel-rent-wallet",
  "hdfc-bizblack-metal": "fuel-rent-wallet",
  "hdfc-bizpower": "fuel-rent-wallet",
  "hdfc-diners-club-black": "fuel-rent-wallet",
  "hdfc-diners-club-black-metal": "fuel-rent-wallet",
  "hdfc-phonepe-ultimo": "fuel-rent-wallet",
  "hdfc-regalia": "fuel-rent-wallet",
  "hdfc-swiggy-blck": "fuel-rent-wallet",
  "hdfc-swiggy-ornge": "fuel-rent-wallet",
  "yes-paisasave": "fuel-rent-wallet",

  // emi-fuel (10 cards — all IDFC)
  "idfc-diamond-reserve": "emi-fuel",
  "idfc-first-hello-cashback": "emi-fuel",
  "idfc-first-millennia": "emi-fuel",
  "idfc-first-private": "emi-fuel",
  "idfc-first-wealth": "emi-fuel",
  "idfc-first-wow": "emi-fuel",
  "idfc-gaj": "emi-fuel",
  "idfc-indigo": "emi-fuel",
  "idfc-mayura": "emi-fuel",
  "idfc-swyp": "emi-fuel",

  // wallet-only (8 cards)
  "au-lit": "wallet-only",
  "axis-privilege": "wallet-only",
  "bob-eterna": "wallet-only",
  "club-vistara-sbi": "wallet-only",
  "hdfc-regalia-gold": "wallet-only",
  "sc-platinum-rewards": "wallet-only",
  "sc-super-value-titanium": "wallet-only",
  "sc-ultimate": "wallet-only",

  // fuel-gaming-wallet (8 cards — all ICICI)
  "icici-coral": "fuel-gaming-wallet",
  "icici-emeralde-private-metal": "fuel-gaming-wallet",
  "icici-emirates-sapphiro": "fuel-gaming-wallet",
  "icici-makemytrip-platinum": "fuel-gaming-wallet",
  "icici-makemytrip-signature": "fuel-gaming-wallet",
  "icici-platinum-chip": "fuel-gaming-wallet",
  "icici-rubyx": "fuel-gaming-wallet",
  "icici-sapphiro": "fuel-gaming-wallet",

  // rent-wallet (6 cards)
  "au-zenith-plus": "rent-wallet",
  "hsbc-live-plus": "rent-wallet",
  "hdfc-infinia-metal": "rent-wallet",
  "indusind-jio-bp": "rent-wallet",
  "axis-indianoil": "rent-wallet",
  "bpcl-sbi": "rent-wallet",
  "sbi-reliance": "rent-wallet",
  "sbi-reliance-prime": "rent-wallet",

  // fuel-gaming-utilities-wallet (3 cards)
  "icici-emeralde": "fuel-gaming-utilities-wallet",
  "icici-emirates-emeralde": "fuel-gaming-utilities-wallet",
  "icici-emirates-rubyx": "fuel-gaming-utilities-wallet",

  // gaming-wallet (2 cards)
  "icici-hpcl-coral": "gaming-wallet",
  "icici-hpcl-super-saver": "gaming-wallet",

  // Single-card patterns
  "amex-mrcc": "government-insurance",
  "axis-magnus": "emi-wallet",
  "axis-atlas": "emi-fuel-wallet",
  "axis-cashback": "emi-fuel-rent-wallet",
  "icici-times-black": "emi-fuel-gaming-rent-wallet",
  "axis-lic-signature": "fuel-rent",
  "hdfc-swiggy": "fuel-rent-utilities",
  "sbi-cashback": "fuel-utilities-wallet",
  "bpcl-sbi-octane": "non-bpcl-fuel-wallet",
  "flipkart-axis": "rent-apps-wallet",
  "idfc-power-plus": "cash-emi",
  "idfc-ashva": "cash-emi-fuel",
  "idfc-first-classic": "emi-fuel-rent",
};

// ─── Helpers ────────────────────────────────────────────────────────────

/** Get the exclusion set for a card */
export function getCardExclusionSet(cardId: string): ExclusionSet | undefined {
  const setId = CARD_EXCLUSION_MAP[cardId];
  return setId ? EXCLUSION_SETS[setId] : undefined;
}

/** Get detailed exclusion types for a card */
export function getCardExclusions(cardId: string): ExclusionType[] {
  const setId = CARD_EXCLUSION_MAP[cardId];
  if (!setId) return [];
  const set = EXCLUSION_SETS[setId];
  if (!set) return [];
  return set.exclusionIds.map((id) => EXCLUSION_TYPES[id]).filter(Boolean);
}

/** Get display-friendly exclusion names for a card */
export function getCardExclusionNames(cardId: string): string[] {
  return getCardExclusions(cardId).map((e) => e.displayName);
}

/** Check if a specific exclusion applies to a card */
export function isExcluded(cardId: string, exclusionId: string): boolean {
  const setId = CARD_EXCLUSION_MAP[cardId];
  if (!setId) return false;
  const set = EXCLUSION_SETS[setId];
  return set?.exclusionIds.includes(exclusionId) ?? false;
}

/** Check if a card has ANY exclusions */
export function hasExclusions(cardId: string): boolean {
  const setId = CARD_EXCLUSION_MAP[cardId];
  return setId !== undefined && setId !== "none";
}

/** Get all cards sharing the same exclusion set */
export function getCardsWithSameExclusions(cardId: string): string[] {
  const setId = CARD_EXCLUSION_MAP[cardId];
  if (!setId) return [];
  return Object.entries(CARD_EXCLUSION_MAP)
    .filter(([, s]) => s === setId)
    .map(([id]) => id);
}

/** Get the most common exclusion types across all cards */
export function getMostCommonExclusions(): { type: ExclusionType; count: number }[] {
  const counts: Record<string, number> = {};
  for (const setId of Object.values(CARD_EXCLUSION_MAP)) {
    const set = EXCLUSION_SETS[setId];
    if (!set) continue;
    for (const exId of set.exclusionIds) {
      counts[exId] = (counts[exId] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([id, count]) => ({ type: EXCLUSION_TYPES[id], count }))
    .filter((e) => e.type)
    .sort((a, b) => b.count - a.count);
}
