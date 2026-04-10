import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Star, X, Check, ChevronDown, ChevronRight, Home,
  CreditCard, Wallet, TrendingUp, TrendingDown, Plane, Trophy,
  Gift, Sparkles, ArrowRight, Info, Lightbulb, Crown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ReferenceLine, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import CardImage from "@/components/CardImage";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { feeworthCalcData, type FeeWorthCalcCard } from "@/data/calc-types";
import { formatCur } from "@/lib/fee-utils";
import { PRIMARY_CATEGORIES as PRIMARY_CAT_IDS, getCategoryEmoji, getCategoryName } from "@/data/category-config";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileFeeWorthCalc from "@/components/calculators/MobileFeeWorthCalc";
import { getCardPerVisitValues, getCardLoungeAccess, getLoungeProgram } from "@/data/lounge-programs";

/* ─────────────────────────────────────────────────────────────── */
/*  Constants                                                      */
/* ─────────────────────────────────────────────────────────────── */

const SPEND_CATEGORIES = PRIMARY_CAT_IDS.map(cat => ({
  id: cat.id,
  label: getCategoryName(cat.id),
  emoji: getCategoryEmoji(cat.id),
}));

type SpendMap = Record<string, number>;

const PRESETS: { id: string; label: string; values: SpendMap }[] = [
  { id: "casual", label: "Casual (\u20B930K)", values: { grocery: 5000, dining: 4000, fuel: 3000, online: 8000, travel: 2000, utilities: 8000 } },
  { id: "premium", label: "Premium (\u20B980K)", values: { grocery: 12000, dining: 12000, fuel: 6000, online: 20000, travel: 15000, utilities: 15000 } },
  { id: "heavy", label: "Heavy (\u20B91.5L)", values: { grocery: 20000, dining: 25000, fuel: 10000, online: 35000, travel: 30000, utilities: 30000 } },
];

const MAX_SLIDER = 100000;

const GOLF_VALUE_PER_GAME = 2000;
const DINING_FLAT_VALUE = 3000;
const MEMBERSHIP_FLAT_VALUE = 5000;

