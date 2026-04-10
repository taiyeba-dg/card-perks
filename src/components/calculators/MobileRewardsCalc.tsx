import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Crown, Ban, Wallet, BarChart3, Share2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import MobileSection from "@/components/card-detail/MobileSection";
import CardImage from "@/components/CardImage";
import { cards, type CreditCard } from "@/data/cards";
import type { RewardsCalcCard } from "@/data/calc-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isExcluded as isExcludedByRegistry } from "@/data/exclusions-registry";

/* ─── Category definitions (mirrors page) ─── */
const DEFAULT_CATS = [
  { id: "grocery", label: "Groceries", emoji: "\uD83D\uDED2", v3Key: "grocery" },
  { id: "dining", label: "Dining", emoji: "\uD83C\uDF7D\uFE0F", v3Key: "dining" },
  { id: "fuel", label: "Fuel", emoji: "\u26FD", v3Key: "fuel" },
  { id: "online", label: "Online Shopping", emoji: "\uD83D\uDECD\uFE0F", v3Key: "online" },
  { id: "travel", label: "Travel", emoji: "\u2708\uFE0F", v3Key: "travel" },
  { id: "utilities", label: "Utilities", emoji: "\uD83D\uDCA1", v3Key: "utilities" },
];
const EXTRA_CATS = [
  { id: "rent", label: "Rent", emoji: "\uD83C\uDFE0", v3Key: "base" },
  { id: "insurance", label: "Insurance", emoji: "\uD83D\uDEE1\uFE0F", v3Key: "base" },
  { id: "education", label: "Education", emoji: "\uD83C\uDF93", v3Key: "base" },
  { id: "entertainment", label: "Entertainment", emoji: "\uD83C\uDFAC", v3Key: "entertainment" },
  { id: "medical", label: "Medical", emoji: "\uD83C\uDFE5", v3Key: "base" },
];
const ALL_CATS = [...DEFAULT_CATS, ...EXTRA_CATS];
const MAX_SLIDER = 100000;
const MAX_CARDS = 3;

const POPULAR_IDS = [
  "hdfc-infinia-metal", "axis-magnus", "sbi-elite",
  "hdfc-regalia", "amex-platinum-travel", "icici-sapphiro",
];

import { QUICK_PRESETS } from "@/data/spending-presets";

const PRESETS = QUICK_PRESETS;

const DEVAL_WARNINGS: Record<string, string> = {
  "hdfc-infinia-metal": "SmartBuy 10X rates reduced Jan 2026",
  "hdfc-diners-black": "SmartBuy 10X rates reduced Jan 2026",
};

