import { cards, type CreditCard } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import type { CardV3Data } from "@/data/card-v3-types";
import type { FinderAnswers, FinderSpending } from "./finderTypes";
import { INCOME_RANGES } from "./finderTypes";
import {
  SPENDING_TO_V3_MAP,
  PORTAL_ASSUMPTIONS,
  FEATURE_VALUATIONS,
  SCORE_THRESHOLDS,
  FINDER_RESULT_RESCORING,
  RESULTS_CONFIG,
  FEE_COMFORT_RANGES,
  DEVALUATION_PENALTIES,
} from "@/data/card-recommendations";
import { VALUE_CHANGES } from "@/data/devaluation/devaluation-entries";
import { getBankProfile } from "@/data/devaluation/devaluation-banks";

function getV3Rate(v3: CardV3Data, catKeys: string[]): { rate: number; cap: number | null } {
  for (const key of catKeys) {
    const cat = v3.categories[key];
    if (cat) return { rate: cat.rate, cap: cat.cap };
  }
  const base = v3.categories.base;
  return base ? { rate: base.rate, cap: base.cap } : { rate: 0, cap: null };
}

function parseMinIncome(s: string): number {
  const m = s.match(/([\d.]+)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return s.includes("L") ? n * 100000 : n;
}

export interface FinderResult {
  card: CreditCard;
  v3: CardV3Data | null;
  rewardsValue: number;
  milestoneValue: number;
  renewalBonusValue: number;
  featureValue: number;
  totalValue: number;
  annualFee: number;
  effectiveFee: number;
  netValue: number;
  matchScore: number;
  reasons: string[];
  eligible: boolean;
  ineligibleReason: string | null;
  devaluationWarning?: string;
}

export function calculateResults(answers: FinderAnswers): { eligible: FinderResult[]; aspirational: FinderResult[] } {
  const totalMonthlySpend = Object.values(answers.spending).reduce((a, b) => a + b, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;

  const incomeRange = INCOME_RANGES.find((r) => r.value === answers.income);
  const userMaxIncome = incomeRange?.max ?? Infinity;
  const userMinIncome = incomeRange?.min ?? 0;

  const results: FinderResult[] = cards.map((card) => {
    const v3 = getMasterCard(card.id)?.enrichment;
    if (!v3) {
      return { card, v3: null, rewardsValue: 0, milestoneValue: 0, renewalBonusValue: 0, featureValue: 0, totalValue: 0, annualFee: 0, effectiveFee: 0, netValue: 0, matchScore: 0, reasons: [], eligible: true, ineligibleReason: null };
    }

    // 1. Annual Rewards Value
    let rewardsValue = 0;
    const reasons: string[] = [];

    for (const [cat, monthlySpend] of Object.entries(answers.spending) as [keyof FinderSpending, number][]) {
      if (monthlySpend <= 0) continue;
      const catKeys = SPENDING_TO_V3_MAP[cat] ?? ["base"];
      const { rate, cap } = getV3Rate(v3, catKeys);
      let annualEarning = monthlySpend * (rate / 100) * 12;
      if (cap) annualEarning = Math.min(annualEarning, cap * 12);

      // Portal bonus
      if (answers.usesPortals && v3.portals.length > 0 && (cat === "online" || cat === "travel")) {
        const portal = v3.portals[0];
        const portalRate = portal.merchants[0]?.effectiveRate ?? 0;
        if (portalRate > rate) {
          const portalBonus = monthlySpend * ((portalRate - rate) / 100) * 12 * PORTAL_ASSUMPTIONS.defaultPortalSpendPercent;
          annualEarning += portalBonus;
        }
      }

      rewardsValue += annualEarning * v3.redemption.baseValue;
    }
    rewardsValue = Math.round(rewardsValue);

    // 2. Milestone bonuses
    let milestoneValue = 0;
    for (const ms of v3.milestones) {
      if (totalAnnualSpend >= ms.spend) {
        milestoneValue += ms.benefitValue;
      }
    }

    // 3. Renewal bonus
    const renewalBonusValue = v3.fees.renewalBenefitValue;

    // 4. Feature value
    let featureValue = 0;
    if (answers.priorities.includes("lounge") && (card.lounge === "Unlimited" || card.lounge.includes("/quarter"))) {
      const visits = card.lounge === "Unlimited" ? 8 : parseInt(card.lounge) || 4;
      featureValue += visits * FEATURE_VALUATIONS.domesticLoungeVisit;
      reasons.push(`${card.lounge} lounge access — saves ₹${(visits * FEATURE_VALUATIONS.domesticLoungeVisit).toLocaleString("en-IN")}+/yr`);
    }
    if (answers.priorities.includes("low-forex") && answers.travelsInternationally) {
      const markup = parseFloat(card.forexMarkup) || FEATURE_VALUATIONS.forexBaseline;
      if (markup < FEATURE_VALUATIONS.forexBaseline) {
        const saving = Math.round((answers.spending.travel || 0) * 12 * ((FEATURE_VALUATIONS.forexBaseline - markup) / 100));
        featureValue += saving;
        if (saving > 0) reasons.push(`${card.forexMarkup} forex markup — saves ₹${saving.toLocaleString("en-IN")}/yr`);
      }
    }

    // 5. Fee
    const annualFee = v3.fees.annual;
    const feeWaived = v3.fees.waivedOn && totalAnnualSpend >= v3.fees.waivedOn;
    const effectiveFee = feeWaived ? 0 : annualFee;

    const totalValue = rewardsValue + milestoneValue + renewalBonusValue + featureValue;
    const netValue = totalValue - effectiveFee;

    // Best category reason
    const catEntries = Object.entries(v3.categories).filter(([k]) => k !== "base");
    const bestCat = catEntries.sort((a, b) => b[1].rate - a[1].rate)[0];
    if (bestCat) {
      reasons.unshift(`${bestCat[1].rate}% earning rate on ${bestCat[0]} — highest for your spend`);
    }
    if (answers.usesPortals && v3.portals.length > 0) {
      reasons.push(`${v3.portals[0].name} portal boosts earnings further`);
    }
    if (feeWaived) {
      reasons.push(`₹${annualFee.toLocaleString("en-IN")} fee waived at ₹${(v3.fees.waivedOn! / 100000).toFixed(0)}L — you'd spend ₹${(totalAnnualSpend / 100000).toFixed(1)}L`);
    } else if (annualFee > 0) {
      reasons.push(`⚠️ ₹${annualFee.toLocaleString("en-IN")} annual fee${v3.fees.waivedOn ? ` (waived at ₹${(v3.fees.waivedOn / 100000).toFixed(0)}L spend)` : ""}`);
    }

    // 6. Match score
    let matchScore = 100;
    if (answers.priorities.includes("low-fee") && annualFee > SCORE_THRESHOLDS.highFeeThreshold) matchScore -= SCORE_THRESHOLDS.highFeePenalty;
    if (answers.priorities.includes("low-forex") && parseFloat(card.forexMarkup) > SCORE_THRESHOLDS.highForexThreshold) matchScore -= SCORE_THRESHOLDS.highForexPenalty;
    if (answers.priorities.includes("lounge") && card.lounge === "None") matchScore -= SCORE_THRESHOLDS.noLoungePenalty;
    if (answers.priorities.includes("cashback") && v3.redemption.type !== "cashback") matchScore -= SCORE_THRESHOLDS.noCashbackPenalty;
    if (answers.priorities.includes("max-rewards") && v3.baseRate >= SCORE_THRESHOLDS.highRewardsThreshold) matchScore += SCORE_THRESHOLDS.highRewardsBonus;
    matchScore = Math.max(SCORE_THRESHOLDS.minScore, Math.min(SCORE_THRESHOLDS.maxScore, matchScore));

    // 7. Eligibility
    const cardMinIncome = parseMinIncome(card.minIncome);
    let eligible = true;
    let ineligibleReason: string | null = null;
    if (cardMinIncome > userMaxIncome) {
      eligible = false;
      ineligibleReason = `Requires ${card.minIncome} income`;
    }
    // ETB check: if card issuer matches user's banks
    const issuerLower = card.issuer.toLowerCase();
    const userHasBank = answers.existingBanks.some((b) => issuerLower.includes(b.toLowerCase()));

    return { card, v3, rewardsValue, milestoneValue, renewalBonusValue, featureValue, totalValue, annualFee, effectiveFee, netValue, matchScore, reasons, eligible, ineligibleReason };
  });

  // Sort by netValue descending
  results.sort((a, b) => b.netValue - a.netValue);

  // Apply Step 4 preference filters
  const rewardType = answers.rewardType ?? "no-pref";
  const feeComfort = answers.feeComfort ?? ["free", "low", "mid", "high", "ultra"];
  const networks = answers.networks ?? ["Visa", "Mastercard", "Rupay", "Diners Club", "Amex"];

  const feeRanges = FEE_COMFORT_RANGES;

  let filtered = results.filter((r) => {
    // Network filter
    if (!networks.includes(r.card.network)) return false;
    // Fee comfort filter
    const fee = r.annualFee;
    const feeMatch = feeComfort.some((fc) => {
      const [min, max] = feeRanges[fc] || [0, Infinity];
      return fee >= min && fee <= max;
    });
    if (!feeMatch) return false;
    // Reward type filter
    if (rewardType !== "no-pref" && r.v3) {
      const rdType = r.v3.redemption.type as string;
      if (rewardType === "cashback" && rdType !== "cashback") return false;
      if (rewardType === "miles" && rdType !== "miles" && !rdType.includes("mile")) return false;
    }
    return true;
  });

  // Soft filter: if too few results, relax
  const relaxed = filtered.length < RESULTS_CONFIG.minFilterResults;
  if (relaxed) filtered = results;

  // Adjust match scores relative to top
  const maxNet = filtered[0]?.netValue || 1;
  for (let i = 0; i < filtered.length; i++) {
    const relativeValue = filtered[i].netValue / maxNet;
    filtered[i].matchScore = Math.round(filtered[i].matchScore * (FINDER_RESULT_RESCORING.baseMultiplier + FINDER_RESULT_RESCORING.relativeValueWeight * relativeValue));
    filtered[i].matchScore = Math.max(SCORE_THRESHOLDS.minScore, Math.min(SCORE_THRESHOLDS.maxScore, filtered[i].matchScore));
    if (i === 0) filtered[i].matchScore = Math.max(filtered[i].matchScore, SCORE_THRESHOLDS.topCardFloor);
  }

  // Devaluation awareness: penalize cards with recent devaluations
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - DEVALUATION_PENALTIES.lookbackMonths);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const r of filtered) {
    const recent = VALUE_CHANGES.filter(
      (vc) =>
        vc.changeType === "devaluation" &&
        vc.effectiveDate >= cutoffStr &&
        (vc.cardId === r.card.id || vc.affectedCards.includes(r.card.id)),
    );
    const worst = recent.sort((a, b) => {
      const rank = { high: 3, medium: 2, low: 1 };
      return rank[b.impactLevel] - rank[a.impactLevel];
    })[0];
    if (worst) {
      if (worst.impactLevel === "high") {
        r.matchScore = Math.max(SCORE_THRESHOLDS.minScore, r.matchScore - DEVALUATION_PENALTIES.highImpactPenalty);
      } else if (worst.impactLevel === "medium") {
        r.matchScore = Math.max(SCORE_THRESHOLDS.minScore, r.matchScore - DEVALUATION_PENALTIES.mediumImpactPenalty);
      }
      r.devaluationWarning = worst.title;
    }
    // Bank-level health warning (only if no card-specific warning already set)
    if (!r.devaluationWarning) {
      const bankId = r.card.issuer.toLowerCase().split(" ")[0];
      const bank = getBankProfile(bankId);
      if (bank && bank.healthScore < DEVALUATION_PENALTIES.bankHealthWarningThreshold) {
        r.devaluationWarning = `${bank.shortName} has frequent recent devaluations (health ${bank.healthScore}/100)`;
      }
    }
  }

  const eligible = filtered.filter((r) => r.eligible).slice(0, RESULTS_CONFIG.maxEligibleCards);
  const aspirational = filtered.filter((r) => !r.eligible).slice(0, RESULTS_CONFIG.maxAspirationalCards);

  return { eligible, aspirational };
}
