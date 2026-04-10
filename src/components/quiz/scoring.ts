import { cards, type CreditCard as CardType } from "@/data/cards";
import { CARD_V3_MASTER } from "@/data/card-v3-master";
import type { Answers } from "./quizData";
import {
  QUIZ_SCORING_POINTS,
  QUIZ_RESULT_NORMALIZATION,
  RESULTS_CONFIG,
} from "@/data/card-recommendations";

/* ── V3 category key for each quiz spend answer ─────────────────────── */
const SPEND_TO_V3_KEY: Record<string, string> = {
  shopping: "online",
  dining: "dining",
  travel: "travel",
  fuel: "fuel",
  online: "online",
};

/* ── Weighted score distribution (must sum to maxScore) ─────────────── */
const W_CATEGORY = 40;
const W_FEE = 15;
const W_TIER = 5; // spend_amount → tier alignment (part of fee block)
const W_PERK = 20;
const W_BANK = 10;
const W_RATING = 10;

/* ── Tier alignment for spend_amount quiz answer ────────────────────── */
const TIER_FIT: Record<string, string[]> = {
  low: ["entry", "co-branded", "mid"],
  mid: ["mid", "premium"],
  high: ["premium", "super-premium"],
  ultra: ["super-premium", "ultra-premium"],
};

/* ── Pre-compute max category rates + max baseRate across all cards ── */
const maxCategoryRates: Record<string, number> = {};
let maxBaseRate = 1;

for (const master of Object.values(CARD_V3_MASTER)) {
  if (master.baseRate > maxBaseRate) maxBaseRate = master.baseRate;
  for (const [key, cat] of Object.entries(master.enrichment.categories)) {
    if (!maxCategoryRates[key] || cat.rate > maxCategoryRates[key]) {
      maxCategoryRates[key] = cat.rate;
    }
  }
}

/* ── Score a single card against user answers ────────────────────────── */
function scoreCard(card: CardType, answers: Answers): number {
  const master = CARD_V3_MASTER[card.id];
  if (!master) return 0;

  const enr = master.enrichment;
  let score = 0;

  // 1. Category rate match (40 pts) — continuous based on actual V3 rate
  if (answers.spend) {
    const v3Key = SPEND_TO_V3_KEY[answers.spend] ?? "base";
    const catRate = enr.categories[v3Key]?.rate ?? enr.categories.base?.rate ?? 0;
    const maxRate = maxCategoryRates[v3Key] || 1;
    score += (catRate / maxRate) * W_CATEGORY;
  }

  // 2a. Fee range fit (15 pts) — binary bracket match
  const fee = master.feeAnnual;
  if (answers.fee) {
    const feeMatch =
      (answers.fee === "0-500" && fee <= 500) ||
      (answers.fee === "500-2000" && fee > 500 && fee <= 2000) ||
      (answers.fee === "2000-5000" && fee > 2000 && fee <= 5000) ||
      (answers.fee === "5000+" && fee > 5000);
    if (feeMatch) score += W_FEE;
  }

  // 2b. Tier alignment from spend_amount (5 pts)
  if (answers.spend_amount) {
    const fitTiers = TIER_FIT[answers.spend_amount] ?? [];
    if (fitTiers.includes(master.tier)) score += W_TIER;
  }

  // 3. Perk alignment (20 pts) — structured V3 checks
  if (answers.perk) {
    if (answers.perk === "cashback") {
      if (enr.redemption.type === "cashback") score += W_PERK;
    } else if (answers.perk === "lounge") {
      if (master.loungeVisits && master.loungeVisits !== "None" && master.loungeVisits !== "0") {
        score += W_PERK;
      }
    } else if (answers.perk === "rewards") {
      score += Math.min(1, master.baseRate / maxBaseRate) * W_PERK;
    } else if (answers.perk === "travel") {
      const travelRate = enr.categories.travel?.rate ?? 0;
      const maxTravel = maxCategoryRates.travel || 1;
      score += (travelRate / maxTravel) * W_PERK;
    }
  }

  // 4. Bank preference (10 pts) — exact bankId match
  if (answers.bank === "any") {
    score += W_BANK;
  } else if (answers.bank && master.bankId === answers.bank) {
    score += W_BANK;
  }

  // 5. Card rating bonus (10 pts) — continuous from V3 rating
  score += (master.rating / 5) * W_RATING;

  return Math.min(Math.round(score), QUIZ_SCORING_POINTS.maxScore);
}

/* ── Public API (unchanged signatures) ──────────────────────────────── */

export function getResults(answers: Answers) {
  return cards
    .map((card) => ({ card, score: scoreCard(card, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_CONFIG.maxQuizResults)
    .map(({ card, score }) => ({
      card,
      rawScore: score,
    }));
}

export function normalizeResults(results: ReturnType<typeof getResults>) {
  const max = results[0]?.rawScore || 1;
  return results.map((r, i) => ({
    ...r,
    matchPct: i === 0 ? QUIZ_RESULT_NORMALIZATION.topCardMatchPercent : Math.round(QUIZ_RESULT_NORMALIZATION.topCardMatchPercent * (r.rawScore / max)),
  }));
}
