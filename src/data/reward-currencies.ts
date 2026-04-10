/**
 * Reward Currencies — Standardized point/reward currency definitions
 *
 * Single source of truth for all reward point systems used by Indian credit cards.
 * Standardizes currency names and values that are inconsistently referenced across:
 * - card-v3-data.ts (pointCurrency field)
 * - rewards-calc-data.json (rewardName field)
 * - redemption-calc-data.json (pointCurrency field)
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface RewardCurrency {
  /** Unique identifier */
  id: string;
  /** Full display name */
  displayName: string;
  /** Short abbreviation for compact UI */
  abbreviation: string;
  /** Bank that issues this currency (null if multi-bank) */
  bankId: string | null;
  /** Type of reward */
  type: "points" | "cashback" | "miles" | "coins" | "other";
  /** Approximate value per unit in INR (for best redemption option) */
  bestValueInr: number;
  /** Approximate value per unit in INR (for worst/statement credit option) */
  worstValueInr: number;
  /** Can be transferred to loyalty programs */
  transferable: boolean;
  /** Additional notes */
  note: string | null;
}

// ─── Currency Definitions ───────────────────────────────────────────────

export const REWARD_CURRENCIES: Record<string, RewardCurrency> = {
  // ── HDFC ──
  "hdfc-rp": {
    id: "hdfc-rp",
    displayName: "HDFC Reward Points",
    abbreviation: "RP",
    bankId: "hdfc",
    type: "points",
    bestValueInr: 0.50,
    worstValueInr: 0.20,
    transferable: true,
    note: "Redeemable via SmartBuy for best value. Transfer to KrisFlyer at 2:1.",
  },
  "edge-rp": {
    id: "edge-rp",
    displayName: "EDGE Reward Points",
    abbreviation: "EDGE RP",
    bankId: "hdfc",
    type: "points",
    bestValueInr: 0.50,
    worstValueInr: 0.20,
    transferable: true,
    note: "Used by newer HDFC cards (Pixel, PhonePe, Swiggy). Same ecosystem as HDFC RP.",
  },

  // ── Axis ──
  "axis-edge": {
    id: "axis-edge",
    displayName: "EDGE Reward Points",
    abbreviation: "EDGE",
    bankId: "axis",
    type: "points",
    bestValueInr: 0.50,
    worstValueInr: 0.25,
    transferable: true,
    note: "Transferable to InterMiles, Marriott Bonvoy, ITC Hotels.",
  },

  // ── ICICI ──
  "icici-rp": {
    id: "icici-rp",
    displayName: "ICICI Reward Points",
    abbreviation: "RP",
    bankId: "icici",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.15,
    transferable: false,
    note: "Redeemable via iShop catalogue or statement credit.",
  },

  // ── SBI ──
  "sbi-rp": {
    id: "sbi-rp",
    displayName: "SBI Reward Points",
    abbreviation: "RP",
    bankId: "sbi",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: "Redeemable via SBI Rewardz portal.",
  },

  // ── Amex ──
  "membership-rewards": {
    id: "membership-rewards",
    displayName: "Membership Rewards",
    abbreviation: "MR",
    bankId: "amex",
    type: "points",
    bestValueInr: 0.50,
    worstValueInr: 0.30,
    transferable: true,
    note: "Premium Amex currency. Transfer to InterMiles at 1:1.",
  },

  // ── IndusInd ──
  "indusind-rp": {
    id: "indusind-rp",
    displayName: "IndusInd Reward Points",
    abbreviation: "RP",
    bankId: "indusind",
    type: "points",
    bestValueInr: 0.35,
    worstValueInr: 0.15,
    transferable: false,
    note: null,
  },

  // ── Kotak ──
  "kotak-rp": {
    id: "kotak-rp",
    displayName: "Kotak Reward Points",
    abbreviation: "RP",
    bankId: "kotak",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.07,
    transferable: false,
    note: "Mojo Points devalued to ₹0.07 in June 2025.",
  },

  // ── HSBC ──
  "hsbc-rp": {
    id: "hsbc-rp",
    displayName: "HSBC Reward Points",
    abbreviation: "RP",
    bankId: "hsbc",
    type: "points",
    bestValueInr: 0.35,
    worstValueInr: 0.20,
    transferable: true,
    note: "HSBC Travel One can transfer to Singapore Airlines at 1:1.",
  },

  // ── IDFC ──
  "idfc-rp": {
    id: "idfc-rp",
    displayName: "IDFC FIRST Reward Points",
    abbreviation: "RP",
    bankId: "idfc",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.15,
    transferable: false,
    note: "International rewards cut from 10X to 5X in Jan 2026.",
  },

  // ── BOB ──
  "bob-rp": {
    id: "bob-rp",
    displayName: "BOB Reward Points",
    abbreviation: "RP",
    bankId: "bob",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: null,
  },

  // ── Federal ──
  "federal-rp": {
    id: "federal-rp",
    displayName: "Federal Bank Reward Points",
    abbreviation: "RP",
    bankId: "federal",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: null,
  },

  // ── RBL ──
  "rbl-rp": {
    id: "rbl-rp",
    displayName: "RBL Reward Points",
    abbreviation: "RP",
    bankId: "rbl",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: null,
  },

  // ── SC ──
  "sc-rp": {
    id: "sc-rp",
    displayName: "SC Reward Points",
    abbreviation: "RP",
    bankId: "sc",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.15,
    transferable: false,
    note: "Standard Chartered reward points.",
  },

  // ── YES Bank ──
  "yes-rp": {
    id: "yes-rp",
    displayName: "YES Reward Points",
    abbreviation: "RP",
    bankId: "yes-bank",
    type: "points",
    bestValueInr: 0.15,
    worstValueInr: 0.15,
    transferable: false,
    note: "Massively devalued from ₹1.00 to ₹0.15 per point in Jan 2026.",
  },

  // ── AU ──
  "au-rp": {
    id: "au-rp",
    displayName: "AU Reward Points",
    abbreviation: "RP",
    bankId: "au-bank",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: true,
    note: "AU Zenith+ can transfer to InterMiles and ITC Hotels.",
  },
  "aurum-rp": {
    id: "aurum-rp",
    displayName: "Aurum Reward Points",
    abbreviation: "Aurum",
    bankId: "au-bank",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: "Used by AU Vetta and select AU cards.",
  },

  // ── Miles/Specialty Currencies ──
  avios: {
    id: "avios",
    displayName: "Avios",
    abbreviation: "Avios",
    bankId: "indusind",
    type: "miles",
    bestValueInr: 0.80,
    worstValueInr: 0.40,
    transferable: true,
    note: "IndusInd Avios card earns directly. Transferable to BA and Qatar.",
  },
  "emirates-miles": {
    id: "emirates-miles",
    displayName: "Emirates Skywards Miles",
    abbreviation: "Skywards",
    bankId: "icici",
    type: "miles",
    bestValueInr: 0.96,
    worstValueInr: 0.50,
    transferable: false,
    note: "Earned directly on ICICI Emirates co-branded cards.",
  },
  "etihad-miles": {
    id: "etihad-miles",
    displayName: "Etihad Guest Miles",
    abbreviation: "Guest Miles",
    bankId: "bob",
    type: "miles",
    bestValueInr: 0.75,
    worstValueInr: 0.40,
    transferable: false,
    note: "Earned directly on BOB Etihad co-branded cards.",
  },
  "cv-points": {
    id: "cv-points",
    displayName: "Club Vistara Points",
    abbreviation: "CV Points",
    bankId: "sbi",
    type: "miles",
    bestValueInr: 0.50,
    worstValueInr: 0.25,
    transferable: true,
    note: "Transferable to KrisFlyer. Vistara merged with Air India — use soon.",
  },
  "marriott-points": {
    id: "marriott-points",
    displayName: "Marriott Bonvoy Points",
    abbreviation: "Bonvoy",
    bankId: "hdfc",
    type: "points",
    bestValueInr: 0.55,
    worstValueInr: 0.30,
    transferable: true,
    note: "Earned on Marriott Bonvoy HDFC card. Transfer to 40+ airlines at 3:1.",
  },
  "6e-rp": {
    id: "6e-rp",
    displayName: "6E Reward Points",
    abbreviation: "6E RP",
    bankId: "hdfc",
    type: "points",
    bestValueInr: 0.30,
    worstValueInr: 0.15,
    transferable: false,
    note: "HDFC IndiGo co-branded card. Redeemable on IndiGo flights.",
  },
  bluchips: {
    id: "bluchips",
    displayName: "BluChips",
    abbreviation: "BluChips",
    bankId: "kotak",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: "Kotak IndiGo BluChip card. Redeemable on IndiGo flights.",
  },

  // ── Cashback Currencies ──
  cashback: {
    id: "cashback",
    displayName: "Cashback",
    abbreviation: "CB",
    bankId: null,
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "Direct statement credit or bank account credit. Always ₹1 = ₹1.",
  },
  "amazon-pay": {
    id: "amazon-pay",
    displayName: "Amazon Pay Balance",
    abbreviation: "Amazon",
    bankId: "icici",
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "Amazon Pay ICICI card. Earned as Amazon Pay balance.",
  },
  neucoins: {
    id: "neucoins",
    displayName: "NeuCoins",
    abbreviation: "NeuCoins",
    bankId: "sbi",
    type: "coins",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "SBI Tata Neu cards. 1 NeuCoin = ₹1 across Tata ecosystem.",
  },

  // ── Fintech/Neo-bank Currencies ──
  "cred-coins": {
    id: "cred-coins",
    displayName: "CRED Coins",
    abbreviation: "Coins",
    bankId: "cred",
    type: "coins",
    bestValueInr: 0.25,
    worstValueInr: 0.05,
    transferable: false,
    note: "CRED Mint card. Variable value depending on offers.",
  },
  "scapia-coins": {
    id: "scapia-coins",
    displayName: "Scapia Coins",
    abbreviation: "Coins",
    bankId: "scapia",
    type: "coins",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "Scapia Federal card. Redeemable for flights at 1:1.",
  },
  cashpoints: {
    id: "cashpoints",
    displayName: "CashPoints",
    abbreviation: "CP",
    bankId: null,
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "Direct cashback equivalent used by some cards.",
  },
  "fuel-points": {
    id: "fuel-points",
    displayName: "Fuel Points",
    abbreviation: "FP",
    bankId: null,
    type: "points",
    bestValueInr: 1.0,
    worstValueInr: 0.50,
    transferable: false,
    note: "Earned on fuel co-branded cards (BPCL, IOCL, Jio-bp).",
  },
  eazypoints: {
    id: "eazypoints",
    displayName: "EazyPoints",
    abbreviation: "EP",
    bankId: "indusind",
    type: "points",
    bestValueInr: 0.30,
    worstValueInr: 0.10,
    transferable: false,
    note: "IndusInd EazyDiner card. Redeemable for dining bookings.",
  },
  "kiwi-points": {
    id: "kiwi-points",
    displayName: "Kiwi Points",
    abbreviation: "Kiwi",
    bankId: null,
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: null,
  },
  mycash: {
    id: "mycash",
    displayName: "MyCash",
    abbreviation: "MyCash",
    bankId: null,
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: null,
  },
  "niyo-coins": {
    id: "niyo-coins",
    displayName: "Niyo Coins",
    abbreviation: "Niyo",
    bankId: null,
    type: "coins",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: null,
  },
  "digital-gold": {
    id: "digital-gold",
    displayName: "Digital Gold",
    abbreviation: "Gold",
    bankId: null,
    type: "other",
    bestValueInr: 1.0,
    worstValueInr: 0.90,
    transferable: false,
    note: "Earned as fractional digital gold. Value fluctuates with gold price.",
  },
  "samsung-rp": {
    id: "samsung-rp",
    displayName: "Samsung Reward Points",
    abbreviation: "Samsung RP",
    bankId: "axis",
    type: "points",
    bestValueInr: 0.25,
    worstValueInr: 0.10,
    transferable: false,
    note: "Axis Samsung Infinite card. Redeemable at Samsung store.",
  },
  "pvr-tickets": {
    id: "pvr-tickets",
    displayName: "PVR Tickets",
    abbreviation: "PVR",
    bankId: null,
    type: "other",
    bestValueInr: 1.0,
    worstValueInr: 1.0,
    transferable: false,
    note: "Complimentary PVR movie tickets. Value based on ticket price.",
  },
  "cashback-happy-coins": {
    id: "cashback-happy-coins",
    displayName: "Cashback + Happy Coins",
    abbreviation: "CB+HC",
    bankId: null,
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 0.80,
    transferable: false,
    note: "Split currency: part cashback, part Happy Coins for offers.",
  },
  "cashback-rp": {
    id: "cashback-rp",
    displayName: "Cashback + Reward Points",
    abbreviation: "CB+RP",
    bankId: null,
    type: "cashback",
    bestValueInr: 1.0,
    worstValueInr: 0.50,
    transferable: false,
    note: "Split currency: part direct cashback, part bank reward points.",
  },
};

