// Re-export enhanced types and data from standalone data files
export {
  VALUE_CHANGES,
  type ValueChange as ValueChangeV2,
} from "./devaluation/devaluation-entries";
export { BANK_PROFILES, getBankProfile, type BankProfile } from "./devaluation/devaluation-banks";
export { CHANGE_TYPE_CONFIG, IMPACT_CONFIG, FILTER_DEFINITIONS, BANK_CHART_COLORS } from "./devaluation/devaluation-config";
export { groupChangesByBankMonth, calculateUserExposure, detectPatterns, type ChangeGroup } from "./devaluation/devaluation-mappings";

// Legacy ValueChange interface kept for backward compatibility with existing components
export interface ValueChange {
  id: string;
  cardId: string;
  cardName: string;
  bankId: string;
  changeType: "devaluation" | "improvement" | "modification" | "discontinued";
  category: "redemption" | "portal" | "lounge" | "milestone" | "fee" | "earning-rate" | "transfer-partner";
  title: string;
  description: string;
  previousValue: string;
  newValue: string;
  previousNumeric: number;
  newNumeric: number;
  changePercent: number;
  impactLevel: "high" | "medium" | "low";
  affectedCards: string[];
  estimatedAnnualImpact: string;
  effectiveDate: string;
  announcedDate: string;
  reportedDate: string;
  source: string;
  sourceUrl: string | null;
  recommendation: string;
}

// Use the full 23-entry VALUE_CHANGES array instead of the legacy 8-entry hardcoded array.
// Import directly (not via re-export above) to avoid TDZ issues with re-exported bindings.
import { VALUE_CHANGES as _VALUE_CHANGES } from "./devaluation/devaluation-entries";
export const valueChanges: ValueChange[] = _VALUE_CHANGES as unknown as ValueChange[];

