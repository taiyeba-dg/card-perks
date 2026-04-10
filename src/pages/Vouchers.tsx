import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { useMinLoading } from "@/hooks/use-min-loading";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { SkeletonGrid, VoucherSkeleton } from "@/components/PageSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Eye, ExternalLink, X, Clock, CreditCard, Tag, Heart, Share2, Globe, ArrowUpRight, Gift, Sparkles, TrendingUp, Star, ChevronDown, SearchX, RefreshCw, GitCompareArrows, ArrowDownUp, CheckCircle2, TrendingDown, Minus, Trophy, Calculator, BarChart3, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/use-favorites";
import { toast } from "sonner";
import FavoriteButton from "@/components/FavoriteButton";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import { voucherCategories, iconMap, type Voucher } from "@/data/vouchers";
import { useVouchers } from "@/hooks/use-vouchers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import SEO from "@/components/SEO";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import MobileVouchersLayout from "@/components/vouchers/MobileVouchersLayout";
import DesktopVouchersLayout from "@/components/vouchers/DesktopVouchersLayout";
import { useMyCards } from "@/hooks/use-my-cards";
import { cards as allCards } from "@/data/cards";
import { computeVoucherCombos, getTopCombos, calculateMaxValue, type PortalCombo } from "@/data/voucher-card-combos";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { playSound } from "@/lib/sounds";

