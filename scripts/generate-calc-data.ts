#!/usr/bin/env npx tsx
/**
 * generate-calc-data.ts
 *
 * Reads card-v3-data.ts and cards-v3-index.ts and GENERATES all 3 calculator JSON files:
 *   1. src/data/rewards-calc-data.json      — for the rewards calculator
 *   2. src/data/redemption-calc-data.json   — for the redemption calculator
 *   3. src/data/feeworth-calc-data.json     — for the fee-worth calculator
 *
 * Usage:  npx tsx scripts/generate-calc-data.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CARDS_V3_INDEX } from "../src/data/cards-v3-index.js";
import { cardV3Data } from "../src/data/card-v3-data.js";
import type {
  CardV3Data,
  RewardExclusion,
  RewardPortal
} from "../src/data/card-v3-types.js";
import type {
  RewardsCalcCard,
  RedemptionCalcCard,
  FeeWorthCalcCard,
  CategoryBucket,
  CategoryMap,
  RewardsCalcPortal,
  PortalMerchant,
  RedemptionOption,
  TransferPartner,
  Milestone,
  Lounge,
  LoungeProgram,
  Golf,
  Membership,
  Insurance,
} from "../src/data/calc-types.js";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_REWARDS = path.resolve(ROOT, "src", "data", "rewards-calc-data.json");
const OUT_REDEMPTION = path.resolve(ROOT, "src", "data", "redemption-calc-data.json");
const OUT_FEEWORTH = path.resolve(ROOT, "src", "data", "feeworth-calc-data.json");

const META = {
  generated: true,
  source: "scripts/generate-calc-data.ts",
  warning: "DO NOT EDIT MANUALLY — regenerate with: npm run generate:calc",
};

// ---------------------------------------------------------------------------
// Helper: Build empty CategoryMap
// ---------------------------------------------------------------------------

function buildEmptyCategoryMap(): CategoryMap {
  return {
    grocery: { rate: 0, cap: null, capPeriod: null, note: null },
    dining: { rate: 0, cap: null, capPeriod: null, note: null },
    fuel: { rate: 0, cap: null, capPeriod: null, note: null },
    online: { rate: 0, cap: null, capPeriod: null, note: null },
    travel: { rate: 0, cap: null, capPeriod: null, note: null },
    utilities: { rate: 0, cap: null, capPeriod: null, note: null },
    entertainment: { rate: 0, cap: null, capPeriod: null, note: null },
    base: { rate: 0, cap: null, capPeriod: null, note: null },
  };
}

// ---------------------------------------------------------------------------
// Helper: Extract category map from V3 data
// ---------------------------------------------------------------------------

function extractCategoryMap(v3Data: CardV3Data | undefined): CategoryMap {
  const map = buildEmptyCategoryMap();

  if (!v3Data || !v3Data.categories) {
    return map;
  }

  const keys = Object.keys(v3Data.categories) as Array<keyof typeof v3Data.categories>;
  for (const key of keys) {
    if (key in map) {
      const cat = v3Data.categories[key];
      map[key as keyof CategoryMap] = {
        rate: cat.rate,
        cap: cat.cap,
        capPeriod: cat.capPeriod,
        note: cat.note,
      };
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Helper: Extract exclusion strings
// ---------------------------------------------------------------------------

function extractExclusions(v3Data: CardV3Data | undefined): string[] {
  if (!v3Data || !v3Data.exclusions || v3Data.exclusions.length === 0) {
    return [];
  }

  return v3Data.exclusions.map((excl: RewardExclusion) => {
    if (excl.mccCodes) {
      return `${excl.category} (MCC: ${excl.mccCodes})${excl.note ? ` - ${excl.note}` : ""}`;
    }
    return excl.note || excl.category;
  });
}

// ---------------------------------------------------------------------------
// Helper: Find monthly cap across all categories
// ---------------------------------------------------------------------------

function findMonthlyCap(categories: CategoryMap): number | null {
  const capsWithMonthly = Object.values(categories)
    .filter(cat => cat.cap !== null && cat.capPeriod === "Monthly")
    .map(cat => cat.cap as number)
    .sort((a, b) => a - b);

  return capsWithMonthly.length > 0 ? capsWithMonthly[0] : null;
}

// ---------------------------------------------------------------------------
// Helper: Transform portals for rewards calculator
// ---------------------------------------------------------------------------

function transformPortals(v3Portals: RewardPortal[] | undefined): RewardsCalcPortal[] {
  if (!v3Portals || v3Portals.length === 0) {
    return [];
  }

  return v3Portals.map((portal: RewardPortal) => {
    const merchants: PortalMerchant[] = portal.merchants.map(m => ({
      name: m.name,
      category: "unknown",
      multiplier: m.multiplier,
      effectiveRate: m.effectiveRate,
      note: null,
    }));

    // Parse monthly cap from cap string like "25,000 bonus RP/month"
    let monthlyCap: number | null = null;
    if (portal.cap && portal.cap.includes("/month")) {
      const match = portal.cap.match(/(\d+(?:,\d+)*)/);
      if (match) {
        monthlyCap = parseInt(match[1].replace(/,/g, ""), 10);
      }
    }

    return {
      name: portal.name,
      url: portal.url,
      monthlyCap,
      merchants,
    };
  });
}

// ---------------------------------------------------------------------------
// Transform to RewardsCalcCard
// ---------------------------------------------------------------------------

function transformToRewardsCalc(
  indexEntry: typeof CARDS_V3_INDEX[0],
  v3Data: CardV3Data | undefined
): RewardsCalcCard {
  const categories = extractCategoryMap(v3Data);
  const exclusions = extractExclusions(v3Data);
  const portals = transformPortals(v3Data?.portals);
  const monthlyCap = findMonthlyCap(categories);

  const rewardType = v3Data?.redemption?.type || "points";
  const rewardName = v3Data?.redemption?.pointCurrency || "Reward Points";
  const pointValue = v3Data?.redemption?.baseValue || 0.25;
  const baseRateLabel = v3Data?.categories?.base?.label || `${indexEntry.baseRate}% per ₹100`;

  const portalName = portals.length > 0 ? portals[0].name : null;
  const portalTopRate =
    portals.length > 0 && portals[0].merchants.length > 0
      ? `${portals[0].merchants[0].effectiveRate}%`
      : null;

  return {
    id: indexEntry.id,
    name: indexEntry.name,
    shortName: indexEntry.shortName,
    bank: indexEntry.bank,
    image: indexEntry.image,
    tier: indexEntry.tier,
    rewardType,
    rewardName,
    baseRate: indexEntry.baseRate,
    baseRateLabel,
    pointValue,
    categories,
    exclusions,
    monthlyCap,
    portalName,
    portalTopRate,
    portals,
  };
}

// ---------------------------------------------------------------------------
// Transform to RedemptionCalcCard
// ---------------------------------------------------------------------------

function transformToRedemptionCalc(
  indexEntry: typeof CARDS_V3_INDEX[0],
  v3Data: CardV3Data | undefined
): RedemptionCalcCard {
  const pointCurrency = v3Data?.redemption?.pointCurrency || "Points";
  const rewardType = v3Data?.redemption?.type || "points";
  const baseValue = v3Data?.redemption?.baseValue || 0.25;
  const bestOption = v3Data?.redemption?.bestOption || "Statement Credit";

  // Extract expiry months and text
  let expiryMonths: number | null = null;
  let expiryText = "Check card policy";

  // Parse options into RedemptionOption
  const options: RedemptionOption[] = (v3Data?.redemption?.options || []).map(opt => ({
    type: opt.type,
    value: opt.value,
    desc: opt.processingTime,
    recommended: opt.type === bestOption,
    minPoints: opt.minPoints,
    fee: opt.fee === "None" ? null : parseFloat(opt.fee) || null,
  }));

  // Transform transfer partners
  const transferPartners: TransferPartner[] = (v3Data?.redemption?.transferPartners || []).map(tp => ({
    name: tp.name,
    ratio: tp.ratio,
    type: tp.type,
    program: "",
  }));

  return {
    id: indexEntry.id,
    name: indexEntry.name,
    image: indexEntry.image,
    bank: indexEntry.bank,
    pointCurrency,
    rewardType,
    baseValue,
    bestOption,
    expiryMonths,
    expiryText,
    options,
    transferPartners,
    restrictions: null,
  };
}

// ---------------------------------------------------------------------------
// Transform to FeeWorthCalcCard
// ---------------------------------------------------------------------------

function transformToFeeWorthCalc(
  indexEntry: typeof CARDS_V3_INDEX[0],
  v3Data: CardV3Data | undefined
): FeeWorthCalcCard {
  const categories = extractCategoryMap(v3Data);
  const exclusions = extractExclusions(v3Data);
  const portals = transformPortals(v3Data?.portals);

  const annualFee = indexEntry.feeAnnual || 0;
  const joiningFee = annualFee;
  const feeWaivedOn = v3Data?.fees?.waivedOn || null;
  const waiverText = feeWaivedOn
    ? `Annual fee waived on ₹${feeWaivedOn.toLocaleString()} spend`
    : "No waiver";

  const renewalBenefitValue = v3Data?.fees?.renewalBenefitValue || 0;
  const renewalBenefitText = renewalBenefitValue > 0
    ? `₹${renewalBenefitValue.toLocaleString()} renewal benefit`
    : "No renewal benefit";

  const rewardType = v3Data?.redemption?.type || "points";
  const pointValue = v3Data?.redemption?.baseValue || 0.25;

  // Milestones
  const milestones: Milestone[] = (v3Data?.milestones || []).map(m => ({
    spend: m.spend,
    benefit: m.benefit,
    value: m.benefitValue,
    period: "Annual",
  }));

  // Lounge access (parse from index.loungeVisits)
  let domesticVisits = "0";
  let domesticUnlimited = false;
  let intlVisits = "0";
  let intlUnlimited = false;

  if (indexEntry.loungeVisits) {
    const parts = indexEntry.loungeVisits.split(",").map(p => p.trim());
    for (const part of parts) {
      if (part.includes("Unlimited domestic")) {
        domesticUnlimited = true;
        domesticVisits = "Unlimited";
      } else if (part.includes("Unlimited intl")) {
        intlUnlimited = true;
        intlVisits = "Unlimited";
      } else if (part.includes("domestic")) {
        const match = part.match(/(\d+)/);
        if (match) {
          domesticVisits = match[1];
        }
      } else if (part.includes("intl")) {
        const match = part.match(/(\d+)/);
        if (match) {
          intlVisits = match[1];
        }
      }
    }
  }

  const loungePrograms: LoungeProgram[] = [];
  if (domesticUnlimited || intlUnlimited) {
    loungePrograms.push({
      name: "Primary Lounge Access",
      membershipTier: null,
      cardIssued: true,
      enrollmentUrl: null,
    });
  }

  const lounge: Lounge = {
    domesticVisits,
    domesticUnlimited,
    intlVisits,
    intlUnlimited,
    programs: loungePrograms,
    spendRequired: null,
  };

  const golf: Golf = {
    included: false,
    text: null,
  };

  const memberships: Membership[] = [];
  const insurance: Insurance[] = [];

  const verdict = `${indexEntry.shortName} - Rated ${indexEntry.rating}/5`;
  const pros: string[] = [];
  const cons: string[] = [];

  if (annualFee > 0) {
    cons.push(`₹${annualFee.toLocaleString()} annual fee`);
  }

  return {
    id: indexEntry.id,
    name: indexEntry.name,
    image: indexEntry.image,
    bank: indexEntry.bank,
    network: indexEntry.network,
    networkBase: indexEntry.networkBase,
    tier: indexEntry.tier,
    annualFee,
    joiningFee,
    feeWaivedOn,
    waiverText,
    renewalBenefitValue,
    renewalBenefitText,
    baseRate: indexEntry.baseRate,
    pointValue,
    rewardType,
    categories,
    exclusions,
    milestones,
    lounge,
    golf,
    memberships,
    insurance,
    fuelSurcharge: "Check card policy",
    forexMarkup: "Check card policy",
    entertainment: null,
    joiningBonus: "Check card offer",
    rating: indexEntry.rating,
    tags: indexEntry.tags,
    verdict,
    pros,
    cons,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 Starting calculator data generation...\n");
  const startTime = Date.now();

  const rewardsCards: Record<string, RewardsCalcCard> = {};
  const redemptionCards: Record<string, RedemptionCalcCard> = {};
  const feeworthCards: Record<string, FeeWorthCalcCard> = {};

  let processed = 0;
  let skipped = 0;

  for (const indexEntry of CARDS_V3_INDEX) {
    const v3Data = cardV3Data[indexEntry.id];

    if (!v3Data) {
      console.warn(`⚠️  Skipping ${indexEntry.id} - no V3 enrichment data`);
      skipped++;
      continue;
    }

    try {
      rewardsCards[indexEntry.id] = transformToRewardsCalc(indexEntry, v3Data);
      redemptionCards[indexEntry.id] = transformToRedemptionCalc(indexEntry, v3Data);
      feeworthCards[indexEntry.id] = transformToFeeWorthCalc(indexEntry, v3Data);
      processed++;
    } catch (err) {
      console.error(`❌ Error processing ${indexEntry.id}:`, err);
      skipped++;
    }
  }

  // Write JSON files with _meta header and formatted output
  const writeFile = (filePath: string, data: Record<string, unknown>, name: string) => {
    const output = { _meta: META, ...data };
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2) + "\n", "utf-8");
    console.log(`✅ Written ${name} (${Object.keys(data).length} cards)`);
  };

  writeFile(OUT_REWARDS, rewardsCards, "rewards-calc-data.json");
  writeFile(OUT_REDEMPTION, redemptionCards, "redemption-calc-data.json");
  writeFile(OUT_FEEWORTH, feeworthCards, "feeworth-calc-data.json");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processed} cards`);
  console.log(`   Skipped: ${skipped} cards`);
  console.log(`   Time: ${elapsed}s`);
  console.log(`\n✨ Done!`);
}

main().catch(err => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
