import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Target, Trophy, ArrowRight, Wallet } from "lucide-react";
import { useMyCards } from "@/hooks/use-my-cards";
import CardImage from "@/components/CardImage";

export default function PersonalizedHomeSummary() {
  const { count, myCardObjects, estimatedAnnualValue, feeWaiverStatus } = useMyCards();

  const onTrackCount = feeWaiverStatus.filter((s) => s.onTrack).length;
  const totalWaiver = feeWaiverStatus.length;

  // Find next milestone
  const nextMilestone = useMemo(() => {
    for (const entry of myCardObjects) {
      if (!entry.v3) continue;
      const spent = entry.annualSpendSoFar ?? 0;
      for (const ms of entry.v3.milestones) {
        if (spent < ms.spend) {
          return { cardName: entry.card.name, remaining: ms.spend - spent, benefit: ms.benefit };
        }
      }
    }
    return null;
  }, [myCardObjects]);

  if (count === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-gold/15 p-5 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-gold" />
            <p className="text-sm text-muted-foreground">Welcome back! Here's your wallet at a glance:</p>
          </div>

          {/* Card thumbnails */}
          <div className="flex gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
            {myCardObjects.map((entry, i) => (
              <motion.div
                key={entry.cardId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/cards/${entry.cardId}`} className="group flex-shrink-0">
                  <div className="w-20 sm:w-24 aspect-[5/3] rounded-xl overflow-hidden shadow-lg shadow-black/30 group-hover:shadow-gold/20 group-hover:-translate-y-0.5 transition-all">
                    {entry.card.image ? (
                      <CardImage src={entry.card.image} alt={entry.card.name} fallbackColor={entry.card.color} />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${entry.card.color}, ${entry.card.color}88)` }} />
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center mt-1.5 truncate max-w-[96px]">
                    {entry.card.name.split(" ").slice(-2).join(" ")}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary/20 p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-gold" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. Annual Value</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gold">₹{estimatedAnnualValue.toLocaleString("en-IN")}</p>
            </div>

            {totalWaiver > 0 && (
              <div className="rounded-xl bg-secondary/20 p-3 sm:p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-gold" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fee Waiver</p>
                </div>
                <p className="text-lg sm:text-xl font-bold">
                  <span className="text-green-400">{onTrackCount}</span>
                  <span className="text-muted-foreground text-sm"> of {totalWaiver} on track</span>
                </p>
              </div>
            )}

            {nextMilestone && (
              <div className="rounded-xl bg-secondary/20 p-3 sm:p-4 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-gold" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Milestone</p>
                </div>
                <p className="text-sm font-medium">
                  ₹{nextMilestone.remaining.toLocaleString("en-IN")} away
                  <span className="text-[10px] text-muted-foreground block">on {nextMilestone.cardName.split(" ").slice(-2).join(" ")}</span>
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-5">
            <Link to="/my-cards" className="gold-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              My Cards Dashboard <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/optimize-stack" className="px-4 py-2 rounded-xl text-xs font-medium border border-border/30 hover:border-gold/30 transition-colors text-muted-foreground hover:text-gold">
              Optimize Stack →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
