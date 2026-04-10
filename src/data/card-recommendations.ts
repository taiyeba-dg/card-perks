/**
 * Unified recommendation configuration for card matching algorithms.
 *
 * This file serves as the single source of truth for all hardcoded values used in:
 * - Card Finder scoring (finderScoring.ts)
 * - Quiz scoring (quiz/scoring.ts)
 * - Feature valuations and portal assumptions
 * - Income/fee/spend brackets
 * - Scoring thresholds and penalties
 *
 * @see src/components/card-finder/finderScoring.ts
 * @see src/components/quiz/scoring.ts
 */

// ─────────────────────────────────────────────────────────────────────────────
// SCORING WEIGHTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Weights for Find My Card scoring algorithm.
 *
 * Used in: src/components/card-finder/finderScoring.ts
 * The weights determine how much each factor contributes to the final match score.
 * All weights must sum to 1.0 for proper normalization.
 *
 * - categoryMatch: How well the card's earning rates match user's spending categories
 * - feeRangeFit: Match between card's annual fee and user's fee comfort level
 * - perkAlignment: How well card's perks match user's selected priorities
 * - bankPreference: Whether the card is from user's preferred bank
 * - spendTier: How well the card tier matches user's monthly spend level
 */
export const FINDER_WEIGHTS = {
  categoryMatch: 0.40,
  feeRangeFit: 0.20,
  perkAlignment: 0.20,
  bankPreference: 0.10,
  spendTier: 0.10,
} as const;

/**
 * Weights for Quiz scoring algorithm.
 *
 * Used in: src/components/quiz/scoring.ts
 * Applied to quiz results which use a simplified 5-step questionnaire.
 * All weights must sum to 1.0 for proper normalization.
 *
 * - spendCategoryMatch: Match between quiz spending category and card's earning rates
 * - feeRangeFit: Match between quiz fee preference and card's annual fee
 * - perkMatch: Match between quiz perk priority and card's actual perks
 * - bankPreference: Match between quiz bank preference and card's issuer
 * - spendAmountFit: Match between quiz monthly spend level and card's suitable tier
 */
export const QUIZ_WEIGHTS = {
  spendCategoryMatch: 0.40,
  feeRangeFit: 0.20,
  perkMatch: 0.20,
  bankPreference: 0.10,
  spendAmountFit: 0.10,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE VALUATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monetary values assigned to card benefits for annual value calculations.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 108-120)
 * These values are used to estimate the annual savings/earnings from various perks
 * and are subtracted from fees to calculate net annual value.
 *
 * - domesticLoungeVisit: Estimated value per domestic lounge visit (₹)
 * - internationalLoungeVisit: Estimated value per international lounge visit (₹)
 * - forexBaseline: Industry baseline forex markup % (used in forex savings calculation)
 * - golfRoundValue: Value of each complimentary golf round (₹)
 * - priorityPassValue: Value of Priority Pass membership equivalent (₹)
 * - dreamFolksValue: Value of DreamFolks lounge membership (₹)
 */
