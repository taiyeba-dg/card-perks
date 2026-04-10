

# Complete UI Revamp — 7 Tool/Calculator Pages

**Direction**: Premium dark fintech with modernized spacing, typography, and hierarchy. Retain glass-card aesthetic but elevate with better visual rhythm, larger hero type, refined data visualization, and smoother mobile interactions.

---

## Guiding Principles (applied to all 7 pages)

- **Hero sections**: Larger serif headings, tighter subtitle copy, subtle gradient orbs, breadcrumb above title
- **Cards/panels**: Softer border radius (2xl), more consistent padding (p-5/p-6), subtle hover glow instead of translate-y
- **Data**: Monospace for numbers, cleaner stat rows with dot separators, gold accent for primary values
- **Mobile**: Bottom-sheet drawers for inputs, sticky summary bars, larger touch targets (44px min), horizontal scroll snap for filters
- **Empty states**: Illustrated with subtle animation, actionable CTA
- **Animations**: Reduced stagger delays, smoother easing, respect `prefers-reduced-motion`

---

## Phase 1 — Rewards Calculator (`/rewards-calculator`)

### Desktop (`DesktopRewardsLayout.tsx`)
- Modernize 3-column layout: Input | Results | Breakdown with refined sticky sidebar
- **SpendingInputPanel**: Redesign preset chips as pill-shaped with subtle fill, cleaner category input rows with inline sliders instead of just text inputs, total bar with animated gradient fill
- **ResultsList**: Card result items as wider horizontal cards with larger card image, stat row using dot-separated layout (`₹23,400 · 3.2% · Fee waived`), remove category bars — replace with top-3 earning categories as labeled pills
- **DetailedBreakdown**: Cleaner section headers, tabbed sub-sections (Earning · Fees · Caps)

### Mobile (`MobileRewardsLayout.tsx`)
- Sticky top bar with total + period toggle (not just text)
- Results as compact cards with swipe-to-compare gesture hint
- Bottom sheet for spending input with grouped sliders and a "Done" button
- Breakdown as full-screen bottom sheet with swipe-to-dismiss

---

## Phase 2 — Redemption Calculator (`/redemption-calculator`)

### Desktop (`DesktopRedemptionLayout.tsx`)
- 2-column sticky layout: Card selector + points input (left), results (right)
- **ValueRangeBanner**: Redesign with a horizontal spectrum bar showing min/max with labeled dots
- **RedemptionOptions**: Horizontal tier cards instead of vertical list, each with rating badge and value bar
- **TransferPartners**: Grid of partner logos with value overlay, hover to expand details

### Mobile (`MobileRedemptionLayout.tsx`)
- Card selector as horizontal scroll carousel at top
- Points input inline (not drawer), presets as scrollable chips
- Options as stacked cards with tap-to-expand
- Transfer partners as 2-column grid with mini value indicator

---

## Phase 3 — Fee Calculator (`/fee-calculator`)

### Desktop (`DesktopFeeLayout.tsx`)
- Cleaner 2-column: Inputs sticky left, verdict + breakdown right
- **Verdict banner**: Larger icon, bolder typography, background gradient matching verdict color
- **Break-even chart**: Cleaner axis labels, animated reference lines, "You are here" marker with tooltip
- **Value breakdown**: Alternating row backgrounds for readability

### Mobile (`MobileFeeLayout.tsx`)
- Spending slider at top (not in collapsible), verdict banner always visible
- Collapsible sections with chevron icons and counts (e.g., "Milestones (2/3 hit)")
- Sticky bottom verdict bar: keep but refine with better contrast and font weight

---

## Phase 4 — Stack Optimizer (`/optimize-stack`)

### Desktop (`DesktopOptimizerLayout.tsx`)
- Expand from basic 2-column wrapper to include:
  - Left: Card selector with selected card chips + spending sliders with grouped layout
  - Right: Hero summary card with large value number, assignment table with card color accents, distribution bar with legend
- **WeakestCardAnalysis**: Redesign as a callout card with amber accent and "Swap suggestion" button

### Mobile (`MobileOptimizerLayout.tsx`)
- Step-based flow: Step 1 (Select Cards) → Step 2 (Set Spending) → Step 3 (View Results)
- Results as scrollable cards with category assignments inline
- Distribution as horizontal stacked bar with tap-to-reveal labels

---

## Phase 5 — Compare Cards (`/compare`)

### Desktop
- Card selection slots: Cleaner empty-slot design with dashed border and plus icon
- **Tab bar**: Pill-style tabs with active indicator underline animation
- **Comparison table**: Alternating row shading, larger card images in column headers, winner column gets subtle gold background wash
- **Popular Comparisons**: 3-column grid with VS divider between card thumbnails

### Mobile
- 2-card max with swipeable card selector
- Tabs as horizontal scroll pills
- Comparison as stacked sections (not horizontal scroll table)
- Share button in bottom sticky bar

---

## Phase 6 — Best Cards by Category (`/best-for` + `/best-for/:category`)

### Hub page (`BestFor.tsx`)
- Category tiles: Larger emoji, better hierarchy with top card name and rate
- Add a "Featured Category" hero banner for the most popular category

### Category page (`BestForCategory.tsx`)
- **WinnerSpotlight**: Full-width hero with card image, key stats as pill badges, earning projections
- **Desktop leaderboard**: Modernize table with row hover effects, medal icons with subtle glow
- **Mobile leaderboard**: Card-based with rank badge, more vertical space
- **SpendingCalculator**: Inline slider with live-updating bar chart instead of text-only results

---

## Phase 7 — Devaluation Tracker (`/devaluation-tracker`)

### Desktop (`DesktopDevaluationLayout.tsx`)
- **Bank summaries**: Redesign as horizontal cards with mini trend sparkline
- **Filter bar**: Group filters into a single row with Select dropdowns instead of pill groups (too crowded)
- **Timeline items**: Cleaner layout with left date column + right content, before/after as inline comparison instead of 3-column grid
- **Report form**: Slide-out panel from right instead of inline

### Mobile (`MobileDevaluationLayout.tsx`)
- Bank summaries: Horizontal scroll cards (keep, refine sizing)
- Filters: Collapsible filter bar with active count badge
- Timeline: Accordion-style with tap to expand (keep, refine spacing and typography)
- Report: Bottom sheet drawer

---

## Files to Create/Edit

| Page | Files |
|------|-------|
| Rewards Calculator | `DesktopRewardsLayout.tsx`, `MobileRewardsLayout.tsx`, `SpendingInputPanel.tsx`, `ResultsList.tsx`, `DetailedBreakdown.tsx` |
| Redemption Calculator | `DesktopRedemptionLayout.tsx`, `MobileRedemptionLayout.tsx`, `RedemptionCalculator.tsx` (page) |
| Fee Calculator | `DesktopFeeLayout.tsx`, `MobileFeeLayout.tsx` |
| Stack Optimizer | `DesktopOptimizerLayout.tsx`, `MobileOptimizerLayout.tsx`, `OptimizeStack.tsx` (page) |
| Compare Cards | `CompareCards.tsx` (page), `CompareTabShell.tsx`, `MobileCompareTable.tsx` |
| Best Cards | `BestFor.tsx`, `BestForCategory.tsx` |
| Devaluation | `DesktopDevaluationLayout.tsx`, `MobileDevaluationLayout.tsx` |

**Total: ~20 files across 7 pages.** All existing logic/data stays intact — only layout and styling changes.

Implementation order follows the phases above, starting with the most complex (Rewards Calculator) and ending with Devaluation Tracker.

