import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Star, Plus, Wallet, X, Eye,
  GitCompare, TrendingUp, IndianRupee, Sparkles, BarChart3, Calendar,
  ShoppingBag, UtensilsCrossed, Fuel, Plane, Trash2, Receipt, Target
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import CardImage from "@/components/CardImage";
import FavoriteButton from "@/components/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import { CardTracker, WalletSummary } from "@/components/my-cards/MilestoneTracker";
import { getMasterCard } from "@/data/card-v3-master";
import {
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Area, AreaChart,
} from "recharts";
import type { CreditCard as CardType } from "@/data/cards";
import type { Expense } from "@/hooks/use-expenses";
import { CATEGORIES } from "@/hooks/use-expenses";
import { cards } from "@/data/cards";

const monthlyTrend = [
  { month: "Sep", spend: 32500, rewards: 980 },
  { month: "Oct", spend: 38900, rewards: 1170 },
  { month: "Nov", spend: 51200, rewards: 1590 },
  { month: "Dec", spend: 67800, rewards: 2240 },
  { month: "Jan", spend: 45600, rewards: 1410 },
  { month: "Feb", spend: 53200, rewards: 1750 },
];

const categoryIcons: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag, food: UtensilsCrossed, fuel: Fuel, travel: Plane,
};

function parseRewardPct(rewardStr: string): number {
  const match = rewardStr.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) / 100 : 0.033;
}

interface Props {
  myCards: CardType[];
  isMyCard: (id: string) => boolean;
  toggleMyCard: (id: string) => void;
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  getByCard: (cardId: string) => Expense[];
  totalByCard: (cardId: string) => number;
  totalSpend: number;
  totalRewards: number;
  myExpenses: Expense[];
  groupedExpenses: [string, Expense[]][];
  categoryBreakdown: { name: string; value: number; color: string }[];
  totalCatSpend: number;
  catMapSize: number;
}

