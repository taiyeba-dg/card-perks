import type { FinderSpending, FinderAnswers } from "@/components/card-finder/finderTypes";
import type { CreditCard } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";
import { getMasterCard } from "@/data/card-v3-master";
import { FINDER_CATEGORIES } from "@/components/card-finder/finderTypes";

export interface OptimizerCard {
  card: CreditCard;
  v3: CardV3Data | null;
}

// Map finder spending category IDs to V3 category keys
const CAT_V3_MAP: Record<keyof FinderSpending, string[]> = {
  dining: ["dining"],
  groceries: ["grocery"],
  online: ["online"],
  travel: ["travel"],
  fuel: ["fuel"],
  entertainment: ["entertainment"],
  pharmacy: ["base"],
  telecom: ["base"],
  education: ["base"],
  utilities: ["utilities", "base"],
  rent: ["base"],
  other: ["base"],
};

function getRate(v3: CardV3Data, catKeys: string[]): { rate: number; cap: number | null; label: string } {
  for (const key of catKeys) {
    const cat = v3.categories[key];
    if (cat) return { rate: cat.rate, cap: cat.cap, label: cat.label };
  }
  const base = v3.categories.base;
  return base ? { rate: base.rate, cap: base.cap, label: base.label } : { rate: 0, cap: null, label: "—" };
}

function getPortalRate(v3: CardV3Data, catId: keyof FinderSpending): number | null {
  if (v3.portals.length === 0) return null;
  if (catId !== "online" && catId !== "travel") return null;
  const portal = v3.portals[0];
  const bestMerchant = portal.merchants.reduce((a, b) => (a.effectiveRate > b.effectiveRate ? a : b), portal.merchants[0]);
  return bestMerchant?.effectiveRate ?? null;
}

export interface CategoryAssignment {
  categoryId: keyof FinderSpending;
  categoryLabel: string;
  categoryIcon: string;
  monthlySpend: number;
  bestCard: OptimizerCard;
  bestRate: number;
  bestLabel: string;
  annualEarning: number;
  isPortal: boolean;
  portalName: string | null;
  capped: boolean;
  capDetail: string | null;
  runnerUp: { card: OptimizerCard; rate: number } | null;
}

export interface CardSummary {
  card: OptimizerCard;
  categories: string[];
  annualEarning: number;
  annualFee: number;
  feeWaived: boolean;
  netValue: number;
  pctOfTotal: number;
  isWeakest: boolean;
}

export interface OptimizerResult {
  assignments: CategoryAssignment[];
  totalOptimized: number;
  singleBestValue: number;
  singleBestCard: OptimizerCard | null;
  randomValue: number;
  cardSummaries: CardSummary[];
  tips: string[];
}

/**
 * Build a minimal CardV3Data from basic CreditCard fields so that cards
 * without hand-authored V3 enrichment still participate in the optimizer.
 */
function createFallbackV3(card: CreditCard): CardV3Data {
  // Parse the rewardRate string like "1%", "2%", "3.3%" to a number
  const rateMatch = card.rewardRate?.match(/([0-9.]+)/);
  const baseRate = rateMatch ? parseFloat(rateMatch[1]) : 1;

  // Parse fee string like "₹500", "₹10,000", "₹0" to a number
  const feeMatch = card.fee?.match(/([0-9,]+)/);
  const annualFee = feeMatch ? parseInt(feeMatch[1].replace(/,/g, ""), 10) : 0;

  return {
    categories: {
      base: { label: `${baseRate}%`, rate: baseRate, cap: null, capPeriod: null, minTxn: null, note: null },
    },
    exclusions: [],
    portals: [],
    redemption: {
      type: "points",
      pointCurrency: "Reward Points",
      baseValue: card.rewardRate?.toLowerCase().includes("cashback") ? 1 : 0.25,
      bestOption: "Statement credit",
      options: [],
      transferPartners: [],
    },
    fees: { annual: annualFee, renewal: annualFee, waivedOn: null, renewalBenefitValue: 0 },
    milestones: [],
    baseRate,
    upgradePath: [],
    upgradeFromId: null,
    upgradeToId: null,
    applyLink: null,
    specialOffers: [],
    relatedCardIds: [],
  };
}