// ─── Display Name → Currency ID Mapping ─────────────────────────────────

/** Maps the display name strings found in card data to currency IDs */
export const CURRENCY_NAME_MAP: Record<string, string> = {
  "Reward Points": "hdfc-rp",
  "EDGE Reward Points": "edge-rp",
  "Edge Reward Points": "axis-edge",
  "ICICI Reward Points": "icici-rp",
  "SBI Reward Points": "sbi-rp",
  "Membership Rewards": "membership-rewards",
  "IndusInd Reward Points": "indusind-rp",
  "Kotak Reward Points": "kotak-rp",
  "HSBC Reward Points": "hsbc-rp",
  "IDFC FIRST Reward Points": "idfc-rp",
  "BOB Reward Points": "bob-rp",
  "Federal Bank Reward Points": "federal-rp",
  "RBL Reward Points": "rbl-rp",
  "SC Reward Points": "sc-rp",
  "YES Reward Points": "yes-rp",
  "AU Reward Points": "au-rp",
  "Aurum Reward Points": "aurum-rp",
  Avios: "avios",
  "Emirates Skywards Miles": "emirates-miles",
  "Etihad Guest Miles": "etihad-miles",
  "Club Vistara Points": "cv-points",
  "Marriott Bonvoy Points": "marriott-points",
  "6E Reward Points": "6e-rp",
  BluChips: "bluchips",
  Cashback: "cashback",
  "Amazon Pay Balance": "amazon-pay",
  NeuCoins: "neucoins",
  "CRED Coins": "cred-coins",
  "Scapia Coins": "scapia-coins",
  CashPoints: "cashpoints",
  "Fuel Points": "fuel-points",
  EazyPoints: "eazypoints",
  "Kiwi Points": "kiwi-points",
  MyCash: "mycash",
  "Niyo Coins": "niyo-coins",
  "Digital Gold": "digital-gold",
  "Samsung Reward Points": "samsung-rp",
  "PVR Tickets": "pvr-tickets",
  "Cashback + Happy Coins": "cashback-happy-coins",
  "Cashback + RP": "cashback-rp",
};

