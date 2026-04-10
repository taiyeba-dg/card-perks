/**
 * Card ↔ Portal Eligibility Map
 *
 * Maps each credit card to the accelerated reward portals it can access,
 * along with card-specific overrides (caps, different multipliers, etc.)
 *
 * Portal definitions live in accelerated-portals.ts — this file only stores
 * which cards are eligible and any per-card differences.
 *
 * Last verified: March 30, 2026 (post-Jan 2026 HDFC devaluations, June 2025 Axis changes)
 */

import { acceleratedPortals, type AcceleratedPortal, type PortalMerchant } from "./accelerated-portals";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CardPortalOverride {
  /** Which merchants this card gets different rates on (overrides portal defaults) */
  merchantOverrides?: Partial<Record<string, { multiplier: string; effectiveRate: number }>>;
  /** Card-specific cap on accelerated earnings */
  cap?: string | null;
  /** If set, overrides the portal's default point value for this card */
  pointValue?: number;
  /** Card-specific note */
  note?: string | null;
}

export interface CardPortalEntry {
  /** Portal ID from accelerated-portals.ts */
  portalId: string;
  /** Card-specific overrides — if null, card uses full portal defaults */
  overrides?: CardPortalOverride;
}

export interface ResolvedCardPortal {
  portal: AcceleratedPortal;
  /** Merchants with card-specific overrides applied */
  merchants: PortalMerchant[];
  /** Card-specific cap (or portal default) */
  cap: string | null;
  /** Point value for this card on this portal */
  pointValue: number;
  note: string | null;
}

// ─── Eligibility Map ─────────────────────────────────────────────────────────
// Keys = card IDs (from cards-v3-index.ts)
// Values = array of portal entries the card can access

