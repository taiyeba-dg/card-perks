# MyCards Section - Complete Architecture & Data Flow Mapping

## Overview
The MyCards section is a comprehensive wallet management system for tracking credit cards, expenses, rewards, and milestones. It's built with responsive mobile/desktop layouts and uses localStorage for persistence.

---

## 1. PAGE ENTRY POINTS

### Main Pages
| File | Purpose | Route |
|------|---------|-------|
| `/src/pages/MyCardsPage.tsx` | Entry point (wraps MyCardsNew with PageLayout & SEO) | `/my-cards` |
| `/src/pages/MyCardsNew.tsx` | Primary dashboard component with all core logic | `/my-cards` (same) |
| `/src/components/my-cards/MyCardsRouter.tsx` | Router wrapper (alternative entry) | - |

**Page Flow:**
```
MyCardsPage.tsx
  → wraps MyCardsNew.tsx
    → renders tabs/sections based on state
```

---

## 2. COMPONENT ARCHITECTURE

### Top-Level Layout Components
| Component | File | Purpose | Responsiveness |
|-----------|------|---------|-----------------|
| **MyCardsDesktop** | `/src/components/my-cards/MyCardsDesktop.tsx` (33.8 KB) | Full-featured desktop layout with tabs, charts, expense tracking | Desktop only |
| **MyCardsMobile** | `/src/components/my-cards/MyCardsMobile.tsx` (23.7 KB) | Mobile-optimized version with carousels & compact views | Mobile only |
| **DesktopMyCardsLayout** | `/src/components/my-cards/DesktopMyCardsLayout.tsx` (38.3 KB) | Alternative desktop layout component (hero, wallet summary, tabs) | Desktop |
| **MobileMyCardsLayout** | `/src/components/my-cards/MobileMyCardsLayout.tsx` (22 KB) | Alternative mobile layout (compact hero, horizontal stats) | Mobile |
| **MyWalletDashboard** | `/src/components/my-cards/MyWalletDashboard.tsx` (47.8 KB) | Legacy/alternative dashboard (wallet summary view) | Both |

**Current Implementation Uses:**
- Primary: `MyCardsNew.tsx` (in pages/) combines both desktop & mobile logic inline
- Fallback layouts: Desktop/Mobile layout components available as alternatives

---

## 3. TAB/SECTION STRUCTURE

### MyCardsNew.tsx Tabs (Inline)
The main dashboard has multiple sections rendered conditionally based on state:

1. **Portfolio Overview**
   - Annual Fees (total across all cards)
   - Rewards Earned (total from all expenses)
   - Net Value (rewards - fees)
   - Efficiency % (vs best possible rate)

2. **Spending Breakdown**
   - Pie chart by category
   - Category spending totals
   - Reward earned per category

3. **Card Rewards Distribution**
   - Pie chart showing reward contribution by card
   - Card-specific reward earnings

4. **Daily/Monthly Trend**
   - Area chart showing spend & reward trends by date/day
   - Toggleable between spend and reward view (chartMode state)

5. **Expense Tracker**
   - Grouped by date (grouped state)
   - Filterable by card (selCard state)
   - Add/delete expense functionality
   - Flash notification on expense add

6. **Card Management**
   - Add cards dialog (AddCardsDialog component)
   - Card visual selector (CreditCardVisual component)
   - Remove cards via toggle
   - Card detail view (linked to CardDetail page)

---

## 4. DATA HOOKS & STATE MANAGEMENT

### Core Hooks Used

#### `useMyCards()` → `/src/hooks/use-my-cards.ts`
**Interface:**
```typescript
{
  myCardObjects: [
    { cardId, card, v3, addedDate, monthlySpend, currentPoints, annualSpendSoFar }
  ],
  toggle: (id: string) => void,
  has: (id: string) => boolean,
  count: number,
  updateCardData: (cardId, {monthlySpend?, currentPoints?, annualSpendSoFar?}) => void,
  setTotalMonthlySpend: (spend: number | null) => void,
  primaryCard: CardEntry | null,
  estimatedAnnualValue: number,
  feeWaiverStatus: [{cardId, cardName, threshold, spent, onTrack, progress}],
  bannerDismissed, dismissBanner,
  onboardingShown, markOnboardingShown,
}
```