export function optimizeStack(
  selectedCards: CreditCard[],
  spending: FinderSpending,
  enabledPortals: string[]
): OptimizerResult {
  const cards: OptimizerCard[] = selectedCards.map((c) => ({
    card: c,
    v3: getMasterCard(c.id)?.enrichment ?? createFallbackV3(c),
  }));
  const totalAnnualSpend = Object.values(spending).reduce((a, b) => a + b, 0) * 12;

  const assignments: CategoryAssignment[] = [];
  const cardEarnings: Record<string, number> = {};
  const cardCategories: Record<string, string[]> = {};
  cards.forEach((c) => { cardEarnings[c.card.id] = 0; cardCategories[c.card.id] = []; });

  // Per-card total if used for everything (for single-best comparison)
  const singleCardTotals: Record<string, number> = {};
  cards.forEach((c) => { singleCardTotals[c.card.id] = 0; });

  const catDefs = FINDER_CATEGORIES;

  for (const catDef of catDefs) {
    const catId = catDef.id;
    const monthlySpend = spending[catId];
    if (monthlySpend <= 0) continue;

    let best: { card: OptimizerCard; rate: number; label: string; isPortal: boolean; portalName: string | null; capped: boolean; capDetail: string | null; annualEarning: number } | null = null;
    let runnerUp: { card: OptimizerCard; rate: number } | null = null;
    const candidates: { card: OptimizerCard; rate: number; label: string; isPortal: boolean; portalName: string | null; capped: boolean; capDetail: string | null; annualEarning: number }[] = [];

    for (const oc of cards) {
      if (!oc.v3 || Object.keys(oc.v3.categories).length === 0) continue;
      const catKeys = CAT_V3_MAP[catId];
      const { rate, cap, label } = getRate(oc.v3, catKeys);

      // Check portal
      let effectiveRate = rate;
      let isPortal = false;
      let portalName: string | null = null;
      const portalRate = getPortalRate(oc.v3, catId);
      const bankPortalEnabled = enabledPortals.some((p) =>
        oc.v3!.portals.some((portal) => portal.name.toLowerCase().includes(p.toLowerCase()))
      );
      if (portalRate && portalRate > rate && bankPortalEnabled) {
        effectiveRate = portalRate;
        isPortal = true;
        portalName = oc.v3.portals[0]?.name ?? null;
      }

      // Calculate annual earning
      let monthlyEarning = monthlySpend * (effectiveRate / 100);
      let capped = false;
      let capDetail: string | null = null;
      if (cap && monthlyEarning > cap) {
        capped = true;
        capDetail = `Capped at ${cap.toLocaleString("en-IN")}/mo`;
        monthlyEarning = cap;
      }
      const annualEarning = Math.round(monthlyEarning * 12 * oc.v3.redemption.baseValue);

      candidates.push({ card: oc, rate: effectiveRate, label, isPortal, portalName, capped, capDetail, annualEarning });

      // Single-card total
      singleCardTotals[oc.card.id] += annualEarning;
    }

    candidates.sort((a, b) => b.annualEarning - a.annualEarning);
    best = candidates[0] ?? null;
    runnerUp = candidates[1] ? { card: candidates[1].card, rate: candidates[1].rate } : null;

    if (best) {
      assignments.push({
        categoryId: catId,
        categoryLabel: catDef.label,
        categoryIcon: catDef.icon,
        monthlySpend,
        bestCard: best.card,
        bestRate: best.rate,
        bestLabel: best.label,
        annualEarning: best.annualEarning,
        isPortal: best.isPortal,
        portalName: best.portalName,
        capped: best.capped,
        capDetail: best.capDetail,
        runnerUp,
      });
      cardEarnings[best.card.card.id] += best.annualEarning;
      cardCategories[best.card.card.id].push(catDef.label);
    }
  }

  const totalOptimized = Object.values(cardEarnings).reduce((a, b) => a + b, 0);

  // Single best card
  let singleBestValue = 0;
  let singleBestCard: OptimizerCard | null = null;
  for (const oc of cards) {
    if (singleCardTotals[oc.card.id] > singleBestValue) {
      singleBestValue = singleCardTotals[oc.card.id];
      singleBestCard = oc;
    }
  }

  // Random value (lowest base rate across all cards)
  const lowestBaseRate = Math.min(...cards.map((c) => c.v3?.baseRate ?? 1));
  const avgBaseValue = cards.reduce((sum, c) => sum + (c.v3?.redemption.baseValue ?? 0.25), 0) / cards.length;
  const randomValue = Math.round(Object.values(spending).reduce((a, b) => a + b, 0) * (lowestBaseRate / 100) * 12 * avgBaseValue);

  // Card summaries
  const cardSummaries: CardSummary[] = cards.map((oc) => {
    const annualEarning = cardEarnings[oc.card.id];
    const annualFee = oc.v3?.fees.annual ?? 0;
    const feeWaived = oc.v3?.fees.waivedOn ? totalAnnualSpend >= oc.v3.fees.waivedOn : false;
    const effectiveFee = feeWaived ? 0 : annualFee;
    return {
      card: oc,
      categories: cardCategories[oc.card.id],
      annualEarning,
      annualFee,
      feeWaived,
      netValue: annualEarning - effectiveFee,
      pctOfTotal: totalOptimized > 0 ? Math.round((annualEarning / totalOptimized) * 100) : 0,
      isWeakest: false,
    };
  }).sort((a, b) => b.annualEarning - a.annualEarning);

  // Mark weakest
  if (cardSummaries.length > 1) {
    const weakest = cardSummaries[cardSummaries.length - 1];
    if (weakest.pctOfTotal < 10) weakest.isWeakest = true;
  }

  // Generate tips
  const tips: string[] = [];
  for (const a of assignments) {
    if (a.isPortal && a.portalName) {
      tips.push(`Book ${a.categoryLabel.toLowerCase()} via ${a.portalName} on your ${a.bestCard.card.name} for ${a.bestRate}% earning`);
    }
    if (a.capped && a.runnerUp) {
      tips.push(`You're hitting the cap on ${a.bestCard.card.name} for ${a.categoryLabel}. After the cap, switch to ${a.runnerUp.card.card.name} (${a.runnerUp.rate}%)`);
    }
  }
  // Runner-up tip for close categories
  for (const a of assignments) {
    if (a.runnerUp && a.bestRate - a.runnerUp.rate < 0.5 && a.monthlySpend > 5000) {
      tips.push(`${a.categoryLabel}: ${a.bestCard.card.name} (${a.bestRate}%) barely beats ${a.runnerUp.card.card.name} (${a.runnerUp.rate}%) — either works well`);
    }
  }

  return { assignments, totalOptimized, singleBestValue, singleBestCard, randomValue, cardSummaries, tips };
}
