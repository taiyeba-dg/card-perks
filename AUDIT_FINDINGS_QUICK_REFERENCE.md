# Card Data Audit - Quick Reference

## Critical Issues Found

### 1. UNUSED FILE: card-v3-data-generated.ts
- **Status:** Auto-generated, never imported
- **Size:** 21,860 lines
- **Impact:** Code confusion, potential accidental switches
- **Action:** DELETE

### 2. Card Count Mismatch
```
Index:     183 cards ✓
Data.ts:   184 cards (1 unreachable: hdfc-diners-black)
Generated: 180 cards (9 missing manually-maintained cards)
```

### 3. Data Conflicts (174 overlapping cards)
```
Example - amex-mrcc:
  data.ts:      baseRate = 2.0
  generated.ts: baseRate = 1.5  ← CONFLICT
```

### 4. Missing Cards in Generated (9 cards only in manual data.ts)
```
hdfc-diners-black
hdfc-phonepe-ultimo
hdfc-phonepe-uno
hdfc-swiggy-blck
hdfc-swiggy-ornge
indusind-jio-bp
kotak-essentia
kotak-indigo
supermoney-axis-rupay
yes-paisasave
```

### 5. Portal Cards Not in Index (2 cards)
```
icici-ishop
sbi-rewardz
```

---

## Field Duplication

| Field | Stored Where | Count Mismatch |
|-------|--------------|-----------------|
| **baseRate** | index (183x) + data.ts (184x) + generated.ts (180x) | HIGH |
| **annual fee** | index (183x) + data.ts (184x) + generated.ts (180x) | HIGH |
| **categories** | data.ts (184x) + generated.ts (180x) | MEDIUM |
| **portals** | data.ts (184x) + generated.ts (180x) + portal-eligibility.ts | MEDIUM |

---

## Data Sources Used by Code

```
cardV3Data (from card-v3-data.ts)
├── cards.ts (legacy mapping)
├── category-leaderboards.ts
└── voucher-card-combos.ts

NEVER USES:
└── card-v3-data-generated.ts ← ORPHANED
```

---

## Recommended Cleanup Order

1. **Delete** card-v3-data-generated.ts (21K lines, unused)
2. **Reconcile** 184 vs 183 card count (remove hdfc-diners-black from data.ts OR add to index)
3. **Consolidate** baseRate to single source (preferably index)
4. **Validate** all overlapping cards have matching data
5. **Audit** icici-ishop and sbi-rewardz (intentional or cleanup?)

---

## File Purposes

| File | Purpose | Status |
|------|---------|--------|
| cards-v3-index.ts | Master card list + basic metadata | AUTHORITATIVE |
| card-v3-data.ts | Reward details enrichment (manual) | ACTIVE |
| card-v3-data-generated.ts | Reward details (auto-generated) | ORPHANED ❌ |
| card-portal-eligibility.ts | Portal access mapping | ACTIVE |
| cards.ts | Legacy format compatibility | ACTIVE |
| card-v3-transforms.ts | Data transformation functions | ACTIVE |

---

## Data Flow

```
cards-v3-index.ts (183 cards)
    ↓
cards.ts (legacy format)
    ↓
cardV3Data from card-v3-data.ts (184 cards) ← MERGED
    ↓
✓ Used by UI
    ✗ card-v3-data-generated.ts (180 cards) NOT USED
```

---

## Risk Assessment

| Risk | Severity | Impact | Likelihood |
|------|----------|--------|------------|
| Accidental import of generated.ts | HIGH | Data corruption with wrong baseRates | MEDIUM |
| Unreachable card (hdfc-diners-black) | MEDIUM | Lost enrichment data | LOW |
| Missing 9 cards in generated.ts | MEDIUM | If schema switches files | LOW |
| Card count mismatch | MEDIUM | Validation failures | HIGH |
| baseRate stored 3 places | MEDIUM | Update inconsistencies | MEDIUM |

---

## Metrics Summary

- **Total Index Cards:** 183
- **Total Data Cards:** 184 (1 unreachable)
- **Total Generated Cards:** 180 (9 missing)
- **Overlap (data + generated):** 174 cards
- **Cards in data but NOT generated:** 10
- **Unique in index but missing generated:** 9
- **Portal eligibility unique cards:** 87
- **Cards in portals NOT in index:** 2 (icici-ishop, sbi-rewardz)
- **Data conflicts found:** +1 (amex-mrcc baseRate)

