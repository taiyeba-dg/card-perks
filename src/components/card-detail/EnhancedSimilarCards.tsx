import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import CardImage from "@/components/CardImage";
import type { CreditCard as CardType } from "@/data/cards";

interface Props {
  card: CardType;
  similarCards: CardType[];
}

function generateComparison(current: CardType, other: CardType): { pro: string; con: string } {
  let pro = "";
  let con = "";

  const currentFee = parseInt(current.fee.replace(/[₹,]/g, "")) || 0;
  const otherFee = parseInt(other.fee.replace(/[₹,]/g, "")) || 0;
  const currentRewards = parseFloat(current.rewards) || 0;
  const otherRewards = parseFloat(other.rewards) || 0;

  // Pro
  if (otherRewards > currentRewards) pro = `Higher rewards (${other.rewards})`;
  else if (other.lounge === "Unlimited" && current.lounge !== "Unlimited") pro = "Unlimited lounge access";
  else if (otherFee < currentFee) pro = `Lower fee (${other.fee})`;
  else if (parseFloat(other.forexMarkup) < parseFloat(current.forexMarkup)) pro = `Lower forex (${other.forexMarkup})`;
  else pro = `${other.type} tier card`;

  // Con
  if (otherFee > currentFee) con = `Higher fee (+₹${(otherFee - currentFee).toLocaleString("en-IN")})`;
  else if (otherRewards < currentRewards) con = `Lower rewards (${other.rewards})`;
  else if (other.lounge !== "Unlimited" && current.lounge === "Unlimited") con = `Limited lounge (${other.lounge})`;
  else if (parseFloat(other.forexMarkup) > parseFloat(current.forexMarkup)) con = `Higher forex (${other.forexMarkup})`;
  else con = "Different reward structure";

  return { pro, con };
}

export default function EnhancedSimilarCards({ card, similarCards }: Props) {
  return (
    <div className="mb-24">
      <h3 className="font-serif text-lg font-semibold mb-4">Similar & Competing Cards</h3>

      {/* Desktop grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {similarCards.map((c, i) => {
          const { pro, con } = generateComparison(card, c);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-secondary/20">
                {c.image ? (
                  <CardImage src={c.image} alt={`${c.name} credit card`} fallbackColor={c.color} />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}66)` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <h4 className="font-serif font-bold text-xs">{c.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{c.issuer}</p>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Fee: {c.fee}</span>
                  <span>Rate: {c.rewards}</span>
                </div>
                <div className="flex items-start gap-1.5 text-[10px]">
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-green-400">{pro}</span>
                </div>
                <div className="flex items-start gap-1.5 text-[10px]">
                  <X className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-red-400">{con}</span>
                </div>
                <Link
                  to={`/compare?cards=${card.id},${c.id}`}
                  className="flex items-center justify-center gap-1 py-1.5 mt-1 rounded-lg border border-gold/20 text-gold text-[10px] font-semibold hover:bg-gold/10 transition-colors"
                >
                  Compare <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
        {similarCards.map((c, i) => {
          const { pro, con } = generateComparison(card, c);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl overflow-hidden flex-shrink-0 w-[75vw] max-w-[280px] snap-center"
            >
              <div className="relative aspect-video overflow-hidden bg-secondary/20">
                {c.image ? (
                  <CardImage src={c.image} alt={`${c.name} credit card`} fallbackColor={c.color} />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}66)` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <h4 className="font-serif font-bold text-xs">{c.name}</h4>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{c.fee}</span>
                  <span>{c.rewards}</span>
                </div>
                <div className="flex items-start gap-1 text-[10px]">
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-green-400">{pro}</span>
                </div>
                <div className="flex items-start gap-1 text-[10px]">
                  <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span className="text-red-400">{con}</span>
                </div>
                <Link
                  to={`/compare?cards=${card.id},${c.id}`}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gold/20 text-gold text-[10px] font-semibold"
                >
                  Compare <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
