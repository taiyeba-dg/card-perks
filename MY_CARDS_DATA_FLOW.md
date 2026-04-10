# MyCards Section - Detailed Data Flow & Component Interaction

## Component Hierarchy & Data Flow

### 1. Entry Point & Wrapper Chain
```
Browser Navigation: /my-cards
    ↓
MyCardsPage.tsx
    ├─ Wraps with: PageLayout, SEO
    └─ Renders: <MyCards /> (from ./MyCardsNew)
        ↓
        MyCardsNew.tsx (56.6 KB - primary implementation)
```

---

## 2. Hook Initialization & State Setup

### Phase 1: Hook Calls & State Creation
```typescript
// Inside MyCardsNew component function

const { myCardObjects, toggle, has } = useMyCards();
// Storage: cardperks_my_cards
// Returns:
//   myCardObjects: [{cardId, card, v3, addedDate, monthlySpend, ...}]
//   toggle: (cardId) => add/remove from wallet
//   has: (cardId) => check if in wallet

const { expenses, addExpense, deleteExpense } = useExpenses();
// Storage: cardperks_expenses
// Returns:
//   expenses: [{id, cardId, date, merchant, amount, category, note}]
//   addExpense: (expense) => add to list
//   deleteExpense: (id) => remove from list

// Local React state (useState)
const [selCard, setSelCard] = useState(null);           // filter by card
const [expenses, setExpenses] = useState([]);           // local copy
const [showForm, setShowForm] = useState(false);        // form visibility
const [showAddCard, setShowAddCard] = useState(false);  // dialog visibility
const [amt, setAmt] = useState("");                     // form: amount
const [cat, setCat] = useState(null);                   // form: category
const [payCard, setPayCard] = useState("");             // form: which card
const [note, setNote] = useState("");                   // form: note
const [date, setDate] = useState(new Date()...);      // form: date
const [flash, setFlash] = useState(null);              // notification
const [deleting, setDeleting] = useState(null);        // delete animation
const [chartMode, setChartMode] = useState("spend");   // chart toggle
const [isMobile, setIsMobile] = useState(false);       // responsive
```

---

## 3. Data Enrichment Pipeline (useMemo)

### Step 1: Build CARDS Array
```typescript
const CARDS = useMemo(() =>
  myCardObjects.map(obj => ({
    id: obj.cardId,
    name: obj.card.name,
    bank: obj.card.issuer,
    fee: parseFee(obj.card.fee),        // extract ₹ value
    tier: obj.card.type || "Premium",
    rates: buildRatesFromV3(obj.cardId),  // extract category rates from V3
    image: obj.card.image || null,
    color: obj.card.color || "#0D0D0D",
  }))
, [myCardObjects]);
```

**buildRatesFromV3 Function:**
```typescript
function buildRatesFromV3(cardId) {
  const v3 = getMasterCard(cardId)?.enrichment;
  if (!v3) return DEFAULT_RATES;

  const rates = {};
  for (const [catId, v3Key] of Object.entries(CAT_TO_V3)) {
    const categoryRate = v3.categories[v3Key];
    rates[catId] = categoryRate ? categoryRate.rate : v3.baseRate;
  }
  return rates;
}
```

**Output Shape:**
```typescript
CARDS = [
  {
    id: "hdfc-infinia",
    name: "HDFC Bank Infinia",
    bank: "HDFC Bank",
    fee: 10000,
    rates: {
      dining: 5.0,
      groceries: 4.0,
      fuel: 3.0,
      travel: 5.0,
      online: 2.0,
      // ...
    },
  },
  // ... more cards
]
```

---

