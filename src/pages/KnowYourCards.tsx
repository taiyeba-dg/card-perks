import { useState, useEffect, useMemo, useCallback } from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { toast } from "sonner";
import CardImage from "@/components/CardImage";
import { useMinLoading } from "@/hooks/use-min-loading";
import { SkeletonGrid, CardSkeleton } from "@/components/PageSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { CreditCard, Star, TrendingUp, TrendingDown, IndianRupee, PieChart, ArrowUpDown, Receipt, ShoppingBag, UtensilsCrossed, Car, Fuel, Plane, Smartphone, ExternalLink, Check, X, Heart, ArrowRight, GitCompare, Plus, Wallet, Award, Globe, Search, Filter } from "lucide-react";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { useFavorites } from "@/hooks/use-favorites";
import { useMyCards } from "@/hooks/use-my-cards";
import FavoriteButton from "@/components/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/hooks/use-expenses";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import MobileKnowYourCardsLayout from "@/components/know-your-cards/MobileKnowYourCardsLayout";
import DesktopKnowYourCardsLayout from "@/components/know-your-cards/DesktopKnowYourCardsLayout";
import CardQuickViewV3 from "@/components/CardQuickViewV3";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import type { CardV3 } from "@/data/card-v3-unified-types";

const expenseData = [
  { month: "Sep", amount: 42500 }, { month: "Oct", amount: 38900 }, { month: "Nov", amount: 51200 },
  { month: "Dec", amount: 67800 }, { month: "Jan", amount: 45600 }, { month: "Feb", amount: 53200 },
];

const categoryExpenses = [
  { name: "Shopping", value: 18500, icon: ShoppingBag, color: "#F8C534" },
  { name: "Food", value: 12300, icon: UtensilsCrossed, color: "#E23744" },
  { name: "Travel", value: 8700, icon: Plane, color: "#276EF1" },
  { name: "Fuel", value: 5200, icon: Fuel, color: "#006838" },
  { name: "Electronics", value: 4800, icon: Smartphone, color: "#00A651" },
  { name: "Others", value: 3700, icon: Receipt, color: "#888" },
];

const recentTransactions = [
  { merchant: "Amazon India", category: "Shopping", amount: 4599, date: "Feb 19", card: "ICICI Emeralde Private", reward: "₹230" },
  { merchant: "Zomato Gold", category: "Food", amount: 1200, date: "Feb 18", card: "Axis Neo", reward: "₹120" },
  { merchant: "HPCL Fuel", category: "Fuel", amount: 3500, date: "Feb 17", card: "ICICI Rubyx", reward: "₹88" },
  { merchant: "Flipkart", category: "Shopping", amount: 8999, date: "Feb 16", card: "HDFC Shoppers Stop", reward: "₹360" },
  { merchant: "MakeMyTrip", category: "Travel", amount: 12500, date: "Feb 15", card: "ICICI MakeMyTrip", reward: "₹625" },
  { merchant: "Swiggy", category: "Food", amount: 850, date: "Feb 14", card: "HSBC Premier", reward: "₹85" },
  { merchant: "Croma", category: "Electronics", amount: 15999, date: "Feb 12", card: "ICICI Emeralde Private", reward: "₹480" },
  { merchant: "BigBasket", category: "Groceries", amount: 2340, date: "Feb 11", card: "HSBC Premier", reward: "₹187" },
];

const totalExpense = categoryExpenses.reduce((s, c) => s + c.value, 0);

// These are computed inside the component via useMemo since cards is now dynamic (180 cards from V3)

type SortOption = "rating" | "fee-low" | "fee-high";

