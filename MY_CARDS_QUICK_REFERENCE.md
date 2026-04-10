# MyCards Section - Quick Reference Guide

## File Locations Cheat Sheet

### Pages (Entry Points)
```
/src/pages/MyCardsPage.tsx          → Wrapper with PageLayout & SEO
/src/pages/MyCardsNew.tsx           → PRIMARY IMPLEMENTATION (56.6 KB)
/src/pages/CardDetail.tsx           → Individual card details page
/src/pages/CompareCards.tsx         → Card comparison tool
```

### Components
```
/src/components/my-cards/MyCardsDesktop.tsx          → Desktop variant
/src/components/my-cards/MyCardsMobile.tsx           → Mobile variant
/src/components/my-cards/DesktopMyCardsLayout.tsx    → Layout template
/src/components/my-cards/MobileMyCardsLayout.tsx     → Layout template
/src/components/my-cards/MyWalletDashboard.tsx       → Dashboard alternative
/src/components/my-cards/CardAnalytics.tsx           → Analytics panel
/src/components/my-cards/MilestoneTracker.tsx        → Milestone/spend tracker
/src/components/my-cards/AddCardsDialog.tsx          → Card selection modal
/src/components/my-cards/CardStack.tsx               → Card carousel
/src/components/my-cards/my-cards.css                → Component styles (39 KB)
```

### Hooks
```
/src/hooks/use-my-cards.ts          → useMyCards() - wallet state
/src/hooks/use-expenses.ts          → useExpenses() - expense tracking
/src/hooks/use-favorites.ts         → useFavorites() - favorites
/src/hooks/use-cards-v3.ts          → useCardsV3() - V3 data
```

### Data Files
```
/src/data/cards.ts                  → Card interface & computed list
/src/data/card-v3-master.ts         → Merged card + enrichment (SSoT)
/src/data/card-v3-types.ts          → Type definitions
/src/data/category-config.ts        → Centralized categories
/src/data/color-schemes.ts          → Chart colors
/src/data/reward-currencies.ts      → Point currencies
```

---

## Core Data Structures

### MyCardEntry
```typescript
{
  cardId: string,
  addedDate: string,           // ISO
  monthlySpend: number | null,
  currentPoints: number | null,
  annualSpendSoFar: number | null
}
```

### Expense
```typescript
{
  id: string,                  // uuid
  cardId: string,
  date: string,                // YYYY-MM-DD
  merchant: string,
  amount: number,              // in ₹
  category: string,            // 'dining', 'travel', etc.
  note: string
}
```

### CardV3Data (Enrichment)
```typescript
{
  categories: Record<string, {
    label: string,
    rate: number,              // % earning
    cap: number | null,
    capPeriod: string | null,
    minTxn: number | null,
    note: string | null
  }>,
  baseRate: number,
  fees: {
    annual: number,
    waivedOn: number | null,   // spend threshold
    renewalBenefitValue: number
  },
  milestones: {spend, benefit, benefitValue}[],
  redemption: {
    type: "points" | "cashback",
    pointCurrency: string,
    baseValue: number,         // best ₹/point
    options: [{type, value, processingTime, fee, minPoints}]
  },
  portals: [{name, url, merchants, cap, pointValueLabel}],
  // ... more fields
}
```

---

## Hook APIs

### useMyCards()
```typescript
{
  // State
  state: MyCardsState,
  myCardObjects: (MyCardEntry & {card, v3})[],

  // Mutations
  toggle: (cardId: string) => void,
  updateCardData: (cardId: string, data: Partial<{monthlySpend, currentPoints, annualSpendSoFar}>) => void,
  setTotalMonthlySpend: (spend: number | null) => void,
  clearAll: () => void,

  // Computed
  primaryCard: CardEntry | null,
  estimatedAnnualValue: number,
  feeWaiverStatus: [{cardId, cardName, threshold, spent, onTrack, progress}][],
  count: number,
  has: (cardId: string) => boolean,

  // UI State
  bannerDismissed: boolean,
  dismissBanner: () => void,
  onboardingShown: boolean,
  markOnboardingShown: () => void,
}
```