### Step 2: Enrich Expenses with Rewards
```typescript
const hookExpenses = useMemo(() =>
  rawExpenses.map(e => {
    const card = CARDS.find(c => c.id === e.cardId);
    const rate = card?.rates[e.category] || card?.rates.other || 1;

    return {
      ...e,
      rewardEarned: Math.round(e.amount * rate / 100)
    };
  })
, [rawExpenses, CARDS]);

// Example:
// Input:  {cardId: "hdfc-infinia", category: "dining", amount: 5000}
// Rate:   5.0%
// Output: {rewardEarned: 250, ...}
```

---

### Step 3: Filter & Group Expenses
```typescript
// Filter by selected card
const filtered = useMemo(() => {
  let e = [...expenses];
  if (selCard) e = e.filter(x => x.cardId === selCard);
  return e.sort((a, b) => new Date(b.date) - new Date(a.date));
}, [expenses, selCard]);

// Group by date
const grouped = useMemo(() => {
  const m = {};
  filtered.forEach(e => {
    const k = e.date;
    if (!m[k]) m[k] = [];
    m[k].push(e);
  });
  return Object.entries(m).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}, [filtered]);

// Output: [["2026-03-31", [exp1, exp2]], ["2026-03-30", [exp3]], ...]
```

---

### Step 4: Aggregate by Category
```typescript
const catData = useMemo(() => {
  const m = {};
  expenses.forEach(e => {
    const c = getCat(e.category);
    if (!m[e.category])
      m[e.category] = {
        name: c.label,
        value: 0,
        reward: 0,
        color: c.c,
        icon: c.icon
      };
    m[e.category].value += e.amount;
    m[e.category].reward += e.rewardEarned;
  });
  return Object.values(m).sort((a, b) => b.value - a.value);
}, [expenses]);

// Output: [
//   { name: "Dining", value: 15000, reward: 750, color: "#fb923c" },
//   { name: "Travel", value: 12000, reward: 600, color: "#a78bfa" },
//   // ...
// ]
```

---

### Step 5: Aggregate by Card
```typescript
const cardRewardData = useMemo(() => {
  const m = {};
  expenses.forEach(e => {
    const c = getCard(e.cardId);
    if (!c) return;
    const theme = BANK_THEME[c.bank];
    if (!m[e.cardId])
      m[e.cardId] = {
        name: c.name.slice(0, 14) + "…",
        value: 0,
        fill: theme?.accent || C.gold
      };
    m[e.cardId].value += e.rewardEarned;
  });
  return Object.values(m).sort((a, b) => b.value - a.value);
}, [expenses]);

// Output: [
//   { name: "HDFC Infinia", value: 2500, fill: "#c9a84c" },
//   { name: "Axis Magnus", value: 1800, fill: "#c9a84c" },
// ]
```

---

### Step 6: Daily Trend Data
```typescript
const dailyData = useMemo(() => {
  const d = [];
  const daysInMonth = new Date(...).getDate();

  for (let i = 1; i <= daysInMonth; i++)
    d.push({ day: i, spend: 0, reward: 0 });

  expenses.forEach(e => {
    const day = new Date(e.date).getDate();
    if (d[day - 1]) {
      d[day - 1].spend += e.amount;
      d[day - 1].reward += e.rewardEarned;
    }
  });
  return d;
}, [expenses]);

// Output: [
//   { day: 1, spend: 0, reward: 0 },
//   { day: 2, spend: 5000, reward: 250 },
//   // ... one per calendar day
// ]
```

---

## 4. Portfolio Summary Metrics

### Totals Computation
```typescript
// All these recalculate when expenses changes
const totalFees = CARDS.reduce((s, c) => s + c.fee, 0);
// Example: 10000 + 5000 + 0 = 15000

const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
// Example: 150000

const totalReward = expenses.reduce((s, e) => s + e.rewardEarned, 0);
// Example: 5400

const net = totalReward - totalFees;
// Example: 5400 - 15000 = -9600 (negative in first year)

// Efficiency: what % of optimal rewards were earned?
const maxReward = expenses.reduce((s, e) => {
  const b = getBest(e.category);  // card with best rate for this category
  return s + (b ? e.amount * (b.rates?.[e.category] || 0) / 100 : 0);
}, 0);

const eff = maxReward > 0 ? Math.round(totalReward / maxReward * 100) : 0;
// Example: if earned 5400 but could have earned 6000: eff = 90%
```

