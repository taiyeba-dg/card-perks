import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, X, Trophy, Plane, Building2, Clock, ArrowRight, Share2, Coins, BarChart3 } from "lucide-react";
import MobileSection from "@/components/card-detail/MobileSection";
import CardImage from "@/components/CardImage";
import { cards, type CreditCard } from "@/data/cards";
import { redemptionCalcData, type RedemptionCalcCard, type RedemptionOption, type TransferPartner } from "@/data/calc-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Constants ─── */
const QUICK_AMOUNTS = [5_000, 10_000, 25_000, 50_000, 1_00_000, 2_00_000];
const POPULAR_IDS = ["hdfc-infinia-metal", "axis-magnus", "sbi-elite", "hdfc-regalia", "amex-platinum-travel", "icici-sapphiro"];

/* ─── Helpers ─── */
function fmt(v: number) {
  if (v >= 10000000) return `\u20B9${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `\u20B9${(v / 100000).toFixed(1)}L`;
  return `\u20B9${Math.round(v).toLocaleString("en-IN")}`;
}
function fmtN(v: number) { return Math.round(v).toLocaleString("en-IN"); }

/* ─── Props ─── */
interface Props {
  selectedCard: CreditCard | null;
  pointsAmount: number;
  redemptionData: RedemptionCalcCard | null;
  sortedOptions: RedemptionOption[];
  transferPartners: TransferPartner[];
  onSelectCard: (card: CreditCard) => void;
  onPointsChange: (val: number) => void;
}

/* ─── Mobile Value Spectrum (vertical) ─── */
function MobileValueSpectrum({ options }: { options: RedemptionOption[] }) {
  if (options.length < 2) return null;
  return (
    <div className="rounded-xl bg-card border border-border/20 p-4">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Value Spectrum</p>
      <div className="space-y-0">
        {options.map((opt, i) => {
          const isFirst = i === 0;
          const isLast = i === options.length - 1;
          return (
            <div key={opt.type} className="flex items-stretch gap-3">
              {/* Vertical bar with dot */}
              <div className="flex flex-col items-center w-4 flex-shrink-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 flex-shrink-0",
                    isFirst ? "bg-green-500 border-green-400" :
                    isLast ? "bg-red-500 border-red-400" :
                    "bg-amber-500 border-amber-400",
                  )}
                />
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 min-h-[16px]"
                    style={{ background: "linear-gradient(to bottom, hsl(var(--border) / 0.4), hsl(var(--border) / 0.2))" }}
                  />
                )}
              </div>
              {/* Label + value */}
              <div className="flex-1 flex items-start justify-between pb-3">
                <span className={cn(
                  "text-xs font-medium",
                  isFirst ? "text-green-400" : "text-muted-foreground",
                )}>
                  {opt.type}
                </span>
                <span
                  className={cn("text-xs font-mono flex-shrink-0 ml-2", isFirst && "text-green-400 font-semibold")}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {"\u20B9"}{opt.value.toFixed(2)}/pt
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mobile Option Card ─── */
function MobileOptionCard({ option, points, isBest, rank, bestValue, isCashback }: {
  option: RedemptionOption; points: number; isBest: boolean;
  rank: number; bestValue: number; isCashback: boolean;
}) {
  const value = points * option.value;
  const meetsMin = !option.minPoints || points >= option.minPoints;
  const relBar = bestValue > 0 ? (option.value / bestValue) * 100 : 0;
  const label = isCashback ? "cashback" : "RP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3 }}
      className={cn(
        "glass-card rounded-xl p-4",
        !meetsMin && "opacity-40",
        isBest ? "border border-green-500/30 bg-green-500/[0.06]" : "",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{option.type}</span>
            {isBest && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5" /> Best
              </span>
            )}
            {option.recommended && !isBest && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Rec.
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            1 {label} = {"\u20B9"}{option.value.toFixed(2)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {meetsMin ? (
            <>
              <p
                className={cn("text-lg font-bold font-mono", isBest ? "text-green-400" : "text-foreground")}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(value)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                for {fmtN(points)} {isCashback ? "\u20B9" : "pts"}
              </p>
            </>
          ) : (
            <p className="text-xs text-amber-400/80">
              Min. {fmtN(option.minPoints!)} {isCashback ? "\u20B9" : "pts"}
            </p>
          )}
        </div>
      </div>

      {/* Value bar */}
      {meetsMin && (
        <div className="h-2 rounded-full bg-border/20 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", isBest ? "bg-gradient-to-r from-primary to-green-500" : "bg-muted-foreground/30")}
            initial={{ width: 0 }}
            animate={{ width: `${relBar}%` }}
            transition={{ duration: 0.5, delay: rank * 0.08 + 0.15, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Fee / note */}
      {option.fee != null && (
        <p className="text-[10px] text-muted-foreground/70 mt-2">Fee: {"\u20B9"}{option.fee}</p>
      )}
      {option.desc && (
        <p className="text-xs text-muted-foreground mt-1.5">{option.desc}</p>
      )}
    </motion.div>
  );
}

/* ─── Mobile Transfer Partner Card ─── */
function MobileTransferCard({ partner, points, delay }: {
  partner: TransferPartner; points: number; delay: number;
}) {
  const [from, to] = partner.ratio.split(":").map(Number);
  const miles = from > 0 ? Math.floor(points * to / from) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-card rounded-xl p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
        {partner.type === "airline"
          ? <Plane className="w-4 h-4 text-primary" />
          : <Building2 className="w-4 h-4 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{partner.name}</p>
        <p className="text-[10px] text-muted-foreground capitalize">
          {partner.type}{partner.program ? ` \u00B7 ${partner.program}` : ""}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-mono font-semibold text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
          {points > 0 ? fmtN(miles) : "\u2014"}
        </p>
        <p className="text-[10px] text-muted-foreground font-mono">{partner.ratio}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
export default function MobileRedemptionCalc({
  selectedCard, pointsAmount, redemptionData, sortedOptions,
  transferPartners, onSelectCard, onPointsChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  const v3 = redemptionData;
  const isCashback = v3?.rewardType === "cashback";
  const bestOption = sortedOptions[0] ?? null;
  const secondOption = sortedOptions[1] ?? null;
  const worstOption = sortedOptions.length > 1 ? sortedOptions[sortedOptions.length - 1] : null;
  const hasTransfers = !isCashback && transferPartners.length > 0;

  const insightMultiplier = bestOption && secondOption && secondOption.value > 0
    ? (bestOption.value / secondOption.value).toFixed(1)
    : null;

  /* Card search */
  const eligibleCards = useMemo(() => cards.filter(c => c.id in redemptionCalcData), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return eligibleCards.slice(0, 8);
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return eligibleCards.filter(c => {
      const hay = (c.name + " " + c.issuer).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [query, eligibleCards]);

  const popularCards = useMemo(
    () => POPULAR_IDS.map(id => cards.find(c => c.id === id && c.id in redemptionCalcData)).filter(Boolean) as CreditCard[],
    [],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { if (customOpen) customRef.current?.focus(); }, [customOpen]);

  const commitCustom = () => {
    const val = parseInt(customDraft.replace(/\D/g, ""), 10) || 0;
    onPointsChange(val);
    setCustomOpen(false);
    setCustomDraft("");
  };

  const currLabel = isCashback ? "cashback" : v3?.pointCurrency ?? "points";

  return (
    <div className="pb-28">
      {/* ── Hero ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif gold-gradient mb-1">Redemption Calculator</h1>
        <p className="text-xs text-muted-foreground">Find the best way to redeem your reward points</p>
      </div>

      {/* ── No Card: Search ── */}
      {!selectedCard && (
        <div ref={searchRef} className="relative mb-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by card or bank name..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full h-11 bg-card border border-border/40 rounded-xl pl-10 pr-10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
                    onClick={() => { onSelectCard(card); setQuery(""); setSearchOpen(false); }}
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
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popular suggestions */}
          {!searchOpen && (
            <>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-5 mb-3">Popular cards</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {popularCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => onSelectCard(card)}
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
            </>
          )}
        </div>
      )}

      {/* ── Card Selected: Header ── */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3"
        >
          <div className="w-16 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-border/20">
            <CardImage src={selectedCard.image ?? ""} alt={selectedCard.name} fallbackColor={selectedCard.color} className="rounded-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{selectedCard.name}</p>
            <p className="text-[10px] text-muted-foreground">{selectedCard.issuer} {"\u00B7"} {selectedCard.network}</p>
            {v3?.expiryText && !isCashback && (
              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" /> {v3.expiryText}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Card selected but no data */}
      {selectedCard && !v3 && (
        <div className="text-center py-10">
          <p className="text-3xl mb-3">{"\uD83C\uDFAF"}</p>
          <p className="text-sm mb-1">Limited data for <span className="font-medium">{selectedCard.name}</span></p>
          <p className="text-xs text-muted-foreground">Detailed redemption data isn't available yet.</p>
        </div>
      )}

      {/* ── Points Input ── */}
      {selectedCard && v3 && (
        <MobileSection icon={Coins} title={`Your ${currLabel}`} defaultOpen>
          {/* Best option headline */}
          {v3.bestOption && !isCashback && (
            <p className="text-xs text-foreground/80 mb-4">{"\uD83C\uDFAF"} {v3.bestOption}</p>
          )}

          {/* Large display */}
          <div className="text-center py-4">
            <p className="text-3xl font-mono font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {isCashback && "\u20B9"}{pointsAmount > 0 ? fmtN(pointsAmount) : "0"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isCashback ? "cashback balance" : currLabel}
            </p>
          </div>

          {/* Quick amounts — 3-col grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => onPointsChange(amt)}
                className={cn(
                  "h-11 rounded-xl text-xs font-medium border transition-all active:scale-[0.98]",
                  pointsAmount === amt
                    ? "border-primary bg-primary/10 text-primary"
                    : "glass-card border-border/30 text-muted-foreground",
                )}
                style={{ touchAction: "manipulation" }}
              >
                {isCashback ? `\u20B9${fmtN(amt)}` : fmtN(amt)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          {customOpen ? (
            <div className="relative">
              {isCashback && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{"\u20B9"}</span>
              )}
              <input
                ref={customRef}
                type="text"
                inputMode="numeric"
                placeholder="Enter amount..."
                value={customDraft}
                onChange={e => setCustomDraft(e.target.value)}
                onBlur={commitCustom}
                onKeyDown={e => e.key === "Enter" && commitCustom()}
                className={cn(
                  "w-full h-11 bg-card border border-primary/40 rounded-xl pr-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40",
                  isCashback ? "pl-7" : "pl-3",
                )}
              />
            </div>
          ) : (
            <button
              onClick={() => { setCustomDraft(pointsAmount > 0 ? String(pointsAmount) : ""); setCustomOpen(true); }}
              className="w-full h-11 rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground active:scale-[0.98]"
              style={{ touchAction: "manipulation" }}
            >
              Enter custom amount
            </button>
          )}
        </MobileSection>
      )}

      {/* ── Cashback Result ── */}
      {selectedCard && v3 && pointsAmount > 0 && isCashback && (
        <MobileSection icon={Trophy} title="Cashback Value" defaultOpen>
          <div className="rounded-xl border border-green-500/30 bg-green-500/[0.06] p-5 text-center mb-4">
            <p className="text-xs text-muted-foreground mb-2">Your {fmt(pointsAmount)} cashback equals</p>
            <p className="text-3xl font-bold font-mono text-green-400 mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(pointsAmount)}
            </p>
            <p className="text-xs text-muted-foreground">Direct credit to statement</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-green-400/70">
              <Trophy className="w-3 h-3" />
              <span>Full face value {"\u2014"} no deduction</span>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              to={`/cards/${selectedCard.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 active:scale-[0.98]"
              style={{ touchAction: "manipulation" }}
            >
              View Card Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </MobileSection>
      )}

      {/* ── Redemption Options ── */}
      {selectedCard && v3 && pointsAmount > 0 && !isCashback && (
        <MobileSection icon={BarChart3} title="Redemption Options" defaultOpen>
          {/* Value Spectrum */}
          <div className="mb-4">
            <MobileValueSpectrum options={sortedOptions} />
          </div>

          {/* Insight box */}
          {insightMultiplier && bestOption && secondOption && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3 mb-4"
            >
              <p className="text-xs text-foreground leading-relaxed">
                {"\uD83D\uDCA1"} <span className="text-primary font-bold font-mono">{fmt(pointsAmount * bestOption.value)}</span> via {bestOption.type} vs{" "}
                <span className="text-muted-foreground font-mono">{fmt(pointsAmount * secondOption.value)}</span> via {secondOption.type}
                {" "}{"\u2014"} <span className="text-primary font-semibold">{insightMultiplier}{"\u00D7"} more value</span>
              </p>
            </motion.div>
          )}

          {/* Option cards */}
          <div className="space-y-3">
            {sortedOptions.map((opt, i) => (
              <MobileOptionCard
                key={opt.type}
                option={opt}
                points={pointsAmount}
                isBest={i === 0}
                rank={i}
                bestValue={sortedOptions[0].value}
                isCashback={false}
              />
            ))}
          </div>

          {/* Restrictions */}
          {v3.restrictions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-3 flex items-start gap-2"
            >
              <span className="text-xs flex-shrink-0">{"\u26A0\uFE0F"}</span>
              <div className="text-[11px] text-amber-400 space-y-0.5">
                {v3.restrictions.maxRedemptionsPerMonth != null && (
                  <p>Max {v3.restrictions.maxRedemptionsPerMonth} redemptions/month</p>
                )}
                {v3.restrictions.maxPointsPerMonth != null && (
                  <p>Max {fmtN(v3.restrictions.maxPointsPerMonth)} points/month</p>
                )}
                {v3.restrictions.note && <p>{v3.restrictions.note}</p>}
              </div>
            </motion.div>
          )}

          {/* Share + CTAs */}
          <div className="mt-5 space-y-3">
            <button
              onClick={() => {
                if (!bestOption) return;
                const bestVal = fmt(pointsAmount * bestOption.value);
                let text = `Best way to redeem ${fmtN(pointsAmount)} ${currLabel}: ${bestOption.type} = ${bestVal}`;
                if (worstOption) text += ` (vs ${fmt(pointsAmount * worstOption.value)} via ${worstOption.type})`;
                text += ` \u2014 CardPerks`;
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
            <Link
              to={`/cards/${selectedCard.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 active:scale-[0.98]"
              style={{ touchAction: "manipulation" }}
            >
              View Card Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </MobileSection>
      )}

      {/* ── Transfer Partners ── */}
      {selectedCard && v3 && pointsAmount > 0 && hasTransfers && (
        <MobileSection icon={Plane} title="Transfer Partners" defaultOpen={false}>
          <div className="space-y-3">
            {transferPartners.map((partner, i) => (
              <MobileTransferCard key={partner.name} partner={partner} points={pointsAmount} delay={i * 0.06} />
            ))}
          </div>
        </MobileSection>
      )}

      {/* Empty state: points = 0 */}
      {selectedCard && v3 && pointsAmount === 0 && (
        <div className="text-center py-10">
          <span className="text-3xl block mb-3">{"\uD83C\uDFAF"}</span>
          <p className="text-sm text-muted-foreground">
            {isCashback
              ? "Enter your cashback balance above to see the redemption value"
              : "Enter your points balance above to see the best options"}
          </p>
        </div>
      )}

      {/* ── Sticky Bottom Bar ── */}
      {selectedCard && pointsAmount > 0 && bestOption && !isCashback && (
        <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-card/95 backdrop-blur-lg border-t border-border/30 px-4 py-2.5 safe-area-bottom">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Best Redemption</p>
              <p className="text-xs font-medium truncate max-w-[180px]">{bestOption.type}</p>
            </div>
            <p
              className="text-sm font-bold text-primary font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(pointsAmount * bestOption.value)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
