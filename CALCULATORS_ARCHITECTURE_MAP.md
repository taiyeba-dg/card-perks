# VoucherTracker CALCULATORS SECTION - Complete Architecture Map

**Generated:** March 31, 2026
**Project:** glowing-dream-orb-main (VoucherTracker)
**Scope:** Rewards Calculator, Fee Worth Calculator, Redemption Calculator

---

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Rewards Calculator](#1-rewards-calculator)
4. [Fee Worth Calculator](#2-fee-worth-calculator)
5. [Redemption Calculator](#3-redemption-calculator)
6. [Shared Infrastructure](#shared-infrastructure)
7. [Mobile vs Desktop Split](#mobile-vs-desktop-split)
8. [Data Files Reference](#data-files-reference)

---

## SYSTEM OVERVIEW

The CALCULATORS section provides three independent but architecturally similar calculators:

| Calculator | Purpose | Input | Output | Users |
|---|---|---|---|---|
| **Rewards** | Calculate annual/monthly rewards based on spending profile | Monthly spend by category + card selection | Annual points value, category breakdown, exclusions | Card buyers evaluating earning potential |
| **Fee Worth** | Determine if card's annual fee is justified | Monthly spend + perk utilization | Net value, ROI, break-even analysis, verdict | Existing cardholders evaluating renewal |
| **Redemption** | Find best redemption value for accumulated points | Points amount + card selection | Value in INR, transfer partner options, best choice | Cardholders planning redemptions |

**Key Characteristics:**
- Each has a **Desktop/Full Page** version and **Mobile Component** version
- Uses centralized JSON data files (generated, not manually edited)
- Type-safe via TypeScript interfaces in `calc-types.ts`
- Shared utility functions and category definitions
- No direct API calls; all data is static/bundled

---

## DATA FLOW ARCHITECTURE

```
User Input (Spend/Points/Card Selection)
    ↓
    ├─→ Desktop Page Component (RewardsCalculator.tsx, etc.)
    │   ├─→ Reads calc-types.ts for TypeScript interfaces
    │   ├─→ Imports JSON data from rewards-calc-data.json, etc.
    │   ├─→ Calls calculation engine (in-component function)
    │   ├─→ Renders results with visualizations
    │   └─→ Delegates to Mobile component if screen < 768px
    │
    ├─→ Mobile Component (MobileRewardsCalc.tsx, etc.)
    │   ├─→ Mirrors calculation logic (independent of page version)
    │   ├─→ Optimized for touch/smaller screens
    │   └─→ Integrated into page via useIsMobile hook
    │
    ├─→ Supporting Data Files
    │   ├─→ rewards-calc-data.json (generated)
    │   ├─→ redemption-calc-data.json (generated)
    │   ├─→ feeworth-calc-data.json (generated)
    │   ├─→ exclusions-registry.ts (reward exclusions)
    │   ├─→ category-config.ts (category metadata)
    │   ├─→ spending-presets.ts (default spend profiles)
    │   ├─→ lounge-programs.ts (lounge network data)
    │   ├─→ transfer-partners.ts (loyalty programs)
    │   └─→ reward-currencies.ts (point value mappings)
    │
    └─→ Utility Functions
        ├─→ lib/fee-utils.ts (FeeWorth analysis engine)
        ├─→ lib/utils.ts (general utilities)
        └─→ lib/card-display.ts (card formatting)
```

---

## 1. REWARDS CALCULATOR

### PURPOSE
Calculate estimated annual rewards (in ₹ value) based on:
- Card selection (1-3 cards for comparison)
- Monthly spending by category
- Card's category multipliers and exclusions

### COMPONENT FILES

#### Desktop Page
**File:** `/src/pages/RewardsCalculator.tsx` (1,090 lines)

**Key Sections:**
- Category definitions (DEFAULT_CATS, EXTRA_CATS, ALL_CATS) - 11 categories total
- Calculation engine: `calculateRewards()` function
- UI Components:
  - `EmptyState`: Shows popular cards when none selected
  - `MultiCardSelector`: Card search & selection (max 3 cards)
  - `CategoryTooltip`: MCC code definitions for each category
  - `SpendingRow`: Slider + input field for each category
  - `ResultsSkeleton`: Loading placeholder
  - `RewardsCategorySection`: Detailed breakdown per category
  - `PresetButtons`: Quick fill for Casual/Premium/Heavy presets

**Props Taken:** None (page component - uses React Router)

**State Managed:**
```typescript
selectedCards: CreditCard[]        // 1-3 cards
spending: Record<string, number>   // ₹/month by category
results: CalcResult[]              // One per card (for comparison)
```

**Data Read:**
- `@/data/cards` → CreditCard array
- `@/data/calc-types` → rewardsCalcData (JSON)
- `@/data/exclusions-registry` → isExcludedByRegistry()
- `@/data/category-config` → Category metadata (for Fee Worth fallback)

**Calculation Engine:**
```typescript
function calculateRewards(v3: RewardsCalcCard, spending: SpendingMap, cardId?: string): CalcResult
```

**Input Shape (RewardsCalcCard interface):**
```typescript
{
  id: string
  name: string
  shortName: string
  bank: string
  image: string
  tier: string
  rewardType: string
  rewardName: string (e.g., "Reward Points")
  baseRate: number (e.g., 2.5%)
  baseRateLabel: string
  pointValue: number (₹ per point, e.g., 0.5)
  categories: {
    grocery: { rate, cap, capPeriod, note }
    dining: { rate, cap, capPeriod, note }
    fuel: { rate, cap, capPeriod, note }
    online: { rate, cap, capPeriod, note }
    travel: { rate, cap, capPeriod, note }
    utilities: { rate, cap, capPeriod, note }
    entertainment: { rate, cap, capPeriod, note }
    base: { rate, cap, capPeriod, note }
  }
  exclusions: string[]
  monthlyCap: number | null
  portalName: string | null
  portalTopRate: string | null
  portals: RewardsCalcPortal[]
}
```

**Output Shape (CalcResult interface):**
```typescript
{
  earnings: Record<string, CatEarning> {
    spend: number                 // Monthly spend in ₹
    rate: number                  // Reward rate (%)
    monthlyValue: number          // Monthly ₹ reward value
    annualValue: number           // Annual ₹ reward value
    excluded: boolean             // Is category excluded?
    capped: boolean               // Hit monthly cap?
    capDetail?: string            // Cap explanation
    portalBonus?: { name, rate }  // Better rate via portal?
    note?: string                 // Category note
  }
  totalMonthlyValue: number       // Sum of all monthly values
  totalAnnualValue: number        // Sum of all annual values
  totalMonthlyPoints: number      // Points equivalent (monthly)
  totalAnnualPoints: number       // Points equivalent (annual)
  pointCurrency: string           // "Reward Points" etc.
  cappedCats: string[]            // Categories hitting caps
}
```

**Computation Logic:**
1. For each category:
   - Get monthly spend from input
   - Look up category rate from card (or fallback to `base` rate)
   - Check exclusions registry
   - If excluded or rate=0: earnings are 0, mark as excluded
   - Otherwise: `monthlyValue = spend * rate / 100`
   - If category has monthly cap: recalculate above cap at base rate
2. Sum all monthly values → annual by multiplying by 12
3. Convert ₹ value to points using pointValue (₹ per point)

**Special Features:**
- Portal bonus detection: Shows better rates from partner portals
- Cap tracking: Displays which categories hit monthly caps
- Devaluation warnings: Hardcoded for HDFC Infinia, HDFC Diners Black
- Multi-card comparison: Up to 3 cards side-by-side
- Share/Print actions

#### Mobile Component
**File:** `/src/components/calculators/MobileRewardsCalc.tsx` (773 lines)

**Key Differences from Desktop:**
- Duplicate calculation logic (independent implementation)
- Mobile-friendly layout: stacked sections instead of side-by-side
- Simplified card selection UI (no dropdown, inline buttons)
- Touch-optimized sliders
- MobileSection wrapper component for consistent styling

**Shared with Desktop:**
- Category definitions (DEFAULT_CATS, EXTRA_CATS)
- Calculation algorithm (verbatim copy)
- Data imports (cards, rewardsCalcData, exclusions-registry)

**Props Accepted:**
None - used as a component mount point from page when `useIsMobile()` returns true.

### INTEGRATION POINT
In `RewardsCalculator.tsx`:
```typescript
const isMobile = useIsMobile();

if (isMobile) {
  return <MobileRewardsCalc />;
}
return <PageLayout>{/* desktop content */}</PageLayout>;
```

---

## 2. FEE WORTH CALCULATOR

### PURPOSE
Evaluate whether a card's annual fee is justified by:
- Monthly spending across categories
- Rewards earned from that spending
- Renewal benefits (milestone spend bonuses, cashback)
- Perks (lounge access, golf, memberships, etc.)
- Fee waiver conditions

**Output:** Net value (benefits - fee), ROI %, verdict (Excellent/Worth/Borderline/Not Worth)

### COMPONENT FILES

#### Desktop Page
**File:** `/src/pages/FeeWorthCalculator.tsx` (1,931 lines)

**Key Sections:**
- Perk detection: `detectPerks()` function analyzes v3 + feeworth data
- Fee analysis: `analyzeFee()` function (in lib/fee-utils.ts)
- UI Components:
  - `CardPerkDetector`: Identify available perks from card data
  - `PerkToggles`: Enable/disable each perk type
  - `SpendingSlider`: Monthly spend adjustment
  - `MilestoneTracker`: Visualize spend targets for milestone bonuses
  - `LoungeTracker`: Lounge visit calculator
  - `FeeBreakdownChart`: Recharts AreaChart showing net value at different spend levels
  - `VerdictPanel`: Final recommendation badge

**Props Taken:** None (page component)

**State Managed:**
```typescript
selectedCard: CreditCard | null
monthlySpend: number
perks: PerkState {
  loungeEnabled: boolean
  loungeVisits: number
  portalEnabled: boolean
  monthlyPortalSpend: number
  golfEnabled: boolean
  golfGames: number
  diningEnabled: boolean
  membershipEnabled: boolean
}
analysis: FeeAnalysis | null
```

**Data Read:**
- `@/data/cards` → CreditCard array (lookup)
- `@/data/calc-types` → feeworthCalcData (JSON)
- `@/data/category-config` → Category names/emojis
- `@/hooks/use-cards-v3` → CardV3 type for perk detection fallback
- `@/lib/fee-utils` → analyzeFee() engine
- `@/data/lounge-programs` → getCardLoungeAccess(), getLoungeProgram()

**Calculation Engine (lib/fee-utils.ts):**
```typescript
function analyzeFee(v3: CardV3Data, monthlySpend: number, usePortal: boolean): FeeAnalysis
```

**Input Shape (FeeWorthCalcCard interface):**
```typescript
{
  id: string
  name: string
  image: string
  bank: string
  network: string (e.g., "Visa", "Mastercard", "Amex")
  networkBase: string
  tier: string
  annualFee: number
  joiningFee: number
  feeWaivedOn: number | null (spend threshold, e.g., 300000)
  waiverText: string
  renewalBenefitValue: number (₹ credit, e.g., 5000)
  renewalBenefitText: string
  baseRate: number
  pointValue: number
  rewardType: string
  categories: CategoryMap (same as rewards)
  exclusions: string[]
  milestones: Milestone[] {
    spend: number
    benefit: string (e.g., "₹5000 credit")
    value: number
    period: string (e.g., "Annual")
  }
  lounge: Lounge {
    domesticVisits: string
    domesticUnlimited: boolean
    intlVisits: string
    intlUnlimited: boolean
    programs: LoungeProgram[]
    spendRequired: number | null
  }
  golf: Golf {
    included: boolean
    text: string | null
  }
  memberships: Membership[] {
    name: string
    type: string
    value: number
  }
  insurance: Insurance[]
  fuelSurcharge: string
  forexMarkup: string
  entertainment: string | null
  joiningBonus: string
  rating: number
  tags: string[]
  verdict: string
  pros: string[]
  cons: string[]
}
```

**Output Shape (FeeAnalysis interface from lib/fee-utils.ts):**
```typescript
{
  annualSpend: number
  baseRewards: number            // ₹ from category spending
  portalBonus: number            // ₹ from portal usage
  totalEarning: number           // baseRewards + portalBonus
  renewalBonus: number           // ₹ from renewal benefit
  milestoneValue: number         // ₹ from met milestone bonuses
  milestoneDetails: {
    spend: number
    benefit: string
    value: number
    unlocked: boolean            // Did user hit spend threshold?
    progress: number             // % toward unlock
    shortfall: number            // ₹ to reach unlock
  }[]
  perksValue: number             // ₹ from estimated lounge/golf
  perksBreakdown: {
    label: string
    value: number
    estimated: boolean
  }[]
  totalValue: number             // Sum of all benefits
  feeWaived: boolean             // Did spending waive fee?
  feeWaiverProgress: number      // % toward waiver
  feeWaiverShortfall: number     // ₹ to reach waiver
  effectiveFee: number           // Actual fee (0 if waived)
  netValue: number               // totalValue - effectiveFee
  roi: string                    // "3.5x" or "∞"
  verdict: "excellent" | "worth" | "borderline" | "not-worth"
  verdictLabel: string           // Human-readable verdict
  breakEvenMonthly: number       // ₹/month spend to break even on fee alone
  breakEvenWithPerks: number     // ₹/month spend to break even including perks
  spendAboveBreakEven: number    // User's spend - breakEvenMonthly
  chartData: {
    spend: number                // Monthly spend (x-axis)
    netValue: number             // Net value at that spend (y-axis)
  }[]                            // 10 points for curve
}
```

**Computation Logic:**
1. **Base Rewards:** `monthlySpend * (baseRate / 100) * 12 * pointValue`
2. **Portal Bonus:** If enabled: 20% of spend at portal rate (avg of merchants)
3. **Renewal Bonus:** Flat ₹ amount from feeworth data
4. **Milestone Bonuses:** For each milestone, if `annualSpend >= milestone.spend`, add `milestone.value`
5. **Perks Value:**
   - Lounge: ₹2,000 per visit × estimated visits
   - Golf: ₹2,000 per game × estimated games
6. **Fee Waiver Check:** If `annualSpend >= feeWaivedOn`, effective fee = 0
7. **Net Value:** totalValue - effectiveFee
8. **ROI:** totalValue / effectiveFee
9. **Verdict:** Based on netValue and comparison to annual fee

**Special Features:**
- Perk detection: Reads from feeworth data first, falls back to CardV3
- Milestone unlock visualization: Progress bars + shortfall amounts
- Break-even analysis: Shows monthly spend needed to justify fee
- Interactive toggles: Enable/disable each perk to see impact
- Chart: Area chart showing net value across spend levels (₹10K to ₹500K/month)
- Portal bonus: Calculates incremental value from Rewards portal

#### Mobile Component
**File:** `/src/components/calculators/MobileFeeWorthCalc.tsx` (895 lines)

**Key Differences:**
- Simplified perk UI: Vertical toggle list instead of grid
- Smaller milestones display: Compact cards instead of full bars
- Chart removed (too complex on mobile, shows summary instead)
- Touch-friendly spending slider
- Verdict displayed as large badge

**Shared with Desktop:**
- Perk detection logic (detectPerks function)
- Fee analysis engine import (lib/fee-utils.ts analyzeFee)
- Data imports (same sources)

### INTEGRATION POINT
In `FeeWorthCalculator.tsx`:
```typescript
const isMobile = useIsMobile();

if (isMobile) {
  return <MobileFeeWorthCalc />;
}
return <PageLayout>{/* desktop content */}</PageLayout>;
```

---

## 3. REDEMPTION CALCULATOR

### PURPOSE
Find the best way to redeem accumulated points:
- Cash/Statement value (lowest)
- Gift cards/Vouchers
- Hotel bookings
- **Transfer Partners** (airlines/hotels): Best value route
- Show min redemption amounts, fees, restrictions

**Output:** Best option highlighted, value in ₹, transfer partner options with ratios

### COMPONENT FILES

#### Desktop Page
**File:** `/src/pages/RedemptionCalculator.tsx` (750 lines)

**Key Sections:**
- UI Components:
  - `ValueSpectrumBar`: Color-coded bar (red/amber/green) showing value range
  - `RedemptionRow`: Each redemption option with value bar + min points
  - `TransferPartnerCard`: Airline/hotel partner with conversion ratio
  - `MultiCardSelector`: Select 1-3 cards (same as Rewards)
  - `QuickAmountButtons`: 5K/10K/25K/50K/100K points shortcuts
  - `ResultsSkeleton`: Loading placeholder

**Props Taken:** None (page component - uses URL search params)

**State Managed:**
```typescript
selectedCards: CreditCard[]
points: number                     // Points to redeem
results: RedemptionOption[]         // Options for selected card
```

**Data Read:**
- `@/data/cards` → CreditCard array
- `@/data/calc-types` → redemptionCalcData (JSON)
- URL search params → Initialize card/points if shared link

**Calculation Engine:** Minimal - mostly lookup from redemptionCalcData

**Input Shape (RedemptionCalcCard interface):**
```typescript
{
  id: string
  name: string
  image: string
  bank: string
  pointCurrency: string (e.g., "Reward Points", "Membership Rewards")
  rewardType: string
  baseValue: number (₹ per point for statement option, e.g., 0.3)
  bestOption: string (e.g., "Airline miles transfer")
  expiryMonths: number | null
  expiryText: string (e.g., "5 years", "Check policy")
  options: RedemptionOption[] {
    type: string (e.g., "Statement Credit", "Taj Vouchers", "Airline Miles")
    value: number (₹ per point, e.g., 0.5)
    desc: string (e.g., "3-5 days")
    recommended: boolean
    minPoints: number | null (e.g., 5000)
    fee: number | null (₹ redemption fee)
  }[]
  transferPartners: TransferPartner[] {
    name: string (e.g., "Singapore Airlines KrisFlyer")
    ratio: string (e.g., "2:1", "1.5:1")
    type: string (e.g., "airline", "hotel")
    program: string
  }[]
  restrictions: RedemptionRestrictions | null {
    maxRedemptionsPerMonth: number | null
    maxPointsPerMonth: number | null
    maxCycleCeiling: number | null
    note: string | null
  }
}
```

**Output Shape:** RedemptionOption[] with computed values

**Computation Logic:**
1. For each option in card's options array:
   - `value = points * option.value` (₹)
   - Check if meets `minPoints` requirement
2. For transfer partners:
   - `milesReceived = points * ratio[1] / ratio[0]`
   - Multiply by partner's assumed value (from transfer-partners.ts)
3. Sort by value (best first)
4. Highlight best option with green badge

**Special Features:**
- Value spectrum bar: Visual representation of best/worst options
- Transfer partner cards: Show ratio + estimated value
- Min points enforcement: Gray out options user can't use
- Relative value bars: Visual comparison within row
- Number ticker: Smooth animation of values when points change
- Share/Print: Copy redemption scenarios

#### Mobile Component
**File:** `/src/components/calculators/MobileRedemptionCalc.tsx` (613 lines)

**Key Differences:**
- Stacked layout instead of side-by-side comparison
- Transfer partners in collapsed accordion
- Simplified value spectrum (or removed entirely)
- Touch-optimized amount input
- Shorter option labels

**Shared with Desktop:**
- Calculation logic (minimal - mostly lookups)
- Data imports (cards, redemptionCalcData)

### INTEGRATION POINT
In `RedemptionCalculator.tsx`:
```typescript
const isMobile = useIsMobile();

if (isMobile) {
  return <MobileRedemptionCalc />;
}
return <PageLayout>{/* desktop content */}</PageLayout>;
```

---

## SHARED INFRASTRUCTURE

### 1. TYPE DEFINITIONS
**File:** `/src/data/calc-types.ts` (187 lines)

**Core Interfaces:**
- `RewardsCalcCard`: Full rewards card definition
- `RedemptionCalcCard`: Full redemption card definition
- `FeeWorthCalcCard`: Full fee evaluation card definition
- `CategoryBucket`: Shared category rate/cap structure
- `RedemptionOption`, `TransferPartner`, `RedemptionRestrictions`
- `Lounge`, `Golf`, `Milestone`, `Membership`

**Data Imports:**
```typescript
import rewardsRaw from './rewards-calc-data.json'
import redemptionRaw from './redemption-calc-data.json'
import feeworthRaw from './feeworth-calc-data.json'

export const rewardsCalcData = stripMeta<RewardsCalcCard>(rewardsRaw)
export const redemptionCalcData = stripMeta<RedemptionCalcCard>(redemptionRaw)
export const feeworthCalcData = stripMeta<FeeWorthCalcCard>(feeworthRaw)
```

**All three JSON files are GENERATED** (not manually edited):
- Source: `scripts/generate-calc-data.ts`
- Command: `npm run generate:calc`
- Includes `_meta` warning: "DO NOT EDIT MANUALLY"

### 2. CATEGORY CONFIGURATION
**File:** `/src/data/category-config.ts` (164 lines)

**Provides:**
- `CATEGORIES`: Master list of 12 spend categories
  - emoji, displayName, lucideIcon, color, isPrimary, sortOrder
- `PRIMARY_CATEGORIES`: 6 core categories (dining, grocery, online, travel, fuel, entertainment)
- `ADVANCED_CATEGORIES`: 6 secondary categories (utilities, pharmacy, telecom, education, rent, base)
- Lookup functions: `getCategory()`, `getCategoryEmoji()`, `getCategoryName()`, `getCategoryColor()`
- Mapping tables: `USER_SPEND_TO_V3`, `V3_TO_SPEND_KEY`, `PRIORITY_TO_V3_CATEGORIES`

**Used By:**
- All three calculators (for consistent category display)
- My Cards pages (spending tracking)
- Card Finder (priority selection)
- Compare Tool (spending inputs)

### 3. SPENDING PRESETS
**File:** `/src/data/spending-presets.ts` (154 lines)

**Provides:**
- `SPENDING_PRESETS`: 5 detailed personas (Student, Professional, Family, Traveler, High Spender)
- `QUICK_PRESETS`: 3 tiers (₹30K, ₹80K, ₹1.5L) - **used by calculators**
- `COMPARE_SPEND_TO_V3`: Mapping for compare tool keys

**Quick Preset Hardcoded Values:**
```typescript
{
  id: "casual",
  label: "₹30K",
  values: { grocery: 5000, dining: 4000, fuel: 3000, online: 8000, travel: 2000, utilities: 8000 },
  totalMonthly: 30000
},
{
  id: "premium",
  label: "₹80K",
  values: { grocery: 12000, dining: 12000, fuel: 6000, online: 20000, travel: 15000, utilities: 15000 },
  totalMonthly: 80000
},
{
  id: "heavy",
  label: "₹1.5L",
  values: { grocery: 20000, dining: 25000, fuel: 10000, online: 35000, travel: 30000, utilities: 30000 },
  totalMonthly: 150000
}
```

**Used By:**
- RewardsCalculator.tsx (PRESETS array)
- MobileRewardsCalc.tsx (imports QUICK_PRESETS)
- FeeWorthCalculator.tsx (PRESETS array)
- MobileFeeWorthCalc.tsx

### 4. EXCLUSIONS REGISTRY
**File:** `/src/data/exclusions-registry.ts` (200+ lines)

**Provides:**
- `EXCLUSION_TYPES`: Map of exclusion types with descriptions
  - fuel, wallet-loads, rent, emi, gaming, utilities, insurance, government, cash-withdrawal, etc.
- `isExcluded(cardId: string, category: string): boolean`
  - Checks against card-specific exclusions

**Used By:**
- RewardsCalculator.tsx: `isExcludedByRegistry(cardId, category)`
- MobileRewardsCalc.tsx: `isExcludedByRegistry(cardId, category)`
- For reward computation: Skip earning if category excluded

### 5. LOUNGE PROGRAMS
**File:** `/src/data/lounge-programs.ts` (300+ lines)

**Provides:**
- `LoungeNetwork` interface
- `CardLoungeAccess` interface
- `LOUNGE_NETWORKS`: Map of programs (Priority Pass, DreamFolks, IATA, ...)
- `getCardPerVisitValues(cardId)`: Returns lounge visit ₹ values
- `getCardLoungeAccess(cardId)`: Returns access details
- `getLoungeProgram(programId)`: Returns program metadata

**Used By:**
- FeeWorthCalculator.tsx: detectPerks(), lounge value estimation
- MobileFeeWorthCalc.tsx: Lounge perk handling

### 6. TRANSFER PARTNERS
**File:** `/src/data/transfer-partners.ts` (300+ lines)

**Provides:**
- `LoyaltyProgram` interface (airline/hotel)
- `CardTransferPartner` interface
- `LOYALTY_PROGRAMS`: Map of programs
  - InterMiles, Singapore KrisFlyer, British Airways, Marriott Bonvoy, Taj, Hyatt, etc.
  - Each with: name, type, alliance, approxValueInr, sweetSpots

**Used By:**
- RedemptionCalculator.tsx: Display transfer options
- MobileRedemptionCalc.tsx: Compact transfer partner list

### 7. UTILITY FUNCTIONS

#### lib/fee-utils.ts
```typescript
export function analyzeFee(v3: CardV3Data, monthlySpend: number, usePortal: boolean): FeeAnalysis
export function formatCur(n: number): string // ₹ formatting with Cr/L notation
```

**Used By:** FeeWorthCalculator.tsx, MobileFeeWorthCalc.tsx

#### lib/utils.ts
```typescript
export function cn(...classes: unknown[]): string // classname merger
```

**Used By:** All components (Tailwind className management)

#### lib/card-display.ts
```typescript
// Card image/color formatting utilities
```

### 8. HOOKS

#### useIsMobile()
**File:** `/src/hooks/use-mobile.tsx`

**Behavior:**
- Returns `true` if window width < 768px
- Listens to media query changes
- Initial value: `window.innerWidth < 768`

**Used By:** All three calculator pages to switch between desktop/mobile

**Breakpoint:** 768px (Tailwind's `md` breakpoint)

---

## MOBILE VS DESKTOP SPLIT

### Architecture Pattern

Each calculator has **two independent component trees**:

```
RewardsCalculator.tsx (page)
├─ useIsMobile() hook
├─ If isMobile = true:
│  └─ <MobileRewardsCalc /> (standalone component)
└─ If isMobile = false:
   └─ <PageLayout>
      └─ Desktop components (MultiCardSelector, SpendingRow, etc.)
```

### Why Duplicated Logic?

1. **Independent Mobile Components:**
   - Each mobile component (Mobile*.tsx) imports its own data
   - Calculation logic duplicated (not shared functions)
   - Pros: Mobile can be optimized independently; no shared state
   - Cons: Logic divergence risk; duplicated code

2. **Reasons for Duplication:**
   - Mobile might need slightly different calculations (e.g., simpler portal logic)
   - Avoids shared state complexity
   - Easier to deploy mobile-only updates
   - Clear separation of concerns

### File Organization

**Desktop Pages:** `/src/pages/`
- RewardsCalculator.tsx (1,090 lines)
- FeeWorthCalculator.tsx (1,931 lines)
- RedemptionCalculator.tsx (750 lines)

**Mobile Components:** `/src/components/calculators/`
- MobileRewardsCalc.tsx (773 lines)
- MobileFeeWorthCalc.tsx (895 lines)
- MobileRedemptionCalc.tsx (613 lines)

**Desktop-Only UI Components:** `/src/components/`
- PageLayout.tsx
- SEO.tsx
- CardImage.tsx
- Various shadcn/ui components (Slider, Switch, Tooltip, etc.)

### Responsive Behavior

| Aspect | Desktop (≥768px) | Mobile (<768px) |
|---|---|---|
| Card Selection | Multi-card dropdown + pills | Single card with full-width search |
| Spending Input | Side-by-side sliders + inputs | Stacked mobile sliders |
| Results Display | Multi-column comparison | Single column, scrollable |
| Charts | Recharts AreaChart (FeeWorth) | Removed or simplified |
| Tooltips | Full Radix tooltip popovers | Simplified or removed |
| Typography | Desktop-optimized spacing | Compact, mobile-optimized |

### CSS Approach

- **Tailwind Utility Classes:** All responsive design via `sm:`, `md:`, `lg:` prefixes
- **Mobile-First Principle:** Components start mobile, then enhance for desktop
- **Separate Components:** Rather than one component with many `hidden sm:block` classes, use entirely separate component trees

---

## DATA FILES REFERENCE

### JSON Data Files (Generated)

#### 1. rewards-calc-data.json
**Location:** `/src/data/rewards-calc-data.json` (314 KB)

**Structure:**
```json
{
  "_meta": {
    "generated": true,
    "source": "scripts/generate-calc-data.ts",
    "warning": "DO NOT EDIT MANUALLY"
  },
  "hdfc-infinia-metal": {
    "id": "...",
    "name": "...",
    "baseRate": 2.5,
    "pointValue": 0.5,
    "categories": { "grocery": { "rate": 5, ... }, ... },
    "portals": [ ... ],
    ...
  },
  ...
}
```

**Entries:** 150+ cards
**Keys Used By:** RewardsCalculator, MobileRewardsCalc
**Import:** `import { rewardsCalcData } from '@/data/calc-types'`

#### 2. redemption-calc-data.json
**Location:** `/src/data/redemption-calc-data.json` (139 KB)

**Structure:**
```json
{
  "_meta": { ... },
  "hdfc-infinia-metal": {
    "id": "...",
    "name": "...",
    "pointCurrency": "Reward Points",
    "baseValue": 0.5,
    "options": [
      {
        "type": "Statement Credit",
        "value": 0.3,
        "minPoints": 5000,
        ...
      },
      {
        "type": "Airline Miles",
        "value": 0.5,
        ...
      }
    ],
    "transferPartners": [
      {
        "name": "Singapore Airlines KrisFlyer",
        "ratio": "2:1",
        "type": "airline",
        ...
      },
      ...
    ],
    ...
  },
  ...
}
```

**Entries:** 150+ cards
**Keys Used By:** RedemptionCalculator, MobileRedemptionCalc
**Import:** `import { redemptionCalcData } from '@/data/calc-types'`

#### 3. feeworth-calc-data.json
**Location:** `/src/data/feeworth-calc-data.json` (531 KB - largest)

**Structure:**
```json
{
  "_meta": { ... },
  "hdfc-infinia-metal": {
    "id": "...",
    "annualFee": 14999,
    "joiningFee": 14999,
    "feeWaivedOn": 300000,
    "renewalBenefitValue": 5000,
    "baseRate": 2.5,
    "categories": { ... },
    "milestones": [
      {
        "spend": 300000,
        "benefit": "₹5000 credit",
        "value": 5000,
        "period": "Annual"
      },
      ...
    ],
    "lounge": {
      "domesticVisits": "Unlimited",
      "domesticUnlimited": true,
      "intlVisits": "Unlimited",
      "intlUnlimited": true,
      "programs": [ ... ],
      "spendRequired": null
    },
    "golf": {
      "included": true,
      "text": "2 rounds/year"
    },
    "memberships": [
      {
        "name": "Amazon Prime",
        "type": "shopping",
        "value": 1500
      }
    ],
    ...
  },
  ...
}
```

**Entries:** 150+ cards
**Keys Used By:** FeeWorthCalculator, MobileFeeWorthCalc
**Import:** `import { feeworthCalcData } from '@/data/calc-types'`

### TypeScript Data Files

#### cards.ts
**Location:** `/src/data/cards.ts`

**Exports:**
```typescript
export interface CreditCard {
  id: string
  name: string
  issuer: string
  bank: string
  type: string
  image: string
  color: string
  variant: string
}

export const cards: CreditCard[] = [...]
```

**Used By:** All calculators for card lookup, search, image display

#### card-v3-data.ts
**Location:** `/src/data/card-v3-data.ts` (296 KB)

**Comprehensive card data including:**
- Full feature sets (lounge, golf, dining, memberships)
- Reward categories with rates
- Fee structure
- Insurance details
- Milestone bonuses

**Used By:** FeeWorthCalculator (perk detection fallback)

#### reward-currencies.ts
**Location:** `/src/data/reward-currencies.ts`

**Provides:**
- Point currency definitions
- Mapping of card ID → currency metadata
- Conversion rates if available

**Used By:** Calculators for reward naming

---

## CALCULATION ALGORITHMS

### Rewards Calculation

**Input:**
- Card (RewardsCalcCard)
- Monthly spending by category (Record<string, number>)
- Card ID (for exclusion check)

**Process:**
```
For each category:
  1. Get monthly spend from input
  2. Look up category rate from card.categories[v3Key]
  3. If no match, use card.categories.base
  4. Check if category excluded via exclusions-registry
  5. If excluded or rate = 0:
     earnings[category] = { rate: 0, value: 0, excluded: true }
     SKIP to next
  6. effectiveRate = category.rate / 100
  7. monthlyValue = spend * effectiveRate
  8. If category.cap && category.capPeriod = "Monthly":
     IF monthlyValue > cap * pointValue:
       cappedValue = cap * pointValue / effectiveRate
       baseValue = (spend - cappedValue) * (baseRate / 100)
       monthlyValue = cappedValue * effectiveRate + baseValue
       capped = true
  9. monthlyPoints = monthlyValue / pointValue
  10. Store earnings[category] with all details

Return:
  totalMonthlyValue = sum of all monthlyValue
  totalAnnualValue = totalMonthlyValue * 12
  totalMonthlyPoints = totalMonthlyValue / pointValue
  totalAnnualPoints = totalMonthlyPoints * 12
```

**Output:** CalcResult with per-category breakdown and totals

### Fee Worth Calculation

**Input:**
- Card (FeeWorthCalcCard or CardV3)
- Monthly spend (₹)
- Perk toggles (lounge enabled, golf games, etc.)

**Process:**
```
1. annualSpend = monthlySpend * 12

2. BASE REWARDS
   baseRewards = annualSpend * (baseRate / 100) * pointValue

3. PORTAL BONUS (if enabled)
   portalSpend = monthlySpend * 0.2 (20% of spending)
   portalSpend12 = portalSpend * 12
   avgPortalRate = portal.merchants.avg(rate)
   portalBonus = portalSpend12 * (avgPortalRate / 100) * pointValue
   baseonPortal = portalSpend12 * (baseRate / 100) * pointValue
   portalBonus = max(0, portalBonus - baseOnPortal)

4. RENEWAL BENEFIT
   renewalBonus = card.renewalBenefitValue

5. MILESTONE BONUSES
   for each milestone in card.milestones:
     if annualSpend >= milestone.spend:
       milestoneValue += milestone.value

6. PERKS VALUE
   loungeValue = 0
   if card.lounge has visits:
     domesticVisits = parseLoungeVisits(card.lounge.domesticVisits)
     intlVisits = parseLoungeVisits(card.lounge.intlVisits)
     loungeValue = (domesticVisits + intlVisits) * LOUNGE_VALUE_PER_VISIT
   golfValue = 0
   if card.golf.included:
     golfValue = card.golf.text parsed for games * GOLF_VALUE_PER_GAME
   membershipValue = sum(card.memberships[].value)
   perksValue = loungeValue + golfValue + membershipValue

7. TOTAL VALUE
   totalValue = baseRewards + portalBonus + renewalBonus + milestoneValue + perksValue

8. FEE WAIVER CHECK
   if card.feeWaivedOn && annualSpend >= card.feeWaivedOn:
     effectiveFee = 0
   else:
     effectiveFee = card.annualFee

9. NET VALUE & ROI
   netValue = totalValue - effectiveFee
   roi = totalValue / effectiveFee (or "∞" if fee=0)

10. VERDICT
    if netValue > 0 && totalValue > fee * 3:
      verdict = "excellent"
    else if netValue > 0:
      verdict = "worth"
    else if netValue >= -(fee * 0.2):
      verdict = "borderline"
    else:
      verdict = "not-worth"

11. BREAK-EVEN ANALYSIS
    monthlyEarningRate = (baseRate / 100) * pointValue
    breakEvenMonthly = annualFee / (monthlyEarningRate * 12)
    breakEvenWithPerks = max(0, annualFee - perksValue - renewalBonus) / (monthlyEarningRate * 12)

12. CHART DATA
    For spend levels [10K, 20K, 30K, 50K, 75K, 100K, 150K, 200K, 300K, 500K]:
      Calculate net value at each level
      Store as { spend, netValue }
```

**Output:** FeeAnalysis with breakdown, verdict, and chart data

### Redemption Calculation

**Input:**
- Card (RedemptionCalcCard)
- Points amount (number)

**Process:**
```
For each option in card.options:
  1. value = points * option.value (₹)
  2. meetsMin = !option.minPoints || points >= option.minPoints
  3. If !meetsMin: gray out, show min requirement
  4. If option.fee: subtract fee from value

For each transferPartner in card.transferPartners:
  1. Parse ratio string (e.g., "2:1") → [from, to]
  2. milesReceived = points * to / from
  3. partnerValue = milesReceived (no ₹ conversion shown)
  4. Display "2:1" and miles count

Sort options by value (descending)
Highlight first (best) option with green badge
```

**Output:** RedemptionOption[] with computed values, sorted

---

## SUMMARY TABLE

| File | Type | Lines | Purpose |
|---|---|---|---|
| **PAGES** | | | |
| RewardsCalculator.tsx | Page | 1,090 | Desktop rewards calculator |
| FeeWorthCalculator.tsx | Page | 1,931 | Desktop fee worth calculator |
| RedemptionCalculator.tsx | Page | 750 | Desktop redemption calculator |
| **MOBILE COMPONENTS** | | | |
| MobileRewardsCalc.tsx | Component | 773 | Mobile rewards calculator |
| MobileFeeWorthCalc.tsx | Component | 895 | Mobile fee worth calculator |
| MobileRedemptionCalc.tsx | Component | 613 | Mobile redemption calculator |
| **TYPE DEFINITIONS** | | | |
| calc-types.ts | TS | 187 | All calculator interfaces + data imports |
| **DATA FILES** | | | |
| rewards-calc-data.json | JSON | 314KB | 150+ cards × reward categories |
| redemption-calc-data.json | JSON | 139KB | 150+ cards × redemption options |
| feeworth-calc-data.json | JSON | 531KB | 150+ cards × fee/perks details |
| category-config.ts | TS | 164 | 12 spend categories + helpers |
| spending-presets.ts | TS | 154 | 3 quick presets + 5 personas |
| exclusions-registry.ts | TS | 200+ | Reward exclusion types + lookup |
| lounge-programs.ts | TS | 300+ | Lounge networks + card access |
| transfer-partners.ts | TS | 300+ | Loyalty programs + ratios |
| reward-currencies.ts | TS | ? | Point value mappings |
| cards.ts | TS | ? | Base card list + metadata |
| card-v3-data.ts | TS | 296KB | Full card feature data |
| **UTILITIES** | | | |
| lib/fee-utils.ts | TS | 133 | Fee analysis engine |
| lib/utils.ts | TS | ? | General utilities (cn) |
| lib/card-display.ts | TS | ? | Card display helpers |
| **HOOKS** | | | |
| use-mobile.tsx | Hook | 23 | Responsive breakpoint detection |

---

## KEY DEPENDENCIES

```
PAGES
├─ React Router (useSearchParams, Link)
├─ Framer Motion (motion, AnimatePresence)
├─ Lucide React (icons: Search, X, ChevronDown, etc.)
├─ Recharts (AreaChart, Tooltip) — FeeWorth only
├─ Sonner (toast notifications)
├─ shadcn/ui components (Slider, Switch, Tooltip, etc.)
└─ Custom hooks/utils
   ├─ useIsMobile()
   ├─ useCardsV3() — FeeWorth only
   ├─ useMobile() — deprecated name for useIsMobile?
   └─ lib/fee-utils.ts

COMPONENTS
├─ PageLayout
├─ SEO
├─ CardImage
├─ MobileSection
└─ UI components (same as pages)

DATA FILES
├─ calc-types.ts (centralized types + imports)
├─ cards.ts (credit card definitions)
├─ category-config.ts (spend categories)
├─ spending-presets.ts (preset profiles)
├─ exclusions-registry.ts (reward exclusions)
├─ lounge-programs.ts (lounge network data)
├─ transfer-partners.ts (loyalty program data)
├─ card-v3-data.ts (detailed card data) — optional fallback
└─ reward-currencies.ts (point values)
```

---

## GENERATION & MAINTENANCE

### How Data Files Are Generated

**Script:** `scripts/generate-calc-data.ts` (not included in this mapping)

**Inputs:**
- card-v3-data.ts (master source)
- Card-specific enrichment files
- Manual overrides

**Process:**
1. Read all 150+ cards from master data
2. Extract calculator-relevant fields
3. Transform into calc-types.ts interfaces
4. Generate JSON files for bundling
5. Inject `_meta` warning

**Regenerate With:**
```bash
npm run generate:calc
```

### What NOT To Do

- **DO NOT EDIT** rewards-calc-data.json, redemption-calc-data.json, feeworth-calc-data.json
- **DO NOT** add new cards directly to these JSON files
- Regenerate from source card data instead

### Adding a New Card to Calculators

1. Add card to card-v3-data.ts with complete fields
2. Run `npm run generate:calc`
3. Data automatically flows into all three calculators
4. New card appears in searches immediately

---

## KNOWN VARIATIONS & QUIRKS

1. **Lounge Value Parsing:**
   - "Unlimited" → capped at 12 visits (conservative estimate)
   - "8" → 8 visits
   - "0" or "None" → 0 visits

2. **Point Value Units:**
   - Rewards: ₹ per point (0.3-1.0 typical)
   - Fee Worth: Same units (for consistency)
   - Redemption: Points directly (no ₹ conversion for miles transfers)

3. **Portal Bonus:**
   - Only available in Rewards calculator (not in Fee Worth)
   - Assumes 20% of spending on portal
   - Uses first portal's merchant average rate

4. **Cap Handling:**
   - Only "Monthly" caps are enforced
   - Excess above cap reverts to base rate
   - "Quarterly" or "Annual" caps in data but not computed

5. **Devaluation Warnings:**
   - Hardcoded for HDFC Infinia, HDFC Diners Black
   - Should be moved to data file

6. **Mobile Calculation Duplication:**
   - MobileRewardsCalc copies full logic from RewardsCalculator
   - Risk of divergence if one is updated without the other
   - Consider extracting to shared function in future

7. **Exclusions Registry:**
   - Uses `isExcluded(cardId, category)` function
   - Falls back to string matching on category names
   - Regex patterns for fuel (includes "fuel" in exclusion text)

---

## TESTING CONSIDERATIONS

### Unit Tests Should Cover

1. **Category Rate Calculation:**
   - Basic: spend * rate / 100
   - With cap: capped amount earns at capped rate, excess at base rate
   - Excluded categories: earn zero

2. **Perk Value Estimation:**
   - Lounge: visits * lounge_value_per_visit
   - Golf: games * golf_value_per_game
   - Membership: sum of membership values

3. **Fee Waiver Logic:**
   - If spend >= waiverThreshold: effective fee = 0
   - Break-even: fee / (monthly earning rate * 12)

4. **Redemption Options:**
   - Each option: points * option.value
   - Min points enforcement
   - Sorting by value

### Integration Tests Should Cover

1. **Multi-card Comparison:** Results for 2+ cards match individual calculations
2. **Preset Application:** Selecting preset fills spending fields correctly
3. **Mobile Responsive:** Desktop/mobile switch preserves calculations
4. **Data Loading:** All cards load without errors from JSON

---

END OF DOCUMENT