---

## 5. User Actions & State Updates

### Action: Add Card to Wallet

```typescript
User clicks [+ Add Card] button
    ↓
setShowAddCard(true)
    ↓
Dialog opens, showing AddCardsDialog component
    ├─ Shows search input
    └─ Shows cards grouped by issuer
        ↓
User clicks card
    ↓
onClick callback: toggleMyCard(cardId)
    ↓
useMyCards().toggle(cardId)
    ├─ Check if exists in state.cards
    ├─ If exists: remove it
    └─ If not exists: add it with addedDate = now
        ↓
State change → localStorage auto-saved
    ↓
Component re-renders
    ├─ CARDS array rebuilt (useMemo)
    ├─ Card appears in sidebar/carousel
    └─ Sidebar stats updated
```

---

### Action: Log an Expense

```typescript
User fills form:
  Amount: 5000
  Category: "dining"
  Card: "hdfc-infinia"
  Note: "Restaurant lunch"
  Date: 2026-03-31
    ↓
onClick [Add button] → addExpense()
    ↓
// Validate
if (!amt || !cat || !payCard) return;
const a = parseFloat(amt);
if (isNaN(a) || a <= 0) return;
    ↓
// Calculate reward
const rate = card?.rates[cat] || 0;           // e.g., 5.0
const reward = Math.round(a * rate / 100);   // 250
    ↓
// Find best card for comparison
const best = getBest(cat);                    // another card with 5.5%?
const bestR = best ? Math.round(a * best.rates[cat] / 100) : reward;
    ↓
// Persist
hookAddExpense({
  cardId: "hdfc-infinia",
  date: "2026-03-31",
  merchant: "Restaurant",
  amount: 5000,
  category: "dining",
  note: "Restaurant lunch"
})
    ↓
useExpenses hook adds to state
    ├─ Generates UUID for id
    ├─ Updates state
    └─ Auto-saves to localStorage
        ↓
Flash notification shows reward
    ├─ {reward: 250, missed: 50, bestName: "Axis Magnus"}
    └─ Auto-hides after 4.5s
        ↓
Form reset
    ├─ amt = ""
    ├─ cat = null
    └─ showForm = false
        ↓
Component re-renders
    ├─ expenses updated
    ├─ hookExpenses re-enriched
    ├─ All computations trigger
    ├─ Charts refresh
    ├─ Totals update
    └─ Expense appears in list
```

---

### Action: Delete Expense

```typescript
User clicks [delete] icon on expense
    ↓
onClick → deleteExp(expenseId)
    ├─ playSound("pop")
    ├─ setDeleting(id)  // trigger animation
    └─ setTimeout(300ms)
        ↓
hookDeleteExpense(id)
    ├─ Filter out from expenses array
    ├─ Update state
    └─ Auto-save to localStorage
        ↓
setDeleting(null)
    ├─ Animation completes
    └─ Component re-renders
        ├─ Expense removed from list
        ├─ All aggregations recalculated
        ├─ Charts refresh
        └─ Totals update
```

---

### Action: Filter by Card

```typescript
User clicks card visual in sidebar/carousel
    ↓
onClick → setSelCard(selCard === c.id ? null : c.id)
    ├─ If clicked: toggle selection ON
    └─ If already selected: toggle OFF
        ↓
selCard state updates
    ↓
filtered useMemo re-runs
    ├─ Filters expenses to matching cardId only
    └─ Re-sorts by date
        ↓
Component re-renders
    ├─ Card visual highlights (isActive)
    ├─ Expense list shows only this card
    ├─ Charts show only this card's data
    ├─ Totals recalculate
    └─ Category breakdown changes
```

