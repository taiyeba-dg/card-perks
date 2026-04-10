/**
 * Lounge Programs — Centralized Lounge Access Data
 *
 * Defines all major lounge access programs available to Indian credit card holders.
 * Cards reference program IDs; this file provides the program details.
 *
 * Last verified: March 31, 2026
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface LoungeNetwork {
  /** Unique program identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Type of program */
  type: "membership" | "network" | "bank-program";
  /** How access is provided */
  accessMethod: "physical-card" | "digital-pass" | "qr-code" | "app";
  /** Number of lounges in India */
  indianLounges: number;
  /** Number of lounges worldwide */
  globalLounges: number;
  /** Approximate cost if purchased independently (₹/year) */
  independentCost: number;
  /** Per-visit value estimate */
  perVisitValue: {
    domestic: number;
    international: number;
  };
  /** Key airports covered in India */
  keyIndianAirports: string[];
  /** URL for more info */
  url: string | null;
  /** Additional notes */
  note: string | null;
}

export interface CardLoungeAccess {
  /** Card ID */
  cardId: string;
  /** Programs this card provides access to */
  programs: {
    programId: string;
    /** Number of free visits per quarter/year */
    freeVisits: number;
    /** Period for free visits */
    period: "monthly" | "quarterly" | "annual" | "unlimited";
    /** Whether visits are unlimited */
    unlimited: boolean;
    /** Spend required to unlock access (₹/quarter) — null if no requirement */
    spendRequired: number | null;
    /** Whether guest access is included */
    guestAccess: boolean;
    /** Guest fee if applicable */
    guestFee: number | null;
    /** Additional notes */
    note: string | null;
  }[];
  /** Annual lounge value estimate (₹) */
  estimatedAnnualValue: number;
}

// ─── Lounge Network Definitions ─────────────────────────────────────────

