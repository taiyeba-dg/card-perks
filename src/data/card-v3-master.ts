/**
 * Card V3 Master — Single Source of Truth
 *
 * This file merges cards-v3-index.ts (basic metadata) with card-v3-data.ts
 * (enrichment data) into ONE authoritative source per card.
 *
 * USE THIS instead of importing from both index and data separately.
 *
 * Migration guide:
 *   Old: import { CARDS_V3_INDEX } from './cards-v3-index'
 *        import { cardV3Data } from './card-v3-data'
 *   New: import { CARD_V3_MASTER, getMasterCard } from './card-v3-master'
 */

import type { CardV3Data } from "./card-v3-types";
import type { CardV3IndexEntry } from "./cards-v3-index";
import { CARDS_V3_INDEX } from "./cards-v3-index";
import { cardV3Data } from "./card-v3-data";

/**
 * CardV3Master combines all fields from CardV3IndexEntry and CardV3Data.
 * Serves as the single source of truth for card data across the application.
 */
export interface CardV3Master extends CardV3IndexEntry {
  /**
   * Enrichment data containing detailed reward structures,
   * redemption options, milestones, and more.
   */
  enrichment: CardV3Data;
}

/**
 * Build the master card database by merging index with enrichment data.
 * Logs warnings for cards missing enrichment data.
 */
function buildMasterData(): Record<string, CardV3Master> {
  const master: Record<string, CardV3Master> = {};

  for (const indexEntry of CARDS_V3_INDEX) {
    const enrichment = cardV3Data[indexEntry.id];

    if (!enrichment) {
      console.warn(
        `[card-v3-master] Missing enrichment data for card: ${indexEntry.id} (${indexEntry.name})`
      );
    }

    master[indexEntry.id] = {
      ...indexEntry,
      enrichment: enrichment || createDefaultEnrichment(),
    };
  }

  return master;
}

/**
 * Create a minimal default enrichment structure when data is missing.
 * This prevents crashes while keeping track of incomplete cards.
 */
function createDefaultEnrichment(): CardV3Data {
  return {
    categories: {
      base: {
        label: "N/A",
        rate: 0,
        cap: null,
        capPeriod: null,
        minTxn: null,
        note: "Enrichment data not available",
      },
    },
    exclusions: [],
    portals: [],
    redemption: {
      type: "points",
      pointCurrency: "Points",
      baseValue: 0,
      bestOption: "N/A",
      options: [],
      transferPartners: [],
    },
    fees: {
      annual: 0,
      renewal: 0,
      waivedOn: null,
      renewalBenefitValue: 0,
    },
    milestones: [],
    baseRate: 0,
    upgradePath: [],
    upgradeFromId: null,
    upgradeToId: null,
    applyLink: null,
    specialOffers: [],
    relatedCardIds: [],
  };
}

/**
 * The authoritative card database. Use this instead of importing
 * both CARDS_V3_INDEX and cardV3Data separately.
 */
export const CARD_V3_MASTER = buildMasterData();

/**
 * Get a single card by ID.
 * @param id - The card ID
 * @returns The CardV3Master entry or undefined if not found
 */
export function getMasterCard(id: string): CardV3Master | undefined {
  return CARD_V3_MASTER[id];
}

/**
 * Get all cards as an array.
 * @returns Array of all CardV3Master entries
 */
export function getAllMasterCards(): CardV3Master[] {
  return Object.values(CARD_V3_MASTER);
}

/**
 * Get cards filtered by bank ID.
 * @param bankId - The bank ID (e.g., "amex", "hdfc")
 * @returns Array of CardV3Master entries from that bank
 */
export function getMasterCardsByBank(bankId: string): CardV3Master[] {
  return Object.values(CARD_V3_MASTER).filter(
    (card) => card.bankId.toLowerCase() === bankId.toLowerCase()
  );
}

/**
 * Get cards filtered by tier.
 * @param tier - The tier (e.g., "ultra-premium", "premium", "standard")
 * @returns Array of CardV3Master entries with that tier
 */
export function getMasterCardsByTier(tier: string): CardV3Master[] {
  return Object.values(CARD_V3_MASTER).filter(
    (card) => card.tier.toLowerCase() === tier.toLowerCase()
  );
}

/**
 * Search cards by name (case-insensitive substring match).
 * Searches both card name and shortName.
 * @param query - Search query
 * @returns Array of matching CardV3Master entries
 */
export function searchMasterCards(query: string): CardV3Master[] {
  const q = query.toLowerCase();
  return Object.values(CARD_V3_MASTER).filter(
    (card) =>
      card.name.toLowerCase().includes(q) ||
      card.shortName.toLowerCase().includes(q)
  );
}

/**
 * Get cards that are in an upgrade path (either source or target).
 * Useful for showing related upgrade opportunities.
 * @param cardId - The card ID to find upgrade paths for
 * @returns Object with upgradeFrom and upgradeTo cards
 */
export function getUpgradePath(cardId: string): {
  upgradeFrom: CardV3Master | undefined;
  upgradeTo: CardV3Master | undefined;
} {
  const card = getMasterCard(cardId);
  if (!card) {
    return { upgradeFrom: undefined, upgradeTo: undefined };
  }

  return {
    upgradeFrom: card.enrichment.upgradeFromId
      ? getMasterCard(card.enrichment.upgradeFromId)
      : undefined,
    upgradeTo: card.enrichment.upgradeToId
      ? getMasterCard(card.enrichment.upgradeToId)
      : undefined,
  };
}

/**
 * Get all related cards for a given card.
 * @param cardId - The card ID
 * @returns Array of related CardV3Master entries
 */
export function getRelatedCards(cardId: string): CardV3Master[] {
  const card = getMasterCard(cardId);
  if (!card || !card.enrichment.relatedCardIds) {
    return [];
  }

  return card.enrichment.relatedCardIds
    .map((id) => getMasterCard(id))
    .filter((card) => card !== undefined) as CardV3Master[];
}

/**
 * Get the highest-rated cards within a bank.
 * @param bankId - The bank ID
 * @param limit - Maximum number of results (default: 5)
 * @returns Sorted array of top-rated cards from that bank
 */
export function getTopCardsByBank(
  bankId: string,
  limit: number = 5
): CardV3Master[] {
  return getMasterCardsByBank(bankId)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get cards within a specific annual fee range.
 * @param minFee - Minimum annual fee (in paisa, default: 0)
 * @param maxFee - Maximum annual fee (in paisa)
 * @returns Array of CardV3Master entries within fee range
 */
export function getMasterCardsByFeeRange(
  minFee: number = 0,
  maxFee: number = Infinity
): CardV3Master[] {
  return Object.values(CARD_V3_MASTER).filter(
    (card) => card.feeAnnual >= minFee && card.feeAnnual <= maxFee
  );
}
