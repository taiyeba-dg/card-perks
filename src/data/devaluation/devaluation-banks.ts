export interface BankProfile {
  id: string;
  name: string;
  shortName: string;
  brandColor: string;
  brandColorLight: string;     // For light backgrounds
  logo?: string;               // Path to logo
  rewardsPortalName: string;
  rewardsPortalUrl: string;
  contactUrl: string;
  // Health score data
  healthScore: number;          // 0-100 current score
  healthTrend: "up" | "down" | "stable";
  historicalScores: { month: string; score: number }[];  // Last 6 months
  // Trend analysis
  trendNotes: Record<string, string>;  // Keyed by "Q1-2026" etc.
  devaluationVelocity: number;         // Changes per month (last 6 months)
}

export const BANK_PROFILES: BankProfile[] = [
  {
    id: "hdfc",
    name: "HDFC Bank",
    shortName: "HDFC",
    brandColor: "#004B87",
    brandColorLight: "#E8F0F8",
    rewardsPortalName: "SmartBuy",
    rewardsPortalUrl: "https://smartbuy.hdfcbank.com",
    contactUrl: "https://www.hdfcbank.com/personal/contact-us",
    healthScore: 38,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 62 }, { month: "Nov 2025", score: 58 },
      { month: "Dec 2025", score: 52 }, { month: "Jan 2026", score: 48 },
      { month: "Feb 2026", score: 42 }, { month: "Mar 2026", score: 38 },
    ],
    trendNotes: {
      "Q1-2026": "Infinia spend requirement doubled to \u20B918L (Feb 2026). Swiggy HDFC min order raised to \u20B9249 (Apr 2026). Diners Black insurance/wallet caps still biting from July 2025. SmartBuy flight/hotel value still intact at \u20B91/pt.",
      "Q4-2025": "Diners Black insurance points capped at \u20B95K/month, 1% wallet/gaming fees added. Gyftr points briefly cut to 3X (reversed in 24hrs). Trust shaken.",
      "Q2-2024": "SmartBuy voucher limits imposed (BigBasket \u20B91.5K, Swiggy \u20B92K). Amazon fee hiked to 4.13%. Tata Neu UPI earnings slashed for non-Neu UPI.",
      "Q4-2023": "Regalia lounge access restructured to spend-based (\u20B91L/quarter, max 2 vouchers). First major lounge monetization move.",
    },
    devaluationVelocity: 0.83,
  },
  {
    id: "axis",
    name: "Axis Bank",
    shortName: "Axis",
    brandColor: "#97144D",
    brandColorLight: "#F8E8EF",
    rewardsPortalName: "EDGE Rewards",
    rewardsPortalUrl: "https://edgerewards.axisbank.co.in",
    contactUrl: "https://www.axisbank.com/contact-us",
    healthScore: 40,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 58 }, { month: "Nov 2025", score: 55 },
      { month: "Dec 2025", score: 48 }, { month: "Jan 2026", score: 45 },
      { month: "Feb 2026", score: 42 }, { month: "Mar 2026", score: 40 },
    ],
    trendNotes: {
      "Q1-2026": "Airtel Axis card gutted (Apr 2026): dynamic caps, lounge removed, utility/Swiggy cashback gone. Magnus redemption fees (\u20B999/\u20B9199) from Dec 2025 still impacting. Atlas discontinued for new applicants.",
      "Q4-2025": "Magnus fee hiked to \u20B912.5K+GST, surcharge fee increased, redemption/miles conversion fees added (Dec 2025).",
      "Q2-2025": "Flipkart Axis cashback capped at \u20B94K/quarter, lounge removed (June 2025). Myntra rate improved to 7.5% \u2014 sole bright spot.",
      "Q2-2024": "ACE cashback cut from 2% to 1.5%, lounge access became spend-based (April 2024). Most popular free card significantly weakened.",
    },
    devaluationVelocity: 0.67,
  },
  {
    id: "sbi",
    name: "SBI Card",
    shortName: "SBI",
    brandColor: "#22409A",
    brandColorLight: "#E8EBF5",
    rewardsPortalName: "SBI Rewardz",
    rewardsPortalUrl: "https://www.sbicard.com/en/rewards.page",
    contactUrl: "https://www.sbicard.com/en/contact-us.page",
    healthScore: 50,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 68 }, { month: "Nov 2025", score: 65 },
      { month: "Dec 2025", score: 60 }, { month: "Jan 2026", score: 56 },
      { month: "Feb 2026", score: 53 }, { month: "Mar 2026", score: 50 },
    ],
    trendNotes: {
      "Q1-2026": "SBI Cashback online cap slashed from \u20B95K to \u20B92K/cycle (Apr 2026). Govt/toll/gaming excluded. Lounge program restructured with Set A/B tiers (Jan 2026). Education payments now carry 1%+GST above \u20B945K/cycle.",
      "Q4-2025": "SBI Elite stopped new issuances (Oct 2024). Lounge restructure announced for January 2026. SimplyCLICK Swiggy rewards cut 50% (Apr 2025).",
      "Q3-2025": "Relatively stable. SBI Aurum and Prime benefits maintained. BPCL Octane fuel benefits unchanged.",
    },
    devaluationVelocity: 0.50,
  },
  {
    id: "icici",
    name: "ICICI Bank",
    shortName: "ICICI",
    brandColor: "#F58220",
    brandColorLight: "#FEF0E2",
    rewardsPortalName: "iShop",
    rewardsPortalUrl: "https://www.icicibank.com/online-services/ishop",
    contactUrl: "https://www.icicibank.com/contact-us",
    healthScore: 42,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 65 }, { month: "Nov 2025", score: 62 },
      { month: "Dec 2025", score: 55 }, { month: "Jan 2026", score: 45 },
      { month: "Feb 2026", score: 43 }, { month: "Mar 2026", score: 42 },
    ],
    trendNotes: {
      "Q1-2026": "January 2026 overhaul: 2% gaming fee, 1% wallet fee (>\u20B95K), 1% transport fee (>\u20B950K), \u20B93.5K add-on card fee. BookMyShow BOGO requires \u20B925K/quarter. Platinum BOGO discontinued entirely. Most aggressive fee restructure in Indian credit card history.",
      "Q4-2025": "January overhaul announced December 22. Market reacted very negatively. Amazon Pay ICICI core 5% benefit still intact.",
      "Q2-2024": "iShop voucher limits (\u20B912K/cycle for Amazon/Flipkart) and \u20B999+GST redemption fee introduced. Major hit to Emeralde and Sapphiro value.",
    },
    devaluationVelocity: 0.67,
  },
  {
    id: "yes-bank",
    name: "YES Bank",
    shortName: "YES",
    brandColor: "#DD0031",
    brandColorLight: "#FFE8EB",
    rewardsPortalName: "YES Rewards",
    rewardsPortalUrl: "https://www.yesbank.in/rewards",
    contactUrl: "https://www.yesbank.in/contact-us",
    healthScore: 25,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 55 }, { month: "Nov 2025", score: 50 },
      { month: "Dec 2025", score: 42 }, { month: "Jan 2026", score: 35 },
      { month: "Feb 2026", score: 30 }, { month: "Mar 2026", score: 25 },
    ],
    trendNotes: {
      "Q1-2026": "Catastrophic devaluation: point value crashed from \u20B91.00 to \u20B90.15 (85% point devaluation) across all YES Bank cards. Effective earning rates now among lowest in industry. All premium card benefits effectively nullified.",
      "Q4-2025": "First warning signs of massive restructure. Market confidence begins to erode.",
    },
    devaluationVelocity: 1.25,
  },
  {
    id: "idfc",
    name: "IDFC FIRST Bank",
    shortName: "IDFC",
    brandColor: "#0052CC",
    brandColorLight: "#E8F0FF",
    rewardsPortalName: "IDFC Rewards",
    rewardsPortalUrl: "https://www.idfcfirstbank.com/rewards",
    contactUrl: "https://www.idfcfirstbank.com/contact-us",
    healthScore: 45,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 65 }, { month: "Nov 2025", score: 62 },
      { month: "Dec 2025", score: 56 }, { month: "Jan 2026", score: 51 },
      { month: "Feb 2026", score: 48 }, { month: "Mar 2026", score: 45 },
    ],
    trendNotes: {
      "Q1-2026": "Multiple structural changes to premium cards: International rewards on Mayura/Ashva reduced from 10X to 5X. Base earn threshold increased from \u20B9150 to \u20B9200. FASTag and railway platform fees excluded from rewards.",
      "Q4-2025": "Incremental benefit erosion on premium card lineup begins.",
    },
    devaluationVelocity: 0.50,
  },
  {
    id: "kotak",
    name: "Kotak Mahindra Bank",
    shortName: "Kotak",
    brandColor: "#2E5090",
    brandColorLight: "#E8ECF5",
    rewardsPortalName: "Kotak Rewards",
    rewardsPortalUrl: "https://www.kotak.com/rewards",
    contactUrl: "https://www.kotak.com/contact-us",
    healthScore: 55,
    healthTrend: "stable",
    historicalScores: [
      { month: "Oct 2025", score: 60 }, { month: "Nov 2025", score: 59 },
      { month: "Dec 2025", score: 58 }, { month: "Jan 2026", score: 56 },
      { month: "Feb 2026", score: 55 }, { month: "Mar 2026", score: 55 },
    ],
    trendNotes: {
      "Q1-2026": "League Platinum Mojo Points devalued to \u20B90.07 per point. However, premium card ecosystem (Solitaire, White Reserve) remains relatively intact with stable benefits.",
      "Q4-2025": "Targeted devaluation on mid-tier card portfolio.",
    },
    devaluationVelocity: 0.17,
  },
  {
    id: "indusind",
    name: "IndusInd Bank",
    shortName: "IndusInd",
    brandColor: "#0066B2",
    brandColorLight: "#E8F2FF",
    rewardsPortalName: "IndusInd Rewards",
    rewardsPortalUrl: "https://www.indusind.com/rewards",
    contactUrl: "https://www.indusind.com/contact-us",
    healthScore: 48,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 58 }, { month: "Nov 2025", score: 56 },
      { month: "Dec 2025", score: 53 }, { month: "Jan 2026", score: 51 },
      { month: "Feb 2026", score: 49 }, { month: "Mar 2026", score: 48 },
    ],
    trendNotes: {
      "Q1-2026": "Legend lounge access discontinued (March 2025). Premium card ecosystem narrowing with each quarterly update. Overall premium card value proposition declining.",
      "Q4-2025": "Lounge benefit erosion continues across card portfolio.",
    },
    devaluationVelocity: 0.33,
  },
  {
    id: "federal",
    name: "Federal Bank",
    shortName: "Federal",
    brandColor: "#003B7A",
    brandColorLight: "#E8EDF8",
    rewardsPortalName: "Scapia Rewards",
    rewardsPortalUrl: "https://www.federalbank.co.in/scapia",
    contactUrl: "https://www.federalbank.co.in/contact-us",
    healthScore: 52,
    healthTrend: "down",
    historicalScores: [
      { month: "Oct 2025", score: 65 }, { month: "Nov 2025", score: 62 },
      { month: "Dec 2025", score: 59 }, { month: "Jan 2026", score: 55 },
      { month: "Feb 2026", score: 53 }, { month: "Mar 2026", score: 52 },
    ],
    trendNotes: {
      "Q1-2026": "Scapia lounge access threshold doubled from \u20B910K to \u20B920K monthly spend. Utilities and insurance categories now excluded from rewards earnings. Multiple premium benefits narrowed.",
      "Q4-2025": "Lounge restructure and category exclusions announced.",
    },
    devaluationVelocity: 0.42,
  },
];

export function getBankProfile(bankId: string): BankProfile | undefined {
  return BANK_PROFILES.find((b) => b.id === bankId);
}
