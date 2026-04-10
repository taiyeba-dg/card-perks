import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { CompareCard } from "../CompareUtils";
import { findWinner, parseFee, parsePercent } from "../CompareUtils";
import DeepLinkCTA, { DeepLinkGroup } from "@/components/DeepLinkCTA";

interface Props { compareCards: CompareCard[]; }

function generateMetrics(compareCards: CompareCard[]) {
  const metrics: { label: string; category: string; values: { cardId: string; value: number }[]; direction: "highest" | "lowest" }[] = [];
  const add = (label: string, category: string, direction: "highest" | "lowest", getValue: (cc: CompareCard) => number) => {
    metrics.push({ label, category, direction, values: compareCards.map((cc) => ({ cardId: cc.card.id, value: getValue(cc) })) });
  };

  add("Annual Fee", "fees", "lowest", (cc) => parseFee(cc.card.fee));
  add("Base Reward Rate", "rewards", "highest", (cc) => cc.v3?.baseRate ?? parsePercent(cc.card.rewards));
  add("Best Point Value", "redemption", "highest", (cc) => cc.v3?.redemption.baseValue ?? 0);
  add("Transfer Partners", "redemption", "highest", (cc) => cc.v3?.redemption.transferPartners.length ?? 0);
  add("Lounge Access", "lounge", "highest", (cc) => cc.card.lounge === "Unlimited" ? 999 : parseInt(cc.card.lounge) || 0);
  add("Forex Markup", "features", "lowest", (cc) => parsePercent(cc.card.forexMarkup));
  add("Rating", "overview", "highest", (cc) => cc.card.rating);
  add("Effective Fee", "fees", "lowest", (cc) => parseFee(cc.card.fee) - (cc.v3?.fees.renewalBenefitValue ?? 0));
  add("Fee Waiver Threshold", "fees", "lowest", (cc) => cc.v3?.fees.waivedOn ?? 999999999);
  add("Insurance Count", "features", "highest", (cc) => cc.card.insurance.length);
  add("Perks Count", "features", "highest", (cc) => cc.card.perks.length);
  add("Milestone Bonuses", "rewards", "highest", (cc) => cc.v3?.milestones.reduce((a, m) => a + m.benefitValue, 0) ?? 0);

  // Category-wise rewards wins
  const allCats = new Set<string>();
  compareCards.forEach(({ v3 }) => { if (v3) Object.keys(v3.categories).forEach((k) => allCats.add(k)); });
  allCats.forEach((cat) => {
    add(`${cat} rate`, "rewards", "highest", (cc) => cc.v3?.categories[cat]?.rate ?? 0);
  });

  return metrics;
}