export const cardPortalEligibility: Record<string, CardPortalEntry[]> = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HDFC BANK — SmartBuy
  // Post-Jan 16, 2026 devaluations applied
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // — Ultra-premium HDFC (Infinia, Diners Black) —
  "hdfc-infinia-metal": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 33 },
        "Amazon": { multiplier: "5X", effectiveRate: 16.5 },
        "Flights": { multiplier: "3X", effectiveRate: 9.9 },
        "Flipkart": { multiplier: "3X", effectiveRate: 9.9 },
        "Gyftr Vouchers": { multiplier: "5X", effectiveRate: 16.5 },
      },
      cap: "15,000 accelerated RP/month; max 5 redemptions/month; ₹50K RP/statement cap; ₹1.5L flights/hotels cap (from Feb 2026)",
      note: "Retention: ₹18L annual spend OR ₹50L bank deposits. Gyftr restored to 5X (~Feb 2026).",
    },
  }],
  "hdfc-diners-club-black": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 33 },
        "Amazon": { multiplier: "5X", effectiveRate: 16.5 },
        "Flights": { multiplier: "3X", effectiveRate: 9.9 },
        "Flipkart": { multiplier: "3X", effectiveRate: 9.9 },
        "Gyftr Vouchers": { multiplier: "5X", effectiveRate: 16.5 },
      },
      cap: "10,000 RP/month on Gyftr; 15,000 RP/month overall",
    },
  }],
  "hdfc-diners-club-black-metal": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 33 },
        "Amazon": { multiplier: "5X", effectiveRate: 16.5 },
        "Flights": { multiplier: "3X", effectiveRate: 9.9 },
        "Flipkart": { multiplier: "3X", effectiveRate: 9.9 },
        "Gyftr Vouchers": { multiplier: "5X", effectiveRate: 16.5 },
      },
      cap: "10,000 RP/month on Gyftr; 15,000 RP/month overall",
    },
  }],

  // — Mid-premium HDFC (Diners Privilege, ClubMiles) —
  "hdfc-diners-club-privilege": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 5 },
        "Flights": { multiplier: "10X", effectiveRate: 5 },
      },
      cap: "4,000 RP/month accelerated",
      pointValue: 0.50,
      note: "1 RP = ₹0.50 on SmartBuy flights/hotels",
    },
  }],
  "hdfc-diners-clubmiles": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 33 },
        "Flights": { multiplier: "5X", effectiveRate: 16.5 },
        "Trains": { multiplier: "3X", effectiveRate: 9.9 },
      },
      cap: "75,000 RP/month (total redemption cap)",
    },
  }],

  // — Regalia tier (point value ₹0.30) —
  "hdfc-regalia": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 1.5 },
        "Flights": { multiplier: "5X", effectiveRate: 1.5 },
      },
      cap: "4,000 RP/month",
      pointValue: 0.30,
      note: "Phased out for new applicants — replaced by Regalia Gold. Existing holders retain benefits.",
    },
  }],
  "hdfc-regalia-first": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 1.5 },
        "Flights": { multiplier: "5X", effectiveRate: 1.5 },
      },
      cap: "4,000 RP/month",
      pointValue: 0.30,
      note: "Card closed to new applicants; existing holders retain benefits",
    },
  }],
  "hdfc-regalia-gold": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 1.5 },
        "Flights": { multiplier: "5X", effectiveRate: 1.5 },
        "Gyftr Vouchers": { multiplier: "5X", effectiveRate: 1.5 },
      },
      cap: "2,000 RP/day; 4,000 RP/month",
      pointValue: 0.30,
      note: "Replacing Regalia for new applicants. Gyftr restored to 5X.",
    },
  }],

  // — Mid/Entry HDFC (SmartBuy access with lower rates) —
  "hdfc-millennia": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 3 },
        "Flights": { multiplier: "10X", effectiveRate: 3 },
      },
      pointValue: 0.30,
      note: "10% cashback on SmartBuy hotel/flight bookings",
    },
  }],
  "hdfc-moneyback-plus": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "10X", effectiveRate: 3 },
        "Flights": { multiplier: "10X", effectiveRate: 3 },
      },
      pointValue: 0.30,
    },
  }],
  "hdfc-freedom": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 5.0 },
        "Flights": { multiplier: "5X", effectiveRate: 5.0 },
      },
      note: "Cashback-based, not point-based",
    },
  }],
  "hdfc-pixel-go": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5%", effectiveRate: 5.0 },
        "Flights": { multiplier: "5%", effectiveRate: 5.0 },
      },
      note: "5% cashback on SmartBuy purchases",
    },
  }],
  "hdfc-pixel-play": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5%", effectiveRate: 5.0 },
        "Flights": { multiplier: "5%", effectiveRate: 5.0 },
      },
      note: "5% cashback on SmartBuy purchases",
    },
  }],

  // — HDFC Co-branded cards with SmartBuy access —
  "hdfc-swiggy": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "SmartBuy access confirmed. Now split into BLCK (₹499/yr, higher rewards) and ORNGE (free, lower rewards) variants.",
    },
  }],
  "hdfc-tata-neu-infinity": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "SmartBuy access + additional NeuCoins bonus on SmartBuy txns",
    },
  }],
  "hdfc-tata-neu-plus": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "SmartBuy access + NeuCoins bonus",
    },
  }],
  "hdfc-shoppers-stop": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      pointValue: 0.20,
      note: "1 RP = ₹0.20 base variant",
    },
  }],
  "hdfc-shoppers-stop-black": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      pointValue: 0.50,
      note: "Redeem points at 2:1 ratio",
    },
  }],
  "marriott-bonvoy-hdfc": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "5% cashback on SmartBuy purchases",
    },
  }],
  "hdfc-bizblack-metal": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "Business card — SmartBuy access at premium rates",
    },
  }],
  "hdfc-bizpower": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "Business card — SmartBuy access",
    },
  }],
  "hdfc-indianoil": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      note: "SmartBuy access confirmed; fuel-focused card",
    },
  }],

  // — IRCTC HDFC — only IRCTC acceleration —
  "irctc-hdfc": [{
    portalId: "hdfc-smartbuy",
    overrides: {
      merchantOverrides: {
        "IRCTC": { multiplier: "5X", effectiveRate: 10.0 },
      },
      note: "5% additional cashback on IRCTC via SmartBuy; combined 10% total value-back",
    },
  }],

  // — HDFC cards EXCLUDED from SmartBuy —
  // hdfc-6e-rewards-indigo: EXCLUDED from SmartBuy (per official SmartBuy portal)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AXIS BANK — EDGE Rewards
  // June 20, 2025 changes applied. 1 EDGE RP = ₹0.20
  // Atlas/Olympus/Horizon use EDGE Miles (1 Mile = ₹1.00)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // — EDGE Miles cards (1 Mile = ₹1.00, separate from EDGE Points) —
  "axis-atlas": [{
    portalId: "axis-edge-rewards",
    overrides: {
      merchantOverrides: {
        "GRAB DEALS (MakeMyTrip)": { multiplier: "5 Miles/₹100", effectiveRate: 5 },
      },
      pointValue: 1.0,
      note: "DISCONTINUED for new applicants (early 2026). Existing holders keep benefits. Uses EDGE Miles (not Points). 5 Miles/₹100 on Axis Travel EDGE + direct airlines/hotels. 2 Miles/₹100 all other. Cap: ₹2L/month",
    },
  }],
  "axis-olympus": [{
    portalId: "axis-edge-rewards",
    overrides: {
      merchantOverrides: {
        "GRAB DEALS (MakeMyTrip)": { multiplier: "2 Miles/₹100", effectiveRate: 2 },
      },
      pointValue: 1.0,
      note: "Uses EDGE Miles. 1 Mile/₹100 domestic, 2 Miles/₹100 international. 1 Mile = 4 partner points. Cap: 7.5L Miles/year",
    },
  }],
  "axis-horizon": [{
    portalId: "axis-edge-rewards",
    overrides: {
      merchantOverrides: {
        "GRAB DEALS (MakeMyTrip)": { multiplier: "5 Miles/₹100", effectiveRate: 5 },
      },
      pointValue: 1.0,
      note: "Uses EDGE Miles. 5 Miles/₹100 on Axis Travel EDGE + direct airlines/hotels. 2 Miles/₹100 all other. Cap: 5L annual transfer",
    },
  }],

  // — Premium EDGE Points cards (Magnus, Reserve) —
  "axis-magnus": [{
    portalId: "axis-edge-rewards",
    overrides: {
      merchantOverrides: {
        "GRAB DEALS (Amazon)": { multiplier: "Bonus", effectiveRate: 5 },
        "GRAB DEALS (Flipkart)": { multiplier: "5%", effectiveRate: 5 },
        "GRAB DEALS (Myntra)": { multiplier: "7.5%", effectiveRate: 7.5 },
        "GRAB DEALS (MakeMyTrip)": { multiplier: "2X+15%", effectiveRate: 15 },
      },
      note: "12 EDGE pts/₹200 base; 35 EDGE pts/₹200 on ₹1.5L+ monthly spend. GRAB DEALS capped: 10K pts/month Amazon, ₹4K/quarter Flipkart/Myntra. Milestone spend bonus ELIMINATED (early 2026).",
    },
  }],
  "axis-reserve": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "15 EDGE pts/₹200 domestic; 30 EDGE pts/₹200 international. Capped at credit limit/month on intl 2X",
    },
  }],

  // — Mid-tier EDGE Points cards —
  "axis-privilege": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "10 EDGE pts/₹200 flat, all spends. Milestone: 10K EDGE pts at ₹2.5L annual",
    },
  }],
  "axis-select": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "Up to 3.2% on select categories",
    },
  }],
  "axis-rewards": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "2 EDGE pts/₹125 unlimited. 10X on apparel/departmental stores (capped ₹7K/month). Milestone: 1,500 pts on ₹30K/statement cycle",
    },
  }],
  "axis-ace": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "Up to 20 EDGE pts/₹125. Also: 2% flat cashback + 5% on Google Pay bills (₹500/month cap) + 4% on Ola/Zomato/Swiggy (₹500/month cap)",
    },
  }],
  "axis-neo": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "1 EDGE pt/₹200 (0.10% value). Zomato: ₹120 off twice/month on ₹499+",
    },
  }],
  "axis-myzone": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "4 EDGE pts/₹200 (0.4% value). Milestone: 1,000 pts on ₹1.5L annual",
    },
  }],

  // — Axis Co-branded cards with EDGE access —
  "flipkart-axis": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "10K EDGE pts on activation. Flipkart: 5% cashback (₹4K/quarter). Cleartrip: 5% (₹4K/quarter). Myntra: 7.5% (₹4K/quarter)",
    },
  }],
  "axis-samsung-infinite": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "15 EDGE pts/₹100 on preferred partners (BigBasket, Tata1mg, Myntra, Zomato, intl). 5 pts/₹100 other domestic. Card closed to new applicants → Samsung Signature",
    },
  }],
  "axis-lic-signature": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "2 EDGE pts/₹100 on LIC premiums & foreign txns. 1 pt/₹100 other. Lifetime free. Points valid 1 year",
    },
  }],
  "axis-airtel": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "2 EDGE pts/₹125 base. 10X on apparel/departmental (capped 1,008 pts/month). 5K EDGE welcome bonus",
    },
  }],
  "axis-indianoil": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "Premium variant: 6X EDGE Miles on fuel at IndianOil, 2X on grocery. Base variant: 20 EDGE pts/₹100 at IndianOil (4% value)",
    },
  }],
  "axis-cashback": [{
    portalId: "axis-edge-rewards",
    overrides: {
      note: "Primarily cashback card. EDGE portal access for redemption",
    },
  }],

  // — Axis cards NOT on EDGE —
  // axis-flex-google-pay: Uses STARS system (not EDGE). 1 Star = ₹1 via Google Pay UPI. Max 1,500 Stars/month
  // axis-vistara-infinite: Card closed (Vistara merged with Air India)
  // axis-vistara-signature: Card closed

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ICICI BANK — iShop (launched Feb 2025)
  // Transport capped at ₹20K/month from Jan 15, 2026
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "icici-emeralde-private-metal": [{
    portalId: "icici-ishop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "12X", effectiveRate: 12 },
        "Flights": { multiplier: "6X", effectiveRate: 6 },
        "Amazon Vouchers": { multiplier: "6X", effectiveRate: 6 },
        "Flipkart Vouchers": { multiplier: "6X", effectiveRate: 6 },
      },
      cap: "18,000 bonus pts/month",
      note: "Highest iShop tier. Transport capped ₹20K/month from Jan 2026. Govt/fuel/rent/tax excluded from rewards. 2% gaming fee, 1% wallet load fee ≥₹5K.",
    },
  }],
  "icici-emeralde": [{
    portalId: "icici-ishop",
    overrides: {
      cap: "12,000 bonus pts/month",
      note: "Transport capped ₹20K/month from Jan 2026. Govt/fuel/rent/tax excluded from rewards.",
    },
  }],
  "icici-sapphiro": [{
    portalId: "icici-ishop",
    overrides: { cap: "9,000 bonus pts/month" },
  }],
  "icici-rubyx": [{
    portalId: "icici-ishop",
    overrides: { cap: "9,000 bonus pts/month" },
  }],
  "icici-times-black": [{
    portalId: "icici-ishop",
    overrides: { cap: "15,000 bonus pts/month" },
  }],
  "icici-coral": [{
    portalId: "icici-ishop",
    overrides: {
      merchantOverrides: {
        "Amazon Vouchers": { multiplier: "3X", effectiveRate: 3 },
        "Flipkart Vouchers": { multiplier: "3X", effectiveRate: 3 },
      },
      note: "Voucher access only — no flight/hotel acceleration",
    },
  }],
  "amazon-pay-icici": [{
    portalId: "icici-ishop",
    overrides: {
      merchantOverrides: {
        "Amazon Vouchers": { multiplier: "3X", effectiveRate: 3 },
        "Flipkart Vouchers": { multiplier: "3X", effectiveRate: 3 },
      },
    },
  }],
  "icici-platinum-chip": [{
    portalId: "icici-ishop",
    overrides: {
      merchantOverrides: {
        "Amazon Vouchers": { multiplier: "3X", effectiveRate: 3 },
        "Flipkart Vouchers": { multiplier: "3X", effectiveRate: 3 },
      },
    },
  }],
  "icici-makemytrip-platinum": [{ portalId: "icici-ishop" }],
  "icici-makemytrip-signature": [{ portalId: "icici-ishop" }],
  "icici-emirates-emeralde": [{ portalId: "icici-ishop" }],
  "icici-emirates-rubyx": [{ portalId: "icici-ishop" }],
  "icici-emirates-sapphiro": [{ portalId: "icici-ishop" }],
  "icici-hpcl-coral": [{
    portalId: "icici-ishop",
    overrides: { note: "Limited iShop access — primarily fuel card" },
  }],
  "icici-hpcl-super-saver": [{
    portalId: "icici-ishop",
    overrides: { note: "Limited iShop access — primarily fuel card" },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SBI CARD — SBI Rewardz (category-based, NOT a shopping portal)
  // Amazon/Flipkart 10X REMOVED from SimplyCLICK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "sbi-elite": [{
    portalId: "sbi-rewardz",
    overrides: { note: "10 RP/₹100 on dining/grocery/departmental stores (capped 10K/month per category)" },
  }],
  "sbi-aurum": [{
    portalId: "sbi-rewardz",
    overrides: { note: "Premium SBI card — accelerated dining/travel categories" },
  }],
  "sbi-prime": [{ portalId: "sbi-rewardz" }],
  "sbi-pulse": [{ portalId: "sbi-rewardz" }],
  "sbi-simplyclick": [{
    portalId: "sbi-rewardz",
    overrides: {
      pointValue: 0.20,
      note: "10X on BookMyShow, Apollo24X7, Cleartrip, Dominos, Myntra, Yatra, Netmeds, IGP. Amazon/Flipkart 10X REMOVED. Point value devalued ₹0.25→₹0.20 (late 2025).",
    },
  }],
  "sbi-simplysave": [{ portalId: "sbi-rewardz" }],
  "sbi-cashback": [{ portalId: "sbi-rewardz" }],
  "sbi-miles-elite": [{ portalId: "sbi-rewardz" }],
  "bpcl-sbi-octane": [{ portalId: "sbi-rewardz" }],
  "bpcl-sbi": [{ portalId: "sbi-rewardz" }],
  "club-vistara-sbi": [{ portalId: "sbi-rewardz" }],
  "club-vistara-sbi-prime": [{ portalId: "sbi-rewardz" }],
  "air-india-sbi-platinum": [{ portalId: "sbi-rewardz" }],
  "air-india-sbi-signature": [{ portalId: "sbi-rewardz" }],
  "irctc-sbi-platinum": [{
    portalId: "sbi-rewardz",
    overrides: { note: "10% value-back on IRCTC AC/EC tickets (1 pt = ₹1 on IRCTC)" },
  }],
  "irctc-sbi-premier": [{
    portalId: "sbi-rewardz",
    overrides: { note: "10% value-back on IRCTC AC/EC tickets; 5% on flights & e-catering" },
  }],
  "sbi-flipkart": [{ portalId: "sbi-rewardz" }],
  "sbi-paytm": [{ portalId: "sbi-rewardz" }],
  "sbi-paytm-select": [{ portalId: "sbi-rewardz" }],
  "sbi-phonepe": [{ portalId: "sbi-rewardz" }],
  "sbi-phonepe-select": [{ portalId: "sbi-rewardz" }],
  "sbi-tata-neu-infinity": [{ portalId: "sbi-rewardz" }],
  "sbi-tata-neu-plus": [{ portalId: "sbi-rewardz" }],
  "sbi-reliance": [{ portalId: "sbi-rewardz" }],
  "sbi-reliance-prime": [{ portalId: "sbi-rewardz" }],
  "sbi-indigo": [{ portalId: "sbi-rewardz" }],
  "sbi-indigo-elite": [{ portalId: "sbi-rewardz" }],
  "sbi-styleup": [{ portalId: "sbi-rewardz" }],
  "sbi-titan": [{ portalId: "sbi-rewardz" }],
  "sbi-apollo": [{ portalId: "sbi-rewardz" }],
  "sbi-doctors": [{ portalId: "sbi-rewardz" }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KOTAK MAHINDRA — Kotak Unbox (Air Miles on travel)
  // League Platinum uses Mojo Points (₹0.07 — devalued June 2025)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "kotak-white-reserve": [{
    portalId: "kotak-unbox",
    overrides: { note: "Standard Kotak RP — travel acceleration via Unbox" },
  }],
  "kotak-white": [{
    portalId: "kotak-unbox",
    overrides: { note: "Standard Kotak RP" },
  }],
  "kotak-zen-signature": [{
    portalId: "kotak-unbox",
    overrides: { note: "10 pts/₹150 shopping, 5 pts/₹150 other — travel via Unbox" },
  }],
  "kotak-league-platinum": [{
    portalId: "kotak-unbox",
    overrides: {
      pointValue: 0.07,
      note: "Uses Mojo Points (₹0.07 each — devalued June 2025). 2.5 Mojo pts/₹100 online, 1 pt/₹100 other",
    },
  }],
  "kotak-mojo": [{
    portalId: "kotak-unbox",
    overrides: {
      pointValue: 0.07,
      note: "Mojo Points. 2.5 pts/₹100 online, 1 pt/₹100 other",
    },
  }],
  // kotak-811-credit-card: No portal access confirmed
  // kotak-pvr-inox: No portal access confirmed

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HSBC — Travel With Points (powered by Hopper)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "hsbc-premier": [{
    portalId: "hsbc-travel-with-points",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "12X", effectiveRate: 36 },
        "Flights": { multiplier: "6X", effectiveRate: 18 },
        "Car Rentals": { multiplier: "2X", effectiveRate: 6 },
      },
      cap: "18,000 accelerated pts/month",
    },
  }],
  "hsbc-travel-one": [{
    portalId: "hsbc-travel-with-points",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "6X", effectiveRate: 24 },
        "Flights": { multiplier: "4X", effectiveRate: 16 },
        "Car Rentals": { multiplier: "2X", effectiveRate: 8 },
      },
      cap: "18,000 accelerated pts/month",
    },
  }],
  "hsbc-platinum": [{
    portalId: "hsbc-travel-with-points",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "12X", effectiveRate: 36 },
        "Flights": { multiplier: "6X", effectiveRate: 18 },
        "Car Rentals": { multiplier: "2X", effectiveRate: 6 },
      },
      cap: "18,000 accelerated pts/month",
    },
  }],
  "hsbc-platinum-rupay": [{
    portalId: "hsbc-travel-with-points",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "12X", effectiveRate: 36 },
        "Flights": { multiplier: "6X", effectiveRate: 18 },
        "Car Rentals": { multiplier: "2X", effectiveRate: 6 },
      },
      cap: "18,000 accelerated pts/month",
    },
  }],
  "hsbc-taj": [{
    portalId: "hsbc-travel-with-points",
    overrides: {
      note: "1.5 pts/₹100 standard; 5 pts/₹100 at IHCL properties + NeuPass Platinum",
    },
  }],
  "hsbc-live-plus": [{
    portalId: "hsbc-travel-with-points",
    overrides: { note: "Travel With Points access not fully confirmed for Live+" },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INDUSIND — Travel & Shop (from card-v3-data.ts)
  // No official branded portal confirmed via research
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "indusind-pinnacle": [{
    portalId: "indusind-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 8.33 },
        "Flights": { multiplier: "3X", effectiveRate: 5 },
      },
    },
  }],
  "indusind-legend": [{
    portalId: "indusind-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "4.5X", effectiveRate: 7.50 },
        "Flights": { multiplier: "2X", effectiveRate: 3.33 },
      },
      note: "Lounge access discontinued March 2025",
    },
  }],
  "indusind-pioneer-legacy": [{
    portalId: "indusind-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "4.5X", effectiveRate: 7.50 },
        "Flights": { multiplier: "2X", effectiveRate: 3.33 },
      },
    },
  }],
  "indusind-pioneer-heritage": [{
    portalId: "indusind-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "4.5X", effectiveRate: 7.50 },
        "Flights": { multiplier: "2X", effectiveRate: 3.33 },
      },
    },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDFC FIRST — Travel & Shop (from card-v3-data.ts)
  // Threshold-based: 5X up to ₹20K/month, 10X on incremental
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "idfc-first-private": [{
    portalId: "idfc-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "5X", effectiveRate: 8.33 },
        "Flights": { multiplier: "3X", effectiveRate: 5 },
      },
      note: "Highest IDFC tier. Also: 10X on incremental spends above ₹20K/month",
    },
  }],
  "idfc-gaj": [{
    portalId: "idfc-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "4.5X", effectiveRate: 7.50 },
        "Flights": { multiplier: "2X", effectiveRate: 3.33 },
      },
    },
  }],
  "idfc-mayura": [{
    portalId: "idfc-travel-and-shop",
    overrides: {
      merchantOverrides: {
        "Hotels": { multiplier: "4.5X", effectiveRate: 7.50 },
        "Flights": { multiplier: "2X", effectiveRate: 3.33 },
      },
      note: "5X base up to ₹20K/month, 10X on incremental above ₹20K. International rewards reduced 10X→5X (early 2026). Base earn threshold raised ₹150→₹200.",
    },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STANDARD CHARTERED — 360° Rewards
  // SC Ultimate: 1 RP = ₹1 (best in range)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "sc-platinum-rewards": [{
    portalId: "sc-360-rewards",
    overrides: {
      merchantOverrides: {
        "Dining (Platinum Rewards)": { multiplier: "5X", effectiveRate: 3.33 },
        "Fuel (Platinum Rewards)": { multiplier: "5X", effectiveRate: 3.33 },
      },
    },
  }],
  "sc-ultimate": [{
    portalId: "sc-360-rewards",
    overrides: {
      pointValue: 1.0,
      note: "1 RP = ₹1.00 (best SC card). 5 RP/₹150 base. No monthly cap",
    },
  }],
  "sc-rewards": [{
    portalId: "sc-360-rewards",
    overrides: {
      merchantOverrides: {
        "Retail above ₹20K/month": { multiplier: "+4 RP bonus", effectiveRate: 2.67 },
      },
      cap: "2,000 bonus pts/month",
    },
  }],
  "sc-easemytrip": [{
    portalId: "sc-360-rewards",
    overrides: {
      merchantOverrides: {
        "Travel (EaseMyTrip card)": { multiplier: "10 RP/₹100", effectiveRate: 10 },
      },
      note: "10 RP/₹100 on travel bookings",
    },
  }],
  "sc-smart": [{
    portalId: "sc-360-rewards",
    overrides: { note: "Entry-level SC card — basic 360° access" },
  }],
  "sc-super-value-titanium": [{
    portalId: "sc-360-rewards",
    overrides: { note: "Standard 360° Rewards access" },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEDERAL BANK — Scapia
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "scapia-federal": [{
    portalId: "scapia-travel",
    overrides: {
      note: "20% Scapia Coins on travel via app, 10% other spends. Utilities AND Insurance excluded from Feb 2026. Lounge access threshold doubled: ₹10K→₹20K monthly spend (effective ~Feb 2026).",
    },
  }],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // YES BANK — YES Rewardz (category-based, NO dedicated portal)
  // Point value DEVALUED to ₹0.15
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "yes-bank-ace": [{
    portalId: "yes-rewardz",
    overrides: {
      note: "8 RP/₹200 online, 4 RP/₹200 offline. Cap: 5,000 RP/statement cycle",
    },
  }],
  "yes-bank-marquee": [{
    portalId: "yes-rewardz",
    overrides: {
      note: "36 RP/₹200 online (18% raw), 18 RP/₹200 offline. Effective: ~2.7% (at ₹0.15/pt)",
    },
  }],
  "yes-bank-reserv": [{
    portalId: "yes-rewardz",
    overrides: {
      note: "24 RP/₹200 online, 12 RP/₹200 offline",
    },
  }],
  "yes-bank-first-exclusive": [{
    portalId: "yes-rewardz",
    overrides: {
      note: "16 RP/₹200 on travel/dining. 8 RP/₹200 online",
    },
  }],
  "yes-bank-first-preferred": [{
    portalId: "yes-rewardz",
    overrides: {
      note: "8 RP/₹200 all categories. 4 RP/₹200 select offline",
    },
  }],
};

// ─── Resolver: Merge portal defaults with card overrides ─────────────────────

/**
 * Get resolved portal data for a specific card, with overrides applied.
 */
export function getCardPortals(cardId: string): ResolvedCardPortal[] {
  const entries = cardPortalEligibility[cardId];
  if (!entries) return [];

  return entries
    .map((entry) => {
      const portal = acceleratedPortals[entry.portalId];
      if (!portal) return null;

      const overrides = entry.overrides;

      // Start with portal default merchants
      let merchants = [...portal.merchants];

      // Apply merchant-level overrides
      if (overrides?.merchantOverrides) {
        const overrideKeys = new Set(Object.keys(overrides.merchantOverrides));

        // If we have overrides, only include merchants that are in overrides
        // (card may not have access to all portal merchants)
        if (overrideKeys.size > 0) {
          merchants = [];
          for (const [merchantName, rates] of Object.entries(overrides.merchantOverrides)) {
            const baseMerchant = portal.merchants.find((m) => m.name === merchantName);
            merchants.push({
              name: merchantName,
              multiplier: rates.multiplier,
              effectiveRate: rates.effectiveRate,
              category: baseMerchant?.category,
            });
          }
        }
      }

      return {
        portal,
        merchants,
        cap: overrides?.cap ?? null,
        pointValue: overrides?.pointValue ?? portal.defaultPointValue,
        note: overrides?.note ?? portal.note,
      } satisfies ResolvedCardPortal;
    })
    .filter((r): r is ResolvedCardPortal => r !== null);
}

/**
 * Check if a card has access to any accelerated portal.
 */
export function hasPortalAccess(cardId: string): boolean {
  return (cardPortalEligibility[cardId]?.length ?? 0) > 0;
}

/**
 * Get all card IDs that have access to a specific portal.
 */
export function getCardsByPortal(portalId: string): string[] {
  return Object.entries(cardPortalEligibility)
    .filter(([, entries]) => entries.some((e) => e.portalId === portalId))
    .map(([cardId]) => cardId);
}

/**
 * Get a flat summary of all card-portal relationships.
 */
export function getPortalSummary(): { cardId: string; portalId: string; portalName: string }[] {
  const result: { cardId: string; portalId: string; portalName: string }[] = [];
  for (const [cardId, entries] of Object.entries(cardPortalEligibility)) {
    for (const entry of entries) {
      const portal = acceleratedPortals[entry.portalId];
      if (portal) {
        result.push({ cardId, portalId: entry.portalId, portalName: portal.name });
      }
    }
  }
  return result;
}