// ─── Helpers ────────────────────────────────────────────────────────────

/** Look up currency by ID */
export function getCurrency(id: string): RewardCurrency | undefined {
  return REWARD_CURRENCIES[id];
}

/** Look up currency by its display name (as found in card data) */
export function getCurrencyByName(displayName: string): RewardCurrency | undefined {
  const id = CURRENCY_NAME_MAP[displayName];
  return id ? REWARD_CURRENCIES[id] : undefined;
}

/** Get the best redemption value for a currency */
export function getBestValue(currencyId: string): number {
  return REWARD_CURRENCIES[currencyId]?.bestValueInr ?? 0.25;
}

/** Get all currencies for a specific bank */
export function getCurrenciesForBank(bankId: string): RewardCurrency[] {
  return Object.values(REWARD_CURRENCIES).filter((c) => c.bankId === bankId);
}

/** Get all transferable currencies */
export function getTransferableCurrencies(): RewardCurrency[] {
  return Object.values(REWARD_CURRENCIES).filter((c) => c.transferable);
}

/** Format points display: "10,000 MR" or "₹500 Cashback" */
export function formatPoints(amount: number, currencyId: string): string {
  const currency = REWARD_CURRENCIES[currencyId];
  if (!currency) return `${amount.toLocaleString("en-IN")} points`;
  if (currency.type === "cashback") return `₹${amount.toLocaleString("en-IN")}`;
  return `${amount.toLocaleString("en-IN")} ${currency.abbreviation}`;
}
