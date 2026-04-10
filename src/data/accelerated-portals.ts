/**
 * Accelerated Reward Portals — Centralized Portal Definitions
 *
 * Each bank's accelerated reward portal is defined ONCE here.
 * Cards reference portals via card-portal-eligibility.ts.
 *
 * Portal = a bank-operated platform where cardholders earn bonus points/cashback
 * above the card's base earn rate (e.g. HDFC SmartBuy, Axis EDGE Rewards).
 *
 * Last verified: March 30, 2026 (post-Jan 2026 HDFC devaluations)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PortalMerchant {
  name: string;
  /** e.g. "10X", "5X", "35X" */
  multiplier: string;
  /** Effective earn rate as % of spend (after multiplier × point value). */
  effectiveRate: number;
  /** Merchant category for cross-referencing voucher combos */
  category?: "travel" | "shopping" | "dining" | "fuel" | "grocery" | "entertainment" | "general";
}

export interface AcceleratedPortal {
  /** Unique portal key — used in eligibility map and PORTAL_MAP */
  id: string;
  /** Display name */
  name: string;
  /** Bank that operates this portal */
  bankId: string;
  bankName: string;
  /** Portal URL (if standalone) */
  url: string | null;
  /** Short description of how the portal works */
  description: string;
  /** Merchants available with accelerated rates */
  merchants: PortalMerchant[];
  /** Default point value when redeeming through this portal (₹ per point) */
  defaultPointValue: number;
  /** Label explaining point value, e.g. "1 RP = ₹1.00 on flights" */
  pointValueLabel: string;
  /** Whether this portal is fully integrated with merchant-level data */
  dataStatus: "complete" | "partial" | "placeholder";
  /** Additional notes */
  note: string | null;
  /** Last date this portal data was verified */
  lastVerified: string;
}

// ─── Portal Definitions ─────────────────────────────────────────────────────

