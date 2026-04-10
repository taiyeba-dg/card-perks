// Unified V3 types for CardPerks — derived from actual batch JSON data
// Covers all fields found across sc-cards, idfc, au-sbi, bob-hsbc,
// indusind-yes-bank, all-cobranded, rbl-onecard, and other batch files.

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export interface CardV3Identity {
  id: string;
  slug?: string;
  name: string;
  bank: string;
  partner?: string;                     // co-branded partner e.g. "Flipkart"
  network: string;                      // e.g. "Visa Infinite", "Mastercard/Visa"
  image: string;                        // path like "/assets/cards/sc-rewards.png"
  link: string;                         // apply / info URL

  // COMPUTED — not in raw batch data
  shortName: string;
  bankId: string;
  networkBase: string;                  // normalized: "visa" | "mastercard" | "rupay" | "amex" | "dinersclub"
}

// ---------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------

export interface FeesV3 {
  joining: number;
  annual: number;
  currency: "INR";
  gstExtra?: boolean;
  waivedOn?: number | null;
  waiverText?: string;
  renewalBenefitText?: string;
  renewalBenefitValue?: number;

  // COMPUTED
  effectiveAnnualCost: number;          // annual minus renewalBenefitValue (floored at 0)
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

export interface EligibilityV3 {
  income?: number | null;               // minimum annual income in INR
  age?: { min: number; max: number };
  selfEmployedAge?: { min: number; max: number };
  type?: string;                        // "salaried" | "self-employed" | "both"
  creditScore?: number;
  ntbEligible?: boolean;               // new-to-bank eligible
  note?: string;

  // COMPUTED
  incomeLabel: string;                  // e.g. "₹12L+/year"
}

// ---------------------------------------------------------------------------
// Rewards — calculator categories
// ---------------------------------------------------------------------------

export interface CategoryRateV3 {
  rate: number;                         // 0-1 range (0.0067 = 0.67%)
  label: string;                        // human-readable e.g. "4 RP/₹150 (0.67%)"
  multiplier?: string;                  // e.g. "5X", "10X"
  cap?: number | null;
  capPeriod?: string;                   // "month" | "quarter" | "statement cycle" | "year" | "per transaction"
  note?: string;
  effectiveDate?: string;

  // Some IDFC-style categories have threshold-based sub-rates
  belowThreshold?: { rate: number; label: string };
  aboveThreshold?: { rate: number; label: string };
}

// ---------------------------------------------------------------------------
// Rewards — accelerated rate (SC-style)
// ---------------------------------------------------------------------------

export interface AcceleratedRateV3 {
  threshold: number;                    // monthly spend threshold in INR
  rate: number;
  label: string;
  bonusCap?: number;
}

// ---------------------------------------------------------------------------
// Rewards — portal merchants
// ---------------------------------------------------------------------------

export interface PortalMerchantV3 {
  name: string;
  category?: string;
  multiplier: string;                   // e.g. "10X", "35X"
  effectiveRate: number;                // 0-1 range like 0.33 (or 0-100 as per batch)
  effectiveRateLabel?: string;
  cap?: number | null;
  note?: string;
}

export interface PortalV3 {
  id?: string;
  name: string;
  url?: string;
  type?: string;
  monthlyCap?: number | null;
  cap?: string | null;                  // text form e.g. "25,000 bonus RP/month"
  pointValueLabel?: string;
  note?: string | null;
  merchants: PortalMerchantV3[];
}

// ---------------------------------------------------------------------------
// Rewards — redemption
// ---------------------------------------------------------------------------

export interface RedemptionOptionV3 {
  type: string;
  value: number | string;               // INR per point (some batches use "varies")
  desc: string;
  recommended?: boolean;
  processingTime?: string;
  fee?: string;
  minPoints?: number | null;
}

export interface RedemptionRestrictionsV3 {
  maxRedemptionsPerMonth?: number;
  maxPointsPerMonth?: number;
  note?: string;
}

export interface TransferPartnerV3 {
  name: string;
  type: "airline" | "hotel" | string;
  programName?: string;
  ratio: string;                        // e.g. "2:1"
  ratioNumeric?: number;
  minTransfer?: number;
  minPoints?: number;
  transferTime?: string;
  fee?: string;
  note?: string;
}

export interface RedemptionV3 {
  baseValue: number;                    // best INR per point
  bestOption: string;
  redemptionFee?: number;
  redemptionFeeGst?: boolean;
  options: RedemptionOptionV3[];
  restrictions?: RedemptionRestrictionsV3;
  transferPartners?: TransferPartnerV3[];
  discontinuedPrograms?: { program: string; discontinuedDate: string }[];
  catalogUrl?: string;
}

// ---------------------------------------------------------------------------
// Rewards — top level
// ---------------------------------------------------------------------------

export interface RewardsV3 {
  type: "points" | "cashback" | "miles";
  name?: string;                        // reward program name
  pointName?: string;                   // e.g. "Travel Points", "Saving Points"
  programName?: string;                 // e.g. "BOBCARD Reward Points"
  pointCurrency?: string;
  baseRate: number;                     // 0-1 range (0.0067 = 0.67%)
  baseRateLabel?: string;
  earningText: string;
  expiry: string;
  joiningBonus?: string;
  exclusions?: string | string[];       // can be string array in some batches
  devaluationNote?: string;
  retentionRequirement?: Record<string, unknown>;
  rewardPlans?: RewardPlanV3[];         // IndusInd-style selectable plans

