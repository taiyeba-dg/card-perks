// V3 enrichment types for card detail page
export interface CategoryRate {
  label: string;        // e.g. "5 RP per ₹150"
  rate: number;         // effective % e.g. 3.3
  cap: number | null;   // monthly cap in RP or ₹, null = unlimited
  capPeriod: "Monthly" | "Quarterly" | "Annual" | "Per Txn" | null;
  minTxn: number | null;
  note: string | null;
}

export interface RewardExclusion {
  category: string;
  mccCodes?: string;
  note: string;
}

export interface RewardPortal {
  name: string;
  url: string;
  merchants: { name: string; multiplier: string; effectiveRate: number }[];
  cap: string | null;         // e.g. "25,000 bonus RP/month"
  pointValueLabel: string;    // e.g. "1 RP = ₹1.00 on SmartBuy flights"
  note: string | null;
}

export interface RedemptionOption {
  type: string;
  value: number;              // ₹ per point
  processingTime: string;
  fee: string;
  minPoints: number | null;
}

export interface TransferPartner {
  name: string;
  type: "airline" | "hotel";
  ratio: string;              // e.g. "2:1"
  ratioNumeric: number;       // e.g. 2 (how many RP per 1 mile)
  minPoints: number;
  transferTime: string;
  fee: string;
}

export interface Milestone {
  spend: number;              // annual spend in ₹
  benefit: string;
  benefitValue: number;       // ₹ value of the benefit
}

export interface SpecialOffer {
  title: string;
  description: string;
  category: string;
  validFrom: string;
  validTo: string;
}

export interface CardV3Data {
  categories: Record<string, CategoryRate>;
  exclusions: RewardExclusion[];
  portals: RewardPortal[];
  redemption: {
    type: "points" | "cashback";
    pointCurrency: string;
    baseValue: number;        // best ₹/point
    bestOption: string;
    options: RedemptionOption[];
    transferPartners: TransferPartner[];
  };
  fees: {
    annual: number;
    renewal: number;
    waivedOn: number | null;  // annual spend for waiver
    renewalBenefitValue: number;
  };
  milestones: Milestone[];
  baseRate: number;           // effective base earn %
  upgradePath: { cardId: string; cardName: string; condition: string }[];
  upgradeFromId: string | null;
  upgradeToId: string | null;
  applyLink: string | null;
  specialOffers: SpecialOffer[];
  relatedCardIds: string[];
}