/* Legacy 8-entry array removed — was:
  {
    id: "vc-001",
    cardId: "hdfc-smartbuy",
    cardName: "HDFC SmartBuy Portal",
    bankId: "hdfc",
    changeType: "devaluation",
    category: "portal",
    title: "HDFC SmartBuy Voucher Limits Slashed",
    description: "SmartBuy imposed strict monthly purchase limits on popular voucher merchants. BigBasket and Blinkit capped at \u20B91,500/month, Swiggy Money slashed from \u20B920,000 to \u20B92,000/month, Amazon Shopping fee increased to 4.13%.",
    previousValue: "Unlimited voucher purchases on SmartBuy",
    newValue: "BigBasket/Blinkit \u20B91,500/mo, Swiggy \u20B92K/mo, Amazon 4.13% fee",
    previousNumeric: 20000,
    newNumeric: 2000,
    changePercent: -90,
    impactLevel: "high",
    affectedCards: ["hdfc-infinia-metal", "hdfc-diners-black", "hdfc-regalia-gold", "hdfc-regalia", "hdfc-millennia", "hdfc-tata-neu-infinity", "hdfc-swiggy", "hdfc-marriott-bonvoy", "hdfc-diners-privilege"],
    estimatedAnnualImpact: "\u20B910,000-25,000/year less from restricted voucher purchases",
    effectiveDate: "2024-03-15",
    announcedDate: "2024-03-10",
    reportedDate: "2024-03-11",
    source: "HDFC SmartBuy T&C update",
    sourceUrl: null,
    recommendation: "Prioritize SmartBuy Flights (\u20B91/pt) and Hotels which remain unrestricted. For vouchers, switch to Axis EDGE Rewards.",
  },
  {
    id: "vc-002",
    cardId: "axis-ace",
    cardName: "Axis ACE",
    bankId: "axis",
    changeType: "devaluation",
    category: "earning-rate",
    title: "Axis ACE Base Cashback Cut from 2% to 1.5%",
    description: "Axis Bank reduced the base cashback rate on the ACE credit card from 2% to 1.5%. Lounge access changed from unlimited to requiring \u20B950,000 quarterly spend. Utility cashback on non-Google Pay channels removed.",
    previousValue: "2% base cashback; unlimited lounge; utility cashback on all channels",
    newValue: "1.5% base cashback; \u20B950K/qtr for lounge; utility 5% only via Google Pay",
    previousNumeric: 2.0,
    newNumeric: 1.5,
    changePercent: -25,
    impactLevel: "high",
    affectedCards: ["axis-ace"],
    estimatedAnnualImpact: "\u20B92,500-5,000/year less on \u20B95-10L annual spend + lounge access loss",
    effectiveDate: "2024-04-20",
    announcedDate: "2024-03-20",
    reportedDate: "2024-03-21",
    source: "Axis Bank T&C update, Business Standard",
    sourceUrl: null,
    recommendation: "Keep ACE for Google Pay utility payments (5%). For general spending, consider IDFC First Select or YES Paisasave.",
  },
  {
    id: "vc-003",
    cardId: "axis-flipkart",
    cardName: "Flipkart Axis Bank",
    bankId: "axis",
    changeType: "devaluation",
    category: "earning-rate",
    title: "Flipkart Axis Bank Card: Cashback Capped, Lounge Removed",
    description: "Flipkart/Cleartrip cashback capped at \u20B94,000/quarter each. Lounge access discontinued. Myntra improved from 1% to 7.5%. Government services cashback removed.",
    previousValue: "Unlimited Flipkart cashback; complimentary lounge; 1% Myntra",
    newValue: "\u20B94K/qtr cap Flipkart; no lounge; 7.5% Myntra; no govt services",
    previousNumeric: 0,
    newNumeric: 4000,
    changePercent: 0,
    impactLevel: "high",
    affectedCards: ["axis-flipkart"],
    estimatedAnnualImpact: "\u20B94,000-10,000/year less for heavy Flipkart shoppers + lounge loss",
    effectiveDate: "2025-06-20",
    announcedDate: "2025-01-31",
    reportedDate: "2025-02-01",
    source: "Business Standard, TechnoFino",
    sourceUrl: null,
    recommendation: "Use for Flipkart (\u20B94K/qtr cap) and Myntra (7.5%). Route Amazon to Amazon Pay ICICI. Use SBI Cashback for other platforms.",
  },
  {
    id: "vc-004",
    cardId: "icici-all",
    cardName: "ICICI Bank All Cards",
    bankId: "icici",
    changeType: "devaluation",
    category: "fee",
    title: "ICICI January 2026 Overhaul: Gaming, Wallet & Transport Fees",
    description: "ICICI introduced 2% on gaming platforms, 1% on wallet loads over \u20B95,000, 1% on transportation over \u20B950,000. \u20B93,500 add-on card fee. BookMyShow BOGO requires \u20B925K quarterly spend. Platinum BOGO discontinued.",
    previousValue: "No gaming/wallet/transport fees; free BOGO; free add-on cards",
    newValue: "2% gaming; 1% wallet >\u20B95K; 1% transport >\u20B950K; \u20B93.5K add-on; \u20B925K BOGO condition",
    previousNumeric: 0,
    newNumeric: 2,
    changePercent: 0,
    impactLevel: "high",
    affectedCards: ["icici-sapphiro", "icici-amazon-pay", "icici-emeralde", "icici-coral", "icici-rubyx", "icici-platinum-chip"],
    estimatedAnnualImpact: "\u20B92,000-8,000/year in new fees depending on usage patterns",
    effectiveDate: "2026-01-15",
    announcedDate: "2025-12-22",
    reportedDate: "2025-12-22",
    source: "Business Today, Angel One, ICICI Bank website",
    sourceUrl: null,
    recommendation: "Avoid wallet loads above \u20B95K/month on ICICI cards. For gaming, use a non-ICICI card. If BOGO was your main benefit, switch to IndusInd Legend for free tickets.",
  },
  {
    id: "vc-005",
    cardId: "hdfc-infinia-metal",
    cardName: "HDFC Infinia",
    bankId: "hdfc",
    changeType: "devaluation",
    category: "fee",
    title: "HDFC Infinia Spend Requirement Doubled to \u20B918L",
    description: "HDFC tightened Infinia retention: \u20B918L annual spend (up from \u20B98L) or \u20B950L relationship value required. Existing cardholders grandfathered until March 2027.",
    previousValue: "\u20B98L annual spend for fee waiver",
    newValue: "\u20B918L annual spend OR \u20B950L relationship value",
    previousNumeric: 800000,
    newNumeric: 1800000,
    changePercent: 125,
    impactLevel: "high",
    affectedCards: ["hdfc-infinia-metal"],
    estimatedAnnualImpact: "Risk of losing card or paying \u20B910,000+ annual fee if spend < \u20B918L",
    effectiveDate: "2027-04-01",
    announcedDate: "2026-02-26",
    reportedDate: "2026-02-26",
    source: "Business Today, HDFC Bank mailer",
    sourceUrl: null,
    recommendation: "FY26 is waived. Start consolidating spend on Infinia to reach \u20B918L or build \u20B950L deposit. Otherwise explore Axis Magnus or Diners Club Black.",
  },
  {
    id: "vc-006",
    cardId: "axis-airtel",
    cardName: "Airtel Axis Bank",
    bankId: "axis",
    changeType: "devaluation",
    category: "earning-rate",
    title: "Airtel Axis Card Gutted: Dynamic Capping + Benefits Removed",
    description: "Airtel Axis card fundamentally changed. Fixed \u20B9250/month cap replaced with dynamic 2x base capping. 10% utility cashback removed. Swiggy/BigBasket replaced with Zomato/Blinkit (\u20B9200/mo cap). 4 lounge visits removed.",
    previousValue: "25% Airtel (cap \u20B9250/mo); 10% utility; 10% Swiggy/BigBasket; 4 lounges/year",
    newValue: "25% Airtel (dynamic 2x base cap); no utility; 10% Zomato/Blinkit (\u20B9200/mo, \u20B9499 min); no lounge",
    previousNumeric: 250,
    newNumeric: 0,
    changePercent: -100,
    impactLevel: "high",
    affectedCards: ["axis-airtel"],
    estimatedAnnualImpact: "\u20B95,000-12,000/year less \u2014 lounge alone was \u20B93,000+ value",
    effectiveDate: "2026-04-12",
    announcedDate: "2026-03-20",
    reportedDate: "2026-03-21",
    source: "CardMaven, TechnoFino",
    sourceUrl: null,
    recommendation: "Compare post-cap Airtel cashback vs Axis ACE at 5% via Google Pay. For lounge, get Scapia Federal (free).",
  },
  {
    id: "vc-007",
    cardId: "amex-platinum-travel",
    cardName: "Amex Platinum Travel",
    bankId: "other",
    changeType: "devaluation",
    category: "milestone",
    title: "Amex Platinum Travel Milestones Gutted \u2014 50% Cuts",
    description: "\u20B91.9L milestone: 15K MR cut to 7.5K (50% reduction). \u20B94L milestone: 25K MR + \u20B910K Taj voucher cut to just 10K MR (no Taj). New \u20B97L tier added with Taj voucher.",
    previousValue: "\u20B91.9L=15K MR; \u20B94L=25K MR + \u20B910K Taj voucher",
    newValue: "\u20B91.9L=7.5K MR; \u20B94L=10K MR; \u20B97L=22.5K MR + \u20B910K Taj (new tier)",
    previousNumeric: 15000,
    newNumeric: 7500,
    changePercent: -50,
    impactLevel: "high",
    affectedCards: ["amex-platinum-travel"],
    estimatedAnnualImpact: "7,500 MR less at \u20B91.9L + Taj voucher now requires \u20B97L instead of \u20B94L",
    effectiveDate: "2026-03-09",
    announcedDate: "2026-03-01",
    reportedDate: "2026-03-02",
    source: "CardMaven forum, Amex India",
    sourceUrl: null,
    recommendation: "If under \u20B97L spend, card value has halved. Consider HDFC Regalia Gold for travel rewards instead.",
  },
  {
    id: "vc-008",
    cardId: "sbi-cashback",
    cardName: "SBI Cashback",
    bankId: "sbi",
    changeType: "devaluation",
    category: "earning-rate",
    title: "SBI Cashback Card Online Cap Slashed: \u20B95K to \u20B92K per Cycle",
    description: "Online cashback cap reduced from \u20B95,000 to \u20B92,000 per statement cycle. Total cap from \u20B95,000 to \u20B94,000. New exclusions: govt, tolls, digital gaming.",
    previousValue: "\u20B95,000/cycle online cap; \u20B95,000 total cap",
    newValue: "\u20B92,000/cycle online cap; \u20B94,000 total cap; govt/toll/gaming excluded",
    previousNumeric: 5000,
    newNumeric: 2000,
    changePercent: -60,
    impactLevel: "high",
    affectedCards: ["sbi-cashback"],
    estimatedAnnualImpact: "\u20B936,000/year less for max spenders",
    effectiveDate: "2026-04-01",
    announcedDate: "2026-03-18",
    reportedDate: "2026-03-18",
    source: "Business Standard, SBI Card website",
    sourceUrl: null,
    recommendation: "Route overflow to Amazon Pay ICICI (5% Amazon, unlimited) or Flipkart Axis (5% Flipkart).",
  },
*/

