// Transform utilities for CardPerks V3 data
// Computes Key Perks and maps V3 -> legacy CreditCard interface

import type { CardV3, LoungeAccessDetailV3, SpecialOfferV3 } from "./card-v3-unified-types";
import type { CreditCard } from "./cards";
import type { CardV3Data, CategoryRate, RewardExclusion, SpecialOffer } from "./card-v3-types";
import { formatCur } from "@/lib/fee-utils";
import { formatBaseRate, formatLoungeVisits, formatForex, formatIncome, formatTier } from "./card-v3-format";
import { calculateCardRatingV3 } from "./card-v3-rating";

// ---------------------------------------------------------------------------
// Key Perks Algorithm — always returns exactly `count` perks
// ---------------------------------------------------------------------------

export function computeKeyPerks(card: CardV3, count = 4): string[] {
  const perks: string[] = [];
  const tier = card.rewards.calculator.tier?.toLowerCase() ?? "";
  const isPremium = ["premium", "super-premium", "ultra-premium"].includes(tier);

  if (isPremium) {
    // 1. Best portal multiplier
    const bestMerchant = getBestPortalMerchant(card);
    if (bestMerchant) {
      perks.push(`${bestMerchant.multiplier} on ${bestMerchant.portal} (${bestMerchant.name})`);
    }

    // 2. Domestic lounge
    const loungeStr = getDomesticLoungeText(card);
    if (loungeStr && loungeStr !== "None") {
      perks.push(`${loungeStr} domestic lounge`);
    }

    // 3. Dining perk
    const diningPerk = getDiningPerk(card);
    if (diningPerk) perks.push(diningPerk);

    // 4. Golf / concierge / entertainment
    if (card.features.golf && typeof card.features.golf === "object" && card.features.golf.included) {
      perks.push(card.features.golf.text || "Golf access at premium courses");
    } else if (card.features.concierge === true || (typeof card.features.concierge === "object" && card.features.concierge.included)) {
      perks.push("24/7 Concierge service");
    } else if (card.features.entertainment) {
      perks.push("Entertainment benefits");
    } else if (card.features.memberships) {
      const membership = typeof card.features.memberships === "string"
        ? card.features.memberships
        : Array.isArray(card.features.memberships) && card.features.memberships.length > 0
          ? card.features.memberships[0].name
          : null;
      if (membership) perks.push(membership);
    }
  } else {
    // Basic/entry track
    // 1. Base reward rate
    const rate = card.rewards.baseRate;
    const rateNorm = rate < 1 ? rate * 100 : rate;
    const typeLabel = card.rewards.type === "cashback" ? "cashback" : "value";
    perks.push(`${rateNorm.toFixed(1)}% ${typeLabel} on all spends`);

    // 2. Fuel surcharge waiver
    const fuel = card.features.fuel;
    if (fuel) {
      const waiverText = fuel.surchargeWaiverText || (typeof fuel.surchargeWaiver === "string" ? fuel.surchargeWaiver : `${(typeof fuel.surchargeWaiver === "number" ? fuel.surchargeWaiver * 100 : 1)}%`);
      perks.push(`${waiverText} fuel surcharge waiver`);
    }

    // 3. Welcome bonus
    if (card.rewards.joiningBonus && card.rewards.joiningBonus !== "None" && card.rewards.joiningBonus !== "N/A") {
      perks.push(`Welcome: ${card.rewards.joiningBonus}`);
    }

    // 4. EMI / membership
    if (card.features.emi?.available) {
      perks.push("No-cost EMI on partners");
    } else if (card.features.memberships) {
      const membership = typeof card.features.memberships === "string"
        ? card.features.memberships
        : Array.isArray(card.features.memberships) && card.features.memberships.length > 0
          ? card.features.memberships[0].name
          : null;
      if (membership) perks.push(membership);
    }
  }

  // Fill remaining slots from pros if needed
  if (perks.length < count && card.metadata.pros) {
    for (const pro of card.metadata.pros) {
      if (perks.length >= count) break;
      if (!perks.includes(pro)) perks.push(pro);
    }
  }

  // Absolute fallback
  while (perks.length < count) {
    perks.push("See full details");
  }

  return perks.slice(0, count);
}

function getBestPortalMerchant(card: CardV3): { portal: string; name: string; multiplier: string; rate: number } | null {
  let best: { portal: string; name: string; multiplier: string; rate: number } | null = null;
  const portals = card.rewards.calculator.portals;
  if (!portals) return null;

  for (const portal of portals) {
    for (const merchant of portal.merchants) {
      const rate = merchant.effectiveRate < 1 ? merchant.effectiveRate * 100 : merchant.effectiveRate;
      if (!best || rate > best.rate) {
        best = { portal: portal.name, name: merchant.name, multiplier: merchant.multiplier, rate };
      }
    }
  }
  return best;
}

