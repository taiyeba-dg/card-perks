import { useState } from "react";
import { motion } from "framer-motion";
import { Diamond, Crown, Award, CircleDot, Check, ChevronDown, ChevronUp, Users, Shield, Sparkles, CreditCard, Star } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import FavoriteButton from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { BankingTier } from "@/data/banking";

export const tierIcons = [CircleDot, Diamond, Crown, Award];

export function highlightAmounts(text: string) {
  return text.split(/(₹[\d,.]+\s*(?:Lakhs?|Lakh|Crores?|Cr)?)/gi).map((part, i) =>
    /₹/.test(part) ? <span key={i} className="text-gold font-semibold">{part}</span> : part
  );
}

export function EligibilityBullets({ text, color }: { text: string; color: string }) {
  const parts = text.split(/ OR /i);
  if (parts.length <= 1) {
    return <p className="text-[11px] leading-[1.7] text-muted-foreground">{highlightAmounts(text)}</p>;
  }
  return (
    <ul className="space-y-2">
      {parts.map((part, i) => (
        <li key={i} className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}12` }}>
            <Check className="w-2.5 h-2.5" style={{ color }} />
          </div>
          <span className="text-[11px] leading-[1.7] text-muted-foreground">{highlightAmounts(part.trim())}</span>
          {i < parts.length - 1 && (
            <span className="ml-auto text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider self-center">or</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function TierCard({ tier, bankColor, bankName, index, totalTiers }: { tier: BankingTier; bankColor: string; bankName: string; index: number; totalTiers: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toggle, isFav } = useFavorites("banking");
  const tierId = `banking-${tier.name.toLowerCase().replace(/\s+/g, "-")}`;
  const visibleBenefits = expanded ? tier.benefits : tier.benefits.slice(0, 4);
  const hasMore = tier.benefits.length > 4;
  const isInviteOnly = tier.eligibility.toLowerCase().includes("invitation");
  const TierIcon = tierIcons[Math.min(index, tierIcons.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative"
      whileHover={{ y: -4 }}
    >
      <div className="absolute -inset-[1px] rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${tier.color}30, transparent 50%, ${tier.color}10)` }} />

      <div className="relative glass-card rounded-[22px] overflow-hidden flex flex-col border border-border/20 hover:border-border/40 transition-all duration-500">
        <div className="h-[2px] w-full" style={{ background: tier.color }} />

        <div className="relative p-6 pb-5" style={{ background: `linear-gradient(135deg, ${tier.color}12, ${tier.color}04, transparent)` }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${tier.color}, transparent)` }} />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${tier.color}25, ${tier.color}10)`, boxShadow: `0 8px 24px ${tier.color}15` }}>
                  <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-[9px] px-2 py-0 h-4 w-fit" style={{ borderColor: `${tier.color}40`, color: tier.color }}>
                    Tier {index + 1}
                  </Badge>
                  {isInviteOnly && (
                    <Badge className="text-[9px] px-2 py-0 h-4 w-fit bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/15">
                      Invite Only
                    </Badge>
                  )}
                </div>
              </div>
              <h3 className="font-serif text-xl font-bold tracking-tight" style={{ color: tier.color }}>{tier.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{bankName}</p>
            </div>
            <FavoriteButton isFav={isFav(tierId)} onToggle={() => toggle(tierId)} className="hover:bg-secondary/50" size="md" />
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="rounded-xl p-4" style={{ background: `${tier.color}06`, border: `1px solid ${tier.color}12` }}>
            <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2 flex items-center gap-1.5" style={{ color: tier.color }}>
              <Shield className="w-3 h-3" /> Eligibility
            </p>
            <EligibilityBullets text={tier.eligibility} color={tier.color} />
          </div>
        </div>

        <div className="px-6 pb-4">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5 font-bold">
            <CreditCard className="w-3 h-3" /> Eligible Cards
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tier.eligibleCards.map((card) => (
              <span key={card} className="text-[10px] px-3 py-1.5 rounded-lg bg-secondary/40 text-foreground font-medium border border-border/20">{card}</span>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4 flex-1">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3 h-3" /> Benefits
          </p>
          <ul className="space-y-2.5">
            {visibleBenefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px] text-muted-foreground group/item">
                <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${tier.color}12` }}>
                  <Check className="w-2.5 h-2.5" style={{ color: tier.color }} />
                </div>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[11px] hover:opacity-80 transition-all mt-3.5 font-semibold" style={{ color: tier.color }}
            >
              {expanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>+{tier.benefits.length - 4} more <ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </div>

        <div className="px-6 pb-6 space-y-3">
          {tier.hasRM && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/15" style={{ background: `linear-gradient(135deg, hsl(var(--gold) / 0.06), transparent)` }}>
              <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center shadow-sm">
                <Users className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <span className="text-[11px] text-gold font-bold block">Dedicated RM</span>
                <span className="text-[10px] text-muted-foreground">Personal relationship manager</span>
              </div>
            </div>
          )}

          <div className="rounded-xl p-4 bg-secondary/15 border border-border/15">
            <p className="text-[10px] font-bold text-gold mb-2 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Key Takeaways
            </p>
            <ul className="space-y-1.5">
              {tier.keyTakeaways.map((t, i) => (
                <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BankSection({ bank, columns }: { bank: import("@/data/banking").BankData; columns?: string }) {
  const gridClass = columns || `${bank.tiers.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : bank.tiers.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`;
  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {bank.tiers.map((tier, i) => (
        <TierCard key={tier.name} tier={tier} bankColor={bank.color} bankName={bank.name} index={i} totalTiers={bank.tiers.length} />
      ))}
    </div>
  );
}
