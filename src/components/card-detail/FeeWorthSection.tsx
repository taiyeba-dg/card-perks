import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calculator, TrendingUp, Check, AlertTriangle, Trophy } from "lucide-react";

import type { CardV3Data } from "@/data/card-v3-types";
import { Slider } from "@/components/ui/slider";

function formatCurrency(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const PRESETS = [25000, 50000, 100000, 200000];

interface Props {
  v3: CardV3Data;
  cardId: string;
  cardFee: string;
}

export default function FeeWorthSection({ v3, cardId, cardFee }: Props) {
  const [open, setOpen] = useState(false);
  const [monthlySpend, setMonthlySpend] = useState(50000);

  const analysis = useMemo(() => {
    const annualSpend = monthlySpend * 12;
    const annualRewards = Math.round(monthlySpend * (v3.baseRate / 100) * 12 * v3.redemption.baseValue);

    // Fee waiver check
    const feeWaived = v3.fees.waivedOn !== null && annualSpend >= v3.fees.waivedOn;
    const feeWaiverProgress = v3.fees.waivedOn ? Math.min((annualSpend / v3.fees.waivedOn) * 100, 100) : 0;
    const feeWaiverShortfall = v3.fees.waivedOn ? Math.max(0, v3.fees.waivedOn - annualSpend) : 0;

    // Milestone bonuses
    let milestoneValue = 0;
    v3.milestones.forEach((m) => {
      if (annualSpend >= m.spend) milestoneValue += m.benefitValue;
    });

    const renewalBonus = v3.fees.renewalBenefitValue;
    const effectiveFee = feeWaived ? 0 : v3.fees.annual;
    const totalValue = annualRewards + milestoneValue + renewalBonus;
    const netValue = totalValue - effectiveFee;
    const roi = effectiveFee > 0 ? (totalValue / effectiveFee).toFixed(1) : "∞";

    let verdict: { label: string; cls: string; icon: React.ElementType };
    if (netValue > 0 && totalValue > v3.fees.annual * 3) {
      verdict = { label: "🏆 EXCELLENT VALUE", cls: "text-gold bg-gold/10 border-gold/20", icon: Trophy };
    } else if (netValue > 0) {
      verdict = { label: "✅ WORTH IT", cls: "text-green-400 bg-green-500/10 border-green-500/20", icon: Check };
    } else {
      const breakEven = v3.baseRate > 0 ? Math.round(v3.fees.annual / (v3.baseRate / 100 * 12 * v3.redemption.baseValue)) : 0;
      verdict = { label: `⚠️ Need ${formatCurrency(breakEven)}/mo to break even`, cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle };
    }

    return { annualRewards, feeWaived, feeWaiverProgress, feeWaiverShortfall, milestoneValue, renewalBonus, effectiveFee, totalValue, netValue, roi, verdict, annualSpend };
  }, [monthlySpend, v3]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Is the Annual Fee Worth It?</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="px-5 pb-5 border-t border-border/20 space-y-4 mt-4">
              {/* Spend input */}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Estimated Monthly Spend</label>
                <div className="mt-2">
                  <Slider
                    value={[monthlySpend]}
                    onValueChange={([v]) => setMonthlySpend(v)}
                    min={10000}
                    max={500000}
                    step={5000}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gold">{formatCurrency(monthlySpend)}/mo</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(monthlySpend * 12)}/yr</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setMonthlySpend(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-all ${
                        monthlySpend === p ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/30"
                      }`}
                    >
                      {p >= 100000 ? `₹${p / 100000}L` : `₹${p / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation breakdown */}
              <div className="rounded-xl bg-secondary/15 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground">At {formatCurrency(monthlySpend)}/month spending:</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Rewards Earned</span>
                    <span className="font-medium text-green-400">{formatCurrency(analysis.annualRewards)}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Fee Waiver</span>
                    <div className="text-right">
                      {analysis.feeWaived ? (
                        <span className="text-green-400 font-medium">✅ Yes</span>
                      ) : v3.fees.waivedOn ? (
                        <div>
                          <span className="text-amber-400 text-xs">Need {formatCurrency(v3.fees.waivedOn)}/yr</span>
                          <div className="w-24 h-1.5 rounded-full bg-secondary mt-1">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${analysis.feeWaiverProgress}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{formatCurrency(analysis.feeWaiverShortfall)} short</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milestone Bonuses</span>
                    <span className="font-medium">{formatCurrency(analysis.milestoneValue)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewal Bonus</span>
                    <span className="font-medium">{formatCurrency(analysis.renewalBonus)}</span>
                  </div>

                  <div className="border-t border-border/20 pt-2 flex justify-between">
                    <span className="text-muted-foreground">Total Annual Value</span>
                    <span className="font-semibold">{formatCurrency(analysis.totalValue)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Fee</span>
                    <span className="font-medium text-red-400">-{formatCurrency(analysis.effectiveFee)}</span>
                  </div>

                  <div className="border-t border-border/20 pt-2 flex justify-between items-center">
                    <span className="font-semibold">NET VALUE</span>
                    <span className={`text-lg font-bold ${analysis.netValue >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {analysis.netValue >= 0 ? "+" : ""}{formatCurrency(analysis.netValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className={`rounded-xl border p-3 text-center ${analysis.verdict.cls}`}>
                <p className="text-sm font-semibold">{analysis.verdict.label}</p>
                {analysis.netValue > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    💡 You earn ₹{analysis.roi} for every ₹1 in fees
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
