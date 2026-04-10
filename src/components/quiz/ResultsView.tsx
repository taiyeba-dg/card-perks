import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw, CreditCard, Sparkles, Star, ChevronRight } from "lucide-react";
import CardImage from "@/components/CardImage";
import MatchRing from "./MatchRing";
import { getResults, normalizeResults } from "./scoring";
import type { Answers } from "./quizData";

export default function ResultsView({ answers, onRetake }: { answers: Answers; onRetake: () => void }) {
  const raw = getResults(answers);
  const results = normalizeResults(raw);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-4"
        >
          <Sparkles className="w-6 h-6 text-gold" />
        </motion.div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Your Top Matches</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Based on your answers, here are the cards that fit your lifestyle best.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {results.map(({ card, matchPct }, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {i === 0 && (
              <div className="h-1 w-full bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
            )}
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div className="w-20 flex-shrink-0 aspect-[16/10]">
                <CardImage src={card.image ?? ""} alt={card.name} fallbackColor={card.color} className="rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold mb-1">
                        <Star className="w-2.5 h-2.5 fill-gold" /> Best Match
                      </span>
                    )}
                    <h3 className="font-semibold text-sm leading-snug">{card.name}</h3>
                    <p className="text-xs text-muted-foreground">{card.issuer} · {card.type}</p>
                  </div>
                  <MatchRing pct={matchPct} delay={i * 0.15 + 0.3} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">{card.fee}/yr</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">{card.rewards}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">Lounge: {card.lounge}</span>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-4">
              <Link
                to={`/cards/${card.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gold/30 text-gold text-xs font-semibold hover:bg-gold/10 transition-colors duration-150"
              >
                View Full Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetake}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors duration-150"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <Link
          to="/cards"
          className="flex-1 gold-btn flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        >
          <CreditCard className="w-4 h-4" /> Browse All Cards
        </Link>
      </div>
    </motion.div>
  );
}
