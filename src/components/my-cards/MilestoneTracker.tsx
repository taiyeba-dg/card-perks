import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Trophy, BarChart3, Gem, Target, Sparkles, ArrowRight, Edit2, Check, AlertTriangle, Lock, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { CreditCard } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";
import type { MyCardEntry } from "@/hooks/use-my-cards";
import { getCurrencyByName } from "@/data/reward-currencies";
import { analyzeFee, formatCur } from "@/lib/fee-utils";

const SPEND_STORAGE_KEY = "cardperks_tracker_spend";

interface TrackerSpendData {
  [cardId: string]: { monthlySpend: number; annualSpendSoFar: number; pointsBalance: number; lastUpdated: string };
}

function loadSpendData(): TrackerSpendData {
  try {
    const raw = localStorage.getItem(SPEND_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSpendData(data: TrackerSpendData) {
  localStorage.setItem(SPEND_STORAGE_KEY, JSON.stringify(data));
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function monthsRemaining(): number {
  const now = new Date();
  // Assuming statement year resets April 1
  const resetMonth = 3; // April (0-indexed)
  const currentMonth = now.getMonth();
  if (currentMonth < resetMonth) return resetMonth - currentMonth;
  return 12 - currentMonth + resetMonth;
}

interface CardTrackerProps {
  card: CreditCard;
  v3: CardV3Data;
  entry: MyCardEntry;
  isMobile?: boolean;
}

export function CardTracker({ card, v3, entry, isMobile }: CardTrackerProps) {
  const [spendData, setSpendData] = useState(() => {
    const all = loadSpendData();
    return all[card.id] || { monthlySpend: 50000, annualSpendSoFar: 0, pointsBalance: 0, lastUpdated: new Date().toISOString() };
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const all = loadSpendData();
    all[card.id] = spendData;
    saveSpendData(all);
  }, [spendData, card.id]);

  const updateField = (field: string, value: number) => {
    setSpendData((prev: typeof spendData) => ({ ...prev, [field]: value, lastUpdated: new Date().toISOString() }));
  };

  const monthlySpend = spendData.monthlySpend;
  const annualSpendSoFar = spendData.annualSpendSoFar || monthlySpend * (12 - monthsRemaining());
  const pointsBalance = spendData.pointsBalance;
  const pointCurrency = v3.redemption.pointCurrency ? getCurrencyByName(v3.redemption.pointCurrency) : undefined;
  const pointLabel = pointCurrency?.abbreviation ?? v3.redemption.pointCurrency?.split(" ").pop() ?? "Points";
  const remainingMonths = monthsRemaining();
  const projectedAnnual = annualSpendSoFar + monthlySpend * remainingMonths;

  const analysis = useMemo(() => analyzeFee(v3, monthlySpend, false), [v3, monthlySpend]);

  // Milestone details based on actual spend so far
  const milestoneDetails = useMemo(() => {
    return v3.milestones.map((m) => {
      const progress = Math.min((annualSpendSoFar / m.spend) * 100, 100);
      const unlocked = annualSpendSoFar >= m.spend;
      const shortfall = Math.max(0, m.spend - annualSpendSoFar);
      const monthsToHit = monthlySpend > 0 ? Math.ceil(shortfall / monthlySpend) : Infinity;
      const state: "complete" | "in-progress" | "locked" = unlocked ? "complete" : progress > 30 ? "in-progress" : "locked";
      return { ...m, progress, unlocked, shortfall, monthsToHit, state };
    });
  }, [v3.milestones, annualSpendSoFar, monthlySpend]);

  // Fee waiver
  const feeWaiverProgress = v3.fees.waivedOn ? Math.min((annualSpendSoFar / v3.fees.waivedOn) * 100, 100) : 0;
  const feeWaived = v3.fees.waivedOn !== null && annualSpendSoFar >= v3.fees.waivedOn;
  const feeWaiverShortfall = v3.fees.waivedOn ? Math.max(0, v3.fees.waivedOn - annualSpendSoFar) : 0;
  const feeWaiverMonthlyNeeded = feeWaiverShortfall > 0 && remainingMonths > 0 ? Math.round(feeWaiverShortfall / remainingMonths) : 0;

  // Points value range
  const worstValue = pointsBalance * (v3.redemption.options[v3.redemption.options.length - 1]?.value || 0.20);
  const bestValue = pointsBalance * v3.redemption.baseValue;

  // Monthly challenge
  const nextTarget = v3.fees.waivedOn
    ? Math.round(v3.fees.waivedOn / 12)
    : v3.milestones.length > 0
    ? Math.round(v3.milestones[0].spend / 12)
    : monthlySpend;
  const challengeProgress = Math.min((monthlySpend / nextTarget) * 100, 100);
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  const lastUpdatedDays = daysSince(spendData.lastUpdated);

  return (
    <div className="space-y-4">
      {/* Spending Input with persistence */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Spending</h3>
          <div className="flex items-center gap-2">
            {lastUpdatedDays > 0 && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Updated {lastUpdatedDays === 0 ? "today" : `${lastUpdatedDays}d ago`}
              </span>
            )}
            <button onClick={() => setEditing(!editing)} className="p-1 rounded-lg hover:bg-secondary/40 text-muted-foreground">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Monthly spend</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={spendData.monthlySpend}
                    onChange={(e) => updateField("monthlySpend", parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Annual spend so far</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={spendData.annualSpendSoFar}
                    onChange={(e) => updateField("annualSpendSoFar", parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Current points balance</label>
                <Input
                  type="number"
                  value={spendData.pointsBalance}
                  onChange={(e) => updateField("pointsBalance", parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
              <button onClick={() => setEditing(false)} className="text-xs text-gold font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Done
              </button>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={`grid ${isMobile ? "grid-cols-3" : "grid-cols-3"} gap-2`}>
                <div className="rounded-lg p-2 bg-secondary/20 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">Monthly</p>
                  <p className="text-sm font-bold text-gold">{formatCur(monthlySpend)}</p>
                </div>
                <div className="rounded-lg p-2 bg-secondary/20 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">YTD Spend</p>
                  <p className="text-sm font-bold">{formatCur(annualSpendSoFar)}</p>
                </div>
                <div className="rounded-lg p-2 bg-secondary/20 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">Points</p>
                  <p className="text-sm font-bold">{pointsBalance.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Monthly Challenge */}
      <div className="glass-card rounded-xl p-4 border border-gold/15 bg-gold/[0.03]">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold">This Month's Goal</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          Spend {formatCur(nextTarget)} to stay on track for {v3.fees.waivedOn ? "fee waiver" : "next milestone"}
        </p>
        <Progress value={challengeProgress} className="h-2.5 mb-1.5" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatCur(monthlySpend)} / {formatCur(nextTarget)}</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>

      {/* Section 1: Fee Waiver */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {card.name} — Fee Waiver Tracker
          </h3>
        </div>
        {v3.fees.waivedOn ? (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Annual Fee: {formatCur(v3.fees.annual)}</span>
              <span>Threshold: {formatCur(v3.fees.waivedOn)}/yr</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Your Progress</span>
                <span className={feeWaived ? "text-emerald-400 font-bold" : "text-muted-foreground"}>
                  {Math.round(feeWaiverProgress)}%
                </span>
              </div>
              <Progress value={feeWaiverProgress} className="h-3" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{formatCur(annualSpendSoFar)}</span>
                <span>{formatCur(v3.fees.waivedOn)}</span>
              </div>
            </div>
            {feeWaived ? (
              <p className="text-xs text-emerald-400 font-medium">
                ✅ Fee is waived! You exceed the threshold by {formatCur(annualSpendSoFar - v3.fees.waivedOn!)}
              </p>
            ) : (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{formatCur(feeWaiverShortfall)} more to go → {formatCur(feeWaiverMonthlyNeeded)}/month for remaining {remainingMonths} months</p>
                <p className="text-[10px]">📅 Statement year resets: April 1, {new Date().getFullYear() + 1}</p>
                <p className="text-[10px] text-gold/80">💡 Route large purchases (insurance, appliances) to hit the threshold faster</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>This card does not offer a fee waiver. Annual fee: {formatCur(v3.fees.annual)} is mandatory.</p>
            {v3.fees.renewalBenefitValue > 0 && (
              <p className="text-gold/80">Your renewal bonus ({formatCur(v3.fees.renewalBenefitValue)}) offsets {Math.round((v3.fees.renewalBenefitValue / v3.fees.annual) * 100)}% of the fee.</p>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Milestones */}
      {milestoneDetails.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Milestones</h3>
          </div>
          <div className="space-y-4">
            {milestoneDetails.map((m, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  {m.state === "complete" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {m.state === "in-progress" && <AlertTriangle className="w-3.5 h-3.5 text-gold" />}
                  {m.state === "locked" && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  <span className="text-xs font-medium">
                    {formatCur(m.spend)} → {m.benefit} ({formatCur(m.benefitValue)})
                  </span>
                </div>
                <Progress
                  value={m.progress}
                  className={`h-2 ${m.state === "complete" ? "[&>div]:bg-emerald-500" : m.state === "locked" ? "[&>div]:bg-muted-foreground/30" : ""}`}
                />
                <div className="flex justify-between text-[10px] mt-0.5">
                  {m.unlocked ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-400 font-medium flex items-center gap-1"
                    >
                      COMPLETE! 🎉
                      <Sparkles className="w-3 h-3 text-gold animate-pulse" />
                    </motion.span>
                  ) : (
                    <span className="text-muted-foreground">
                      {formatCur(m.shortfall)} to go{m.monthsToHit < Infinity ? ` → ~${m.monthsToHit} months at current pace` : ""}
                    </span>
                  )}
                  <span className="text-muted-foreground">{Math.round(m.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gold/80 border-t border-border/20 pt-2">
            Total milestone value if you hit all: {formatCur(v3.milestones.reduce((s, m) => s + m.benefitValue, 0))}/year
          </p>
        </div>
      )}

      {/* Section 3: Earning Summary */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Annual Earnings</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">Based on {formatCur(monthlySpend)}/month spending:</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Base rewards</span><span className="text-emerald-400">+{formatCur(analysis.baseRewards)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Milestone bonuses</span><span>+{formatCur(analysis.milestoneValue)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Renewal bonus</span><span>+{formatCur(analysis.renewalBonus)}</span></div>
          <div className="border-t border-border/20 pt-1 flex justify-between font-semibold">
            <span>Total value</span><span>{formatCur(analysis.totalValue)}</span>
          </div>
          <div className="flex justify-between"><span className="text-muted-foreground">Fee {analysis.feeWaived ? "(waived ✅)" : ""}</span><span className="text-red-400">-{formatCur(analysis.effectiveFee)}</span></div>
          <div className="border-t border-border/20 pt-1 flex justify-between font-bold">
            <span>Net</span>
            <span className={analysis.netValue >= 0 ? "text-emerald-400" : "text-red-400"}>
              {analysis.netValue >= 0 ? "+" : ""}{formatCur(analysis.netValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Points Balance & Redemption */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Gem className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Points Status</h3>
        </div>
        {pointsBalance > 0 ? (
          <>
            <p className="text-sm font-bold">{pointsBalance.toLocaleString()} {pointLabel}</p>
            <p className="text-xs text-muted-foreground">
              Worth: {formatCur(worstValue)} — {formatCur(bestValue)} (depending on redemption)
            </p>
            <p className="text-xs text-gold">Best option: {v3.redemption.bestOption} at ₹{v3.redemption.baseValue.toFixed(2)}/pt</p>
            <p className="text-[10px] text-amber-400/80">⚠️ Points expiring soon? Check your statement.</p>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">
            <p>Enter your current points balance above to see redemption value.</p>
            <button onClick={() => setEditing(true)} className="text-gold mt-1 font-medium">Enter points →</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Wallet Summary aggregate across all cards */
interface WalletSummaryProps {
  cards: { card: CreditCard; v3: CardV3Data | null; entry: MyCardEntry }[];
  isMobile?: boolean;
}

export function WalletSummary({ cards: cardList, isMobile }: WalletSummaryProps) {
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalFees = 0;
    let totalWaived = 0;

    for (const { v3, entry } of cardList) {
      if (!v3) continue;
      const spendData = loadSpendData()[entry.cardId];
      const monthlySpend = spendData?.monthlySpend || 50000;
      const a = analyzeFee(v3, monthlySpend, false);
      totalValue += a.totalValue;
      totalFees += v3.fees.annual;
      if (a.feeWaived) totalWaived += v3.fees.annual;
    }

    return { totalValue, totalFees, totalWaived, netValue: totalValue - totalFees + totalWaived };
  }, [cardList]);

  if (cardList.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-gold/15 bg-gold/[0.02]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Your Wallet Summary</h3>
      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-3`}>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Total Value</p>
          <p className="text-lg font-bold text-gold">{formatCur(summary.totalValue)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Total Fees</p>
          <p className="text-lg font-bold">{formatCur(summary.totalFees)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Fees Waived</p>
          <p className="text-lg font-bold text-emerald-400">{formatCur(summary.totalWaived)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Net Value</p>
          <p className="text-lg font-bold text-gold">{formatCur(summary.netValue)}</p>
        </div>
      </div>
      <Link
        to={`/optimize-stack?cards=${cardList.map(c => c.entry.cardId).join(",")}`}
        className="flex items-center justify-center gap-1 text-[10px] text-gold hover:underline mt-3"
      >
        Optimize your card stack → <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