function getDomesticLoungeText(card: CardV3): string {
  const dom = card.features.lounge?.domestic;
  if (!dom) return "None";
  if (typeof dom === "string") return dom;
  return formatLoungeVisits(dom);
}

function getDiningPerk(card: CardV3): string | null {
  const dining = card.features.dining;
  if (!dining) return null;
  if (dining.culinaryTreats && dining.culinaryTreatsText) return dining.culinaryTreatsText;
  if (dining.culinaryTreats) return "Culinary Treats dining privileges";
  if (dining.acceleratedDining && dining.acceleratedDiningText) return dining.acceleratedDiningText;
  if (dining.acceleratedDining) return "Accelerated dining rewards";
  return null;
}

// ---------------------------------------------------------------------------
// Top portal merchants — returns top N merchants sorted by effectiveRate
// ---------------------------------------------------------------------------

export function getTopPortalMerchants(card: CardV3, count = 3): { portal: string; name: string; multiplier: string; rate: number; rateLabel: string }[] {
  const all: { portal: string; name: string; multiplier: string; rate: number; rateLabel: string }[] = [];
  const portals = card.rewards.calculator.portals;
  if (!portals) return [];

  for (const portal of portals) {
    for (const m of portal.merchants) {
      const rate = m.effectiveRate < 1 ? m.effectiveRate * 100 : m.effectiveRate;
      all.push({
        portal: portal.name,
        name: m.name,
        multiplier: m.multiplier,
        rate,
        rateLabel: m.effectiveRateLabel || `${rate.toFixed(1)}%`,
      });
    }
  }

  return all.sort((a, b) => b.rate - a.rate).slice(0, count);
}

// ---------------------------------------------------------------------------
// V3 -> Legacy CreditCard mapper (backward compat)
// ---------------------------------------------------------------------------

export function v3ToLegacyCard(card: CardV3): CreditCard {
  const baseRate = card.rewards.baseRate < 1 ? card.rewards.baseRate * 100 : card.rewards.baseRate;
  const domesticLounge = formatLoungeVisits(card.features.lounge?.domestic);

  // Build voucher list from portal merchants
  const vouchers: string[] = [];
  const portals = card.rewards.calculator.portals;
  if (portals) {
    for (const portal of portals) {
      for (const m of portal.merchants) {
        const rate = m.effectiveRate < 1 ? m.effectiveRate * 100 : m.effectiveRate;
        vouchers.push(`${m.name} ${rate.toFixed(0)}%`);
        if (vouchers.length >= 3) break;
      }
      if (vouchers.length >= 3) break;
    }
  }

  // Build perks from Key Perks algorithm
  const perks = computeKeyPerks(card, 4);

  // Insurance as string array
  const insurance: string[] = [];
  if (Array.isArray(card.features.insurance)) {
    for (const ins of card.features.insurance) {
      if ("type" in ins && "cover" in ins) {
        insurance.push(`${ins.type} ${ins.cover}`);
      }
    }
  }

  // Milestones as string array
  const milestones: string[] = card.features.milestones?.map(
    (m) => `₹${m.spend ? formatCur(m.spend).replace("₹", "") : "N/A"} spend = ${m.benefit}`
  ) ?? [];

  const forexMarkup = formatForex(card.features.forex);
  const fuelWaiver = card.features.fuel?.surchargeWaiverText
    || (typeof card.features.fuel?.surchargeWaiver === "string" ? card.features.fuel.surchargeWaiver : "N/A");

  return {
    id: card.id,
    name: card.name,
    network: card.networkBase || card.network,
    fee: card.fees.annual === 0 ? "₹0" : formatCur(card.fees.annual),
    rating: calculateCardRatingV3(card),
    rewards: `${baseRate.toFixed(1)}% value`,
    lounge: domesticLounge,
    vouchers,
    color: "#0D0D0D",
    image: card.image,
    perks,
    issuer: card.bank,
    type: formatTier(card.rewards.calculator.tier),
    minIncome: formatIncome(card.eligibility?.income),
    welcomeBonus: card.rewards.joiningBonus || "N/A",
    fuelSurcharge: fuelWaiver,
    forexMarkup,
    rewardRate: card.rewards.baseRateLabel || card.rewards.earningText || `${baseRate.toFixed(1)}%`,
    milestones,
    insurance,
    bestFor: card.metadata.bestForTags || card.metadata.tags || [],
  };
}