/* ─── Helpers ─── */
function fmt(v: number) {
  if (v >= 10000000) return `\u20B9${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `\u20B9${(v / 100000).toFixed(1)}L`;
  return `\u20B9${Math.round(v).toLocaleString("en-IN")}`;
}

/* ─── Calculation engine (mirrors page) ─── */
interface CatEarning {
  spend: number; rate: number; monthlyValue: number; annualValue: number;
  excluded: boolean; capped: boolean; capDetail?: string;
  portalBonus?: { name: string; rate: number };
}
interface CalcResult {
  earnings: Record<string, CatEarning>;
  totalMonthlyValue: number; totalAnnualValue: number;
  totalMonthlyPoints: number; totalAnnualPoints: number;
  pointCurrency: string; cappedCats: string[];
}

function calcRewards(v3: RewardsCalcCard, spending: Record<string, number>, cardId?: string): CalcResult {
  const earnings: Record<string, CatEarning> = {};
  let totalMV = 0, totalMP = 0;
  const cappedCats: string[] = [];

  for (const cat of ALL_CATS) {
    const ms = spending[cat.id] || 0;
    if (ms === 0) { earnings[cat.id] = { spend: 0, rate: 0, monthlyValue: 0, annualValue: 0, excluded: false, capped: false }; continue; }
    const cd = v3.categories?.[cat.v3Key] ?? v3.categories?.base;
    if (!cd) { earnings[cat.id] = { spend: ms, rate: 0, monthlyValue: 0, annualValue: 0, excluded: false, capped: false }; continue; }
    const excluded = cardId ? isExcludedByRegistry(cardId, cat.v3Key) : (v3.exclusions ?? []).some(
      ex => ex.toLowerCase() === cat.v3Key.toLowerCase() ||
            ex.toLowerCase() === cat.label.toLowerCase() ||
            (cat.v3Key === "fuel" && ex.toLowerCase().includes("fuel"))
    );
    if (excluded || cd.rate === 0) { earnings[cat.id] = { spend: ms, rate: 0, monthlyValue: 0, annualValue: 0, excluded: true, capped: false }; continue; }
    const er = cd.rate / 100;
    let mv = ms * er, capped = false, capDetail: string | undefined;
    if (cd.cap && cd.capPeriod === "Monthly") {
      const br = (v3.categories.base?.rate ?? v3.baseRate) / 100;
      if (ms * er > cd.cap * v3.pointValue) {
        const cs = cd.cap * v3.pointValue / er;
        mv = cs * er + (ms - cs) * br;
        capped = true;
        capDetail = `Cap: ${fmt(cd.cap)} RP/mo on ${cat.label}`;
        cappedCats.push(capDetail);
      }
    }
    let portalBonus: CatEarning["portalBonus"];
    for (const portal of v3.portals ?? []) {
      if (portal.merchants.length > 0 && ["travel", "online", "dining"].includes(cat.v3Key)) {
        const apr = portal.merchants[0].effectiveRate / 100;
        if (apr > er) portalBonus = { name: portal.name, rate: apr * 100 };
        break;
      }
    }
    earnings[cat.id] = { spend: ms, rate: cd.rate, monthlyValue: Math.round(mv), annualValue: Math.round(mv * 12), excluded: false, capped, capDetail, portalBonus };
    totalMV += mv;
    totalMP += mv / v3.pointValue;
  }

  return {
    earnings, totalMonthlyValue: Math.round(totalMV), totalAnnualValue: Math.round(totalMV * 12),
    totalMonthlyPoints: Math.round(totalMP), totalAnnualPoints: Math.round(totalMP * 12),
    pointCurrency: v3.rewardName, cappedCats,
  };
}

/* ─── Props ─── */
interface Props {
  selectedCards: CreditCard[];
  spending: Record<string, number>;
  totalMonthly: number;
  activePreset: string;
  showExtra: boolean;
  isCompareMode: boolean;
  isLoading: boolean;
  onAddCard: (card: CreditCard) => void;
  onRemoveCard: (id: string) => void;
  onCatChange: (catId: string, val: number) => void;
  onPreset: (p: { id: string; label: string; values: Record<string, number> }) => void;
  onToggleExtra: () => void;
  onReset: () => void;
  rewardsCalcData: Record<string, RewardsCalcCard>;
}

/* ─── Spending Row ─── */
function SpendRow({ cat, value, onChange, delay }: {
  cat: typeof ALL_CATS[0]; value: number; onChange: (v: number) => void; delay: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const startEdit = () => { setDraft(value === 0 ? "" : String(value)); setEditing(true); };
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { onChange(parseInt(draft.replace(/\D/g, ""), 10) || 0); setEditing(false); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="py-3 border-b border-border/10 last:border-0"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm flex items-center gap-2">
          <span>{cat.emoji}</span>
          <span className="font-medium">{cat.label}</span>
        </span>
        {editing ? (
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{"\u20B9"}</span>
            <input
              ref={ref}
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === "Enter" && commit()}
              className="w-28 text-right text-sm font-mono bg-card border border-primary/40 rounded-xl pl-6 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="text-sm font-mono text-foreground px-3 py-1.5 rounded-xl bg-secondary/20 active:scale-[0.98] transition-transform"
            style={{ touchAction: "manipulation" }}
          >
            {fmt(value)}
          </button>
        )}
      </div>
      <Slider
        value={[Math.min(value, MAX_SLIDER)]}
        onValueChange={([v]) => onChange(v)}
        max={MAX_SLIDER}
        step={500}
        className="[&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:touch-manipulation [&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary"
      />
    </motion.div>
  );
}

/* ─── Single Card Result ─── */
function SingleResult({ card, v3, spending }: {
  card: CreditCard; v3: RewardsCalcCard; spending: Record<string, number>;
}) {
  const result = useMemo(() => calcRewards(v3, spending, card.id), [v3, spending, card.id]);
  const { earnings, cappedCats, pointCurrency } = result;
  const activeCats = ALL_CATS.filter(c => (spending[c.id] || 0) > 0);
  const maxVal = Math.max(1, ...activeCats.map(c => earnings[c.id]?.annualValue ?? 0));
  const portalBonuses = activeCats.filter(c => earnings[c.id]?.portalBonus).map(c => ({ cat: c, portal: earnings[c.id].portalBonus! }));
  const excludedCats = activeCats.filter(c => earnings[c.id]?.excluded);
  const warn = DEVAL_WARNINGS[card.id];
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="space-y-5">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-9 rounded-lg overflow-hidden shadow-md flex-shrink-0">
          <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} className="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{card.name}</p>
          <p className="text-[10px] text-muted-foreground">{card.issuer} {"\u00B7"} {card.fee}/yr</p>
        </div>
      </div>

      {warn && (
        <div className="rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-3 flex items-start gap-2">
          <span className="text-xs flex-shrink-0">{"\u26A0\uFE0F"}</span>
          <p className="text-[11px] text-amber-400">{warn}</p>
        </div>
      )}

      {/* Hero stat */}
      <div className="text-center py-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Monthly Rewards</p>
        <p className="text-3xl font-mono font-bold text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(result.totalMonthlyValue)}
        </p>
        <p className="text-lg font-mono text-foreground mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(result.totalAnnualValue)}<span className="text-xs text-muted-foreground">/year</span>
        </p>
      </div>

      {/* Category breakdown */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Category Breakdown</p>
        {activeCats.map((cat, i) => {
          const earn = earnings[cat.id];
          if (!earn) return null;
          const barW = earn.excluded ? 0 : Math.max(3, (earn.annualValue / maxVal) * 100);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="py-2.5 border-b border-border/10 last:border-0"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs flex items-center gap-1.5">
                  <span>{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                {earn.excluded ? (
                  <span className="text-[10px] text-destructive/70 font-medium flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Excluded
                  </span>
                ) : (
                  <span className="text-xs font-mono font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {fmt(earn.annualValue)} <span className="text-[9px] text-muted-foreground font-normal">({earn.rate}%)</span>
                  </span>
                )}
              </div>
              {!earn.excluded && (
                <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${barW}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Portal bonuses */}
      {portalBonuses.length > 0 && (
        <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3 space-y-1.5">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{"\uD83D\uDE80"} Portal Bonuses</p>
          {portalBonuses.map(({ cat, portal }) => (
            <div key={cat.id} className="flex items-center justify-between text-xs">
              <span>{cat.label} via <span className="text-primary font-medium">{portal.name}</span></span>
              <span className="text-primary font-mono font-semibold">{portal.rate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary grid */}
      <div className="rounded-xl bg-card border border-border/20 p-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Monthly {pointCurrency}</p>
          <p className="text-sm font-bold font-mono">{result.totalMonthlyPoints.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Monthly Value</p>
          <p className="text-sm font-bold font-mono">{fmt(result.totalMonthlyValue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Annual {pointCurrency}</p>
          <p className="text-sm font-bold font-mono">{result.totalAnnualPoints.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Annual Value</p>
          <p className="text-base font-bold text-primary font-mono">{fmt(result.totalAnnualValue)}</p>
        </div>
      </div>

      {/* Exclusions & caps */}
      {(excludedCats.length > 0 || cappedCats.length > 0) && (
        <div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground active:scale-[0.98]"
            style={{ touchAction: "manipulation" }}
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", showNotes && "rotate-180")} />
            Exclusions & Caps
          </button>
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 p-3">
                  {excludedCats.map(c => (
                    <p key={c.id} className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Ban className="w-3 h-3 flex-shrink-0" />{c.label}: excluded from rewards
                    </p>
                  ))}
                  {cappedCats.map((d, i) => (
                    <p key={i} className="text-[11px] text-amber-400">{d}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Share */}
      <button
        onClick={() => {
          const text = `My rewards with ${card.name}: ${fmt(result.totalAnnualValue)}/year \u2014 via CardPerks`;
          navigator.clipboard.writeText(text).then(
            () => toast.success("Copied to clipboard!"),
            () => toast.error("Could not copy"),
          );
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/30 text-xs text-muted-foreground active:scale-[0.98]"
        style={{ touchAction: "manipulation" }}
      >
        <Share2 className="w-3.5 h-3.5" /> Share Results
      </button>
    </div>
  );
}

/* ─── Compare Results (vertical stacked) ─── */
function CompareResult({ selectedCards, calcData, spending }: {
  selectedCards: CreditCard[];
  calcData: Record<string, RewardsCalcCard>;
  spending: Record<string, number>;
}) {
  const results = useMemo(() =>
    selectedCards.map(card => {
      const v3 = calcData[card.id];
      return v3 ? { card, v3, result: calcRewards(v3, spending, card.id) } : null;
    }).filter(Boolean) as { card: CreditCard; v3: RewardsCalcCard; result: CalcResult }[],
    [selectedCards, calcData, spending],
  );

  const winnerId = useMemo(() => {
    if (results.length < 2) return null;
    let best = results[0];
    for (const r of results) if (r.result.totalAnnualValue > best.result.totalAnnualValue) best = r;
    return results.every(r => r.result.totalAnnualValue === best.result.totalAnnualValue) ? null : best.card.id;
  }, [results]);

  const activeCats = ALL_CATS.filter(c => (spending[c.id] || 0) > 0);
  const catWinners = useMemo(() => {
    const w: Record<string, string | null> = {};
    for (const cat of activeCats) {
      let bestId: string | null = null, bestVal = -1, allSame = true, first: number | null = null;
      for (const r of results) {
        const v = r.result.earnings[cat.id]?.excluded ? 0 : (r.result.earnings[cat.id]?.annualValue ?? 0);
        if (first === null) first = v; else if (v !== first) allSame = false;
        if (v > bestVal) { bestVal = v; bestId = r.card.id; }
      }
      w[cat.id] = allSame || bestVal === 0 ? null : bestId;
    }
    return w;
  }, [results, activeCats]);

  if (results.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Stacked card summaries */}
      {results.map(({ card, result }, i) => {
        const isWinner = winnerId === card.id;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className={cn(
              "rounded-xl p-4 border",
              isWinner ? "bg-primary/10 border-primary/20" : "bg-card border-border/20",
            )}
          >
            {isWinner && (
              <div className="flex items-center gap-1.5 mb-2">
                <Crown className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Winner</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} className="rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{card.name}</p>
                <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={cn("text-lg font-bold font-mono", isWinner ? "text-primary" : "text-foreground")}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {fmt(result.totalAnnualValue)}
                </p>
                <p className="text-[9px] text-muted-foreground">/year</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/10">
              <span className="text-[10px] text-muted-foreground">
                Monthly: <span className="font-mono font-medium text-foreground">{fmt(result.totalMonthlyValue)}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {result.pointCurrency}: <span className="font-mono font-medium text-foreground">{result.totalAnnualPoints.toLocaleString("en-IN")}/yr</span>
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Category comparison */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Category Comparison</p>
        {activeCats.map((cat, ci) => {
          const catMax = Math.max(1, ...results.map(r => r.result.earnings[cat.id]?.annualValue ?? 0));
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.04, duration: 0.3 }}
              className="py-3 border-b border-border/10 last:border-0"
            >
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <span>{cat.emoji}</span> {cat.label}
              </p>
              <div className="space-y-1.5">
                {results.map(({ card, result: r }) => {
                  const earn = r.earnings[cat.id];
                  const isW = catWinners[cat.id] === card.id;
                  if (!earn) return null;
                  return (
                    <div key={card.id} className={cn("flex items-center gap-2 px-2 py-1 rounded-lg", isW && "bg-green-500/[0.06]")}>
                      <span className="text-[10px] text-muted-foreground truncate w-16 flex-shrink-0">
                        {card.name.split(" ").slice(-1)[0]}
                      </span>
                      {earn.excluded ? (
                        <span className="text-[10px] text-destructive/70 flex items-center gap-1">
                          <Ban className="w-2.5 h-2.5" /> Excluded
                        </span>
                      ) : (
                        <>
                          <div className="flex-1 h-1.5 rounded-full bg-border/20 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.max(3, (earn.annualValue / catMax) * 100)}%` }}
                            />
                          </div>
                          <span
                            className={cn("text-[11px] font-mono flex-shrink-0", isW ? "text-green-400 font-semibold" : "text-foreground")}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {isW && "\u2713 "}{fmt(earn.annualValue)}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
