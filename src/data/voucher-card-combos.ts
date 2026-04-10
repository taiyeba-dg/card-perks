// Voucher + Card combo scoring engine
// Maps voucher portals to the new accelerated-portals + eligibility system

import { CARD_V3_MASTER } from "@/data/card-v3-master";
import { cards, type CreditCard } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";
import { acceleratedPortals } from "@/data/accelerated-portals";
import { getCardPortals } from "@/data/card-portal-eligibility";

export interface PortalCombo {
  portal: string;
  voucherRate: number;        // voucher discount %
  card: CreditCard;
  v3: CardV3Data;
  cardEarningRate: number;    // card earning % on this portal
  cardRedemptionValue: number;
  effectiveCardRate: number;  // earning × redemption
  totalValue: number;         // voucherRate + effectiveCardRate
  multiplierLabel: string;    // e.g. "10X"
}

export interface VoucherComboResult {
  voucherId: string;
  voucherName: string;
  bestCombo: PortalCombo | null;
  allCombos: PortalCombo[];
}

// Map voucher platform names to portal IDs in accelerated-portals.ts
const PLATFORM_TO_PORTAL: Record<string, string[]> = {
  "HDFC SmartBuy": ["hdfc-smartbuy"],
  "Gyftr": ["hdfc-smartbuy"],           // SmartBuy vouchers are via Gyftr
  "Axis Edge Rewards": ["axis-edge-rewards"],
  "Axis EDGE Rewards": ["axis-edge-rewards"],
  "ICICI Rewards": ["icici-ishop"],
  "ICICI Pockets": ["icici-ishop"],
  "iShop": ["icici-ishop"],
  "SBI Rewardz": ["sbi-rewardz"],
  "SBI YONO": ["sbi-rewardz"],
  "Kotak Rewards": ["kotak-unbox"],
  "HSBC Travel": ["hsbc-travel-with-points"],
  "IndusInd Travel": ["indusind-travel-and-shop"],
  "IDFC Travel": ["idfc-travel-and-shop"],
  "Travel & Shop": ["indusind-travel-and-shop", "idfc-travel-and-shop"],
  "YES Rewardz": ["yes-rewardz"],
  "SC 360 Rewards": ["sc-360-rewards"],
  "Scapia": ["scapia-travel"],
  "Maximize": [],
  "Magnify": [],
  "MagicPin": [],
  "SaveSage": [],
};

// Map voucher categories to V3 category keys for base-rate lookup
const VOUCHER_TO_V3_CAT: Record<string, string> = {
  "Shopping": "online",
  "Food & Dining": "dining",
  "Travel": "travel",
  "Groceries": "grocery",
  "Fuel": "fuel",
  "Entertainment": "entertainment",
  "Fitness": "base",
  "Education": "base",
  "Electronics": "online",
};