export const LOUNGE_NETWORKS: Record<string, LoungeNetwork> = {
  "priority-pass": {
    id: "priority-pass",
    name: "Priority Pass",
    description:
      "Premium global lounge network with access to 1,500+ lounges worldwide including Centurion Lounges",
    type: "membership",
    accessMethod: "digital-pass",
    indianLounges: 35,
    globalLounges: 1500,
    independentCost: 25000,
    perVisitValue: {
      domestic: 2000,
      international: 3500,
    },
    keyIndianAirports: ["DEL T3", "BOM T2", "BLR", "HYD", "MAA", "CCU", "GOI"],
    url: "https://www.prioritypass.com",
    note: "Access via physical membership card or Priority Pass app; includes Centurion Lounge access for Amex cards",
  },

  dreamfolks: {
    id: "dreamfolks",
    name: "DreamFolks (DragonPass India)",
    description:
      "Largest domestic lounge network in India, covering all major and many tier-2 airports",
    type: "network",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
      "PNQ",
      "COK",
      "LKO",
      "JAI",
      "IXC",
    ],
    url: "https://www.dreamfolks.in",
    note: "Access via DreamFolks mobile app; most RuPay and government bank cards",
  },

  "visa-infinite-lounge": {
    id: "visa-infinite-lounge",
    name: "Visa Infinite Lounge Access",
    description:
      "Visa network program for Visa Infinite and Signature cardholders",
    type: "network",
    accessMethod: "physical-card",
    indianLounges: 25,
    globalLounges: 200,
    independentCost: 3000,
    perVisitValue: {
      domestic: 1500,
      international: 2500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.visainfinite.com",
    note: "Included with Visa Infinite and Signature tier cards; varies by bank and card tier",
  },

  "mastercard-world-lounge": {
    id: "mastercard-world-lounge",
    name: "Mastercard World Lounge Access",
    description:
      "Mastercard program for World and World Elite cardholders with partner lounge network",
    type: "network",
    accessMethod: "physical-card",
    indianLounges: 20,
    globalLounges: 150,
    independentCost: 3000,
    perVisitValue: {
      domestic: 1500,
      international: 2500,
    },
    keyIndianAirports: ["DEL T3", "BOM T2", "BLR", "HYD", "MAA", "CCU"],
    url: "https://www.mastercard.co.in",
    note: "Limited availability; varies by card tier and bank partnership",
  },

  "diners-club-lounge": {
    id: "diners-club-lounge",
    name: "Diners Club Lounge Access",
    description:
      "Premium Diners Club network with global presence, especially strong in luxury lounges",
    type: "membership",
    accessMethod: "physical-card",
    indianLounges: 30,
    globalLounges: 1000,
    independentCost: 20000,
    perVisitValue: {
      domestic: 2000,
      international: 3500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.dinersclub.co.in",
    note: "Unlimited access with Diners Club Black and Metal cards; 6-8 visits/year with premium variants",
  },

  "amex-lounge": {
    id: "amex-lounge",
    name: "American Express Centurion & Partner Lounges",
    description:
      "Amex exclusive lounge program with Centurion Lounges and partner network",
    type: "membership",
    accessMethod: "physical-card",
    indianLounges: 15,
    globalLounges: 50,
    independentCost: 30000,
    perVisitValue: {
      domestic: 2500,
      international: 4000,
    },
    keyIndianAirports: ["DEL T3", "BOM T2", "BLR", "HYD"],
    url: "https://www.americanexpress.co.in",
    note: "Available to Amex Platinum Charge and Select higher-tier cards; limited domestic locations",
  },

  "hdfc-lounge-program": {
    id: "hdfc-lounge-program",
    name: "HDFC Bank Lounge Program",
    description:
      "Bank-specific lounge benefits via DreamFolks and Priority Pass depending on card tier",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 1500,
    independentCost: 8000,
    perVisitValue: {
      domestic: 1500,
      international: 3000,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.hdfcbank.com",
    note: "Premium HDFC cards get Priority Pass; others via DreamFolks or Diners Club network",
  },

  "axis-lounge-program": {
    id: "axis-lounge-program",
    name: "Axis Bank Lounge Program",
    description: "Bank-specific program primarily via DreamFolks and partner networks",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.axisbank.com",
    note: "Limited to premium cards; most leverage DreamFolks partnership",
  },

  "au-bank-lounge-program": {
    id: "au-bank-lounge-program",
    name: "AU Bank Lounge Program",
    description: "AU Small Finance Bank lounge access via Visa network",
    type: "bank-program",
    accessMethod: "physical-card",
    indianLounges: 25,
    globalLounges: 200,
    independentCost: 3000,
    perVisitValue: {
      domestic: 1500,
      international: 2500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.aubank.in",
    note: "AU Zenith+ offers unlimited access; others vary by card tier",
  },

  "bob-lounge-program": {
    id: "bob-lounge-program",
    name: "Bank of Baroda Lounge Program",
    description:
      "BOB lounge access via DreamFolks partnership and Visa network benefits",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.bankofbaroda.in",
    note: "BOB Etihad Premier and Eterna cards offer generous benefits",
  },

  "federal-lounge-program": {
    id: "federal-lounge-program",
    name: "Federal Bank Lounge Program",
    description: "Federal Bank lounge access via DreamFolks and bank partnerships",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.federalbank.co.in",
    note: "Federal Celesta and Banco cards offer up to 8 domestic visits/year",
  },

  "icici-lounge-program": {
    id: "icici-lounge-program",
    name: "ICICI Bank Lounge Program",
    description:
      "ICICI Bank lounge benefits via Priority Pass and DreamFolks for premium cards",
    type: "bank-program",
    accessMethod: "digital-pass",
    indianLounges: 60,
    globalLounges: 1500,
    independentCost: 8000,
    perVisitValue: {
      domestic: 1500,
      international: 3000,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.icicibank.com",
    note: "ICICI Emeralde and Times Black cards feature Priority Pass access",
  },

  "idfc-lounge-program": {
    id: "idfc-lounge-program",
    name: "IDFC Bank Lounge Program",
    description:
      "IDFC First Bank lounge access via DreamFolks for credit card holders",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.idfcfirstbank.com",
    note: "IDFC Gaj and First Private cards offer lounge benefits",
  },

  "sbi-lounge-program": {
    id: "sbi-lounge-program",
    name: "State Bank of India Lounge Program",
    description:
      "SBI lounge access via DreamFolks partnership for government bank integration",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.sbi.co.in",
    note: "SBI cards primarily leverage DreamFolks network; select premium cards may offer more",
  },

  "yes-bank-lounge-program": {
    id: "yes-bank-lounge-program",
    name: "Yes Bank Lounge Program",
    description: "Yes Bank lounge access via Priority Pass for select cards",
    type: "bank-program",
    accessMethod: "digital-pass",
    indianLounges: 35,
    globalLounges: 1500,
    independentCost: 25000,
    perVisitValue: {
      domestic: 2000,
      international: 3500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.yesbank.in",
    note: "Yes Reserv card features unlimited Priority Pass access",
  },

  "kotak-lounge-program": {
    id: "kotak-lounge-program",
    name: "Kotak Mahindra Bank Lounge Program",
    description:
      "Kotak lounge access via DreamFolks and bank-specific partnerships",
    type: "bank-program",
    accessMethod: "qr-code",
    indianLounges: 60,
    globalLounges: 70,
    independentCost: 4000,
    perVisitValue: {
      domestic: 1200,
      international: 1500,
    },
    keyIndianAirports: [
      "DEL T3",
      "BOM T2",
      "BLR",
      "HYD",
      "MAA",
      "CCU",
      "GOI",
    ],
    url: "https://www.kotak.com",
    note: "Select Kotak premium cards offer lounge benefits",
  },
};

// ─── Card Lounge Access Mapping ────────────────────────────────────────

export const CARD_LOUNGE_ACCESS: Record<string, CardLoungeAccess> = {
  "amex-platinum-charge": {
    cardId: "amex-platinum-charge",
    programs: [
      {
        programId: "amex-lounge",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: 10000,
        note: "Unlimited Centurion Lounge access + 1 complimentary guest per visit",
      },
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Full Priority Pass membership included; guest access through card membership",
      },
    ],
    estimatedAnnualValue: 150000,
  },

  "amex-platinum-reserve": {
    cardId: "amex-platinum-reserve",
    programs: [
      {
        programId: "amex-lounge",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 5000,
        note: "8 domestic visits/year; guest access available",
      },
      {
        programId: "priority-pass",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 international Priority Pass visits/year",
      },
    ],
    estimatedAnnualValue: 32000,
  },

  "amex-platinum-travel": {
    cardId: "amex-platinum-travel",
    programs: [
      {
        programId: "amex-lounge",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year",
      },
      {
        programId: "priority-pass",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 international Priority Pass visits/year",
      },
    ],
    estimatedAnnualValue: 16000,
  },

  "amex-gold-charge": {
    cardId: "amex-gold-charge",
    programs: [
      {
        programId: "amex-lounge",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year only",
      },
    ],
    estimatedAnnualValue: 8000,
  },

  "amex-mrcc": {
    cardId: "amex-mrcc",
    programs: [
      {
        programId: "amex-lounge",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year",
      },
    ],
    estimatedAnnualValue: 8000,
  },

  "au-zenith-plus": {
    cardId: "au-zenith-plus",
    programs: [
      {
        programId: "au-bank-lounge-program",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "Unlimited domestic + international lounge access via Visa Infinite network",
      },
      {
        programId: "visa-infinite-lounge",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Visa Infinite lounge network included",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "au-zenith": {
    cardId: "au-zenith",
    programs: [
      {
        programId: "au-bank-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "8 domestic + 4 international lounge visits/year via Visa Signature network",
      },
    ],
    estimatedAnnualValue: 20000,
  },

  "au-vetta": {
    cardId: "au-vetta",
    programs: [
      {
        programId: "au-bank-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "4 domestic + 2 international visits/year",
      },
    ],
    estimatedAnnualValue: 9000,
  },

  "ixigo-au": {
    cardId: "ixigo-au",
    programs: [
      {
        programId: "au-bank-lounge-program",
        freeVisits: 2,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "2 domestic lounge visits/year",
      },
    ],
    estimatedAnnualValue: 3000,
  },

  "au-lit": {
    cardId: "au-lit",
    programs: [
      {
        programId: "au-bank-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year for lifetime free card",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "axis-samsung-infinite": {
    cardId: "axis-samsung-infinite",
    programs: [
      {
        programId: "axis-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "8 domestic + 4 international lounge visits/year",
      },
    ],
    estimatedAnnualValue: 20000,
  },

  "axis-vistara-infinite": {
    cardId: "axis-vistara-infinite",
    programs: [
      {
        programId: "axis-lounge-program",
        freeVisits: 2,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "2 domestic lounge visits/year; Vistara co-branded benefit",
      },
    ],
    estimatedAnnualValue: 3000,
  },

  "axis-vistara-signature": {
    cardId: "axis-vistara-signature",
    programs: [
      {
        programId: "axis-lounge-program",
        freeVisits: 2,
        period: "quarterly",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "2 lounge visits per quarter = 8/year; Vistara partnership",
      },
    ],
    estimatedAnnualValue: 10000,
  },

  "bob-etihad-premier": {
    cardId: "bob-etihad-premier",
    programs: [
      {
        programId: "bob-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "8 domestic + 4 international lounge visits/year via DreamFolks",
      },
    ],
    estimatedAnnualValue: 20000,
  },

  "bob-eterna": {
    cardId: "bob-eterna",
    programs: [
      {
        programId: "bob-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "8 domestic + 4 international visits/year; priority lounge access",
      },
    ],
    estimatedAnnualValue: 20000,
  },

  "bob-premier": {
    cardId: "bob-premier",
    programs: [
      {
        programId: "bob-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "4 domestic + 2 international lounge visits/year",
      },
    ],
    estimatedAnnualValue: 9000,
  },

  "bob-etihad": {
    cardId: "bob-etihad",
    programs: [
      {
        programId: "bob-lounge-program",
        freeVisits: 2,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "2 domestic lounge visits/year",
      },
    ],
    estimatedAnnualValue: 3000,
  },

  "onecard": {
    cardId: "onecard",
    programs: [
      {
        programId: "dreamfolks",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year via DreamFolks app",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "federal-celesta": {
    cardId: "federal-celesta",
    programs: [
      {
        programId: "federal-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "8 domestic + 4 international lounge visits/year",
      },
    ],
    estimatedAnnualValue: 20000,
  },

  "federal-imperio": {
    cardId: "federal-imperio",
    programs: [
      {
        programId: "federal-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 2000,
        note: "4 domestic lounge visits/year",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "amplifi-fi-federal": {
    cardId: "amplifi-fi-federal",
    programs: [
      {
        programId: "federal-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year; Amplifi co-branded",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "federal-signet": {
    cardId: "federal-signet",
    programs: [
      {
        programId: "federal-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "scapia-federal": {
    cardId: "scapia-federal",
    programs: [
      {
        programId: "federal-lounge-program",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 domestic lounge visits/year; Scapia co-branded",
      },
    ],
    estimatedAnnualValue: 5000,
  },

  "hdfc-infinia-metal": {
    cardId: "hdfc-infinia-metal",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited domestic lounge access via Priority Pass membership",
      },
      {
        programId: "hdfc-lounge-program",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: 10000,
        note: "Additional international Priority Pass access with guest privileges",
      },
    ],
    estimatedAnnualValue: 150000,
  },

  "hdfc-diners-club-black-metal": {
    cardId: "hdfc-diners-club-black-metal",
    programs: [
      {
        programId: "diners-club-lounge",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: 5000,
        note: "Unlimited domestic + 1000+ international Diners Club lounge access",
      },
      {
        programId: "hdfc-lounge-program",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Primary lounge access via Diners Club network",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "hdfc-diners-club-black": {
    cardId: "hdfc-diners-club-black",
    programs: [
      {
        programId: "diners-club-lounge",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: 5000,
        note: "Unlimited domestic Diners Club lounge access",
      },
    ],
    estimatedAnnualValue: 100000,
  },

  "hdfc-bizblack-metal": {
    cardId: "hdfc-bizblack-metal",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited domestic + international Priority Pass access for business card",
      },
    ],
    estimatedAnnualValue: 150000,
  },

  "hdfc-shoppers-stop-black": {
    cardId: "hdfc-shoppers-stop-black",
    programs: [
      {
        programId: "hdfc-lounge-program",
        freeVisits: 16,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: true,
        guestFee: 3000,
        note: "16 domestic (4/quarter) + 8 international (2/quarter) lounge visits/year",
      },
    ],
    estimatedAnnualValue: 42000,
  },

  "marriott-bonvoy-hdfc": {
    cardId: "marriott-bonvoy-hdfc",
    programs: [
      {
        programId: "hdfc-lounge-program",
        freeVisits: 12,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "12 domestic lounge visits/year via DreamFolks",
      },
      {
        programId: "diners-club-lounge",
        freeVisits: 12,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "12 international Diners Club lounge visits/year",
      },
    ],
    estimatedAnnualValue: 36000,
  },

  "hdfc-regalia": {
    cardId: "hdfc-regalia",
    programs: [
      {
        programId: "hdfc-lounge-program",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: 100000,
        guestAccess: false,
        guestFee: null,
        note: "8 domestic lounge visits/year (2/quarter); requires ₹1L spend/quarter to activate",
      },
      {
        programId: "priority-pass",
        freeVisits: 6,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "6 international Priority Pass visits/year",
      },
    ],
    estimatedAnnualValue: 18000,
  },

  "hdfc-regalia-gold": {
    cardId: "hdfc-regalia-gold",
    programs: [
      {
        programId: "hdfc-lounge-program",
        freeVisits: 2,
        period: "quarterly",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "2 domestic lounge visits per quarter = 8/year",
      },
      {
        programId: "priority-pass",
        freeVisits: 6,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "6 international Priority Pass visits/year",
      },
    ],
    estimatedAnnualValue: 18000,
  },

  "hdfc-diners-club-privilege": {
    cardId: "hdfc-diners-club-privilege",
    programs: [
      {
        programId: "diners-club-lounge",
        freeVisits: 8,
        period: "annual",
        unlimited: false,
        spendRequired: 250000,
        guestAccess: true,
        guestFee: 3000,
        note: "8 domestic visits/year (2/quarter); requires ₹2.5L quarterly spend",
      },
    ],
    estimatedAnnualValue: 12000,
  },

  "hdfc-tata-neu-infinity": {
    cardId: "hdfc-tata-neu-infinity",
    programs: [
      {
        programId: "hdfc-lounge-program",
        freeVisits: 2,
        period: "quarterly",
        unlimited: false,
        spendRequired: 150000,
        guestAccess: false,
        guestFee: null,
        note: "2 domestic lounge visits/quarter (8/year); spend-based activation",
      },
      {
        programId: "priority-pass",
        freeVisits: 4,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "4 international Priority Pass visits/year",
      },
    ],
    estimatedAnnualValue: 14000,
  },

  "hdfc-regalia-first": {
    cardId: "hdfc-regalia-first",
    programs: [
      {
        programId: "dreamfolks",
        freeVisits: 6,
        period: "quarterly",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "6 lounge visits per quarter = 24/year via DreamFolks app",
      },
    ],
    estimatedAnnualValue: 30000,
  },

  "hdfc-diners-clubmiles": {
    cardId: "hdfc-diners-clubmiles",
    programs: [
      {
        programId: "diners-club-lounge",
        freeVisits: 6,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "6 domestic lounge visits/year",
      },
      {
        programId: "hdfc-lounge-program",
        freeVisits: 700,
        period: "annual",
        unlimited: false,
        spendRequired: null,
        guestAccess: false,
        guestFee: null,
        note: "700+ international lounges access via Diners Club network",
      },
    ],
    estimatedAnnualValue: 24000,
  },

  "icici-emeralde": {
    cardId: "icici-emeralde",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Priority Pass membership for unlimited lounge access",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "icici-emeralde-private-metal": {
    cardId: "icici-emeralde-private-metal",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited Priority Pass access for private metal card",
      },
    ],
    estimatedAnnualValue: 150000,
  },

  "icici-times-black": {
    cardId: "icici-times-black",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited Priority Pass membership with Times co-branding",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "idfc-first-private": {
    cardId: "idfc-first-private",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited Priority Pass access for private banking clients",
      },
    ],
    estimatedAnnualValue: 150000,
  },

  "idfc-gaj": {
    cardId: "idfc-gaj",
    programs: [
      {
        programId: "idfc-lounge-program",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited lounge access through IDFC partnership",
      },
    ],
    estimatedAnnualValue: 100000,
  },

  "indusind-pioneer-heritage": {
    cardId: "indusind-pioneer-heritage",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Priority Pass membership for IndusInd premium clients",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "rbl-insignia": {
    cardId: "rbl-insignia",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited Priority Pass access for RBL premium card",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "yes-bank-reserv": {
    cardId: "yes-bank-reserv",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Unlimited Priority Pass membership with guest privileges",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "hsbc-taj": {
    cardId: "hsbc-taj",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Priority Pass + Taj Experiences partnership for lounge access",
      },
    ],
    estimatedAnnualValue: 120000,
  },

  "hsbc-premier": {
    cardId: "hsbc-premier",
    programs: [
      {
        programId: "priority-pass",
        freeVisits: 99999,
        period: "unlimited",
        unlimited: true,
        spendRequired: null,
        guestAccess: true,
        guestFee: null,
        note: "Premier banking lounge access via Priority Pass and bank partnerships",
      },
    ],
    estimatedAnnualValue: 120000,
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────

/**
 * Get lounge program details by program ID
 */
export function getLoungeProgram(id: string): LoungeNetwork | undefined {
  return LOUNGE_NETWORKS[id];
}

/**
 * Get lounge access details for a specific card
 */
export function getCardLoungeAccess(cardId: string): CardLoungeAccess | undefined {
  return CARD_LOUNGE_ACCESS[cardId];
}

/**
 * Get list of all card IDs with lounge access
 */
export function getCardsWithLoungeAccess(): string[] {
  return Object.keys(CARD_LOUNGE_ACCESS).sort();
}

/**
 * Estimate annual lounge value for a specific card
 * Returns ₹ value based on visit counts and program rates
 */
export function estimateLoungeValue(cardId: string): number {
  const access = CARD_LOUNGE_ACCESS[cardId];
  if (!access) return 0;
  return access.estimatedAnnualValue;
}

/**
 * Get all programs available in a specific lounge network
 */
export function getCardsWithProgram(programId: string): string[] {
  return Object.entries(CARD_LOUNGE_ACCESS)
    .filter(([_, access]) => access.programs.some((p) => p.programId === programId))
    .map(([cardId]) => cardId)
    .sort();
}

/**
 * Calculate total annual lounge benefit for a list of cards (e.g., comparing portfolios)
 */
export function calculatePortfolioLoungeValue(cardIds: string[]): number {
  return cardIds.reduce((total, cardId) => total + estimateLoungeValue(cardId), 0);
}

/** Default per-visit values used when a card has no lounge program mapping */
export const DEFAULT_LOUNGE_PER_VISIT = { domestic: 1200, international: 2500 } as const;

/**
 * Get per-visit lounge values for a specific card.
 * Uses the card's primary lounge program rates; falls back to defaults.
 */
export function getCardPerVisitValues(cardId: string): { domestic: number; international: number } {
  const access = CARD_LOUNGE_ACCESS[cardId];
  if (!access || access.programs.length === 0) return { ...DEFAULT_LOUNGE_PER_VISIT };
  const primary = access.programs[0];
  const network = LOUNGE_NETWORKS[primary.programId];
  if (!network) return { ...DEFAULT_LOUNGE_PER_VISIT };
  return { domestic: network.perVisitValue.domestic, international: network.perVisitValue.international };
}

/**
 * Get lounge network coverage summary for domestic airports
 */
export function getLoungeNetworkCoverage(programId: string): {
  indianLounges: number;
  globalLounges: number;
  keyAirports: string[];
} | null {
  const program = getLoungeProgram(programId);
  if (!program) return null;

  return {
    indianLounges: program.indianLounges,
    globalLounges: program.globalLounges,
    keyAirports: program.keyIndianAirports,
  };
}