---

## 6. Rendering Flow (Desktop)

```
MyCardsNew renders:

1. MOBILE HEADER (isMobile && ...)
   └─ <h1>My Wallet</h1> + card count badge

2. SIDEBAR (!isMobile && ...)
   ├─ Mini stats grid
   │  ├─ Card count: {CARDS.length}
   │  ├─ Total fees: fmtK(totalFees)
   │  └─ Earned: fmtK(totalReward)
   │
   ├─ Card visuals (map CARDS)
   │  ├─ CreditCardVisual
   │  │  ├─ onClick: setSelCard(toggle)
   │  │  └─ Active indicator: isActive={selCard === c.id}
   │  └─ Delete button (hover)
   │     └─ onClick: toggle(c.id)
   │
   ├─ [+ Add Card] button
   │  └─ onClick: setShowAddCard(true)
   │
   └─ Clear filter button (conditional)
      └─ onClick: setSelCard(null)

3. MAIN CONTENT (flex-1)

   a) MOBILE CARD STRIP (isMobile && ...)
      └─ Horizontal scroll of CreditCardVisual

   b) PORTFOLIO OVERVIEW
      └─ Grid (4 columns on desktop, 2 on mobile)
         ├─ Annual Fees
         ├─ Rewards Earned
         ├─ Net Value
         └─ Efficiency %

   c) CHARTS
      ├─ Left column
      │  ├─ Pie chart (category or card breakdown)
      │  ├─ Tab toggle
      │  │  ├─ Category Breakdown (catData)
      │  │  └─ Card Rewards (cardRewardData)
      │  └─ Custom legend
      │
      └─ Right column
         ├─ Area chart (daily trend)
         ├─ ChartMode toggle
         │  ├─ Spend (spread)
         │  └─ Rewards (spread)
         └─ CustomTooltip on hover

   d) TABS/SECTIONS
      ├─ Rewards Analysis (if selCard || totalReward > 0)
      │  └─ Best cards per category
      │
      └─ Expense History
         ├─ Grouped by date
         ├─ Filtered by selCard
         └─ List items with delete

   e) ADD EXPENSE FORM
      ├─ Amount <input>
      ├─ Category <select> (CATS)
      ├─ Card <select> (CARDS)
      ├─ Note <input>
      ├─ Date <input>
      └─ [Add] button
         └─ onClick: addExpense()
            ├─ Validate
            ├─ Calculate reward
            ├─ Call hookAddExpense
            ├─ Show flash notification
            └─ Reset form

   f) EXPENSE LIST (grouped)
      └─ for each [date, expenses[]]
         ├─ <h3>{dateLabel(date)}</h3>
         └─ for each expense
            ├─ Merchant: {merchant}
            ├─ Amount: ₹{amount}
            ├─ Reward: +₹{rewardEarned}
            ├─ Category icon: {getCat(category).icon}
            └─ [Delete] button

   g) FLASH NOTIFICATION (conditional)
      └─ "Earned ₹250! Missed ₹50 with {bestName}"

4. ADD CARD DIALOG (showAddCard && ...)
   └─ AddCardsDialog
      ├─ Search <input>
      └─ Grouped card list
         └─ onClick: toggleMyCard(cardId)
```

---

## 7. Chart Data Transformation

### Category Breakdown Pie Chart
```
Input: expenses = [
  {cardId: "h1", category: "dining", amount: 5000, rewardEarned: 250},
  {cardId: "h1", category: "dining", amount: 3000, rewardEarned: 150},
  {cardId: "h1", category: "travel", amount: 8000, rewardEarned: 400},
]

Transform (catData useMemo):
  m = {
    "dining": {name: "Dining", value: 8000, reward: 400, color: "#fb923c", icon: "🍽️"},
    "travel": {name: "Travel", value: 8000, reward: 400, color: "#a78bfa", icon: "✈️"},
  }

Output for Pie Chart:
  [
    {name: "Dining", value: 8000, ...},
    {name: "Travel", value: 8000, ...},
  ]

Rendering:
  <ResponsiveContainer width="100%" height={300}>
    <Pie
      data={catData}
      dataKey="value"  // or "reward" if toggled
      nameKey="name"
    >
      {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
    </Pie>
  </ResponsiveContainer>
```

