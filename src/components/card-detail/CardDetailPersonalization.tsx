import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Target, ArrowUpRight, GitCompareArrows } from "lucide-react";
import { useMyCards } from "@/hooks/use-my-cards";
import type { CreditCard } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";


interface Props {
  card: CreditCard;
  v3: CardV3Data | null;
}

export default function CardDetailPersonalization({ card, v3 }: Props) {
  const { has, myCardObjects } = useMyCards();
  const isOwned = has(card.id);

  // Find the user's entry for this card
  const myEntry = myCardObjects.find((e) => e.cardId === card.id);

  // Check if this card is an upgrade from one of user's cards
  const upgradeFrom = useMemo(() => {
    if (!v3 || isOwned) return null;
    for (const entry of myCardObjects) {
      if (entry.v3?.upgradeToId === card.id) {
        return entry;
      }
    }
    return null;
  }, [v3, isOwned, myCardObjects, card.id]);

  // Check if user owns a competing card (same type/tier)
  const competitor = useMemo(() => {
    if (isOwned) return null;
    return myCardObjects.find(
      (e) => e.cardId !== card.id && (e.card.type === card.type || (v3?.relatedCardIds.includes(e.cardId) ?? false))
    ) ?? null;
  }, [isOwned, myCardObjects, card, v3]);

  if (myCardObjects.length === 0) return null;

  if (isOwned && myEntry) {
    const monthlySpend = myEntry.monthlySpend ?? 0;
    const rate = v3?.baseRate ?? 1;
    const baseValue = v3?.redemption.baseValue ?? 0.25;
    const monthlyEarning = Math.round(monthlySpend * (rate / 100) * baseValue);
    const feeThreshold = v3?.fees.waivedOn;
    const annualSpent = myEntry.annualSpendSoFar ?? 0;
    const feeProgress = feeThreshold ? Math.min((annualSpent / feeThreshold) * 100, 100) : 0;
    const points = myEntry.currentPoints;
    const pointsBestValue = points ? Math.round(points * (v3?.redemption.baseValue ?? 0.25)) : null;
    const pointsWorstValue = points && v3?.redemption.options.length
      ? Math.round(points * v3.redemption.options[v3.redemption.options.length - 1].value)
      : null;

    // Find next milestone
    const nextMs = v3?.milestones.find((m) => annualSpent < m.spend);
    const msRemaining = nextMs ? nextMs.spend - annualSpent : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-4 sm:p-5 mb-6"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400 mb-3">✅ YOUR STATS WITH THIS CARD</p>
        <div className="grid grid-cols-2 gap-3">
          {monthlySpend > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground">Monthly earning</p>
              <p className="text-sm font-semibold text-gold">~₹{monthlyEarning.toLocaleString("en-IN")}</p>
              <p className="text-[9px] text-muted-foreground/60">at ₹{monthlySpend.toLocaleString("en-IN")}/mo</p>
            </div>
          )}
          {feeThreshold && (
            <div>
              <p className="text-[10px] text-muted-foreground">Fee waiver</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${feeProgress}%` }} />
                </div>
                <span className="text-[10px] font-medium">{Math.round(feeProgress)}%</span>
              </div>
            </div>
          )}
          {nextMs && msRemaining && (
            <div>
              <p className="text-[10px] text-muted-foreground">Next milestone</p>
              <p className="text-sm font-medium">₹{msRemaining.toLocaleString("en-IN")} away</p>
              <p className="text-[9px] text-muted-foreground/60">{nextMs.benefit}</p>
            </div>
          )}
          {points && (
            <div>
              <p className="text-[10px] text-muted-foreground">Points balance</p>
              <p className="text-sm font-semibold">{points.toLocaleString("en-IN")} {v3?.redemption.pointCurrency?.split(" ").pop()}</p>
              {pointsBestValue && pointsWorstValue && (
                <p className="text-[9px] text-muted-foreground/60">
                  worth ₹{pointsWorstValue.toLocaleString("en-IN")} – ₹{pointsBestValue.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (upgradeFrom) {
    const currentRate = upgradeFrom.v3?.baseRate ?? 0;
    const newRate = v3?.baseRate ?? 0;
    const spend = upgradeFrom.monthlySpend ?? 30000;
    const currentBaseValue = upgradeFrom.v3?.redemption.baseValue ?? 0.25;
    const newBaseValue = v3?.redemption.baseValue ?? 0.25;
    const currentAnnual = Math.round(spend * (currentRate / 100) * 12 * currentBaseValue);
    const newAnnual = Math.round(spend * (newRate / 100) * 12 * newBaseValue);
    const diff = newAnnual - currentAnnual;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-gold/20 bg-gold/[0.03] p-4 sm:p-5 mb-6"
      >
        <div className="flex items-start gap-2">
          <ArrowUpRight className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              ⬆️ This is an upgrade from your <span className="text-gold font-semibold">{upgradeFrom.card.name}</span>
            </p>
            {diff > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                At your spending, you'd earn <span className="text-green-400 font-semibold">₹{diff.toLocaleString("en-IN")}/year MORE</span> with this card.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (competitor) {
    const compRate = competitor.v3?.baseRate ?? 0;
    const thisRate = v3?.baseRate ?? 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-border/30 p-4 sm:p-5 mb-6"
      >
        <div className="flex items-start gap-2">
          <GitCompareArrows className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">
              You have <span className="font-semibold">{competitor.card.name}</span>.
              {thisRate > compRate
                ? <span> This card earns <span className="text-green-400 font-semibold">more</span> on base rate ({thisRate}% vs {compRate}%).</span>
                : thisRate < compRate
                ? <span> Your card earns <span className="text-gold font-semibold">more</span> on base rate ({compRate}% vs {thisRate}%).</span>
                : <span> Both have similar base rates.</span>
              }
            </p>
            <Link
              to={`/compare?cards=${competitor.cardId},${card.id}`}
              className="text-xs text-gold hover:text-gold/80 transition-colors font-medium mt-1 inline-flex items-center gap-1"
            >
              Compare them → <GitCompareArrows className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