**Storage Key:** `cardperks_my_cards`
**Data Shape:**
```typescript
MyCardsState = {
  cards: MyCardEntry[],        // user's selected cards
  totalMonthlySpend: number | null,
  lastUpdated: string (ISO)
}
```

#### `useExpenses()` → `/src/hooks/use-expenses.ts`
**Interface:**
```typescript
{
  expenses: Expense[],
  addExpense: (Omit<Expense, "id">) => void,
  deleteExpense: (id: string) => void,
  getByCard: (cardId: string) => Expense[],
  totalByCard: (cardId: string) => number,
  CATEGORIES: [{value, label}]
}
```

**Storage Key:** `cardperks_expenses`
**Expense Shape:**
```typescript
Expense = {
  id: string (uuid),
  cardId: string,
  date: string (YYYY-MM-DD),
  merchant: string,
  amount: number,
  category: string,    // 'shopping', 'food', 'travel', 'fuel', etc.
  note: string
}
```

### Sub-Components & Hooks
- **CardAnalytics** (`/src/components/my-cards/CardAnalytics.tsx`)
  - Displays portfolio analytics or card-specific detail panel
  - Uses card V3 enrichment for rate extraction

- **MilestoneTracker** (`/src/components/my-cards/MilestoneTracker.tsx`)
  - `CardTracker`: Tracks spend toward milestones & fee waivers
  - `WalletSummary`: Portfolio-level summary
  - Storage key: `cardperks_tracker_spend`

- **AddCardsDialog** (`/src/components/my-cards/AddCardsDialog.tsx`)
  - Search & select cards from full catalog
  - Groups by issuer

---

## 5. DATA FILES REFERENCED

### Card Catalog
| File | Purpose | Exports |
|------|---------|---------|
| `/src/data/cards.ts` | Legacy card interface + computed view | `CreditCard[]`, `getCardById()` |
| `/src/data/card-v3-master.ts` | Single source of truth (merged metadata + enrichment) | `CardV3Master`, `getMasterCard()`, `getAllMasterCards()` |
| `/src/data/cards-v3-index.ts` | Basic card metadata (id, name, bank, tier, color, image) | `CARDS_V3_INDEX: CardV3IndexEntry[]` |
| `/src/data/card-v3-data.ts` | Enriched reward/redemption/fee data for ~10 key cards | `cardV3Data: Record<cardId, CardV3Data>` |
| `/src/data/card-v3-types.ts` | Type definitions for V3 enrichment | `CardV3Data`, `CategoryRate`, `RewardPortal`, etc. |

### Category & Config
| File | Purpose | Key Exports |
|------|---------|-------------|
| `/src/data/category-config.ts` | Centralized category metadata (icons, colors, V3 mappings) | `CATEGORIES`, `CATEGORY_ICONS`, `CATEGORY_COLORS`, `USER_SPEND_TO_V3` |
| `/src/data/color-schemes.ts` | Palette definitions for charts | `PIE_COLORS`, `DONUT_COLORS` |
| `/src/data/reward-currencies.ts` | Point currency definitions | `getCurrencyByName()` |

### Utilities & Helpers
| File | Purpose |
|------|---------|
| `/src/lib/fee-utils.ts` | Fee analysis (`analyzeFee()`, `formatCur()`) |
| `/src/lib/tier-config.ts` | Card tier definitions & styling |
| `/src/lib/sounds.ts` | Sound effects (`playSound()`) |
| `/src/lib/haptics.ts` | Haptic feedback |

---

## 6. DATA SHAPES & INTERFACES

### MyCardEntry (from useMyCards hook)
```typescript
{
  cardId: string,              // unique card ID
  addedDate: string,           // ISO date when added to wallet
  monthlySpend: number | null, // user-estimated monthly spending
  currentPoints: number | null,
  annualSpendSoFar: number | null,
}
```

### Enriched Card (myCardObjects)
```typescript
{
  ...MyCardEntry,
  card: CreditCard,            // legacy card interface
  v3: CardV3Data | undefined,  // enrichment (rewards, fees, etc.)
}
```