/** Parse lounge visit strings like "8", "Unlimited", "4 (Priority Pass)" → number (cap Unlimited at 12) */
function parseLoungeVisits(s: string): number {
  if (!s || s === "0" || s.toLowerCase() === "none") return 0;
  if (s.toLowerCase().includes("unlimited")) return 12;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                        */
/* ─────────────────────────────────────────────────────────────── */

function fmtInput(v: number) {
  return v.toLocaleString("en-IN");
}

function parseInput(s: string) {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}

/** Clamp a value between min and max */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ─────────────────────────────────────────────────────────────── */
/*  Perk detection from V3 unified data                            */
/* ─────────────────────────────────────────────────────────────── */

interface DetectedPerks {
  hasLounge: boolean;
  domesticLoungeVisits: number;
  intlLoungeVisits: number;
  hasPortal: boolean;
  hasGolf: boolean;
  golfText: string | null;
  hasDining: boolean;
  hasMemberships: boolean;
  portalName: string;
  bestPortalRate: number;
  membershipTotalValue: number;
}

function detectPerks(v3Card: CardV3 | undefined, fwData: FeeWorthCalcCard | undefined): DetectedPerks {
  const base: DetectedPerks = {
    hasLounge: false,
    domesticLoungeVisits: 0,
    intlLoungeVisits: 0,
    hasPortal: false,
    hasGolf: false,
    golfText: null,
    hasDining: false,
    hasMemberships: false,
    portalName: "",
    bestPortalRate: 0,
    membershipTotalValue: 0,
  };

  if (!v3Card && !fwData) return base;

  // Prefer feeworth data — it's the richest source
  if (fwData) {
    // Lounge
    const domVisits = parseLoungeVisits(fwData.lounge.domesticVisits);
    const intlVisits = parseLoungeVisits(fwData.lounge.intlVisits);
    base.hasLounge = fwData.lounge.domesticUnlimited || fwData.lounge.intlUnlimited || domVisits > 0 || intlVisits > 0;
    base.domesticLoungeVisits = domVisits;
    base.intlLoungeVisits = intlVisits;

    // Golf
    base.hasGolf = fwData.golf.included;
    base.golfText = fwData.golf.text;

    // Dining / entertainment
    base.hasDining = fwData.entertainment != null;

    // Memberships
    base.hasMemberships = fwData.memberships.length > 0;
    base.membershipTotalValue = fwData.memberships.reduce((sum, m) => sum + m.value, 0);
  } else if (v3Card) {
    // Fallback to V3 unified data
    if (v3Card.features?.lounge) {
      const dom = v3Card.features.lounge.domestic;
      if (typeof dom === "string") {
        base.hasLounge = dom !== "None" && dom !== "0" && dom.toLowerCase() !== "no";
      } else if (dom && typeof dom === "object") {
        base.hasLounge = dom.unlimited === true || (dom.visitsPerYear != null && dom.visitsPerYear > 0);
      }
    }
    if (v3Card.features?.golf) {
      const golf = v3Card.features.golf;
      base.hasGolf = typeof golf === "object" && golf !== null && golf.included === true;
    }
    if (v3Card.features?.dining) {
      const dining = v3Card.features.dining;
      base.hasDining = typeof dining === "object" && dining !== null && (dining.culinaryTreats === true || dining.acceleratedDining === true);
    }
    if (v3Card.features?.memberships) {
      const mb = v3Card.features.memberships;
      if (Array.isArray(mb) && mb.length > 0) {
        base.hasMemberships = true;
        base.membershipTotalValue = mb.reduce((sum, m) => sum + ((m as any).value ?? 0), 0);
      }
    }
  }

  // Portal detection from v3Card (feeworth data doesn't include portals)
  if (v3Card?.rewards?.calculator?.portals && v3Card.rewards.calculator.portals.length > 0) {
    const portal = v3Card.rewards.calculator.portals[0];
    base.hasPortal = true;
    base.portalName = portal.name;
    const rates = portal.merchants.map((m) => m.effectiveRate).filter(Boolean);
    base.bestPortalRate = rates.length > 0 ? Math.max(...rates) : 0;
  }

  return base;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Perk state types                                               */
/* ─────────────────────────────────────────────────────────────── */

interface PerkState {
  loungeEnabled: boolean;
  loungeVisits: number;
  portalEnabled: boolean;
  monthlyPortalSpend: number;
  golfEnabled: boolean;
  golfGames: number;
  diningEnabled: boolean;
  membershipEnabled: boolean;
}

const DEFAULT_PERKS: PerkState = {
  loungeEnabled: false,
  loungeVisits: 8,
  portalEnabled: false,
  monthlyPortalSpend: 5000,
  golfEnabled: false,
  golfGames: 4,
  diningEnabled: false,
  membershipEnabled: false,
};

/* ─────────────────────────────────────────────────────────────── */
/*  Fee analysis engine                                            */
/* ─────────────────────────────────────────────────────────────── */

type YearMode = "first-year" | "ongoing";

interface FeeResult {
  annualSpend: number;
  rewardEarnings: number;
  portalBonus: number;
  loungeValue: number;
  golfValue: number;
  diningValue: number;
  membershipValue: number;
  milestoneValue: number;
  milestoneDetails: { spend: number; benefit: string; value: number; unlocked: boolean }[];
  renewalBenefit: number;
  feeWaived: boolean;
  feeWaiverSavings: number;
  effectiveFee: number;
  totalValue: number;
  totalCost: number;
  netValue: number;
  roi: number;
  verdict: "worth" | "not-worth" | "break-even";
  breakEvenExtraMonthly: number;
  tips: string[];
  joiningFee: number;
  joiningBonus: number;
  waivedOnAnnualSpend: number | null;
}

function calculateFeeWorth(
  cardId: string,
  v3Card: CardV3 | undefined,
  fwData: FeeWorthCalcCard | undefined,
  spending: SpendMap,
  perks: PerkState,
  detectedPerks: DetectedPerks,
  yearMode: YearMode = "ongoing",
): FeeResult | null {
  // Need at least one data source for fee info
  const annualFee = fwData?.annualFee ?? v3Card?.fees?.annual ?? null;
  if (annualFee === null) return null;

  // Joining fee and bonus for first-year mode
  const joiningFee = fwData?.joiningFee ?? v3Card?.fees?.joining ?? annualFee;
  let joiningBonus = 0;
  const jbStr = fwData?.joiningBonus ?? v3Card?.rewards?.joiningBonus;
  if (jbStr && typeof jbStr === "string") {
    const match = jbStr.match(/(?:worth|value)[^0-9]*([0-9,]+)/i) ?? jbStr.match(/([0-9,]+)/);
    if (match) joiningBonus = parseInt(match[1].replace(/,/g, ""), 10) || 0;
  }

  const baseRate = fwData?.baseRate ?? v3Card?.rewards?.baseRate ?? 0;
  const redemptionValue = fwData?.pointValue ?? v3Card?.rewards?.redemption?.baseValue ?? 1;

  const monthlyTotal = Object.values(spending).reduce((s, v) => s + v, 0);
  const annualSpend = monthlyTotal * 12;

  // Reward earnings: annualSpend * (baseRate / 100) * redemptionValue
  // For v3Data, baseRate is in 0-100 form. For v3Card, baseRate is also 0-100 form.
  const rewardEarnings = Math.round(annualSpend * (baseRate / 100) * redemptionValue);

  // Portal bonus
  let portalBonus = 0;
  if (perks.portalEnabled && detectedPerks.hasPortal && detectedPerks.bestPortalRate > 0) {
    const portalAnnual = perks.monthlyPortalSpend * 12;
    // bestPortalRate is effective % (like 33 for 33%). Calculate incremental value above base.
    const portalEarning = portalAnnual * (detectedPerks.bestPortalRate / 100) * redemptionValue;
    const baseOnPortal = portalAnnual * (baseRate / 100) * redemptionValue;
    portalBonus = Math.max(0, Math.round(portalEarning - baseOnPortal));
  }

  // Perk values — lounge uses per-card program pricing
  const domVisits = perks.loungeEnabled ? Math.min(perks.loungeVisits, detectedPerks.domesticLoungeVisits || perks.loungeVisits) : 0;
  const intlVisits = perks.loungeEnabled ? detectedPerks.intlLoungeVisits : 0;
  const loungePerVisit = getCardPerVisitValues(cardId);
  const loungeValue = domVisits * loungePerVisit.domestic + intlVisits * loungePerVisit.international;
  const golfValue = perks.golfEnabled ? perks.golfGames * GOLF_VALUE_PER_GAME : 0;
  const diningValue = perks.diningEnabled ? DINING_FLAT_VALUE : 0;

  // Membership value: use detected total if available, otherwise flat estimate
  let membershipValue = 0;
  if (perks.membershipEnabled) {
    membershipValue = detectedPerks.membershipTotalValue > 0 ? detectedPerks.membershipTotalValue : MEMBERSHIP_FLAT_VALUE;
  }

  // Milestones
  let milestoneValue = 0;
  const milestoneDetails: FeeResult["milestoneDetails"] = [];

  // Milestones — prefer feeworth data, fallback to v3Card
  const milestones = fwData?.milestones ?? v3Card?.features?.milestones ?? [];
  for (const m of milestones) {
    const spend = m.spend ?? 0;
    const bValue = (m as any).value ?? (m as any).benefitValue ?? 0;
    const unlocked = spend > 0 && annualSpend >= spend;
    if (unlocked && bValue > 0) {
      milestoneValue += bValue;
    }
    if (spend > 0) {
      milestoneDetails.push({
        spend,
        benefit: m.benefit,
        value: bValue,
        unlocked,
      });
    }
  }

  // Renewal benefit
  const renewalBenefit = fwData?.renewalBenefitValue ?? v3Card?.fees?.renewalBenefitValue ?? 0;

  // Fee waiver
  const waivedOn = fwData?.feeWaivedOn ?? v3Card?.fees?.waivedOn ?? null;
  const feeWaived = waivedOn != null && annualSpend >= waivedOn;

  // Year-mode adjustments
  const baseFee = yearMode === "first-year" ? joiningFee : annualFee;
  const feeWaiverSavings = feeWaived ? baseFee : 0;
  // Effective cost = fee minus tangible offsets (can go negative → card pays you)
  const effectiveFee = (feeWaived ? 0 : baseFee) - renewalBenefit - milestoneValue - loungeValue - membershipValue;
  const yearModeBonus = yearMode === "first-year" ? joiningBonus : 0;

  // Totals
  const totalValue = rewardEarnings + portalBonus + loungeValue + golfValue + diningValue + membershipValue + milestoneValue + renewalBenefit + feeWaiverSavings + yearModeBonus;
  const totalCost = baseFee;
  const netValue = totalValue - totalCost;
  const roi = totalCost > 0 ? totalValue / totalCost : 0;

  // Verdict
  let verdict: FeeResult["verdict"];
  if (netValue > 500) verdict = "worth";
  else if (netValue < -500) verdict = "not-worth";
  else verdict = "break-even";

  // Break-even: how much more monthly spend needed
  let breakEvenExtraMonthly = 0;
  if (netValue < 0 && baseRate > 0) {
    const earnRatePerRupee = (baseRate / 100) * redemptionValue;
    const deficit = Math.abs(netValue);
    breakEvenExtraMonthly = earnRatePerRupee > 0 ? Math.round(deficit / (earnRatePerRupee * 12)) : 0;
  }

  // Tips
  const tips: string[] = [];
  if (!perks.portalEnabled && detectedPerks.hasPortal) {
    tips.push(`Use ${detectedPerks.portalName} for online shopping to earn up to ${detectedPerks.bestPortalRate.toFixed(1)}% value`);
  }
  // Milestone tips
  const nextUnlocked = milestoneDetails.find((m) => !m.unlocked && m.value > 0);
  if (nextUnlocked) {
    const gap = nextUnlocked.spend - annualSpend;
    if (gap > 0) {
      tips.push(`Spend ${formatCur(gap)} more annually to unlock: ${nextUnlocked.benefit}`);
    }
  }
  // Fee waiver tip
  if (waivedOn != null && !feeWaived) {
    tips.push(`Spend ${formatCur(waivedOn)}/year to get the annual fee waived entirely`);
  }
  // Lounge tip
  if (!perks.loungeEnabled && detectedPerks.hasLounge) {
    tips.push("Enable lounge access perk above to account for the value of airport lounge visits");
  }

  return {
    annualSpend,
    rewardEarnings,
    portalBonus,
    loungeValue,
    golfValue,
    diningValue,
    membershipValue,
    milestoneValue,
    milestoneDetails,
    renewalBenefit,
    feeWaived,
    feeWaiverSavings,
    effectiveFee,
    totalValue,
    totalCost,
    netValue,
    roi,
    verdict,
    breakEvenExtraMonthly,
    tips,
    joiningFee,
    joiningBonus: yearModeBonus,
    waivedOnAnnualSpend: waivedOn,
  };
}

/* ─────────────────────────────────────────────────────────────── */
/*  Number stepper component                                       */
/* ─────────────────────────────────────────────────────────────── */

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1, min, max))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-7 h-7 rounded-l-lg bg-card border border-border/40 text-foreground text-sm font-medium flex items-center justify-center hover:bg-muted/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-9 h-7 bg-card border-y border-border/40 text-xs text-foreground font-mono flex items-center justify-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1, min, max))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-7 h-7 rounded-r-lg bg-card border border-border/40 text-foreground text-sm font-medium flex items-center justify-center hover:bg-muted/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Card selector component                                        */
/* ─────────────────────────────────────────────────────────────── */

