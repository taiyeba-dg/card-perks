import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Check, GitCompare, Wallet, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CardImage from "@/components/CardImage";
import FavoriteButton from "@/components/FavoriteButton";
import type { CreditCard as CardType } from "@/data/cards";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { playSound } from "@/lib/sounds";

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

export default function DesktopKnowYourCardsLayout({
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
    <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {cards.map((card, i) => {
        const isSelected = compareList.includes(card.id);
        const isTopPick = card.id === highestRatedCardId;
        const v3 = v3Map.get(card.id);
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.6), duration: 0.3 }}
            className={`tilt-card glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] flex flex-col ${isSelected ? "border-2 border-gold" : ""}`}
            style={{ "--card-glow": card.color, ...(isSelected ? { background: "hsl(var(--gold) / 0.08)", boxShadow: "0 0 30px -2px hsl(var(--gold) / 0.4), inset 0 0 20px -8px hsl(var(--gold) / 0.1)" } : {}) } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px -8px hsl(var(--gold) / 0.25), 0 0 0 1px hsl(var(--gold) / 0.15)`;
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div className="cursor-pointer flex flex-col flex-1" onClick={() => { playSound("tap"); onQuickView(card); }}>
              {/* Card image area */}
              <div className="relative p-5 pb-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl shadow-black/40 group/card bg-secondary/20">
                  {card.image ? (
                    <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor={card.color} fit="cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}66, ${card.color}33)` }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                      <div className="absolute bottom-4 left-5">
                        <p className="text-xs text-white/50 font-medium tracking-widest uppercase">{card.issuer}</p>
                        <p className="text-sm text-white/80 font-semibold mt-0.5">{card.name}</p>
                      </div>
                      <div className="absolute top-4 right-5 text-white/40 text-[10px] font-medium tracking-wider uppercase">{card.network}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
                {isTopPick && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-gold px-2.5 py-1 rounded-full shadow-lg shadow-gold/30">
                    <Award className="w-3 h-3 text-background" />
                    <span className="text-[10px] font-bold text-background tracking-wide">TOP PICK</span>
                  </div>
                )}
                {isMyCard(card.id) && !isTopPick && (
                  <div className="absolute top-7 left-7 z-20 flex items-center gap-1 bg-green-500 px-2 py-1 rounded-full shadow-lg">
                    <span className="text-[9px] font-bold text-background tracking-wide">YOUR CARD</span>
                  </div>
                )}
                <div className="absolute top-7 right-7 flex items-center gap-1 bg-background/70 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg">
                  <Star className="w-3 h-3 text-gold fill-gold" /><span className="text-xs font-medium">{card.rating}</span>
                </div>
                <div className="absolute top-7 left-7 z-10" onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton
                    isFav={isFav(card.id)}
                    onToggle={() => toggleFav(card.id)}
                    className="bg-background/70 backdrop-blur-md shadow-lg hover:bg-background/90"
                  />
                </div>
              </div>
              <div className="px-5 pb-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide" style={{ backgroundColor: `${card.color}30`, color: card.color, textShadow: `0 0 8px ${card.color}40` }}>
                    {card.type}
                  </span>
                  {isMyCard(card.id) && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-bold border border-gold/20">YOUR CARD</span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-lg">{card.name}</h3>
                <p className="text-xs text-muted-foreground mb-1.5">{card.issuer} · {card.network}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {card.bestFor.slice(0, 3).map((b) => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium">{b}</span>
                  ))}
                  {v3?.features.cardMaterial === "metal" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold border border-gold/30">Metal</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center bg-secondary/30 rounded-xl py-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Fee</p>
                    <p className="text-sm font-semibold">{card.fee}</p>
                    {v3?.fees.waiverText && <p className="text-[9px] text-green-400 mt-0.5 px-1 line-clamp-1">{v3.fees.waiverText}</p>}
                  </div>
                  <div className="text-center bg-secondary/30 rounded-xl py-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Base Rate</p>
                    <p className="text-sm font-semibold text-gold">{card.rewards}</p>
                    {v3?.rewards.pointCurrency && <p className="text-[9px] text-muted-foreground mt-0.5 px-1 line-clamp-1">{v3.rewards.pointCurrency}</p>}
                  </div>
                  <div className="text-center bg-secondary/30 rounded-xl py-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Lounge</p>
                    <p className="text-sm font-semibold">{card.lounge}</p>
                  </div>
                </div>

                {/* Earning text */}
                {v3?.rewards.earningText && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 mb-2">
                    <p className="text-[11px] text-blue-400 font-medium line-clamp-1">{v3.rewards.earningText}</p>
                  </div>
                )}

                {/* Welcome bonus */}
                {v3?.rewards.joiningBonus && v3.rewards.joiningBonus !== "None" && v3.rewards.joiningBonus !== "N/A" && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-4 h-4 rounded flex items-center justify-center bg-purple-500/10 text-[10px] flex-shrink-0">🎁</span>
                    <p className="text-[11px] text-purple-400 line-clamp-1">{v3.rewards.joiningBonus}</p>
                  </div>
                )}

                {/* Point expiry */}
                {v3?.rewards.expiry && (
                  <p className="text-[10px] mb-1.5">
                    {v3.rewards.expiry.toLowerCase() === "never" || v3.rewards.expiry.toLowerCase() === "no expiry"
                      ? <span className="text-green-400">No Expiry</span>
                      : v3.rewards.expiry.toLowerCase() === "auto-credited"
                        ? <span className="text-green-400">Auto-credited</span>
                        : <span className="text-muted-foreground">Expires: {v3.rewards.expiry}</span>
                    }
                  </p>
                )}

                {/* Verdict */}
                {v3?.metadata.verdict && (
                  <p className="text-[11px] italic text-muted-foreground line-clamp-1 mb-3">{v3.metadata.verdict}</p>
                )}

                {/* Action icons */}
                <div className="flex gap-2 justify-end mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleCompare(card.id)}
                        className={`text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 ${
                          isSelected ? "bg-gold text-background" : "glass-card hover:border-gold/30 text-muted-foreground hover:text-gold"
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <GitCompare className="w-3 h-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isSelected ? "Remove from Compare" : "Add to Compare"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleMyCard(card.id)}
                        className={`text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center ${
                          isMyCard(card.id) ? "bg-gold/15 text-gold border border-gold/30" : "glass-card hover:border-gold/30 text-muted-foreground hover:text-gold"
                        }`}
                      >
                        {isMyCard(card.id) ? <Check className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isMyCard(card.id) ? "In My Cards" : "Add to My Cards"}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