export const acceleratedPortals: Record<string, AcceleratedPortal> = {

  // ━━━ HDFC SmartBuy ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Jan 16 2026 devaluations applied. Hotels still 10X.
  // UPDATE Mar 30 2026: Gyftr RESTORED to 5X (was reduced to 3X Jan 16, restored ~Feb 2026).
  // Infinia new caps: 5 redemptions/month, ₹50K RP/statement, ₹1.5L flights/hotels.
  // Swiggy HDFC split into BLCK (₹499) and ORNGE (free) variants.
  // Regalia phased out → replaced by Regalia Gold for new applicants.
  // Sources: CardInsider, TechnoFino, LiveFromALounge, official SmartBuy portal
  "hdfc-smartbuy": {
    id: "hdfc-smartbuy",
    name: "HDFC SmartBuy",
    bankId: "hdfc",
    bankName: "HDFC Bank",
    url: "https://smartbuy.hdfcbank.com",
    description: "HDFC's flagship rewards portal. Post-Jan 2026 devaluation: Amazon 5X, Flipkart 3X, Flights 3X, Hotels 10X. Gyftr vouchers restored to 5X (~Feb 2026). Point value best on flight/hotel redemptions.",
    merchants: [
      { name: "Hotels", multiplier: "10X", effectiveRate: 33, category: "travel" },
      { name: "Amazon", multiplier: "5X", effectiveRate: 16.5, category: "shopping" },
      { name: "Flights", multiplier: "3X", effectiveRate: 9.9, category: "travel" },
      { name: "Flipkart", multiplier: "3X", effectiveRate: 9.9, category: "shopping" },
      { name: "IRCTC", multiplier: "5X", effectiveRate: 16.5, category: "travel" },
      { name: "Trains", multiplier: "3X", effectiveRate: 9.9, category: "travel" },
      { name: "Gyftr Vouchers", multiplier: "5X", effectiveRate: 16.5, category: "shopping" },
    ],
    defaultPointValue: 1.0,
    pointValueLabel: "1 RP = ₹1.00 on SmartBuy flights/hotels (Infinia/DCB); ₹0.50 on vouchers; ₹0.30 for Regalia-tier",
    dataStatus: "complete",
    note: "Rates shown are for premium cards (Infinia/Diners Black). Lower-tier cards may get different multipliers. 3.5% processing fee + 18% GST on Gyftr purchases. Infinia: 5 redemptions/month cap, ₹50K RP/statement cap, ₹1.5L flights/hotels cap. Retention: ₹18L spend OR ₹50L deposits. Swiggy HDFC split into BLCK (₹499/yr) and ORNGE (free). Regalia phased out for Regalia Gold.",
    lastVerified: "2026-03-30",
  },

  // ━━━ Axis EDGE Rewards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: 1 EDGE RP = ₹0.20 (corrected from ₹0.50, effective June 20 2025)
  // Atlas/Olympus/Horizon use EDGE Miles (1 Mile = ₹1), NOT EDGE Points
  // Magnus uses GRAB DEALS for merchant cashback, base is 12-35 EDGE pts/₹200
  // UPDATE Mar 30 2026: Atlas DISCONTINUED for new applicants (existing holders keep benefits).
  // Magnus milestone spend bonus eliminated.
  // Sources: PaisaBazaar, CardMaven, CardInsider, Axis Bank official
  "axis-edge-rewards": {
    id: "axis-edge-rewards",
    name: "Axis EDGE Rewards",
    bankId: "axis",
    bankName: "Axis Bank",
    url: "https://www.axisbank.com/edgerewards",
    description: "Axis Bank's reward ecosystem. EDGE Points (₹0.20 each) for most cards. Premium cards (Atlas/Olympus/Horizon) earn EDGE Miles (₹1.00 each) instead. Magnus earns 12–35 EDGE Points per ₹200 based on spend tier + GRAB DEALS merchant cashback.",
    merchants: [
      { name: "GRAB DEALS (Amazon)", multiplier: "Bonus", effectiveRate: 5, category: "shopping" },
      { name: "GRAB DEALS (Flipkart)", multiplier: "5%", effectiveRate: 5, category: "shopping" },
      { name: "GRAB DEALS (Myntra)", multiplier: "7.5%", effectiveRate: 7.5, category: "shopping" },
      { name: "GRAB DEALS (MakeMyTrip)", multiplier: "2X+15%", effectiveRate: 15, category: "travel" },
      { name: "GRAB DEALS (Swiggy)", multiplier: "Bonus", effectiveRate: 2.5, category: "dining" },
      { name: "GRAB DEALS (Zomato)", multiplier: "Bonus", effectiveRate: 2.5, category: "dining" },
    ],
    defaultPointValue: 0.20,
    pointValueLabel: "1 EDGE RP = ₹0.20 (effective June 2025). EDGE Miles = ₹1.00 (Atlas/Olympus/Horizon only)",
    dataStatus: "complete",
    note: "GRAB DEALS cashback offers are capped (₹4K/quarter on Flipkart/Myntra, 10K EDGE RP/month on Amazon). EDGE Miles cards have separate transfer partners (1 Mile = 2-4 partner points).",
    lastVerified: "2026-03-30",
  },

  // ━━━ ICICI iShop ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Launched Feb 2025. 6X flights, 12X hotels for Sapphiro/Rubyx.
  // Transport rewards capped at ₹20K monthly from Jan 15 2026.
  // UPDATE Mar 30 2026: New fees — 2% gaming transaction fee, 1% wallet load fee (₹5K+).
  // Govt/fuel/rent/tax transactions excluded from rewards earning.
  // Sources: TechnoFino, PaisaBazaar, official ICICI iShop
  "icici-ishop": {
    id: "icici-ishop",
    name: "ICICI iShop",
    bankId: "icici",
    bankName: "ICICI Bank",
    url: "https://www.ishoprewards.com",
    description: "ICICI Bank's accelerated rewards portal (launched Feb 2025). Up to 12X on hotels, 6X on flights/vouchers. Transport capped at ₹20K/month from Jan 2026.",
    merchants: [
      { name: "Hotels", multiplier: "12X", effectiveRate: 12, category: "travel" },
      { name: "Flights", multiplier: "6X", effectiveRate: 6, category: "travel" },
      { name: "Amazon Vouchers", multiplier: "6X", effectiveRate: 3, category: "shopping" },
      { name: "Flipkart Vouchers", multiplier: "6X", effectiveRate: 3, category: "shopping" },
      { name: "Bus Bookings", multiplier: "4X", effectiveRate: 4, category: "travel" },
    ],
    defaultPointValue: 0.25,
    pointValueLabel: "1 RP = ₹0.25 base; up to 12% effective on hotel bookings",
    dataStatus: "complete",
    note: "Rates shown are for Sapphiro/Rubyx/Emeralde tier. Coral gets only voucher access (3X). Transport rewards capped at ₹20K monthly from Jan 15 2026. Emeralde Private Metal may get higher rates on some merchants. New fees: 2% on gaming txns, 1% on wallet loads ≥₹5K. Govt/fuel/rent/tax excluded from rewards.",
    lastVerified: "2026-03-30",
  },

  // ━━━ SBI Rewardz ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: NOT a SmartBuy-like portal. Category-based acceleration only.
  // Amazon/Flipkart 10X removed from SimplyCLICK.
  // UPDATE Mar 30 2026: SimplyCLICK point value ₹0.25→₹0.20 (devalued late 2025).
  // Swiggy SBI co-brand 10X→5X on Swiggy orders.
  // Statement credit capped at 60K pts/month from April 2026.
  // Sources: PaisaBazaar, SBI Card official
  "sbi-rewardz": {
    id: "sbi-rewardz",
    name: "SBI Rewardz",
    bankId: "sbi",
    bankName: "SBI Card",
    url: "https://www.sbicard.com/en/personal/rewards.page",
    description: "SBI Card's reward redemption platform. NOT an accelerated earning portal like SmartBuy — acceleration is category-based per card. SimplyCLICK gets 10X on select online brands (not Amazon/Flipkart anymore).",
    merchants: [
      { name: "BookMyShow (SimplyCLICK)", multiplier: "10X", effectiveRate: 2.0, category: "entertainment" },
      { name: "Apollo24X7 (SimplyCLICK)", multiplier: "10X", effectiveRate: 2.0, category: "shopping" },
      { name: "Cleartrip (SimplyCLICK)", multiplier: "10X", effectiveRate: 2.0, category: "travel" },
      { name: "Myntra (SimplyCLICK)", multiplier: "10X", effectiveRate: 2.0, category: "shopping" },
      { name: "Yatra (SimplyCLICK)", multiplier: "10X", effectiveRate: 2.0, category: "travel" },
      { name: "IRCTC (IRCTC cards)", multiplier: "10%", effectiveRate: 10, category: "travel" },
    ],
    defaultPointValue: 0.20,
    pointValueLabel: "1 RP = ₹0.20 via voucher redemption (devalued from ₹0.25 late 2025). Statement credit capped at 60K pts/month from April 2026",
    dataStatus: "complete",
    note: "SimplyCLICK 10X partners: BookMyShow, Apollo24X7, Cleartrip, Dominos, Myntra, Yatra, Netmeds, IGP. Amazon/Flipkart 10X REMOVED. Point value devalued ₹0.25→₹0.20. Swiggy SBI co-brand reduced 10X→5X on Swiggy orders. SBI Elite gets 10 RP/₹100 on dining/grocery/departmental (capped 10K/month per category).",
    lastVerified: "2026-03-30",
  },

  // ━━━ Kotak Unbox ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Real portal accessible via mobile app/net banking.
  // Uses Air Miles (1 Mile = ₹1 travel, ₹0.50 vouchers).
  // Sources: PaisaBazaar, Kotak official
  "kotak-unbox": {
    id: "kotak-unbox",
    name: "Kotak Unbox",
    bankId: "kotak",
    bankName: "Kotak Mahindra Bank",
    url: null,
    description: "Kotak's travel-focused accelerated portal (accessible via app/net banking). Earns Air Miles: 10 per ₹100 on travel, 3 per ₹100 on other. Air Miles are separate from regular Reward Points.",
    merchants: [
      { name: "Flights", multiplier: "10X", effectiveRate: 10, category: "travel" },
      { name: "Hotels", multiplier: "10X", effectiveRate: 10, category: "travel" },
    ],
    defaultPointValue: 1.0,
    pointValueLabel: "1 Air Mile = ₹1.00 on travel bookings; ₹0.50 on vouchers. Min 200 Air Miles to redeem",
    dataStatus: "complete",
    note: "10X rates for Solitaire card (3 base + 7 accelerated). Cap: 1L Air Miles/statement cycle. League Platinum uses Mojo Points (₹0.07 each, devalued June 2025). White/White Reserve/Zen use standard RP (₹0.25).",
    lastVerified: "2026-03-30",
  },

  // ━━━ HSBC Travel With Points ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Active, powered by Hopper. Premier/Privé get 6X flights, 12X hotels.
  // Sources: HSBC official, CardExpert, LiveFromALounge
  "hsbc-travel-with-points": {
    id: "hsbc-travel-with-points",
    name: "HSBC Travel With Points",
    bankId: "hsbc",
    bankName: "HSBC",
    url: null,
    description: "HSBC's accelerated travel rewards portal (powered by Hopper). Up to 12X on hotels, 6X on flights, 2X on car rentals. Access via HSBC India mobile app → Credit Card → Redeem Points → Travel with Points.",
    merchants: [
      { name: "Hotels", multiplier: "12X", effectiveRate: 36, category: "travel" },
      { name: "Flights", multiplier: "6X", effectiveRate: 18, category: "travel" },
      { name: "Car Rentals", multiplier: "2X", effectiveRate: 6, category: "travel" },
    ],
    defaultPointValue: 0.30,
    pointValueLabel: "Point value varies by redemption; up to 72% savings on travel. Convenience fee: ₹300 domestic / ₹700 intl flights",
    dataStatus: "complete",
    note: "Rates shown are for Premier/Privé cards. TravelOne gets 4X flights, 6X hotels. Visa Platinum & RuPay Platinum also eligible (6X/12X). Cap: 18,000 accelerated pts/month.",
    lastVerified: "2026-03-30",
  },

  // ━━━ IndusInd — Travel & Shop ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATUS: No dedicated named portal confirmed via research.
  // Rates from existing card-v3-data.ts (Pinnacle, Legend, Pioneer).
  // Legend lounge access discontinued March 2025.
  "indusind-travel-and-shop": {
    id: "indusind-travel-and-shop",
    name: "IndusInd Travel & Shop",
    bankId: "indusind",
    bankName: "IndusInd Bank",
    url: null,
    description: "IndusInd's travel booking feature for premium cardholders. NOT a fully dedicated portal like SmartBuy — travel acceleration is card-tier-based. Legend lounge access discontinued March 2025.",
    merchants: [
      { name: "Hotels", multiplier: "5X", effectiveRate: 8.33, category: "travel" },
      { name: "Flights", multiplier: "3X", effectiveRate: 5, category: "travel" },
    ],
    defaultPointValue: 0.25,
    pointValueLabel: "Points vary by card tier; best on travel redemption",
    dataStatus: "partial",
    note: "Rates are for Pinnacle (highest). Legend/Pioneer get Hotels 7.5%, Flights 3.33%. No shopping/voucher acceleration. Portal name from internal card data — may not be an official branded portal.",
    lastVerified: "2026-03-30",
  },

  // ━━━ IDFC FIRST — Travel & Shop ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // From card-v3-data.ts: IDFC Private, Gaj, Mayura have Travel & Shop portal data.
  // IDFC has threshold-based acceleration (5X/10X on monthly spend tiers).
  // UPDATE Mar 30 2026: International rewards 10X→5X on Mayura/Ashva.
  // Base earn threshold raised ₹150→₹200. FASTag/Railway platform fees added.
  "idfc-travel-and-shop": {
    id: "idfc-travel-and-shop",
    name: "IDFC Travel & Shop",
    bankId: "idfc",
    bankName: "IDFC FIRST Bank",
    url: null,
    description: "IDFC FIRST Bank's travel booking feature for premium cards (Private, Gaj, Mayura). Spend-threshold acceleration: 5X base up to ₹20K/month, 10X on incremental above ₹20K. International rewards reduced 10X→5X on Mayura/Ashva from early 2026.",
    merchants: [
      { name: "Hotels", multiplier: "5X", effectiveRate: 8.33, category: "travel" },
      { name: "Flights", multiplier: "3X", effectiveRate: 5, category: "travel" },
    ],
    defaultPointValue: 0.25,
    pointValueLabel: "1 RP = ₹0.25 standard. Redemption fee: ₹99 + GST per transaction",
    dataStatus: "partial",
    note: "Private card gets highest rates. Base earn threshold raised ₹150→₹200 from 2026. International rewards reduced 10X→5X on Mayura/Ashva. FASTag surcharge & Railway platform fees now excluded from rewards. No dedicated shopping portal.",
    lastVerified: "2026-03-30",
  },

  // ━━━ YES Rewardz ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Category-based only, NO dedicated portal.
  // CRITICAL: Point value DEVALUED to ₹0.15 (from ₹1.00!)
  // Sources: PaisaBazaar, TechnoFino
  "yes-rewardz": {
    id: "yes-rewardz",
    name: "YES Rewardz",
    bankId: "yes",
    bankName: "YES Bank",
    url: "https://rewardz.yesbank.in",
    description: "YES Bank's category-based acceleration program. No dedicated portal. Acceleration built into card-level spend categories. MAJOR devaluation: point value dropped to ₹0.15 for gift vouchers.",
    merchants: [
      { name: "Online Shopping (Marquée)", multiplier: "36 RP/₹200", effectiveRate: 2.7, category: "shopping" },
      { name: "Online Shopping (ACE)", multiplier: "8 RP/₹200", effectiveRate: 0.6, category: "shopping" },
      { name: "Travel/Dining (FIRST)", multiplier: "16 RP/₹200", effectiveRate: 1.2, category: "travel" },
    ],
    defaultPointValue: 0.15,
    pointValueLabel: "1 RP = ₹0.15 for gift vouchers (DEVALUED from ₹1.00). Validity: 36 months",
    dataStatus: "complete",
    note: "ACE cap: 5,000 RP/statement cycle. Marquée: 36 RP/₹200 online, 18 RP/₹200 offline. RESERV: 24 RP/₹200 online, 12 RP/₹200 offline. No centralized portal — each card has its own category multipliers.",
    lastVerified: "2026-03-30",
  },

  // ━━━ Standard Chartered 360° Rewards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: 360° is REDEMPTION catalogue, not earning portal.
  // Threshold-based bonus (₹20K+ retail = extra 4 RP/₹150).
  // SC Ultimate gets 1 RP = ₹1 (best in range).
  // Sources: SC official, PaisaBazaar
  "sc-360-rewards": {
    id: "sc-360-rewards",
    name: "SC 360° Rewards",
    bankId: "sc",
    bankName: "Standard Chartered",
    url: "https://retail.sc.com/in/rewards360/rewards_home/in",
    description: "Standard Chartered's rewards catalogue (redemption, not earning portal). Category-based acceleration on dining/fuel for Platinum Rewards. Threshold bonus: extra 4 RP/₹150 on ₹20K+ monthly retail. SC Ultimate gets 1 RP = ₹1.",
    merchants: [
      { name: "Dining (Platinum Rewards)", multiplier: "5X", effectiveRate: 3.33, category: "dining" },
      { name: "Fuel (Platinum Rewards)", multiplier: "5X", effectiveRate: 3.33, category: "fuel" },
      { name: "Retail above ₹20K/month", multiplier: "+4 RP bonus", effectiveRate: 2.67, category: "shopping" },
      { name: "Travel (EaseMyTrip card)", multiplier: "10 RP/₹100", effectiveRate: 10, category: "travel" },
    ],
    defaultPointValue: 0.25,
    pointValueLabel: "1 RP = ₹0.25 standard cards; 1 RP = ₹1.00 for SC Ultimate. Redemption fee: ₹99",
    dataStatus: "complete",
    note: "Platinum Rewards: 5X on dining/fuel. Rewards Card: +4 RP bonus/₹150 on ₹20K+ retail (capped 2,000 pts/month). Ultimate has no monthly cap. EaseMyTrip: 10 RP/₹100 travel.",
    lastVerified: "2026-03-30",
  },

  // ━━━ Federal/Scapia ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFIED: Active March 2026. Utilities AND Insurance excluded from Feb 2026.
  // UPDATE Mar 30 2026: Lounge access threshold doubled ₹10K→₹20K monthly spend.
  // Sources: Scapia official, PaisaBazaar, Federal Bank
  "scapia-travel": {
    id: "scapia-travel",
    name: "Scapia Travel",
    bankId: "federal",
    bankName: "Federal Bank",
    url: "https://www.scapia.cards",
    description: "Scapia's travel-focused rewards platform. 20% Scapia Coins on travel via app, 10% on other spends. Utilities AND Insurance excluded from Feb 2026. Lounge access threshold doubled to ₹20K/month. Coins redeemable only for travel bookings.",
    merchants: [
      { name: "Travel (via Scapia App)", multiplier: "20%", effectiveRate: 20, category: "travel" },
      { name: "All Other Spends", multiplier: "10%", effectiveRate: 10, category: "general" },
      { name: "UPI (companion RuPay)", multiplier: "5%", effectiveRate: 5, category: "general" },
    ],
    defaultPointValue: 0.20,
    pointValueLabel: "5 Scapia Coins = ₹1. Redeemable instantly for travel bookings only (no cash/vouchers)",
    dataStatus: "complete",
    note: "No cap on Scapia Coins. Can cover 100% of travel booking cost. Min transaction ₹20. RuPay companion: 5% on ₹500+ UPI spends. Utilities AND Insurance earn 0% from Feb 2026. Lounge access: requires ₹20K monthly spend (doubled from ₹10K, effective ~Feb 2026).",
    lastVerified: "2026-03-30",
  },
};

// ─── Helper: Get portal by ID ────────────────────────────────────────────────

export function getPortalById(portalId: string): AcceleratedPortal | undefined {
  return acceleratedPortals[portalId];
}

/** Get all portals for a given bank */
export function getPortalsByBank(bankId: string): AcceleratedPortal[] {
  return Object.values(acceleratedPortals).filter((p) => p.bankId === bankId);
}

/** Get all portal IDs */
export function getAllPortalIds(): string[] {
  return Object.keys(acceleratedPortals);
}
