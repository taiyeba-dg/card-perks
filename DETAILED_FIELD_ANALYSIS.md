# Detailed Field-by-Field Analysis

## cards-v3-index.ts Field Breakdown

### Stored: 183 cards × 17 fields

| Field | Type | Purpose | Duplicated? |
|-------|------|---------|-------------|
| `id` | string | Unique card identifier | Primary key |
| `slug` | string | URL-friendly ID | No |
| `name` | string | Full card name | No |
| `shortName` | string | Abbreviated name | No |
| `bank` | string | Issuer (HDFC, Axis, Amex, etc.) | No (used in transforms) |
| `bankId` | string | Bank code (hdfc, axis, amex) | No |
| `network` | string | Card network (Visa, Mastercard, Amex, RuPay) | No |
| `networkBase` | string | Normalized network name | No |
| `image` | string | Image path (/cards/*.png) | Duplicated in data.ts |
| `tier` | string | Card tier (entry, basic, premium, ultra-premium) | No |
| `rating` | number | Hardcoded rating (1-5 scale) | **DUPLICATED** in data.ts |
| `feeAnnual` | number | Annual fee in ₹ | **DUPLICATED** in data.ts.fees.annual |
| `baseRate` | number | Base earning % (0.5 to 15) | **DUPLICATED** in data.ts + generated.ts |
| `loungeVisits` | string | Lounge access (e.g., "4/year domestic, 4/year intl") | No (derived in transforms) |
| `tags` | string[] | Categorical tags (Premium, Travel, Metal, etc.) | Duplicated as metadata.bestForTags |
| `color` | string | Hex color (#006FCF) | Overridden in transforms to "#0D0D0D" |

**Duplication Count:** baseRate (2 more copies), feeAnnual (1 more copy)

---

## card-v3-data.ts Field Breakdown

### Stored: 184 cards × ~30 field groups

#### Categories Object
```typescript
categories: Record<string, {
  label: string;        // "10 RP per ₹150" or "1.5% (base rate)"
  rate: number;         // Effective % (3.3, 6.6, 15, etc.)
  cap?: number;         // Monthly/annual cap in RP or ₹
  capPeriod?: string;   // "Monthly" | "Quarterly" | "Annual" | "Per Txn"
  minTxn?: number;      // Minimum transaction amount
  note?: string;        // Context (e.g., "Via SmartBuy/Dineout for max value")
}>
```

**Count:** 8 categories per card (grocery, dining, travel, online, fuel, utilities, entertainment, base)

**Duplication:** rate duplicates index.baseRate (index.baseRate vs data.categories.base.rate)

#### Exclusions Array
```typescript
exclusions: Array<{
  category: string;     // "Fuel", "Insurance Premiums", "EMI Conversions"
  mccCodes?: string;    // MCC codes (e.g., "5541, 5542")
  note: string;         // Explanation
}>
```

**Count:** 0-3 per card

**Duplication:** None (unique to data.ts)

#### Portals Array (Standard)
```typescript
portals: Array<{
  name: string;         // "HDFC SmartBuy", "Axis EDGE Rewards"
  url: string;          // Portal URL
  merchants: Array<{
    name: string;       // "Amazon", "Flipkart"
    multiplier: string; // "10X", "35X"
    effectiveRate: number; // 33, 17.5, etc.
  }>;
  cap: string;          // "25,000 bonus RP/month"
  pointValueLabel: string; // "1 RP = ₹1.00 on SmartBuy"
  note: string;         // Additional info
}>
```

**Count:** 0-5 per card

**Duplication:** Partially overlaps with card-portal-eligibility.ts but with different structure
- data.ts = standard portals
- portal-eligibility.ts = accelerated portals with per-card overrides

#### Redemption Object
```typescript
redemption: {
  type: "points" | "cashback" | "miles";
  pointCurrency: string; // "Reward Points", "Amex MR", "InterMiles"
  baseValue: number;     // ₹ per point (0.3, 0.5, 1.0)
  bestOption: string;    // "SmartBuy Flights/Hotels"
  options: Array<{
    type: string;        // "Statement Credit", "Transfer Partners"
    value: number;       // ₹ per point (0.3, 1.0, etc.)
    processingTime: string; // "Instant", "2-3 days"
    fee: string;         // "None" or fee amount
    minPoints?: number;  // 500, 1000, 10000
  }>;
  transferPartners: Array<{
    name: string;        // "Singapore Airlines KrisFlyer"
    type: "airline" | "hotel";
    ratio: string;       // "1:1", "4:5"
    ratioNumeric: number; // 1.0, 0.8
    minPoints: number;   // 5000, 10000
    transferTime: string; // "2-3 days"
    fee: string;         // "None"
  }>;
}
```

**Count:** 4-20 options per card, 0-18 transfer partners

**Duplication:** None (unique structure)

#### Fees Object
```typescript
fees: {
  annual: number;              // ₹ annual fee (0, 2500, 10000, 66000)
  renewal: number;             // ₹ renewal fee (usually = annual)
  waivedOn?: number;           // Spend requirement for waiver (₹300K, ₹800K)
  renewalBenefitValue: number; // ₹ value of renewal benefit (1000, 10000)
}
```

**Duplication:** fees.annual = index.feeAnnual (CONFLICT RISK)

#### Milestones Array
```typescript
milestones: Array<{
  spend: number;       // Annual spend threshold (₹500K, ₹1M)
  benefit: string;     // "5,000 bonus RP", "₹10,000 travel voucher"
  benefitValue: number; // Numeric ₹ value (5000, 10000)
}>
```

**Count:** 0-3 per card

**Duplication:** None (unique)

#### Flat Fields
```typescript
baseRate: number;                           // DUPLICATED from index
upgradePath: Array<{
  cardId: string;
  cardName: string;
  condition: string;
}>;
upgradeFromId: string | null;               // Card ID to upgrade from
upgradeToId: string | null;                 // Card ID to upgrade to
applyLink: string | null;                   // Application URL
specialOffers: Array<{
  title: string;
  description: string;
  category: string;
  validFrom: string;    // "2026-01-01"
  validTo: string;      // "2026-12-31"
}>;
relatedCardIds: string[];                   // Recommended alternatives
```

**Duplication:** baseRate (+ 2 more copies in generated.ts and index)

---

## card-v3-data-generated.ts Field Breakdown

### Stored: 180 cards × same structure as data.ts

**DIFFERENCE:** Uses JSON format instead of TypeScript objects
- Same field names (categories, exclusions, portals, redemption, fees, milestones, baseRate, etc.)
- Same data types
- Different formatting (JSON vs TS)

**KEY ISSUE:**
```
data.ts:       baseRate: 2.0
generated.ts: "baseRate": 1.5
```

This suggests the generated file is from a DIFFERENT DATA SOURCE than the manual data.ts, or the generation script is outdated.

---

## card-portal-eligibility.ts Field Breakdown

### Stored: 116 card-portal relationships (87 unique cards)

```typescript
cardPortalEligibility: Record<string, CardPortalEntry[]> = {
  "hdfc-infinia-metal": [{
    portalId: "hdfc-smartbuy",  // References accelerated-portals.ts
    overrides?: {
      merchantOverrides?: {
        "Hotels": { multiplier: "10X", effectiveRate: 33 },
        "Amazon": { multiplier: "5X", effectiveRate: 16.5 },
      };
      cap?: "15,000 accelerated RP/month";
      pointValue?: number;
      note?: "Retention: ₹18L annual spend";
    };
  }]
}
```

**Duplication Analysis:**
- Multipliers in portal-eligibility.ts OVERRIDE data.ts portals
- Data.ts has "standard" portal rates
- Portal-eligibility.ts has "accelerated" portal rates
- DIFFERENT SEMANTIC MEANING (not duplication, but confusion risk)

---

## Summary: Field Duplication Matrix

### REDUNDANT (Stored Multiple Times with Same Semantics)

| Field | locations | Count |
|-------|-----------|-------|
| **baseRate** | index (183x), data.ts (184x), generated.ts (180x) | 3x |
| **annual fee** | index.feeAnnual (183x), data.ts.fees.annual (184x), generated.ts.fees.annual (180x) | 3x |
| **image** | index.image (183x), data.ts (?x) - needs verification | 2x |
| **tags/bestFor** | index.tags (183x), data.ts.relatedCardIds (~184x) | 2x |

### OVERLAPPING (Similar but Different Contexts)

| Field | Contexts | Issue |
|-------|----------|-------|
| **portals** | data.ts (standard), portal-eligibility.ts (accelerated) | Different semantics |
| **rating** | index.rating (hardcoded), computed via cardV3Data | Dual source |

### DERIVED (Not Duplicated, Computed Elsewhere)

| Data | Source | Computed In |
|------|--------|-------------|
| **perks** | card.features | card-v3-transforms.ts |
| **insurance** | card.features.insurance | card-v3-transforms.ts |
| **milestones** (formatted) | raw milestone data | card-v3-transforms.ts |
| **legacy CreditCard** | index + cardV3Data | cards.ts |

---

## Data Consistency Checks

### Check 1: baseRate Consistency
```
Index cards:     183 baseRate values
Data.ts cards:   184 baseRate values (includes unreachable hdfc-diners-black)
Generated cards: 180 baseRate values

Result: INCONSISTENT - different cards, some conflicting values
```

### Check 2: Fee Consistency
```
Index cards:       183 feeAnnual values
Data.ts cards:     184 fees.annual values
Generated cards:   180 fees.annual values

Result: INCONSISTENT - different card counts
```

### Check 3: Card ID Mapping
```
Index IDs:    183 unique IDs
Data.ts IDs:  184 unique IDs (1 extra: hdfc-diners-black)
Gen.ts IDs:   180 unique IDs (9 missing manually-maintained cards)

Result: INCONSISTENT - no common set of 183+
```

### Check 4: Portal References
```
data.ts portals:      174 merchants across 87 portals
portal-eligibility:   87 unique cards with overrides

Result: RELATED but DIFFERENT (standard vs accelerated)
```

---

## Recommendations by Field

### baseRate
- **Current:** Stored in index (183x), data.ts (184x), generated.ts (180x)
- **Risk:** HIGH - any update needs 3 places, conflicts exist
- **Solution:** Store ONLY in index, remove from both data files

### Annual Fee (feeAnnual / fees.annual)
- **Current:** Stored in index (183x), data.ts (184x), generated.ts (180x)
- **Risk:** MEDIUM - less likely to change than baseRate
- **Solution:** Store ONLY in index, use index lookup elsewhere

### Categories
- **Current:** data.ts (184 cards), generated.ts (180 cards)
- **Risk:** MEDIUM - missing 9 cards in generated
- **Solution:** Either complete generated.ts OR consolidate to single file

### Portals
- **Current:** data.ts (standard) + portal-eligibility.ts (accelerated)
- **Risk:** LOW - different semantic meaning, intentional separation
- **Solution:** Keep both but document clearly

### Exclusions
- **Current:** data.ts only (184 cards)
- **Risk:** LOW - not duplicated elsewhere
- **Solution:** Keep as-is

---

## What Needs to Be Fixed

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Delete generated.ts | 5 min | HIGH (removes confusion) |
| 2 | Remove hdfc-diners-black from data.ts | 5 min | MEDIUM (fixes card count) |
| 3 | Deduplicate baseRate (keep index only) | 2 hours | MEDIUM (maintenance benefit) |
| 4 | Add missing 9 cards to generated OR remove it | 1 hour | LOW (if keeping it) |
| 5 | Validate all overlapping cards match | 30 min | MEDIUM (data integrity) |