function CardSelector({
  selectedCards,
  onAdd,
  onRemove,
  maxCards = 3,
}: {
  selectedCards: CardType[];
  onAdd: (c: CardType) => void;
  onRemove: (id: string) => void;
  maxCards?: number;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedIds = new Set(selectedCards.map((c) => c.id));

  const filtered = useMemo(() => {
    const base = query.trim()
      ? (() => {
          const words = query.toLowerCase().split(/\s+/).filter(Boolean);
          return cards.filter((c) => {
            const hay = (c.name + " " + c.issuer).toLowerCase();
            return words.every(w => hay.includes(w));
          });
        })()
      : cards.slice(0, 20);
    return base.filter((c) => !selectedIds.has(c.id));
  }, [query, selectedIds]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-3">
      {/* Selected card chips */}
      {selectedCards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCards.map((card) => {
            const feeLabel = card.fee === "\u20B90" ? "Free" : card.fee + "/yr";
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2.5 rounded-xl bg-card border border-border/30 px-3 py-2"
              >
                <div className="w-10 h-7 rounded-md overflow-hidden shadow-sm flex-shrink-0">
                  {card.image ? (
                    <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate max-w-[140px]">{card.name}</p>
                  <p className="text-[10px] text-[#d4a853] font-medium">{feeLabel}</p>
                </div>
                <button
                  onClick={() => onRemove(card.id)}
                  aria-label={`Remove ${card.name}`}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Search input — only show when under max */}
      {selectedCards.length < maxCards && (
        <div ref={ref} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-label="Search credit cards"
              aria-haspopup="listbox"
              placeholder={selectedCards.length === 0 ? "Search for a credit card..." : `Add another card (${selectedCards.length}/${maxCards})...`}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              className="w-full bg-card border border-border/40 rounded-xl py-3.5 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setOpen(false); }}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
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
                transition={{ duration: 0.15 }}
                role="listbox"
                aria-label="Card search results"
                className="absolute z-50 mt-1.5 w-full max-h-72 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/40 scrollbar-hide"
              >
                {filtered.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center">No cards match your search. Try a different bank or card name.</p>
                )}
                {filtered.map((card) => (
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
                      <p className="text-[10px] text-muted-foreground">{card.issuer} &middot; {card.fee}</p>
                    </div>
                    <span className="text-[10px] text-primary font-mono flex-shrink-0">
                      {feeworthCalcData[card.id]?.baseRate ?? "\u2014"}%
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Spending row                                                    */
/* ─────────────────────────────────────────────────────────────── */

function SpendingRow({
  cat,
  value,
  onChange,
}: {
  cat: (typeof SPEND_CATEGORIES)[number];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2 py-3 border-b border-border/10 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground flex items-center gap-1.5">
          <span className="mr-0.5">{cat.emoji}</span>
          {cat.label}
        </span>
        <div className="relative w-28">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{"\u20B9"}</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Monthly ${cat.label} spending in rupees`}
            value={value === 0 ? "" : fmtInput(value)}
            onChange={(e) => onChange(parseInput(e.target.value))}
            placeholder="0"
            className="w-full bg-card border border-border/40 rounded-lg py-1.5 pl-6 pr-2 text-xs text-right text-foreground font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>
      </div>
      <Slider
        value={[Math.min(value, MAX_SLIDER)]}
        onValueChange={([v]) => onChange(v)}
        max={MAX_SLIDER}
        step={1000}
        aria-label={`Monthly ${cat.label} spending slider`}
        className="[&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4 [&_[data-radix-slider-thumb]]:border-primary"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Perk toggle section                                            */
/* ─────────────────────────────────────────────────────────────── */

function PerkToggles({
  cardId,
  detected,
  perks,
  onPerksChange,
}: {
  cardId: string;
  detected: DetectedPerks;
  perks: PerkState;
  onPerksChange: (p: Partial<PerkState>) => void;
}) {
  const anyPerk = detected.hasLounge || detected.hasPortal || detected.hasGolf || detected.hasDining || detected.hasMemberships;
  if (!anyPerk) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#d4a853]">
        Which perks do you use?
      </p>

      {detected.hasLounge && (
        <div className="rounded-xl bg-card border border-border/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Airport Lounges</span>
            </div>
            <Switch
              checked={perks.loungeEnabled}
              onCheckedChange={(v) => onPerksChange({ loungeEnabled: v })}
              aria-label="Toggle airport lounge perk"
            />
          </div>
          <AnimatePresence>
            {perks.loungeEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between pt-1">
                  <NumberStepper
                    value={perks.loungeVisits}
                    onChange={(v) => onPerksChange({ loungeVisits: v })}
                    min={1}
                    max={50}
                    label="Visits/year"
                  />
                  <span className="text-xs text-emerald-400 font-mono">
                    {(() => { const lpv = getCardPerVisitValues(cardId); return formatCur(perks.loungeVisits * lpv.domestic + detected.intlLoungeVisits * lpv.international); })()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {detected.hasPortal && (
        <div className="rounded-xl bg-card border border-border/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{detected.portalName || "Bank Portal"}</span>
            </div>
            <Switch
              checked={perks.portalEnabled}
              onCheckedChange={(v) => onPerksChange({ portalEnabled: v })}
              aria-label="Toggle bank portal perk"
            />
          </div>
          <AnimatePresence>
            {perks.portalEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2"
              >
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Monthly portal spend</span>
                  <span className="text-xs text-foreground font-mono">{formatCur(perks.monthlyPortalSpend)}</span>
                </div>
                <Slider
                  value={[perks.monthlyPortalSpend]}
                  onValueChange={([v]) => onPerksChange({ monthlyPortalSpend: v })}
                  max={50000}
                  step={1000}
                  aria-label="Monthly portal spending slider"
                  className="[&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-border/30 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4 [&_[data-radix-slider-thumb]]:border-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {detected.hasGolf && (
        <div className="rounded-xl bg-card border border-border/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Golf Access</span>
            </div>
            <Switch
              checked={perks.golfEnabled}
              onCheckedChange={(v) => onPerksChange({ golfEnabled: v })}
              aria-label="Toggle golf perk"
            />
          </div>
          <AnimatePresence>
            {perks.golfEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between pt-1">
                  <NumberStepper
                    value={perks.golfGames}
                    onChange={(v) => onPerksChange({ golfGames: v })}
                    min={1}
                    max={24}
                    label="Games/year"
                  />
                  <span className="text-xs text-emerald-400 font-mono">
                    {formatCur(perks.golfGames * GOLF_VALUE_PER_GAME)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {detected.hasDining && (
        <div className="rounded-xl bg-card border border-border/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-sm text-foreground">Dining Program</span>
                <p className="text-[10px] text-muted-foreground">Culinary treats / restaurant discounts</p>
              </div>
            </div>
            <Switch
              checked={perks.diningEnabled}
              onCheckedChange={(v) => onPerksChange({ diningEnabled: v })}
              aria-label="Toggle dining program perk"
            />
          </div>
          {perks.diningEnabled && (
            <p className="text-xs text-emerald-400 font-mono text-right mt-1">{formatCur(DINING_FLAT_VALUE)}/yr</p>
          )}
        </div>
      )}

      {detected.hasMemberships && (
        <div className="rounded-xl bg-card border border-border/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-sm text-foreground">Complimentary Memberships</span>
                <p className="text-[10px] text-muted-foreground">Hotel, lifestyle memberships</p>
              </div>
            </div>
            <Switch
              checked={perks.membershipEnabled}
              onCheckedChange={(v) => onPerksChange({ membershipEnabled: v })}
              aria-label="Toggle membership perk"
            />
          </div>
          {perks.membershipEnabled && (
            <p className="text-xs text-emerald-400 font-mono text-right mt-1">
              {formatCur(detected.membershipTotalValue > 0 ? detected.membershipTotalValue : MEMBERSHIP_FLAT_VALUE)}/yr
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Verdict box                                                    */
/* ─────────────────────────────────────────────────────────────── */

function VerdictBox({ result }: { result: FeeResult }) {
  const { verdict, netValue, totalValue, totalCost, breakEvenExtraMonthly } = result;

  if (verdict === "worth") {
    const multiple = totalCost > 0 ? (totalValue / totalCost).toFixed(1) : "\u221E";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-500/30 p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(74, 222, 128, 0.02))" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Worth It</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This card pays for itself {multiple}&times; over
              {result.feeWaived ? " — and the fee is waived!" : ""}
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            +{formatCur(netValue)}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">net annual value</p>
      </motion.div>
    );
  }

  if (verdict === "not-worth") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-red-500/30 p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(248, 113, 113, 0.02))" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <X className="w-5 h-5 text-red-400" />
              <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">Not Worth It</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {breakEvenExtraMonthly > 0
                ? `Spend ${formatCur(breakEvenExtraMonthly)} more per month to break even`
                : "This card's fee exceeds the value you receive"}
            </p>
          </div>
          <p className="text-2xl font-bold text-red-400 font-mono">
            -{formatCur(Math.abs(netValue))}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">net annual loss</p>
      </motion.div>
    );
  }

  // Break even
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-amber-500/30 p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0.02))" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{"\u2248"}</span>
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Break Even</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The card roughly pays for itself with your current usage
          </p>
        </div>
        <p className="text-2xl font-bold text-amber-400 font-mono">
          {netValue >= 0 ? "+" : "-"}{formatCur(Math.abs(netValue))}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">net annual value</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Results section                                                */
/* ─────────────────────────────────────────────────────────────── */

function ResultsPanel({
  cardId,
  result,
  v3Card,
  v3Data,
  fwData,
  perks,
  detectedPerks,
  spending,
  yearMode,
  cardName,
}: {
  cardId: string;
  result: FeeResult;
  v3Card: CardV3 | undefined;
  v3Data: FeeWorthCalcCard | undefined;
  fwData: FeeWorthCalcCard | undefined;
  perks: PerkState;
  detectedPerks: DetectedPerks;
  spending: SpendMap;
  yearMode: YearMode;
  cardName?: string;
}) {
  const [verdictOpen, setVerdictOpen] = useState(false);
  const {
    rewardEarnings, portalBonus, loungeValue, golfValue,
    diningValue, membershipValue, milestoneValue, renewalBenefit,
    feeWaiverSavings, totalValue, totalCost, effectiveFee, feeWaived, netValue, tips,
  } = result;

  // Build value line items (only show > 0)
  const valueItems: { label: string; value: number; icon: React.ReactNode }[] = [];
  if (rewardEarnings > 0) valueItems.push({ label: "Reward Earnings", value: rewardEarnings, icon: <Wallet className="w-3.5 h-3.5" /> });
  if (portalBonus > 0) valueItems.push({ label: "Portal Bonus", value: portalBonus, icon: <Sparkles className="w-3.5 h-3.5" /> });
  if (loungeValue > 0) valueItems.push({ label: "Lounge Access", value: loungeValue, icon: <Plane className="w-3.5 h-3.5" /> });
  if (golfValue > 0) valueItems.push({ label: "Golf Access", value: golfValue, icon: <Trophy className="w-3.5 h-3.5" /> });
  if (diningValue > 0) valueItems.push({ label: "Dining Program", value: diningValue, icon: <Gift className="w-3.5 h-3.5" /> });
  if (membershipValue > 0) valueItems.push({ label: "Memberships", value: membershipValue, icon: <Star className="w-3.5 h-3.5" /> });
  if (milestoneValue > 0) valueItems.push({ label: "Milestone Benefits", value: milestoneValue, icon: <TrendingUp className="w-3.5 h-3.5" /> });
  if (renewalBenefit > 0) valueItems.push({ label: "Renewal Benefit", value: renewalBenefit, icon: <Gift className="w-3.5 h-3.5" /> });
  if (feeWaiverSavings > 0) valueItems.push({ label: "Fee Waived", value: feeWaiverSavings, icon: <Check className="w-3.5 h-3.5" /> });
  if (result.joiningBonus > 0) valueItems.push({ label: "Welcome Bonus", value: result.joiningBonus, icon: <Gift className="w-3.5 h-3.5" /> });

  // Progress bar ratio
  const barMax = Math.max(totalValue, totalCost, 1);
  const valuePercent = Math.min((totalValue / barMax) * 100, 100);
  const costPercent = Math.min((totalCost / barMax) * 100, 100);

  return (
    <div className="space-y-5">
      {/* Verdict */}
      <VerdictBox result={result} />

      {/* Breakdown columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Value card */}
        <div className="rounded-xl border-l-4 border-emerald-500 bg-card border-t border-r border-b border-border/20 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Value You Get
          </p>
          {valueItems.length === 0 && (
            <p className="text-xs text-muted-foreground">No value items — enable perks or increase spending</p>
          )}
          {valueItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
              <span className="text-foreground font-mono">{formatCur(item.value)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Total Value</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{formatCur(totalValue)}</span>
          </div>
        </div>

        {/* Cost card */}
        <div className="rounded-xl border-l-4 border-red-500 bg-card border-t border-r border-b border-border/20 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3" /> What You Pay
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Annual Fee
            </span>
            {feeWaived ? (
              <span className="flex items-center gap-1.5">
                <span className="text-muted-foreground line-through font-mono">{formatCur(totalCost)}</span>
                <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
                  Waived <Check className="w-3 h-3" />
                </span>
              </span>
            ) : (
              <span className="text-foreground font-mono">{formatCur(totalCost)}</span>
            )}
          </div>
          <div className="pt-2 border-t border-border/20 flex items-center justify-between">
            <span className={`text-xs font-semibold ${effectiveFee <= 0 ? "text-emerald-400" : "text-red-400"}`}>Effective Cost</span>
            {effectiveFee <= 0 ? (
              <span className="text-sm font-bold text-emerald-400 font-mono">
                Card pays you {formatCur(Math.abs(effectiveFee))}/yr
              </span>
            ) : (
              <span className="text-sm font-bold text-red-400 font-mono">{formatCur(effectiveFee)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Value vs Cost bar */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Value vs Cost</p>
        <div className="relative h-6 rounded-full bg-border/20 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-500/70"
            initial={{ width: 0 }}
            animate={{ width: `${valuePercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-red-500/40"
            initial={{ width: 0 }}
            animate={{ width: `${costPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            style={{ zIndex: 0 }}
          />
          {/* Overlay the value bar on top */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-500/70"
            initial={{ width: 0 }}
            animate={{ width: `${valuePercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ zIndex: 1 }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-medium">Value: {formatCur(totalValue)}</span>
          <span className="text-red-400 font-medium">Cost: {formatCur(totalCost)}</span>
        </div>
      </div>

      {/* Fee waiver indicator */}
      {feeWaived && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2"
        >
          <span>{"\u{1F389}"}</span>
          <span className="text-xs text-emerald-400">
            You qualify for fee waiver! Your effective fee is {formatCur(0)}
          </span>
        </motion.div>
      )}

      {/* Break-even chart */}
      <BreakEvenChart
        cardId={cardId}
        v3Card={v3Card}
        fwData={fwData}
        perks={perks}
        detectedPerks={detectedPerks}
        spending={spending}
        yearMode={yearMode}
        waivedOnAnnualSpend={result.waivedOnAnnualSpend}
      />

      {/* Milestone progress */}
      {result.milestoneDetails.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Milestones</p>
          {result.milestoneDetails.map((m, i) => {
            const progress = m.spend > 0 ? Math.min((result.annualSpend / m.spend) * 100, 100) : 0;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={m.unlocked ? "text-emerald-400" : "text-muted-foreground"}>
                    {m.unlocked && <Check className="w-3 h-3 inline mr-1" />}
                    {m.benefit}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px]">{formatCur(m.spend)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.unlocked ? "bg-emerald-500" : "bg-primary/60"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="rounded-xl border border-[#d4a853]/20 p-4 space-y-2" style={{ background: "linear-gradient(135deg, rgba(212, 168, 83, 0.06), transparent)" }}>
          <p className="text-xs font-semibold text-[#d4a853] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            How to get more value
          </p>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ArrowRight className="w-3 h-3 mt-0.5 text-[#d4a853] flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fee waiver progress indicator */}
      {fwData && fwData.feeWaivedOn != null && !result.feeWaived && (
        <div className="rounded-xl bg-card border border-border/20 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Fee waiver progress</span>
            <span className="text-foreground font-mono">{formatCur(result.annualSpend)} / {formatCur(fwData.feeWaivedOn)}</span>
          </div>
          <div className="h-2 rounded-full bg-border/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((result.annualSpend / fwData.feeWaivedOn) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{fwData.waiverText}</p>
        </div>
      )}

      {/* Fuel surcharge & Forex badges */}
      {fwData && (fwData.fuelSurcharge || fwData.forexMarkup) && (
        <div className="flex flex-wrap gap-2">
          {fwData.fuelSurcharge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/20 text-[11px] text-muted-foreground">
              <span>⛽</span> {fwData.fuelSurcharge}
            </span>
          )}
          {fwData.forexMarkup && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/20 text-[11px] text-muted-foreground">
              <span>💱</span> {fwData.forexMarkup}
            </span>
          )}
        </div>
      )}

      {/* Insurance coverage */}
      {fwData && fwData.insurance.length > 0 && (
        <div className="rounded-xl bg-card border border-border/20 p-4 space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
            🛡️ Insurance Coverage
          </p>
          {fwData.insurance.map((ins, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{ins.type}</span>
              <span className="text-foreground font-mono">{ins.cover}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expert Verdict — collapsible */}
      {fwData && fwData.verdict && (
        <div className="rounded-xl border border-border/20 overflow-hidden">
          <button
            onClick={() => setVerdictOpen(!verdictOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/10 transition-colors"
          >
            <span className="text-xs font-semibold text-[#d4a853] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Expert Verdict
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${verdictOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {verdictOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-foreground leading-relaxed">{fwData.verdict}</p>
                  {fwData.pros.length > 0 && (
                    <div>
                      <p className="text-[10px] text-emerald-400 font-semibold mb-1">Pros</p>
                      {fwData.pros.map((pro, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{pro}
                        </p>
                      ))}
                    </div>
                  )}
                  {fwData.cons.length > 0 && (
                    <div>
                      <p className="text-[10px] text-red-400 font-semibold mb-1">Cons</p>
                      {fwData.cons.map((con, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{con}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Break-even chart                                               */
/* ─────────────────────────────────────────────────────────────── */

const CHART_STEPS = Array.from({ length: 21 }, (_, i) => i * 10000); // 0 to 200,000

function BreakEvenChart({
  cardId,
  v3Card,
  fwData,
  perks,
  detectedPerks,
  spending,
  yearMode,
  waivedOnAnnualSpend,
}: {
  cardId: string;
  v3Card: CardV3 | undefined;
  fwData: FeeWorthCalcCard | undefined;
  perks: PerkState;
  detectedPerks: DetectedPerks;
  spending: SpendMap;
  yearMode: YearMode;
  waivedOnAnnualSpend: number | null;
}) {
  const currentMonthly = Object.values(spending).reduce((s, v) => s + v, 0);

  // Compute net value at each monthly spend level
  const chartData = useMemo(() => {
    return CHART_STEPS.map((monthlyTotal) => {
      // Distribute spend proportionally across categories based on current profile
      const total = Object.values(spending).reduce((s, v) => s + v, 0) || 1;
      const scaledSpending: SpendMap = {};
      for (const cat of SPEND_CATEGORIES) {
        scaledSpending[cat.id] = Math.round(((spending[cat.id] || 0) / total) * monthlyTotal);
      }
      const r = calculateFeeWorth(cardId, v3Card, fwData, scaledSpending, perks, detectedPerks, yearMode);
      return {
        monthly: monthlyTotal,
        label: `${formatCur(monthlyTotal)}`,
        netValue: r?.netValue ?? 0,
      };
    });
  }, [v3Card, fwData, spending, perks, detectedPerks, yearMode]);

  // Find break-even point by interpolation
  const breakEvenMonthly = useMemo(() => {
    for (let i = 1; i < chartData.length; i++) {
      const prev = chartData[i - 1];
      const curr = chartData[i];
      if (prev.netValue < 0 && curr.netValue >= 0) {
        // Linear interpolation
        const ratio = Math.abs(prev.netValue) / (Math.abs(prev.netValue) + curr.netValue);
        return Math.round(prev.monthly + ratio * (curr.monthly - prev.monthly));
      }
    }
    // If first point is already positive
    if (chartData.length > 0 && chartData[0].netValue >= 0) return 0;
    return null;
  }, [chartData]);

  const waiverMonthly = waivedOnAnnualSpend != null ? Math.round(waivedOnAnnualSpend / 12) : null;

  const maxAbs = useMemo(() => {
    const vals = chartData.map((d) => Math.abs(d.netValue));
    return Math.max(...vals, 1);
  }, [chartData]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        Break-Even Analysis
      </p>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(74, 222, 128, 0.3)" />
                <stop offset="100%" stopColor="rgba(74, 222, 128, 0.02)" />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(248, 113, 113, 0.3)" />
                <stop offset="100%" stopColor="rgba(248, 113, 113, 0.02)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border) / 0.15)" strokeDasharray="3 3" />
            <XAxis
              dataKey="monthly"
              tickFormatter={(v: number) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v / 1000}K`}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border) / 0.3)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => {
                const abs = Math.abs(v);
                const formatted = abs >= 100000 ? `${(abs / 100000).toFixed(1)}L` : abs >= 1000 ? `${(abs / 1000).toFixed(0)}K` : `${abs}`;
                return v < 0 ? `-${formatted}` : formatted;
              }}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              domain={[-maxAbs * 0.2, maxAbs * 1.1]}
            />
            <RechartsTooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border) / 0.4)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}
              formatter={(value: number) => [formatCur(value), "Net Value"]}
              labelFormatter={(v: number) => `Monthly spend: ${formatCur(v)}`}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border) / 0.5)" strokeDasharray="4 4" />

            {/* Positive area */}
            <Area
              type="monotone"
              dataKey={(d: { netValue: number }) => Math.max(0, d.netValue)}
              stroke="rgb(74, 222, 128)"
              strokeWidth={2}
              fill="url(#posGrad)"
              fillOpacity={1}
              isAnimationActive={false}
              name="Gain"
            />
            {/* Negative area */}
            <Area
              type="monotone"
              dataKey={(d: { netValue: number }) => Math.min(0, d.netValue)}
              stroke="rgb(248, 113, 113)"
              strokeWidth={2}
              fill="url(#negGrad)"
              fillOpacity={1}
              isAnimationActive={false}
              name="Loss"
            />

            {/* Break-even line */}
            {breakEvenMonthly !== null && breakEvenMonthly > 0 && (
              <ReferenceLine
                x={breakEvenMonthly}
                stroke="rgb(251, 191, 36)"
                strokeDasharray="6 3"
                label={{ value: "Break-even", position: "top", fill: "rgb(251, 191, 36)", fontSize: 10 }}
              />
            )}

            {/* Current spend marker */}
            {currentMonthly > 0 && (
              <ReferenceLine
                x={currentMonthly}
                stroke="#d4a853"
                strokeDasharray="4 2"
                strokeWidth={2}
                label={{ value: "You", position: "insideTopRight", fill: "#d4a853", fontSize: 10, fontWeight: 600 }}
              />
            )}

            {/* Fee waiver line */}
            {waiverMonthly != null && waiverMonthly > 0 && (
              <ReferenceLine
                x={waiverMonthly}
                stroke="rgb(74, 222, 128)"
                strokeDasharray="6 3"
                label={{ value: "Fee waived", position: "insideTopLeft", fill: "rgb(74, 222, 128)", fontSize: 10 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {breakEvenMonthly !== null && breakEvenMonthly > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          Break-even at <span className="text-[#d4a853] font-medium">{formatCur(breakEvenMonthly)}/mo</span> monthly spend
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Comparison summary (multi-card)                                */
/* ─────────────────────────────────────────────────────────────── */

function ComparisonSummary({
  selectedCards,
  resultsMap,
}: {
  selectedCards: CardType[];
  resultsMap: Map<string, FeeResult>;
}) {
  if (selectedCards.length < 2) return null;

  const entries = selectedCards
    .map((c) => ({ card: c, result: resultsMap.get(c.id) }))
    .filter((e): e is { card: CardType; result: FeeResult } => e.result != null);

  if (entries.length < 2) return null;

  // Find winner
  const sorted = [...entries].sort((a, b) => b.result.netValue - a.result.netValue);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const diff = winner.result.netValue - runnerUp.result.netValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#d4a853]/30 p-4 mb-5"
      style={{ background: "linear-gradient(135deg, rgba(212, 168, 83, 0.08), rgba(212, 168, 83, 0.02))" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-[#d4a853]" />
        <span className="text-xs font-semibold text-[#d4a853] uppercase tracking-wide">Comparison</span>
      </div>
      <p className="text-sm text-foreground">
        <span className="font-semibold">{winner.card.name}</span> gives you{" "}
        <span className="text-emerald-400 font-mono font-semibold">{formatCur(winner.result.totalValue)}</span>
        {" "}value vs <span className="font-semibold">{runnerUp.card.name}</span>{" "}
        <span className="text-foreground font-mono">{formatCur(runnerUp.result.totalValue)}</span>
        {diff > 0 && (
          <span className="text-[#d4a853]">
            {" "}&mdash; <span className="font-semibold">{winner.card.name}</span> wins by{" "}
            <span className="font-mono font-semibold">{formatCur(diff)}</span>
          </span>
        )}
      </p>

      {/* Side-by-side verdicts */}
      <div className={`grid gap-3 mt-4 ${entries.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        {sorted.map((entry, idx) => {
          const isWinner = idx === 0;
          return (
            <div
              key={entry.card.id}
              className={`rounded-lg border p-3 ${
                isWinner ? "border-[#d4a853]/40 bg-[#d4a853]/5" : "border-border/20 bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {isWinner && <Crown className="w-3.5 h-3.5 text-[#d4a853]" />}
                <span className="text-xs font-medium text-foreground truncate">{entry.card.name}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-muted-foreground">Net value</span>
                <span className={`text-sm font-bold font-mono ${
                  entry.result.netValue >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {entry.result.netValue >= 0 ? "+" : "-"}{formatCur(Math.abs(entry.result.netValue))}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[10px] text-muted-foreground">ROI</span>
                <span className="text-xs font-mono text-foreground">{entry.result.roi.toFixed(1)}x</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Empty state                                                    */
/* ─────────────────────────────────────────────────────────────── */

function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
          <div className="absolute -right-3 -top-2 w-20 h-14 rounded-xl bg-muted/20 border border-border/30 rotate-6" />
          <div className="absolute -left-3 -top-2 w-20 h-14 rounded-xl bg-muted/15 border border-border/20 -rotate-6" />
          <Wallet className="w-8 h-8 text-primary/60 relative z-10" />
        </div>
      </div>
      <p className="text-lg font-serif text-foreground mb-1">Is your card's fee worth it?</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a credit card above to find out if the annual fee is justified based on your spending
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  No V3 data state                                               */
/* ─────────────────────────────────────────────────────────────── */

function NoDataMessage({ cardName }: { cardName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Info className="w-8 h-8 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-foreground mb-1">Detailed analysis not available</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        We don't have enough enrichment data for <span className="font-medium text-foreground">{cardName}</span> yet to compute a reliable fee analysis. Try another card.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main page component                                            */
/* ─────────────────────────────────────────────────────────────── */

export default function FeeWorthCalculator() {
  const isMobile = useIsMobile();
  const { getCardById: getV3Card } = useCardsV3();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [spending, setSpending] = useState<SpendMap>(() => ({ ...PRESETS[0].values }));
  const [activePreset, setActivePreset] = useState("casual");
  const [perksMap, setPerksMap] = useState<Record<string, PerkState>>({});
  const [yearMode, setYearMode] = useState<YearMode>("ongoing");
  const [activePerkTab, setActivePerkTab] = useState<string>("");

  useEffect(() => {
    console.log(`[FeeWorthCalc] ${Object.keys(feeworthCalcData).length} cards loaded`);
  }, []);

  // Resolve V3 data for each selected card
  const cardDataMap = useMemo(() => {
    const map = new Map<string, { v3Card: CardV3 | undefined; v3Data: FeeWorthCalcCard | undefined; detected: DetectedPerks; hasV3: boolean }>();
    for (const card of selectedCards) {
      const v3Card = getV3Card(card.id);
      const v3Data = feeworthCalcData[card.id];
      if (!v3Data) console.warn(`[FeeWorthCalc] No data for card: ${card.id}`);
      const detected = detectPerks(v3Card, v3Data);
      map.set(card.id, { v3Card, v3Data, detected, hasV3: v3Card != null || v3Data != null });
    }
    return map;
  }, [selectedCards, getV3Card]);

  // Calculate results for all cards
  const resultsMap = useMemo(() => {
    const map = new Map<string, FeeResult>();
    for (const card of selectedCards) {
      const data = cardDataMap.get(card.id);
      if (!data || !data.hasV3) continue;
      const cardPerks = perksMap[card.id] ?? DEFAULT_PERKS;
      const r = calculateFeeWorth(card.id, data.v3Card, data.v3Data, spending, cardPerks, data.detected, yearMode);
      if (r) map.set(card.id, r);
    }
    return map;
  }, [selectedCards, cardDataMap, spending, perksMap, yearMode]);

  // For backward compatibility: primary card is the first selected
  const selectedCard = selectedCards.length > 0 ? selectedCards[0] : null;
  const primaryData = selectedCard ? cardDataMap.get(selectedCard.id) : undefined;
  const v3Card = primaryData?.v3Card;
  const v3Data = primaryData?.v3Data;
  const hasV3 = primaryData?.hasV3 ?? false;
  const detectedPerks = primaryData?.detected ?? detectPerks(undefined, undefined);
  const result = selectedCard ? resultsMap.get(selectedCard.id) ?? null : null;

  // Active perk tab defaults to first selected card
  const effectivePerkTab = activePerkTab && selectedCards.some((c) => c.id === activePerkTab) ? activePerkTab : selectedCard?.id ?? "";

  const totalMonthly = useMemo(
    () => Object.values(spending).reduce((s, v) => s + v, 0),
    [spending],
  );

  // Handlers
  const handlePreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setSpending({ ...preset.values });
  }, []);

  const handleCatChange = useCallback((catId: string, val: number) => {
    setActivePreset("");
    setSpending((prev) => ({ ...prev, [catId]: val }));
  }, []);

  const handlePerksChange = useCallback((cardId: string, partial: Partial<PerkState>) => {
    setPerksMap((prev) => ({
      ...prev,
      [cardId]: { ...(prev[cardId] ?? DEFAULT_PERKS), ...partial },
    }));
  }, []);

  const handleAddCard = useCallback((card: CardType) => {
    setSelectedCards((prev) => {
      if (prev.length >= 3 || prev.some((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
    setPerksMap((prev) => ({ ...prev, [card.id]: { ...DEFAULT_PERKS } }));
    setActivePerkTab((prev) => prev || card.id);
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    setSelectedCards((prev) => prev.filter((c) => c.id !== id));
    setPerksMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActivePerkTab("");
  }, []);

  if (isMobile) {
    return (
      <PageLayout>
        <SEO title="Fee Worth Calculator" description="Find out if your credit card's annual fee is justified." path="/tools/fee-worth" />
        <MobileFeeWorthCalc
          selectedCards={selectedCards}
          spending={spending}
          totalMonthly={totalMonthly}
          activePreset={activePreset}
          perksMap={perksMap}
          cardDataMap={cardDataMap}
          resultsMap={resultsMap}
          yearMode={yearMode}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onCatChange={handleCatChange}
          onPreset={handlePreset}
          onPerksChange={handlePerksChange}
          onYearModeToggle={() => setYearMode(m => m === "first-year" ? "ongoing" : "first-year")}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title="Fee Worth Calculator"
        description="Find out if your credit card's annual fee is justified. Calculate the true value of rewards, perks, and milestones vs what you pay."
        path="/tools/fee-worth"
      />

      <div className="container max-w-6xl mx-auto px-4 pt-6 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span>Tools</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Fee Worth Calculator</span>
        </nav>

        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif gold-gradient mb-1">
            Fee Worth Calculator
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Is your card's annual fee justified? Enter your spending and perks to find out.
          </p>
        </div>

        {/* Card selector — full width */}
        <div className="mb-6">
          <CardSelector
            selectedCards={selectedCards}
            onAdd={handleAddCard}
            onRemove={handleRemoveCard}
            maxCards={3}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[45fr_55fr] gap-6">
          {/* Left column: spending + perks */}
          <div className="space-y-6">
            {/* Spending inputs */}
            <div className="space-y-4">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">
                Monthly Spending
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Spending presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePreset(p)}
                    aria-pressed={activePreset === p.id}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                      activePreset === p.id
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                        : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Category rows */}
              <div>
                {SPEND_CATEGORIES.map((cat) => (
                  <SpendingRow
                    key={cat.id}
                    cat={cat}
                    value={spending[cat.id] || 0}
                    onChange={(v) => handleCatChange(cat.id, v)}
                  />
                ))}
              </div>

              {/* Total */}
              <div className="rounded-xl p-4 border-2 border-primary/20 bg-primary/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Total Monthly Spend</span>
                  <span className="text-lg font-bold text-primary font-mono" aria-live="polite">
                    {formatCur(totalMonthly)}
                  </span>
                </div>
              </div>
            </div>

            {/* Perk toggles — only when card(s) selected and has V3 data */}
            <AnimatePresence>
              {selectedCards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-3"
                >
                  {/* Tabs for multi-card perk switching */}
                  {selectedCards.length > 1 && (
                    <div className="flex gap-1 bg-card rounded-lg p-1 border border-border/30">
                      {selectedCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => setActivePerkTab(card.id)}
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all truncate ${
                            effectivePerkTab === card.id
                              ? "bg-primary/15 text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {card.name.length > 20 ? card.name.slice(0, 18) + "\u2026" : card.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {(() => {
                    const tabCard = selectedCards.find((c) => c.id === effectivePerkTab) ?? selectedCards[0];
                    if (!tabCard) return null;
                    const data = cardDataMap.get(tabCard.id);
                    if (!data?.hasV3) return null;
                    return (
                      <PerkToggles
                        cardId={tabCard.id}
                        detected={data.detected}
                        perks={perksMap[tabCard.id] ?? DEFAULT_PERKS}
                        onPerksChange={(partial) => handlePerksChange(tabCard.id, partial)}
                      />
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column: results (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-hide">
            <div className="glass-card rounded-2xl border border-border/30 p-6">
              {/* Year-1 / Ongoing toggle */}
              {selectedCards.length > 0 && (
                <div className="flex bg-card rounded-lg p-1 border border-border/30 mb-5">
                  <button
                    onClick={() => setYearMode("first-year")}
                    className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                      yearMode === "first-year"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    First Year
                  </button>
                  <button
                    onClick={() => setYearMode("ongoing")}
                    className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                      yearMode === "ongoing"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Ongoing
                  </button>
                </div>
              )}

              {/* Comparison summary for multi-card */}
              {selectedCards.length >= 2 && (
                <ComparisonSummary selectedCards={selectedCards} resultsMap={resultsMap} />
              )}

              <AnimatePresence mode="wait">
                {selectedCards.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyResults />
                  </motion.div>
                )}

                {selectedCard && !hasV3 && selectedCards.length === 1 && (
                  <motion.div
                    key="no-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <NoDataMessage cardName={selectedCard.name} />
                  </motion.div>
                )}

                {selectedCards.length >= 1 && (
                  <motion.div
                    key={`results-${selectedCards.map((c) => c.id).join("-")}-${yearMode}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {selectedCards.map((card) => {
                      const data = cardDataMap.get(card.id);
                      const cardResult = resultsMap.get(card.id);
                      if (!data?.hasV3 || !cardResult) {
                        return (
                          <div key={card.id}>
                            {selectedCards.length > 1 && (
                              <p className="text-xs font-semibold text-muted-foreground mb-2">{card.name}</p>
                            )}
                            <NoDataMessage cardName={card.name} />
                          </div>
                        );
                      }
                      return (
                        <div key={card.id}>
                          {selectedCards.length > 1 && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
                              <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
                                {card.image ? (
                                  <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                                ) : (
                                  <div className="w-full h-full" style={{ background: card.color }} />
                                )}
                              </div>
                              <span className="text-xs font-semibold text-foreground">{card.name}</span>
                            </div>
                          )}
                          <ResultsPanel
                            cardId={card.id}
                            result={cardResult}
                            v3Card={data.v3Card}
                            v3Data={data.v3Data}
                            fwData={data.v3Data}
                            perks={perksMap[card.id] ?? DEFAULT_PERKS}
                            detectedPerks={data.detected}
                            spending={spending}
                            yearMode={yearMode}
                            cardName={card.name}
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