### CardV3Data (enrichment structure)
```typescript
{
  categories: {
    [key: string]: {           // e.g., "dining", "travel", "grocery"
      label: string,           // "5 RP per ₹150"
      rate: number,            // effective % (e.g., 3.3)
      cap: number | null,
      capPeriod: "Monthly" | "Quarterly" | "Annual" | "Per Txn" | null,
      minTxn: number | null,
      note: string | null
    }
  },
  baseRate: number,            // default earning rate %
  fees: {
    annual: number,
    renewal: number,
    waivedOn: number | null,   // spending threshold for waiver
    renewalBenefitValue: number
  },
  milestones: [{ spend, benefit, benefitValue }],
  redemption: {
    type: "points" | "cashback",
    pointCurrency: string,     // e.g., "Reward Points"
    baseValue: number,         // best ₹ per point
    bestOption: string,
    options: [{ type, value, processingTime, fee, minPoints }],
    transferPartners: [{ name, type, ratio, ratioNumeric, minPoints, transferTime, fee }]
  },
  portals: [{ name, url, merchants, cap, pointValueLabel, note }],
  exclusions: [{ category, mccCodes?, note }],
  upgradePath: [{ cardId, cardName, condition }],
  upgradeFromId: string | null,
  upgradeToId: string | null,
  applyLink: string | null,
  specialOffers: [{ title, description, category, validFrom, validTo }],
  relatedCardIds: string[]
}
```

### Expense
```typescript
{
  id: string,                  // crypto.randomUUID()
  cardId: string,              // which card was used
  date: string,                // YYYY-MM-DD
  merchant: string,            // description or merchant name
  amount: number,              // in ₹
  category: string,            // 'dining', 'travel', 'fuel', etc.
  note: string                 // optional user note
}
```

---

## 7. COMPONENT TREE (MyCardsNew.tsx Flow)

```
MyCardsPage
└── MyCardsNew (main component)
    ├── [Mobile Header] (isMobile && <h1>My Wallet</h1> + card count)
    ├── [Sidebar] (!isMobile)
    │   ├── Mini stats (cards count, total fees, earned rewards)
    │   ├── Card visuals (CreditCardVisual x N) [clickable for filter]
    │   ├── + Add Card button [opens Dialog]
    │   └── Clear filter button (if selCard active)
    │
    ├── [Main Content] (flex-1)
    │   ├── [Mobile Card Strip] (isMobile)
    │   │   └── Horizontal scroll of CreditCardVisual components
    │   │
    │   ├── Portfolio Overview (4-column grid)
    │   │   ├── Annual Fees stat
    │   │   ├── Rewards Earned stat
    │   │   ├── Net Value stat
    │   │   └── Efficiency % stat
    │   │
    │   ├── Charts Section (2 columns on desktop)
    │   │   ├── Pie chart (category breakdown / card rewards distribution)
    │   │   │   └── Toggle: [Category Breakdown] [Card Rewards]
    │   │   └── Area chart (daily/monthly trend)
    │   │       └── Toggle: [Spend] [Rewards]
    │   │
    │   ├── Tabs/Sections (toggleable)
    │   │   ├── Rewards Analysis (if selected card or data > 0)
    │   │   ├── Best Cards (per category)
    │   │   └── Expense History
    │   │
    │   ├── Add Expense Form
    │   │   ├── Amount input
    │   │   ├── Category select (CATS array)
    │   │   ├── Card select (dropdown)
    │   │   ├── Note input
    │   │   ├── Date input
    │   │   └── [Add] button → hookAddExpense() + playSound() + flash notification
    │   │
    │   ├── Expense List (grouped by date)
    │   │   └── Expense item
    │   │       ├── Merchant name
    │   │       ├── Amount
    │   │       ├── Reward earned
    │   │       ├── Category icon
    │   │       └── [Delete] button
    │   │
    │   └── Flash Notification
    │       └── Shows reward earned + missed reward opportunity
    │
    ├── Add Card Dialog (modal)
    │   └── AddCardsDialog component
    │       ├── Search input
    │       └── Cards list (grouped by issuer)
    │
    └── [Computed Data]
        ├── filtered: Expense[] (by selCard)
        ├── grouped: [date, Expense[]][] (sorted newest first)
        ├── totalFees, totalSpent, totalReward
        ├── catData: {name, value, reward, color, icon}[]
        ├── cardRewardData: {name, value, fill}[]
        └── dailyData: {day, spend, reward}[]
```

