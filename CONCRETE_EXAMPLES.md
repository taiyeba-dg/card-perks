# Concrete Examples of Duplication Issues

## Example 1: Unreachable Card (hdfc-diners-black)

### In card-v3-data.ts (UNREACHABLE)
```typescript
"hdfc-diners-black": {
  categories: { /* ... */ },
  exclusions: [
    { category: "Fuel", mccCodes: "5541, 5542", note: "Fuel excluded from rewards but surcharge waiver applies" },
    { category: "Wallet Loads", mccCodes: "6540", note: "Wallet top-ups excluded" },
    { category: "Rent Payments", mccCodes: "6513", note: "Rent via 3rd party excluded" },
  ],
  portals: [
    {
      name: "HDFC SmartBuy",
      url: "https://smartbuy.hdfcbank.com",
      merchants: [
        { name: "Amazon", multiplier: "10X", effectiveRate: 33 },
        // ...
      ],
    },
  ],
  redemption: { /* ... */ },
  fees: { annual: 10000, renewal: 10000, waivedOn: 800000, renewalBenefitValue: 6250 },
  baseRate: 3.3,
  // ... more fields
}
```

### In cards-v3-index.ts (NOT FOUND)
The index has:
- `"hdfc-diners-club-black"` ← Note: "club" added!
- `"hdfc-diners-club-black-metal"` ← Different ID

**Problem:**
```typescript
// In cards.ts
import { cardV3Data } from "./card-v3-data";

function indexToLegacy(entry: CardV3IndexEntry): CreditCard {
  const v3 = cardV3Data[entry.id]; // ← Lookup by index.id
  if (v3) return calculateCardRating(v3, entry);
  return entry.rating; // ← Falls back to hardcoded rating
}

// When entry.id = "hdfc-diners-club-black"
// cardV3Data["hdfc-diners-club-black"] = undefined ← MISS!
// Falls back to hardcoded rating from index
```

**Impact:** The entire HDFC Diners Black enrichment data (portals, redemption options, special offers) is NEVER USED because the ID doesn't match.

---

## Example 2: Data Conflict (amex-mrcc)

### In card-v3-data.ts
```typescript
"amex-mrcc": {
  categories: {
    grocery: { label: "2.0% (base rate)", rate: 2.0, /* ... */ },
    dining: { label: "1 MR/₹50 (base rate on dining)", rate: 5.0, /* ... */ },
    travel: { label: "1 MR/₹50 (base rate on travel)", rate: 5.0, /* ... */ },
    // ...
  },
  baseRate: 2.0,  // ← Source of truth in code
  // ...
}
```

### In card-v3-data-generated.ts
```typescript
"amex-mrcc": {
  "categories": {
    "grocery": { "label": "1.5% (base rate)", "rate": 1.5, /* ... */ },
    "dining": { "label": "1.5% (base rate)", "rate": 1.5, /* ... */ },
    "travel": { "label": "1.5% (base rate)", "rate": 1.5, /* ... */ },
    // ...
  },
  "baseRate": 1.5,  // ← DIFFERENT VALUE!
  // ...
}
```

**Problem:**
```
data.ts says:      2.0% base rate ← USED by code
generated.ts says: 1.5% base rate ← IGNORED but exists
```

If someone accidentally changes the import from:
```typescript
import { cardV3Data } from "./card-v3-data";  // current
```

To:
```typescript
import { cardV3Data } from "./card-v3-data-generated";  // accidental
```

The card's base rate would suddenly drop from 2.0% to 1.5%, showing wrong earning rates to users.

---

## Example 3: Orphaned File (card-v3-data-generated.ts)

### File exists but is NEVER imported
```bash
$ grep -r "card-v3-data-generated" src/
$ # No results!

$ grep -r "cardV3DataGenerated" src/
$ # No results!

$ grep -r "cardV3Data\[" src/data/
src/data/card-v3-data.ts:  return cardV3Data[cardId] || null;
src/data/cards.ts:  const v3 = cardV3Data[entry.id];
src/data/category-leaderboards.ts:    const v3 = cardV3Data[card.id];
src/data/voucher-card-combos.ts:      const v3 = cardV3Data[card.id];
$ # ALL import from card-v3-data.ts, never generated.ts
```

### The file takes up 21,860 lines but adds ZERO value
```
card-v3-data.ts:       4,165 lines (USED)
card-v3-data-generated.ts: 21,860 lines (UNUSED)
Total waste: 17,695 lines of dead code
```

---

## Example 4: Missing Cards in Generated (9 cards)

### Cards in data.ts but NOT in generated.ts

```typescript
// In card-v3-data.ts: EXISTS
"hdfc-phonepe-ultimo": {
  categories: { /* detailed earnings */ },
  portals: [{ name: "PhonePe", /* ... */ }],
  redemption: { /* transfer partners */ },
  // ...
}

// In card-v3-data-generated.ts: MISSING
// Searching for "hdfc-phonepe-ultimo"... NOT FOUND
```

Other missing cards (all in index, data.ts but NOT generated.ts):
- hdfc-phonepe-uno
- hdfc-swiggy-blck
- hdfc-swiggy-ornge
- indusind-jio-bp
- kotak-essentia
- kotak-indigo
- supermoney-axis-rupay
- yes-paisasave

