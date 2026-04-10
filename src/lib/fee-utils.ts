import type { CardV3Data } from "@/data/card-v3-types";

export interface FeeAnalysis {
  annualSpend: number;
  baseRewards: number;
  portalBonus: number;
  totalEarning: number;
  renewalBonus: number;
  milestoneValue: number;
  milestoneDetails: { spend: number; benefit: string; value: number; unlocked: boolean; progress: number; shortfall: number }[];
  perksValue: number;
  perksBreakdown: { label: string; value: number; estimated: boolean }[];
  totalValue: number;
  feeWaived: boolean;
  feeWaiverProgress: number;
  feeWaiverShortfall: number;
  effectiveFee: number;
  netValue: number;
  roi: string;
  verdict: "excellent" | "worth" | "borderline" | "not-worth";
  verdictLabel: string;
  breakEvenMonthly: number;
  breakEvenWithPerks: number;
  spendAboveBreakEven: number;
  chartData: { spend: number; netValue: number }[];
}

const LOUNGE_VALUE = 2000;
const GOLF_VALUE = 2000;

function estimatePerks(v3: CardV3Data): { label: string; value: number; estimated: boolean }[] {
  const perks: { label: string; value: number; estimated: boolean }[] = [];
  if (v3.fees.annual >= 10000) {
    perks.push({ label: "Lounge access (est. 8 visits)", value: 8 * LOUNGE_VALUE, estimated: true });
  } else if (v3.fees.annual >= 2500) {
    perks.push({ label: "Lounge access (est. 4 visits)", value: 4 * LOUNGE_VALUE, estimated: true });
  }
  if (v3.fees.annual >= 10000) {
    perks.push({ label: "Golf (est. 2 rounds)", value: 2 * GOLF_VALUE, estimated: true });
  }
  return perks;
}

export function analyzeFee(v3: CardV3Data, monthlySpend: number, usePortal: boolean): FeeAnalysis {
  const annualSpend = monthlySpend * 12;
  const baseRewards = Math.round(monthlySpend * (v3.baseRate / 100) * 12 * v3.redemption.baseValue);

  let portalBonus = 0;
  if (usePortal && v3.portals.length > 0) {
    const portal = v3.portals[0];
    const avgPortalRate = portal.merchants.reduce((s, m) => s + m.effectiveRate, 0) / portal.merchants.length;
    const portalSpend = monthlySpend * 0.2;
    portalBonus = Math.round(portalSpend * (avgPortalRate / 100) * 12 * v3.redemption.baseValue);
    const baseOnPortal = Math.round(portalSpend * (v3.baseRate / 100) * 12 * v3.redemption.baseValue);
    portalBonus = Math.max(0, portalBonus - baseOnPortal);
  }

  const totalEarning = baseRewards + portalBonus;
  const renewalBonus = v3.fees.renewalBenefitValue;

  let milestoneValue = 0;
  const milestoneDetails = v3.milestones.map((m) => {
    const unlocked = annualSpend >= m.spend;
    const progress = Math.min((annualSpend / m.spend) * 100, 100);
    const shortfall = Math.max(0, m.spend - annualSpend);
    if (unlocked) milestoneValue += m.benefitValue;
    return { spend: m.spend, benefit: m.benefit, value: m.benefitValue, unlocked, progress, shortfall };
  });

  const perksBreakdown = estimatePerks(v3);
  const perksValue = perksBreakdown.reduce((s, p) => s + p.value, 0);

  const feeWaived = v3.fees.waivedOn !== null && annualSpend >= v3.fees.waivedOn;
  const feeWaiverProgress = v3.fees.waivedOn ? Math.min((annualSpend / v3.fees.waivedOn) * 100, 100) : 0;
  const feeWaiverShortfall = v3.fees.waivedOn ? Math.max(0, v3.fees.waivedOn - annualSpend) : 0;
  const effectiveFee = feeWaived ? 0 : v3.fees.annual;

  const totalValue = totalEarning + renewalBonus + milestoneValue + perksValue;
  const netValue = totalValue - effectiveFee;
  const roi = effectiveFee > 0 ? (totalValue / effectiveFee).toFixed(1) : "∞";

  let verdict: FeeAnalysis["verdict"];
  let verdictLabel: string;
  if (netValue > 0 && totalValue > v3.fees.annual * 3) {
    verdict = "excellent";
    verdictLabel = `✅ YES — This card is worth ${formatCur(netValue)} more than you pay`;
  } else if (netValue > 0) {
    verdict = "worth";
    verdictLabel = `✅ YES — This card is worth ${formatCur(netValue)} more than you pay`;
  } else if (netValue >= -(v3.fees.annual * 0.2)) {
    verdict = "borderline";
    const extra = v3.baseRate > 0
      ? Math.round(Math.abs(netValue) / (v3.baseRate / 100 * v3.redemption.baseValue * 12))
      : 0;
    verdictLabel = `⚠️ BORDERLINE — You'd need ${formatCur(extra)} more/month to break even`;
  } else {
    verdict = "not-worth";
    verdictLabel = `❌ NO — You'd lose ${formatCur(Math.abs(netValue))}/year on this card's fee`;
  }

  const monthlyEarningRate = v3.baseRate > 0 ? (v3.baseRate / 100) * v3.redemption.baseValue : 0;
  const breakEvenMonthly = monthlyEarningRate > 0 ? Math.round(v3.fees.annual / (monthlyEarningRate * 12)) : 0;
  const breakEvenWithPerks = monthlyEarningRate > 0 ? Math.round(Math.max(0, v3.fees.annual - perksValue - renewalBonus) / (monthlyEarningRate * 12)) : 0;
  const spendAboveBreakEven = Math.max(0, monthlySpend - breakEvenMonthly);

  const chartData: FeeAnalysis["chartData"] = [];
  const steps = [10000, 20000, 30000, 50000, 75000, 100000, 150000, 200000, 300000, 500000];
  for (const s of steps) {
    const as = s * 12;
    const bRewards = Math.round(s * (v3.baseRate / 100) * 12 * v3.redemption.baseValue);
    let ms = 0;
    v3.milestones.forEach((m) => { if (as >= m.spend) ms += m.benefitValue; });
    const fw = v3.fees.waivedOn !== null && as >= v3.fees.waivedOn;
    const ef = fw ? 0 : v3.fees.annual;
    const tv = bRewards + renewalBonus + ms + perksValue;
    chartData.push({ spend: s, netValue: tv - ef });
  }

  return {
    annualSpend, baseRewards, portalBonus, totalEarning, renewalBonus, milestoneValue,
    milestoneDetails, perksValue, perksBreakdown, totalValue, feeWaived, feeWaiverProgress,
    feeWaiverShortfall, effectiveFee, netValue, roi, verdict, verdictLabel, breakEvenMonthly,
    breakEvenWithPerks, spendAboveBreakEven, chartData,
  };
}

export function formatCur(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return "₹" + Math.round(abs).toLocaleString("en-IN");
}