### useExpenses()
```typescript
{
  expenses: Expense[],
  addExpense: (expense: Omit<Expense, "id">) => void,
  deleteExpense: (id: string) => void,
  getByCard: (cardId: string) => Expense[],
  totalByCard: (cardId: string) => number,
  CATEGORIES: [{value: string, label: string}]
}
```

---

## localStorage Keys
```
cardperks_my_cards          → MyCardsState
cardperks_expenses          → Expense[]
cardperks_tracker_spend     → {[cardId]: {monthlySpend, annualSpendSoFar, pointsBalance, lastUpdated}}
cardperks_banner_dismissed  → "true" | undefined
cardperks_onboarding_shown  → "true" | undefined
```

---

## Category System

### Available Categories
```typescript
CATEGORIES = [
  {id: "dining",        displayName: "Dining",          emoji: "🍕"},
  {id: "grocery",       displayName: "Grocery",         emoji: "🛒"},
  {id: "online",        displayName: "Online Shopping", emoji: "🛍️"},
  {id: "travel",        displayName: "Travel",          emoji: "✈️"},
  {id: "fuel",          displayName: "Fuel",            emoji: "⛽"},
  {id: "entertainment", displayName: "Entertainment",   emoji: "🎬"},
  {id: "utilities",     displayName: "Utilities",       emoji: "🏠"},
  {id: "pharmacy",      displayName: "Pharmacy",        emoji: "💊"},
  // ... 4 more secondaries
]
```

### User Spend → V3 Mapping
```typescript
USER_SPEND_TO_V3 = {
  shopping: "online",
  food: "dining",
  travel: "travel",
  fuel: "fuel",
  electronics: "online",
  entertainment: "entertainment",
  bills: "utilities",
  groceries: "grocery",
  health: "base",
  others: "base",
}
```

---

## Key Computations

### Reward Calculation
```typescript
reward = amount * (categoryRate / 100)

// Example:
// amount: 5000, category: "dining", rate: 5%
// reward = 5000 * (5 / 100) = 250
```

### Fee Analysis
```typescript
feeWorthValue = (monthlySpend * (baseRate / 100) * 12) - annualFee

// If positive: card is worth it
// If negative: not enough spend to justify fee
```

### Efficiency %
```typescript
eff = (totalRewardEarned / maxPossibleReward) * 100

// maxPossibleReward = sum of best possible reward per expense
// (i.e., always using the card with highest rate for each category)
```

### Milestone Progress
```typescript
progress = (annualSpendSoFar / milestoneSpend) * 100
```

---

## Common Tasks

### Find a Card's Reward Rate for Category
```typescript
// Step 1: Get card from CARDS array
const card = CARDS.find(c => c.id === cardId);

// Step 2: Look up category rate
const rate = card.rates[category];  // e.g., 5.0 for dining on Infinia

// Or from V3 enrichment:
const v3 = getMasterCard(cardId)?.enrichment;
const categoryData = v3?.categories["dining"];
const rate = categoryData?.rate || v3?.baseRate;
```

### Calculate Rewards for an Expense
```typescript
const amount = 5000;
const category = "dining";
const cardId = "hdfc-infinia";

const card = CARDS.find(c => c.id === cardId);
const rate = card?.rates[category] || card?.rates.other || 1;
const reward = Math.round(amount * rate / 100);  // 250 if rate is 5
```

### Add a New Expense
```typescript
useExpenses().addExpense({
  cardId: "hdfc-infinia",
  date: "2026-03-31",
  merchant: "Restaurant XYZ",
  amount: 5000,
  category: "dining",
  note: "Lunch meeting"
  // id is auto-generated as uuid
});
```

### Toggle Card in Wallet
```typescript
useMyCards().toggle("hdfc-infinia");  // add if not present, remove if present
```

### Filter Expenses by Card
```typescript
const cardExpenses = useExpenses().getByCard("hdfc-infinia");
```