export const FEATURE_VALUATIONS = {
  domesticLoungeVisit: 1500,
  internationalLoungeVisit: 2500,
  forexBaseline: 3.5,
  golfRoundValue: 3000,
  priorityPassValue: 5000,
  dreamFolksValue: 2000,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PORTAL ASSUMPTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assumptions about how much spending flows through credit card portals.
 *
 * Used in: src/components/card-finder/finderScoring.ts (line 86)
 * These percentages are used when calculating bonus earnings from portal bookings.
 * Portal bonus is calculated as: (portalRate - baseRate) * monthlySpend * portalPercent * 12
 *
 * - defaultPortalSpendPercent: Default % of online/travel spend through portals (30%)
 * - heavyPortalSpendPercent: For users who indicate frequent portal usage (50%)
 * - noPortalSpendPercent: For users who don't use portals (0%)
 */
export const PORTAL_ASSUMPTIONS = {
  defaultPortalSpendPercent: 0.30,
  heavyPortalSpendPercent: 0.50,
  noPortalSpendPercent: 0,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SCORE THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thresholds that control match score calculation and penalties.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 146-152)
 * and src/components/card-finder/FinderResultsView.tsx for display logic
 *
 * - minScore: Minimum match score floor (0-100 scale) - line 152
 * - maxScore: Maximum match score cap (0-100 scale) - line 152
 * - topCardFloor: Top recommendation gets boosted to this score minimum - line 210
 * - highFeePenalty: Points deducted for high-fee cards when user wants low-fee - line 147
 * - highFeeThreshold: Fee amount (₹) above which is considered "high fee" - line 147
 * - noLoungePenalty: Points deducted when card has no lounge but user wants lounge - line 149
 * - highForexPenalty: Points deducted for high forex when user wants low-forex - line 148
 * - highForexThreshold: Forex markup % above which is considered "high" - line 148
 * - highRewardsBonus: Points added for high base rate when user wants max-rewards - line 151
 * - highRewardsThreshold: Base rate % above which is considered "high rewards" - line 151
 */
export const SCORE_THRESHOLDS = {
  minScore: 30,
  maxScore: 99,
  topCardFloor: 90,
  highFeePenalty: 15,
  highFeeThreshold: 2000,
  noLoungePenalty: 15,
  highForexPenalty: 10,
  highForexThreshold: 2.0,
  highRewardsBonus: 5,
  highRewardsThreshold: 3.0,
  noCashbackPenalty: 5,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DEVALUATION PENALTIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Penalties applied to cards with recent devaluations.
 *
 * Used in: Future devaluation tracking features
 * These values are reserved for upcoming functionality to penalize cards
 * that have been devalued recently.
 *
 * - highImpactPenalty: Match score reduction for major devaluations (e.g., 50%+ benefit cut)
 * - mediumImpactPenalty: Match score reduction for moderate devaluations (e.g., 20-49% cut)
 * - lookbackMonths: How far back to scan for devaluations (6 months)
 * - bankHealthWarningThreshold: Show warning if bank health score falls below this
 */
export const DEVALUATION_PENALTIES = {
  highImpactPenalty: 10,
  mediumImpactPenalty: 5,
  lookbackMonths: 6,
  bankHealthWarningThreshold: 40,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// INCOME BRACKETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Annual income brackets used for card eligibility and recommendations.
 *
 * Used in: src/components/card-finder/finderTypes.ts (INCOME_RANGES)
 * and src/components/card-finder/finderScoring.ts (line 60-62)
 *
 * Used to determine which cards a user is eligible for based on minimum income
 * requirements. Values are in Indian Rupees (₹).
 */
export const INCOME_BRACKETS = [
  { id: "under-3l", label: "Under ₹3 Lakh", min: 0, max: 300000 },
  { id: "3l-6l", label: "₹3L – ₹6L", min: 300000, max: 600000 },
  { id: "6l-12l", label: "₹6L – ₹12L", min: 600000, max: 1200000 },
  { id: "12l-25l", label: "₹12L – ₹25L", min: 1200000, max: 2500000 },
  { id: "25l-plus", label: "₹25L+", min: 2500000, max: Infinity },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// FEE RANGE BRACKETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Annual fee brackets used for user preferences and filtering.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 177-179)
 * and src/components/quiz/quizData.ts (STEPS[1].options)
 *
 * Maps fee comfort levels to actual rupee ranges for filtering cards.
 * All values are in Indian Rupees (₹).
 */
export const FEE_BRACKETS = [
  { id: "0-500", label: "₹0 – ₹500", min: 0, max: 500 },
  { id: "500-2k", label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { id: "2k-5k", label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { id: "5k-plus", label: "₹5,000+", min: 5000, max: Infinity },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// FEE COMFORT RANGES (FINDER INTERNAL)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal fee comfort ranges used by the card finder to filter results.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 177-179)
 *
 * These ranges map the user's fee comfort selections (free/low/mid/high/ultra)
 * to exact rupee ranges for card filtering. Distinct from FEE_BRACKETS which
 * are the user-facing fee preference options.
 */
export const FEE_COMFORT_RANGES: Record<string, [number, number]> = {
  free: [0, 0],
  low: [1, 2000],
  mid: [2001, 5000],
  high: [5001, 15000],
  ultra: [15001, Infinity],
};

// ─────────────────────────────────────────────────────────────────────────────
// SPEND TIER BRACKETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monthly spend brackets used to match users with appropriate card tiers.
 *
 * Used in: src/components/card-finder/SpendingStep.tsx for validation
 * and src/components/quiz/quizData.ts (STEPS[4].options)
 *
 * Each tier indicates which card types are suitable for that spend level.
 * All values are in Indian Rupees (₹) per month.
 *
 * - low: Entry-level and starter cards (under ₹20K/month)
 * - mid: Entry-level, mid-range cards (₹20K-₹50K/month)
 * - high: Mid-range and premium cards (₹50K-₹1L/month)
 * - ultra: Premium and super-premium cards (₹1L+/month)
 */
export const SPEND_TIERS = [
  { id: "low", label: "Under ₹20K/month", min: 0, max: 20000, suitableTiers: ["entry", "starter"] },
  { id: "mid", label: "₹20K – ₹50K/month", min: 20000, max: 50000, suitableTiers: ["entry", "mid-range"] },
  { id: "high", label: "₹50K – ₹1L/month", min: 50000, max: 100000, suitableTiers: ["mid-range", "premium"] },
  { id: "ultra", label: "₹1L+/month", min: 100000, max: Infinity, suitableTiers: ["premium", "super-premium"] },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User priorities/preferences shown in the Card Finder.
 *
 * Used in: src/components/card-finder/finderTypes.ts (FINDER_PRIORITIES)
 * and src/components/card-finder/finderScoring.ts (lines 108-151)
 *
 * Each priority affects how match scores are calculated and which features
 * are valued in the annual value calculation.
 *
 * - max-rewards: User wants highest base earning rate (3%+ bonus at line 151)
 * - lounge: User wants lounge access (15pt penalty if unavailable, 1500/visit valuation)
 * - low-forex: User wants low forex markup (2.0% threshold, 10pt penalty)
 * - premium-perks: User wants premium benefits (golf, concierge, etc.)
 * - low-fee: User wants low/no annual fee (2000 threshold, 15pt penalty)
 * - travel-benefits: User wants travel insurance and miles
 * - dining-ent: User wants dining and entertainment benefits
 * - cashback: User prefers simple cashback rewards (5pt penalty if not available)
 */
export const CARD_PRIORITIES = [
  { id: "max-rewards", label: "Maximum Rewards", icon: "Sparkles", v3Check: "baseRate", threshold: 3.0 },
  { id: "lounge", label: "Lounge Access", icon: "Plane", v3Check: "lounge.domesticVisits", threshold: 1 },
  { id: "low-forex", label: "Low Forex Markup", icon: "Globe", v3Check: "forexMarkup", threshold: 2.0 },
  { id: "premium-perks", label: "Premium Perks", icon: "Crown", v3Check: "tier", threshold: "premium" },
  { id: "low-fee", label: "Low/No Annual Fee", icon: "Wallet", v3Check: "feeAnnual", threshold: 500 },
  { id: "travel-benefits", label: "Travel Benefits", icon: "MapPin", v3Check: "categories.travel.rate", threshold: 3.0 },
  { id: "dining-ent", label: "Dining & Entertainment", icon: "Utensils", v3Check: "categories.dining.rate", threshold: 3.0 },
  { id: "cashback", label: "Cashback", icon: "IndianRupee", v3Check: "redemption.type", threshold: "cashback" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPENDING CATEGORIES MAPPING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps user-facing spending categories to V3 card data category keys.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 8-21)
 * where it's defined as CAT_MAP
 *
 * This mapping translates the finder spending form (which shows user-friendly
 * categories like "Dining & Restaurants") to the V3 card data structure
 * (which uses backend category keys like "dining", "base", etc.).
 *
 * Most categories fall back to "base" rate if no specific category is found.
 * "utilities" maps to both "utilities" and "base" with priority on utilities.
 */
export const SPENDING_TO_V3_MAP: Record<string, string[]> = {
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
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BANK OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Available bank options for user preference selection.
 *
 * Used in: src/components/card-finder/finderTypes.ts (BANK_OPTIONS)
 * and src/components/quiz/quizData.ts (STEPS[3].options)
 *
 * Users can select a preferred bank, and cards will be scored higher
 * if they match the selected bank. "Any" means no bank preference.
 */
export const BANK_OPTIONS = [
  { id: "any", label: "No Preference" },
  { id: "hdfc", label: "HDFC Bank" },
  { id: "icici", label: "ICICI Bank" },
  { id: "axis", label: "Axis Bank" },
  { id: "sbi", label: "SBI Card" },
  { id: "kotak", label: "Kotak Mahindra" },
  { id: "idfc", label: "IDFC FIRST" },
  { id: "au", label: "AU Small Finance" },
  { id: "amex", label: "American Express" },
  { id: "others", label: "Others" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for recommendation results display and filtering.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 213-214)
 * and src/components/card-finder/FindMyCard.tsx (line 41)
 *
 * - maxEligibleCards: Show up to 5 cards user is eligible for (line 213)
 * - maxAspirationalCards: Show up to 3 cards user should aspire to (line 214)
 * - maxQuizResults: Quiz shows 3 results (src/components/quiz/scoring.ts, line 55)
 * - minMonthlySpend: Validation threshold for minimum spend to get recommendations (FindMyCard.tsx, line 41)
 */
export const RESULTS_CONFIG = {
  maxEligibleCards: 5,
  maxAspirationalCards: 3,
  maxQuizResults: 3,
  minMonthlySpend: 5000,
  minFilterResults: 3,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ SCORING POINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Point allocations for quiz scoring algorithm.
 *
 * Used in: src/components/quiz/scoring.ts (lines 8-48)
 *
 * Each category match adds these points to a card's score:
 * - Spending category match: 25 points (lines 14-18)
 * - Fee range match: 25 points (lines 22-25)
 * - Perk match: 20 points (lines 28-31)
 * - Bank preference match: 15 points (lines 34-38)
 * - Spend amount tier match: 15 points (lines 41-44)
 * - Rating bonus: (rating - 4) * 10 points (line 46)
 * - Final cap: 100 points maximum (line 48)
 */
export const QUIZ_SCORING_POINTS = {
  spendCategoryMatch: 25,
  feeRangeMatch: 25,
  perkMatch: 20,
  bankPreferenceMatch: 15,
  spendAmountMatch: 15,
  ratingBonusPerPoint: 10,
  ratingBaseline: 4,
  maxScore: 100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ RESULT NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for normalizing quiz results to percentage match scores.
 *
 * Used in: src/components/quiz/scoring.ts (lines 62-68)
 *
 * Raw quiz scores (0-100) are normalized to match percentages:
 * - Top card: 95% (line 66)
 * - Other cards: 95 * (rawScore / maxScore) (line 66)
 */
export const QUIZ_RESULT_NORMALIZATION = {
  topCardMatchPercent: 95,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// FINDER RESULT RESCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for rescoring finder results relative to top card's net value.
 *
 * Used in: src/components/card-finder/finderScoring.ts (lines 206-211)
 *
 * After initial match score calculation, scores are adjusted based on net value:
 * - rescale: matchScore * (0.6 + 0.4 * relativeValue)
 * - relativeValue = card.netValue / topCard.netValue
 * - Top card always gets boosted to 90+ score (line 210)
 */
export const FINDER_RESULT_RESCORING = {
  baseMultiplier: 0.6,
  relativeValueWeight: 0.4,
} as const;
