import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Search, X, ChevronDown, RefreshCw, Crown, Plus, Info, Share2, Printer, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cards, type CreditCard } from "@/data/cards";
import { rewardsCalcData, type RewardsCalcCard } from "@/data/calc-types";
import CardImage from "@/components/CardImage";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import MobileRewardsCalc from "@/components/calculators/MobileRewardsCalc";
import { isExcluded as isExcludedByRegistry } from "@/data/exclusions-registry";

/* ─── Category mapping with tooltip descriptions ─── */
const DEFAULT_CATS = [
  { id: "grocery", label: "Groceries", emoji: "🛒", v3Key: "grocery", tip: "Supermarkets, BigBasket, Blinkit, JioMart, Zepto. MCC: 5411, 5422" },
  { id: "dining", label: "Dining", emoji: "🍽️", v3Key: "dining", tip: "Restaurants, Swiggy, Zomato, food delivery apps. MCC: 5812, 5813, 5814" },
  { id: "fuel", label: "Fuel", emoji: "⛽", v3Key: "fuel", tip: "Petrol pumps, EV charging stations. MCC: 5541, 5542, 5983" },
  { id: "online", label: "Online Shopping", emoji: "🛍️", v3Key: "online", tip: "Amazon, Flipkart, Myntra, and other e-commerce. MCC: 5399, 5999" },
  { id: "travel", label: "Travel", emoji: "✈️", v3Key: "travel", tip: "Airlines, hotels, MakeMyTrip, Cleartrip, IRCTC. MCC: 3000-3350, 4511, 7011" },
  { id: "utilities", label: "Utilities / Other", emoji: "💡", v3Key: "utilities", tip: "Electricity, mobile recharge, broadband, DTH, gas. MCC: 4900, 4814, 4899" },
];

