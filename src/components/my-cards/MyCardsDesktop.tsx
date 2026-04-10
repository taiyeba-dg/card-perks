import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CreditCard, Trash2, Wallet, Receipt, IndianRupee, TrendingUp,
  UtensilsCrossed, Plane, ShoppingBag, ShoppingCart, Fuel, Tv,
  Lock, Calendar, Award, Zap, BarChart3, PieChart as PieIcon, Lightbulb,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import { useMyCards } from "@/hooks/use-my-cards";
import { useFavorites } from "@/hooks/use-favorites";
import { useExpenses, CATEGORIES, type Expense } from "@/hooks/use-expenses";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import type { CardV3Data } from "@/data/card-v3-types";
import CardImage from "@/components/CardImage";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import { Dialog } from "@/components/ui/dialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import { USER_SPEND_TO_V3, CATEGORY_COLORS } from "@/data/category-config";
import { PIE_COLORS } from "@/data/color-schemes";
import "./my-cards.css";

/* ── Constants ── */
const SPEND_CATEGORIES = [
  { key: "dining",        label: "Dining",        icon: UtensilsCrossed, color: CATEGORY_COLORS.dining },
  { key: "travel",        label: "Travel",        icon: Plane,           color: CATEGORY_COLORS.travel },
  { key: "online",        label: "Online",        icon: ShoppingBag,     color: CATEGORY_COLORS.online },
  { key: "grocery",       label: "Grocery",       icon: ShoppingCart,    color: CATEGORY_COLORS.grocery },
  { key: "fuel",          label: "Fuel",          icon: Fuel,            color: CATEGORY_COLORS.fuel },
  { key: "entertainment", label: "Entertainment", icon: Tv,              color: CATEGORY_COLORS.entertainment },
] as const;

const CAT_ICONS: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag, food: UtensilsCrossed, travel: Plane, fuel: Fuel,
  electronics: Tv, entertainment: Tv, bills: Receipt, groceries: ShoppingCart,
  health: Zap, others: Receipt,
};