---

## 8. RESPONSIVE BEHAVIOR

### Desktop (≥900px)
- Sidebar navigation (300px fixed, sticky)
- Main content area with cards in grid layout
- Full-width charts
- 4-column portfolio stats

### Mobile (<900px)
- Horizontal card carousel (70% width, scroll-snap)
- Inline hero header
- Horizontal scrolling stats
- 2-column portfolio stats
- Stacked layout

**Breakpoint Code:**
```typescript
const isMobile = window.innerWidth < 900;
```

---

## 9. SHARED SUB-COMPONENTS

### CreditCardVisual
- **Props:** `{ card, isActive, onClick, compact }`
- **Purpose:** Visual card representation with bank theme gradient
- **Used in:** Sidebar, mobile carousel, card selector

### CustomTooltip (Recharts)
- **Props:** `{ active, payload, label, formatter }`
- **Purpose:** Chart hover tooltip with glassmorphism styling

### AnimNum
- **Props:** `{ value, prefix }`
- **Purpose:** Animated number counter for stat cards

### AddCardsDialog
- **Props:** `{ isMyCard, toggleMyCard }`
- **Purpose:** Modal to search & add cards to wallet

---

## 10. RELATED PAGES & COMPARISONS

### Card Detail View
- **File:** `/src/pages/CardDetail.tsx`
- **Purpose:** Full card details, rewards breakdown, eligibility, upgrades
- **Linked from:** "View Details" button on each card in MyCards

### Compare Cards
- **File:** `/src/pages/CompareCards.tsx`
- **Purpose:** Side-by-side card comparison
- **Tabs:** Overview, Rewards, Redemption, Lounge, Features, Fees, Verdict
- **Linked from:** "Compare" button in MyCards or from card detail

### Card Finder
- **File:** `/src/pages/FindMyCard.tsx`
- **Purpose:** Interactive wizard to find best card
- **Linked from:** "Find your card" CTA in app

---

## 11. STYLING & THEMING

### Colors (from MyCardsNew.tsx)
```typescript
const C = {
  bg: "#06060b",              // main background
  bg1: "#0d0d14",
  bg2: "#13131c",
  bg3: "#1a1a26",
  bgHov: "#1f1f2e",
  gold: "#c9a84c",            // primary accent
  goldL: "#e8d5a0",
  goldLL: "#f5ecd2",
  goldDim: "rgba(201,168,76,0.12)",
  goldBorder: "rgba(201,168,76,0.10)",
  goldGlow: "rgba(201,168,76,0.06)",
  text: "#ececec",
  textS: "#8e8e9e",           // secondary text
  textM: "#55556a",           // muted text
  green: "#5eead4",           // positive (rewards)
  greenD: "rgba(94,234,212,0.10)",
  red: "#fb7185",             // negative (missed reward)
  redD: "rgba(251,113,133,0.10)",
  amber: "#fcd34d",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Outfit', system-ui, sans-serif",
}
```

### Bank Themes
- BANK_THEME object maps issuer names to gradients & accent colors
- Applied to CreditCardVisual components
- ~20 banks configured (AmEx, HDFC, ICICI, Axis, SBI, etc.)

### CSS File
- `/src/components/my-cards/my-cards.css` (39 KB)
- Contains animations, layout utilities, custom styles

---

## 12. STATE MANAGEMENT FLOW

### LocalStorage Keys
```
cardperks_my_cards          → MyCardEntry[] + metadata
cardperks_expenses          → Expense[]
cardperks_tracker_spend     → {[cardId]: {monthlySpend, annualSpendSoFar, pointsBalance}}
cardperks_banner_dismissed  → boolean
cardperks_onboarding_shown  → boolean
```

### State Updates
```
User adds card
  → useMyCards().toggle(cardId)
    → setState() → localStorage.setItem()

User logs expense
  → MyCardsNew.addExpense()
    → useExpenses().addExpense()
      → setState() → localStorage.setItem()
      → recalculate rewards in useMemo

User updates monthly spend
  → MilestoneTracker.updateField()
    → loadSpendData() → saveSpendData()
```

