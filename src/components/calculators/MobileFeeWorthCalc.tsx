import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, X, Check, ChevronDown, Wallet, TrendingUp, TrendingDown,
  Plane, Trophy, Gift, Sparkles, Star, ArrowRight, Lightbulb, Crown,
  CreditCard, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ReferenceLine, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MobileSection from "@/components/card-detail/MobileSection";
import CardImage from "@/components/CardImage";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { feeworthCalcData, type FeeWorthCalcCard } from "@/data/calc-types";
import { formatCur } from "@/lib/fee-utils";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { cn } from "@/lib/utils";
import { PRIMARY_CATEGORIES as PRIMARY_CAT_IDS, getCategoryEmoji, getCategoryName } from "@/data/category-config";
import { getCardPerVisitValues } from "@/data/lounge-programs";
import { QUICK_PRESETS } from "@/data/spending-presets";

/* ═══════════════════════════════════════════════
   Constants (mirror page)
   ═══════════════════════════════════════════════ */

const SPEND_CATEGORIES = PRIMARY_CAT_IDS.map(cat => ({
  id: cat.id,
  label: getCategoryName(cat.id),
  emoji: getCategoryEmoji(cat.id),
}));

const GOLF_VALUE_PER_GAME = 2000;
const DINING_FLAT_VALUE = 3000;
const MEMBERSHIP_FLAT_VALUE = 5000;
const MAX_SLIDER = 100000;

const PRESETS = QUICK_PRESETS;

