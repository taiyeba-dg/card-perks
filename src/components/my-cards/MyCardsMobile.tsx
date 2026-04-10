import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CreditCard, Trash2, Wallet, Lock, Receipt, ShoppingBag,
  UtensilsCrossed, Plane, Fuel, Tv, Pill, Package, Zap, ShoppingCart,
  TrendingUp, IndianRupee, Sparkles, BarChart3, Award, Target,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useMyCards } from "@/hooks/use-my-cards";
import { useExpenses, CATEGORIES, type Expense } from "@/hooks/use-expenses";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import type { CardV3Data } from "@/data/card-v3-types";
import CardImage from "@/components/CardImage";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import { Dialog } from "@/components/ui/dialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import "./my-cards.css";

/* ---- helpers ---- */
function parseFee(fee: string): number { const n = fee.replace(/[^\d]/g, ""); return n ? parseInt(n, 10) : 0; }
function inr(v: number): string { return v.toLocaleString("en-IN"); }
function fmtShort(v: number): string {
  if (v >= 100_000) return `${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return inr(Math.round(v));
}

const CATEGORY_ICONS: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag, food: UtensilsCrossed, travel: Plane, fuel: Fuel,
  electronics: Tv, entertainment: Sparkles, bills: Zap, groceries: ShoppingCart,
  health: Pill, others: Package,
};
import { USER_SPEND_TO_V3 } from "@/data/category-config";
import { DONUT_COLORS } from "@/data/color-schemes";

function getRewardForExpense(expense: Expense, myCards: ReturnType<typeof useMyCards>["myCardObjects"]): number {
  const cardObj = myCards.find((c) => c.cardId === expense.cardId);
  if (!cardObj?.v3) return 0;
  const v3Key = USER_SPEND_TO_V3[expense.category] || "base";
  const cats = cardObj.v3.categories as Record<string, { rate: number }> | undefined;
  const catRate = cats?.[v3Key];
  const rate = catRate ? catRate.rate : cardObj.v3.baseRate;
  return Math.round((expense.amount * rate) / 100);
}

function rewardForExpense(amount: number, category: string, v3: CardV3Data | undefined, baseRate: number): number {
  if (!v3?.categories) return amount * (baseRate / 100);
  const cats = v3.categories as Record<string, { rate: number }>;
  const key = USER_SPEND_TO_V3[category] ?? "base";
  return amount * ((cats[key]?.rate ?? cats.base?.rate ?? baseRate) / 100);
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getMonthKey(d: string) { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()).padStart(2, "0")}`; }