function CardQuickView({
  card, open, onClose,
  isFav, toggleFav, compareList, toggleCompare, isMyCard, toggleMyCard,
}: {
  card: CardType | null; open: boolean; onClose: () => void;
  isFav: (id: string) => boolean; toggleFav: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
  isMyCard: (id: string) => boolean; toggleMyCard: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  if (!card) return null;

  const isInCompare = compareList.includes(card.id);
  const isInWallet = isMyCard(card.id);
  const isFavorite = isFav(card.id);

  const innerContent = (
    <div>
      <div className="p-4 sm:p-6 pb-3 sm:pb-4" style={{ background: `linear-gradient(135deg, ${card.color}08, ${card.color}15, transparent)` }}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-24 sm:w-32 aspect-square rounded-xl overflow-hidden shadow-xl shadow-black/40 flex-shrink-0">
            {card.image ? (
              <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor={card.color} />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
              {card.name}
              <span className="flex items-center gap-1 text-sm font-normal">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-sm">{card.rating}</span>
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">{card.issuer} · {card.network} · {card.type}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-2 space-y-4">
        {/* Action buttons row */}
        <div className="flex gap-2">
          <button
            onClick={() => toggleFav(card.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isFavorite ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-400" : ""}`} />
            {isFavorite ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => toggleCompare(card.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isInCompare ? "bg-gold/15 text-gold border border-gold/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {isInCompare ? "Comparing" : "Compare"}
          </button>
          <button
            onClick={() => toggleMyCard(card.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isInWallet ? "bg-gold/15 text-gold border border-gold/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {isInWallet ? "In Wallet" : "Add"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[{ l: "Fee", v: card.fee }, { l: "Rewards", v: card.rewards }, { l: "Lounge", v: card.lounge }].map((s) => (
            <div key={s.l} className="text-center bg-secondary/30 rounded-xl p-2 sm:p-3">
              <p className="text-[10px] text-muted-foreground uppercase">{s.l}</p>
              <p className="text-xs sm:text-sm font-semibold text-gold mt-1">{s.v}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">Min. Income: <span className="text-foreground font-medium">{card.minIncome}</span></p>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Key Perks</p>
          <div className="space-y-1.5">{card.perks.map((p) => <div key={p} className="flex items-center gap-2"><Check className="w-3 h-3 text-gold flex-shrink-0" /><span className="text-xs sm:text-sm">{p}</span></div>)}</div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Top Voucher Rates</p>
          <div className="flex flex-wrap gap-1.5">{card.vouchers.map((v) => <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60">{v}</span>)}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">{card.bestFor.map((b) => <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold">{b}</span>)}</div>
        <Link to={`/cards/${card.id}`} onClick={onClose} className="gold-btn w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          View Full Details <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{card.name}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">{innerContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">{card.name}</DialogTitle>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
          {innerContent}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseSection({ transactions, cardColorMap }: { transactions: typeof recentTransactions; cardColorMap: Record<string, string> }) {
  const [addOpen, setAddOpen] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("shopping");
  const [selectedCard, setSelectedCard] = useState(cards[0]?.id || "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const reset = () => { setMerchant(""); setAmount(""); setCategory("shopping"); setSelectedCard(cards[0]?.id || ""); setDate(new Date().toISOString().split("T")[0]); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold mb-1">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground">Your latest spending activity</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <button className="gold-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-gold/10">
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg glass-card border-border/30 p-0 overflow-hidden">
            <div className="p-6 pb-4 border-b border-border/15">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gold" />
                  </div>
                  New Expense
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/30 border-border/20 text-sm h-11" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Merchant</label>
                  <Input placeholder="e.g. Amazon, Swiggy" value={merchant} onChange={(e) => setMerchant(e.target.value)} maxLength={100} className="bg-secondary/30 border-border/20 text-sm h-11" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Amount (₹)</label>
                  <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="bg-secondary/30 border-border/20 text-sm h-11" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-secondary/30 border-border/20 text-sm h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-card border-border/30">
                      {CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Card</label>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 text-sm h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-card border-border/30">
                    {cards.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { reset(); setAddOpen(false); }} className="px-5 py-2.5 rounded-xl text-sm border border-border/30 hover:bg-secondary/30 transition-colors font-medium">Cancel</button>
                <button onClick={() => { reset(); setAddOpen(false); }} disabled={!merchant.trim() || !amount || parseFloat(amount) <= 0} className="px-5 py-2.5 rounded-xl text-sm gold-btn font-semibold shadow-md shadow-gold/10 disabled:opacity-40 disabled:cursor-not-allowed">Add Expense</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider pb-3 pr-4">Merchant</th>
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider pb-3 pr-4">Category</th>
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider pb-3 pr-4">Card</th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-wider pb-3 pr-4">Amount</th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-wider pb-3">Reward</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const txColor = cardColorMap[tx.card] || "#888";
              return (
                <tr key={i} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 pr-4"><div><p className="text-sm font-medium">{tx.merchant}</p><p className="text-[10px] text-muted-foreground">{tx.date}</p></div></td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{tx.category}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: txColor }} />
                      <span className="text-xs text-muted-foreground">{tx.card}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm font-medium">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-3 text-right text-xs text-gold font-medium">{tx.reward}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── Mobile Filter Drawer ──────────────────────────────────────────────────────
function MobileFilterDrawer({
  issuerFilter, setIssuerFilter,
  networkFilter, setNetworkFilter,
  uniqueIssuers, uniqueNetworks,
}: {
  issuerFilter: string; setIssuerFilter: (v: string) => void;
  networkFilter: string; setNetworkFilter: (v: string) => void;
  uniqueIssuers: string[]; uniqueNetworks: string[];
}) {
  const [open, setOpen] = useState(false);
  const activeCount = (issuerFilter !== "All" ? 1 : 0) + (networkFilter !== "All" ? 1 : 0);

  return (
    <div className="sm:hidden mb-3">
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border transition-colors ${
          activeCount > 0
            ? "border-gold/40 bg-gold/10 text-gold"
            : "border-border/40 bg-secondary/40 text-foreground hover:border-gold/30"
        }`}
      >
        <Filter className="w-3 h-3" />
        Filters
        {activeCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-gold text-background text-[9px] font-bold flex items-center justify-center">{activeCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div
            className="relative w-full bg-card border-t border-border/40 rounded-t-2xl p-5 pb-8 space-y-5 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-base font-semibold">Filter Cards</h3>
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Issuer</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...uniqueIssuers].map((issuer) => (
                  <button
                    key={issuer}
                    onClick={() => setIssuerFilter(issuer)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      issuerFilter === issuer
                        ? "bg-gold text-background border-gold font-medium"
                        : "border-border/40 text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    {issuer}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Network</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...uniqueNetworks].map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetworkFilter(net)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      networkFilter === net
                        ? "bg-gold text-background border-gold font-medium"
                        : "border-border/40 text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              {activeCount > 0 && (
                <button
                  onClick={() => { setIssuerFilter("All"); setNetworkFilter("All"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border/40 text-muted-foreground"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm gold-btn"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KnowYourCards() {
  const isMobile = useIsMobile();
  const [quickViewCard, setQuickViewCard] = useState<CardType | null>(null);
  const { getCardById: getV3Card } = useCardsV3();
  const [quickViewV3, setQuickViewV3] = useState<CardV3 | null>(null);

  const openQuickView = useCallback((card: CardType) => {
    setQuickViewCard(card);
    const v3 = getV3Card(card.id);
    setQuickViewV3(v3 ?? null);
  }, [getV3Card]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { toggle: toggleFav, isFav } = useFavorites("card");
  const { toggle: toggleMyCard, has: isMyCard } = useMyCards();
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get("category") ?? "All";
  const sortBy = (searchParams.get("sort") ?? "rating") as SortOption;
  const search = searchParams.get("q") ?? "";

  const setTypeFilter = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val && val !== "All" ? p.set("category", val) : p.delete("category"); return p; }, { replace: true });
  const setSortBy = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val && val !== "rating" ? p.set("sort", val) : p.delete("sort"); return p; }, { replace: true });
  const setSearch = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val ? p.set("q", val) : p.delete("q"); return p; }, { replace: true });

  const navigate = useNavigate();
  const loading = useMinLoading(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("cards");

  // Card color lookup for transactions
  const cardColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    cards.forEach((c) => { map[c.name] = c.color; });
    return map;
  }, []);

  const TIER_LABELS: Record<string, string> = {
    "ultra-premium": "Ultra Premium", "super-premium": "Super Premium",
    "premium": "Premium", "mid": "Mid-Tier", "entry": "Entry",
    "co-branded": "Co-Branded", "secured": "Secured", "business": "Business",
  };
  const uniqueTypes = useMemo(() => [...new Set(cards.map((c) => c.type))], []);
  const uniqueIssuers = useMemo(() => [...new Set(cards.map((c) => c.issuer))], []);
  const feeRange = useMemo(() => {
    const fees = cards.map((c) => parseInt(c.fee.replace(/[₹,]/g, "")) || 0);
    return { min: Math.min(...fees), max: Math.max(...fees) };
  }, []);
  const highestRatedCard = useMemo(() => cards.reduce((best, c) => (c.rating > best.rating ? c : best), cards[0]), []);

  const handleCardsRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900));
    setRefreshKey((k) => k + 1);
    toast.success("Card data refreshed");
  }, []);

  const { pullDistance: cardsPullDistance, refreshing: cardsRefreshing } = usePullToRefresh({
    onRefresh: handleCardsRefresh,
    disabled: !isMobile,
  });

  useEffect(() => {
    return () => { document.title = "CardPerks"; };
  }, []);

  const maxCompare = isMobile ? 2 : 4;
  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= maxCompare) {
        if (isMobile) toast.warning("Max 2 cards on mobile — remove one to add another");
        return prev;
      }
      return [...prev, id];
    });
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: cards.length };
    cards.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return counts;
  }, []);

  const uniqueNetworks = useMemo(() => [...new Set(cards.map((c) => c.network))], []);
  const [issuerFilter, setIssuerFilter] = useState<string>("All");
  const [networkFilter, setNetworkFilter] = useState<string>("All");

  const filteredAndSorted = useMemo(() => {
    let filtered = typeFilter === "All" ? [...cards] : cards.filter((c) => c.type === typeFilter);
    if (issuerFilter !== "All") filtered = filtered.filter((c) => c.issuer === issuerFilter);
    if (networkFilter !== "All") filtered = filtered.filter((c) => c.network === networkFilter);
    if (search.trim()) {
      const words = search.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((c) => {
        const hay = `${c.name} ${c.issuer} ${c.network} ${c.type}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }
    const parseFee = (f: string) => parseInt(f.replace(/[₹,]/g, ""));
    switch (sortBy) {
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
      case "fee-low": filtered.sort((a, b) => parseFee(a.fee) - parseFee(b.fee)); break;
      case "fee-high": filtered.sort((a, b) => parseFee(b.fee) - parseFee(a.fee)); break;
    }
    return filtered;
  }, [typeFilter, issuerFilter, networkFilter, sortBy, search]);

  return (
    <PageLayout>
      <SEO fullTitle="Credit Card Catalog | CardPerks" description="Browse and compare India's top premium credit cards. Filter by rewards, lounge access, annual fee, and more." path="/cards" />

      {/* ── Pull-to-refresh indicator (mobile only) ── */}
      {isMobile && (
        <PullToRefreshIndicator pullDistance={cardsPullDistance} refreshing={cardsRefreshing} />
      )}

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="cards" className="w-full" onValueChange={(v) => setActiveTab(v)}>
            <PremiumPageHeader
              accentLabel="Know Your Cards"
              title={<>Cards <span className="font-serif italic text-muted-foreground/60">&amp;</span>{" "}<span className="gold-gradient">Expenses</span></>}
              subtitle="Deep-dive into every credit card's perks, compare benefits, and track your spending across all cards."
              stats={[
                { icon: CreditCard, text: `${cards.length} Cards` },
                { icon: Globe, text: `${uniqueIssuers.length} Issuers` },
                { icon: IndianRupee, text: `₹${feeRange.min.toLocaleString()} – ₹${feeRange.max.toLocaleString()} range` },
              ]}
              afterStats={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                  <TabsList className="bg-secondary/40 border border-border/40 backdrop-blur-sm p-1 rounded-xl">
                    <TabsTrigger value="cards" className="rounded-lg px-5 py-2 text-sm font-medium transition-all data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20">
                      <CreditCard className="w-4 h-4 mr-2" /> Cards
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="rounded-lg px-5 py-2 text-sm font-medium transition-all data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20">
                      <PieChart className="w-4 h-4 mr-2" /> Expenses
                    </TabsTrigger>
                  </TabsList>
                </motion.div>
              }
              searchPlaceholder={`Search ${cards.length} cards, issuers…`}
              searchValue={search}
              onSearchChange={setSearch}
              filters={["All", ...uniqueTypes].map((t) => ({ label: TIER_LABELS[t] || t, count: typeCounts[t] || 0, value: t }))}
              activeFilter={typeFilter}
              onFilterChange={setTypeFilter}
              resultCount={filteredAndSorted.length}
              resultLabel={`card${filteredAndSorted.length !== 1 ? "s" : ""}`}
              resultSuffix={activeTab === "cards" ? (
                <span className="hidden sm:inline-flex items-center gap-2 ml-3">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <select
                    value={issuerFilter}
                    onChange={(e) => setIssuerFilter(e.target.value)}
                    className="text-[11px] h-7 px-2 rounded-lg border border-border/40 bg-secondary/40 text-foreground hover:border-gold/30 focus:ring-1 focus:ring-gold/30 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="All">All Issuers</option>
                    {uniqueIssuers.map((issuer) => (
                      <option key={issuer} value={issuer}>{issuer}</option>
                    ))}
                  </select>
                  <select
                    value={networkFilter}
                    onChange={(e) => setNetworkFilter(e.target.value)}
                    className="text-[11px] h-7 px-2 rounded-lg border border-border/40 bg-secondary/40 text-foreground hover:border-gold/30 focus:ring-1 focus:ring-gold/30 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="All">All Networks</option>
                    {uniqueNetworks.map((net) => (
                      <option key={net} value={net}>{net}</option>
                    ))}
                  </select>
                  {(issuerFilter !== "All" || networkFilter !== "All") && (
                    <button onClick={() => { setIssuerFilter("All"); setNetworkFilter("All"); }} className="text-[10px] text-gold hover:text-gold-light transition-colors">
                      Clear
                    </button>
                  )}
                </span>
              ) : undefined}
              sortValue={sortBy}
              onSortChange={(v) => setSortBy(v as SortOption)}
              sortOptions={[
                { value: "rating", label: "Rating" },
                { value: "fee-low", label: "Fee: Low → High" },
                { value: "fee-high", label: "Fee: High → Low" },
              ]}
              footerAction={{
                label: compareList.length > 0 ? `Compare (${compareList.length})` : "Compare",
                icon: <GitCompare className="w-3.5 h-3.5" />,
                onClick: () => {
                  if (compareList.length >= 2) {
                    navigate(`/compare?cards=${compareList.join(",")}`);
                  } else {
                    toast.info("Select 2+ cards using the compare button on each card");
                  }
                },
              }}
              hideControls={activeTab === "expenses"}
            />

            {/* Desktop issuer/network filters moved into resultSuffix above */}

            {/* Mobile: compact filter button + bottom drawer */}
            {activeTab === "cards" && (
            <MobileFilterDrawer
              issuerFilter={issuerFilter}
              setIssuerFilter={setIssuerFilter}
              networkFilter={networkFilter}
              setNetworkFilter={setNetworkFilter}
              uniqueIssuers={uniqueIssuers}
              uniqueNetworks={uniqueNetworks}
            />
            )}

            <TabsContent value="cards">
              {loading ? (
                <SkeletonGrid count={6} columns="md:grid-cols-2 xl:grid-cols-3">
                  <CardSkeleton />
                </SkeletonGrid>
              ) : (
              <>
                <MobileKnowYourCardsLayout
                  cards={filteredAndSorted}
                  onQuickView={openQuickView}
                  compareList={compareList}
                  toggleCompare={toggleCompare}
                  isFav={isFav}
                  toggleFav={toggleFav}
                  isMyCard={isMyCard}
                  toggleMyCard={toggleMyCard}
                  highestRatedCardId={highestRatedCard.id}
                />
                <DesktopKnowYourCardsLayout
                  cards={filteredAndSorted}
                  onQuickView={openQuickView}
                  compareList={compareList}
                  toggleCompare={toggleCompare}
                  isFav={isFav}
                  toggleFav={toggleFav}
                  isMyCard={isMyCard}
                  toggleMyCard={toggleMyCard}
                  highestRatedCardId={highestRatedCard.id}
                />
              </>
              )}
            </TabsContent>

            <TabsContent value="expenses">
              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Spend", value: `₹${(totalExpense / 1000).toFixed(1)}K`, icon: IndianRupee, change: "+8.2%", up: true },
                    { label: "Rewards Earned", value: "₹4,850", icon: Star, change: "+12%", up: true },
                    { label: "Avg. Daily", value: "₹1,900", icon: TrendingUp, change: "-3%", up: false },
                    { label: "Transactions", value: "147", icon: ArrowUpDown, change: "+5%", up: true },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-card rounded-xl p-5 ${stat.up ? "bg-gradient-to-br from-green-500/[0.04] to-transparent" : "bg-gradient-to-br from-red-500/[0.04] to-transparent"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center"><stat.icon className="w-4 h-4 text-gold" /></div>
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                          {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-serif font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-semibold mb-1">Monthly Spending</h3>
                    <p className="text-xs text-muted-foreground mb-6">Last 6 months trend</p>
                    <div className="overflow-x-auto -mx-2 px-2">
                      <div className="min-w-[280px]">
                        <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={expenseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                        <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                        <RechartsTooltip contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 12% 18%)", borderRadius: 12, color: "#fff", fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Spent"]} />
                        <Line type="monotone" dataKey="amount" stroke="hsl(var(--gold))" strokeWidth={2.5} dot={{ fill: "hsl(var(--gold))", r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-semibold mb-1">Category Breakdown</h3>
                    <p className="text-xs text-muted-foreground mb-6">Where your money goes</p>
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width={140} height={140}>
                        <RePieChart><Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">{categoryExpenses.map((e) => <Cell key={e.name} fill={e.color} />)}</Pie></RePieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2.5">
                        {categoryExpenses.map((cat) => {
                          const pct = ((cat.value / totalExpense) * 100).toFixed(1);
                          return (
                            <div key={cat.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                <cat.icon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{cat.name} <span className="text-foreground/50">{pct}%</span></span>
                              </div>
                              <span className="text-xs font-medium">₹{(cat.value / 1000).toFixed(1)}K</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-semibold mb-1">Card-wise Spending</h3>
                  <p className="text-xs text-muted-foreground mb-6">Spend distribution across your cards</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ card: "Emeralde Private", amount: 22500 }, { card: "HSBC Premier", amount: 12800 }, { card: "ICICI MakeMyTrip", amount: 8500 }, { card: "Axis Neo", amount: 5400 }, { card: "ICICI Rubyx", amount: 4000 }, { card: "HDFC Shoppers", amount: 3200 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
                      <XAxis dataKey="card" tick={{ fill: "hsl(220 10% 55%)", fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                      <RechartsTooltip contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 12% 18%)", borderRadius: 12, color: "#fff", fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Spent"]} />
                      <Bar dataKey="amount" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <ExpenseSection transactions={recentTransactions} cardColorMap={cardColorMap} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Floating compare bar — mobile pill + desktop full */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed bottom-[72px] lg:bottom-6 left-0 right-0 z-50 flex justify-center px-4"
          >
            {/* ── Mobile pill ── */}
            <div className="flex lg:hidden w-full max-w-sm items-center gap-3 glass-card border border-gold/25 shadow-2xl shadow-gold/10 rounded-2xl px-4 py-3">
              {/* Stacked card thumbnails */}
              <div className="flex items-center -space-x-2 flex-shrink-0">
                {compareList.map((id, i) => {
                  const c = cards.find((card) => card.id === id);
                  if (!c) return null;
                  return (
                    <div
                      key={id}
                      className="w-9 h-6 rounded-md overflow-hidden border-2 border-background shadow-md"
                      style={{ zIndex: compareList.length - i }}
                    >
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Count label */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  <span className="text-gold">{compareList.length}</span> card{compareList.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {compareList.length < 2 ? "Select 1 more to compare" : "Ready to compare"}
                </p>
              </div>
              {/* Clear */}
              <button
                onClick={() => setCompareList([])}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex-shrink-0"
                aria-label="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Go button */}
              <button
                onClick={() => navigate(`/compare?cards=${compareList.join(",")}`)}
                disabled={compareList.length < 2}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  compareList.length >= 2 ? "gold-btn" : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" /> Go
              </button>
            </div>

            {/* ── Desktop full bar ── */}
            <TooltipProvider>
              <div className="hidden lg:flex glass-card rounded-2xl border border-gold/20 shadow-2xl shadow-gold/10 px-6 py-4 items-center gap-4">
                <div className="flex items-center gap-3">
                  {compareList.map((id) => {
                    const c = cards.find((card) => card.id === id);
                    if (!c) return null;
                    return (
                      <Tooltip key={id}>
                        <TooltipTrigger asChild>
                          <div className="relative group/chip text-center">
                            <div className="w-14 h-[36px] rounded-lg overflow-hidden shadow-md border border-border/20">
                              {c.image ? (
                                <img src={c.image} alt={`${c.name} credit card`} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
                              )}
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-1 max-w-14 truncate">{c.name.split(" ").slice(-1)[0]}</p>
                            <button
                              onClick={() => toggleCompare(id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent><p>{c.name}</p></TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 2 - compareList.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-14 h-[36px] rounded-lg border border-dashed border-border/50 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">+</span>
                    </div>
                  ))}
                </div>
                <div className="h-8 w-px bg-border/30" />
                <div className="text-xs text-muted-foreground">
                  <span className="text-gold font-semibold">{compareList.length}</span>/{maxCompare} selected
                </div>
                <button
                  onClick={() => navigate(`/compare?cards=${compareList.join(",")}`)}
                  disabled={compareList.length < 2}
                  className={`px-5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    compareList.length >= 2 ? "gold-btn" : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" /> Compare Now
                </button>
                <button
                  onClick={() => setCompareList([])}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Use V3 quick view when full data is available, fall back to legacy */}
      {quickViewV3 ? (
        <CardQuickViewV3
          card={quickViewV3}
          open={!!quickViewCard}
          onClose={() => { setQuickViewCard(null); setQuickViewV3(null); }}
          isFav={isFav}
          toggleFav={toggleFav}
          compareList={compareList}
          toggleCompare={toggleCompare}
          isMyCard={isMyCard}
          toggleMyCard={toggleMyCard}
        />
      ) : (
        <CardQuickView
          card={quickViewCard}
          open={!!quickViewCard}
          onClose={() => setQuickViewCard(null)}
          isFav={isFav}
          toggleFav={toggleFav}
          compareList={compareList}
          toggleCompare={toggleCompare}
          isMyCard={isMyCard}
          toggleMyCard={toggleMyCard}
        />
      )}
      <BackToTop />
    </PageLayout>
  );
}