---

### Card Rewards Pie Chart
```
Input: Same expenses, but different aggregation

Transform (cardRewardData useMemo):
  m = {
    "hdfc-infinia": {
      name: "HDFC Infinia",
      value: 400,  // total reward from all expenses on this card
      fill: "#c9a84c"
    },
  }

Output for Pie Chart:
  [
    {name: "HDFC Infinia", value: 400, fill: "#c9a84c"},
  ]
```

---

### Daily Trend Area Chart
```
Input: expenses with dates throughout month

Transform (dailyData useMemo):
  // Initialize 28-31 days
  d = [
    {day: 1, spend: 0, reward: 0},
    {day: 2, spend: 5000, reward: 250},
    {day: 3, spend: 0, reward: 0},
    // ...
  ]

Output for Area Chart:
  [
    {day: 1, spend: 0, reward: 0},
    {day: 2, spend: 5000, reward: 250},
    // ...
  ]

Rendering (if chartMode === "spend"):
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={dailyData}>
      <CartesianGrid .../>
      <XAxis dataKey="day"/>
      <YAxis/>
      <Tooltip content={<CustomTooltip/>}/>
      <Area type="monotone" dataKey="spend" fill={C.green} stroke={C.green}/>
    </AreaChart>
  </ResponsiveContainer>

Toggle (chartMode === "reward"):
  <Area type="monotone" dataKey="reward" fill={C.goldL} stroke={C.gold}/>
```

---

## 8. Responsive Breakpoint Handling

```typescript
useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 900);
  check(); // initial
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

// isMobile = true  → render mobile layout (carousel, stacked)
// isMobile = false → render desktop layout (sidebar, grids)
```

**Conditional Rendering:**
- `{isMobile && <MobileHeader />}`
- `{!isMobile && <Sidebar />}`
- `gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)"`
- `paddingLeft: isMobile ? 16 : 0`

---

## 9. Key Data Binding Points

### Form → State
```
<input onChange={(e) => setAmt(e.target.value)} />  →  amt
<select onChange={(e) => setCat(e.target.value)} />  →  cat
<select onChange={(e) => setPayCard(e.target.value)} />  →  payCard
<textarea onChange={(e) => setNote(e.target.value)} />  →  note
<input type="date" onChange={(e) => setDate(e.target.value)} />  →  date
```

### State → Computed
```
amt, cat, payCard, date
  ↓
onClick [Add] → addExpense()
  ↓ (inside function)
  build expense object
  ↓
hookAddExpense(expense)
  ↓
expenses state updated
  ↓
useMemo chains re-run
  ├─ hookExpenses (enrich with rewards)
  ├─ filtered (filter by selCard)
  ├─ grouped (group by date)
  ├─ catData (aggregate by category)
  ├─ cardRewardData (aggregate by card)
  ├─ dailyData (aggregate by day)
  └─ Totals (totalFees, totalSpent, totalReward, net, eff)
```

---

## 10. Storage & Persistence

### localStorage Reads (on mount)
```typescript
useMyCards() → loadState()
  → JSON.parse(localStorage.getItem("cardperks_my_cards"))
  → Returns: MyCardsState object

useExpenses() → loadExpenses()
  → JSON.parse(localStorage.getItem("cardperks_expenses"))
  → Returns: Expense[] array
```

### localStorage Writes (on state change)
```typescript
useEffect(() => {
  saveState(state);  // in useMyCards
}, [state]);

const addExpense = useCallback((expense) => {
  setExpenses((prev) => {
    const next = [newExpense, ...prev];
    saveExpenses(next);  // in useExpenses
    return next;
  });
}, []);
```

