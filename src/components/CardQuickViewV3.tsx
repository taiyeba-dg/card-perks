import { Link } from "react-router-dom";
import { Star, Check, Heart, GitCompare, Wallet, ExternalLink, IndianRupee, Plane, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { motion } from "framer-motion";
import CardImage from "@/components/CardImage";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { formatFeeDisplay, formatBaseRate, formatLoungeVisits, formatIncome, formatForex, formatTier } from "@/data/card-v3-format";
import { computeKeyPerks, getTopPortalMerchants } from "@/data/card-v3-transforms";

interface Props {
  card: CardV3 | null;
  open: boolean;
  onClose: () => void;
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  compareList: string[];
  toggleCompare: (id: string) => void;
  isMyCard: (id: string) => boolean;
  toggleMyCard: (id: string) => void;
}

export default function CardQuickViewV3({
  card, open, onClose,
  isFav, toggleFav, compareList, toggleCompare, isMyCard, toggleMyCard,
}: Props) {
  const isMobile = useIsMobile();
  if (!card) return null;

  const isInCompare = compareList.includes(card.id);
  const isInWallet = isMyCard(card.id);
  const isFavorite = isFav(card.id);

  // Compute display values
  const baseRate = card.rewards.baseRate < 1 ? card.rewards.baseRate * 100 : card.rewards.baseRate;
  const feeDisplay = formatFeeDisplay(card.fees);
  const rewardDisplay = formatBaseRate(baseRate);
  const loungeDisplay = formatLoungeVisits(card.features.lounge?.domestic);
  const incomeLabel = formatIncome(card.eligibility?.income);
  const tierLabel = formatTier(card.rewards.calculator.tier);

  // Forex display
  const forexDisplay = formatForex(card.features.forex);

  // Key Perks — always exactly 4
  const keyPerks = computeKeyPerks(card, 4);

  // Top 3 portal merchants
  const topMerchants = getTopPortalMerchants(card, 3);

  // Top 3 category rewards sorted by rate desc
  const topCategories = Object.entries(card.rewards.calculator.categories || {})
    .map(([name, cat]) => ({ name, rate: cat.rate < 1 ? cat.rate * 100 : cat.rate, label: cat.label }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  // Tags — 3 on popup
  const tags = (card.metadata.bestForTags || card.metadata.tags || []).slice(0, 3);

  /* Shared data sections used by both mobile & desktop */
  const statsBlock = (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-secondary/30 rounded-xl p-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Annual Fee</p>
        <p className="text-sm font-bold text-gold mt-1">{feeDisplay}</p>
        {card.fees.waiverText && <p className="text-[8px] text-green-400 mt-0.5 line-clamp-1">{card.fees.waiverText}</p>}
      </div>
      <div className="bg-secondary/30 rounded-xl p-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Base Rate</p>
        <p className="text-sm font-bold text-gold mt-1">{rewardDisplay}</p>
      </div>
      <div className="bg-secondary/30 rounded-xl p-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Lounge</p>
        <p className="text-sm font-bold mt-1">{loungeDisplay}</p>
      </div>
      <div className="bg-secondary/30 rounded-xl p-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Forex</p>
        <p className="text-sm font-bold mt-1">{forexDisplay}</p>
      </div>
    </div>
  );

  const eligibilityBlock = (
    <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
      {incomeLabel && incomeLabel !== "N/A" && (
        <span>Min. Income: <span className="text-foreground font-medium">{incomeLabel}</span></span>
      )}
      {card.eligibility?.creditScore && (
        <span>Credit Score: <span className="text-foreground font-medium">{card.eligibility.creditScore}+</span></span>
      )}
      {card.eligibility?.type && (
        <span>Type: <span className="text-purple-400 font-medium">{card.eligibility.type}</span></span>
      )}
    </div>
  );

  const categoryBlock = topCategories.length > 0 ? (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Category Rewards</p>
      <div className="space-y-1">
        {topCategories.map((cat) => (
          <div key={cat.name} className="flex justify-between items-center py-1.5 border-b border-border/15 last:border-0">
            <span className="text-xs text-muted-foreground capitalize">{cat.name.replace(/_/g, " ")}</span>
            <span className="text-xs font-semibold text-gold">{cat.label || `${cat.rate.toFixed(1)}%`}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const perksBlock = (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Key Perks</p>
      <div className="space-y-1.5">
        {keyPerks.map((p) => (
          <div key={p} className="flex items-start gap-2">
            <Check className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
            <span className="text-sm leading-snug">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const portalBlock = topMerchants.length > 0 ? (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Top Portal Rates</p>
      <div className="flex flex-wrap gap-1.5">
        {topMerchants.map((m) => (
          <span key={`${m.portal}-${m.name}`} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60">
            {m.name} {m.rateLabel}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  const bonusBlock = (
    <div className="flex gap-2">
      {card.rewards.joiningBonus && card.rewards.joiningBonus !== "None" && card.rewards.joiningBonus !== "N/A" && (
        <div className="flex-1 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <p className="text-[10px] text-purple-400 font-semibold mb-0.5">🎁 Welcome Bonus</p>
          <p className="text-[11px] text-muted-foreground line-clamp-2">{card.rewards.joiningBonus}</p>
        </div>
      )}
      {card.rewards.redemption?.bestOption && (
        <div className="flex-1 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400 font-semibold mb-0.5">💰 Best Redemption</p>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {card.rewards.redemption.bestOption}
            {card.rewards.redemption.baseValue != null && ` (₹${card.rewards.redemption.baseValue}/pt)`}
          </p>
        </div>
      )}
    </div>
  );

  const actionButtons = (
    <div className="flex gap-2">
      <button
        onClick={() => toggleFav(card.id)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
          isFavorite ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-400" : ""}`} />
        {isFavorite ? "Saved" : "Save"}
      </button>
      <button
        onClick={() => toggleCompare(card.id)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
          isInCompare ? "bg-gold/15 text-gold border border-gold/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
        }`}
      >
        <GitCompare className="w-3.5 h-3.5" />
        {isInCompare ? "Comparing" : "Compare"}
      </button>
      <button
        onClick={() => toggleMyCard(card.id)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
          isInWallet ? "bg-gold/15 text-gold border border-gold/30" : "bg-secondary/30 text-muted-foreground border border-border/20 hover:text-foreground"
        }`}
      >
        <Wallet className="w-3.5 h-3.5" />
        {isInWallet ? "In Wallet" : "Add"}
      </button>
    </div>
  );

  const detailsCta = (
    <Link
      to={`/cards/${card.id}`}
      onClick={onClose}
      className="gold-btn w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
    >
      View Full Details <ExternalLink className="w-4 h-4" />
    </Link>
  );

  /* ── Mobile: single-column drawer ── */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{card.name}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
            <div className="p-4 pb-3" style={{ background: `linear-gradient(135deg, ${card.bankId === "hdfc-bank" ? "#004B8D" : "#0D0D0D"}08, transparent)` }}>
              <div className="flex items-center gap-3">
                <div className="w-24 aspect-square rounded-xl overflow-hidden shadow-xl shadow-black/40 flex-shrink-0">
                  <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor="#0D0D0D" fit="cover" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                    {card.shortName || card.name}
                    <span className="flex items-center gap-1 text-sm font-normal">
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                      <span className="text-sm">{card.metadata.rating}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">{card.bank} · {card.networkBase || card.network}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {tierLabel && tierLabel !== "N/A" && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide bg-gold/15 text-gold">{tierLabel}</span>}
                    {card.eligibility?.type && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide bg-purple-500/15 text-purple-400">{card.eligibility.type}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 pt-2 space-y-4 pb-2">
              {actionButtons}
              {statsBlock}
              {eligibilityBlock}
              {categoryBlock}
              {perksBlock}
              {portalBlock}
              {bonusBlock}
              {card.metadata.verdict && <p className="text-[11px] italic text-muted-foreground py-2 border-t border-border/20 line-clamp-2">"{card.metadata.verdict}"</p>}
            </div>
          </div>
          {/* Sticky CTA pinned above mobile nav */}
          <div className="shrink-0 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+80px)] border-t border-border/20 bg-background">
            {detailsCta}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  /* ── Desktop dialog ── */
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-3xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{card.name}</DialogTitle>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="overflow-y-auto">
          {/* Hero: card image left + identity right */}
          <div className="flex items-center gap-6 p-6 pb-5">
            <div className="w-[220px] shrink-0">
              <div className="aspect-[5/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
                <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor="#0D0D0D" fit="cover" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-2xl font-bold leading-tight mb-1">{card.shortName || card.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{card.bank} · {card.networkBase || card.network}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-gold/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                  <span className="text-sm font-semibold">{card.metadata.rating}</span>
                </div>
                {tierLabel && tierLabel !== "N/A" && <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-gold/15 text-gold">{tierLabel}</span>}
                {card.eligibility?.type && <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-purple-500/15 text-purple-400">{card.eligibility.type}</span>}
              </div>
              {eligibilityBlock}
            </div>
          </div>

          {/* Stats strip — 4 across, full width */}
          <div className="grid grid-cols-4 border-y border-border/15">
            <div className="px-5 py-3 border-r border-border/15">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Annual Fee</p>
              <p className="text-base font-bold text-gold mt-0.5">{feeDisplay}</p>
              {card.fees.waiverText && <p className="text-[9px] text-green-400 mt-0.5 line-clamp-1">{card.fees.waiverText}</p>}
            </div>
            <div className="px-5 py-3 border-r border-border/15">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Base Rate</p>
              <p className="text-base font-bold text-gold mt-0.5">{rewardDisplay}</p>
            </div>
            <div className="px-5 py-3 border-r border-border/15">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Lounge</p>
              <p className="text-base font-bold mt-0.5">{loungeDisplay}</p>
            </div>
            <div className="px-5 py-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Forex</p>
              <p className="text-base font-bold mt-0.5">{forexDisplay}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pt-4 pb-2">{actionButtons}</div>

          {/* Body — two-column for rewards+perks, then single-col rest */}
          <div className="px-6 pb-6 space-y-4">
            {(categoryBlock || keyPerks.length > 0) && (
              <div className="grid grid-cols-2 gap-x-8">
                <div>{categoryBlock}</div>
                <div>{perksBlock}</div>
              </div>
            )}
            {portalBlock}
            {bonusBlock}

            {(card.features.dining || card.features.entertainment) && (
              <div className="flex gap-2 text-[10px] flex-wrap">
                {card.features.dining?.culinaryTreatsText && (
                  <span className="px-2.5 py-1 rounded-lg bg-secondary/40 text-muted-foreground">🍽️ {card.features.dining.culinaryTreatsText}</span>
                )}
                {card.features.entertainment && typeof card.features.entertainment === "object" && (card.features.entertainment as any).bookMyShow?.offer && (
                  <span className="px-2.5 py-1 rounded-lg bg-secondary/40 text-muted-foreground">🎬 {(card.features.entertainment as any).bookMyShow.offer}</span>
                )}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((b) => (
                  <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold">{b}</span>
                ))}
              </div>
            )}

            {card.metadata.verdict && (
              <p className="text-xs italic text-muted-foreground py-3 border-t border-border/15 leading-relaxed">"{card.metadata.verdict}"</p>
            )}

            {detailsCta}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
