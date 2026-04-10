import { Users, Gift, TrendingUp, Shield, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import MobileSection from "./MobileSection";
import type { CreditCard as CardType } from "@/data/cards";

const bestForIcons: Record<string, React.ElementType> = {
  "Ultra HNI customers": Users,
  "Luxury travelers": Users,
  "Taj enthusiasts": Users,
  "Fashion shoppers": Users,
  "Young professionals": Users,
  "Online spenders": Users,
  "Frequent travelers": Users,
  "International travelers": Users,
  "Miles collectors": Users,
  "Emirates flyers": Users,
  "NRI banking": Users,
  "Premium banking customers": Users,
  "MakeMyTrip users": Users,
  "Budget travelers": Users,
  "Shoppers Stop loyalists": Users,
  "Fashion lovers": Users,
  "Budget shoppers": Users,
};

interface Props {
  card: CardType;
  pros: string[];
  cons: string[];
}

export default function MobileCardDetailLayout({ card, pros, cons }: Props) {
  return (
    <>
      {/* Best For */}
      <MobileSection id="cd-perks" icon={Users} title="Best For" accentColor={card.color}>
        <div className="grid grid-cols-2 gap-2">
          {card.bestFor.map((b) => {
            const Icon = bestForIcons[b] || Users;
            return (
              <div key={b} className="rounded-xl p-3 flex items-center gap-2.5 bg-secondary/30">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <span className="text-xs font-medium leading-snug">{b}</span>
              </div>
            );
          })}
        </div>
      </MobileSection>

      {/* Key Perks */}
      <MobileSection icon={Gift} title="Key Perks" accentColor={card.color}>
        <div className="space-y-2 mb-4">
          {card.perks.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span className="text-sm">{p}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Voucher Rates</p>
        <div className="flex flex-wrap gap-1.5">
          {card.vouchers.map((v) => (
            <span key={v} className="text-xs px-2.5 py-1 rounded-lg bg-secondary/60">{v}</span>
          ))}
        </div>
      </MobileSection>

      {/* Milestones — hide if empty */}
      {card.milestones.length > 0 && (
        <MobileSection id="cd-milestones" icon={TrendingUp} title="Key Milestones" accentColor={card.color}>
          <div className="space-y-2">
            {card.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-gold">{i + 1}</span>
                </div>
                <span className="text-sm text-muted-foreground">{m}</span>
              </div>
            ))}
          </div>
        </MobileSection>
      )}

      {/* Insurance — hide if empty */}
      {card.insurance.length > 0 && (
        <MobileSection id="cd-insurance" icon={Shield} title="Insurance Coverage" accentColor={card.color}>
          <div className="space-y-2">
            {card.insurance.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{ins}</span>
              </div>
            ))}
          </div>
        </MobileSection>
      )}

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <MobileSection id="cd-pros-cons" icon={ThumbsUp} title="Pros & Cons" accentColor={card.color}>
          <div className="space-y-4">
            {pros.length > 0 && (
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ThumbsUp className="w-3 h-3" /> Pros
                </p>
                <div className="space-y-2">
                  {pros.map((p) => (
                    <div key={p} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ThumbsDown className="w-3 h-3" /> Cons
                </p>
                <div className="space-y-2">
                  {cons.map((c) => (
                    <div key={c} className="flex items-start gap-2 text-sm">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">–</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MobileSection>
      )}

      {/* Similar Cards removed — EnhancedSimilarCards in CardDetail handles this */}
    </>
  );
}
