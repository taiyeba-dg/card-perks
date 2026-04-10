import type { CardV3Data } from "./card-v3-types";
import type { CardV3IndexEntry } from "./cards-v3-index";
import type { CardV3 } from "./card-v3-unified-types";

/**
 * Calculate a 1-5 star rating for a credit card using V3 enrichment data.
 *
 * Formula (weighted score out of 5):
 *   Base Reward Rate    (25%) — 0-5%+ scaled to 0-5
 *   Best Category Rate  (20%) — highest accelerated rate, 0-10%+ scaled to 0-5
 *   Fee Value Ratio     (20%) — benefit / fee ratio
 *   Redemption Value    (15%) — ₹/point scaled to 0-5
 *   Category Breadth    (10%) — number of accelerated categories
 *   Perks Score         (10%) — milestones, portals, transfers, offers, lounge
 *
 * Final score rounded to 1 decimal, clamped to [2.5, 4.9].
 */
export function calculateCardRating(
  v3: CardV3Data,
  index: CardV3IndexEntry,
): number {
  const baseRateScore = scoreBaseRate(v3.baseRate);
  const bestCategoryScore = scoreBestCategory(v3);
  const feeValueScore = scoreFeeValue(v3, index);
  const redemptionScore = scoreRedemption(v3);
  const breadthScore = scoreBreadth(v3);
  const perksScore = scorePerks(v3, index);

  const weighted =
    baseRateScore * 0.25 +
    bestCategoryScore * 0.20 +
    feeValueScore * 0.20 +
    redemptionScore * 0.15 +
    breadthScore * 0.10 +
    perksScore * 0.10;

  const rounded = Math.round(weighted * 10) / 10;
  return Math.min(4.9, Math.max(2.5, rounded));
}

/** Base rate: 0.5% → 2, 1% → 3, 2% → 4, 3%+ → 5 */
function scoreBaseRate(rate: number): number {
  const pct = rate < 1 ? rate * 100 : rate;
  // 1% → 3, 2% → 4, 3% → 5
  return clamp(1 + pct * (4 / 3), 0, 5);
}

/** Best accelerated category rate: 3% → 2.5, 5% → 3.75, 8%+ → 5 */
function scoreBestCategory(v3: CardV3Data): number {
  let best = 0;
  for (const cat of Object.values(v3.categories)) {
    const rate = cat.rate < 1 ? cat.rate * 100 : cat.rate;
    if (rate > best) best = rate;
  }
  return clamp(best * (5 / 8), 0, 5);
}

/**
 * Fee value ratio:
 *   LTF cards get 3.5-5 based on reward quality
 *   Paid cards: (renewalBenefitValue + annual reward on ₹10L) / fee
 */
function scoreFeeValue(v3: CardV3Data, index: CardV3IndexEntry): number {
  const annualFee = v3.fees.annual || index.feeAnnual || 0;
  const baseRate = v3.baseRate < 1 ? v3.baseRate * 100 : v3.baseRate;
  const annualRewardOn10L = 1000000 * (baseRate / 100) * Math.max(v3.redemption.baseValue, 0.01);
  const renewalBenefit = v3.fees.renewalBenefitValue || 0;
  const totalBenefit = renewalBenefit + annualRewardOn10L;

  if (annualFee === 0) {
    // Lifetime free — generous scoring, min 3.5
    return clamp(3.5 + annualRewardOn10L / 5000, 3.5, 5);
  }

  const ratio = totalBenefit / Math.max(annualFee, 1);
  // ratio 0.5 → 2.5, 1.0 → 3.5, 2.0 → 5
  return clamp(1.5 + ratio * 2, 0, 5);
}

/** Redemption: cashback = 5, ₹0.25/pt → 3.25, ₹0.50/pt → 4, ₹1/pt → 5 */
function scoreRedemption(v3: CardV3Data): number {
  if (v3.redemption.type === "cashback") return 5;
  const val = v3.redemption.baseValue;
  if (val >= 1) return 5;
  if (val <= 0) return 2.5;
  // ₹0.25 → 3.25, ₹0.50 → 4.0, ₹1.0 → 5.0
  return clamp(2.5 + val * 2.5, 2.5, 5);
}