/* ── Helpers ── */
function parseFee(fee: string): number {
  const n = fee.replace(/[^\d]/g, "");
  return n ? parseInt(n, 10) : 0;
}
function fmtINR(v: number): string {
  return `\u20B9${Math.round(v).toLocaleString("en-IN")}`;
}
function fmtCompact(v: number): string {
  if (v >= 100_000) return `\u20B9${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `\u20B9${(v / 1_000).toFixed(1)}K`;
  return fmtINR(v);
}
function groupByDate(exps: Expense[]): [string, Expense[]][] {
  const map = new Map<string, Expense[]>();
  for (const e of exps) { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date)!.push(e); }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}
function getRewardForExpense(expense: Expense, myCards: { cardId: string; v3: CardV3Data | undefined }[]): number {
  const cardObj = myCards.find(c => c.cardId === expense.cardId);
  if (!cardObj?.v3) return 0;
  const v3Key = USER_SPEND_TO_V3[expense.category] || "base";
  const cats = cardObj.v3.categories as Record<string, { rate: number }> | undefined;
  const rate = cats?.[v3Key]?.rate ?? cardObj.v3.baseRate;
  return Math.round(expense.amount * rate / 100);
}

/* ── Animated counter hook ── */
function useAnimatedCount(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.round(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

/* ── Custom tooltip ── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-border/20">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>{fmtINR(p.value)}</p>
      ))}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function MyCardsDesktop() {
  const { has, toggle, count, myCardObjects, estimatedAnnualValue } = useMyCards();
  const { isFav, toggle: toggleFav } = useFavorites("card");
  const { expenses, addExpense, deleteExpense, getByCard, totalByCard } = useExpenses();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [trendMode, setTrendMode] = useState<"spend" | "reward">("spend");

  useEffect(() => {
    if (selectedCardId && !has(selectedCardId)) setSelectedCardId(null);
  }, [selectedCardId, has]);

  /* ── Derived stats ── */
  const totalAnnualFees = useMemo(
    () => myCardObjects.reduce((s, e) => s + (e.v3?.fees.annual ?? parseFee(e.card.fee)), 0),
    [myCardObjects],
  );
  const allMyExpenses = useMemo(
    () => expenses.filter(e => myCardObjects.some(c => c.cardId === e.cardId)),
    [expenses, myCardObjects],
  );
  const filteredExpenses = useMemo(
    () => selectedCardId ? allMyExpenses.filter(e => e.cardId === selectedCardId) : allMyExpenses,
    [allMyExpenses, selectedCardId],
  );
  const totalTracked = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses]);
  const totalRewards = useMemo(
    () => filteredExpenses.reduce((s, e) => s + getRewardForExpense(e, myCardObjects), 0),
    [filteredExpenses, myCardObjects],
  );
  const netValue = estimatedAnnualValue - totalAnnualFees;

  /* Animated counts */
  const animFees = useAnimatedCount(totalAnnualFees);
  const animRewards = useAnimatedCount(totalRewards);
  const animNet = useAnimatedCount(Math.abs(netValue));
  const animTracked = useAnimatedCount(totalTracked);

  /* Current month stats */
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleDateString("en-IN", { month: "long" });
  const monthExpenses = useMemo(() => filteredExpenses.filter(e => e.date.startsWith(currentMonth)), [filteredExpenses, currentMonth]);
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthRewards = monthExpenses.reduce((s, e) => s + getRewardForExpense(e, myCardObjects), 0);

  /* Grouped expenses */
  const grouped = useMemo(() => groupByDate(filteredExpenses).slice(0, 8), [filteredExpenses]);

  /* ── Charts data ── */
  const rewardsByCard = useMemo(() => {
    return myCardObjects.map(c => {
      const exps = allMyExpenses.filter(e => e.cardId === c.cardId);
      const reward = exps.reduce((s, e) => s + getRewardForExpense(e, myCardObjects), 0);
      return { name: c.card.name.length > 18 ? c.card.name.slice(0, 16) + ".." : c.card.name, reward, fill: c.card.color };
    }).filter(c => c.reward > 0).sort((a, b) => b.reward - a.reward).slice(0, 6);
  }, [myCardObjects, allMyExpenses]);

  const spendingBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([cat, amount], i) => ({
      name: CATEGORIES.find(c => c.value === cat)?.label.replace(/^[^\s]+\s/, "") || cat,
      value: amount,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  /* Reward efficiency */
  const efficiency = totalTracked > 0 ? Math.min((totalRewards / totalTracked) * 100, 15) : 0;
  const effScore = Math.round(efficiency * 100 / 15);
  const effMsg = effScore >= 70 ? "Excellent optimization" : effScore >= 40 ? "Room for improvement" : "Consider using category cards";

  /* Best card per category */
  const bestCardFor = useMemo(() => {
    return SPEND_CATEGORIES.map(cat => {
      let bestName = "", bestRate = 0, bestId = "", bestColor = "";
      for (const entry of myCardObjects) {
        const cats = entry.v3?.categories as Record<string, { rate: number }> | undefined;
        const rate = cats?.[cat.key]?.rate ?? 0;
        if (rate > bestRate) { bestRate = rate; bestName = entry.card.name; bestId = entry.cardId; bestColor = entry.card.color; }
      }
      return { ...cat, cardName: bestName, cardId: bestId, rate: bestRate, cardColor: bestColor };
    }).filter(b => b.rate > 0);
  }, [myCardObjects]);

  /* Daily trend */
  const dailyTrend = useMemo(() => {
    const map = new Map<string, { spend: number; reward: number }>();
    filteredExpenses.forEach(e => {
      const d = e.date;
      const prev = map.get(d) || { spend: 0, reward: 0 };
      map.set(d, { spend: prev.spend + e.amount, reward: prev.reward + getRewardForExpense(e, myCardObjects) });
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([d, v]) => ({
      date: new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      ...v,
    }));
  }, [filteredExpenses, myCardObjects]);

  /* Smart insights */
  const insights = useMemo(() => {
    const result: { title: string; desc: string; color: string }[] = [];
    if (spendingBreakdown.length > 0) {
      const top = spendingBreakdown[0];
      result.push({ title: "Top Category", desc: `${top.name} dominates at ${fmtINR(top.value)} spent`, color: "#F8C534" });
    }
    const underused = myCardObjects.filter(c => {
      const exps = allMyExpenses.filter(e => e.cardId === c.cardId);
      return exps.length === 0;
    });
    if (underused.length > 0) {
      result.push({ title: "Underused Cards", desc: `${underused.map(u => u.card.name).slice(0, 2).join(", ")} ${underused.length > 2 ? `+${underused.length - 2} more` : ""} have no expenses`, color: "#E23744" });
    }
    if (efficiency > 0) {
      result.push({ title: "Reward Rate", desc: `You're earning ${efficiency.toFixed(2)}% back on tracked spend`, color: "#10B981" });
    }
    return result.slice(0, 3);
  }, [spendingBreakdown, myCardObjects, allMyExpenses, efficiency]);

  /* ── Active card for AddExpense ── */
  const activeCard = useMemo(() => {
    if (selectedCardId) return myCardObjects.find(c => c.cardId === selectedCardId);
    return myCardObjects[0];
  }, [selectedCardId, myCardObjects]);

  /* ── Empty state ── */
  if (count === 0) {
    return (
      <div className="hidden lg:flex">
        <div className="flex items-center justify-center min-h-[70vh] w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">Your wallet is empty</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Add your credit cards to track rewards, log expenses, and discover the best card for every purchase.
            </p>
            <button onClick={() => setAddOpen(true)} className="gold-btn px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Your First Card
            </button>
            <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Your data stays on this device
            </p>
          </motion.div>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} />
        </Dialog>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="hidden lg:flex">
      <div className="mc-desktop w-full">
        {/* ─── Sidebar ─── */}
        <aside className="mc-sidebar" style={{ width: 300 }}>
          <div className="p-5 pb-0">
            <h1 className="font-serif text-xl font-bold mb-4">My Wallet</h1>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="glass-card rounded-lg p-2.5 text-center border border-border/10">
                <p className="text-sm font-bold">{count}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Cards</p>
              </div>
              <div className="glass-card rounded-lg p-2.5 text-center border border-border/10">
                <p className="text-sm font-bold">{fmtCompact(totalAnnualFees)}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Fees</p>
              </div>
              <div className="glass-card rounded-lg p-2.5 text-center border border-border/10">
                <p className="text-sm font-bold text-gold">{fmtCompact(totalRewards)}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Rewards</p>
              </div>
            </div>
          </div>

          {/* Card list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ scrollbarWidth: "thin" }}>
            {myCardObjects.map((entry, i) => {
              const active = entry.cardId === selectedCardId;
              const rate = entry.v3?.baseRate ?? (parseFloat(entry.card.rewardRate) || 0);
              return (
                <motion.div
                  key={entry.cardId}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all mb-1 ${active ? "bg-gold/10 border border-gold/20" : "hover:bg-white/[0.04] border border-transparent"}`}
                  onClick={() => setSelectedCardId(active ? null : entry.cardId)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, ${entry.card.color}18, ${entry.card.color}06)` }}>
                    {entry.card.image ? (
                      <CardImage src={entry.card.image} alt={entry.card.name} fallbackColor={entry.card.color} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><CreditCard className="w-5 h-5" style={{ color: `${entry.card.color}60` }} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{entry.card.name}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.card.issuer}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gold flex-shrink-0">{rate.toFixed(1)}%</span>
                </motion.div>
              );
            })}
          </div>

          {/* Add Card button */}
          <div className="p-3 border-t border-border/10">
            <button onClick={() => setAddOpen(true)} className="gold-btn w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Card
            </button>
          </div>
        </aside>

        {/* ─── Main Panel ─── */}
        <main className="mc-main flex-1 p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">

            {/* ── 1. Stat Cards ── */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={<IndianRupee className="w-4 h-4" />} label="Annual Fees" value={fmtCompact(animFees)} accent="red" />
              <StatCard icon={<Award className="w-4 h-4" />} label="Rewards Earned" value={fmtCompact(animRewards)} accent="gold" />
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Net Value" value={`${netValue >= 0 ? "+" : "-"}${fmtCompact(animNet)}`} accent={netValue >= 0 ? "green" : "red"} />
              <StatCard icon={<Receipt className="w-4 h-4" />} label="Total Tracked" value={fmtCompact(animTracked)} accent="blue" />
            </div>

            {/* ── 2. Expense Tracker (hero) ── */}
            <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gold" /> Expense Tracker
                </h2>
                {activeCard && (
                  <AddExpenseDialog
                    cardId={activeCard.cardId}
                    cardName={activeCard.card.name}
                    cardColor={activeCard.card.color}
                    onAdd={addExpense}
                    trigger={
                      <button className="gold-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    }
                  />
                )}
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Month</p>
                  <p className="text-sm font-semibold">{monthName}</p>
                </div>
                <div className="text-center px-3 border-l border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Txns</p>
                  <p className="text-sm font-semibold">{monthExpenses.length}</p>
                </div>
                <div className="text-center px-3 border-l border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rewards</p>
                  <p className="text-sm font-semibold text-gold">{fmtINR(monthRewards)}</p>
                </div>
                <div className="text-center px-3 border-l border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-semibold">{fmtINR(monthTotal)}</p>
                </div>
              </div>

              {/* Expense list grouped by date */}
              {grouped.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                  {grouped.map(([date, exps]) => (
                    <div key={date}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {fmtDate(date)}
                      </p>
                      <div className="space-y-1">
                        {exps.map(exp => {
                          const cardObj = myCardObjects.find(c => c.cardId === exp.cardId);
                          const CatIcon = CAT_ICONS[exp.category] || Receipt;
                          const reward = getRewardForExpense(exp, myCardObjects);
                          return (
                            <div key={exp.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                <CatIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{exp.merchant}</p>
                                <div className="flex items-center gap-1.5">
                                  {cardObj && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${cardObj.card.color}15`, color: cardObj.card.color }}>
                                      {cardObj.card.name.length > 20 ? cardObj.card.name.slice(0, 18) + ".." : cardObj.card.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold">{fmtINR(exp.amount)}</p>
                                {reward > 0 && <p className="text-[10px] text-gold">+{fmtINR(reward)}</p>}
                              </div>
                              <button
                                onClick={() => deleteExpense(exp.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                                aria-label="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No expenses logged yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click "+ Add" to start tracking</p>
                </div>
              )}
            </div>

            {/* ── 3. Charts row ── */}
            {(rewardsByCard.length > 0 || spendingBreakdown.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {/* Rewards by Card — horizontal bar */}
                {rewardsByCard.length > 0 && (
                  <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
                    <h3 className="text-sm font-serif font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gold" /> Rewards by Card
                    </h3>
                    <ResponsiveContainer width="100%" height={rewardsByCard.length * 40 + 20}>
                      <BarChart data={rewardsByCard} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} cursor={false} />
                        <Bar dataKey="reward" radius={[0, 6, 6, 0]} barSize={18}>
                          {rewardsByCard.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} fillOpacity={0.7} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Spending Breakdown — donut */}
                {spendingBreakdown.length > 0 && (
                  <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
                    <h3 className="text-sm font-serif font-bold mb-4 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-gold" /> Spending Breakdown
                    </h3>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={spendingBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                            {spendingBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5">
                        {spendingBreakdown.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                            <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
                            <span className="font-semibold">{fmtCompact(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 4. Reward Efficiency ── */}
            {totalTracked > 0 && (
              <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-serif font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" /> Reward Efficiency
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted-foreground) / 0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--gold))" strokeWidth="8"
                        strokeDasharray={`${effScore * 2.64} ${264 - effScore * 2.64}`}
                        strokeLinecap="round" className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gold">{effScore}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{effMsg}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earning {fmtINR(totalRewards)} on {fmtINR(totalTracked)} tracked spend ({efficiency.toFixed(2)}% back)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. Best Card by Category ── */}
            {bestCardFor.length > 0 && (
              <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-serif font-bold mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" /> Best Card by Category
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {bestCardFor.map(item => (
                    <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium truncate">{item.cardName}</p>
                      </div>
                      <span className="text-sm font-bold text-gold flex-shrink-0">{item.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 6. Daily Trend ── */}
            {dailyTrend.length > 1 && (
              <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-serif font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold" /> Daily Trend
                  </h3>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      onClick={() => setTrendMode("spend")}
                      className={`px-3 py-1 rounded-full transition-all ${trendMode === "spend" ? "bg-gold/15 text-gold font-semibold border border-gold/20" : "text-muted-foreground hover:text-foreground"}`}
                    >Spend</button>
                    <button
                      onClick={() => setTrendMode("reward")}
                      className={`px-3 py-1 rounded-full transition-all ${trendMode === "reward" ? "bg-gold/15 text-gold font-semibold border border-gold/20" : "text-muted-foreground hover:text-foreground"}`}
                    >Reward</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyTrend} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={trendMode}
                      stroke="hsl(var(--gold))"
                      strokeWidth={2}
                      fill="url(#trendGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── 7. Smart Insights ── */}
            {insights.length > 0 && (
              <div>
                <h3 className="text-sm font-serif font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-gold" /> Smart Insights
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {insights.map((ins, i) => (
                    <div key={i} className="glass-card rounded-xl border border-white/[0.06] p-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: ins.color }} />
                      <p className="text-xs font-semibold mb-1 pl-2">{ins.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pl-2">{ins.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} />
      </Dialog>
    </div>
  );
}

/* ================================================================
   Stat Card
   ================================================================ */
function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string;
  accent: "gold" | "green" | "red" | "blue";
}) {
  const styles = {
    gold:  { bg: "bg-gold/10", text: "text-gold", border: "border-gold/20" },
    green: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    red:   { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    blue:  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  };
  const s = styles[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-xl border ${s.border} p-4`}
    >
      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2.5 ${s.text}`}>{icon}</div>
      <p className={`text-lg font-bold ${s.text}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </motion.div>
  );
}
