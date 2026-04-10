/**
 * Populate pros, cons, and verdict for all cards in feeworth-calc-data.json
 * using V3 enrichment data for intelligent generation.
 *
 * Run: npx tsx scripts/populate-pros-cons.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const FEEWORTH_PATH = path.join(ROOT, "src/data/feeworth-calc-data.json");

const feeworth: Record<string, any> = JSON.parse(fs.readFileSync(FEEWORTH_PATH, "utf-8"));

function generatePros(card: any): string[] {
  const pros: string[] = [];
  const cats = card.categories || {};
  const fee = card.annualFee || 0;
  const tier = card.tier || "";
  const baseRate = card.baseRate || 0;
  const lounge = card.lounge || {};
  const golf = card.golf || {};
  const milestones = card.milestones || [];
  const insurance = card.insurance || {};
  const memberships = card.memberships || [];
  const fuelSurcharge = card.fuelSurcharge || "";
  const forexMarkup = card.forexMarkup || "";

  // Best category rates
  const catEntries = Object.entries(cats) as [string, any][];
  const bestCat = catEntries
    .filter(([k]) => k !== "base")
    .sort((a, b) => (b[1].rate || 0) - (a[1].rate || 0));

  if (bestCat.length > 0 && bestCat[0][1].rate > 2) {
    const [catName, catData] = bestCat[0];
    const label = catName.charAt(0).toUpperCase() + catName.slice(1);
    pros.push(`${catData.rate}% rewards on ${label} spending`);
  } else if (baseRate >= 1.5) {
    pros.push(`Strong ${baseRate}% base reward rate across all categories`);
  } else if (baseRate >= 1) {
    pros.push(`Decent ${baseRate}% base reward rate`);
  }

  // Lounge access
  const loungeVisits = lounge.domesticVisits || 0;
  const intlVisits = lounge.internationalVisits || 0;
  if (loungeVisits > 0 || intlVisits > 0) {
    const parts: string[] = [];
    if (loungeVisits > 0) parts.push(`${loungeVisits} domestic`);
    if (intlVisits > 0) parts.push(`${intlVisits} international`);
    pros.push(`Airport lounge access: ${parts.join(" + ")} visits/year`);
  }

  // Free / LTF
  if (fee === 0) {
    pros.push("Lifetime free — no annual fee");
  } else if (card.feeWaivedOn) {
    pros.push(`Annual fee waived on ${card.feeWaivedOn}`);
  }

  // Low forex
  const forexNum = parseFloat(String(forexMarkup).replace("%", ""));
  if (forexNum > 0 && forexNum <= 2) {
    pros.push(`Low ${forexMarkup} forex markup for international spending`);
  } else if (forexNum > 0 && forexNum <= 1.5) {
    pros.push(`Excellent ${forexMarkup} forex markup`);
  }

  // Fuel surcharge
  if (fuelSurcharge && fuelSurcharge !== "None" && fuelSurcharge !== "0") {
    pros.push("Fuel surcharge waiver on transactions");
  }

  // Golf
  if (golf && (golf.roundsPerQuarter > 0 || golf.roundsPerYear > 0)) {
    const rounds = golf.roundsPerYear || (golf.roundsPerQuarter || 0) * 4;
    pros.push(`${rounds} complimentary golf rounds per year`);
  }

  // Milestones
  if (milestones.length > 0) {
    const bestMilestone = milestones[0];
    if (bestMilestone.benefit) {
      pros.push(`Milestone: ${bestMilestone.benefit}`);
    }
  }

  // Insurance
  if (insurance.personalAccident || insurance.airAccident) {
    const amt = insurance.personalAccident || insurance.airAccident;
    if (typeof amt === "string" && amt.includes("₹")) {
      pros.push(`Complimentary insurance cover up to ${amt}`);
    }
  }

  // Memberships
  if (memberships.length > 0) {
    const names = memberships.map((m: any) => m.name || m).filter(Boolean).slice(0, 2);
    if (names.length > 0) {
      pros.push(`Complimentary memberships: ${names.join(", ")}`);
    }
  }

  // Multiple high categories
  const highCats = catEntries.filter(([k, v]) => k !== "base" && v.rate >= 3);
  if (highCats.length >= 3) {
    pros.push(`High rewards across ${highCats.length} spending categories`);
  }

  // Rating
  if (card.rating >= 4.5) {
    pros.push("One of the highest-rated cards in its segment");
  }

  return pros.slice(0, 4); // Max 4 pros
}

function generateCons(card: any): string[] {
  const cons: string[] = [];
  const fee = card.annualFee || 0;
  const forexMarkup = card.forexMarkup || "";
  const cats = card.categories || {};
  const exclusions = card.exclusions || [];
  const lounge = card.lounge || {};
  const baseRate = card.baseRate || 0;
  const tier = card.tier || "";

  // High fee
  if (fee >= 10000) {
    cons.push(`High ₹${fee.toLocaleString("en-IN")} annual fee`);
  } else if (fee >= 2000) {
    cons.push(`₹${fee.toLocaleString("en-IN")} annual fee`);
  } else if (fee > 0) {
    cons.push(`₹${fee.toLocaleString("en-IN")} annual fee (waivable for many)`);
  }

  // High forex
  const forexNum = parseFloat(String(forexMarkup).replace("%", ""));
  if (forexNum >= 3.5) {
    cons.push(`High ${forexMarkup} forex markup on international transactions`);
  } else if (forexNum >= 2.5) {
    cons.push(`${forexMarkup} forex markup — not ideal for international use`);
  }

  // Exclusions
  if (exclusions.length > 0) {
    const excNames = exclusions.slice(0, 3).join(", ");
    cons.push(`Excludes ${excNames} from rewards`);
  }

  // Low base rate
  if (baseRate < 0.5 && tier !== "entry") {
    cons.push("Low base reward rate on non-bonus categories");
  }

  // No lounge
  if (!lounge.domesticVisits && !lounge.internationalVisits && (tier === "premium" || tier === "ultra-premium")) {
    cons.push("No airport lounge access despite premium positioning");
  }

  // Low rating
  if (card.rating && card.rating < 3.0) {
    cons.push("Below-average overall rating in its segment");
  }

  // Category-specific weaknesses
  const catEntries = Object.entries(cats) as [string, any][];
  const zeroCats = catEntries.filter(([k, v]) => k !== "base" && v.rate === 0);
  if (zeroCats.length >= 4) {
    cons.push(`No rewards on ${zeroCats.length} of 7 spending categories`);
  }

  return cons.slice(0, 3); // Max 3 cons
}

function generateVerdict(card: any): string {
  const fee = card.annualFee || 0;
  const baseRate = card.baseRate || 0;
  const rating = card.rating || 3.0;
  const tier = card.tier || "";
  const name = card.name || card.id;
  const cats = card.categories || {};
  const lounge = card.lounge || {};

  const catEntries = Object.entries(cats) as [string, any][];
  const bestCat = catEntries
    .filter(([k]) => k !== "base")
    .sort((a, b) => (b[1].rate || 0) - (a[1].rate || 0));

  const bestCatName = bestCat.length > 0 ? bestCat[0][0] : "";
  const bestCatRate = bestCat.length > 0 ? bestCat[0][1].rate : 0;

  if (tier === "ultra-premium") {
    if (rating >= 4.5) {
      return `Top-tier premium card with exceptional rewards and benefits. Best for high spenders who can maximize the ₹${(fee / 1000).toFixed(0)}K fee through ${bestCatName} spending and lounge access.`;
    }
    return `Ultra-premium card with strong perks but the ₹${(fee / 1000).toFixed(0)}K fee requires significant spend to justify. Best for those who value lifestyle benefits.`;
  }

  if (tier === "premium") {
    if (fee === 0) {
      return `Excellent value — premium features with no annual fee. Strong ${baseRate}% rewards make it a top pick for everyday spending.`;
    }
    if (rating >= 4.0) {
      return `Strong premium card rated ${rating}/5. The ₹${fee.toLocaleString("en-IN")} fee is justified by ${bestCatRate > 3 ? `${bestCatRate}% ${bestCatName} rewards` : "broad category coverage"} and solid perks.`;
    }
    return `Decent premium card but faces stiff competition. The ₹${fee.toLocaleString("en-IN")} fee needs careful evaluation against your spending patterns.`;
  }

  if (tier === "super-premium") {
    return `Super-premium offering with ${bestCatRate > 5 ? "exceptional" : "solid"} rewards. Worth it for spenders who can leverage the ${bestCatName} category and premium lifestyle benefits.`;
  }

  // Entry / mid-range
  if (fee === 0) {
    if (baseRate >= 1.5) {
      return `One of the best lifetime-free cards available — ${baseRate}% rewards with no fee makes it an easy recommendation for everyday use.`;
    }
    return `Solid no-fee option for building credit history and earning basic rewards. Good starter card.`;
  }

  if (rating >= 3.5) {
    return `Good mid-range card with ${baseRate}% base rewards. The ₹${fee.toLocaleString("en-IN")} fee is reasonable for regular ${bestCatName} spenders.`;
  }

  return `Basic card best suited for ${bestCatRate > 2 ? `${bestCatName} category spenders` : "occasional use"}. Compare with alternatives in this fee range.`;
}

// Process all cards
let updated = 0;
for (const [id, card] of Object.entries(feeworth)) {
  if (id === "_meta") continue;

  const pros = generatePros(card);
  const cons = generateCons(card);
  const verdict = generateVerdict(card);

  card.pros = pros;
  card.cons = cons;
  card.verdict = verdict;
  updated++;
}

fs.writeFileSync(FEEWORTH_PATH, JSON.stringify(feeworth, null, 2) + "\n");
console.log(`✅ Updated ${updated} cards with pros, cons, and verdict`);