export default function DesktopMyCardsLayout({
  myCards, isMyCard, toggleMyCard, isFav, toggleFav,
  addExpense, deleteExpense, getByCard, totalByCard,
  totalSpend, totalRewards, myExpenses, groupedExpenses,
  categoryBreakdown, totalCatSpend, catMapSize,
}: Props) {
  return (
    <div className="hidden md:block">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="flex flex-row items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/25 to-gold/5 flex items-center justify-center mb-5 shadow-lg shadow-gold/10"
            >
              <Wallet className="w-7 h-7 text-gold" />
            </motion.div>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-3">Your Wallet</p>
            <h1 className="font-serif text-5xl font-bold mb-3 tracking-tight">
              My <span className="gold-gradient">Cards</span>
            </h1>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              Track your cards, monitor spending, and maximize rewards — all in one place.
            </p>
          </div>
          {myCards.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 border border-gold/10">
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-gold">{myCards.length}</p>
                  <p className="text-[10px] text-muted-foreground">Cards Added</p>
                </div>
              </div>
              {totalSpend > 0 && (
                <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 border border-border/20">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold">₹{(totalSpend / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-muted-foreground">Total Spend</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {myCards.length === 0 ? (
        <EmptyWalletDesktop isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
      ) : (
        <>
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-3 mb-12">
            {[
              { label: "Rewards Earned", value: totalRewards > 0 ? `₹${totalRewards.toLocaleString()}` : "₹0", icon: Sparkles, accent: true },
              { label: "Expenses Logged", value: `${myExpenses.length}`, icon: TrendingUp, accent: false },
              { label: "Categories Used", value: `${catMapSize}`, icon: BarChart3, accent: false },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className={`glass-card rounded-2xl p-5 border border-border/20 hover:border-gold/20 transition-all duration-300 group ${stat.accent ? "ring-1 ring-gold/15" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${stat.accent ? "bg-gold/20 shadow-lg shadow-gold/10" : "bg-gold/10"}`}>
                    <stat.icon className="w-4 h-4 text-gold" />
                  </div>
                </div>
                <p className={`text-2xl font-serif font-bold ${stat.accent ? "text-gold" : ""}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="cards" className="w-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <TabsList className="bg-secondary/30 border border-border/30 mb-8">
                <TabsTrigger value="cards" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-2">
                  <CreditCard className="w-4 h-4" /> My Cards
                </TabsTrigger>
                <TabsTrigger value="tracker" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-2">
                  <Target className="w-4 h-4" /> Milestone Tracker
                </TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-2">
                  <BarChart3 className="w-4 h-4" /> Expense Tracker
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Cards Tab */}
            <TabsContent value="cards">
              <div className="grid grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {myCards.map((card, i) => {
                    const cardExpenses = getByCard(card.id);
                    const cardTotal = totalByCard(card.id);
                    const rewardPct = parseRewardPct(card.rewards);
                    const cardRewards = Math.round(cardTotal * rewardPct);
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ delay: i * 0.08 }}
                        layout
                        className="group relative"
                      >
                        <div className="absolute -inset-[1px] rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${card.color}30, transparent 50%, ${card.color}10)` }} />
                        <div className="relative glass-card rounded-[22px] overflow-hidden border border-border/20 hover:border-border/40 transition-all duration-500 hover:-translate-y-0.5">
                          <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}40)` }} />
                          <div className="flex items-stretch gap-0" style={{ background: `linear-gradient(135deg, ${card.color}18, ${card.color}06, transparent)` }}>
                            <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center p-3">
                              {card.image ? (
                                <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor={card.color} />
                              ) : (
                                <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${card.color}40, ${card.color}15)` }}>
                                  <CreditCard className="w-10 h-10 opacity-30" style={{ color: card.color }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-4 pr-4 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground leading-tight truncate">{card.name}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{card.issuer}</p>
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Star className="w-3 h-3 text-gold fill-gold" />
                                    <span className="text-[10px] font-semibold text-gold">{card.rating}</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">{card.network}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <FavoriteButton isFav={isFav(card.id)} onToggle={() => toggleFav(card.id)} className="bg-secondary/50 hover:bg-secondary" />
                                  <button onClick={() => toggleMyCard(card.id)} className="p-1.5 rounded-lg bg-secondary/50 hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-400" title="Remove from My Cards">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-gold/10 text-gold font-semibold">{card.fee}/yr</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground">{card.rewards}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground">{card.lounge} lounge</span>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 pb-5 pt-4">
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="rounded-xl p-3 bg-secondary/20 border border-border/15">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Spend</p>
                                <p className="text-base font-serif font-bold">{cardTotal > 0 ? `₹${(cardTotal / 1000).toFixed(1)}K` : "₹0"}</p>
                              </div>
                              <div className="rounded-xl p-3 bg-secondary/20 border border-border/15">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Expenses</p>
                                <p className="text-base font-serif font-bold">{cardExpenses.length}</p>
                              </div>
                              <div className="rounded-xl p-3 border border-gold/15" style={{ background: `linear-gradient(135deg, hsl(var(--gold) / 0.06), transparent)` }}>
                                <p className="text-[9px] text-gold uppercase tracking-wider mb-1 font-semibold">Rewards</p>
                                <p className="text-base font-serif font-bold text-gold">{cardRewards > 0 ? `~₹${cardRewards.toLocaleString()}` : "₹0"}</p>
                              </div>
                            </div>

                            {cardExpenses.length > 0 && (
                              <div className="mb-4 space-y-1.5">
                                {cardExpenses.slice(0, 3).map((exp) => {
                                  const catLabel = CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category;
                                  return (
                                    <div key={exp.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-secondary/10 transition-colors group/txn">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[10px]">{catLabel.split(" ")[0]}</span>
                                        <span className="text-xs font-medium truncate">{exp.merchant}</span>
                                        <span className="text-[9px] text-muted-foreground">{exp.date}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold">-₹{exp.amount.toLocaleString()}</span>
                                        <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover/txn:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all">
                                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {cardExpenses.length > 3 && (
                                  <p className="text-[10px] text-muted-foreground text-center pt-1">+{cardExpenses.length - 3} more</p>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <AddExpenseDialog cardId={card.id} cardName={card.name} cardColor={card.color} onAdd={addExpense} />
                              <Link to={`/cards/${card.id}`} className="flex-1 text-xs py-2.5 rounded-xl gold-outline-btn flex items-center justify-center gap-1.5 font-semibold">
                                <Eye className="w-3.5 h-3.5" /> Details
                              </Link>
                              <Link to={`/compare?cards=${card.id}`} className="flex-1 text-xs py-2.5 rounded-xl gold-btn flex items-center justify-center gap-1.5 font-semibold shadow-md shadow-gold/10">
                                <GitCompare className="w-3.5 h-3.5" /> Compare
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="h-full min-h-[200px] w-full glass-card rounded-[22px] flex flex-col items-center justify-center gap-4 hover:border-gold/30 transition-all group border border-dashed border-border/40 hover:border-solid cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-all group-hover:scale-110 duration-300">
                          <Plus className="w-6 h-6 text-gold" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors block">Add More Cards</span>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">Pick from catalog</span>
                        </div>
                      </button>
                    </DialogTrigger>
                    <AddCardsDialogContent isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
                  </Dialog>
                </motion.div>
              </div>
            </TabsContent>

            {/* Milestone Tracker Tab */}
            <TabsContent value="tracker">
              <TrackerTabContent myCards={myCards} />
            </TabsContent>

            {/* Expense Tracker Tab */}
            <TabsContent value="expenses">
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
                  {myCards.map((card) => (
                    <AddExpenseDialog
                      key={card.id}
                      cardId={card.id}
                      cardName={card.name}
                      cardColor={card.color}
                      onAdd={addExpense}
                      trigger={
                        <button className="text-xs py-2 px-4 rounded-xl border border-border/30 hover:border-gold/30 hover:bg-gold/5 transition-all flex items-center gap-2 font-medium">
                          <div className="w-4 h-2.5 rounded-sm" style={{ background: card.color }} />
                          <Plus className="w-3 h-3 text-gold" /> {card.name}
                        </button>
                      }
                    />
                  ))}
                </motion.div>

                {totalSpend === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        <Receipt className="w-10 h-10 text-gold/40" />
                      </motion.div>
                      <motion.div
                        className="absolute -inset-3 rounded-2xl border border-gold/10"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                      />
                    </div>
                    <p className="font-serif text-xl font-bold mb-2">No expenses logged yet</p>
                    <p className="text-sm text-muted-foreground mb-2">Start tracking your spending on each card</p>
                    <p className="text-[10px] text-gold/70 mb-6 max-w-xs mx-auto">💡 Pro tip: Log expenses by category to see which card earns you the best rewards</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {myCards.slice(0, 3).map((card) => (
                        <AddExpenseDialog
                          key={card.id}
                          cardId={card.id}
                          cardName={card.name}
                          cardColor={card.color}
                          onAdd={addExpense}
                          trigger={
                            <button className="text-xs py-2.5 px-4 rounded-xl gold-outline-btn flex items-center gap-2 font-medium">
                              <div className="w-3 h-2 rounded-sm" style={{ background: card.color }} />
                              <Plus className="w-3 h-3" /> {card.name}
                            </button>
                          }
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Monthly Trend Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-[22px] p-6 border border-border/20">
                      <h3 className="font-serif text-lg font-bold mb-1">Monthly Spending Trend</h3>
                      <p className="text-[10px] text-muted-foreground mb-6">Spend vs rewards over the last 6 months</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.15)" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.2)", borderRadius: 12, fontSize: 12 }} formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name === "spend" ? "Spend" : "Rewards"]} />
                          <Area type="monotone" dataKey="spend" stroke="hsl(var(--gold))" strokeWidth={2} fill="url(#spendGrad)" />
                          <Area type="monotone" dataKey="rewards" stroke="#4ade80" strokeWidth={2} fill="url(#rewardGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-5 mt-3 justify-center">
                        <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full bg-gold" /><span className="text-[10px] text-muted-foreground">Spend</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full bg-green-400" /><span className="text-[10px] text-muted-foreground">Rewards</span></div>
                      </div>
                    </motion.div>

                    {/* Charts row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-[22px] p-6 border border-border/20">
                        <h3 className="font-serif text-lg font-bold mb-1">Card-wise Spending</h3>
                        <p className="text-[10px] text-muted-foreground mb-6">Spend by card</p>
                        <div className="space-y-3">
                          {myCards.map((card) => {
                            const spend = totalByCard(card.id);
                            const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
                            return (
                              <div key={card.id} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg flex-shrink-0 shadow-md overflow-hidden bg-secondary/30">
                                  {card.image ? (
                                    <CardImage src={card.image} alt="" fallbackColor={card.color} />
                                  ) : (
                                    <div style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}AA)` }} className="w-full h-full" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold truncate">{card.name}</span>
                                    <span className="text-xs font-bold">₹{spend > 0 ? (spend / 1000).toFixed(1) + "K" : "0"}</span>
                                  </div>
                                  <div
                                    className="h-2 bg-secondary/30 rounded-full overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={pct}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${card.name} spending: ${pct.toFixed(0)}%`}
                                  >
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.8, delay: 0.3 }}
                                      className="h-full rounded-full"
                                      style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}BB)` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>

                      {categoryBreakdown.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-[22px] p-6 border border-border/20">
                          <h3 className="font-serif text-lg font-bold mb-1">Category Breakdown</h3>
                          <p className="text-[10px] text-muted-foreground mb-6">Where your money goes</p>
                          <div className="flex items-center gap-6">
                            <ResponsiveContainer width={130} height={130}>
                              <RePieChart>
                                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" stroke="none" paddingAngle={2}>
                                  {categoryBreakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
                                </Pie>
                              </RePieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                              {categoryBreakdown.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold">₹{(cat.value / 1000).toFixed(1)}K</span>
                                    {totalCatSpend > 0 && <span className="text-[9px] text-muted-foreground ml-1.5">({((cat.value / totalCatSpend) * 100).toFixed(0)}%)</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* All expenses grouped by date */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-[22px] p-6 border border-border/20">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-serif text-lg font-bold">All Expenses</h3>
                          <p className="text-[10px] text-muted-foreground mt-1">Across all your cards</p>
                        </div>
                        <span className="text-[10px] px-3 py-1 rounded-full bg-secondary/40 text-muted-foreground font-medium">{myExpenses.length} entries</span>
                      </div>
                      <div className="space-y-1">
                        {groupedExpenses.map(([date, dateExpenses]) => {
                          const dayTotal = dateExpenses.reduce((s, e) => s + e.amount, 0);
                          return (
                            <div key={date}>
                              <div className="flex items-center justify-between py-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{date}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">₹{dayTotal.toLocaleString()}</span>
                              </div>
                              {dateExpenses.map((exp) => {
                                const card = cards.find((c) => c.id === exp.cardId);
                                const catLabel = CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category;
                                const CatIcon = categoryIcons[exp.category] || ShoppingBag;
                                return (
                                  <div key={exp.id} className="flex items-center justify-between py-3 border-b border-border/10 last:border-0 group hover:bg-secondary/5 rounded-lg px-2 -mx-2 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center border border-border/15">
                                        <CatIcon className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold">{exp.merchant}</p>
                                        <p className="text-[10px] text-muted-foreground">{card?.name}{exp.note && ` · ${exp.note}`}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <p className="text-sm font-bold">-₹{exp.amount.toLocaleString()}</p>
                                      <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all">
                                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function TrackerTabContent({ myCards, isMobile }: { myCards: CardType[]; isMobile?: boolean }) {
  const [activeCardId, setActiveCardId] = useState(myCards[0]?.id || "");
  const cardsWithV3 = myCards.map((c) => ({ card: c, v3: getMasterCard(c.id)?.enrichment, entry: { cardId: c.id, addedDate: "", monthlySpend: null, currentPoints: null, annualSpendSoFar: null } }));
  const activeCard = myCards.find((c) => c.id === activeCardId);
  const activeV3 = activeCard ? getMasterCard(activeCard.id)?.enrichment : null;

  return (
    <div className="space-y-5">
      <WalletSummary cards={cardsWithV3.filter((c) => c.v3)} isMobile={isMobile} />

      {/* Card Tabs */}
      <div className={`flex gap-2 ${isMobile ? "overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4" : "flex-wrap"}`}>
        {myCards.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCardId(c.id)}
            className={`flex-shrink-0 snap-start px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              activeCardId === c.id ? "border-gold bg-gold/10 text-gold" : "border-border/30 text-muted-foreground hover:border-gold/30"
            }`}
          >
            {c.name} {activeCardId === c.id && "✓"}
          </button>
        ))}
      </div>

      {/* Per-card tracker */}
      {activeCard && activeV3 && (
        <CardTracker
          card={activeCard}
          v3={activeV3}
          entry={{ cardId: activeCard.id, addedDate: "", monthlySpend: null, currentPoints: null, annualSpendSoFar: null }}
          isMobile={isMobile}
        />
      )}
      {activeCard && !activeV3 && (
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Detailed tracking data not available for {activeCard.name} yet.</p>
        </div>
      )}
    </div>
  );
}

function EmptyWalletDesktop({ isMyCard, toggleMyCard }: { isMyCard: (id: string) => boolean; toggleMyCard: (id: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
      <div className="relative w-32 h-28 mx-auto mb-8">
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ transformOrigin: "bottom center" }}
        >
          <Wallet className="w-8 h-8 text-gold/40" />
        </motion.div>
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            className="absolute left-1/2 rounded-lg shadow-md"
            style={{
              width: 56, height: 36, marginLeft: -28 + (idx - 1) * 8,
              background: idx === 0 ? "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))" : idx === 1 ? "linear-gradient(135deg, hsl(220 15% 22%), hsl(220 18% 28%))" : "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)))",
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [20, -8 - idx * 10, -4 - idx * 8], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.5 + idx * 0.2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
      </div>
      <p className="font-serif text-2xl font-bold mb-3">No cards added yet</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Pick cards from our catalog to build your wallet.</p>
      <Dialog>
        <DialogTrigger asChild>
          <button className="gold-btn px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg shadow-gold/15">
            <Plus className="w-4 h-4" /> Add Cards
          </button>
        </DialogTrigger>
        <AddCardsDialogContent isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
      </Dialog>
    </motion.div>
  );
}