  calculator: {
    tier: string;                       // "entry" | "premium" | "super-premium" | "ultra-premium" | "cashback" | "co-branded" | "mid-range" | "semi-premium" | "points"
    monthlyCap: number | null;
    monthlyCapNote?: string;
    bonusCap?: number;
    acceleratedCap?: number;
    acceleratedCapPeriod?: string;
    spendThreshold?: number;            // IDFC-style monthly threshold
    categories: Record<string, CategoryRateV3>;
    acceleratedRate?: AcceleratedRateV3;
    exclusions?: string[];              // BOB-style exclusion list in calculator
    portals?: PortalV3[];
  };

  redemption: RedemptionV3;
}

export interface RewardPlanV3 {
  name: string;                         // e.g. "Shop Plan", "Travel Plan"
  categories: string[];
}

// ---------------------------------------------------------------------------
// Features — lounge access
// ---------------------------------------------------------------------------

export interface LoungeAccessDetailV3 {
  visits: string;                       // text like "4 per year", "Unlimited", "None"
  visitsPerQuarter?: number | null;
  visitsPerYear?: number | null;
  unlimited?: boolean;
  spendRequired?: number;
  spendPeriod?: string;
  perVisitFee?: number | null;
  companionFree?: boolean;
  companionFee?: number | null;
  accessVia?: string;
}

export interface LoungeAccessV3 {
  domestic: string | LoungeAccessDetailV3;
  domesticNote?: string;
  international?: string | LoungeAccessDetailV3;
  railway?: string;                     // IDFC/AU-style railway lounge
  accessType?: string;                  // e.g. "Mastercard Domestic Lounge Network"
  loungeCount?: string;                 // e.g. "60+ domestic lounges"
  guestAccess?: string;
  spendRequirement?: Record<string, number>;
  spaAccess?: string;
  note?: string | null;
  programs?: unknown[];
}

// ---------------------------------------------------------------------------
// Features — milestones
// ---------------------------------------------------------------------------

export interface MilestoneV3 {
  spend: number | null;                 // null for non-spend milestones (e.g. fee-payment bonus)
  benefit: string;
  benefitValue?: number;
  period?: string;                      // "annual" | "quarter" | "first 60 days" | "welcome"
  note?: string;
}

// ---------------------------------------------------------------------------
// Features — fuel
// ---------------------------------------------------------------------------

export interface FuelV3 {
  surchargeWaiver: string | number;     // "1%" or 0.01
  surchargeWaiverText?: string;
  cap?: number;
  capPerMonth?: number;
  capPeriod?: string;
  minTxn?: number;
  minTransaction?: number;              // alternate key found in some batches
  maxTxn?: number;
  maxTransaction?: number;              // alternate key found in some batches
  validRange?: string;                  // e.g. "₹400 - ₹4,000"
  earnsRewards?: boolean;
}

// ---------------------------------------------------------------------------
// Features — forex
// ---------------------------------------------------------------------------

export interface ForexV3 {
  markup: number;                       // 0-1 range (0.035 = 3.5%)
  text?: string;                        // e.g. "3.5% + GST", "0% Forex Markup"
  markupText?: string;
  effectiveMarkup?: number;
  effectiveMarkupText?: string;
  zeroMarkup?: boolean;
}

// ---------------------------------------------------------------------------
// Features — insurance
// ---------------------------------------------------------------------------

export interface InsuranceCoverV3 {
  type: string;
  cover: string;
  text: string;
}

// Insurance in batch data varies widely — sometimes an object with named fields
export interface InsuranceRawV3 {
  included?: boolean;
  airAccident?: number;
  nonAirAccident?: number;
  tripCancellation?: number;
  travelInsurance?: string;
  lostCard?: boolean;
  lostCardText?: string;
  creditShield?: number;
  purchaseProtection?: number;
  zeroLiability?: boolean;
  baggageLoss?: boolean;
  lostBaggage?: number;
  delayedBaggage?: number;
  lostPassport?: number;
  lostTicket?: number;
  flightDelay?: boolean;
  missedConnection?: number;
  coverage?: string[];                  // RBL-style array of coverage names
}

// ---------------------------------------------------------------------------
// Features — dining
// ---------------------------------------------------------------------------

export interface DiningV3 {
  culinaryTreats?: boolean;
  culinaryTreatsText?: string;
  acceleratedDining?: boolean;
  acceleratedDiningText?: string;
}

// ---------------------------------------------------------------------------
// Features — memberships
// ---------------------------------------------------------------------------

export interface MembershipV3 {
  name: string;
  type?: string;                        // "welcome" | "annual" | "complimentary"
  condition?: string;
  value?: number;
}

// ---------------------------------------------------------------------------
// Features — welcome / birthday
// ---------------------------------------------------------------------------

export interface WelcomeBenefitV3 {
  included: boolean;
  benefit?: string;
  text?: string;
  value?: number;
  condition?: string;
  additionalBenefit?: string;
  creditTimeline?: string;
}

export interface BirthdayBenefitV3 {
  included: boolean;
  text?: string;
}

// ---------------------------------------------------------------------------
// Features — golf / movies / concierge
// ---------------------------------------------------------------------------

export interface GolfV3 {
  included: boolean;
  text: string;
}

export interface MoviesV3 {
  included: boolean;
  text?: string;
  platform?: string;
}

export interface ConciergeV3 {
  included: boolean;
  text?: string;
}

// ---------------------------------------------------------------------------
// Features — top level
// ---------------------------------------------------------------------------

export interface FeaturesV3 {
  lounge: LoungeAccessV3;
  milestones: MilestoneV3[];
  welcome?: WelcomeBenefitV3;
  birthday?: BirthdayBenefitV3;
  golf?: GolfV3 | null;
  movies?: MoviesV3 | null;
  fuel?: FuelV3 | null;
  forex?: ForexV3 | null;
  insurance?: InsuranceRawV3 | InsuranceCoverV3[] | null;
  entertainment?: unknown;
  dining?: DiningV3 | null;
  memberships?: MembershipV3[] | string | null;
  concierge?: ConciergeV3 | boolean;
  contactless?: boolean | { enabled: boolean; limit?: number };
  cardMaterial?: string;
  roadsideAssistance?: { included: boolean; text?: string };
  rentalFee?: { rate: number; text?: string };
  emi?: { available: boolean; minAmount?: number; tenure?: string };
  addOn?: { available: boolean; count?: number; fee?: number; text?: string };
  welcomeBenefits?: WelcomeBenefitV3;   // alternate key in some batches
  restrictions?: unknown;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export interface MetadataV3 {
  tags: string[];
  bestFor: string;
  rating: number;
  verdict: string;
  pros: string[];
  cons: string[];
  cardNetwork?: string;                 // some batches put network here
  incomeRequirement?: number;           // BOB-style income in metadata
  lastVerified?: string;
  dataSource?: string;
  lastUpdated?: string;
  discontinued?: boolean;
  eligibility?: EligibilityV3;          // AU-style eligibility nested in metadata

  // COMPUTED
  bestForTags: string[];                // parsed from bestFor string
}

// ---------------------------------------------------------------------------
// Special Offers
// ---------------------------------------------------------------------------

export interface SpecialOfferV3 {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string | null;
  category?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Unified Card — the full V3 shape
// ---------------------------------------------------------------------------

export interface CardV3Unified extends CardV3Identity {
  fees: FeesV3;
  eligibility?: EligibilityV3;
  rewards: RewardsV3;
  features: FeaturesV3;
  metadata: MetadataV3;
  specialOffers?: SpecialOfferV3[];
  relatedCardIds?: string[];
  upgradeFromId?: string | null;
  upgradeToId?: string | null;
  applyLink?: string | null;
  billing?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Convenience type aliases for import ergonomics
// ---------------------------------------------------------------------------

export type CardV3 = CardV3Unified;
export type LoungeAccess = LoungeAccessV3;
export type Milestone = MilestoneV3;
export type Portal = PortalV3;
export type Forex = ForexV3;
export type Fuel = FuelV3;
export type Fees = FeesV3;
export type Rewards = RewardsV3;
export type Features = FeaturesV3;
export type Metadata = MetadataV3;