**Problem:** If someone decided to switch from data.ts to generated.ts:
```typescript
// Current (works)
import { cardV3Data } from "./card-v3-data";  // Has 184 cards

// If changed to (breaks)
import { cardV3Data } from "./card-v3-data-generated";  // Only 180 cards
```

The 9 manually-maintained cards would lose all their enrichment data.

---

## Example 5: baseRate Duplication Across 3 Files

### Index (cards-v3-index.ts) - 183 cards
```typescript
export const CARDS_V3_INDEX: CardV3IndexEntry[] = [
  {
    "id": "amex-platinum-charge",
    "name": "American Express Platinum Charge Card",
    "baseRate": 2,  // ← Copy 1
    "feeAnnual": 66000,
  },
  // ... 182 more cards
];
```

### Data (card-v3-data.ts) - 184 cards
```typescript
export const cardV3Data: Record<string, CardV3Data> = {
  "amex-platinum-charge": {
    categories: { /* ... */ },
    baseRate: 2.0,  // ← Copy 2
    fees: { annual: 66000, /* ... */ },  // ← Copy 2b
  },
  // ... 183 more cards (including unreachable hdfc-diners-black)
};
```

### Generated (card-v3-data-generated.ts) - 180 cards
```typescript
export const cardV3Data: Record<string, CardV3Data> = {
  "amex-platinum-charge": {
    "categories": { /* ... */ },
    "baseRate": 2.0,  // ← Copy 3
    "fees": { "annual": 66000, /* ... */ },  // ← Copy 3b
  },
  // ... 179 more cards (but 9 fewer than index)
};
```

### The Problem
```typescript
// To update amex-platinum-charge baseRate from 2% to 2.5%:
// Developer MUST update ALL 3 PLACES:

// 1. Index
"amex-platinum-charge": {
  "baseRate": 2.5,  // ← Update here
  // ...
}

// 2. Data.ts
"amex-platinum-charge": {
  "baseRate": 2.5,  // ← AND here
  // ...
}

// 3. Generated.ts
"amex-platinum-charge": {
  "baseRate": 2.5,  // ← AND here
  // ...
}

// If they forget ANY ONE, inconsistency occurs
```

**Current state:** amex-mrcc has different values in data.ts (2.0) vs generated.ts (1.5) — ALREADY BROKEN!

---

## Example 6: Card Count Mismatch

### Verification Command
```bash
$ wc -l src/data/cards-v3-index.ts src/data/card-v3-data.ts src/data/card-v3-data-generated.ts
  4160 src/data/cards-v3-index.ts      (183 cards)
  4165 src/data/card-v3-data.ts        (184 cards) ← 1 MORE!
 21860 src/data/card-v3-data-generated.ts (180 cards) ← 3 FEWER!
```

### Why the mismatch?
```typescript
// Index: 183 unique card IDs
grep '"id": "[^"]*"' cards-v3-index.ts | wc -l  // 183

// Data: 184 card entries
grep '^\s*"[a-z0-9-]*": {' card-v3-data.ts | wc -l  // 184

// The extra card in data.ts is unreachable:
// "hdfc-diners-black" (not in index, has different ID)

// Generated: 180 card entries
grep '^\s*"[a-z0-9-]*": {' card-v3-data-generated.ts | wc -l  // 180

// Missing 9 cards from data.ts:
// - hdfc-phonepe-ultimo
// - hdfc-phonepe-uno
// - hdfc-swiggy-blck
// - hdfc-swiggy-ornge
// - indusind-jio-bp
// - kotak-essentia
// - kotak-indigo
// - supermoney-axis-rupay
// - yes-paisasave
```

---

## Example 7: Portal Eligibility Ghost Cards

### In card-portal-eligibility.ts
```typescript
export const cardPortalEligibility: Record<string, CardPortalEntry[]> = {
  // ... many valid cards ...
  
  "icici-ishop": [{  // ← THIS CARD...
    portalId: "icici-portal",
    overrides: { /* ... */ },
  }],
  
  // ... more cards ...
};
```

### In cards-v3-index.ts
```bash
$ grep '"id": "icici-ishop"' src/data/cards-v3-index.ts
$ # No results! CARD DOESN'T EXIST IN INDEX
```

**Problem:** Portal eligibility references a card that doesn't exist in the main index.

```typescript
// In code that tries to use this:
const card = CARDS_V3_INDEX.find(c => c.id === "icici-ishop");
// card = undefined ← Lookup fails

const portals = cardPortalEligibility["icici-ishop"];
// portals = [...]  ← But eligibility data exists!
```

This creates a dangling reference.

---

## Summary of Issues

| Issue | File A | File B | Problem |
|-------|--------|--------|---------|
| **Unreachable card** | data.ts | index.ts | ID mismatch: "hdfc-diners-black" vs "hdfc-diners-club-black" |
| **Data conflict** | data.ts (2.0%) | generated.ts (1.5%) | Different baseRate for amex-mrcc |
| **Unused file** | generated.ts | - | Never imported, 21K lines of bloat |
| **Missing cards** | data.ts (9 cards) | generated.ts | Manually-maintained cards not in generated |
| **Card count** | 183 (index) | 184 (data.ts) | Mismatch due to unreachable card |
| **Ghost cards** | portal-eligibility.ts | index.ts | References icici-ishop, sbi-rewardz not in index |
| **Duplication** | All 3 | - | baseRate stored 3 places with conflicts |

