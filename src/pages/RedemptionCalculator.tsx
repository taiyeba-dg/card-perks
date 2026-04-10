import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, ArrowRight, Plane, Building2, Clock, Trophy, Share2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { cards, type CreditCard } from "@/data/cards";
import { redemptionCalcData, type RedemptionCalcCard, type RedemptionOption, type TransferPartner } from "@/data/calc-types";
import CardImage from "@/components/CardImage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileRedemptionCalc from "@/components/calculators/MobileRedemptionCalc";

/* ─── Constants ─── */
const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];
const POPULAR_CARD_IDS = ["hdfc-infinia-metal", "axis-magnus", "sbi-elite", "hdfc-regalia", "amex-platinum-travel", "icici-sapphiro"];

/* ─── Helpers ─── */
function fmtCurrency(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
function fmtNum(v: number): string {
  return Math.round(v).toLocaleString("en-IN");
}

/* ─── Number ticker ─── */
function useNumberTicker(target: number, dur = 300) {
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

/* ─── Value Spectrum Bar ─── */
function ValueSpectrumBar({ options }: { options: RedemptionOption[] }) {
  if (options.length < 2) return null;
  const maxVal = options[0].value;
  const minVal = options[options.length - 1].value;
  const range = maxVal - minVal;
  if (range === 0) return null;

  return (
    <div className="rounded-xl bg-card border border-border/20 p-4 mb-5">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Value Spectrum</p>
      <div className="relative">
        {/* Gradient bar */}
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #ef4444, #f59e0b, #22c55e)" }}>
          <div className="w-full h-full" />
        </div>
        {/* Labels */}
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground/50">Worst</span>
          <span className="text-[9px] text-muted-foreground/50">Best</span>
        </div>
        {/* Option markers */}
        {options.map((opt, i) => {
          const pct = range > 0 ? ((opt.value - minVal) / range) * 100 : 50;
          return (
            <motion.div
              key={opt.type}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
              className="absolute"
              style={{ left: `${pct}%`, top: "-2px" }}
            >
              <div className="relative -translate-x-1/2 flex flex-col items-center">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 shadow-sm",
                  i === 0 ? "bg-green-500 border-green-400" : i === options.length - 1 ? "bg-red-500 border-red-400" : "bg-amber-500 border-amber-400"
                )} />
                <span className={cn(
                  "text-[8px] font-medium mt-3.5 whitespace-nowrap max-w-[60px] truncate text-center",
                  i === 0 ? "text-green-400" : "text-muted-foreground/70"
                )}>
                  {opt.type.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="h-8" /> {/* Spacing for labels */}
    </div>
  );
}

/* ─── Redemption Row ─── */
function RedemptionRow({
  option,
  points,
  isBest,
  isRecommended,
  rank,
  bestValue,
  isCashback,
}: {
  option: RedemptionOption;
  points: number;
  isBest: boolean;
  isRecommended: boolean;
  rank: number;
  bestValue: number;
  isCashback: boolean;
}) {
  const value = points * option.value;
  const tickedValue = useNumberTicker(value);
  const meetsMin = !option.minPoints || points >= option.minPoints;
  const relativeBar = bestValue > 0 ? (option.value / bestValue) * 100 : 0;
  const currencyLabel = isCashback ? "cashback" : "RP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.35, ease: "easeOut" }}
      className={cn(
        "rounded-xl border p-4 transition-all",
        !meetsMin && "opacity-40",
        isBest
          ? "border-green-500/30 bg-green-500/[0.06]"
          : "border-border/20 bg-card hover:border-border/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-foreground">{option.type}</span>
            {isBest && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> BEST VALUE
              </span>
            )}
            {isRecommended && !isBest && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            1 {currencyLabel} = ₹{option.value.toFixed(2)}
          </p>
          {option.fee != null && (
            <p className="text-[10px] text-muted-foreground/70 mt-1.5">Fee: ₹{option.fee}</p>
          )}
          {/* Relative value bar */}
          {meetsMin && (
            <div className="mt-2.5 h-1.5 rounded-full bg-border/20 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", isBest ? "bg-green-500/70" : "bg-muted-foreground/30")}
                initial={{ width: 0 }}
                animate={{ width: `${relativeBar}%` }}
                transition={{ duration: 0.6, delay: rank * 0.1 + 0.2, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {meetsMin ? (
            <>
              <p className={cn("text-lg font-bold font-mono", isBest ? "text-green-400" : "text-foreground")}>
                {fmtCurrency(tickedValue)}
              </p>
              <p className="text-[10px] text-muted-foreground">for {fmtNum(points)} {isCashback ? "₹" : "pts"}</p>
            </>
          ) : (
            <p className="text-xs text-amber-400/80">
              Min. {fmtNum(option.minPoints!)} {isCashback ? "₹" : "pts"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Transfer Partner Card ─── */
function TransferPartnerCard({ partner, points }: { partner: TransferPartner; points: number }) {
  const [from, to] = partner.ratio.split(":").map(Number);
  const milesReceived = from > 0 ? Math.floor(points * to / from) : 0;
  const tickedMiles = useNumberTicker(milesReceived);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border p-4 transition-all border-border/20 bg-card hover:border-border/40"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          {partner.type === "airline" ? <Plane className="w-4 h-4 text-primary" /> : <Building2 className="w-4 h-4 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{partner.name}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{partner.type}{partner.program ? ` · ${partner.program}` : ""}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">Ratio</p>
          <p className="text-xs font-mono font-semibold text-foreground">{partner.ratio}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">You get</p>
          <p className="text-xs font-mono font-semibold text-primary">
            {points > 0 ? fmtNum(tickedMiles) : "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Empty State (no card param) ─── */
function NoCardState() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const eligibleCards = useMemo(() => cards.filter(c => c.id in redemptionCalcData), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return eligibleCards.slice(0, 8);
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return eligibleCards.filter(c => {
      const hay = (c.name + " " + c.issuer).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [query, eligibleCards]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <PageLayout>
      <SEO fullTitle="Redemption Calculator | CardPerks" description="Calculate the best way to redeem your credit card reward points." />
      <div className="container max-w-[640px] mx-auto px-4 pt-6 pb-20">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Redemption Calculator</span>
        </nav>

        <div className="text-center py-12">
          {/* Illustration */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative mx-auto">
              <span className="text-3xl">🎯</span>
            </div>
          </div>

          <h1 className="text-2xl font-serif text-foreground mb-2">Pick a card first</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            Search for your credit card below to calculate the best redemption value for your points
          </p>

          {/* Card search */}
          <div ref={ref} className="relative max-w-sm mx-auto text-left">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cards by name or bank..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                aria-label="Search credit cards"
                className="w-full bg-card border border-border/40 rounded-xl py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {query && (
                <button onClick={() => { setQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/40 scrollbar-hide"
                >
                  {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No cards match your search. Try a different bank or card name.</p>}
                  {filtered.map(card => (
                    <Link
                      key={card.id}
                      to={`/tools/redemption-calculator?card=${card.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors border-b border-border/10 last:border-0"
                    >
                      <div className="w-10 h-7 rounded-lg overflow-hidden flex-shrink-0">
                        {card.image ? <CardImage src={card.image} alt={card.name} fallbackColor={card.color} /> : <div className="w-full h-full" style={{ background: card.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{card.name}</p>
                        <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick picks */}
          <div className="mt-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Popular cards</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_CARD_IDS.map(id => {
                const c = cards.find(x => x.id === id);
                if (!c) return null;
                return (
                  <Link
                    key={id}
                    to={`/tools/redemption-calculator?card=${id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/30 hover:border-primary/40 hover:bg-primary/[0.04] transition-all"
                  >
                    <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
                      {c.image ? <CardImage src={c.image} alt={c.name} fallbackColor={c.color} /> : <div className="w-full h-full rounded" style={{ background: c.color }} />}
                    </div>
                    <span className="text-xs text-foreground font-medium">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <Link to="/cards" className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors">
              Go to Know Your Cards <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

/* ─── Cashback Simple Result ─── */
function CashbackResult({ card, v3, points }: { card: CreditCard; v3: RedemptionCalcCard; points: number }) {
  const tickedValue = useNumberTicker(points);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Your Cashback Value</p>

      <div className="rounded-2xl border border-green-500/30 bg-green-500/[0.06] p-6 text-center">
        <p className="text-xs text-muted-foreground mb-2">Your {fmtCurrency(points)} cashback equals</p>
        <p className="text-3xl font-bold font-mono text-green-400 mb-1">{fmtCurrency(tickedValue)}</p>
        <p className="text-xs text-muted-foreground">Direct credit to your statement</p>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-green-400/70">
          <Trophy className="w-3 h-3" />
          <span>Full face value — no deduction</span>
        </div>
      </div>

      {v3.options.length > 0 && (
        <div className="rounded-xl bg-card border border-border/20 p-4">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Redemption Details</p>
          <p className="text-xs text-foreground">{v3.options[0].type}</p>
        </div>
      )}

      <div className="pt-4 space-y-3">
        <Link
          to={`/cards/${card.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          View Full Card Details <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={`/tools/rewards-calculator?card=${card.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-muted/20 text-muted-foreground text-sm font-medium border border-border/20 hover:text-foreground hover:border-border/40 transition-colors"
        >
          Calculate Rewards Instead <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Share helper ─── */
function shareRedemption(cardName: string, currency: string, points: number, bestOpt: RedemptionOption, worstOpt: RedemptionOption | null) {
  const bestVal = fmtCurrency(points * bestOpt.value);
  let text = `Best way to redeem ${fmtNum(points)} ${currency}: ${bestOpt.type} = ${bestVal}`;
  if (worstOpt) {
    text += ` (vs ${fmtCurrency(points * worstOpt.value)} via ${worstOpt.type})`;
  }
  text += ` — CardPerks Redemption Calculator`;
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!", { description: text, duration: 3000 });
  }).catch(() => toast.error("Could not copy to clipboard"));
}

/* ─── Main Page ─── */
export default function RedemptionCalculator() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardId = searchParams.get("card") ?? "";

  useEffect(() => {
    console.log(`[RedemptionCalc] ${Object.keys(redemptionCalcData).length} cards loaded`);
  }, []);

  useEffect(() => {
    if (cardId && !(cardId in redemptionCalcData)) {
      console.warn(`[RedemptionCalc] No data for card: ${cardId}`);
    }
  }, [cardId]);

  const card = useMemo(() => cards.find(c => c.id === cardId), [cardId]);
  const v3 = useMemo(() => redemptionCalcData[cardId] ?? null, [cardId]);

  const [points, setPoints] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const isCashback = v3?.rewardType === "cashback";

  const handlePointsChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10) || 0;
    setInputValue(cleaned ? fmtNum(num) : "");
    setPoints(num);
  };

  const handleQuickAmount = (amount: number) => {
    setPoints(amount);
    setInputValue(fmtNum(amount));
  };

  const sortedOptions = useMemo(() => {
    if (!v3) return [];
    return [...v3.options].sort((a, b) => b.value - a.value);
  }, [v3]);

  const bestOption = sortedOptions[0];
  const secondOption = sortedOptions[1];
  const worstOption = sortedOptions.length > 1 ? sortedOptions[sortedOptions.length - 1] : null;

  const insightMultiplier = bestOption && secondOption && secondOption.value > 0
    ? (bestOption.value / secondOption.value).toFixed(1)
    : null;

  const hasTransferPartners = !isCashback && (v3?.transferPartners?.length ?? 0) > 0;

  if (isMobile) {
    return (
      <PageLayout>
        <SEO fullTitle="Redemption Calculator | CardPerks" description="Calculate the best way to redeem your credit card reward points." />
        <MobileRedemptionCalc
          selectedCard={card ?? null}
          pointsAmount={points}
          redemptionData={v3}
          sortedOptions={sortedOptions}
          transferPartners={v3?.transferPartners ?? []}
          onSelectCard={(c) => { setSearchParams({ card: c.id }); setPoints(0); setInputValue(""); }}
          onPointsChange={(val) => { setPoints(val); setInputValue(val > 0 ? fmtNum(val) : ""); }}
        />
      </PageLayout>
    );
  }

  // No card param → show search state
  if (!cardId || !card) {
    return <NoCardState />;
  }

  // Card exists but no redemption data
  if (!v3) {
    return (
      <PageLayout>
        <SEO fullTitle="Redemption Calculator | CardPerks" description="Calculate the best way to redeem your credit card reward points." />
        <div className="container max-w-[640px] mx-auto px-4 pt-6 pb-20">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Redemption Calculator</span>
          </nav>
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-sm text-foreground mb-1">Limited data available</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Detailed redemption data isn't available for <span className="font-medium text-foreground">{card.name}</span> yet. Try another card.
            </p>
            <Link to="/tools/redemption-calculator" className="inline-flex items-center gap-2 mt-6 text-sm text-primary/70 hover:text-primary transition-colors">
              Pick a different card <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const inputLabel = isCashback ? "Enter your cashback balance" : "Enter your points balance";
  const sectionTitle = `Your ${v3.pointCurrency}`;

  return (
    <PageLayout>
      <SEO
        fullTitle={`Redeem ${v3.pointCurrency} — ${card.name} | CardPerks`}
        description={`Calculate the best way to redeem your ${card.name} ${v3.pointCurrency}.`}
      />
      <div className="container max-w-[640px] mx-auto px-4 pt-6 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/cards/${card.id}`} className="hover:text-foreground transition-colors">{card.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Redemption</span>
        </nav>

        {/* Card Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-13 rounded-xl overflow-hidden shadow-lg flex-shrink-0 border border-border/20">
            {card.image ? (
              <CardImage src={card.image} alt={`${card.name} card`} fallbackColor={card.color} />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-serif text-foreground truncate">{card.name}</h1>
            <p className="text-xs text-muted-foreground">{card.issuer} • {card.network}</p>
          </div>
        </div>

        {/* Section title */}
        <div className="mb-6">
          <h2 className="text-base font-serif text-primary mt-4">{sectionTitle}</h2>
          {/* Best option headline */}
          {v3.bestOption && !isCashback && (
            <p className="text-xs text-foreground/80 mt-1.5">🎯 {v3.bestOption}</p>
          )}
          {/* Expiry badge */}
          {v3.expiryText && !isCashback && (
            <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {v3.expiryText}
            </p>
          )}
        </div>

        {/* Point/Cashback Input */}
        <div className="mb-8">
          <div className="relative">
            {isCashback && (
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/40">₹</span>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={e => handlePointsChange(e.target.value)}
              placeholder={inputLabel}
              aria-label={inputLabel}
              className={cn(
                "w-full text-center text-[28px] font-bold font-mono bg-card border-2 border-border/30 rounded-2xl py-5 px-4 text-foreground placeholder:text-muted-foreground/30 placeholder:text-lg placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all",
                isCashback && "pl-12"
              )}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4" role="group" aria-label={isCashback ? "Quick cashback amounts" : "Quick point amounts"}>
            {QUICK_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                aria-pressed={points === amount}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                  points === amount
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {isCashback ? `₹${fmtNum(amount)}` : fmtNum(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {points > 0 && isCashback && (
            <CashbackResult key="cashback" card={card} v3={v3} points={points} />
          )}

          {points > 0 && !isCashback && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Title + Share */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Best Ways to Redeem</p>
                <button
                  onClick={() => bestOption && shareRedemption(card.name, v3.pointCurrency, points, bestOption, worstOption)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-all"
                  aria-label="Share results"
                >
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>

              {/* Value Spectrum Bar */}
              <ValueSpectrumBar options={sortedOptions} />

              {/* Best option */}
              {sortedOptions.length > 0 && (
                <RedemptionRow
                  option={sortedOptions[0]}
                  points={points}
                  isBest
                  isRecommended={sortedOptions[0].recommended}
                  rank={0}
                  bestValue={sortedOptions[0].value}
                  isCashback={false}
                />
              )}

              {/* Insight box */}
              {insightMultiplier && secondOption && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl bg-primary/[0.06] border border-primary/15 p-4"
                >
                  <p className="text-xs text-foreground leading-relaxed">
                    💡 You'd get <span className="text-primary font-bold font-mono">{fmtCurrency(points * bestOption.value)}</span> via {bestOption.type} vs{" "}
                    <span className="text-muted-foreground font-mono">{fmtCurrency(points * secondOption.value)}</span> via {secondOption.type}
                    — that's <span className="text-primary font-semibold">{insightMultiplier}× more value</span>
                  </p>
                </motion.div>
              )}

              {/* Remaining options */}
              {sortedOptions.slice(1).map((opt, i) => (
                <RedemptionRow
                  key={opt.type}
                  option={opt}
                  points={points}
                  isBest={false}
                  isRecommended={opt.recommended}
                  rank={i + 1}
                  bestValue={sortedOptions[0].value}
                  isCashback={false}
                />
              ))}

              {/* Transfer Partners */}
              {hasTransferPartners && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sortedOptions.length * 0.1 }}
                  className="mt-8"
                >
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5" /> Transfer to Airlines & Hotels
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {v3.transferPartners.map(partner => (
                      <TransferPartnerCard key={partner.name} partner={partner} points={points} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Restrictions */}
              {v3.restrictions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-4 flex items-start gap-2"
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
                  <div className="text-xs text-amber-400 space-y-0.5">
                    {v3.restrictions.maxRedemptionsPerMonth != null && <p>Max {v3.restrictions.maxRedemptionsPerMonth} redemptions/month</p>}
                    {v3.restrictions.maxPointsPerMonth != null && <p>Max {fmtNum(v3.restrictions.maxPointsPerMonth)} points/month</p>}
                    {v3.restrictions.note && <p>{v3.restrictions.note}</p>}
                  </div>
                </motion.div>
              )}

              {/* Bottom CTAs */}
              <div className="pt-4 space-y-3">
                <Link
                  to={`/cards/${card.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  View Full Card Details <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={`/tools/rewards-calculator?card=${card.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-muted/20 text-muted-foreground text-sm font-medium border border-border/20 hover:text-foreground hover:border-border/40 transition-colors"
                >
                  Calculate Rewards Instead <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no points entered */}
        {points === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-sm text-muted-foreground">
              {isCashback
                ? "Enter your cashback balance above to see the redemption value"
                : "Enter your points balance above to see the best redemption options"}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