export default function MobileRewardsCalc({
  selectedCards, spending, totalMonthly, activePreset, showExtra,
  isCompareMode, isLoading, onAddCard, onRemoveCard, onCatChange,
  onPreset, onToggleExtra, onReset, rewardsCalcData: calcData,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const eligibleCards = useMemo(() => cards.filter(c => c.id in calcData), [calcData]);

  const filtered = useMemo(() => {
    const selIds = new Set(selectedCards.map(c => c.id));
    if (!query.trim()) return eligibleCards.filter(c => !selIds.has(c.id)).slice(0, 8);
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return eligibleCards.filter(c => {
      if (selIds.has(c.id)) return false;
      const hay = (c.name + " " + c.issuer).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [query, eligibleCards, selectedCards]);

  const popularCards = useMemo(
    () => POPULAR_IDS.map(id => cards.find(c => c.id === id && c.id in calcData)).filter(Boolean) as CreditCard[],
    [calcData],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const singleCard = selectedCards.length === 1 ? selectedCards[0] : null;
  const singleV3 = singleCard ? calcData[singleCard.id] ?? null : null;

  return (
    <div className="sm:hidden pb-24">
      {/* ── Hero ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif gold-gradient mb-1">Rewards Calculator</h1>
        <p className="text-xs text-muted-foreground">
          {isCompareMode
            ? `Comparing ${selectedCards.length} cards \u2014 adjust spending to see which earns more`
            : "Enter your spending to see reward breakdown"}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] text-muted-foreground">Total:</span>
          <span className="text-xs font-mono font-bold text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(totalMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">/mo</span>
        </div>
      </div>

      {/* ── Card Selector ── */}
      <div ref={searchRef} className="relative mb-5">
        {selectedCards.length < MAX_CARDS && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={selectedCards.length === 0 ? "Search for a card..." : "Add another card..."}
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full h-11 bg-card border border-border/40 rounded-xl pl-10 pr-10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/40 scrollbar-hide"
            >
              {filtered.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No matching cards</p>
              )}
              {filtered.map(card => (
                <button
                  key={card.id}
                  onClick={() => { onAddCard(card); setQuery(""); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/20 border-b border-border/10 last:border-0 active:scale-[0.98]"
                  style={{ touchAction: "manipulation" }}
                >
                  <div className="w-10 h-6 rounded-lg overflow-hidden flex-shrink-0">
                    <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
                  </div>
                  <span className="text-[10px] text-primary font-mono flex-shrink-0">
                    {calcData[card.id]?.baseRate ?? "\u2014"}%
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected chips */}
        {selectedCards.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCards.map(card => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-full bg-card border border-primary/20"
              >
                <div className="w-7 h-5 rounded overflow-hidden flex-shrink-0">
                  <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} />
                </div>
                <span className="text-xs font-medium truncate max-w-[80px]">{card.name}</span>
                <button
                  onClick={() => onRemoveCard(card.id)}
                  className="ml-0.5 p-1 rounded-full text-muted-foreground active:scale-[0.98]"
                  style={{ touchAction: "manipulation" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Popular suggestions */}
        {selectedCards.length === 0 && !searchOpen && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {popularCards.map(card => (
              <button
                key={card.id}
                onClick={() => onAddCard(card)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border/30 flex-shrink-0 active:scale-[0.98]"
                style={{ touchAction: "manipulation" }}
              >
                <div className="w-6 h-4 rounded overflow-hidden flex-shrink-0">
                  <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} />
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap">{card.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Spending ── */}
      <MobileSection icon={Wallet} title="Monthly Spending" defaultOpen>
        {/* Presets */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => onPreset(p)}
              className={cn(
                "h-11 px-4 rounded-xl text-xs font-medium border flex-shrink-0 transition-all active:scale-[0.98]",
                activePreset === p.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground",
              )}
              style={{ touchAction: "manipulation" }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Default categories */}
        {DEFAULT_CATS.map((cat, i) => (
          <SpendRow key={cat.id} cat={cat} value={spending[cat.id] || 0} onChange={v => onCatChange(cat.id, v)} delay={i * 0.04} />
        ))}

        {/* Toggle extra */}
        <button
          onClick={onToggleExtra}
          className="flex items-center gap-1.5 text-xs text-primary/70 mt-3 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform", showExtra && "rotate-180")} />
          {showExtra ? "Show fewer categories" : "Add more categories"}
        </button>

        {/* Extra categories */}
        <AnimatePresence>
          {showExtra && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {EXTRA_CATS.map((cat, i) => (
                <SpendRow key={cat.id} cat={cat} value={spending[cat.id] || 0} onChange={v => onCatChange(cat.id, v)} delay={i * 0.04} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </MobileSection>

      {/* ── Results ── */}
      <MobileSection icon={BarChart3} title="Results" defaultOpen>
        {selectedCards.length === 0 && (
          <div className="text-center py-8">
            <span className="text-3xl mb-3 block">{"\uD83D\uDCB3"}</span>
            <p className="text-sm font-serif">Select a card above</p>
            <p className="text-xs text-muted-foreground mt-1">to see your rewards breakdown</p>
          </div>
        )}

        {isLoading && selectedCards.length > 0 && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-6 rounded bg-muted/30" />
                <div className="flex-1 h-3 bg-muted/20 rounded" />
                <div className="w-16 h-3 bg-muted/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && singleCard && singleV3 && (
          <SingleResult card={singleCard} v3={singleV3} spending={spending} />
        )}

        {!isLoading && singleCard && !singleV3 && (
          <div className="text-center py-6">
            <p className="text-sm">Limited data for <span className="font-medium">{singleCard.name}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Try another card</p>
          </div>
        )}

        {!isLoading && isCompareMode && (
          <CompareResult selectedCards={selectedCards} calcData={calcData} spending={spending} />
        )}
      </MobileSection>
    </div>
  );
}
