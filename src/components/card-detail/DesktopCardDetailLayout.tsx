import { motion } from "framer-motion";
import { Users, Gift, TrendingUp, Shield, Check, ThumbsUp, ThumbsDown, Award, Plane, Star, ShoppingBag } from "lucide-react";
import type { CreditCard as CardType } from "@/data/cards";

const bestForIcons: Record<string, React.ElementType> = {
  "Ultra HNI customers": Award,
  "Luxury travelers": Plane,
  "Taj enthusiasts": Star,
  "Fashion shoppers": ShoppingBag,
  "Young professionals": Users,
  "Online spenders": ShoppingBag,
  "Frequent travelers": Plane,
  "International travelers": Plane,
  "Miles collectors": Plane,
  "Emirates flyers": Plane,
  "NRI banking": Users,
  "Premium banking customers": Award,
  "MakeMyTrip users": Plane,
  "Budget travelers": Plane,
  "Shoppers Stop loyalists": ShoppingBag,
  "Fashion lovers": ShoppingBag,
  "Budget shoppers": ShoppingBag,
};

interface Props {
  card: CardType;
  pros: string[];
  cons: string[];
}

export default function DesktopCardDetailLayout({ card, pros, cons }: Props) {
  return (
    <>
      {/* Best For */}
      <motion.div id="cd-perks-desktop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="hidden sm:block mb-8">
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> Best For</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {card.bestFor.map((b) => {
            const Icon = bestForIcons[b] || Users;
            return (
              <div key={b} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <span className="text-sm font-medium">{b}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Why This Card? */}
      {(pros.length > 0 || cons.length > 0) && (
        <motion.div id="cd-pros-cons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="hidden sm:block glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-serif text-lg font-semibold mb-4">Why This Card?</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {pros.length > 0 && (
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"><ThumbsUp className="w-3 h-3" /> Pros</p>
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
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"><ThumbsDown className="w-3 h-3" /> Cons</p>
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
        </motion.div>
      )}

      {/* Key Perks */}
      <div className="hidden sm:grid md:grid-cols-1 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-gold" /> Key Perks</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {card.perks.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>
          {card.vouchers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gold" /> Top Voucher Rates</h3>
              <div className="flex flex-wrap gap-2">
                {card.vouchers.map((v) => (
                  <span key={v} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60">{v}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Milestones & Insurance — hide empty sections */}
      {(card.milestones.length > 0 || card.insurance.length > 0) && (
        <div className="hidden sm:grid md:grid-cols-2 gap-6 mb-8">
          {card.milestones.length > 0 && (
            <motion.div id="cd-milestones" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gold" /> Milestone Benefits</h3>
              <div className="space-y-3">
                {card.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-gold">{i + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{m}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {card.insurance.length > 0 && (
            <motion.div id="cd-insurance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /> Insurance Coverage</h3>
              <div className="space-y-3">
                {card.insurance.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{ins}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Similar Cards removed — EnhancedSimilarCards in CardDetail handles this */}
    </>
  );
}