/** Category breadth: 1 cat = 2.5, 2 = 3.3, 3 = 4.2, 4+ = 5 */
function scoreBreadth(v3: CardV3Data): number {
  const keys = Object.keys(v3.categories).filter((k) => k !== "base");
  if (keys.length === 0) return 1;
  return clamp(1.5 + keys.length * (3.5 / 4), 0, 5);
}

/** Perks: 1 point each for milestones, portals, transfer partners, special offers, lounge. Max 5. */
function scorePerks(v3: CardV3Data, index: CardV3IndexEntry): number {
  let points = 0;
  if (v3.milestones.length > 0) points++;
  if (v3.portals.length > 0) points++;
  if (v3.redemption.transferPartners.length > 0) points++;
  if (v3.specialOffers.length > 0) points++;
  if (index.loungeVisits && index.loungeVisits !== "None") points++;
  return points; // already 0-5
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculate rating from a full CardV3 object (unified type from cards-v3.json).
 * Bridges to calculateCardRating by extracting the needed fields.
 */
export function calculateCardRatingV3(card: CardV3): number {
  const calc = card.rewards.calculator;
  const baseRate = card.rewards.baseRate < 1 ? card.rewards.baseRate * 100 : card.rewards.baseRate;

  // Build a CardV3Data-compatible object
  const categories: CardV3Data["categories"] = {};
  for (const [key, cat] of Object.entries(calc.categories || {})) {
    categories[key] = {
      label: cat.label,
      rate: cat.rate < 1 ? cat.rate * 100 : cat.rate,
      cap: cat.cap ?? null,
      capPeriod: null,
      minTxn: null,
      note: cat.note ?? null,
    };
  }

  const redemption = card.rewards.redemption;
  const v3: CardV3Data = {
    categories,
    exclusions: [],
    portals: (calc.portals || []).map((p) => ({
      name: p.name,
      url: p.url || "",
      merchants: (p.merchants || []).map((m) => ({
        name: m.name,
        multiplier: m.multiplier,
        effectiveRate: m.effectiveRate < 1 ? m.effectiveRate * 100 : m.effectiveRate,
      })),
      cap: null,
      pointValueLabel: "",
      note: null,
    })),
    redemption: {
      type: redemption.type === "cashback" ? "cashback" : "points",
      pointCurrency: redemption.pointCurrency || "",
      baseValue: redemption.baseValue ?? 0,
      bestOption: redemption.bestOption || "",
      options: [],
      transferPartners: (redemption.transferPartners || []).map((tp) => ({
        name: tp.name,
        type: tp.type as "airline" | "hotel",
        ratio: tp.ratio,
        ratioNumeric: tp.ratioNumeric ?? 1,
        minPoints: tp.minPoints ?? 0,
        transferTime: tp.transferTime || "",
        fee: tp.fee || "",
      })),
    },
    fees: {
      annual: card.fees.annual,
      renewal: card.fees.renewal ?? card.fees.annual,
      waivedOn: card.fees.waiverSpend ?? null,
      renewalBenefitValue: card.fees.renewalBenefitValue ?? 0,
    },
    milestones: (card.features.milestones || []).map((m) => ({
      spend: m.spend ?? 0,
      benefit: m.benefit,
      benefitValue: m.benefitValue ?? 0,
    })),
    baseRate,
    upgradePath: [],
    upgradeFromId: null,
    upgradeToId: null,
    applyLink: null,
    specialOffers: [],
    relatedCardIds: [],
  };

  const index: CardV3IndexEntry = {
    id: card.id,
    slug: card.slug || card.id,
    name: card.name,
    shortName: card.shortName || card.name,
    bank: card.bank,
    bankId: card.bankId,
    network: card.network,
    networkBase: card.networkBase || card.network,
    image: card.image,
    tier: calc.tier || "",
    rating: card.metadata.rating,
    feeAnnual: card.fees.annual,
    baseRate: card.rewards.baseRate,
    loungeVisits: "",
    tags: card.metadata.tags || [],
    color: "#0D0D0D",
  };

  // Extract lounge visits string
  const lounge = card.features.lounge;
  if (lounge?.domestic) {
    if (typeof lounge.domestic === "string") {
      index.loungeVisits = lounge.domestic;
    } else if (typeof lounge.domestic === "object" && lounge.domestic.visits) {
      index.loungeVisits = String(lounge.domestic.visits);
    }
  }

  return calculateCardRating(v3, index);
}
