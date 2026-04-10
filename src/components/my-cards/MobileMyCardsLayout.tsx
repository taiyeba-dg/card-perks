import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Star, Plus, ArrowRight, Wallet, X, Eye,
  GitCompare, IndianRupee, Sparkles, BarChart3, Calendar,
  ShoppingBag, UtensilsCrossed, Fuel, Plane, Trash2, Receipt, Target
} from "lucide-react";
import { CardTracker, WalletSummary } from "@/components/my-cards/MilestoneTracker";
import { getMasterCard } from "@/data/card-v3-master";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import CardImage from "@/components/CardImage";
import FavoriteButton from "@/components/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import type { CreditCard as CardType } from "@/data/cards";
import type { Expense } from "@/hooks/use-expenses";
import { CATEGORIES } from "@/hooks/use-expenses";
import { cards } from "@/data/cards";

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

export default function MobileMyCardsLayout({
  myCards, isMyCard, toggleMyCard, isFav, toggleFav,
  addExpense, deleteExpense, getByCard, totalByCard,
  totalSpend, totalRewards, myExpenses, groupedExpenses,
  categoryBreakdown, totalCatSpend, catMapSize,
}: Props) {
  return (
    <div className="md:hidden">
      {/* Compact Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/25 to-gold/5 flex items-center justify-center shadow-lg shadow-gold/10">
            <Wallet className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold">Your Wallet</p>
            <h1 className="font-serif text-2xl font-bold">
              My <span className="gold-gradient">Cards</span>
            </h1>
          </div>
        </div>

        {/* Horizontal scrolling stats */}
        {myCards.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
            {totalSpend > 0 ? (
              [
                { label: "Cards", value: `${myCards.length}`, icon: CreditCard, accent: false },
                { label: "Spend", value: `₹${(totalSpend / 1000).toFixed(1)}K`, icon: IndianRupee, accent: false },
                { label: "Rewards", value: `₹${totalRewards.toLocaleString()}`, icon: Sparkles, accent: true },
                { label: "Expenses", value: `${myExpenses.length}`, icon: BarChart3, accent: false },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`flex-shrink-0 snap-start glass-card rounded-xl px-3.5 py-2.5 border border-border/20 min-w-[100px] ${
                    stat.accent ? "ring-1 ring-gold/15" : ""
                  }`}
                >
                  <stat.icon className={`w-3.5 h-3.5 mb-1.5 ${stat.accent ? "text-gold" : "text-muted-foreground"}`} />
                  <p className={`text-lg font-serif font-bold ${stat.accent ? "text-gold" : ""}`}>{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))
            ) : (
              [
                { label: "Cards", value: `${myCards.length}`, icon: CreditCard, tap: false },
                { label: "Add Expenses", value: "Track", icon: IndianRupee, tap: true },
                { label: "Track Rewards", value: "Earn", icon: Sparkles, tap: true },
                { label: "Log Spending", value: "Start", icon: BarChart3, tap: true },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex-shrink-0 snap-start glass-card rounded-xl px-3.5 py-2.5 border border-dashed border-border/30 min-w-[100px] cursor-pointer active:scale-95 transition-transform"
                >
                  <stat.icon className="w-3.5 h-3.5 mb-1.5 text-gold/60" />
                  <p className="text-lg font-serif font-bold text-gold/70">{stat.value}</p>
                  <p className="text-[9px] text-gold/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {myCards.length === 0 ? (
        <EmptyWallet isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
      ) : (
        <Tabs defaultValue="cards" className="w-full">
           <TabsList className="bg-secondary/30 border border-border/30 mb-5 w-full">
            <TabsTrigger value="cards" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-1.5 flex-1 text-xs">
              <CreditCard className="w-3.5 h-3.5" /> Cards
            </TabsTrigger>
            <TabsTrigger value="tracker" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-1.5 flex-1 text-xs">
              <Target className="w-3.5 h-3.5" /> Tracker
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gold data-[state=active]:text-background gap-1.5 flex-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Expenses
            </TabsTrigger>
          </TabsList>

          {/* Cards Tab */}
          <TabsContent value="cards">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {myCards.map((card, i) => {
                  const cardTotal = totalByCard(card.id);
                  const rewardPct = parseRewardPct(card.rewards);
                  const cardRewards = Math.round(cardTotal * rewardPct);
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.06 }}
                      layout
                    >
                      <div className="glass-card rounded-2xl overflow-hidden border border-border/20 active:scale-[0.98] transition-transform">
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}40)` }} />
                        <div className="flex items-center gap-3 p-3" style={{ background: `linear-gradient(135deg, ${card.color}12, transparent)` }}>
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5">
                            {card.image ? (
                              <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                            ) : (
                              <div className="w-full h-full rounded-lg" style={{ background: `linear-gradient(135deg, ${card.color}40, ${card.color}15)` }}>
                                <CreditCard className="w-6 h-6 opacity-30 m-auto mt-3" style={{ color: card.color }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{card.name}</p>
                                <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                                  <span className="text-[10px] font-semibold text-gold">{card.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <FavoriteButton isFav={isFav(card.id)} onToggle={() => toggleFav(card.id)} />
                                <button onClick={() => toggleMyCard(card.id)} className="p-1 rounded-lg hover:bg-red-500/20 text-muted-foreground">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 pb-3 pt-2">
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="rounded-lg p-2 bg-secondary/20 border border-border/15">
                              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Spend</p>
                              <p className="text-xs font-serif font-bold">{cardTotal > 0 ? `₹${(cardTotal / 1000).toFixed(1)}K` : "₹0"}</p>
                            </div>
                            <div className="rounded-lg p-2 bg-secondary/20 border border-border/15">
                              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Txns</p>
                              <p className="text-xs font-serif font-bold">{getByCard(card.id).length}</p>
                            </div>
                            <div className="rounded-lg p-2 border border-gold/15" style={{ background: `linear-gradient(135deg, hsl(var(--gold) / 0.06), transparent)` }}>
                              <p className="text-[8px] text-gold uppercase tracking-wider font-semibold">Rewards</p>
                              <p className="text-xs font-serif font-bold text-gold">{cardRewards > 0 ? `~₹${cardRewards}` : "₹0"}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <AddExpenseDialog cardId={card.id} cardName={card.name} cardColor={card.color} onAdd={addExpense} />
                            <Link to={`/cards/${card.id}`} className="flex-1 text-[11px] py-2 rounded-xl gold-outline-btn flex items-center justify-center gap-1 font-semibold">
                              <Eye className="w-3 h-3" /> Details
                            </Link>
                            <Link to={`/compare?cards=${card.id}`} className="flex-1 text-[11px] py-2 rounded-xl gold-btn flex items-center justify-center gap-1 font-semibold">
                              <GitCompare className="w-3 h-3" /> Compare
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full glass-card rounded-2xl py-6 flex flex-col items-center gap-2 border border-dashed border-border/40">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Add More Cards</span>
                  </button>
                </DialogTrigger>
                <AddCardsDialogContent isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
              </Dialog>
            </div>
          </TabsContent>

          {/* Tracker Tab */}
          <TabsContent value="tracker">
            <TrackerTabContent myCards={myCards} isMobile />
          </TabsContent>

          {/* Expenses Tab - Simplified for mobile */}
          <TabsContent value="expenses">
            <div className="space-y-4">
              {/* Quick add buttons */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {myCards.map((card) => (
                  <AddExpenseDialog
                    key={card.id}
                    cardId={card.id}
                    cardName={card.name}
                    cardColor={card.color}
                    onAdd={addExpense}
                    trigger={
                      <button className="text-[11px] py-2 px-3 rounded-xl border border-border/30 flex items-center gap-1.5 font-medium flex-shrink-0 whitespace-nowrap">
                        <div className="w-3 h-2 rounded-sm" style={{ background: card.color }} />
                        <Plus className="w-3 h-3 text-gold" /> {card.name.split(" ").slice(0, 2).join(" ")}
                      </button>
                    }
                  />
                ))}
              </div>

              {totalSpend === 0 ? (
                <div className="text-center py-14">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-7 h-7 text-gold/40" />
                  </div>
                  <p className="font-serif text-lg font-bold mb-1">No expenses yet</p>
                  <p className="text-xs text-muted-foreground mb-1">Start tracking your spending</p>
                  <p className="text-[10px] text-gold/70">💡 Log by category to optimize rewards</p>
                </div>
              ) : (
                <>
                  {/* Category summary - compact */}
                  {categoryBreakdown.length > 0 && (
                    <div className="glass-card rounded-2xl p-4 border border-border/20">
                      <h3 className="font-serif text-sm font-bold mb-3">Categories</h3>
                      <div className="space-y-2">
                        {categoryBreakdown.map((cat) => (
                          <div key={cat.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-xs text-muted-foreground">{cat.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold">₹{(cat.value / 1000).toFixed(1)}K</span>
                              {totalCatSpend > 0 && (
                                <span className="text-[9px] text-muted-foreground ml-1">
                                  ({((cat.value / totalCatSpend) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expense list - grouped by date */}
                  <div className="glass-card rounded-2xl p-4 border border-border/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-sm font-bold">All Expenses</h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary/40 text-muted-foreground">{myExpenses.length}</span>
                    </div>
                    <div className="space-y-1">
                      {groupedExpenses.map(([date, dateExpenses]) => {
                        const dayTotal = dateExpenses.reduce((s, e) => s + e.amount, 0);
                        return (
                          <div key={date}>
                            <div className="flex items-center justify-between py-1.5 mb-1">
                              <div className="flex items-center gap-1.5">
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
                                <div key={exp.id} className="flex items-center justify-between py-2.5 border-b border-border/10 last:border-0">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center">
                                      <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold">{exp.merchant}</p>
                                      <p className="text-[10px] text-muted-foreground">{card?.name}{exp.note && ` · ${exp.note}`}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold">-₹{exp.amount.toLocaleString()}</p>
                                    <button onClick={() => deleteExpense(exp.id)} className="p-1 rounded hover:bg-red-500/20">
                                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
    <div className="space-y-4">
      <WalletSummary cards={cardsWithV3.filter((c) => c.v3)} isMobile />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
        {myCards.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCardId(c.id)}
            className={`flex-shrink-0 snap-start px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              activeCardId === c.id ? "border-gold bg-gold/10 text-gold" : "border-border/30 text-muted-foreground"
            }`}
          >
            {c.name} {activeCardId === c.id && "✓"}
          </button>
        ))}
      </div>

      {activeCard && activeV3 && (
        <CardTracker card={activeCard} v3={activeV3} entry={{ cardId: activeCard.id, addedDate: "", monthlySpend: null, currentPoints: null, annualSpendSoFar: null }} isMobile />
      )}
      {activeCard && !activeV3 && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Tracking not available for this card yet.</p>
        </div>
      )}
    </div>
  );
}

function EmptyWallet({ isMyCard, toggleMyCard }: { isMyCard: (id: string) => boolean; toggleMyCard: (id: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center mx-auto mb-6">
        <Wallet className="w-8 h-8 text-gold/40" />
      </div>
      <p className="font-serif text-xl font-bold mb-2">No cards added yet</p>
      <p className="text-sm text-muted-foreground mb-6">Pick cards from our catalog to build your wallet.</p>
      <Dialog>
        <DialogTrigger asChild>
          <button className="gold-btn px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Cards
          </button>
        </DialogTrigger>
        <AddCardsDialogContent isMyCard={isMyCard} toggleMyCard={toggleMyCard} />
      </Dialog>
    </motion.div>
  );
}
