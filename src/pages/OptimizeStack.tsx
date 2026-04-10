import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, TrendingUp, ChevronDown, ChevronUp,
  Lightbulb, AlertTriangle, Search,
  UtensilsCrossed, ShoppingCart, ShoppingBag, Plane, Fuel, Film,
  Pill, Smartphone, GraduationCap, Home, Banknote, CreditCard,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { cards as allCards, type CreditCard } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import CardImage from "@/components/CardImage";
import DeepLinkCTA, { DeepLinkGroup } from "@/components/DeepLinkCTA";
import { FINDER_CATEGORIES, FINDER_PRESETS, type FinderSpending } from "@/components/card-finder/finderTypes";
import { optimizeStack, type OptimizerResult } from "@/components/stack-optimizer/optimizerEngine";
import MobileOptimizerLayout from "@/components/stack-optimizer/MobileOptimizerLayout";
import DesktopOptimizerLayout from "@/components/stack-optimizer/DesktopOptimizerLayout";
import DistributionDonut from "@/components/stack-optimizer/DistributionDonut";
import { useMyCards } from "@/hooks/use-my-cards";
import { useIsMobile } from "@/hooks/use-mobile";
import { SpendingSlider } from "@/components/shared/SpendingSlider";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

const CAT_V3_MAP: Record<keyof FinderSpending, string[]> = {
  dining: ["dining"], groceries: ["grocery"], online: ["online"], travel: ["travel"],
  fuel: ["fuel"], entertainment: ["entertainment"], pharmacy: ["base"], telecom: ["base"],
  education: ["base"], utilities: ["utilities", "base"], rent: ["base"], other: ["base"],
};

const CAT_ICONS: Record<string, LucideIcon> = {
  dining: UtensilsCrossed, groceries: ShoppingCart, online: ShoppingBag, travel: Plane,
  fuel: Fuel, entertainment: Film, pharmacy: Pill, telecom: Smartphone,
  education: GraduationCap, utilities: Home, rent: Banknote, other: CreditCard,
};

const PRIMARY_CATS = ["dining", "groceries", "online", "travel", "fuel", "entertainment"];
const ADVANCED_CATS = ["pharmacy", "telecom", "education", "utilities", "rent", "other"];

const PORTAL_OPTIONS = [
  { id: "smartbuy", label: "HDFC SmartBuy", banks: ["hdfc"] },
  { id: "edge", label: "Axis EDGE Rewards", banks: ["axis"] },
  { id: "yono", label: "SBI YONO", banks: ["sbi"] },
];