---

## 13. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ useMyCards (MyCardEntry[])                                      │
│ ├─ myCardObjects [enriched with card + v3]                     │
│ ├─ toggle(id)                                                   │
│ └─ estimatedAnnualValue                                         │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ├─→ CARDS (array built in MyCardsNew via useMemo)
       │    ├─ id, name, bank, fee, tier, rates, image
       │    └─ rates derived from v3.categories
       │
       └─→ CreditCardVisual components
            └─ Bank theme from BANK_THEME[bank]

┌─────────────────────────────────────────────────────────────────┐
│ useExpenses (Expense[])                                          │
│ ├─ expenses []                                                   │
│ ├─ addExpense()                                                  │
│ ├─ deleteExpense()                                               │
│ └─ getByCard(cardId)                                             │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ├─→ hookExpenses (useMemo)
       │    └─ enriched with rewardEarned per expense
       │
       ├─→ filtered (by selCard)
       │
       ├─→ grouped (by date)
       │
       ├─→ catData (aggregated by category)
       │    └─ amount, reward, color, icon per category
       │
       ├─→ cardRewardData (aggregated by card)
       │    └─ reward earned per card
       │
       └─→ dailyData (aggregated by day of month)
            └─ spend, reward per day

┌─────────────────────────────────────────────────────────────────┐
│ getMasterCard(cardId) → CardV3Master                            │
│ ├─ base: CardV3IndexEntry                                       │
│ │  ├─ id, name, bank, tier, color, image, baseRate            │
│ │  └─ ...                                                       │
│ └─ enrichment: CardV3Data                                       │
│    ├─ categories {[key]: CategoryRate}                          │
│    ├─ fees {annual, waivedOn, etc.}                             │
│    ├─ redemption {type, pointCurrency, baseValue, options}      │
│    ├─ milestones [{spend, benefit, benefitValue}]               │
│    └─ portals, exclusions, upgrades, offers                     │
└─────────────────────────────────────────────────────────────────┘

        ↓ used for:
        ├─ Reward rate lookup (categories[v3Key].rate)
        ├─ Fee analysis (fees.annual, fees.waivedOn)
        ├─ Point value calculation (redemption.baseValue)
        ├─ Milestone progress tracking
        └─ Card detail enrichment
```

---

## 14. KEY HELPER FUNCTIONS (MyCardsNew.tsx)

```typescript
buildRatesFromV3(cardId)        // Extract rates per category from V3
parseFee(fee)                   // Extract numeric fee
fmtK(n)                         // Format to K/L notation (₹1.5K)
fmtN(n)                         // Format to INR locale
fmtDate(d)                      // Format ISO date to en-IN
dateLabel(d)                    // "Today" / "Yesterday" / date
getCard(id)                     // Find card in CARDS array
getCat(id)                      // Find category in CATS array
getBest(catId)                  // Find card with best rate for category
```

---

## 15. COMPARISON WITH ALTERNATIVE LAYOUTS

### MyCardsDesktop vs MyCardsNew
- **MyCardsDesktop:** Uses Recharts, separates logic into sub-components
- **MyCardsNew:** Inline logic, all rendering in one file, simpler state management
- **Current:** MyCardsNew is used as primary (in MyCardsPage.tsx)

### DesktopMyCardsLayout / MobileMyCardsLayout
- **Purpose:** Reusable layout shells (hero, tabs, filters)
- **Props:** Accept myCards, expenses, handlers as props
- **Usage:** Can be used to refactor MyCardsNew if needed
- **Current:** Not currently active (kept as reference)

---

## 16. KNOWN TABS/FEATURES IN ALTERNATIVE COMPONENTS

### MyCardsDesktop.tsx Tabs Structure
```typescript
SPEND_CATEGORIES = [
  {key: "dining", label: "Dining", icon: UtensilsCrossed},
  {key: "travel", label: "Travel", icon: Plane},
  {key: "online", label: "Online", icon: ShoppingBag},
  {key: "grocery", label: "Grocery", icon: ShoppingCart},
  {key: "fuel", label: "Fuel", icon: Fuel},
  {key: "entertainment", label: "Entertainment", icon: Tv},
]
```
- Renders category breakdown with icons
- Shows best card per category
- Charts: Pie + Area

### MyCardsMobile.tsx Features
- **Month selector** (dropdown for current card's months)
- **Best per category** table
- **Spending by category** breakdown
- **Reward efficiency** metrics

---

## 17. TOTALS & SUMMARY METRICS

### Calculated in MyCardsNew

| Metric | Formula | Usage |
|--------|---------|-------|
| `totalFees` | sum of card.fee | Portfolio stat card |
| `totalSpent` | sum of expense.amount | Portfolio stat card, chart data |
| `totalReward` | sum of expense.rewardEarned | Portfolio stat card, metrics |
| `net` | totalReward - totalFees | Show profit/loss |
| `eff` (efficiency %) | (totalReward / maxReward) * 100 | Show % of optimal rewards |
| `maxReward` | sum of (expense.amount * bestCard.rate / 100) | Benchmark for efficiency |
| `avgRate` | sum(baseRate) / cardCount | Average earning rate |
| `estimatedAnnualValue` | from useMyCards hook | Projected annual value |

---

## 18. COMPLETE FILE INVENTORY

```
/src/pages/
├── MyCardsPage.tsx              (362 bytes) - Entry point wrapper
├── MyCardsNew.tsx               (56.6 KB)   - Primary implementation
├── CardDetail.tsx               (22.8 KB)   - Card detail view
└── CompareCards.tsx             (17.5 KB)   - Compare tool

