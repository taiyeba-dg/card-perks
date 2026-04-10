# Card Data Audit Reports - Index

This directory contains a comprehensive audit of card data duplication and field overlap issues across the voucher tracker codebase.

## Reports Generated

### 1. **AUDIT_FINDINGS_QUICK_REFERENCE.md**
**Best for:** Quick overview, executive summary
- Critical issues at a glance
- Risk assessment matrix
- Recommended cleanup order
- File purposes table
- Data flow diagram

**Key takeaways:**
- Unused 21K-line file (card-v3-data-generated.ts)
- 1 unreachable card (hdfc-diners-black)
- baseRate stored 3 places with conflicts
- 9 cards missing from auto-generated file

---

### 2. **CARD_DATA_AUDIT_REPORT.md**
**Best for:** Detailed technical analysis
- Executive summary
- File-by-file breakdown with counts
- Data consistency issues
- Duplication analysis matrix
- Missing data analysis
- Cleanup recommendations with priority levels

**Sections:**
- 6 files analyzed in detail
- 5 data consistency issues identified
- 5 cleanup recommendations (Priority 1-5)
- Risk assessment by issue

---

### 3. **DETAILED_FIELD_ANALYSIS.md**
**Best for:** Understanding field-level duplication
- Field-by-field breakdown of each file
- Field duplication matrix
- Data consistency checks
- Recommendations by field

**What it covers:**
- 17 fields in cards-v3-index.ts
- ~30 field groups in card-v3-data.ts
- Field duplication matrix (redundant vs derived)
- Duplication risk assessment by field

---

### 4. **CONCRETE_EXAMPLES.md**
**Best for:** Understanding impact with real code
- 7 concrete examples of issues
- Actual code snippets from the codebase
- Problem/impact explanations
- Example 1: Unreachable card
- Example 2: Data conflicts (baseRate mismatch)
- Example 3: Orphaned unused file
- Example 4: Missing cards in generated
- Example 5: baseRate triplication
- Example 6: Card count mismatch
- Example 7: Ghost portal cards

---

## Quick Facts

| Metric | Value |
|--------|-------|
| **Cards in Index** | 183 |
| **Cards in card-v3-data.ts** | 184 (1 unreachable) |
| **Cards in card-v3-data-generated.ts** | 180 (UNUSED) |
| **Overlap (data + generated)** | 174 cards |
| **Cards in data NOT in generated** | 10 |
| **Unused file size** | 21,860 lines |
| **baseRate duplication** | 3 places (index, data, generated) |
| **Unique cards in portal eligibility** | 87 |
| **Ghost cards in portal** | 2 (icici-ishop, sbi-rewardz) |
| **Data conflicts found** | 1+ (amex-mrcc baseRate) |

---

## Critical Issues (Priority Order)

### Priority 1: DELETE Orphaned File
- **File:** src/data/card-v3-data-generated.ts
- **Issue:** Never imported, 21K lines of bloat
- **Action:** Delete immediately
- **Effort:** 5 minutes
- **Impact:** HIGH (removes confusion)

### Priority 2: Fix Card Count Mismatch
- **File:** src/data/card-v3-data.ts
- **Issue:** 184 cards vs 183 in index
- **Action:** Remove unreachable hdfc-diners-black OR add to index
- **Effort:** 5 minutes
- **Impact:** MEDIUM (data integrity)

### Priority 3: Deduplicate baseRate
- **Files:** cards-v3-index.ts, card-v3-data.ts, card-v3-data-generated.ts
- **Issue:** Stored in 3 places with different counts
- **Action:** Keep ONLY in index, remove from other files
- **Effort:** 2 hours
- **Impact:** MEDIUM (maintenance benefit)

### Priority 4: Fill Generated File Gaps (if keeping it)
- **File:** card-v3-data-generated.ts
- **Issue:** Missing 9 manually-maintained cards
- **Action:** Update generation script OR remove file
- **Effort:** 1 hour
- **Impact:** LOW (only matters if switching files)

### Priority 5: Validate Overlapping Data
- **Files:** card-v3-data.ts vs card-v3-data-generated.ts
- **Issue:** Conflicts exist (e.g., amex-mrcc baseRate)
- **Action:** Run validation script to find all conflicts
- **Effort:** 30 minutes
- **Impact:** MEDIUM (data integrity)

---

## Files Analyzed

### Source Files
1. **src/data/cards-v3-index.ts**
   - Master index (183 cards)
   - 17 fields per card
   - Single source of truth for card existence

2. **src/data/card-v3-data.ts**
   - Manual enrichment (184 cards, 1 unreachable)
   - ~30 field groups per card
   - Reward structures, portals, redemption

3. **src/data/card-v3-data-generated.ts**
   - Auto-generated enrichment (180 cards)
   - Same structure as data.ts
   - NEVER IMPORTED OR USED

4. **src/data/card-portal-eligibility.ts**
   - Portal access mapping (87 unique cards)
   - Card-specific overrides
   - 2 ghost cards not in index

5. **src/data/cards.ts**
   - Legacy compatibility layer
   - Maps index to CreditCard format
   - Uses both index and cardV3Data

6. **src/data/card-v3-transforms.ts**
   - Transformation/derivation functions
   - Computes perks, milestones, formats
   - No direct duplication

---

## How to Use These Reports

### If you're a...

**Product Manager / Project Lead:**
→ Read AUDIT_FINDINGS_QUICK_REFERENCE.md (5 min)

**Technical Lead / Architect:**
→ Read CARD_DATA_AUDIT_REPORT.md + DETAILED_FIELD_ANALYSIS.md (20 min)

**Developer fixing the issues:**
→ Read all reports, especially CONCRETE_EXAMPLES.md (30 min)

**QA / Validator:**
→ Use CONCRETE_EXAMPLES.md to write test cases (10 min per example)

---

## Data Flow Diagram

```
Cards Master Index (183)
    ↓
    ├─→ cards.ts (legacy format)
    │
    └─→ cardV3Data (184 from data.ts)
        ├─→ cards.ts (rating calculation)
        ├─→ category-leaderboards.ts
        └─→ voucher-card-combos.ts

Card Portal Eligibility (87)
    ├─→ Portal overrides
    └─→ Ghost cards (2)

[UNUSED]
card-v3-data-generated.ts (180) ✗
```

---

## Validation Checklist

- [ ] Read AUDIT_FINDINGS_QUICK_REFERENCE.md
- [ ] Read CONCRETE_EXAMPLES.md
- [ ] Identify which cleanup items are in scope
- [ ] Delete card-v3-data-generated.ts
- [ ] Verify no imports break
- [ ] Fix hdfc-diners-black ID mismatch
- [ ] Run full test suite
- [ ] Validate card counts match
- [ ] Document any deviations from report

---

## Contact / Questions

If you have questions about these audit reports:
1. Check CONCRETE_EXAMPLES.md for specific examples
2. Review DETAILED_FIELD_ANALYSIS.md for field-level details
3. Consult CARD_DATA_AUDIT_REPORT.md for comprehensive analysis

---

**Audit Date:** 2026-03-31
**Auditor:** READ-ONLY Automated Audit
**Status:** Complete - Ready for cleanup planning