### Get Total Rewards Earned
```typescript
const totalRewards = expenses.reduce((sum, e) => {
  const card = CARDS.find(c => c.id === e.cardId);
  const rate = card?.rates[e.category] || 1;
  return sum + Math.round(e.amount * rate / 100);
}, 0);
```

---

## State in MyCardsNew.tsx

### Component State (useState)
| State | Type | Default | Usage |
|-------|------|---------|-------|
| selCard | string \| null | null | Filter expenses by card |
| expenses | Expense[] | [] | Local copy of hook expenses |
| showForm | boolean | false | Show/hide add expense form |
| showAddCard | boolean | false | Show/hide card selector dialog |
| amt | string | "" | Form: amount input |
| cat | string \| null | null | Form: category selection |
| payCard | string | "" | Form: which card to use |
| note | string | "" | Form: optional note |
| date | string | today | Form: transaction date |
| flash | {reward, missed, bestName, bestId, usedId} \| null | null | Notification on add |
| deleting | string \| null | null | ID of expense being deleted |
| chartMode | "spend" \| "reward" | "spend" | Area chart toggle |
| isMobile | boolean | false | Responsive breakpoint |

### Computed Data (useMemo)
| Data | Dependencies | Shape |
|------|--------------|-------|
| CARDS | [myCardObjects] | [{id, name, bank, fee, tier, rates, image, color}] |
| hookExpenses | [rawExpenses, CARDS] | [...Expense, rewardEarned] |
| filtered | [expenses, selCard] | Expense[] (sorted by date desc) |
| grouped | [filtered] | [date, Expense[]][] |
| totalFees | CARDS | number |
| totalSpent | expenses | number |
| totalReward | expenses | number |
| net | totalReward, totalFees | number |
| eff | totalReward, maxReward | number (%) |
| catData | expenses | [{name, value, reward, color, icon}] |
| cardRewardData | expenses, CARDS | [{name, value, fill}] |
| dailyData | expenses | [{day, spend, reward}] |

---

## Responsive Breakpoint

```typescript
isMobile = window.innerWidth < 900

// Desktop (≥900px)
// - Sidebar (300px, sticky)
// - Main content 4-column grid
// - Full charts

// Mobile (<900px)
// - Card carousel (70% width)
// - 2-column grid
// - Stacked layout
```

---

## Colors & Theming

### Gold Palette
```typescript
C.gold = "#c9a84c"         // primary accent
C.goldL = "#e8d5a0"        // lighter
C.goldLL = "#f5ecd2"       // lightest
C.goldDim = "rgba(...0.12)" // background tint
C.goldBorder = "rgba(...0.10)" // border
C.goldGlow = "rgba(...0.06)"   // subtle glow
```

### Text Colors
```typescript
C.text = "#ececec"         // primary text
C.textS = "#8e8e9e"        // secondary
C.textM = "#55556a"        // muted
```

### Status Colors
```typescript
C.green = "#5eead4"        // rewards (positive)
C.red = "#fb7185"          // missed rewards (negative)
C.amber = "#fcd34d"        // secondary highlight
```

### Bank-Specific Themes
```typescript
BANK_THEME = {
  "American Express": {g1: "#2a1f0a", g2: "#1a1508", accent: "#d4af37", textC: "#f5e6b8"},
  "HDFC Bank": {g1: "#0a1628", g2: "#060e1a", accent: "#2563eb", textC: "#93c5fd"},
  "ICICI Bank": {g1: "#280a0e", g2: "#1a0608", accent: "#dc2626", textC: "#fca5a5"},
  // ... ~20 banks configured
}
```

---

## Animation & Feedback

### Sound Effects
```typescript
playSound("chime")    // expense added
playSound("pop")      // card toggled, deleted
```

### Flash Notification
```typescript
{
  reward: 250,        // points/cashback earned
  missed: 50,         // could have earned with better card
  bestName: "Axis Magnus",  // name of better card
  bestId: "axis-magnus",
  usedId: "hdfc-infinia"
}

// Auto-dismisses after 4500ms
```

