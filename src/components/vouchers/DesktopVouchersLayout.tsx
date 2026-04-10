import { memo } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, TrendingDown, CheckCircle2, Gift, Trophy } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import type { Voucher } from "@/data/vouchers";
import { iconMap } from "@/data/vouchers";
import type { VoucherComboResult } from "@/data/voucher-card-combos";

const BEST_RATE_THRESHOLD = 10;

const VOUCHER_UPDATED_MINUTES: Record<string, number> = {
  flipkart: 18, amazon: 42, zomato: 5, swiggy: 73, uber: 130,
  bigbasket: 25, hpcl: 210, makemytrip: 55, bookmyshow: 12,
  cultfit: 90, coursera: 320, croma: 8,
};

function formatCardRelativeTime(minutes: number): string {
  if (minutes < 60) return "Updated today";
  const h = Math.floor(minutes / 60);
  if (h < 24) return `Updated ${h}h ago`;
  return "Updated yesterday";
}

function parseRate(rate: string): number {
  return parseFloat(rate.replace("%", "")) || 0;
}

function getBestPlatformName(v: Voucher): string | null {
  const best = v.platformRates.find((p) => p.highlight);
  return best ? best.platform : null;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-gold font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

import { PORTAL_COLORS } from "@/data/color-schemes";

interface Props {
  vouchers: Voucher[];
  search: string;
  onQuickView: (v: Voucher) => void;
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  myCardIds?: string[];
  showMyCards?: boolean;
  comboMap: Map<string, VoucherComboResult>;
}

export default memo(function DesktopVouchersLayout({ vouchers, search, onQuickView, isFav, toggleFav, myCardIds, showMyCards, comboMap }: Props) {
  return (
    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {vouchers.map((v, i) => {
        const Icon = iconMap[v.category] || Gift;
        const rate = parseRate(v.bestRate);
        const isBestRate = rate >= BEST_RATE_THRESHOLD;
        const livePlatforms = v.platformRates.filter((p) => p.live).length;
        const bestPlatName = getBestPlatformName(v);
        const updatedMins = VOUCHER_UPDATED_MINUTES[v.id] ?? 60;
        const hist = v.rateHistory;
        const rateTrend: "up" | "down" | "same" | "new" =
          hist.length < 2 ? "new"
          : hist[hist.length - 1].rate > hist[hist.length - 2].rate ? "up"
          : hist[hist.length - 1].rate < hist[hist.length - 2].rate ? "down"
          : "same";
        const rateDelta = hist.length >= 2
          ? Math.abs(hist[hist.length - 1].rate - hist[hist.length - 2].rate).toFixed(1)
          : null;

        // Look up precomputed combo
        const comboResult = comboMap.get(v.id);
        const bestCombo = comboResult
          ? (showMyCards && myCardIds?.length
              ? comboResult.allCombos.find((c) => myCardIds.includes(c.card.id)) || comboResult.bestCombo
              : comboResult.bestCombo)
          : null;

        return (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
            onClick={() => onQuickView(v)}
            className="tilt-card glass-card rounded-2xl overflow-hidden group relative hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px -8px ${v.color}25`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}40)` }} />
            <div className="p-4 sm:p-6 relative">
              {isBestRate && (
                <div className="absolute top-3 right-12 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-semibold">
                    <Star className="w-2.5 h-2.5 fill-gold" /> Best Rate
                  </span>
                </div>
              )}
              {["cultfit", "coursera", "bookmyshow"].includes(v.id) && (
                <div className="absolute top-3 left-4 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                    New
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  isFav={isFav(v.id)}
                  onToggle={() => toggleFav(v.id)}
                  className="hover:bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${v.logo ? "bg-white p-1.5" : ""}`} style={v.logo ? undefined : { backgroundColor: `${v.color}20`, border: `1px solid ${v.color}30` }}>
                  {v.logo ? (
                    <img src={v.logo} alt={v.name} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <Icon className="w-6 h-6" style={{ color: v.color }} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{highlightMatch(v.name, search)}</h3>
                  <p className="text-xs text-muted-foreground">{v.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">{v.discount}</span>
                <span className="text-xs text-muted-foreground">Best: {v.bestRate}</span>
                {rateTrend === "up" && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500">
                    <TrendingUp className="w-3 h-3" />+{rateDelta}%
                  </span>
                )}
                {rateTrend === "down" && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-400">
                    <TrendingDown className="w-3 h-3" />-{rateDelta}%
                  </span>
                )}
              </div>

              {/* Portal Availability Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {v.platformRates.filter((p) => p.live).map((pr) => {
                  const color = PORTAL_COLORS[pr.platform] || "#888";
                  const isMyPortal = showMyCards && myCardIds?.length && bestCombo?.portal === pr.platform;
                  return (
                    <span
                      key={pr.platform}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isMyPortal ? "border border-gold/50 bg-gold/10 text-gold" : "bg-secondary/60 text-muted-foreground"}`}
                      style={!isMyPortal ? { borderLeft: `2px solid ${color}` } : undefined}
                    >
                      {pr.platform.replace("Rewards", "").trim()}
                      {isMyPortal && " ⭐"}
                    </span>
                  );
                })}
                {v.platformRates.filter((p) => p.live).length === 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/40 text-muted-foreground/60">Direct purchase only</span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {livePlatforms} platform{livePlatforms !== 1 ? "s" : ""} live
                </span>
                {bestPlatName && <span className="text-gold/80">Best on {bestPlatName}</span>}
                <span className="ml-auto flex items-center gap-1 text-muted-foreground/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                  {formatCardRelativeTime(updatedMins)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{v.description}</p>

              {/* Best Card Badge */}
              {bestCombo && (
                <div className="border-t border-border/30 pt-3">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gold/5 border border-gold/15">
                    <Trophy className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gold truncate">
                        {showMyCards && myCardIds?.length ? "Your best:" : "Best via:"} {bestCombo.card.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {bestCombo.multiplierLabel} {bestCombo.portal} + {bestCombo.voucherRate}% voucher = up to {bestCombo.totalValue.toFixed(0)}% value
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});