/src/components/my-cards/
├── MyCardsDesktop.tsx           (33.8 KB)   - Desktop variant
├── MyCardsMobile.tsx            (23.7 KB)   - Mobile variant
├── DesktopMyCardsLayout.tsx     (38.3 KB)   - Layout component
├── MobileMyCardsLayout.tsx      (22 KB)     - Layout component
├── MyWalletDashboard.tsx        (47.8 KB)   - Alternative dashboard
├── MyCardsRouter.tsx            (391 bytes) - Router wrapper
├── CardAnalytics.tsx            (8.8 KB)   - Analytics display
├── MilestoneTracker.tsx         (20.1 KB)   - Milestone & spend tracking
├── CardStack.tsx                (4.2 KB)   - Card carousel component
├── AddCardsDialog.tsx           (4.7 KB)   - Add cards modal
├── my-cards.css                 (39 KB)    - Styling

/src/hooks/
├── use-my-cards.ts              - Card wallet state
├── use-expenses.ts              - Expense tracking state
├── use-favorites.ts             - Favoriting
├── use-recently-viewed.ts       - History
├── use-cards-v3.ts              - V3 data fetching
└── ... (other utilities)

/src/data/
├── cards.ts                     - Card interface + computed list
├── card-v3-master.ts            - Merged card + enrichment
├── cards-v3-index.ts            - Basic card metadata
├── card-v3-data.ts              - Enrichment for ~10 key cards
├── card-v3-types.ts             - Type definitions
├── category-config.ts           - Category centralization
├── color-schemes.ts             - Chart colors
├── reward-currencies.ts         - Point currency definitions
├── card-v3-rating.ts            - Rating calculation
└── ... (other data)
```

---

## 19. SUMMARY

### MyCards is:
- **Multi-faceted wallet tracker** with spending, rewards, and milestone tracking
- **Fully responsive** (desktop sidebar + mobile carousel)
- **LocalStorage-backed** for data persistence
- **Chart-heavy** (Recharts for visualizations)
- **V3-enriched** (uses detailed reward/fee/redemption data)
- **Accessible** with semantic HTML and aria labels
- **Sound & haptic enabled** for feedback

### Key Data Flows:
1. User selects card → displayed in sidebar/carousel
2. User logs expense → enriched with reward calculation → stored
3. Charts auto-compute from expenses (aggregated by category, card, date)
4. Card V3 enrichment provides category rates, fee thresholds, milestones
5. All data persisted to localStorage, synced on state change

### Main Dependencies:
- React hooks (useState, useMemo, useCallback, useEffect)
- Recharts (charts)
- Framer Motion (animations)
- Lucide React (icons)
- shadcn/ui (components)
- React Router (navigation)

