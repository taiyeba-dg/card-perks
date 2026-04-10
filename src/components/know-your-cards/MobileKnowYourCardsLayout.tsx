import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Check, GitCompare, Wallet } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import type { CreditCard as CardType } from "@/data/cards";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import type { CardV3 } from "@/data/card-v3-unified-types";

interface Props {
  cards: CardType[];
  onQuickView: (card: CardType) => void;
  compareList: string[];
  toggleCompare: (id: string) => void;
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  isMyCard: (id: string) => boolean;
  toggleMyCard: (id: string) => void;
  highestRatedCardId: string;
}

export default function MobileKnowYourCardsLayout({
  cards, onQuickView, compareList, toggleCompare,
  isFav, toggleFav, isMyCard, toggleMyCard, highestRatedCardId,
}: Props) {
  const { cards: v3Cards } = useCardsV3();
  const v3Map = useMemo(() => {
    const m = new Map<string, CardV3>();
    for (const c of v3Cards) m.set(c.id, c);
    return m;
  }, [v3Cards]);

  return (
    <div className="md:hidden space-y-2">
      {cards.map((card, i) => {
        const isSelected = compareList.includes(card.id);
        const isTopPick = card.id === highestRatedCardId;
        const v3 = v3Map.get(card.id);
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.3 }}
            className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? "border-2 border-gold" : ""}`}
            style={isSelected ? { background: "hsl(var(--gold) / 0.08)", boxShadow: "0 0 30px -2px hsl(var(--gold) / 0.4), inset 0 0 20px -8px hsl(var(--gold) / 0.1)" } : undefined}
          >
            <div
              onClick={() => onQuickView(card)}
              className="flex items-center gap-3 p-3 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="w-20 aspect-[5/3] rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                {card.image ? (
                  <img src={card.image} alt={`${card.name} credit card`} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}66)` }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-semibold text-sm line-clamp-2">{card.name}</h3>
                  {isTopPick && <span className="text-[8px] font-bold bg-gold text-background px-1.5 py-0.5 rounded-full flex-shrink-0">TOP</span>}
                  {isMyCard(card.id) && <span className="text-[8px] font-bold bg-green-500 text-background px-1.5 py-0.5 rounded-full flex-shrink-0">YOUR CARD</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">{card.issuer} · {card.network}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-[10px]"><Star className="w-2.5 h-2.5 text-gold fill-gold" />{card.rating}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-gold font-medium">{card.rewards}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px]">{card.fee}</span>
                  {v3?.fees.waiverText && (
                    <><span className="text-[10px] text-muted-foreground">·</span><span className="text-[10px] text-green-400 line-clamp-1">{v3.fees.waiverText}</span></>
                  )}
                </div>
                {v3?.rewards.joiningBonus && v3.rewards.joiningBonus !== "None" && v3.rewards.joiningBonus !== "N/A" && (
                  <p className="text-[10px] text-purple-400 mt-0.5 line-clamp-1">🎁 {v3.rewards.joiningBonus}</p>
                )}
                {v3?.metadata.verdict && (
                  <p className="text-[10px] italic text-muted-foreground mt-0.5 line-clamp-1">{v3.metadata.verdict}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleCompare(card.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? "bg-gold text-background" : "bg-background/70 shadow-sm text-muted-foreground hover:text-gold"
                  }`}
                  title={isSelected ? "Remove from Compare" : "Add to Compare"}
                >
                  {isSelected ? <Check className="w-3 h-3" /> : <GitCompare className="w-3 h-3" />}
                </button>
                <FavoriteButton
                  isFav={isFav(card.id)}
                  onToggle={() => toggleFav(card.id)}
                  className="bg-background/70 shadow-sm w-7 h-7 rounded-lg text-xs"
                />
                <button
                  onClick={() => toggleMyCard(card.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isMyCard(card.id) ? "bg-gold/15 text-gold border border-gold/30" : "bg-background/70 shadow-sm text-muted-foreground hover:text-gold"
                  }`}
                  title={isMyCard(card.id) ? "In My Cards" : "Add to My Cards"}
                >
                  {isMyCard(card.id) ? <Check className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