export interface BankSummary {
  bankId: string;
  bankName: string;
  devaluations: number;
  improvements: number;
  modifications: number;
  overallTrend: "declining" | "stable" | "improving";
  trendNote: string;
  mostAffected: string;
}

export function getBankSummaries(changes: ValueChange[]): BankSummary[] {
  const bankMap = new Map<string, { devaluations: number; improvements: number; modifications: number; changes: ValueChange[] }>();

  for (const c of changes) {
    const existing = bankMap.get(c.bankId) || { devaluations: 0, improvements: 0, modifications: 0, changes: [] };
    if (c.changeType === "devaluation") existing.devaluations++;
    else if (c.changeType === "improvement") existing.improvements++;
    else existing.modifications++;
    existing.changes.push(c);
    bankMap.set(c.bankId, existing);
  }

  const bankNames: Record<string, string> = { hdfc: "HDFC Bank", axis: "Axis Bank", sbi: "SBI Card", icici: "ICICI Bank", other: "Other Banks" };
  const trendNotes: Record<string, string> = {
    hdfc: "HDFC has been aggressively monetizing SmartBuy, capping benefits, and tightening Infinia requirements. Flights/hotels on SmartBuy remain the safe harbor at \u20B91/pt.",
    axis: "Axis has hit ACE (cashback cut to 1.5%), Flipkart (cashback capped), and Magnus (fee + redemption fees). EDGE Rewards portal still functional but trust eroding.",
    sbi: "SBI restructured lounge access (January 2026) and slashed Cashback Card online cap to \u20B92K/month (April 2026). Elite card discontinued for new applicants.",
    icici: "ICICI's January 2026 overhaul introduced gaming, wallet, and transport fees across ALL cards. iShop voucher limits and redemption fees compound the impact.",
    other: "Smaller issuers (Amex, IndusInd, IDFC, AU, YES, Scapia) also trimming benefits. Industry-wide trend of rent payment fee hikes and insurance coverage removals.",
  };

  return Array.from(bankMap.entries()).map(([bankId, data]) => {
    const trend = data.devaluations > data.improvements ? "declining" : data.improvements > data.devaluations ? "improving" : "stable";
    const catCount = new Map<string, number>();
    data.changes.forEach((c) => catCount.set(c.category, (catCount.get(c.category) || 0) + 1));
    const mostAffected = Array.from(catCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "general";

    return {
      bankId,
      bankName: bankNames[bankId] || bankId,
      devaluations: data.devaluations,
      improvements: data.improvements,
      modifications: data.modifications,
      overallTrend: trend,
      trendNote: trendNotes[bankId] || "",
      mostAffected: mostAffected + ` (${catCount.get(mostAffected)} changes)`,
    };
  });
}