// ---------------------------------------------------------------------------
// CardV3 → CardV3Data adapter
// Converts the full unified V3 card (from JSON) to the enrichment type
// used by existing detail-page sections (CategoryRewards, Portal, etc.)
// ---------------------------------------------------------------------------

const CAP_PERIOD_MAP: Record<string, CategoryRate["capPeriod"]> = {
  month: "Monthly", monthly: "Monthly",
  quarter: "Quarterly", quarterly: "Quarterly",
  annual: "Annual", year: "Annual",
  "per transaction": "Per Txn", "per txn": "Per Txn",
};

export function cardV3ToV3Data(card: CardV3): CardV3Data {
  // Map category rates — normalize rate range and capPeriod
  const categories: Record<string, CategoryRate> = {};
  for (const [key, cat] of Object.entries(card.rewards.calculator.categories || {})) {
    const rate = cat.rate < 1 ? cat.rate * 100 : cat.rate;
    categories[key] = {
      label: cat.label,
      rate,
      cap: cat.cap ?? null,
      capPeriod: cat.capPeriod ? (CAP_PERIOD_MAP[cat.capPeriod.toLowerCase()] ?? null) : null,
      minTxn: null,
      note: cat.note ?? null,
    };
  }

  // Map exclusions
  const calcExclusions = card.rewards.calculator.exclusions;
  const exclusions: RewardExclusion[] = Array.isArray(calcExclusions)
    ? calcExclusions.map((e) =>
        typeof e === "string" ? { category: e, note: e } : { category: (e as any).category || "", mccCodes: ((e as any).mccs || []).join(", "), note: (e as any).note || "" }
      )
    : [];

  // Map portals
  const portals = (card.rewards.calculator.portals || []).map((p) => ({
    name: p.name,
    url: p.url || "",
    merchants: (p.merchants || []).map((m) => ({
      name: m.name,
      multiplier: m.multiplier,
      effectiveRate: m.effectiveRate < 1 ? m.effectiveRate * 100 : m.effectiveRate,
    })),
    cap: p.cap || (p.monthlyCap ? `${p.monthlyCap.toLocaleString("en-IN")} RP/month` : null),
    pointValueLabel: p.pointValueLabel || "",
    note: p.note || null,
  }));

  // Map redemption
  const redemption = card.rewards.redemption;
  const transferPartners = (redemption.transferPartners || []).map((tp) => ({
    name: tp.name,
    type: (tp.type === "airline" || tp.type === "hotel" ? tp.type : "airline") as "airline" | "hotel",
    ratio: tp.ratio || "1:1",
    ratioNumeric: tp.ratioNumeric || 1,
    minPoints: tp.minTransfer || tp.minPoints || 0,
    transferTime: tp.transferTime || "",
    fee: tp.fee || "None",
  }));

  // Map milestones
  const milestones = (card.features.milestones || []).map((m) => ({
    spend: m.spend || 0,
    benefit: m.benefit || "",
    benefitValue: m.benefitValue || 0,
  }));

  // Map special offers (startDate/endDate → validFrom/validTo)
  const specialOffers: SpecialOffer[] = (card.specialOffers || []).map((o) => ({
    title: o.title,
    description: o.description,
    category: o.category || "",
    validFrom: o.startDate || "",
    validTo: o.endDate || "",
  }));

  return {
    categories,
    exclusions,
    portals,
    redemption: {
      type: card.rewards.type === "miles" ? "points" : card.rewards.type,
      pointCurrency: card.rewards.pointCurrency || card.rewards.pointName || card.rewards.name || "Points",
      baseValue: redemption.baseValue || 0,
      bestOption: redemption.bestOption || "",
      options: (redemption.options || []).map((o) => ({
        type: o.type,
        value: typeof o.value === "number" ? o.value : 0,
        processingTime: o.processingTime || "",
        fee: o.fee || "None",
        minPoints: o.minPoints ?? null,
      })),
      transferPartners,
    },
    fees: {
      annual: card.fees.annual,
      renewal: card.fees.annual,
      waivedOn: card.fees.waivedOn ?? null,
      renewalBenefitValue: card.fees.renewalBenefitValue || 0,
    },
    milestones,
    baseRate: card.rewards.baseRate < 1 ? card.rewards.baseRate * 100 : card.rewards.baseRate,
    upgradePath: [],
    upgradeFromId: card.upgradeFromId ?? null,
    upgradeToId: card.upgradeToId ?? null,
    applyLink: card.applyLink ?? card.link ?? null,
    specialOffers,
    relatedCardIds: card.relatedCardIds || [],
  };
}