function parseVoucherRate(savings: string): number {
  const match = savings.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * For a given voucher, compute the best card + portal combo for each platform.
 * Now uses the centralized portal + eligibility system.
 */
export function computeVoucherCombos(
  voucherId: string,
  voucherName: string,
  voucherCategory: string,
  platformRates: { platform: string; savings: string; live: boolean }[]
): VoucherComboResult {
  const allCombos: PortalCombo[] = [];
  const v3CatKey = VOUCHER_TO_V3_CAT[voucherCategory] || "base";

  for (const pr of platformRates) {
    if (!pr.live) continue;
    const voucherRate = parseVoucherRate(pr.savings);

    // Get portal IDs for this voucher platform
    const portalIds = PLATFORM_TO_PORTAL[pr.platform] || [];

    for (const card of cards) {
      const v3 = CARD_V3_MASTER[card.id]?.enrichment;
      if (!v3) continue;

      let bestCardRate = 0;
      let multiplierLabel = "";

      // Check new portal system: does this card have access to any matching portal?
      const cardPortals = getCardPortals(card.id);

      for (const portalId of portalIds) {
        const resolved = cardPortals.find((cp) => cp.portal.id === portalId);
        if (resolved) {
          // Find best merchant rate from resolved (override-applied) merchants
          for (const merchant of resolved.merchants) {
            if (merchant.effectiveRate > bestCardRate) {
              bestCardRate = merchant.effectiveRate;
              multiplierLabel = merchant.multiplier;
            }
          }
        }
      }

      // Fallback: check legacy embedded portal data on v3 (for cards not yet migrated)
      if (bestCardRate === 0 && v3.portals.length > 0) {
        for (const portalId of portalIds) {
          const portalDef = acceleratedPortals[portalId];
          const legacyPortalName = portalDef?.name;
          if (legacyPortalName) {
            const legacyPortal = v3.portals.find((p) => p.name === legacyPortalName);
            if (legacyPortal) {
              for (const merchant of legacyPortal.merchants) {
                if (merchant.effectiveRate > bestCardRate) {
                  bestCardRate = merchant.effectiveRate;
                  multiplierLabel = merchant.multiplier || "";
                }
              }
            }
          }
        }
      }

      // If no portal match at all, use base category rate
      if (bestCardRate === 0) {
        const catRate = v3.categories[v3CatKey] || v3.categories["base"];
        if (catRate) {
          bestCardRate = catRate.rate;
          multiplierLabel = catRate.label.split(" ")[0] + "X"; // rough label
        }
      }

      const redemptionValue = v3.redemption.baseValue;
      const effectiveCardRate = bestCardRate * redemptionValue;
      const totalValue = voucherRate + effectiveCardRate;

      allCombos.push({
        portal: pr.platform,
        voucherRate,
        card,
        v3,
        cardEarningRate: bestCardRate,
        cardRedemptionValue: redemptionValue,
        effectiveCardRate,
        totalValue,
        multiplierLabel,
      });
    }
  }

  // Sort by totalValue desc
  allCombos.sort((a, b) => b.totalValue - a.totalValue);

  // Deduplicate: keep best combo per portal
  const bestPerPortal = new Map<string, PortalCombo>();
  for (const combo of allCombos) {
    if (!bestPerPortal.has(combo.portal)) {
      bestPerPortal.set(combo.portal, combo);
    }
  }

  return {
    voucherId,
    voucherName,
    bestCombo: allCombos[0] || null,
    allCombos: Array.from(bestPerPortal.values()),
  };
}

/**
 * Get top N combos across ALL vouchers — for the "Best Combos" leaderboard
 */
export function getTopCombos(
  voucherList: { id: string; name: string; category: string; platformRates: { platform: string; savings: string; live: boolean }[] }[],
  limit = 5
): (PortalCombo & { voucherId: string; voucherName: string })[] {
  const all: (PortalCombo & { voucherId: string; voucherName: string })[] = [];

  for (const v of voucherList) {
    const result = computeVoucherCombos(v.id, v.name, v.category, v.platformRates);
    if (result.bestCombo) {
      all.push({ ...result.bestCombo, voucherId: v.id, voucherName: v.name });
    }
  }

  all.sort((a, b) => b.totalValue - a.totalValue);

  // Deduplicate by voucher
  const seen = new Set<string>();
  const unique: typeof all = [];
  for (const combo of all) {
    if (!seen.has(combo.voucherId)) {
      seen.add(combo.voucherId);
      unique.push(combo);
    }
    if (unique.length >= limit) break;
  }

  return unique;
}

/**
 * Calculate value breakdown for a specific voucher + card + amount
 */
export function calculateMaxValue(
  voucherRate: number,
  cardEarningRate: number,
  redemptionValue: number,
  amount: number
): {
  voucherDiscount: number;
  youPay: number;
  cardEarningPoints: number;
  cardEarningValue: number;
  totalSavings: number;
  effectiveReturn: number;
} {
  const voucherDiscount = amount * (voucherRate / 100);
  const youPay = amount - voucherDiscount;
  const cardEarningValue = amount * (cardEarningRate / 100) * redemptionValue;
  const totalSavings = voucherDiscount + cardEarningValue;
  const effectiveReturn = youPay > 0 ? (totalSavings / youPay) * 100 : 0;

  return {
    voucherDiscount,
    youPay,
    cardEarningPoints: amount * (cardEarningRate / 100),
    cardEarningValue,
    totalSavings,
    effectiveReturn,
  };
}

/**
 * Filter combos to only cards the user owns
 */
export function filterCombosByMyCards(
  combos: PortalCombo[],
  myCardIds: string[]
): PortalCombo[] {
  return combos.filter((c) => myCardIds.includes(c.card.id));
}
