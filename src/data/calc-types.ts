// ── Category bucket (shared by Rewards & FeeWorth) ──────────────────
export interface CategoryBucket {
  rate: number;
  cap: number | null;
  capPeriod: string | null;
  note: string | null;
}

export type SpendCategory =
  | 'grocery'
  | 'dining'
  | 'fuel'
  | 'online'
  | 'travel'
  | 'utilities'
  | 'entertainment'
  | 'base';

export type CategoryMap = Record<SpendCategory, CategoryBucket>;

// ── Rewards Calculator ──────────────────────────────────────────────
export interface PortalMerchant {
  name: string;
  category: string;
  multiplier: string;
  effectiveRate: number;
  note: string | null;
}

export interface RewardsCalcPortal {
  name: string;
  url: string;
  monthlyCap: number | null;
  merchants: PortalMerchant[];
}

export interface RewardsCalcCard {
  id: string;
  name: string;
  shortName: string;
  bank: string;
  image: string;
  tier: string;
  rewardType: string;
  rewardName: string;
  baseRate: number;
  baseRateLabel: string;
  pointValue: number;
  categories: CategoryMap;
  exclusions: string[];
  monthlyCap: number | null;
  portalName: string | null;
  portalTopRate: string | null;
  portals: RewardsCalcPortal[];
}

// ── Redemption Calculator ───────────────────────────────────────────
export interface RedemptionOption {
  type: string;
  value: number;
  desc: string;
  recommended: boolean;
  minPoints: number | null;
  fee: number | null;
}

export interface TransferPartner {
  name: string;
  ratio: string;
  type: string;
  program: string;
}

export interface RedemptionRestrictions {
  maxRedemptionsPerMonth: number | null;
  maxPointsPerMonth: number | null;
  maxCycleCeiling: number | null;
  note: string | null;
}

export interface RedemptionCalcCard {
  id: string;
  name: string;
  image: string;
  bank: string;
  pointCurrency: string;
  rewardType: string;
  baseValue: number;
  bestOption: string;
  expiryMonths: number | null;
  expiryText: string;
  options: RedemptionOption[];
  transferPartners: TransferPartner[];
  restrictions: RedemptionRestrictions | null;
}

// ── Fee-Worth Calculator ────────────────────────────────────────────
export interface Milestone {
  spend: number;
  benefit: string;
  value: number;
  period: string;
}

export interface LoungeProgram {
  name: string;
  membershipTier: string | null;
  cardIssued: boolean;
  enrollmentUrl: string | null;
}

export interface Lounge {
  domesticVisits: string;
  domesticUnlimited: boolean;
  intlVisits: string;
  intlUnlimited: boolean;
  programs: LoungeProgram[];
  spendRequired: number | null;
}

export interface Golf {
  included: boolean;
  text: string | null;
}

export interface Membership {
  name: string;
  type: string;
  value: number;
}

export interface Insurance {
  type: string;
  cover: string;
  text: string;
}

export interface FeeWorthCalcCard {
  id: string;
  name: string;
  image: string;
  bank: string;
  network: string;
  networkBase: string;
  tier: string;
  annualFee: number;
  joiningFee: number;
  feeWaivedOn: number | null;
  waiverText: string;
  renewalBenefitValue: number;
  renewalBenefitText: string;
  baseRate: number;
  pointValue: number;
  rewardType: string;
  categories: CategoryMap;
  exclusions: string[];
  milestones: Milestone[];
  lounge: Lounge;
  golf: Golf;
  memberships: Membership[];
  insurance: Insurance[];
  fuelSurcharge: string;
  forexMarkup: string;
  entertainment: string | null;
  joiningBonus: string;
  rating: number;
  tags: string[];
  verdict: string;
  pros: string[];
  cons: string[];
}

// ── Typed data imports ──────────────────────────────────────────────
import rewardsRaw from './rewards-calc-data.json';
import redemptionRaw from './redemption-calc-data.json';
import feeworthRaw from './feeworth-calc-data.json';

/** Strip the _meta key injected by generate-calc-data.ts */
function stripMeta<T>(raw: Record<string, unknown>): Record<string, T> {
  const { _meta, ...rest } = raw;
  return rest as Record<string, T>;
}

export const rewardsCalcData = stripMeta<RewardsCalcCard>(rewardsRaw as Record<string, unknown>);
export const redemptionCalcData = stripMeta<RedemptionCalcCard>(redemptionRaw as Record<string, unknown>);
export const feeworthCalcData = stripMeta<FeeWorthCalcCard>(feeworthRaw as Record<string, unknown>);