// ─── Top Cards per voucher brand ──────────────────────────────────────────────
// Each entry: [cardId, displayLabel]
const voucherTopCards: Record<string, [string, string][]> = {
  flipkart:    [["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["axis-magnus", "Axis Magnus – 3.5x"], ["flipkart-axis", "Flipkart Axis – 5%"]],
  amazon:      [["amex-mrcc", "Amex MRCC – 2x MR"], ["au-zenith-plus", "AU Zenith+ – 3%"], ["bob-eterna", "BOB Eterna – 2.5x"]],
  zomato:      [["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["axis-magnus", "Axis Magnus – 3.5x"], ["au-lit", "AU LIT – 5x Food"]],
  swiggy:      [["au-lit", "AU LIT – 5x Food"], ["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["flipkart-axis", "Flipkart Axis – 1.5x"]],
  uber:        [["axis-magnus", "Axis Magnus – 3.5x"], ["flipkart-axis", "Flipkart Axis – 1.5x"], ["amex-mrcc", "Amex MRCC – 2x MR"]],
  bigbasket:   [["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["au-zenith-plus", "AU Zenith+ – 3%"], ["bpcl-sbi-octane", "BPCL SBI – 5x"]],
  hpcl:        [["bpcl-sbi-octane", "BPCL SBI Octane – 13x"], ["axis-privilege", "Axis Privilege – 2.5x"], ["bob-eterna", "BOB Eterna – 2.5x"]],
  makemytrip:  [["axis-magnus", "Axis Magnus – 35x Travel"], ["club-vistara-sbi", "Vistara SBI – 3x CV"], ["au-zenith-plus", "AU Zenith+ – 3%"]],
  bookmyshow:  [["au-lit", "AU LIT – 5x Entmt"], ["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["axis-privilege", "Axis Privilege – 2.5x"]],
  cultfit:     [["axis-magnus", "Axis Magnus – 3.5x"], ["au-zenith-plus", "AU Zenith+ – 3%"], ["amex-mrcc", "Amex MRCC – 2x MR"]],
  coursera:    [["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["axis-magnus", "Axis Magnus – 3.5x"], ["bob-eterna", "BOB Eterna – 2.5x"]],
  croma:       [["hdfc-diners-black", "HDFC Diners Black – 3.3x"], ["axis-magnus", "Axis Magnus – 3.5x"], ["au-zenith-plus", "AU Zenith+ – 3%"]],
};

const BEST_RATE_THRESHOLD = 10;

// ─── Popularity ranking for "Most Popular" sort ─────────────────────────────
// Lower number = more popular. Brands not in this map get a high default score.
const BRAND_POPULARITY: Record<string, number> = {
  amazon: 1, flipkart: 2, myntra: 3, swiggy: 4, zomato: 5,
  bigbasket: 6, nykaa: 7, bookmyshow: 8, makemytrip: 9, croma: 10,
  tanishq: 11, ajio: 12, uber: 13, "google play": 14, apple: 15,
  netflix: 16, starbucks: 17, spotify: 18, phonepe: 19, paytm: 20,
  "tata cliq": 21, lifestyle: 22, "shoppers stop": 23, westside: 24,
  "reliance digital": 25, pantaloons: 26, cleartrip: 27, easemytrip: 28,
  "domino": 29, "mcdonald": 30, "pizza hut": 31, kfc: 32, bata: 33,
  titan: 34, fastrack: 35, lenskart: 36, pepperfry: 37, "urban company": 38,
  jiomart: 39, ola: 40, ikea: 41, "marks & spencer": 42, "h&m": 43,
  decathlon: 44, hamleys: 45, "body shop": 46, sephora: 47, fabindia: 48,
  spencer: 49, "1mg": 50, yatra: 51, "cafe coffee day": 52, ccd: 52,
  "cult.fit": 53, cultfit: 53, coursera: 54, hpcl: 55,
};

function getPopularityScore(name: string): number {
  const lower = name.toLowerCase();
  for (const [brand, score] of Object.entries(BRAND_POPULARITY)) {
    if (lower.includes(brand)) return score;
  }
  return 999;
}

// ── Freshness timestamps ────────────────────────────────────────────────────
// Simulated "last-updated" offsets in minutes per voucher brand.
// In a real backend this would come from the API response.
const VOUCHER_UPDATED_MINUTES: Record<string, number> = {
  flipkart: 18, amazon: 42, zomato: 5, swiggy: 73, uber: 130,
  bigbasket: 25, hpcl: 210, makemytrip: 55, bookmyshow: 12,
  cultfit: 90, coursera: 320, croma: 8,
};
// Page-level: use the most-recently updated brand
const PAGE_UPDATED_MINUTES = Math.min(...Object.values(VOUCHER_UPDATED_MINUTES));

function formatRelativeTime(minutes: number): string {
  if (minutes < 1)  return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

function formatCardRelativeTime(minutes: number): string {
  if (minutes < 60)  return "Updated today";
  const h = Math.floor(minutes / 60);
  if (h < 24) return `Updated ${h}h ago`;
  return "Updated yesterday";
}

function parseRate(rate: string): number {
  return parseFloat(rate.replace("%", "")) || 0;
}

function getBestPlatformName(v: Voucher): string | null {
  const best = v.platformRates.find((p) => p.highlight);
  return best ? best.platform : null;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-gold font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function QuickView({ voucher, open, onClose }: { voucher: Voucher | null; open: boolean; onClose: () => void }) {
  const isMobile = useIsMobile();
  const { toggle: toggleFav, isFav } = useFavorites("voucher");

  // Lock body scroll when QuickView is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Compute combos for this voucher
  const comboResult = useMemo(() => {
    if (!voucher) return null;
    return computeVoucherCombos(voucher.id, voucher.name, voucher.category, voucher.platformRates);
  }, [voucher]);

  if (!voucher) return null;
  const Icon = iconMap[voucher.category] || Gift;
  const bestPlatform = voucher.platformRates.find((p) => p.highlight);
  const active = isFav(voucher.id);

  const innerContent = (
    <div style={{ background: `linear-gradient(180deg, ${voucher.color}08, transparent 200px)` }}>
      <div className="relative p-4 sm:p-6 pb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${voucher.logo ? "bg-white p-1.5 sm:p-2" : "p-2 sm:p-2.5"}`} style={voucher.logo ? undefined : { background: `linear-gradient(135deg, ${voucher.color}25, ${voucher.color}10)`, border: `1px solid ${voucher.color}30` }}>
              {voucher.logo ? (
                <img src={voucher.logo} alt={voucher.name} className="w-full h-full object-contain" loading="lazy" />
              ) : (
                <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: voucher.color }} />
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-2xl font-bold tracking-tight">{voucher.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground font-medium">{voucher.category}</span>
                {bestPlatform && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" /> Best: {bestPlatform.savings}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              onClick={(e) => { e.stopPropagation(); toggleFav(voucher.id); }}
              whileTap={{ scale: 0.85 }}
              className="p-2 sm:p-2.5 rounded-xl glass-card transition-colors active:scale-90"
              aria-label={active ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className="w-4 h-4 transition-colors duration-200"
                style={{ color: active ? "hsl(var(--gold))" : undefined }}
                fill={active ? "hsl(var(--gold))" : "none"}
              />
            </motion.button>
            <button className="p-2 sm:p-2.5 rounded-xl glass-card text-muted-foreground hover:text-foreground transition-colors active:scale-90">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
          {[
            { label: "Best Rate", value: voucher.bestRate, icon: Star },
            { label: "Validity", value: voucher.validity.split(" ").slice(0, 2).join(" "), icon: Clock },
            { label: "Platforms", value: `${voucher.platformRates.length} live`, icon: Globe },
          ].map((s) => (
            <div key={s.label} className="flex-1 glass-card rounded-xl p-2 sm:p-3 text-center">
              <s.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold mx-auto mb-1" />
              <p className="text-[11px] sm:text-xs font-semibold">{s.value}</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
          <div className="flex-1 glass-card rounded-xl p-2 sm:p-3 text-center">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold mx-auto mb-1" />
            <div className="flex items-end justify-center gap-[2px] h-4">
              {voucher.rateHistory.map((rh, i) => (
                <div key={i} className="w-1.5 rounded-full bg-gold/60" style={{ height: `${(rh.rate / Math.max(...voucher.rateHistory.map(r => r.rate))) * 16}px` }} />
              ))}
            </div>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">6mo Trend</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 px-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Compare Across Platforms</p>
        </div>
        <div className="space-y-2 pr-1">
          {voucher.platformRates.map((pr, i) => (
            <motion.a
              key={pr.platform}
              href={pr.link || "#"}
              target={pr.link ? "_blank" : undefined}
              rel={pr.link ? "noopener noreferrer" : undefined}
              onClick={() => playSound("tap")}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all cursor-pointer active:scale-[0.98] ${
                pr.highlight
                  ? "border border-gold/30 bg-gradient-to-r from-gold/8 to-transparent shadow-sm shadow-gold/5"
                  : "glass-card"
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                pr.highlight ? "bg-gold/15 text-gold" : "bg-secondary/60 text-foreground"
              }`}>
                {pr.platform.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{pr.platform}</h4>
                  {pr.highlight && <span className="text-[8px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-bold uppercase">Best</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {pr.live ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60" title="Currently unavailable — check back later">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> Offline
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{pr.type}</p>
                <p className={`text-sm sm:text-base font-bold ${pr.highlight ? "text-gold" : "text-foreground"}`}>{pr.savings}</p>
              </div>
              <span className={`flex px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all items-center gap-1.5 flex-shrink-0 ${
                pr.highlight ? "gold-btn shadow-lg shadow-gold/20" : "bg-secondary/80 text-foreground"
              }`}>
                Buy <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>

      <div className="p-4 pt-0 pb-3 mx-4 mb-2">
        <div className="border-t border-border/20 pt-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {voucher.denominations.slice(0, 3).map((d) => (
              <span key={d} className="text-[10px] px-2 py-0.5 rounded-lg bg-secondary/40 text-muted-foreground flex-shrink-0">₹{d.toLocaleString()}</span>
            ))}
            {voucher.denominations.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-secondary/40 text-muted-foreground">₹{voucher.denominations[3].toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{voucher.name}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto pb-20">{innerContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-0 bg-transparent shadow-none p-0 sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">{voucher.name}</DialogTitle>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="rounded-3xl overflow-hidden">
          <div className="glass-card rounded-3xl border border-border/30 overflow-hidden">
            {innerContent}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

type SortOption = "rate" | "name" | "category" | "newest" | "popular";

export default function Vouchers() {
  const { vouchers, isLive, refetch } = useVouchers();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const activeCategory = searchParams.get("category") ?? "All";
  const sortBy = (searchParams.get("sort") ?? "popular") as SortOption;

  const setSearch = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val ? p.set("q", val) : p.delete("q"); return p; }, { replace: true });
  const setActiveCategory = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val && val !== "All" ? p.set("category", val) : p.delete("category"); return p; }, { replace: true });
  const setSortBy = (val: string) =>
    setSearchParams((prev) => { const p = new URLSearchParams(prev); val && val !== "popular" ? p.set("sort", val) : p.delete("sort"); return p; }, { replace: true });

  const [filterMode, setFilterMode] = useState<"category" | "platform">("category");
  const [activePlatform, setActivePlatform] = useState("All");
  const [quickViewVoucher, setQuickViewVoucher] = useState<Voucher | null>(null);
  const { record: recordView } = useRecentlyViewed();
  const isMobile = useIsMobile();
  const [showMyCards, setShowMyCards] = useState(false);
  const { state: myCardsState } = useMyCards();
  const myCardIds = useMemo(() => myCardsState.cards.map((c) => c.cardId), [myCardsState]);
  const hasMyCards = myCardIds.length > 0;

  // Max Value Calculator state
  const [calcBrand, setCalcBrand] = useState(vouchers[0]?.id || "");
  const [calcAmount, setCalcAmount] = useState([5000]);
  const [calcCardId, setCalcCardId] = useState(allCards[0]?.id || "");

  const calcResult = useMemo(() => {
    const v = vouchers.find((x) => x.id === calcBrand);
    if (!v) return null;
    const combo = computeVoucherCombos(v.id, v.name, v.category, v.platformRates);
    const selectedCard = allCards.find((c) => c.id === calcCardId);
    const cardCombo = combo.allCombos.find((c) => c.card.id === calcCardId) || combo.bestCombo;
    if (!cardCombo) return null;
    const val = calculateMaxValue(cardCombo.voucherRate, cardCombo.cardEarningRate, cardCombo.cardRedemptionValue, calcAmount[0]);
    return { ...val, portal: cardCombo.portal, cardName: cardCombo.card.name, voucherRate: cardCombo.voucherRate };
  }, [calcBrand, calcAmount, calcCardId]);


  // ── Sticky search bar on mobile ──
  const controlsRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Always observe — gate visibility with `isMobile` in render
  useEffect(() => {
    const sentinel = controlsRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" } // 56px = navbar height
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const openQuickView = (v: Voucher) => {
    setQuickViewVoucher(v);
    recordView({ id: v.id, type: "voucher", name: v.name, color: v.color, href: `/vouchers` });
  };
  const { toggle: toggleFav, isFav } = useFavorites("voucher");
  const loading = useMinLoading(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    await refetch();
    setRefreshKey((k) => k + 1);
    toast.success("Voucher rates refreshed");
  }, [refetch]);

  const { pullDistance, refreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: !isMobile,
  });

  useEffect(() => { return () => { document.title = "CardPerks"; }; }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: vouchers.length };
    vouchers.forEach((v) => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return counts;
  }, [vouchers]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach((v) => v.platformRates.forEach((p) => set.add(p.platform)));
    return set.size;
  }, [vouchers]);

  const platformNames = useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach((v) => v.platformRates.forEach((p) => set.add(p.platform)));
    return ["All", ...Array.from(set).sort()];
  }, [vouchers]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { All: vouchers.length };
    vouchers.forEach((v) => v.platformRates.forEach((p) => { counts[p.platform] = (counts[p.platform] || 0) + 1; }));
    return counts;
  }, [vouchers]);

  const filtered = useMemo(() => {
    let result = vouchers.filter((v) => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "All" || v.category === activeCategory;
      const matchPlatform = activePlatform === "All" || v.platformRates.some((p) => p.platform === activePlatform);
      return matchSearch && matchCategory && matchPlatform;
    });
    if (sortBy === "popular") result = [...result].sort((a, b) => getPopularityScore(a.name) - getPopularityScore(b.name));
    else if (sortBy === "rate") result = [...result].sort((a, b) => parseRate(b.bestRate) - parseRate(a.bestRate));
    else if (sortBy === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "category") result = [...result].sort((a, b) => a.category.localeCompare(b.category));
    return result;
  }, [vouchers, search, activeCategory, sortBy]);

  // Precompute combos once for all filtered vouchers (expensive — avoid per-card in render)
  const comboMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeVoucherCombos>>();
    for (const v of filtered) {
      map.set(v.id, computeVoucherCombos(v.id, v.name, v.category, v.platformRates));
    }
    return map;
  }, [filtered]);

  const clearFilters = () => { setSearch(""); setActiveCategory("All"); };

  return (
    <PageLayout>
      <SEO fullTitle="Browse Voucher Rates | CardPerks" description="Compare credit card voucher rates across 12+ brands. Find the best redemption deals for your reward points." path="/vouchers" />

      {/* ── Pull-to-refresh indicator (mobile only) ── */}
      {isMobile && (
        <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
      )}

      {/* ── Mobile Sticky Search + Filters Bar ── */}
      <AnimatePresence>
        {isSticky && isMobile && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
            className="fixed top-14 left-0 right-0 z-40 sm:hidden px-3 pt-2 pb-2.5"
            style={{
              background: "hsl(var(--background) / 0.82)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid hsl(var(--border) / 0.3)",
              boxShadow: "0 4px 24px hsl(var(--foreground) / 0.10), 0 1px 0 hsl(var(--gold) / 0.08)",
            }}
          >
            {/* Gold shimmer top line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            {/* Search */}
            <div className="relative w-full mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search vouchers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 h-9 text-sm rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all"
                style={{ background: "hsl(var(--foreground) / 0.04)" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips — horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-3 px-3">
              {voucherCategories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ touchAction: "manipulation" }}
                    className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium flex-shrink-0 ${
                      isActive
                        ? "bg-gold text-background font-semibold shadow shadow-gold/20"
                        : "border border-border/40 text-muted-foreground"
                    }`}
                  >
                    {cat}
                    {categoryCounts[cat] ? (
                      <span className={`ml-1 text-[9px] ${isActive ? "text-background/60" : "text-muted-foreground/50"}`}>
                        ({categoryCounts[cat]})
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-8 sm:py-12 relative">
        <div className="container mx-auto px-4 relative">
          <PremiumPageHeader
            accentLabel="Vouchers"
            title={<>Browse <span className="gold-gradient">Vouchers</span></>}
            subtitle="Compare credit card voucher rates across brands. Find the best redemption deals for your reward points."
            stats={[
              { icon: Tag, text: `${vouchers.length} Brands` },
              { icon: Globe, text: `${uniquePlatforms} Platforms` },
              {
                icon: TrendingUp,
                text: "Live Rates",
                customIcon: (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                ),
              },
            ]}
            searchPlaceholder={`Search ${vouchers.length}+ brands like Amazon, Zomato…`}
            searchValue={search}
            onSearchChange={setSearch}
            beforeFilters={
              <div className="flex items-center gap-1 bg-secondary/30 rounded-full p-1 w-fit">
                <button
                  onClick={() => { playSound("switch"); setFilterMode("platform"); setActiveCategory("All"); }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterMode === "platform" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Platform
                </button>
                <button
                  onClick={() => { playSound("switch"); setFilterMode("category"); setActivePlatform("All"); }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterMode === "category" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Category
                </button>
              </div>
            }
            filters={
              filterMode === "category"
                ? voucherCategories.map((cat) => ({ label: cat, count: categoryCounts[cat] || 0 }))
                : platformNames.map((p) => ({ label: p, count: platformCounts[p] || 0 }))
            }
            activeFilter={filterMode === "category" ? activeCategory : activePlatform}
            onFilterChange={filterMode === "category" ? setActiveCategory : setActivePlatform}
            resultCount={filtered.length}
            resultLabel={`voucher${filtered.length !== 1 ? "s" : ""}`}
            resultSuffix={
              <>
                {activeCategory !== "All" && <> in <span className="text-gold">{activeCategory}</span></>}
                {search && <> matching "<span className="text-gold">{search}</span>"</>}
                <span className="ml-3 inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isLive ? (
                      <span className="text-emerald-400 font-medium">Live</span>
                    ) : (
                      <>Updated: <span className="text-foreground/70 font-medium">{formatRelativeTime(PAGE_UPDATED_MINUTES)}</span></>
                    )}
                  </span>
                </span>
              </>
            }
            sortValue={sortBy}
            onSortChange={(v) => setSortBy(v as SortOption)}
            sortOptions={[
              { value: "popular", label: "Most Popular" },
              { value: "rate", label: "Best Rate" },
              { value: "name", label: "A–Z" },
              { value: "category", label: "Category" },
              { value: "newest", label: "Newest" },
            ]}
          />

          {/* Sentinel — once this scrolls off screen the sticky bar appears */}
          <div ref={controlsRef} className="h-px w-full -mt-2 sm:hidden" aria-hidden />



          {loading ? (
            <SkeletonGrid count={8} columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <VoucherSkeleton />
            </SkeletonGrid>
          ) : (
          <>
            <MobileVouchersLayout vouchers={filtered} onQuickView={openQuickView} myCardIds={myCardIds} showMyCards={false} comboMap={comboMap} />
            <DesktopVouchersLayout
              vouchers={filtered}
              search={search}
              onQuickView={openQuickView}
              isFav={isFav}
              toggleFav={toggleFav}
              myCardIds={myCardIds}
              showMyCards={showMyCards}
              comboMap={comboMap}
            />

          </>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/40 flex items-center justify-center">
                <SearchX className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg text-muted-foreground font-medium">No vouchers found</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Try a different search term or category</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gold-outline-btn text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <QuickView voucher={quickViewVoucher} open={!!quickViewVoucher} onClose={() => setQuickViewVoucher(null)} />
      <BackToTop />
    </PageLayout>
  );
}