export default function VerdictTab({ compareCards }: Props) {
  const analysis = useMemo(() => {
    const metrics = generateMetrics(compareCards);

    // Count wins
    const wins: Record<string, number> = {};
    compareCards.forEach((cc) => (wins[cc.card.id] = 0));
    const totalMetrics = metrics.length;

    metrics.forEach(({ values, direction }) => {
      const w = findWinner(values, direction);
      if (w) wins[w]++;
    });

    // Sort by win count
    const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
    const winnerId = sorted[0][0];
    const winner = compareCards.find((cc) => cc.card.id === winnerId)!;

    // Best-for categories
    const bestFor: { category: string; cardId: string; detail: string }[] = [];
    const catMetrics = metrics.filter((m) => m.category === "rewards" && m.label.includes("rate"));
    const diningWinner = catMetrics.find((m) => m.label === "dining rate");
    if (diningWinner) {
      const w = findWinner(diningWinner.values, "highest");
      if (w) {
        const cc = compareCards.find((c) => c.card.id === w)!;
        bestFor.push({ category: "Dining", cardId: w, detail: `${cc.v3?.categories.dining?.rate ?? "?"}% rate` });
      }
    }
    const travelWinner = catMetrics.find((m) => m.label === "travel rate");
    if (travelWinner) {
      const w = findWinner(travelWinner.values, "highest");
      if (w) {
        const cc = compareCards.find((c) => c.card.id === w)!;
        bestFor.push({ category: "Travel", cardId: w, detail: `${cc.v3?.categories.travel?.rate ?? "?"}% rate` });
      }
    }
    const feeWinner = findWinner(compareCards.map((cc) => ({ cardId: cc.card.id, value: parseFee(cc.card.fee) })), "lowest");
    if (feeWinner) {
      const cc = compareCards.find((c) => c.card.id === feeWinner)!;
      bestFor.push({ category: "Low Fees", cardId: feeWinner, detail: cc.card.fee + "/yr" });
    }
    const forexWinner = findWinner(compareCards.map((cc) => ({ cardId: cc.card.id, value: parsePercent(cc.card.forexMarkup) })), "lowest");
    if (forexWinner) {
      const cc = compareCards.find((c) => c.card.id === forexWinner)!;
      bestFor.push({ category: "Forex", cardId: forexWinner, detail: cc.card.forexMarkup });
    }

    // Break-even estimate for winner
    const winnerFee = parseFee(winner.card.fee);
    const winnerRate = winner.v3?.baseRate ?? parsePercent(winner.card.rewards);
    const winnerBaseValue = winner.v3?.redemption.baseValue ?? 0.25;
    const breakEvenMonthly = winnerRate > 0 ? Math.round(winnerFee / (winnerRate / 100 * 12 * winnerBaseValue)) : 0;

    return { wins, sorted, totalMetrics, winnerId, winner, bestFor, breakEvenMonthly };
  }, [compareCards]);

  const { wins, sorted, totalMetrics, winner, bestFor, breakEvenMonthly } = analysis;
  const totalWins = Object.values(wins).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Win count bar */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-3">Category Win Count</h3>
        <div className="h-6 rounded-full overflow-hidden flex bg-secondary/20">
          {sorted.map(([cardId, count]) => {
            const cc = compareCards.find((c) => c.card.id === cardId)!;
            const pct = totalWins > 0 ? (count / totalWins) * 100 : 0;
            return (
              <motion.div
                key={cardId}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-full flex items-center justify-center text-[9px] font-bold text-background"
                style={{ background: cc.card.color === "#0D0D0D" ? "hsl(var(--gold))" : cc.card.color, minWidth: pct > 5 ? "auto" : 0 }}
              >
                {pct > 10 && count}
              </motion.div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {sorted.map(([cardId, count]) => {
            const cc = compareCards.find((c) => c.card.id === cardId)!;
            return (
              <span key={cardId} className="text-[10px] text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: cc.card.color === "#0D0D0D" ? "hsl(var(--gold))" : cc.card.color }} />
                {cc.card.name.split(" ").slice(-2).join(" ")}: <span className="font-semibold text-foreground">{count}</span>/{totalMetrics}
              </span>
            );
          })}
        </div>
      </div>

      {/* Best for */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-3">Best For...</h3>
        <div className="space-y-2">
          {bestFor.map((bf) => {
            const cc = compareCards.find((c) => c.card.id === bf.cardId)!;
            return (
              <div key={bf.category} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Best for {bf.category}:</span>
                <span className="font-semibold text-gold">{cc.card.name}</span>
                <span className="text-muted-foreground/60">({bf.detail})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall verdict */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border-2 border-gold/30 bg-gold/[0.03] p-6 text-center"
      >
        <Trophy className="w-10 h-10 text-gold mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold mb-2">
          🏆 {winner.card.name} wins overall
        </h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Leads in <span className="text-gold font-semibold">{wins[winner.card.id]}</span> of {totalMetrics} comparison points
          including rewards, {winner.card.lounge === "Unlimited" ? "lounge," : ""} and value.
          {breakEvenMonthly > 0 && (
            <> The {winner.card.fee} fee pays for itself at ₹{breakEvenMonthly.toLocaleString("en-IN")}/month spending.</>
          )}
        </p>
        {sorted.length > 1 && (() => {
          const runnerUp = compareCards.find((c) => c.card.id === sorted[1][0])!;
          return (
            <p className="text-xs text-muted-foreground/60 mt-2">
              Consider <span className="text-foreground font-medium">{runnerUp.card.name}</span> if you value{" "}
              {bestFor.filter((bf) => bf.cardId === runnerUp.card.id).map((bf) => bf.category.toLowerCase()).join(" or ") || "a different balance of features"}.
            </p>
          );
        })()}
      </motion.div>

      {/* Cross-page deep links */}
      <DeepLinkGroup>
        <DeepLinkCTA to="/find-my-card" emoji="📱" title="Not sure what to compare? Find your ideal card" />
        <DeepLinkCTA to="/find-my-card" emoji="📱" title="Not sure what to compare? Find your ideal card" />
      </DeepLinkGroup>
    </div>
  );
}