/* ── Card Selector (sidebar) ──────────────────────────────── */
function CardSelector({ selected, selectedCards, onToggle, maxCards }: {
  selected: string[];
  selectedCards: CreditCard[];
  onToggle: (id: string) => void;
  maxCards: number;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = allCards.filter(
    (c) => !selected.includes(c.id) &&
      (() => {
        if (!search.trim()) return true;
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        const hay = (c.name + " " + c.issuer).toLowerCase();
        return words.every(w => hay.includes(w));
      })()
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-label text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Your Card Stack</span>
        <span className="text-[11px] text-muted-foreground font-mono">{selected.length} of {maxCards}</span>
      </div>

      <div className="space-y-2">
        {selectedCards.map((card) => (
          <div
            key={card.id}
            className="flex items-center gap-3 rounded-xl bg-background border border-primary/15 px-3 py-2.5 group hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-[30px] rounded-md overflow-hidden ring-1 ring-white/10 dark:ring-white/10 ring-border/10 shadow-md shrink-0">
              {card.image ? (
                <CardImage src={card.image} alt="" fallbackColor={card.color} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary/60 to-secondary/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">{card.name}</p>
              <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
            </div>
            <button
              onClick={() => onToggle(card.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
            >
              <span className="text-sm">&times;</span>
            </button>
          </div>
        ))}

        {selected.length < maxCards && !searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/30 dark:border-white/10 py-3 group hover:border-primary/30 transition-all cursor-pointer"
          >
            <span className="text-muted-foreground group-hover:text-primary text-base transition-colors">+</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground/70 transition-colors">Add Card</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="pl-8 h-9 text-xs bg-background border-border/10 dark:border-white/5"
                onBlur={() => { if (!search) setTimeout(() => setSearchOpen(false), 200); }}
              />
            </div>
            {filtered.length > 0 && (
              <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-hide">
                {filtered.slice(0, 10).map((card) => (
                  <button
                    key={card.id}
                    onClick={() => { onToggle(card.id); setSearch(""); setSearchOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <div className="w-10 h-[26px] rounded overflow-hidden shrink-0 ring-1 ring-white/10 dark:ring-white/10 ring-border/10">
                      <CardImage src={card.image ?? ""} alt="" fallbackColor={card.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{card.name}</p>
                      <p className="text-[9px] text-muted-foreground">{card.issuer}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selected.length < maxCards && (
              <button
                onClick={() => { setSearch(""); setSearchOpen(false); }}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground pt-2 transition-colors"
              >
                Cancel
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Spending Config (sidebar) ─────────────────────────────── */
function SpendingConfig({ spending, onChange }: { spending: FinderSpending; onChange: (s: FinderSpending) => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const total = Object.values(spending).reduce((a, b) => a + b, 0);
  const advancedHasValues = ADVANCED_CATS.some((id) => spending[id as keyof FinderSpending] > 0);

  return (
    <div className="space-y-4">
      <span className="font-label text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Monthly Spending Profile</span>

      <div className="flex flex-wrap gap-2">
        {FINDER_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setActivePreset(p.id); onChange(p.values); }}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
              activePreset === p.id
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/10 dark:border-white/5 bg-background text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {PRIMARY_CATS.map((catId) => {
          const cat = FINDER_CATEGORIES.find((c) => c.id === catId)!;
          const Icon = CAT_ICONS[catId] || CreditCard;
          return (
            <SpendingSlider
              key={cat.id}
              icon={Icon}
              label={cat.mobileLabel || cat.label}
              value={spending[cat.id]}
              onChange={(v) => { setActivePreset(null); onChange({ ...spending, [cat.id]: v }); }}
              max={cat.id === "rent" ? 100000 : 50000}
              step={1000}
            />
          );
        })}
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors w-full font-label uppercase tracking-widest"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        More categories {advancedHasValues && !showAdvanced && <span className="text-primary">(has values)</span>}
      </button>
      <AnimatePresence>
        {showAdvanced && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-6 pb-1">
              {ADVANCED_CATS.map((catId) => {
                const cat = FINDER_CATEGORIES.find((c) => c.id === catId)!;
                const Icon = CAT_ICONS[catId] || CreditCard;
                return (
                  <SpendingSlider
                    key={cat.id}
                    icon={Icon}
                    label={cat.mobileLabel || cat.label}
                    value={spending[cat.id]}
                    onChange={(v) => { setActivePreset(null); onChange({ ...spending, [cat.id]: v }); }}
                    max={cat.id === "rent" ? 100000 : 50000}
                    step={1000}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground pt-4 border-t border-border/10 dark:border-white/5 font-mono">
        Total: <span className="text-primary font-bold">{"\u20B9"}{total.toLocaleString("en-IN")}</span>/mo
      </p>
    </div>
  );
}

/* ── Hero Results ──────────────────────────────────────────── */
function HeroResults({ result }: { result: OptimizerResult }) {
  const boost = result.totalOptimized - result.singleBestValue;
  const boostPct = result.singleBestValue > 0 ? ((boost / result.singleBestValue) * 100).toFixed(1) : "0";

  return (
    <div
      className="relative overflow-hidden p-12 md:p-16 rounded-[40px] border border-primary/10 text-center"
      style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)" }}
    >
      <h3 className="font-label text-muted-foreground text-[11px] font-bold tracking-[0.4em] uppercase mb-6">
        Projected Annual Yield
      </h3>
      <div className="relative inline-block">
        <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
        <div className="relative flex items-center justify-center gap-4">
          <AnimatedCounter value={result.totalOptimized} className="font-serif text-7xl md:text-8xl lg:text-9xl font-light text-primary leading-none tracking-tight" />
          <span className="text-muted-foreground/40 font-serif text-2xl md:text-3xl self-end mb-4">/year</span>
        </div>
      </div>
      {boost > 0 && (
        <p className="text-muted-foreground text-[14px] mt-10 max-w-lg mx-auto leading-relaxed">
          Your current stack is leaking potential. By rerouting specific transactions, we can increase your net wealth gain by{" "}
          <span className="text-primary font-bold">+{boostPct}%</span> annually.
        </p>
      )}
    </div>
  );
}

/* ── Category Assignments (left col) ──────────────────────── */
function CategoryAssignments({ result }: { result: OptimizerResult }) {
  return (
    <div className="space-y-8">
      <h4 className="font-label text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Category Assignments</h4>
      <div className="space-y-4">
        {result.assignments.map((a) => {
          const Icon = CAT_ICONS[a.categoryId] || CreditCard;
          return (
            <div key={a.categoryId} className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-surface-2 dark:bg-[hsl(225,15%,13%)] flex items-center justify-center border border-border/5 dark:border-white/5 group-hover:border-primary/30 transition-colors shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-[140px]">
                <p className="text-[14px] font-bold">{a.categoryLabel}</p>
                <p className="text-[11px] text-muted-foreground tracking-tight font-mono">{"\u20B9"}{a.monthlySpend.toLocaleString("en-IN")}/mo</p>
              </div>
              <div className="flex-1 border-t border-dotted border-white/10 dark:border-white/10 border-border/20 mx-2 self-center h-px hidden lg:block" />
              <div className="flex items-center gap-3 bg-surface-2 dark:bg-[hsl(225,15%,13%)] border border-border/5 dark:border-white/5 py-2 pl-3 pr-4 rounded-full min-w-[160px] shrink-0">
                <div className="w-7 h-4 rounded overflow-hidden ring-1 ring-white/10 dark:ring-white/10 ring-border/10">
                  <CardImage src={a.bestCard.card.image ?? ""} alt="" fallbackColor={a.bestCard.card.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold truncate">{a.bestCard.card.name.split(" ").slice(-2).join(" ")}</p>
                </div>
                <span className="text-[11px] font-bold text-primary font-mono">{"\u20B9"}{Math.round(a.annualEarning / 12).toLocaleString("en-IN")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── AI Advisory (right col) ───────────────────────────────── */
function AIAdvisory({ result }: { result: OptimizerResult }) {
  const weakest = result.cardSummaries.find((cs) => cs.isWeakest);
  if (!weakest) return null;

  const stackIds = new Set(result.cardSummaries.map((cs) => cs.card.card.id));
  const replacements: { card: CreditCard; estimated: number }[] = [];

  for (const c of allCards) {
    if (stackIds.has(c.id)) continue;
    const v3 = getMasterCard(c.id)?.enrichment;
    if (!v3) continue;
    let est = 0;
    for (const a of result.assignments) {
      if (a.bestCard.card.id === weakest.card.card.id) {
        const catKeys = CAT_V3_MAP[a.categoryId] || ["base"];
        let rate = 0;
        for (const key of catKeys) {
          const cat = v3.categories[key];
          if (cat) { rate = cat.rate; break; }
        }
        if (rate === 0) rate = v3.baseRate;
        est += Math.round(a.monthlySpend * (rate / 100) * 12 * v3.redemption.baseValue);
      }
    }
    if (est > weakest.annualEarning) replacements.push({ card: c, estimated: est });
  }
  replacements.sort((a, b) => b.estimated - a.estimated);
  const topReplacement = replacements[0];

  return (
    <div className="p-8 rounded-3xl bg-[hsl(0,15%,8%)] dark:bg-[hsl(0,15%,8%)] bg-destructive/5 border-l-[3px] border-destructive/60 space-y-5">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h5 className="text-[12px] font-bold uppercase tracking-widest text-destructive font-label">AI Advisory Insight</h5>
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Your <span className="text-foreground font-bold">{weakest.card.card.name}</span> is currently generating{" "}
        <span className="text-destructive font-bold">{weakest.pctOfTotal}% real value</span> on assigned spends.
        {topReplacement && (
          <> Swapping this for a <span className="text-primary">{topReplacement.card.name}</span> would recoup{" "}
          {"\u20B9"}{Math.round((topReplacement.estimated - weakest.annualEarning) / 12).toLocaleString("en-IN")}/mo.</>
        )}
      </p>
      <Link
        to="/find-my-card"
        className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-widest hover:translate-x-1 transition-transform group"
      >
        Find better replacement
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

/* ── Competitive Performance ───────────────────────────────── */
function CompetitivePerformance({ result }: { result: OptimizerResult }) {
  const currentPct = result.singleBestValue > 0 ? Math.round((result.randomValue / result.totalOptimized) * 100) : 50;
  const singlePct = result.totalOptimized > 0 ? Math.round((result.singleBestValue / result.totalOptimized) * 100) : 60;

  return (
    <div className="bg-surface-1 dark:bg-[hsl(225,25%,6%)] p-10 rounded-3xl border border-border/5 dark:border-white/5 space-y-10">
      <h4 className="font-label text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Competitive Stack Performance</h4>
      <div className="space-y-12">
        {/* Current / Random */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">Random Card Usage</span>
            <span className="text-foreground/70 font-mono">{"\u20B9"}{result.randomValue.toLocaleString("en-IN")} /yr</span>
          </div>
          <div className="relative w-full h-1.5 bg-surface-2 dark:bg-[hsl(225,15%,13%)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-muted-foreground/50 rounded-full"
            />
          </div>
        </div>
        {/* Architect Recommendation */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-widest">
            <span className="text-primary">Architect Recommendation</span>
            <span className="text-primary font-mono">{"\u20B9"}{result.totalOptimized.toLocaleString("en-IN")} /yr</span>
          </div>
          <div className="relative w-full h-1.5 bg-surface-2 dark:bg-[hsl(225,15%,13%)] rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/40 to-primary rounded-full"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 bg-primary rounded-full border-2 border-background"
              style={{ boxShadow: "0 0 15px hsl(var(--gold) / 0.4)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card Summaries ────────────────────────────────────────── */
function CardSummaries({ result }: { result: OptimizerResult }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p className="font-label text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Card-Level Summary</p>
      {result.cardSummaries.map((cs) => (
        <div key={cs.card.card.id} className="bg-surface-1 dark:bg-[hsl(225,15%,9%)] rounded-xl overflow-hidden border border-border/5 dark:border-white/5">
          <button onClick={() => setExpanded(expanded === cs.card.card.id ? null : cs.card.card.id)} className="w-full flex items-center gap-3 p-4 sm:p-5 text-left">
            <div className="w-14 sm:w-16 aspect-[16/10] rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10 dark:ring-white/10 ring-border/10 shadow-md">
              <CardImage src={cs.card.card.image ?? ""} alt="" fallbackColor={cs.card.card.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{cs.card.card.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{cs.categories.length} categories &middot; {"\u20B9"}{cs.annualEarning.toLocaleString("en-IN")}/yr</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>{"\u20B9"}{cs.netValue.toLocaleString("en-IN")}</p>
              <p className="text-[9px] text-muted-foreground font-label uppercase tracking-wider">net/yr</p>
            </div>
            {expanded === cs.card.card.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {expanded === cs.card.card.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-border/10 dark:border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Used for</span><span className="font-mono">{cs.categories.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Annual earning</span><span className="font-mono">{"\u20B9"}{cs.annualEarning.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Annual fee</span><span className="font-mono">{"\u20B9"}{cs.annualFee.toLocaleString("en-IN")} {cs.feeWaived ? "\u2705 waived" : ""}</span></div>
                  <div className="flex justify-between font-semibold"><span>Net value</span><span className="text-primary font-mono">{"\u20B9"}{cs.netValue.toLocaleString("en-IN")}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── Smart Tips ────────────────────────────────────────────── */
function SmartTips({ tips }: { tips: string[] }) {
  const [open, setOpen] = useState(false);
  if (tips.length === 0) return null;
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 w-full">
        <Lightbulb className="w-3.5 h-3.5 text-primary" />
        Pro Tips ({tips.length})
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-surface-1 dark:bg-[hsl(225,15%,9%)] rounded-xl border-l-4 border-l-primary/30 p-5 space-y-3">
              {tips.slice(0, 5).map((tip, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                  <span className="text-primary shrink-0 font-bold font-mono">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function OptimizeStack() {
  const { myCardObjects } = useMyCards();
  const isMobile = useIsMobile();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(() =>
    myCardObjects.length >= 2 ? myCardObjects.slice(0, 5).map((c) => c.cardId) : []
  );
  const [spending, setSpending] = useState<FinderSpending>({
    dining: 0, groceries: 0, online: 0, travel: 0, fuel: 0, entertainment: 0,
    pharmacy: 0, telecom: 0, education: 0, utilities: 0, rent: 0, other: 0,
  });
  const [enabledPortals, setEnabledPortals] = useState<string[]>([]);
  const [result, setResult] = useState<OptimizerResult | null>(null);

  const selectedCards = useMemo(
    () => selectedCardIds.map((id) => allCards.find((c) => c.id === id)).filter(Boolean) as CreditCard[],
    [selectedCardIds]
  );

  const availablePortals = useMemo(() => {
    const bankNames = selectedCards.map((c) => c.issuer.toLowerCase());
    return PORTAL_OPTIONS.filter((p) => p.banks.some((b) => bankNames.some((bn) => bn.includes(b))));
  }, [selectedCards]);

  const toggleCard = useCallback((id: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
    setResult(null);
  }, []);

  const totalSpend = Object.values(spending).reduce((a, b) => a + b, 0);
  const canOptimize = selectedCards.length >= 2 && totalSpend >= 5000;

  const handleOptimize = () => {
    if (!canOptimize) return;
    setResult(optimizeStack(selectedCards, spending, enabledPortals));
  };

  /* ── Input Panel (sidebar on desktop, step-1 on mobile) ── */
  const inputPanel = (
    <>
      {/* Title — only in sidebar */}
      {!isMobile && (
        <div>
          <h2 className="font-serif text-3xl mb-2">Card Stack <span className="text-primary">Optimizer</span></h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">Which card to use for which spend? Get the optimal assignment to maximize your total rewards.</p>
        </div>
      )}

      <CardSelector selected={selectedCardIds} selectedCards={selectedCards} onToggle={toggleCard} maxCards={5} />
      <SpendingConfig spending={spending} onChange={(s) => { setSpending(s); setResult(null); }} />

      {availablePortals.length > 0 && (
        <div className="space-y-3">
          <span className="font-label text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Portal Bonuses</span>
          <div className="space-y-2">
            {availablePortals.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setEnabledPortals((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]);
                  setResult(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all ${
                  enabledPortals.includes(p.id) ? "border-primary/30 bg-primary/10 text-primary" : "border-border/10 dark:border-white/5 text-muted-foreground"
                }`}
              >
                <span className="font-label">I use {p.label}</span>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${enabledPortals.includes(p.id) ? "bg-primary" : "bg-secondary"}`}>
                  <motion.div
                    className="w-3 h-3 rounded-full bg-background shadow-sm absolute top-0.5"
                    animate={{ left: enabledPortals.includes(p.id) ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleOptimize}
        disabled={!canOptimize}
        className="w-full bg-primary text-primary-foreground font-label font-extrabold text-[12px] tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        OPTIMIZE MY STACK
      </button>
      {selectedCards.length < 2 && <p className="text-[10px] text-muted-foreground text-center font-label">Select at least 2 cards</p>}
      {selectedCards.length >= 2 && totalSpend < 5000 && <p className="text-[10px] text-muted-foreground text-center font-label">Add at least {"\u20B9"}5,000 monthly spending</p>}
    </>
  );

  /* ── Result Panel (matches Stitch 2-col grid) ────────────── */
  const resultPanel = result ? (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      {/* Hero */}
      <HeroResults result={result} />

      {/* Main 2-column grid: assignments (7) + stats (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <CategoryAssignments result={result} />
        </div>
        <div className="lg:col-span-5 space-y-10">
          <DistributionDonut result={result} />
          <AIAdvisory result={result} />
        </div>
      </div>

      {/* Competitive Performance (full width) */}
      <CompetitivePerformance result={result} />

      {/* Card Summaries */}
      <CardSummaries result={result} />

      {/* Smart Tips */}
      <SmartTips tips={result.tips} />

      <DeepLinkGroup>
        <DeepLinkCTA to="/find-my-card" emoji={"\uD83D\uDCF1"} title="Find a better card replacement" />
      </DeepLinkGroup>
    </motion.div>
  ) : (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <TrendingUp className="w-7 h-7 text-primary/50" />
      </div>
      <p className="text-sm text-muted-foreground mb-1 font-serif">Select your cards and spending</p>
      <p className="text-xs text-muted-foreground/60 font-label">then hit "Optimize My Stack" to see results</p>
    </div>
  );

  return (
    <PageLayout>
      <SEO fullTitle="Card Stack Optimizer | CardPerks" description="Find out which card to use for which category to maximize your total credit card rewards." path="/optimize-stack" />
      <section className={isMobile ? "py-8 min-h-screen" : "min-h-screen"}>
        <div className={isMobile ? "container mx-auto px-4" : ""}>
          {isMobile && (
            <div className="mb-6 pt-4">
              <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-4 uppercase tracking-widest font-label">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>&rsaquo;</span>
                <span className="text-foreground">Stack Optimizer</span>
              </nav>
              <h1 className="font-serif text-3xl font-bold mb-2">
                Card Stack <span className="gold-gradient">Optimizer</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg">
                Which card to use for which spend? Get the optimal assignment to maximize your total rewards.
              </p>
            </div>
          )}

          {isMobile ? (
            <MobileOptimizerLayout inputPanel={inputPanel} resultPanel={resultPanel} result={result} />
          ) : (
            <DesktopOptimizerLayout inputPanel={inputPanel} resultPanel={resultPanel} />
          )}
        </div>
      </section>
    </PageLayout>
  );
}
