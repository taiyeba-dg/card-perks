import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import { parsePercent } from "./CompareUtils";

const popularPairs: [string, string][] = [
  ["hdfc-diners-black", "axis-magnus"],
  ["axis-privilege", "flipkart-axis"],
  ["au-zenith-plus", "bob-eterna"],
  ["bpcl-sbi-octane", "club-vistara-sbi"],
  ["amex-mrcc", "au-lit"],
];

function generatePreview(id1: string, id2: string): string {
  const c1 = cards.find((c) => c.id === id1);
  const c2 = cards.find((c) => c.id === id2);
  if (!c1 || !c2) return "";
  const v1 = getMasterCard(id1);
  const v2 = getMasterCard(id2);

  const parts: string[] = [];
  const r1 = v1?.baseRate ?? parsePercent(c1.rewards);
  const r2 = v2?.baseRate ?? parsePercent(c2.rewards);
  if (r1 !== r2) {
    const leader = r1 > r2 ? c1 : c2;
    parts.push(`${leader.name.split(" ").slice(-2).join(" ")} leads in rewards (${Math.max(r1, r2)}% vs ${Math.min(r1, r2)}%)`);
  }
  const f1 = parseInt(c1.fee.replace(/[₹,]/g, "")) || 0;
  const f2 = parseInt(c2.fee.replace(/[₹,]/g, "")) || 0;
  if (f1 !== f2) {
    const cheaper = f1 < f2 ? c1 : c2;
    parts.push(`${cheaper.name.split(" ").slice(-2).join(" ")} has lower fee (${cheaper.fee})`);
  }
  return parts.join(" · ") || "Compare side by side";
}

interface EmptyStateProps { maxCards: number; onSelectPair: (cards: CardType[]) => void; }

export default function CompareEmptyState({ maxCards, onSelectPair }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="text-lg font-serif">Select at least 2 cards to compare</p>
      <p className="text-sm mt-2">Pick any 2–{maxCards} from {cards.length} available cards above</p>
      <div className="mt-8">
        <p className="text-xs font-medium text-gold mb-4 uppercase tracking-widest">Popular Comparisons</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {popularPairs.map(([id1, id2]) => {
            const c1 = cards.find((c) => c.id === id1);
            const c2 = cards.find((c) => c.id === id2);
            if (!c1 || !c2) return null;
            const preview = generatePreview(id1, id2);
            return (
              <motion.button
                key={`${id1}-${id2}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectPair([c1, c2])}
                className="glass-card rounded-xl px-4 py-3 hover:border-gold/30 border border-border/30 transition-colors text-left max-w-xs"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-medium">{c1.name}</span>
                  <span className="text-[10px] text-gold font-semibold">vs</span>
                  <span className="text-xs font-medium">{c2.name}</span>
                </div>
                {preview && <p className="text-[10px] text-muted-foreground/60 leading-tight">{preview}</p>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
