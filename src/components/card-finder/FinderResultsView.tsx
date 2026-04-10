import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw, CreditCard, ChevronRight, Trophy, TrendingUp, ChevronDown, AlertTriangle } from "lucide-react";
import CardImage from "@/components/CardImage";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import MatchRing from "@/components/quiz/MatchRing";
import type { FinderResult } from "./finderScoring";
import DeepLinkCTA, { DeepLinkGroup } from "@/components/DeepLinkCTA";

interface Props {
  eligible: FinderResult[];
  aspirational: FinderResult[];
  onRetake: () => void;
}

function ValueRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-primary text-sm" : "font-medium"} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value < 0 ? "-" : ""}{"\u20B9"}{Math.abs(value).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function ResultCard({ result, rank }: { result: FinderResult; rank: number }) {
  const isTop = rank === 1;
  const [expanded, setExpanded] = useState(isTop);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.12 + 0.2, duration: 0.4 }}
      className={`glass-card rounded-2xl overflow-hidden ${isTop ? "ring-1 ring-primary/30" : ""}`}
    >
      {isTop && <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`relative w-20 sm:w-24 flex-shrink-0 ${isTop ? "transform rotate-[-3deg]" : ""}`}>
            {isTop && <div className="absolute inset-0 rounded-lg gold-glow opacity-40" />}
            <div className="aspect-[16/10]">
              <CardImage src={result.card.image ?? ""} alt={result.card.name} fallbackColor={result.card.color} className="rounded-lg" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {isTop && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary mb-1">
                    <Trophy className="w-2.5 h-2.5" /> Best Match
                  </span>
                )}
                {!isTop && <span className="text-[10px] font-medium text-muted-foreground">#{rank}</span>}
                <h3 className="font-semibold text-sm leading-snug">{result.card.name}</h3>
                <p className="text-xs text-muted-foreground">{result.card.issuer} &middot; {result.card.type}</p>
              </div>
              <MatchRing pct={result.matchScore} delay={rank * 0.12 + 0.3} />
            </div>
            {isTop && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">Save </span>
                <AnimatedCounter value={result.netValue} className="text-lg font-bold text-primary" />
                <span className="text-xs text-muted-foreground">/year</span>
              </div>
            )}
          </div>
        </div>

        {!isTop && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="text-xs text-muted-foreground">Annual value:</span>
            <span className="text-sm font-bold text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
              {"\u20B9"}{result.netValue.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 w-full">
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Why this card?
        </button>

        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="rounded-xl bg-secondary/20 p-3 space-y-1.5 mb-4">
              <ValueRow label="Rewards Earned" value={result.rewardsValue} />
              {result.milestoneValue > 0 && <ValueRow label="Milestone Bonuses" value={result.milestoneValue} />}
              {result.renewalBonusValue > 0 && <ValueRow label="Renewal Bonus" value={result.renewalBonusValue} />}
              {result.featureValue > 0 && <ValueRow label="Feature Savings" value={result.featureValue} />}
              <div className="border-t border-border/20 my-1.5" />
              <ValueRow label="Total Value" value={result.totalValue} />
              <ValueRow label={`Fee${result.effectiveFee === 0 && result.annualFee > 0 ? " (waived)" : ""}`} value={-result.effectiveFee} />
              <div className="border-t border-border/20 my-1.5" />
              <ValueRow label="NET VALUE" value={result.netValue} highlight />
            </div>
            <div className="space-y-1 mb-3">
              {result.reasons.slice(0, 4).map((reason, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="flex-shrink-0">{reason.startsWith("\u26A0") ? "" : "\u2705"}</span>
                  {reason}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {result.devaluationWarning && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/90">Recent change: {result.devaluationWarning}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Link to={`/cards/${result.card.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors">
            View Details <ChevronRight className="w-3 h-3" />
          </Link>
          {isTop && (
            <Link to={`/compare?cards=${result.card.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              Compare &rarr;
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FinderResultsView({ eligible, aspirational, onRetake }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
        </motion.div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Your Perfect Card Match</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">Ranked by real annual value based on your spending</p>
      </div>

      <div className="space-y-4 mb-8">
        {eligible.map((result, i) => (
          <ResultCard key={result.card.id} result={result} rank={i + 1} />
        ))}
      </div>

      {aspirational.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Worth Aspiring To</p>
          <div className="space-y-3 opacity-70">
            {aspirational.map((result) => (
              <div key={result.card.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div className="w-14 aspect-[16/10] flex-shrink-0">
                  <CardImage src={result.card.image ?? ""} alt={result.card.name} fallbackColor={result.card.color} className="rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.card.name}</p>
                  <p className="text-[10px] text-muted-foreground">{result.ineligibleReason}</p>
                </div>
                <p className="text-xs text-primary font-semibold flex-shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {"\u20B9"}{result.netValue.toLocaleString("en-IN")}/yr
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {eligible.length >= 2 && (
        <DeepLinkGroup className="mb-6">
          <DeepLinkCTA
            to={`/compare?cards=${eligible[0].card.id},${eligible[1].card.id}`}
            emoji={"\u2694\uFE0F"}
            title="Compare #1 and #2 head to head"
            subtitle={`${eligible[0].card.name} vs ${eligible[1].card.name}`}
          />
        </DeepLinkGroup>
      )}

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onRetake} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
          <Link to="/cards" className="flex-1 gold-btn flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold">
            <CreditCard className="w-4 h-4" /> Browse All Cards
          </Link>
        </div>
        <DeepLinkGroup className="mt-3">
          <DeepLinkCTA to="/optimize-stack" emoji={"\uD83D\uDCCA"} title="Already have cards? Optimize your stack instead" />
        </DeepLinkGroup>
      </div>
    </motion.div>
  );
}