/* ================================================================ */
export default function MyCardsMobile() {
  const { has, toggle, count, myCardObjects, estimatedAnnualValue } = useMyCards();
  const { expenses, addExpense, deleteExpense, getByCard } = useExpenses();
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | "all">("all");
  const stripRef = useRef<HTMLDivElement>(null);

  const totalFees = useMemo(() => myCardObjects.reduce((s, e) => s + (e.v3?.fees.annual ?? parseFee(e.card.fee)), 0), [myCardObjects]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalRewardsEarned = useMemo(() => expenses.reduce((s, exp) => s + getRewardForExpense(exp, myCardObjects), 0), [expenses, myCardObjects]);
  const netValue = estimatedAnnualValue - totalFees;
  const activeEntry = myCardObjects[selectedCardIdx] ?? myCardObjects[0] ?? null;

  const cardExpenses = useMemo(() => {
    if (!activeEntry) return [];
    const all = getByCard(activeEntry.cardId);
    return selectedMonth === "all" ? all : all.filter((e) => getMonthKey(e.date) === selectedMonth);
  }, [activeEntry, getByCard, selectedMonth]);

  const availableMonths = useMemo(() => {
    if (!activeEntry) return [];
    const set = new Set(getByCard(activeEntry.cardId).map((e) => getMonthKey(e.date)));
    return Array.from(set).sort().reverse();
  }, [activeEntry, getByCard]);

  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    (activeEntry ? getByCard(activeEntry.cardId) : expenses).forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .map(([cat, amount]) => ({ name: CATEGORIES.find((c) => c.value === cat)?.label.replace(/^[^\s]+\s/, "") ?? cat, value: amount, category: cat }))
      .sort((a, b) => b.value - a.value);
  }, [activeEntry, getByCard, expenses]);

  const bestPerCategory = useMemo(() => {
    if (myCardObjects.length === 0) return [];
    return ["shopping","food","travel","fuel","groceries","entertainment"].map((cat) => {
      const v3Key = USER_SPEND_TO_V3[cat] ?? "base";
      let best = myCardObjects[0], bestRate = 0;
      myCardObjects.forEach((entry) => {
        const cats = entry.v3?.categories as Record<string, { rate: number }> | undefined;
        const rate = cats?.[v3Key]?.rate ?? entry.v3?.baseRate ?? 0;
        if (rate > bestRate) { bestRate = rate; best = entry; }
      });
      return { category: cat, catLabel: CATEGORIES.find((c) => c.value === cat)?.label ?? cat, cardName: best.card.name, cardColor: best.card.color, rate: bestRate };
    }).filter((b) => b.rate > 0);
  }, [myCardObjects]);

  const rewardEfficiency = useMemo(() => {
    if (totalExpenses === 0) return { score: 0, pct: "0.0", message: "Start tracking to see your efficiency" };
    const pct = (totalRewardsEarned / totalExpenses) * 100;
    let message = "Room for improvement";
    if (pct >= 3) message = "Exceptional reward earner";
    else if (pct >= 2) message = "Great reward optimisation";
    else if (pct >= 1) message = "Solid reward earnings";
    else if (pct >= 0.5) message = "Average efficiency";
    return { score: Math.min(Math.round(pct * 25), 100), pct: pct.toFixed(1), message };
  }, [totalExpenses, totalRewardsEarned]);

  const cardExpenseSummary = useMemo(() => {
    if (!activeEntry) return { total: 0, count: 0, rewards: 0 };
    const now = new Date();
    const thisMonth = getByCard(activeEntry.cardId).filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    return { total: thisMonth.reduce((s, e) => s + e.amount, 0), count: thisMonth.length, rewards: thisMonth.reduce((s, exp) => s + getRewardForExpense(exp, myCardObjects), 0) };
  }, [activeEntry, getByCard, myCardObjects]);

  /* ---- empty state ---- */
  if (count === 0) return (
    <div className="lg:hidden">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-9 h-9 text-gold/40" />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">Your wallet is empty</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[260px] mx-auto">Add your credit cards to track rewards, expenses, and find the best card for every spend.</p>
          <button onClick={() => setAddOpen(true)} className="gold-btn px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15">
            <Plus className="w-4 h-4" /> Add Your First Card
          </button>
          <p className="text-[10px] text-muted-foreground mt-4 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Your data stays on this device</p>
        </motion.div>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}><AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} /></Dialog>
    </div>
  );

  const activeBaseRate = activeEntry ? (activeEntry.v3?.baseRate ?? (parseFloat(activeEntry.card.rewardRate) || 1)) : 1;

  return (
    <div className="lg:hidden pb-28">
      {/* ---- HEADER ---- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif text-lg font-bold">My Wallet</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold">{count} {count === 1 ? "card" : "cards"}</span>
        </div>
        <button onClick={() => setAddOpen(true)} className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center" aria-label="Add card">
          <Plus className="w-4 h-4 text-gold" />
        </button>
      </motion.div>

      {/* ---- CARD STRIP ---- */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <div ref={stripRef} className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
          {myCardObjects.map((entry, i) => {
            const isActive = i === selectedCardIdx;
            return (
              <button key={entry.cardId} onClick={() => setSelectedCardIdx(i)} className={`flex-shrink-0 snap-start glass-card rounded-xl px-3 py-2.5 border transition-all min-w-[140px] text-left ${isActive ? "border-gold/50 ring-1 ring-gold/20 bg-gold/5" : "border-border/20"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-5 rounded overflow-hidden flex-shrink-0">
                    {entry.card.image
                      ? <CardImage src={entry.card.image} alt={entry.card.name} fallbackColor={entry.card.color} className="w-full h-full" />
                      : <div className="w-full h-full rounded" style={{ background: `linear-gradient(135deg, ${entry.card.color}40, ${entry.card.color}15)` }}><CreditCard className="w-3 h-3 mx-auto mt-0.5" style={{ color: entry.card.color }} /></div>}
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
                </div>
                <p className="text-[11px] font-semibold truncate">{entry.card.name}</p>
                <p className="text-[9px] text-muted-foreground">{entry.card.issuer}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ---- STATS GRID 2x2 ---- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="grid grid-cols-2 gap-2.5 mt-4">
        {[
          { label: "Annual Fees", value: `\u20B9${fmtShort(totalFees)}`, sub: "/year", icon: IndianRupee, accent: false },
          { label: "Rewards Earned", value: `\u20B9${fmtShort(totalRewardsEarned > 0 ? totalRewardsEarned : estimatedAnnualValue)}`, sub: totalRewardsEarned > 0 ? "earned" : "est.", icon: Sparkles, accent: true },
          { label: "Net Value", value: `${netValue >= 0 ? "+" : ""}\u20B9${fmtShort(Math.abs(netValue))}`, sub: "/year", icon: TrendingUp, accent: netValue > 0 },
          { label: "Total Tracked", value: `\u20B9${fmtShort(totalExpenses)}`, sub: `${expenses.length} txns`, icon: Receipt, accent: false },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.05 }} className={`glass-card rounded-xl p-3 border ${s.accent ? "border-gold/20 bg-gold/5" : "border-border/15"}`}>
            <s.icon className={`w-3.5 h-3.5 mb-1.5 ${s.accent ? "text-gold" : "text-muted-foreground"}`} />
            <p className={`text-base font-serif font-bold ${s.accent ? "text-gold" : ""}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label} <span className="opacity-60">{s.sub}</span></p>
          </motion.div>
        ))}
      </motion.div>

      {/* ---- EXPENSE TRACKER ---- */}
      {activeEntry && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-sm font-bold">Expenses</h2>
            </div>
            <AddExpenseDialog cardId={activeEntry.cardId} cardName={activeEntry.card.name} cardColor={activeEntry.card.color} onAdd={addExpense} trigger={
              <button className="text-xs py-1.5 px-3 rounded-lg gold-btn font-semibold flex items-center gap-1.5 shadow-md shadow-gold/10"><Plus className="w-3.5 h-3.5" /> Add</button>
            } />
          </div>
          {/* Summary bar */}
          <div className="glass-card rounded-xl border border-border/15 p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded overflow-hidden flex-shrink-0">
                  {activeEntry.card.image ? <CardImage src={activeEntry.card.image} alt={activeEntry.card.name} fallbackColor={activeEntry.card.color} className="w-full h-full" /> : <div className="w-full h-full rounded" style={{ background: activeEntry.card.color }} />}
                </div>
                <span className="text-[10px] font-semibold truncate max-w-[120px]">{activeEntry.card.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>{cardExpenseSummary.count} txns</span>
                <span className="text-gold font-semibold">+{"\u20B9"}{inr(cardExpenseSummary.rewards)} rewards</span>
              </div>
            </div>
          </div>
          {/* Month pills */}
          {availableMonths.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-3">
              <button onClick={() => setSelectedMonth("all")} className={`flex-shrink-0 text-[10px] px-3 py-1 rounded-full font-medium border transition-all ${selectedMonth === "all" ? "border-gold/40 bg-gold/10 text-gold" : "border-border/20 text-muted-foreground"}`}>All</button>
              {availableMonths.map((mk) => { const [y, m] = mk.split("-"); return (
                <button key={mk} onClick={() => setSelectedMonth(mk)} className={`flex-shrink-0 text-[10px] px-3 py-1 rounded-full font-medium border transition-all ${selectedMonth === mk ? "border-gold/40 bg-gold/10 text-gold" : "border-border/20 text-muted-foreground"}`}>{MONTHS[parseInt(m)]} {y.slice(2)}</button>
              ); })}
            </div>
          )}
          {/* Expense list */}
          <AnimatePresence mode="wait">
            <motion.div key={`${activeEntry.cardId}-${selectedMonth}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {cardExpenses.length > 0 ? (
                <div className="glass-card rounded-xl border border-border/15 divide-y divide-border/10 overflow-hidden">
                  {cardExpenses.map((exp, i) => {
                    const CatIcon = CATEGORY_ICONS[exp.category] ?? Package;
                    const reward = rewardForExpense(exp.amount, exp.category, activeEntry.v3, activeBaseRate);
                    const dateStr = new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                    return (
                      <motion.div key={exp.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 px-3 py-3 group">
                        <div className="w-9 h-9 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0"><CatIcon className="w-4 h-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{exp.merchant}</p>
                          <p className="text-[10px] text-muted-foreground">{dateStr}{exp.note ? ` \u00B7 ${exp.note}` : ""}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold">{"\u20B9"}{inr(exp.amount)}</p>
                          <p className="text-[9px] text-gold font-medium">+{"\u20B9"}{reward.toFixed(1)}</p>
                        </div>
                        <button onClick={() => deleteExpense(exp.id)} className="p-1.5 rounded-lg opacity-40 active:opacity-100 hover:opacity-100 hover:bg-red-500/15 transition-all flex-shrink-0" aria-label={`Delete expense ${exp.merchant}`}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-card rounded-xl border border-border/15 p-8 text-center">
                  <Receipt className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No expenses {selectedMonth !== "all" ? "this month" : "yet"}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Tap the gold button to add one</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* ---- SPENDING DONUT ---- */}
      {spendingByCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5">
          <h2 className="font-serif text-sm font-bold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gold" /> Spending Breakdown</h2>
          <div className="glass-card rounded-xl border border-border/15 p-4">
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[120px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value" stroke="none">
                      {spendingByCategory.map((_, idx) => <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                {spendingByCategory.slice(0, 5).map((item, idx) => {
                  const total = spendingByCategory.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={item.category} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                      <span className="text-[10px] truncate flex-1">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{pct}%</span>
                    </div>
                  );
                })}
                {spendingByCategory.length > 5 && <p className="text-[9px] text-muted-foreground/50">+{spendingByCategory.length - 5} more</p>}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---- BEST CARD PER CATEGORY ---- */}
      {bestPerCategory.length > 0 && myCardObjects.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-5">
          <h2 className="font-serif text-sm font-bold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-gold" /> Best Card Per Category</h2>
          <div className="space-y-2">
            {bestPerCategory.map((b) => {
              const CatIcon = CATEGORY_ICONS[b.category] ?? Package;
              return (
                <div key={b.category} className="glass-card rounded-xl px-3 py-2.5 border border-border/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0"><CatIcon className="w-4 h-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate">{b.cardName}</p>
                    <p className="text-[10px] text-muted-foreground">{b.catLabel.replace(/^[^\s]+\s/, "")}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[11px] text-gold font-bold">{b.rate.toFixed(1)}%</span>
                    <p className="text-[9px] text-muted-foreground">back</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ---- REWARD EFFICIENCY ---- */}
      {expenses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5">
          <h2 className="font-serif text-sm font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-gold" /> Reward Efficiency</h2>
          <div className="glass-card rounded-xl border border-border/15 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold">{rewardEfficiency.message}</span>
              <span className="text-sm font-serif font-bold text-gold">{rewardEfficiency.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary/40 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${rewardEfficiency.score}%` }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, #D4AF37, ${rewardEfficiency.score >= 60 ? "#4ADE80" : rewardEfficiency.score >= 30 ? "#D4AF37" : "#F87171"})` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-muted-foreground">{"\u20B9"}{inr(totalRewardsEarned)} earned on {"\u20B9"}{inr(totalExpenses)} spend</span>
              <span className="text-[9px] text-muted-foreground">Score: {rewardEfficiency.score}/100</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---- FAB ---- */}
      {activeEntry && (
        <AddExpenseDialog cardId={activeEntry.cardId} cardName={activeEntry.card.name} cardColor={activeEntry.card.color} onAdd={addExpense} trigger={
          <button className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gold-btn shadow-xl shadow-gold/20 flex items-center justify-center" aria-label="Add expense"><Plus className="w-6 h-6" /></button>
        } />
      )}

      {/* ---- ADD CARDS DIALOG ---- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}><AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} /></Dialog>
    </div>
  );
}
