#!/usr/bin/env npx tsx
/**
 * build-v3-json.ts
 *
 * Reads 16 batch JSON files from the batches directory, enriches each card
 * with computed fields, then produces:
 *   1. public/data/cards-v3.json   — merged array of all cards
 *   2. src/data/cards-v3-index.ts  — lightweight TypeScript index for instant first render
 *
 * Usage:  npx tsx scripts/build-v3-json.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const BATCHES_DIR = path.resolve(ROOT, "..", "new data", "batches");
const OUT_JSON = path.resolve(ROOT, "public", "data", "cards-v3.json");
const OUT_TS = path.resolve(ROOT, "src", "data", "cards-v3-index.ts");
const IMAGES_DIR = path.resolve(ROOT, "public", "cards");

const BATCH_FILES = [
  "american-express.json",
  "au-bank.json",
  "axis-bank.json",
  "bob.json",
  "federal-bank.json",
  "fintechs.json",
  "hdfc-bank.json",
  "hsbc.json",
  "icici-bank.json",
  "idfc-first-bank.json",
  "indusind-bank.json",
  "kotak.json",
  "rbl-bank.json",
  "sbi-card.json",
  "standard-chartered.json",
  "yes-bank.json",
];

// ---------------------------------------------------------------------------
// Bank name variants to strip when computing shortName
// ---------------------------------------------------------------------------

const BANK_NAME_STRIP_PREFIXES = [
  // Order matters: longer/more-specific first
  "AU Small Finance Bank",
  "AU Bank",
  "IDFC FIRST Bank",
  "IDFC First",
  "Bank of Baroda",
  "Kotak Mahindra Bank",
  "Kotak Mahindra",
  "Kotak",
  "IndusInd Bank",
  "Standard Chartered",
  "Federal Bank",
  "American Express",
  "HDFC Bank",
  "Axis Bank",
  "ICICI Bank",
  "RBL Bank",
  "YES Bank",
  "Yes Bank",
  "SBI Card",
  "SBI",
  "HSBC",
  "Amex",
];

// ---------------------------------------------------------------------------
// Bank -> hex color mapping
// ---------------------------------------------------------------------------

const BANK_COLORS: Record<string, string> = {
  "HDFC Bank": "#004B8D",
  "Axis Bank": "#6B2FA0",
  "ICICI Bank": "#F37920",
  "SBI Card": "#1A5276",
  "State Bank of India": "#1A5276",
  "Kotak Mahindra Bank": "#ED1C24",
  "IndusInd Bank": "#7B2D8E",
  "IDFC FIRST Bank": "#9C1D26",
  "AU Small Finance Bank": "#EC6608",
  "Bank of Baroda": "#F26522",
  "Federal Bank": "#003DA5",
  "Standard Chartered": "#0072AA",
  "RBL Bank": "#21409A",
  "YES Bank": "#0050AF",
  "HSBC": "#DB0011",
  "American Express": "#006FCF",
  // Fintechs / multi-bank issuers
  "CSB/SBM/Indian Bank": "#4A4A4A",
  "CSB Bank": "#4A4A4A",
  "SBM Bank": "#4A4A4A",
  "Indian Bank": "#1C458A",
  "Yes Bank/Others": "#0050AF",
};

const DEFAULT_COLOR = "#6B7280";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fix image path: replace /images/cards/ or /assets/cards/ with /cards/ */
function fixImagePath(img: string | undefined | null): string {
  if (!img) return "";
  return img
    .replace(/^\/images\/cards\//, "/cards/")
    .replace(/^\/assets\/cards\//, "/cards/");
}

/** Check whether an image file exists on disk */
function imageExists(imagePath: string): boolean {
  if (!imagePath) return false;
  const filename = path.basename(imagePath);
  return fs.existsSync(path.join(IMAGES_DIR, filename));
}

/**
 * Compute shortName by stripping bank prefix and trailing "Credit Card" / "Card".
 */
function computeShortName(name: string): string {
  let short = name.trim();

  // Strip bank prefix
  for (const prefix of BANK_NAME_STRIP_PREFIXES) {
    if (short.toLowerCase().startsWith(prefix.toLowerCase())) {
      short = short.slice(prefix.length).trim();
      break;
    }
  }

  // Strip trailing "Credit Card" or "Card"
  short = short.replace(/\s+Credit\s+Card$/i, "").trim();
  short = short.replace(/\s+Card$/i, "").trim();

  // If we stripped everything (e.g. "OneCard Credit Card" -> ""), use original logic
  if (!short) {
    // Try the original name minus just "Credit Card" / "Card"
    short = name.replace(/\s+Credit\s+Card$/i, "").replace(/\s+Card$/i, "").trim();
  }

  return short;
}

/** Extract base network from network string */
function computeNetworkBase(network: string | undefined | null): string {
  if (!network) return "Unknown";
  const n = network.trim();

  if (/^Diners\s+Club/i.test(n)) return "Diners Club";
  if (/^American\s+Express/i.test(n)) return "Amex";
  if (/^Visa/i.test(n)) return "Visa";
  if (/^Mastercard/i.test(n)) return "Mastercard";
  if (/^RuPay/i.test(n)) return "RuPay";

  // Handle compound like "Visa/Mastercard"
  if (n.includes("/")) {
    return n; // keep as-is for dual-network cards
  }

  // Fallback: first word
  return n.split(/\s+/)[0] || "Unknown";
}

/** Kebab-case a bank name: "HDFC Bank" -> "hdfc-bank" */
function computeBankId(bank: string): string {
  return bank
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Compute effective annual cost */
function computeEffectiveAnnualCost(fees: any): number {
  const annual = fees?.annual ?? 0;
  const renewalBenefitValue = fees?.renewalBenefitValue ?? 0;
  return annual - renewalBenefitValue;
}

/** Format income number into label */
function computeIncomeLabel(income: number | undefined | null): string {
  if (income == null || income === 0) return "";

  if (income < 100000) {
    const k = Math.round(income / 1000);
    return `₹${k}K+/year`;
  }

  if (income < 10000000) {
    // Lakhs range
    const lakhs = income / 100000;
    // Use integer if whole, else 1 decimal
    const label = lakhs === Math.floor(lakhs) ? String(lakhs) : lakhs.toFixed(1);
    return `₹${label}L+/year`;
  }

  // Crore range
  const cr = income / 10000000;
  const label = cr === Math.floor(cr) ? String(cr) : cr.toFixed(1);
  return `₹${label}Cr+/year`;
}

/** Split bestFor string into tags array */
function computeBestForTags(bestFor: string | string[] | undefined | null): string[] {
  if (!bestFor) return [];
  if (Array.isArray(bestFor)) return bestFor.map((t) => t.trim()).filter(Boolean);

  // Split by common delimiters: comma, +, &
  return bestFor
    .split(/[,+&]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Normalize rate: if < 1, it's a decimal fraction (0.033 = 3.3%).
 * Convert to percentage number.
 */
function normalizeRate(rate: number | undefined | null): number {
  if (rate == null) return 0;
  if (rate < 1) return +(rate * 100).toFixed(4);
  return rate;
}

/**
 * Normalize all rates inside calculator.categories (object of category objects).
 * Mutates in place.
 */
function normalizeCalculatorCategories(categories: any): void {
  if (!categories || typeof categories !== "object") return;

  for (const key of Object.keys(categories)) {
    const cat = categories[key];
    if (cat && typeof cat === "object" && typeof cat.rate === "number") {
      cat.rate = normalizeRate(cat.rate);
    }
  }
}

/**
 * Normalize all effectiveRate values inside portals[*].merchants[*].
 * Mutates in place.
 */
function normalizePortalRates(portals: any[] | undefined | null): void {
  if (!Array.isArray(portals)) return;

  for (const portal of portals) {
    if (!Array.isArray(portal?.merchants)) continue;
    for (const merchant of portal.merchants) {
      if (merchant && typeof merchant.effectiveRate === "number") {
        merchant.effectiveRate = normalizeRate(merchant.effectiveRate);
      }
    }
  }
}

/** Summarize lounge visits as a single human string */
function summarizeLoungeVisits(features: any): string {
  const lounge = features?.lounge;
  if (!lounge) return "None";

  const dom = lounge.domestic;
  const intl = lounge.international;

  const domVisits = typeof dom === "object" ? dom?.visits : null;
  const intlVisits = typeof intl === "object" ? intl?.visits : null;

  const parts: string[] = [];

  if (domVisits && domVisits !== "None" && domVisits !== "0") {
    parts.push(`${domVisits} domestic`);
  }
  if (intlVisits && intlVisits !== "None" && intlVisits !== "0") {
    parts.push(`${intlVisits} intl`);
  }

  return parts.length > 0 ? parts.join(", ") : "None";
}

/** Get bank color from mapping */
function getBankColor(bank: string): string {
  return BANK_COLORS[bank] ?? DEFAULT_COLOR;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("build-v3-json: reading batch files...\n");

  const allCards: any[] = [];
  const cardsPerBank: Record<string, number> = {};
  let missingImages = 0;
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  for (const filename of BATCH_FILES) {
    const filepath = path.join(BATCHES_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`  WARNING: batch file not found: ${filename}`);
      continue;
    }

    const raw = fs.readFileSync(filepath, "utf-8");
    let cards: any[];
    try {
      cards = JSON.parse(raw);
    } catch (err) {
      console.error(`  ERROR: failed to parse ${filename}: ${err}`);
      continue;
    }

    if (!Array.isArray(cards)) {
      console.warn(`  WARNING: ${filename} is not an array, skipping.`);
      continue;
    }

    console.log(`  ${filename}: ${cards.length} cards`);

    for (const card of cards) {
      // Track duplicates
      if (seenIds.has(card.id)) {
        duplicateIds.push(card.id);
      }
      seenIds.add(card.id);

      // --- Computed fields ---

      // 1. Fix image path
      card.image = fixImagePath(card.image);

      // Track missing images
      if (!imageExists(card.image)) {
        missingImages++;
      }

      // 2. shortName
      card.shortName = computeShortName(card.name);

      // 3. networkBase
      card.networkBase = computeNetworkBase(card.network);

      // 4. bankId
      if (!card.bankId) {
        card.bankId = computeBankId(card.bank);
      }

      // 5. effectiveAnnualCost
      if (card.fees) {
        card.fees.effectiveAnnualCost = computeEffectiveAnnualCost(card.fees);
      }

      // 6. incomeLabel
      if (card.eligibility) {
        card.eligibility.incomeLabel =
          card.eligibility.incomeLabel || computeIncomeLabel(card.eligibility.income);
      }

      // 7. bestForTags
      if (card.metadata) {
        card.metadata.bestForTags = computeBestForTags(card.metadata.bestFor);
      }

      // 8. Normalize rates
      if (card.rewards) {
        card.rewards.baseRate = normalizeRate(card.rewards.baseRate);

        const calc = card.rewards.calculator;
        if (calc) {
          normalizeCalculatorCategories(calc.categories);
          normalizePortalRates(calc.portals);
        }
      }

      // Count per bank
      const bank = card.bank || "Unknown";
      cardsPerBank[bank] = (cardsPerBank[bank] || 0) + 1;

      allCards.push(card);
    }
  }

  // --- 9. Sort: by bank name asc, then fees.annual desc ---
  allCards.sort((a, b) => {
    const bankCmp = (a.bank || "").localeCompare(b.bank || "");
    if (bankCmp !== 0) return bankCmp;
    const aFee = a.fees?.annual ?? 0;
    const bFee = b.fees?.annual ?? 0;
    return bFee - aFee; // descending
  });

  // --- Write cards-v3.json ---
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(allCards, null, 2), "utf-8");
  console.log(`\nWrote ${OUT_JSON}`);

  // --- Generate cards-v3-index.ts ---
  const indexEntries = allCards.map((card) => ({
    id: card.id ?? "",
    slug: card.slug ?? card.id ?? "",
    name: card.name ?? "",
    shortName: card.shortName ?? "",
    bank: card.bank ?? "",
    bankId: card.bankId ?? "",
    network: card.network ?? "",
    networkBase: card.networkBase ?? "",
    image: card.image ?? "",
    tier: card.rewards?.calculator?.tier ?? card.tier ?? "standard",
    rating: card.metadata?.rating ?? 0,
    feeAnnual: card.fees?.annual ?? 0,
    baseRate: card.rewards?.baseRate ?? 0,
    loungeVisits: summarizeLoungeVisits(card.features),
    tags: card.metadata?.tags ?? [],
    color: getBankColor(card.bank ?? ""),
  }));

  const tsContent = `// Auto-generated by scripts/build-v3-json.ts — DO NOT EDIT
// Generated: ${new Date().toISOString()}
// Total cards: ${indexEntries.length}

export interface CardV3IndexEntry {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  bank: string;
  bankId: string;
  network: string;
  networkBase: string;
  image: string;
  tier: string;
  rating: number;
  feeAnnual: number;
  baseRate: number;
  loungeVisits: string;
  tags: string[];
  color: string;
}

export const CARDS_V3_INDEX: CardV3IndexEntry[] = ${JSON.stringify(indexEntries, null, 2)} as const;

export default CARDS_V3_INDEX;
`;

  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
  fs.writeFileSync(OUT_TS, tsContent, "utf-8");
  console.log(`Wrote ${OUT_TS}`);

  // --- Summary ---
  console.log("\n=== BUILD SUMMARY ===");
  console.log(`Total cards: ${allCards.length}`);
  console.log(`\nCards per bank:`);
  const sortedBanks = Object.entries(cardsPerBank).sort((a, b) => b[1] - a[1]);
  for (const [bank, count] of sortedBanks) {
    console.log(`  ${bank}: ${count}`);
  }
  console.log(`\nMissing images: ${missingImages}`);
  if (duplicateIds.length > 0) {
    console.log(`\nDUPLICATE IDs (${duplicateIds.length}):`);
    for (const id of duplicateIds) {
      console.log(`  - ${id}`);
    }
  } else {
    console.log(`Duplicate IDs: none`);
  }
  console.log("\nDone.");
}

main();