const POPULAR_IDS = ["hdfc-infinia-metal", "axis-magnus", "sbi-elite", "hdfc-regalia", "amex-platinum-travel", "icici-sapphiro"];
const CHART_STEPS = Array.from({ length: 21 }, (_, i) => i * 10000);

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function fmt(v: number) {
  if (v >= 10000000) return `\u20B9${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `\u20B9${(v / 100000).toFixed(1)}L`;
  return `\u20B9${Math.round(v).toLocaleString("en-IN")}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ═══════════════════════════════════════════════
   Types (mirror page)
   ═══════════════════════════════════════════════ */

interface DetectedPerks {
  hasLounge: boolean; domesticLoungeVisits: number; intlLoungeVisits: number;
  hasPortal: boolean; hasGolf: boolean; golfText: string | null;
  hasDining: boolean; hasMemberships: boolean;
  portalName: string; bestPortalRate: number; membershipTotalValue: number;
}

interface PerkState {
  loungeEnabled: boolean; loungeVisits: number;
  portalEnabled: boolean; monthlyPortalSpend: number;
  golfEnabled: boolean; golfGames: number;
  diningEnabled: boolean; membershipEnabled: boolean;
}

const DEFAULT_PERKS: PerkState = {
  loungeEnabled: false, loungeVisits: 8,
  portalEnabled: false, monthlyPortalSpend: 5000,
  golfEnabled: false, golfGames: 4,
  diningEnabled: false, membershipEnabled: false,
};

type YearMode = "first-year" | "ongoing";
type SpendMap = Record<string, number>;

interface FeeResult {
  annualSpend: number; rewardEarnings: number; portalBonus: number;
  loungeValue: number; golfValue: number; diningValue: number;
  membershipValue: number; milestoneValue: number;
  milestoneDetails: { spend: number; benefit: string; value: number; unlocked: boolean }[];
  renewalBenefit: number; feeWaived: boolean; feeWaiverSavings: number;
  effectiveFee: number; totalValue: number; totalCost: number;
  netValue: number; roi: number; verdict: "worth" | "not-worth" | "break-even";
  breakEvenExtraMonthly: number; tips: string[];
  joiningFee: number; joiningBonus: number; waivedOnAnnualSpend: number | null;
}

interface CardData {
  v3Card: CardV3 | undefined;
  v3Data: FeeWorthCalcCard | undefined;
  detected: DetectedPerks;
  hasV3: boolean;
}

/* ═══════════════════════════════════════════════
   Fee analysis engine (mirror page)
   ═══════════════════════════════════════════════ */

function calcFeeWorth(
  cardId: string, v3Card: CardV3 | undefined, fwData: FeeWorthCalcCard | undefined,
  spending: SpendMap, perks: PerkState, detectedPerks: DetectedPerks, yearMode: YearMode = "ongoing",
): FeeResult | null {
  const annualFee = fwData?.annualFee ?? v3Card?.fees?.annual ?? null;
  if (annualFee === null) return null;
  const joiningFee = fwData?.joiningFee ?? v3Card?.fees?.joining ?? annualFee;
  let joiningBonus = 0;
  const jbStr = fwData?.joiningBonus ?? v3Card?.rewards?.joiningBonus;
  if (jbStr && typeof jbStr === "string") {
    const m = jbStr.match(/(?:worth|value)[^0-9]*([0-9,]+)/i) ?? jbStr.match(/([0-9,]+)/);
    if (m) joiningBonus = parseInt(m[1].replace(/,/g, ""), 10) || 0;
  }
  const baseRate = fwData?.baseRate ?? v3Card?.rewards?.baseRate ?? 0;
  const redemptionValue = fwData?.pointValue ?? v3Card?.rewards?.redemption?.baseValue ?? 1;
  const monthlyTotal = Object.values(spending).reduce((s, v) => s + v, 0);
  const annualSpend = monthlyTotal * 12;
  const rewardEarnings = Math.round(annualSpend * (baseRate / 100) * redemptionValue);
  let portalBonus = 0;
  if (perks.portalEnabled && detectedPerks.hasPortal && detectedPerks.bestPortalRate > 0) {
    const pAnn = perks.monthlyPortalSpend * 12;
    const pe = pAnn * (detectedPerks.bestPortalRate / 100) * redemptionValue;
    const bp = pAnn * (baseRate / 100) * redemptionValue;
    portalBonus = Math.max(0, Math.round(pe - bp));
  }
  const domV = perks.loungeEnabled ? Math.min(perks.loungeVisits, detectedPerks.domesticLoungeVisits || perks.loungeVisits) : 0;
  const intlV = perks.loungeEnabled ? detectedPerks.intlLoungeVisits : 0;
  const loungePerVisit = getCardPerVisitValues(cardId);
  const loungeValue = domV * loungePerVisit.domestic + intlV * loungePerVisit.international;
  const golfValue = perks.golfEnabled ? perks.golfGames * GOLF_VALUE_PER_GAME : 0;
  const diningValue = perks.diningEnabled ? DINING_FLAT_VALUE : 0;
  let membershipValue = 0;
  if (perks.membershipEnabled) membershipValue = detectedPerks.membershipTotalValue > 0 ? detectedPerks.membershipTotalValue : MEMBERSHIP_FLAT_VALUE;
  let milestoneValue = 0;
  const milestoneDetails: FeeResult["milestoneDetails"] = [];
  const milestones = fwData?.milestones ?? v3Card?.features?.milestones ?? [];
  for (const ms of milestones) {
    const sp = ms.spend ?? 0;
    const bv = (ms as any).value ?? (ms as any).benefitValue ?? 0;
    const unlocked = sp > 0 && annualSpend >= sp;
    if (unlocked && bv > 0) milestoneValue += bv;
    if (sp > 0) milestoneDetails.push({ spend: sp, benefit: ms.benefit, value: bv, unlocked });
  }
  const renewalBenefit = fwData?.renewalBenefitValue ?? v3Card?.fees?.renewalBenefitValue ?? 0;
  const waivedOn = fwData?.feeWaivedOn ?? v3Card?.fees?.waivedOn ?? null;
  const feeWaived = waivedOn != null && annualSpend >= waivedOn;
  const baseFee = yearMode === "first-year" ? joiningFee : annualFee;
  const feeWaiverSavings = feeWaived ? baseFee : 0;
  const effectiveFee = (feeWaived ? 0 : baseFee) - renewalBenefit - milestoneValue - loungeValue - membershipValue;
  const yearModeBonus = yearMode === "first-year" ? joiningBonus : 0;
  const totalValue = rewardEarnings + portalBonus + loungeValue + golfValue + diningValue + membershipValue + milestoneValue + renewalBenefit + feeWaiverSavings + yearModeBonus;
  const totalCost = baseFee;
  const netValue = totalValue - totalCost;
  const roi = totalCost > 0 ? totalValue / totalCost : 0;
  let verdict: FeeResult["verdict"];
  if (netValue > 500) verdict = "worth";
  else if (netValue < -500) verdict = "not-worth";
  else verdict = "break-even";
  let breakEvenExtraMonthly = 0;
  if (netValue < 0 && baseRate > 0) {
    const ern = (baseRate / 100) * redemptionValue;
    breakEvenExtraMonthly = ern > 0 ? Math.round(Math.abs(netValue) / (ern * 12)) : 0;
  }
  const tips: string[] = [];
  if (!perks.portalEnabled && detectedPerks.hasPortal) tips.push(`Use ${detectedPerks.portalName} for up to ${detectedPerks.bestPortalRate.toFixed(1)}% value`);
  const nextMs = milestoneDetails.find(ms2 => !ms2.unlocked && ms2.value > 0);
  if (nextMs) { const gap = nextMs.spend - annualSpend; if (gap > 0) tips.push(`Spend ${formatCur(gap)} more/yr to unlock: ${nextMs.benefit}`); }
  if (waivedOn != null && !feeWaived) tips.push(`Spend ${formatCur(waivedOn)}/yr to get fee waived`);
  if (!perks.loungeEnabled && detectedPerks.hasLounge) tips.push("Enable lounge perk above to account for lounge visit value");
  return {
    annualSpend, rewardEarnings, portalBonus, loungeValue, golfValue, diningValue,
    membershipValue, milestoneValue, milestoneDetails, renewalBenefit, feeWaived,
    feeWaiverSavings, effectiveFee, totalValue, totalCost, netValue, roi, verdict,
    breakEvenExtraMonthly, tips, joiningFee, joiningBonus: yearModeBonus, waivedOnAnnualSpend: waivedOn,
  };
}

/* ═══════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════ */

interface Props {
  selectedCards: CardType[];
  spending: Record<string, number>;
  totalMonthly: number;
  activePreset: string;
  perksMap: Record<string, PerkState>;
  cardDataMap: Map<string, CardData>;
  resultsMap: Map<string, FeeResult>;
  yearMode: YearMode;
  onAddCard: (card: CardType) => void;
  onRemoveCard: (id: string) => void;
  onCatChange: (catId: string, val: number) => void;
  onPreset: (p: { id: string; label: string; values: Record<string, number> }) => void;
  onPerksChange: (cardId: string, partial: Partial<PerkState>) => void;
  onYearModeToggle: () => void;
}

/* ─── Mobile Number Stepper (44px buttons) ─── */
function MobileStepper({ value, onChange, min = 0, max = 99, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <div className="flex items-center">
        <button
          onClick={() => onChange(clamp(value - 1, min, max))}
          disabled={value <= min}
          className="w-11 h-11 rounded-l-xl bg-card border border-border/40 text-foreground text-base font-medium flex items-center justify-center active:scale-[0.98] disabled:opacity-30"
          style={{ touchAction: "manipulation" }}
        >-</button>
        <span className="w-12 h-11 bg-card border-y border-border/40 text-sm text-foreground font-mono flex items-center justify-center">
          {value}
        </span>
        <button
          onClick={() => onChange(clamp(value + 1, min, max))}
          disabled={value >= max}
          className="w-11 h-11 rounded-r-xl bg-card border border-border/40 text-foreground text-base font-medium flex items-center justify-center active:scale-[0.98] disabled:opacity-30"
          style={{ touchAction: "manipulation" }}
        >+</button>
      </div>
    </div>
  );
}

/* ─── Mobile Spend Row ─── */
function MobileSpendRow({ cat, value, onChange, delay }: {
  cat: typeof SPEND_CATEGORIES[0]; value: number; onChange: (v: number) => void; delay: number;
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
          <span>{cat.emoji}</span><span className="font-medium">{cat.label}</span>
        </span>
        {editing ? (
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{"\u20B9"}</span>
            <input ref={ref} type="text" inputMode="numeric" value={draft}
              onChange={e => setDraft(e.target.value)} onBlur={commit}
              onKeyDown={e => e.key === "Enter" && commit()}
              className="w-28 text-right text-sm font-mono bg-card border border-primary/40 rounded-xl pl-6 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        ) : (
          <button onClick={startEdit}
            className="text-sm font-mono text-foreground px-3 py-1.5 rounded-xl bg-secondary/20 active:scale-[0.98]"
            style={{ touchAction: "manipulation" }}>{fmt(value)}</button>
        )}
      </div>
      <Slider value={[Math.min(value, MAX_SLIDER)]} onValueChange={([v]) => onChange(v)}
        max={MAX_SLIDER} step={1000}
        className="[&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:touch-manipulation [&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary" />
    </motion.div>
  );
}

/* ─── Mobile Break-Even Chart ─── */
function MobileChart({ cardId, cardData, spending, perks, yearMode, waivedOn }: {
  cardId: string; cardData: CardData; spending: SpendMap; perks: PerkState; yearMode: YearMode; waivedOn: number | null;
}) {
  const currentMonthly = Object.values(spending).reduce((s, v) => s + v, 0);
  const chartData = useMemo(() => {
    const total = currentMonthly || 1;
    return CHART_STEPS.map(mTotal => {
      const scaled: SpendMap = {};
      for (const cat of SPEND_CATEGORIES) scaled[cat.id] = Math.round(((spending[cat.id] || 0) / total) * mTotal);
      const r = calcFeeWorth(cardId, cardData.v3Card, cardData.v3Data, scaled, perks, cardData.detected, yearMode);
      return { monthly: mTotal, netValue: r?.netValue ?? 0 };
    });
  }, [cardId, cardData, spending, perks, yearMode, currentMonthly]);

  const breakEvenMonthly = useMemo(() => {
    for (let i = 1; i < chartData.length; i++) {
      const p = chartData[i - 1], c = chartData[i];
      if (p.netValue < 0 && c.netValue >= 0) {
        const ratio = Math.abs(p.netValue) / (Math.abs(p.netValue) + c.netValue);
        return Math.round(p.monthly + ratio * (c.monthly - p.monthly));
      }
    }
    return chartData.length > 0 && chartData[0].netValue >= 0 ? 0 : null;
  }, [chartData]);

  const waiverMonthly = waivedOn != null ? Math.round(waivedOn / 12) : null;
  const maxAbs = useMemo(() => Math.max(...chartData.map(d => Math.abs(d.netValue)), 1), [chartData]);

  return (
    <div className="space-y-2">
      <div className="h-[200px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="mPosG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(74,222,128,0.3)" /><stop offset="100%" stopColor="rgba(74,222,128,0.02)" />
              </linearGradient>
              <linearGradient id="mNegG" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(248,113,113,0.3)" /><stop offset="100%" stopColor="rgba(248,113,113,0.02)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border)/0.15)" strokeDasharray="3 3" />
            <XAxis dataKey="monthly" interval={2}
              tickFormatter={(v: number) => v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${v/1000}K`}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => { const a = Math.abs(v); const f = a >= 100000 ? `${(a/100000).toFixed(0)}L` : a >= 1000 ? `${(a/1000).toFixed(0)}K` : `${a}`; return v < 0 ? `-${f}` : f; }}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
              domain={[-maxAbs * 0.2, maxAbs * 1.1]} />
            <RechartsTooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border)/0.4)", borderRadius: "0.75rem", fontSize: "11px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
              formatter={(value: number) => [formatCur(value), "Net Value"]}
              labelFormatter={(v: number) => `${formatCur(v)}/mo`} />
            <ReferenceLine y={0} stroke="hsl(var(--border)/0.5)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey={(d: { netValue: number }) => Math.max(0, d.netValue)} stroke="rgb(74,222,128)" strokeWidth={2} fill="url(#mPosG)" isAnimationActive={false} />
            <Area type="monotone" dataKey={(d: { netValue: number }) => Math.min(0, d.netValue)} stroke="rgb(248,113,113)" strokeWidth={2} fill="url(#mNegG)" isAnimationActive={false} />
            {breakEvenMonthly != null && breakEvenMonthly > 0 && (
              <ReferenceLine x={breakEvenMonthly} stroke="rgb(251,191,36)" strokeDasharray="6 3"
                label={{ value: "Break-even", position: "top", fill: "rgb(251,191,36)", fontSize: 9 }} />
            )}
            {currentMonthly > 0 && (
              <ReferenceLine x={currentMonthly} stroke="#d4a853" strokeDasharray="4 2" strokeWidth={2}
                label={{ value: "You", position: "insideTopRight", fill: "#d4a853", fontSize: 9, fontWeight: 600 }} />
            )}
            {waiverMonthly != null && waiverMonthly > 0 && (
              <ReferenceLine x={waiverMonthly} stroke="rgb(74,222,128)" strokeDasharray="6 3"
                label={{ value: "Fee waived", position: "insideTopLeft", fill: "rgb(74,222,128)", fontSize: 9 }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {breakEvenMonthly != null && breakEvenMonthly > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          Break-even at <span className="text-primary font-medium">{formatCur(breakEvenMonthly)}/mo</span>
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export default function MobileFeeWorthCalc({
  selectedCards, spending, totalMonthly, activePreset, perksMap,
  cardDataMap, resultsMap, yearMode,
  onAddCard, onRemoveCard, onCatChange, onPreset, onPerksChange, onYearModeToggle,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [perkTab, setPerkTab] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const selIds = new Set(selectedCards.map(c => c.id));
    if (!query.trim()) return cards.filter(c => !selIds.has(c.id)).slice(0, 10);
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return cards.filter(c => {
      if (selIds.has(c.id)) return false;
      const hay = (c.name + " " + c.issuer).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [query, selectedCards]);

  const popularCards = useMemo(
    () => POPULAR_IDS.map(id => cards.find(c => c.id === id)).filter(Boolean) as CardType[], [],
  );

  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const primaryCard = selectedCards[0] ?? null;
  const primaryResult = primaryCard ? resultsMap.get(primaryCard.id) ?? null : null;
  const effectivePerkTab = perkTab && selectedCards.some(c => c.id === perkTab) ? perkTab : primaryCard?.id ?? "";

  // Find winner for compare
  const winner = useMemo(() => {
    if (selectedCards.length < 2) return null;
    let best: { card: CardType; result: FeeResult } | null = null;
    for (const c of selectedCards) {
      const r = resultsMap.get(c.id);
      if (r && (!best || r.netValue > best.result.netValue)) best = { card: c, result: r };
    }
    return best;
  }, [selectedCards, resultsMap]);

  return (
    <div className="sm:hidden pb-28">
      {/* ── Hero ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif gold-gradient mb-1">Fee Worth Calculator</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">Is your card's annual fee justified?</p>
          {primaryResult && (
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
              primaryResult.verdict === "worth" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
              primaryResult.verdict === "not-worth" ? "bg-red-500/15 text-red-400 border border-red-500/30" :
              "bg-amber-500/15 text-amber-400 border border-amber-500/30",
            )}>
              {primaryResult.verdict === "worth" && <><Check className="w-2.5 h-2.5" /> Worth It</>}
              {primaryResult.verdict === "not-worth" && <><X className="w-2.5 h-2.5" /> Not Worth It</>}
              {primaryResult.verdict === "break-even" && <>{"\u2248"} Break Even</>}
            </span>
          )}
        </div>
      </div>

      {/* ── Card Selector ── */}
      <div ref={searchRef} className="relative mb-5">
        {selectedCards.length < 3 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text"
              placeholder={selectedCards.length === 0 ? "Search for a card..." : "Add another card..."}
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full h-11 bg-card border border-border/40 rounded-xl pl-10 pr-10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            {query && <button onClick={() => { setQuery(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"><X className="w-4 h-4" /></button>}
          </div>
        )}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/40 scrollbar-hide">
              {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No matching cards</p>}
              {filtered.map(card => (
                <button key={card.id} onClick={() => { onAddCard(card); setQuery(""); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/20 border-b border-border/10 last:border-0 active:scale-[0.98]"
                  style={{ touchAction: "manipulation" }}>
                  <div className="w-10 h-6 rounded-lg overflow-hidden flex-shrink-0"><CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground">{card.issuer} {"\u00B7"} {card.fee}</p>
                  </div>
                  <span className="text-[10px] text-primary font-mono flex-shrink-0">{feeworthCalcData[card.id]?.baseRate ?? "\u2014"}%</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Selected chips */}
        {selectedCards.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCards.map(card => (
              <motion.div key={card.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-full bg-card border border-primary/20">
                <div className="w-7 h-5 rounded overflow-hidden flex-shrink-0"><CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} /></div>
                <span className="text-xs font-medium truncate max-w-[80px]">{card.name}</span>
                <button onClick={() => onRemoveCard(card.id)} className="ml-0.5 p-1 rounded-full text-muted-foreground active:scale-[0.98]"
                  style={{ touchAction: "manipulation" }}><X className="w-3 h-3" /></button>
              </motion.div>
            ))}
          </div>
        )}
        {/* Popular */}
        {selectedCards.length === 0 && !searchOpen && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {popularCards.map(card => (
              <button key={card.id} onClick={() => onAddCard(card)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border/30 flex-shrink-0 active:scale-[0.98]"
                style={{ touchAction: "manipulation" }}>
                <div className="w-6 h-4 rounded overflow-hidden flex-shrink-0"><CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} /></div>
                <span className="text-[11px] font-medium whitespace-nowrap">{card.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Effective Cost Hero Card (NOT collapsible) ── */}
      {selectedCards.length >= 1 && (() => {
        // Compare mode: stacked cards
        if (selectedCards.length >= 2 && winner) {
          const sorted = [...selectedCards]
            .map(c => ({ card: c, result: resultsMap.get(c.id) }))
            .filter((e): e is { card: CardType; result: FeeResult } => e.result != null)
            .sort((a, b) => b.result.netValue - a.result.netValue);
          return (
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Comparison</span>
              </div>
              {sorted.map(({ card, result }, i) => {
                const isW = i === 0;
                return (
                  <motion.div key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className={cn("glass-card rounded-2xl p-4 border-2",
                      isW ? "border-emerald-500/30" : result.verdict === "not-worth" ? "border-red-500/20" : "border-border/20")}>
                    {isW && <span className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Crown className="w-3 h-3" /> Best Value</span>}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm"><CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{card.name}</p></div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        result.verdict === "worth" ? "bg-emerald-500/15 text-emerald-400" :
                        result.verdict === "not-worth" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
                        {result.verdict === "worth" ? "Worth It" : result.verdict === "not-worth" ? "Not Worth" : "Break Even"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Net value</span>
                      <span className={cn("font-bold font-mono", result.netValue >= 0 ? "text-emerald-400" : "text-red-400")}
                        style={{ fontVariantNumeric: "tabular-nums" }}>
                        {result.netValue >= 0 ? "+" : "-"}{formatCur(Math.abs(result.netValue))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-0.5">
                      <span className="text-muted-foreground">ROI</span>
                      <span className="font-mono text-foreground">{result.roi.toFixed(1)}x</span>
                    </div>
                  </motion.div>
                );
              })}
              {/* Year toggle */}
              <div className="flex bg-card rounded-xl p-1 border border-border/30">
                <button onClick={onYearModeToggle}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                    yearMode === "first-year" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                  style={{ touchAction: "manipulation" }}>First Year</button>
                <button onClick={onYearModeToggle}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                    yearMode === "ongoing" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                  style={{ touchAction: "manipulation" }}>Ongoing</button>
              </div>
            </div>
          );
        }
        // Single card hero
        const result = primaryResult;
        const card = primaryCard;
        if (!card || !result) {
          const data = primaryCard ? cardDataMap.get(primaryCard.id) : undefined;
          if (primaryCard && (!data || !data.hasV3)) {
            return (
              <div className="text-center py-8 mb-4">
                <p className="text-sm">Limited data for <span className="font-medium">{primaryCard.name}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Try another card</p>
              </div>
            );
          }
          return null;
        }
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("glass-card rounded-2xl p-6 border-2 mb-4",
              result.verdict === "worth" ? "border-emerald-500/30" :
              result.verdict === "not-worth" ? "border-red-500/30" : "border-amber-500/30")}>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Effective Annual Cost</p>
              <p className={cn("text-4xl font-mono font-bold", result.effectiveFee <= 0 ? "text-emerald-400" : "text-red-400")}
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {result.effectiveFee <= 0 ? `-${formatCur(Math.abs(result.effectiveFee))}` : formatCur(result.effectiveFee)}
              </p>
              {result.effectiveFee <= 0 && <p className="text-[10px] text-emerald-400 mt-0.5">Card pays you!</p>}
              <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
                <p>Fee {formatCur(result.totalCost)}{result.feeWaived ? " (waived)" : ""} {"\u2212"} Value {formatCur(result.totalValue)}</p>
                <p className={cn("text-xs font-semibold font-mono", result.netValue >= 0 ? "text-emerald-400" : "text-red-400")}>
                  Net: {result.netValue >= 0 ? "+" : "-"}{formatCur(Math.abs(result.netValue))}/yr
                </p>
              </div>
            </div>
            {/* Year toggle */}
            <div className="flex bg-secondary/20 rounded-xl p-1 mt-4">
              <button onClick={onYearModeToggle}
                className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                  yearMode === "first-year" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                style={{ touchAction: "manipulation" }}>First Year</button>
              <button onClick={onYearModeToggle}
                className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                  yearMode === "ongoing" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                style={{ touchAction: "manipulation" }}>Ongoing</button>
            </div>
          </motion.div>
        );
      })()}

      {/* ── Expert Verdict ── */}
      {primaryCard && (() => {
        const data = cardDataMap.get(primaryCard.id);
        const fwData = data?.v3Data;
        const result = resultsMap.get(primaryCard.id);
        if (!fwData || !result) return null;
        return (
          <MobileSection icon={Sparkles} title="Expert Verdict" defaultOpen>
            {/* Verdict box */}
            <div className={cn("rounded-xl p-4 mb-4",
              result.verdict === "worth" ? "bg-emerald-500/[0.06] border border-emerald-500/20" :
              result.verdict === "not-worth" ? "bg-red-500/[0.06] border border-red-500/20" :
              "bg-amber-500/[0.06] border border-amber-500/20")}>
              <div className="flex items-center gap-2 mb-2">
                {result.verdict === "worth" && <Check className="w-5 h-5 text-emerald-400" />}
                {result.verdict === "not-worth" && <X className="w-5 h-5 text-red-400" />}
                {result.verdict === "break-even" && <span className="text-lg">{"\u2248"}</span>}
                <span className={cn("text-sm font-semibold uppercase tracking-wide",
                  result.verdict === "worth" ? "text-emerald-400" : result.verdict === "not-worth" ? "text-red-400" : "text-amber-400")}>
                  {result.verdict === "worth" ? "Worth It" : result.verdict === "not-worth" ? "Not Worth It" : "Break Even"}
                </span>
              </div>
              {result.verdict === "worth" && result.totalCost > 0 && (
                <p className="text-xs text-muted-foreground">Pays for itself {(result.totalValue / result.totalCost).toFixed(1)}{"\u00D7"} over{result.feeWaived ? " \u2014 and fee is waived!" : ""}</p>
              )}
              {result.verdict === "not-worth" && result.breakEvenExtraMonthly > 0 && (
                <p className="text-xs text-muted-foreground">Spend {formatCur(result.breakEvenExtraMonthly)} more/mo to break even</p>
              )}
            </div>
            {fwData.verdict && <p className="text-xs text-foreground leading-relaxed mb-3">{fwData.verdict}</p>}
            {fwData.pros.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-emerald-400 font-semibold mb-1.5">Pros</p>
                {fwData.pros.map((pro, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-2 py-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />{pro}
                  </p>
                ))}
              </div>
            )}
            {fwData.cons.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-red-400 font-semibold mb-1.5">Cons</p>
                {fwData.cons.map((con, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-2 py-1">
                    <X className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />{con}
                  </p>
                ))}
              </div>
            )}
            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="rounded-xl border border-primary/20 p-3 space-y-1.5" style={{ background: "linear-gradient(135deg, rgba(212,168,83,0.06), transparent)" }}>
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Tips</p>
                {result.tips.map((tip, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />{tip}
                  </p>
                ))}
              </div>
            )}
            <Link to={`/cards/${primaryCard.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 mt-4 rounded-xl bg-primary/10 text-primary text-xs font-medium border border-primary/20 active:scale-[0.98]"
              style={{ touchAction: "manipulation" }}>
              View Card Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MobileSection>
        );
      })()}

      {/* ── Spending ── */}
      <MobileSection icon={Wallet} title="Monthly Spending" defaultOpen={false}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => onPreset(p)}
              className={cn("h-11 px-4 rounded-xl text-xs font-medium border flex-shrink-0 transition-all active:scale-[0.98]",
                activePreset === p.id ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground")}
              style={{ touchAction: "manipulation" }}>{p.label}</button>
          ))}
        </div>
        {SPEND_CATEGORIES.map((cat, i) => (
          <MobileSpendRow key={cat.id} cat={cat} value={spending[cat.id] || 0} onChange={v => onCatChange(cat.id, v)} delay={i * 0.04} />
        ))}
        <div className="rounded-xl p-3 mt-3 border-2 border-primary/20 bg-primary/[0.04] flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Total Monthly</span>
          <span className="text-base font-bold text-primary font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(totalMonthly)}</span>
        </div>
      </MobileSection>

      {/* ── Perk Toggles ── */}
      {selectedCards.length > 0 && (() => {
        const tabCard = selectedCards.find(c => c.id === effectivePerkTab) ?? selectedCards[0];
        if (!tabCard) return null;
        const data = cardDataMap.get(tabCard.id);
        if (!data?.hasV3) return null;
        const det = data.detected;
        const anyPerk = det.hasLounge || det.hasPortal || det.hasGolf || det.hasDining || det.hasMemberships;
        if (!anyPerk) return null;
        const perks = perksMap[tabCard.id] ?? DEFAULT_PERKS;
        return (
          <MobileSection icon={Star} title="Perk Toggles" defaultOpen={false}>
            {selectedCards.length > 1 && (
              <div className="flex gap-1 bg-secondary/20 rounded-xl p-1 mb-4">
                {selectedCards.map(c => (
                  <button key={c.id} onClick={() => setPerkTab(c.id)}
                    className={cn("flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium truncate transition-all active:scale-[0.98]",
                      effectivePerkTab === c.id ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                    style={{ touchAction: "manipulation" }}>{c.name.split(" ").slice(-1)[0]}</button>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {det.hasLounge && (
                <div className="rounded-xl bg-card border border-border/20 p-4">
                  <div className="flex items-center justify-between min-h-[52px]">
                    <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Airport Lounges</span></div>
                    <Switch checked={perks.loungeEnabled} onCheckedChange={v => onPerksChange(tabCard.id, { loungeEnabled: v })} />
                  </div>
                  <AnimatePresence>
                    {perks.loungeEnabled && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-2 flex items-center justify-between">
                          <MobileStepper value={perks.loungeVisits} onChange={v => onPerksChange(tabCard.id, { loungeVisits: v })} min={1} max={50} label="Visits/yr" />
                          <span className="text-xs text-emerald-400 font-mono ml-2">{(() => { const lpv = getCardPerVisitValues(tabCard.id); return formatCur(perks.loungeVisits * lpv.domestic + det.intlLoungeVisits * lpv.international); })()}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {det.hasPortal && (
                <div className="rounded-xl bg-card border border-border/20 p-4">
                  <div className="flex items-center justify-between min-h-[52px]">
                    <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{det.portalName || "Bank Portal"}</span></div>
                    <Switch checked={perks.portalEnabled} onCheckedChange={v => onPerksChange(tabCard.id, { portalEnabled: v })} />
                  </div>
                  <AnimatePresence>
                    {perks.portalEnabled && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Monthly portal spend</span>
                          <span className="text-xs text-foreground font-mono">{formatCur(perks.monthlyPortalSpend)}</span>
                        </div>
                        <Slider value={[perks.monthlyPortalSpend]} onValueChange={([v]) => onPerksChange(tabCard.id, { monthlyPortalSpend: v })}
                          max={50000} step={1000}
                          className="[&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:touch-manipulation [&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {det.hasGolf && (
                <div className="rounded-xl bg-card border border-border/20 p-4">
                  <div className="flex items-center justify-between min-h-[52px]">
                    <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Golf Access</span></div>
                    <Switch checked={perks.golfEnabled} onCheckedChange={v => onPerksChange(tabCard.id, { golfEnabled: v })} />
                  </div>
                  <AnimatePresence>
                    {perks.golfEnabled && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-2 flex items-center justify-between">
                          <MobileStepper value={perks.golfGames} onChange={v => onPerksChange(tabCard.id, { golfGames: v })} min={1} max={24} label="Games/yr" />
                          <span className="text-xs text-emerald-400 font-mono ml-2">{formatCur(perks.golfGames * GOLF_VALUE_PER_GAME)}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {det.hasDining && (
                <div className="rounded-xl bg-card border border-border/20 p-4 flex items-center justify-between min-h-[52px]">
                  <div className="flex items-center gap-2"><Gift className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Dining Program</span></div>
                  <div className="flex items-center gap-3">
                    {perks.diningEnabled && <span className="text-xs text-emerald-400 font-mono">{formatCur(DINING_FLAT_VALUE)}</span>}
                    <Switch checked={perks.diningEnabled} onCheckedChange={v => onPerksChange(tabCard.id, { diningEnabled: v })} />
                  </div>
                </div>
              )}
              {det.hasMemberships && (
                <div className="rounded-xl bg-card border border-border/20 p-4 flex items-center justify-between min-h-[52px]">
                  <div className="flex items-center gap-2"><Star className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Memberships</span></div>
                  <div className="flex items-center gap-3">
                    {perks.membershipEnabled && <span className="text-xs text-emerald-400 font-mono">{formatCur(det.membershipTotalValue > 0 ? det.membershipTotalValue : MEMBERSHIP_FLAT_VALUE)}</span>}
                    <Switch checked={perks.membershipEnabled} onCheckedChange={v => onPerksChange(tabCard.id, { membershipEnabled: v })} />
                  </div>
                </div>
              )}
            </div>
          </MobileSection>
        );
      })()}

      {/* ── Break-Even Chart ── */}
      {primaryCard && primaryResult && (() => {
        const data = cardDataMap.get(primaryCard.id);
        if (!data?.hasV3) return null;
        return (
          <MobileSection icon={BarChart3} title="Break-Even Analysis" defaultOpen={false}>
            <MobileChart
              cardId={primaryCard.id}
              cardData={data}
              spending={spending}
              perks={perksMap[primaryCard.id] ?? DEFAULT_PERKS}
              yearMode={yearMode}
              waivedOn={primaryResult.waivedOnAnnualSpend}
            />
          </MobileSection>
        );
      })()}

      {/* ── Value Breakdown ── */}
      {primaryCard && primaryResult && (
        <MobileSection icon={TrendingUp} title="Value Breakdown" defaultOpen={false}>
          {(() => {
            const r = primaryResult;
            const items: { label: string; value: number; icon: React.ReactNode }[] = [];
            if (r.rewardEarnings > 0) items.push({ label: "Reward Earnings", value: r.rewardEarnings, icon: <Wallet className="w-3.5 h-3.5" /> });
            if (r.portalBonus > 0) items.push({ label: "Portal Bonus", value: r.portalBonus, icon: <Sparkles className="w-3.5 h-3.5" /> });
            if (r.loungeValue > 0) items.push({ label: "Lounge Access", value: r.loungeValue, icon: <Plane className="w-3.5 h-3.5" /> });
            if (r.golfValue > 0) items.push({ label: "Golf Access", value: r.golfValue, icon: <Trophy className="w-3.5 h-3.5" /> });
            if (r.diningValue > 0) items.push({ label: "Dining Program", value: r.diningValue, icon: <Gift className="w-3.5 h-3.5" /> });
            if (r.membershipValue > 0) items.push({ label: "Memberships", value: r.membershipValue, icon: <Star className="w-3.5 h-3.5" /> });
            if (r.milestoneValue > 0) items.push({ label: "Milestones", value: r.milestoneValue, icon: <TrendingUp className="w-3.5 h-3.5" /> });
            if (r.renewalBenefit > 0) items.push({ label: "Renewal Benefit", value: r.renewalBenefit, icon: <Gift className="w-3.5 h-3.5" /> });
            if (r.feeWaiverSavings > 0) items.push({ label: "Fee Waived", value: r.feeWaiverSavings, icon: <Check className="w-3.5 h-3.5" /> });
            if (r.joiningBonus > 0) items.push({ label: "Welcome Bonus", value: r.joiningBonus, icon: <Gift className="w-3.5 h-3.5" /> });
            return (
              <div className="space-y-4">
                {/* Value items */}
                <div className="rounded-xl border-l-4 border-emerald-500 bg-card border border-border/20 p-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Value You Get
                  </p>
                  {items.length === 0 && <p className="text-xs text-muted-foreground">Enable perks or increase spending</p>}
                  {items.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">{item.icon}{item.label}</span>
                      <span className="font-mono text-foreground">{formatCur(item.value)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">Total Value</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{formatCur(r.totalValue)}</span>
                  </div>
                </div>
                {/* Cost */}
                <div className="rounded-xl border-l-4 border-red-500 bg-card border border-border/20 p-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <TrendingDown className="w-3 h-3" /> What You Pay
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Annual Fee</span>
                    {r.feeWaived ? (
                      <span className="flex items-center gap-1.5">
                        <span className="line-through text-muted-foreground font-mono">{formatCur(r.totalCost)}</span>
                        <span className="text-emerald-400 text-[10px] font-medium">Waived <Check className="w-3 h-3 inline" /></span>
                      </span>
                    ) : <span className="font-mono text-foreground">{formatCur(r.totalCost)}</span>}
                  </div>
                </div>
                {/* Value vs Cost bar */}
                <div>
                  <div className="h-5 rounded-full bg-border/20 overflow-hidden relative">
                    <motion.div className="absolute left-0 top-0 h-full rounded-full bg-emerald-500/70" initial={{ width: 0 }}
                      animate={{ width: `${Math.min((r.totalValue / Math.max(r.totalValue, r.totalCost, 1)) * 100, 100)}%` }}
                      transition={{ duration: 0.6 }} style={{ zIndex: 1 }} />
                    <motion.div className="absolute left-0 top-0 h-full rounded-full bg-red-500/40" initial={{ width: 0 }}
                      animate={{ width: `${Math.min((r.totalCost / Math.max(r.totalValue, r.totalCost, 1)) * 100, 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }} style={{ zIndex: 0 }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-emerald-400 font-medium">Value: {formatCur(r.totalValue)}</span>
                    <span className="text-red-400 font-medium">Cost: {formatCur(r.totalCost)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </MobileSection>
      )}

      {/* Empty state */}
      {selectedCards.length === 0 && (
        <div className="text-center py-10">
          <span className="text-3xl block mb-3">{"\uD83D\uDCB3"}</span>
          <p className="text-sm font-serif">Select a card above</p>
          <p className="text-xs text-muted-foreground mt-1">to find out if the annual fee is worth it</p>
        </div>
      )}
    </div>
  );
}