---

## 11. Performance Considerations

### useMemo Dependencies
```typescript
// Recalculate only when dependencies change
const filtered = useMemo(() => {...}, [expenses, selCard]);
  // Re-runs if either expenses array OR selCard changes

const catData = useMemo(() => {...}, [expenses]);
  // Only depends on expenses, not selCard

const CARDS = useMemo(() => {...}, [myCardObjects]);
  // Only depends on card wallet, not expense data
```

### Chart Performance
- Recharts renders directly from data arrays (catData, cardRewardData, dailyData)
- Charts update only when their corresponding data changes
- CustomTooltip keeps rendering lightweight
- ResponsiveContainer handles resize events

---

## 12. Animation & UX Feedback

### Flash Notification
```typescript
setFlash({ reward, missed, bestName, bestId, usedId });
setTimeout(() => setFlash(null), 4500);  // auto-dismiss after 4.5s

// Rendered conditionally:
{flash && (
  <motion.div ... animate={{opacity: 1}} exit={{opacity: 0}}>
    Earned ₹{flash.reward}! Missed ₹{flash.missed} with {flash.bestName}
  </motion.div>
)}
```

### Delete Animation
```typescript
setDeleting(id);
// Item fades out / scales down
setTimeout(() => hookDeleteExpense(id), 300);  // actual delete after animation
setDeleting(null);
```

### Sound Effects
```typescript
playSound("chime");  // when expense added
playSound("pop");    // when card toggled or deleted
```

---

## 13. Summary Table: State Updates

| User Action | State Change | Side Effects | UI Update |
|---|---|---|---|
| Click card visual | selCard toggle | None | Sidebar highlight, expense list filter, chart re-filter |
| Click + Add Card | showAddCard = true | None | Dialog opens |
| Click card in dialog | toggleMyCard(id) | localStorage save | Card appears in sidebar, CARDS rebuilt |
| Fill form & click Add | Various form states | localStorage save, notification | Form reset, expense appears, charts update |
| Click delete | deleting = id → null | localStorage save | Item fades, removed from list, totals update |
| Resize window | isMobile toggle | None | Layout switches desktop ↔ mobile |
| Toggle chart mode | chartMode switch | None | Area chart shows different dataKey |
| Toggle pie category | Pie shows different data | None | Categories shown instead of cards (same chart) |

---

## 14. Error Handling & Validation

### Form Submission
```typescript
const addExpense = () => {
  if (!amt || !cat || !payCard) return;  // missing field

  const a = parseFloat(amt.replace(/,/g, ""));
  if (isNaN(a) || a <= 0) return;  // invalid amount

  // If all pass, proceed
};
```

### Card Loading
```typescript
const CARDS = CARDS.map(obj => ({
  ...obj,
  card,
  v3: getMasterCard(obj.cardId)?.enrichment
}));

// If v3 is undefined, rates default to 1%
rates: buildRatesFromV3(obj.cardId)  // handles missing v3
```

### localStorage Recovery
```typescript
function loadState(): MyCardsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Handle migrations (old array format → new format)
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}
```

---

## 15. Data Integrity & Consistency

### Cross-Reference Consistency
```typescript
// Expenses reference cardIds
// All cardIds must exist in CARDS array
filtered.forEach(expense => {
  // If referenced card was deleted, expense becomes orphaned
  // UI doesn't render it, but stored in localStorage
});

// Solution: on card deletion, could optionally clear its expenses
// Currently: orphaned expenses persist
```

### Category Consistency
```typescript
// Expenses use category strings: "dining", "travel", etc.
// CATS and CATEGORIES arrays define valid options
// UI only allows selection from predefined categories

// Validation: category must exist in CATS/CATEGORIES
if (!getCat(e.category)) {
  // Fallback to "other" or skip rendering
}
```