const EXTRA_CATS = [
  { id: "rent", label: "Rent", emoji: "🏠", v3Key: "base", tip: "Rent payments via CRED, NoBroker, etc. Often excluded from rewards. MCC: 6513" },
  { id: "insurance", label: "Insurance", emoji: "🛡️", v3Key: "base", tip: "Life, health, vehicle insurance premiums. MCC: 6300" },
  { id: "education", label: "Education", emoji: "🎓", v3Key: "base", tip: "School/college fees, online courses, EdTech. MCC: 8211, 8220, 8299" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", v3Key: "entertainment", tip: "Netflix, Hotstar, BookMyShow, gaming. MCC: 7832, 7841, 5815" },
  { id: "medical", label: "Medical", emoji: "🏥", v3Key: "base", tip: "Hospitals, pharmacies, 1mg, PharmEasy. MCC: 5912, 8011, 8062" },
];

const ALL_CATS = [...DEFAULT_CATS, ...EXTRA_CATS];
const MAX_SLIDER = 100000;
const MAX_CARDS = 3;

/* ─── Popular card suggestions for empty state ─── */
const POPULAR_CARD_IDS = ["hdfc-infinia-metal", "axis-magnus", "sbi-elite", "hdfc-regalia", "amex-platinum-travel", "icici-sapphiro"];

/* ─── Devaluation warnings ─── */
const DEVALUATION_WARNINGS: Record<string, string> = {
  "hdfc-infinia-metal": "SmartBuy 10X rates were reduced in Jan 2026 — calculations reflect current rates",
  "hdfc-diners-black": "SmartBuy 10X rates were reduced in Jan 2026 — calculations reflect current rates",
};

/* ─── Presets ─── */
const PRESETS = [
  { id: "casual", label: "Casual (₹30K)", values: { grocery: 5000, dining: 4000, fuel: 3000, online: 8000, travel: 2000, utilities: 8000 } },
  { id: "premium", label: "Premium (₹80K)", values: { grocery: 12000, dining: 12000, fuel: 6000, online: 20000, travel: 15000, utilities: 15000 } },
  { id: "heavy", label: "Heavy (₹1.5L)", values: { grocery: 20000, dining: 25000, fuel: 10000, online: 35000, travel: 30000, utilities: 30000 } },
];

/* ─── Helpers ─── */
type SpendingMap = Record<string, number>;

function fmtCurrency(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
function fmtInput(v: number) { return v.toLocaleString("en-IN"); }
function parseInput(s: string) { return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0; }

/* ─── Number ticker hook ─── */
function useNumberTicker(target: number, dur = 350) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    prev.current = target;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - (1 - p) ** 2;
      setVal(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

/* ─── Calculation engine ─── */
interface CatEarning {
  spend: number; rate: number; monthlyValue: number; annualValue: number;
  excluded: boolean; capped: boolean; capDetail?: string;
  portalBonus?: { name: string; rate: number };
  note?: string | null;
}

interface CalcResult {
  earnings: Record<string, CatEarning>;
  totalMonthlyValue: number; totalAnnualValue: number;
  totalMonthlyPoints: number; totalAnnualPoints: number;
  pointCurrency: string; cappedCats: string[];
}

function calculateRewards(v3: RewardsCalcCard, spending: SpendingMap, cardId?: string): CalcResult {
  const earnings: Record<string, CatEarning> = {};
  let totalMonthlyValue = 0;
  let totalMonthlyPoints = 0;
  const cappedCats: string[] = [];

  for (const cat of ALL_CATS) {
    const monthlySpend = spending[cat.id] || 0;
    if (monthlySpend === 0) {
      earnings[cat.id] = { spend: 0, rate: 0, monthlyValue: 0, annualValue: 0, excluded: false, capped: false };
      continue;
    }
    const catData = v3.categories?.[cat.v3Key] ?? v3.categories?.base;
    if (!catData) {
      earnings[cat.id] = { spend: monthlySpend, rate: 0, monthlyValue: 0, annualValue: 0, excluded: false, capped: false };
      continue;
    }
    const excluded = cardId ? isExcludedByRegistry(cardId, cat.v3Key) : (v3.exclusions ?? []).some(
      ex => ex.toLowerCase() === cat.v3Key.toLowerCase() ||
            ex.toLowerCase() === cat.label.toLowerCase() ||
            (cat.v3Key === "fuel" && ex.toLowerCase().includes("fuel"))
    );
    if (excluded || catData.rate === 0) {
      earnings[cat.id] = { spend: monthlySpend, rate: 0, monthlyValue: 0, annualValue: 0, excluded: true, capped: false };
      continue;
    }
    const effectiveRate = catData.rate / 100;
    let monthlyValue = monthlySpend * effectiveRate;
    let capped = false;
    let capDetail: string | undefined;
    if (catData.cap && catData.capPeriod === "Monthly") {
      const baseRate = (v3.categories.base?.rate ?? v3.baseRate) / 100;
      if (monthlySpend * effectiveRate > catData.cap * v3.pointValue) {
        const cappedSpend = catData.cap * v3.pointValue / effectiveRate;
        monthlyValue = cappedSpend * effectiveRate + (monthlySpend - cappedSpend) * baseRate;
        capped = true;
        capDetail = `Cap: ${fmtCurrency(catData.cap)} RP/month on ${cat.label}`;
        cappedCats.push(capDetail);
      }
    }
    let portalBonus: CatEarning["portalBonus"];
    for (const portal of v3.portals ?? []) {
      if (portal.merchants.length > 0 && (cat.v3Key === "travel" || cat.v3Key === "online" || cat.v3Key === "dining")) {
        const avgPortalRate = portal.merchants[0].effectiveRate / 100;
        if (avgPortalRate > effectiveRate) {
          portalBonus = { name: portal.name, rate: avgPortalRate * 100 };
        }
        break;
      }
    }
    const pointValue = v3.pointValue;
    const monthlyPoints = monthlyValue / pointValue;
    earnings[cat.id] = {
      spend: monthlySpend, rate: catData.rate, monthlyValue: Math.round(monthlyValue),
      annualValue: Math.round(monthlyValue * 12), excluded: false, capped, capDetail, portalBonus,
      note: catData.note,
    };
    totalMonthlyValue += monthlyValue;
    totalMonthlyPoints += monthlyPoints;
  }

  return {
    earnings,
    totalMonthlyValue: Math.round(totalMonthlyValue),
    totalAnnualValue: Math.round(totalMonthlyValue * 12),
    totalMonthlyPoints: Math.round(totalMonthlyPoints),
    totalAnnualPoints: Math.round(totalMonthlyPoints * 12),
    pointCurrency: v3.rewardName,
    cappedCats,
  };
}

/* ─── Share helper ─── */
function shareResults(cardName: string, annualValue: number, monthlySpend: number) {
  const text = `My rewards with ${cardName}: ${fmtCurrency(annualValue)}/year on ${fmtCurrency(monthlySpend)}/month spend — via CardPerks`;
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!", { description: text, duration: 3000 });
  }).catch(() => {
    toast.error("Could not copy to clipboard");
  });
}

/* ─── Print handler ─── */
function handlePrint() {
  window.print();
}

/* ─── Skeleton Loader ─── */
function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading results">
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 rounded-lg bg-muted/30" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/30 rounded w-2/3" />
          <div className="h-3 bg-muted/20 rounded w-1/3" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 bg-primary/10 rounded w-20 ml-auto" />
          <div className="h-2 bg-muted/20 rounded w-14 ml-auto" />
        </div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <div className="w-6 h-6 rounded bg-muted/20" />
          <div className="h-3 bg-muted/20 rounded w-20" />
          <div className="flex-1 h-5 bg-muted/10 rounded-full" />
          <div className="h-3 bg-muted/20 rounded w-16" />
        </div>
      ))}
      <div className="rounded-xl bg-muted/10 h-32" />
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ onSelectCard }: { onSelectCard: (card: CreditCard) => void }) {
  const popularCards = useMemo(() =>
    POPULAR_CARD_IDS.map(id => cards.find(c => c.id === id)).filter(Boolean) as CreditCard[],
    []
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
          <div className="absolute -right-3 -top-2 w-20 h-14 rounded-xl bg-muted/20 border border-border/30 rotate-6" />
          <div className="absolute -left-3 -top-2 w-20 h-14 rounded-xl bg-muted/15 border border-border/20 -rotate-6" />
          <span className="text-3xl relative z-10">💳</span>
        </div>
      </div>
      <p className="text-lg font-serif text-foreground mb-1">Select a card to calculate your rewards</p>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Search above or pick one of these popular cards
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {popularCards.map(card => (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/30 hover:border-primary/40 hover:bg-primary/[0.04] transition-all group"
          >
            <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
              {card.image ? (
                <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
              ) : (
                <div className="w-full h-full rounded" style={{ background: card.color }} />
              )}
            </div>
            <span className="text-xs text-foreground font-medium group-hover:text-primary transition-colors">{card.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Multi-Card Selector ─── */
function MultiCardSelector({
  selectedCards,
  onAdd,
  onRemove,
}: {
  selectedCards: CreditCard[];
  onAdd: (c: CreditCard) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedIds = selectedCards.map(c => c.id);

  const eligibleCards = useMemo(() => cards.filter(c => c.id in rewardsCalcData), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return eligibleCards.filter(c => !selectedIds.includes(c.id));
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return eligibleCards.filter(c => {
      if (selectedIds.includes(c.id)) return false;
      const hay = (c.name + " " + c.issuer).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [query, eligibleCards, selectedIds]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full mb-6">
      {selectedCards.length < MAX_CARDS && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-label="Search credit cards"
            aria-haspopup="listbox"
            placeholder={selectedCards.length === 0 ? "Search for a card to get started..." : "Add another card to compare..."}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-full bg-card border border-border/40 rounded-xl py-3.5 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
          {query && (
            <button onClick={() => { setQuery(""); setOpen(false); }} aria-label="Clear search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {selectedCards.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedCards.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full bg-card border border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
                {card.image ? (
                  <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                ) : (
                  <div className="w-full h-full rounded" style={{ background: card.color }} />
                )}
              </div>
              <span className="text-xs text-foreground font-medium truncate max-w-[100px]">{card.name}</span>
              <span className="text-[9px] text-primary font-mono">{rewardsCalcData[card.id]?.baseRate ?? "—"}%</span>
              <button
                onClick={() => onRemove(card.id)}
                aria-label={`Remove ${card.name}`}
                className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
          {selectedCards.length < MAX_CARDS && selectedCards.length >= 1 && !open && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-primary/30 text-xs text-primary/70 hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Compare with another card
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Card search results"
            className="absolute z-50 mt-1.5 w-full max-h-72 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/40 scrollbar-hide"
          >
            {filtered.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No cards match your search. Try a different bank or card name.</p>
            )}
            {filtered.map(card => (
              <button
                key={card.id}
                role="option"
                aria-selected={false}
                onClick={() => { onAdd(card); setQuery(""); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors border-b border-border/10 last:border-0"
              >
                <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  {card.image ? (
                    <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{card.name}</p>
                  <p className="text-[10px] text-muted-foreground">{card.issuer} • {card.type}</p>
                </div>
                <span className="text-[10px] text-primary font-mono flex-shrink-0">
                  {rewardsCalcData[card.id]?.baseRate ?? "—"}%
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Category Tooltip ─── */
function CategoryTooltip({ tip }: { tip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Category information"
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ─── Spending Row with slider + input ─── */
function SpendingRow({ cat, value, onChange }: { cat: typeof ALL_CATS[0]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2 py-3 border-b border-border/10 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground flex items-center gap-1.5">
          <span className="mr-0.5">{cat.emoji}</span>
          {cat.label}
          <CategoryTooltip tip={cat.tip} />
        </span>
        <div className="relative w-28">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
          <input
            type="text" inputMode="numeric"
            aria-label={`Monthly ${cat.label} spending in rupees`}
            value={value === 0 ? "" : fmtInput(value)}
            onChange={e => onChange(parseInput(e.target.value))}
            placeholder="0"
            className="w-full bg-card border border-border/40 rounded-lg py-1.5 pl-6 pr-2 text-xs text-right text-foreground font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>
      </div>
      <Slider
        value={[Math.min(value, MAX_SLIDER)]}
        onValueChange={([v]) => onChange(v)}
        max={MAX_SLIDER} step={500}
        aria-label={`Monthly ${cat.label} spending slider`}
        className="[&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4 [&_[data-radix-slider-thumb]]:border-primary"
      />
    </div>
  );
}

/* ─── Single Card Results Panel ─── */
function SingleResultsPanel({ card, v3, spending, totalMonthly }: { card: CreditCard; v3: RewardsCalcCard; spending: SpendingMap; totalMonthly: number }) {
  const result = useMemo(() => calculateRewards(v3, spending, card.id), [v3, spending, card.id]);
  const annualVal = useNumberTicker(result.totalAnnualValue);
  const monthlyVal = useNumberTicker(result.totalMonthlyValue);
  const monthlyPts = useNumberTicker(result.totalMonthlyPoints);
  const annualPts = useNumberTicker(result.totalAnnualPoints);

  const { earnings, cappedCats, pointCurrency } = result;
  const activeCats = ALL_CATS.filter(c => (spending[c.id] || 0) > 0);
  const maxCatVal = Math.max(1, ...activeCats.map(c => earnings[c.id]?.annualValue ?? 0));
  const portalBonuses = activeCats.filter(c => earnings[c.id]?.portalBonus).map(c => ({ cat: c, portal: earnings[c.id].portalBonus! }));
  const devalWarning = DEVALUATION_WARNINGS[card.id];

  return (
    <div className="space-y-6 print-results">
      {/* Card header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
          {card.image ? <CardImage src={card.image} alt={`${card.name} card`} fallbackColor={card.color} /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-serif text-foreground truncate">{card.name}</h2>
          <p className="text-xs text-muted-foreground">{card.issuer} • {card.fee}/yr</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-primary font-mono" aria-label={`Annual value ${fmtCurrency(annualVal)}`}>{fmtCurrency(annualVal)}</p>
          <p className="text-[10px] text-muted-foreground">annual value</p>
        </div>
      </div>

      {/* Base rate label */}
      {v3.baseRateLabel && (
        <p className="text-[11px] text-muted-foreground/80 -mt-3 ml-20">
          Base: {v3.baseRate}% — <span className="italic">{v3.baseRateLabel}</span>
        </p>
      )}

      {/* Devaluation warning */}
      {devalWarning && (
        <div className="rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-3 flex items-start gap-2">
          <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-400">{devalWarning}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 print:hidden">
        <button
          onClick={() => shareResults(card.name, result.totalAnnualValue, totalMonthly)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
          aria-label="Share results"
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
          aria-label="Print results"
        >
          <Printer className="w-3 h-3" /> Print
        </button>
      </div>

      {/* Category breakdown */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Category Breakdown</p>
        {activeCats.map(cat => {
          const earn = earnings[cat.id];
          if (!earn) return null;
          const barW = earn.excluded ? 0 : Math.max(2, (earn.annualValue / maxCatVal) * 100);
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-2.5 border-b border-border/10">
              <span className="text-sm w-6 text-center flex-shrink-0">{cat.emoji}</span>
              <span className="text-xs text-foreground w-28 flex-shrink-0 truncate">{cat.label}</span>
              <div className="flex-1 h-5 relative flex items-center">
                {earn.excluded ? (
                  <span className="text-[10px] text-destructive/70 font-medium flex items-center gap-1">
                    <Ban className="w-3 h-3" aria-hidden="true" />
                    Excluded
                  </span>
                ) : (
                  <motion.div className="h-full rounded-full bg-primary/80" initial={{ width: 0 }} animate={{ width: `${barW}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                )}
              </div>
              {!earn.excluded && (
                <div className="text-right flex-shrink-0 w-28 flex items-center justify-end gap-1">
                  <span className="text-xs font-mono text-foreground">{fmtCurrency(earn.annualValue)}</span>
                  <span className="text-[9px] text-muted-foreground">({earn.rate}%)</span>
                  {earn.note && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" aria-label="Rate note" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors">
                            <Info className="w-2.5 h-2.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">{earn.note}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Portal bonuses */}
      {portalBonuses.length > 0 && (
        <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-4 space-y-2">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">🚀 Portal Bonuses Available</p>
          {portalBonuses.map(({ cat, portal }) => (
            <div key={cat.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{cat.label} via <span className="text-primary font-medium">{portal.name}</span></span>
              <span className="text-primary font-mono font-semibold">{portal.rate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary box */}
      <div className="rounded-xl bg-card border border-border/20 p-5 space-y-4 shadow-lg shadow-black/10">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[10px] text-muted-foreground mb-0.5">Monthly {pointCurrency}</p><p className="text-base font-bold text-foreground font-mono">{monthlyPts.toLocaleString("en-IN")} {pointCurrency.split(" ")[0]}</p></div>
          <div><p className="text-[10px] text-muted-foreground mb-0.5">Monthly Value</p><p className="text-base font-bold text-foreground font-mono">{fmtCurrency(monthlyVal)}</p></div>
          <div><p className="text-[10px] text-muted-foreground mb-0.5">Annual {pointCurrency}</p><p className="text-base font-bold text-foreground font-mono">{annualPts.toLocaleString("en-IN")} {pointCurrency.split(" ")[0]}</p></div>
          <div><p className="text-[10px] text-muted-foreground mb-0.5">Annual Value</p><p className="text-xl font-bold text-primary font-mono">{fmtCurrency(annualVal)}</p></div>
        </div>
      </div>

      {/* Caps warning */}
      {cappedCats.length > 0 && (
        <div className="rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400 font-medium mb-1 flex items-center gap-1">
            <Info className="w-3 h-3" aria-hidden="true" />
            Earning caps apply
          </p>
          {cappedCats.map((d, i) => <p key={i} className="text-[11px] text-amber-400/80">{d}</p>)}
        </div>
      )}
    </div>
  );
}

/* ─── Comparison Results (Desktop) ─── */
function CompareResultsDesktop({ selectedCards, spending, totalMonthly }: { selectedCards: CreditCard[]; spending: SpendingMap; totalMonthly: number }) {
  const results = useMemo(() =>
    selectedCards.map(card => {
      const v3 = rewardsCalcData[card.id];
      return v3 ? { card, v3, result: calculateRewards(v3, spending, card.id) } : null;
    }).filter(Boolean) as { card: CreditCard; v3: RewardsCalcCard; result: CalcResult }[],
    [selectedCards, spending]
  );

  if (results.length === 0) return null;

  const activeCats = ALL_CATS.filter(c => (spending[c.id] || 0) > 0);
  const winnerId = useMemo(() => {
    let bestId = results[0].card.id;
    let bestVal = results[0].result.totalAnnualValue;
    for (const r of results) {
      if (r.result.totalAnnualValue > bestVal) { bestVal = r.result.totalAnnualValue; bestId = r.card.id; }
    }
    return results.every(r => r.result.totalAnnualValue === bestVal) ? null : bestId;
  }, [results]);

  const catWinners = useMemo(() => {
    const w: Record<string, string | null> = {};
    for (const cat of activeCats) {
      let bestId: string | null = null; let bestVal = -1;
      let allSame = true; let firstVal: number | null = null;
      for (const r of results) {
        const earn = r.result.earnings[cat.id];
        const val = earn?.excluded ? 0 : (earn?.annualValue ?? 0);
        if (firstVal === null) firstVal = val;
        else if (val !== firstVal) allSame = false;
        if (val > bestVal) { bestVal = val; bestId = r.card.id; }
      }
      w[cat.id] = allSame || bestVal === 0 ? null : bestId;
    }
    return w;
  }, [results, activeCats]);

  const maxCatVal = Math.max(1, ...results.flatMap(r => activeCats.map(c => r.result.earnings[c.id]?.annualValue ?? 0)));
  const cols = results.length;

  return (
    <div className="space-y-6 print-results">
      {/* Action buttons */}
      <div className="flex items-center gap-2 print:hidden">
        <button
          onClick={() => {
            const winner = results.reduce((a, b) => a.result.totalAnnualValue > b.result.totalAnnualValue ? a : b);
            shareResults(winner.card.name, winner.result.totalAnnualValue, totalMonthly);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
          aria-label="Share comparison results"
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
          aria-label="Print comparison"
        >
          <Printer className="w-3 h-3" /> Print
        </button>
      </div>

      {/* Card headers */}
      <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {results.map(({ card, result }) => (
          <div key={card.id} className={cn(
            "rounded-xl p-4 border transition-all relative",
            winnerId === card.id ? "border-primary/40 bg-primary/[0.06]" : "border-border/20 bg-card"
          )}>
            {winnerId === card.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                <Crown className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-primary font-semibold">Winner</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                {card.image ? <CardImage src={card.image} alt={`${card.name} card`} fallbackColor={card.color} /> : <div className="w-full h-full rounded-lg" style={{ background: card.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{card.name}</p>
                <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
              </div>
            </div>
            {DEVALUATION_WARNINGS[card.id] && (
              <p className="text-[10px] text-amber-400 mb-2 flex items-center gap-1"><Info className="w-3 h-3" aria-hidden="true" /> Rates updated</p>
            )}
            <p className={cn("text-xl font-bold font-mono", winnerId === card.id ? "text-primary" : "text-foreground")}>{fmtCurrency(result.totalAnnualValue)}</p>
            <p className="text-[10px] text-muted-foreground">annual value</p>
          </div>
        ))}
      </div>

      {/* Category breakdown comparison */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Category Breakdown</p>
        {activeCats.map(cat => (
          <div key={cat.id} className="py-3 border-b border-border/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{cat.emoji}</span>
              <span className="text-xs text-foreground font-medium">{cat.label}</span>
            </div>
            <div className={cn("grid gap-3", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
              {results.map(({ card, result: r }) => {
                const earn = r.earnings[cat.id];
                const isWinner = catWinners[cat.id] === card.id;
                if (!earn) return <div key={card.id} />;
                const barW = earn.excluded ? 0 : Math.max(2, (earn.annualValue / maxCatVal) * 100);
                return (
                  <div key={card.id} className={cn("rounded-lg p-2 transition-colors", isWinner && "bg-green-500/[0.06]")}>
                    {earn.excluded ? (
                      <span className="text-[10px] text-destructive/70 font-medium flex items-center gap-1">
                        <Ban className="w-3 h-3" aria-hidden="true" /> Excluded
                      </span>
                    ) : (
                      <>
                        <div className="h-3 rounded-full bg-border/20 mb-1.5 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-primary/70" initial={{ width: 0 }} animate={{ width: `${barW}%` }} transition={{ duration: 0.5 }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-mono", isWinner ? "text-green-400 font-semibold" : "text-foreground")}>
                            {isWinner && <span className="mr-1" aria-hidden="true">✓</span>}
                            {fmtCurrency(earn.annualValue)}
                          </span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            {earn.rate}%
                            {earn.note && (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button type="button" aria-label="Rate note" className="inline-flex items-center justify-center w-3 h-3 rounded-full text-primary/60 hover:text-primary transition-colors">
                                      <Info className="w-2 h-2" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px] text-xs">{earn.note}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {results.map(({ card, result }) => (
          <div key={card.id} className={cn(
            "rounded-xl p-4 border",
            winnerId === card.id ? "border-primary/30 bg-primary/[0.04]" : "border-border/20 bg-card"
          )}>
            <p className="text-[10px] text-muted-foreground mb-1">Annual Value</p>
            <p className={cn("text-lg font-bold font-mono", winnerId === card.id ? "text-primary" : "text-foreground")}>{fmtCurrency(result.totalAnnualValue)}</p>
            <p className="text-[10px] text-muted-foreground mt-2 mb-0.5">Monthly Value</p>
            <p className="text-sm font-mono text-foreground">{fmtCurrency(result.totalMonthlyValue)}</p>
            <p className="text-[10px] text-muted-foreground mt-2 mb-0.5">Annual {result.pointCurrency}</p>
            <p className="text-sm font-mono text-foreground">{result.totalAnnualPoints.toLocaleString("en-IN")}</p>
            {result.cappedCats.length > 0 && (
              <div className="mt-3 rounded-lg bg-amber-500/[0.08] border border-amber-500/20 p-2">
                <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1"><Info className="w-3 h-3" aria-hidden="true" /> Caps apply</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Comparison Results (Mobile) ─── */
function CompareResultsMobile({ selectedCards, spending, totalMonthly }: { selectedCards: CreditCard[]; spending: SpendingMap; totalMonthly: number }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() =>
    selectedCards.map(card => {
      const v3 = rewardsCalcData[card.id];
      return v3 ? { card, v3, result: calculateRewards(v3, spending, card.id) } : null;
    }).filter(Boolean) as { card: CreditCard; v3: RewardsCalcCard; result: CalcResult }[],
    [selectedCards, spending]
  );

  const winnerId = useMemo(() => {
    if (results.length < 2) return null;
    let bestId = results[0].card.id;
    let bestVal = results[0].result.totalAnnualValue;
    for (const r of results) {
      if (r.result.totalAnnualValue > bestVal) { bestVal = r.result.totalAnnualValue; bestId = r.card.id; }
    }
    return results.every(r => r.result.totalAnnualValue === bestVal) ? null : bestId;
  }, [results]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(Math.min(idx, results.length - 1));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [results.length]);

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Sticky summary bar */}
      <div className="sticky top-16 z-10 rounded-xl bg-card/95 backdrop-blur-md border border-border/20 p-3">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {results.map(({ card, result }) => (
            <div key={card.id} className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">{card.name.split(" ").slice(-1)}</span>
              <span className={cn("text-xs font-bold font-mono", winnerId === card.id ? "text-primary" : "text-foreground")}>
                {fmtCurrency(result.totalAnnualValue)}/yr
              </span>
              {winnerId === card.id && <Crown className="w-3 h-3 text-primary" aria-label="Winner" />}
            </div>
          ))}
        </div>
      </div>

      {/* Swipeable carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-4"
        style={{ scrollBehavior: "smooth" }}
        role="tabpanel"
        aria-label="Card results carousel"
      >
        {results.map(({ card, v3 }) => (
          <div key={card.id} className="flex-shrink-0 w-full snap-center">
            <div className="glass-card rounded-2xl border border-border/30 p-5">
              <SingleResultsPanel card={card} v3={v3} spending={spending} totalMonthly={totalMonthly} />
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Card navigation">
        {results.map((r, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`View ${r.card.name} results`}
            onClick={() => {
              scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth ?? 0), behavior: "smooth" });
            }}
            className={cn(
              "h-2 rounded-full transition-all",
              i === activeIdx ? "bg-primary w-5" : "bg-muted-foreground/30 w-2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function RewardsCalculator() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [selectedCards, setSelectedCards] = useState<CreditCard[]>([]);
  const [spending, setSpending] = useState<SpendingMap>(() => ({ ...PRESETS[0].values }));
  const [activePreset, setActivePreset] = useState("casual");
  const [showExtra, setShowExtra] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(`[RewardsCalc] ${Object.keys(rewardsCalcData).length} cards loaded`);
  }, []);

  useEffect(() => {
    if (initialized) return;
    const cardParam = searchParams.get("card");
    if (cardParam) {
      const found = cards.find(c => c.id === cardParam && c.id in rewardsCalcData);
      if (found) {
        setSelectedCards([found]);
      } else if (cardParam) {
        console.warn(`[RewardsCalc] No data for card: ${cardParam}`);
      }
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  const isCompareMode = selectedCards.length >= 2;
  const singleCard = selectedCards.length === 1 ? selectedCards[0] : null;
  const singleV3 = singleCard ? rewardsCalcData[singleCard.id] ?? null : null;

  const totalMonthly = useMemo(() => Object.values(spending).reduce((s, v) => s + v, 0), [spending]);
  const tickedTotal = useNumberTicker(totalMonthly);

  const handlePreset = useCallback((preset: typeof PRESETS[0]) => {
    setActivePreset(preset.id);
    setSpending({ ...preset.values });
  }, []);

  const handleCatChange = useCallback((catId: string, val: number) => {
    setActivePreset("");
    setSpending(prev => ({ ...prev, [catId]: val }));
  }, []);

  const handleAddCard = useCallback((card: CreditCard) => {
    setIsLoading(true);
    setSelectedCards(prev => prev.length < MAX_CARDS ? [...prev, card] : prev);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    setSelectedCards(prev => prev.filter(c => c.id !== id));
  }, []);

  if (isMobile) {
    return (
      <PageLayout>
        <SEO fullTitle="Rewards Calculator | CardPerks" description="Calculate and compare credit card rewards based on actual monthly spending." />
        <MobileRewardsCalc
          selectedCards={selectedCards}
          spending={spending}
          totalMonthly={totalMonthly}
          activePreset={activePreset}
          showExtra={showExtra}
          isCompareMode={isCompareMode}
          isLoading={isLoading}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onCatChange={handleCatChange}
          onPreset={handlePreset}
          onToggleExtra={() => setShowExtra(p => !p)}
          onReset={() => setSpending(prev => ({ ...prev }))}
          rewardsCalcData={rewardsCalcData}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO fullTitle="Rewards Calculator | CardPerks" description="Calculate and compare credit card rewards based on actual monthly spending." />
      <div className="container max-w-6xl mx-auto px-4 pt-6 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span>Tools</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Rewards Calculator</span>
        </nav>

        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif gold-gradient mb-1">Rewards Calculator</h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            {isCompareMode
              ? `Comparing ${selectedCards.length} cards — adjust spending to see which earns more`
              : "Select a card, enter your spending, and instantly see your rewards breakdown"}
          </p>
        </div>

        {/* Card Selector */}
        <MultiCardSelector selectedCards={selectedCards} onAdd={handleAddCard} onRemove={handleRemoveCard} />

        {/* Two-column layout */}
        <div className={cn("gap-8", isMobile ? "flex flex-col" : "grid grid-cols-[2fr_3fr]")}>
          {/* Left: Spending Inputs */}
          <div className="space-y-5">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Monthly Spending</p>

            {/* Presets */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Spending presets">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  aria-pressed={activePreset === p.id}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                    activePreset === p.id
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                      : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Default categories */}
            <div>
              {DEFAULT_CATS.map(cat => (
                <SpendingRow key={cat.id} cat={cat} value={spending[cat.id] || 0} onChange={v => handleCatChange(cat.id, v)} />
              ))}
            </div>

            {/* Expand */}
            <button
              onClick={() => setShowExtra(!showExtra)}
              aria-expanded={showExtra}
              className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
            >
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showExtra && "rotate-180")} />
              {showExtra ? "Show fewer categories" : "Add more categories"}
            </button>

            <AnimatePresence>
              {showExtra && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  {EXTRA_CATS.map(cat => (
                    <SpendingRow key={cat.id} cat={cat} value={spending[cat.id] || 0} onChange={v => handleCatChange(cat.id, v)} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Total */}
            <div className="rounded-xl p-4 border-2 border-primary/20 bg-primary/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Total Monthly Spend</span>
                <span className="text-lg font-bold text-primary font-mono" aria-live="polite">{fmtCurrency(tickedTotal)}</span>
              </div>
            </div>

            {/* Recalculate */}
            <button
              onClick={() => setSpending(prev => ({ ...prev }))}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Recalculate
            </button>
          </div>

          {/* Right: Results */}
          <div className={cn(!isMobile && "sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide")}>
            <div className="glass-card rounded-2xl border border-border/30 p-6">
              {selectedCards.length === 0 && (
                <EmptyState onSelectCard={handleAddCard} />
              )}

              {isLoading && selectedCards.length > 0 && (
                <ResultsSkeleton />
              )}

              {!isLoading && singleCard && singleV3 && (
                <SingleResultsPanel card={singleCard} v3={singleV3} spending={spending} totalMonthly={totalMonthly} />
              )}

              {!isLoading && singleCard && !singleV3 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-foreground mb-1">Limited data available</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Detailed reward calculations aren't available for <span className="font-medium text-foreground">{singleCard.name}</span> yet. Try another card.
                  </p>
                </div>
              )}

              {!isLoading && isCompareMode && !isMobile && (
                <CompareResultsDesktop selectedCards={selectedCards} spending={spending} totalMonthly={totalMonthly} />
              )}

              {!isLoading && isCompareMode && isMobile && (
                <CompareResultsMobile selectedCards={selectedCards} spending={spending} totalMonthly={totalMonthly} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
