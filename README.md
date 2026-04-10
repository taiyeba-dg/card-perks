# CardPerks

An Indian credit card intelligence platform. Compare 100+ credit cards, calculate rewards, optimize your card stack, and get AI-powered recommendations.

**Live:** [cardperks.xyz](https://cardperks.xyz)

## Features

- **Card Catalog** — Browse 100+ Indian credit cards with detailed breakdowns of rewards, fees, lounge access, and eligibility. Each card has a dedicated page with category-wise earning rates, portal bonuses, redemption options, and milestone benefits.

- **Smart Comparison** — Compare two cards side-by-side across 7 tabs: overview, rewards, redemption, lounge access, features, fees, and an AI-generated verdict with scoring.

- **Rewards Calculator** — Input your monthly spending across 11 categories (grocery, dining, fuel, online, travel, utilities, etc.) and see exactly how much you'd earn with each card. Includes portal earning rates and spending presets.

- **Fee Worth Calculator** — Breakeven analysis showing how much you need to spend to justify a card's annual fee, factoring in milestone bonuses and welcome benefits.

- **Find My Card** — 3-step guided quiz (priorities, spending, eligibility) that scores and ranks cards based on your profile.

- **Stack Optimizer** — Select 3+ cards from your wallet and see the optimal spending distribution across categories to maximize total rewards.

- **PerkAI** — AI chatbot (Claude-powered via Supabase Edge Functions) for context-aware card recommendations based on your spending patterns.

- **Devaluation Tracker** — Historical record of credit card rewards program changes across Indian banks.

- **Guides Hub** — 30+ educational guides on credit card strategy, CIBIL scores, fee optimization, and more.

## Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui, Recharts, Three.js, Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** Claude API via Supabase Edge Functions

## Data Architecture

Cards use a V3 schema with two layers:
- **Index** — Metadata (name, bank, network, tier, fee, base rate, image)
- **Enrichment** — Detailed rewards (category rates with caps/MCC exclusions), portal details, redemption options, transfer partners, milestones, fee waivers

Both merge into `CardV3Master`, the single source of truth used across the app.

## Getting Started

```bash
npm install
npm run dev
```

Runs at `http://localhost:8080`. For full functionality, set up Supabase credentials in `.env` (see `.env.example`).

## Project Structure

```
src/
  pages/              # Route components (lazy-loaded)
  components/
    compare/          # Card comparison logic + tabs
    card-finder/      # Guided quiz + scoring engine
    stack-optimizer/  # Multi-card optimization engine
    perk-ai/          # AI chat interface
    calculators/      # Rewards, redemption, fee-worth
  data/
    card-v3-master.ts # Single source of truth for card data
    card-v3-index.ts  # Card metadata (100+ cards)
    card-v3-data.ts   # Enrichment data (rewards, fees, redemption)
  hooks/              # use-cards-v3, use-my-cards, use-chat-history
  integrations/
    supabase/         # Client + types
```

## License

MIT