### Delete Animation
```typescript
// Fade out over 300ms, then actually delete from list
setDeleting(id);
setTimeout(() => hookDeleteExpense(id), 300);
setDeleting(null);
```

---

## Key Helper Functions (All in MyCardsNew)

```typescript
buildRatesFromV3(cardId)        // Extract card rates from V3 enrichment
parseFee(fee)                   // Convert "₹10,000" → 10000
fmtK(n)                         // Format to "₹1.5K" or "₹100K"
fmtN(n)                         // Format to "₹1,00,000"
fmtDate(d)                      // Format ISO to "31 Mar 2026"
dateLabel(d)                    // Return "Today" / "Yesterday" / date
getCard(id)                     // Find in CARDS array
getCat(id)                      // Find in CATS array
getBest(catId)                  // Card with highest rate for category
```

---

## Debugging Tips

### Check localStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem("cardperks_my_cards"))
JSON.parse(localStorage.getItem("cardperks_expenses"))
JSON.parse(localStorage.getItem("cardperks_tracker_spend"))
```

### Inspect Computed Values
Add to component:
```typescript
console.log("CARDS:", CARDS);
console.log("expenses:", expenses);
console.log("catData:", catData);
console.log("totalReward:", totalReward);
```

### Test Form Submission
```typescript
// Manually set form state
setAmt("5000");
setCat("dining");
setPayCard("hdfc-infinia");
setNote("test");
// Then click Add button
```

### Track State Changes
```typescript
useEffect(() => console.log("selCard changed:", selCard), [selCard]);
useEffect(() => console.log("expenses changed:", expenses.length), [expenses]);
```

---

## Common Pitfalls & Solutions

### Issue: Card rates show as 1%
**Cause:** V3 enrichment not found
**Fix:** Check `getMasterCard(cardId)?.enrichment` exists
**Fallback:** `buildRatesFromV3` returns defaults

### Issue: Expenses not persisting
**Cause:** localStorage not enabled
**Fix:** Check browser settings, private/incognito mode
**Debug:** `localStorage.setItem("test", "1")` in console

### Issue: Charts not updating
**Cause:** Stale dependency in useMemo
**Fix:** Check dependencies array matches what you're using
**Debug:** Add console.log inside useMemo

### Issue: Orphaned expenses (card deleted but expenses remain)
**Cause:** No cascading delete on card removal
**Current Behavior:** Expenses kept in localStorage
**Option:** Could add cleanup in `toggle()` function

---

## Testing Scenarios

### Scenario 1: Add a card and log spending
1. Click [+ Add Card]
2. Search and select "HDFC Infinia"
3. Fill form: ₹5000, Dining, Note: "Test"
4. Click Add
5. Check: expense appears, reward shows, charts update

### Scenario 2: Filter by card
1. Add 2 cards
2. Log expense on card 1
3. Log expense on card 2
4. Click card 1 in sidebar
5. Check: only card 1 expenses shown

### Scenario 3: Check efficiency
1. Log ₹5000 dining on Infinia (5% = ₹250)
2. Infinia is best for dining (eff = 100%)
3. Log ₹5000 travel on Infinia (4% = ₹200)
4. Another card better for travel (5% possible)
5. Check: eff < 100%

### Scenario 4: Delete expense
1. Add expense
2. Click delete
3. Check: fades out, removed from list, totals update

### Scenario 5: Mobile responsive
1. Open on desktop (900px+)
2. See sidebar, 4-column stats
3. Resize to <900px
4. See mobile header, carousel, 2-column stats

---

## Performance Notes

- **useMemo chains:** CARDS → hookExpenses → filtered/grouped/catData/cardRewardData/dailyData
- **Each recalculation:** O(n) where n = number of expenses
- **Chart rendering:** Recharts handles efficiently, no manual re-renders
- **localStorage:** Synchronous, could slow on very large datasets (1000+ expenses)
- **Optimizations:** Already in place via useMemo and proper dependencies

