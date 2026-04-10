import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown, Gift, Trophy } from "lucide-react";
import type { Voucher } from "@/data/vouchers";
import { iconMap } from "@/data/vouchers";
import type { VoucherComboResult } from "@/data/voucher-card-combos";

interface Props {
  vouchers: Voucher[];
  onQuickView: (v: Voucher) => void;
  myCardIds?: string[];
  showMyCards?: boolean;
  comboMap: Map<string, VoucherComboResult>;
}

export default memo(function MobileVouchersLayout({ vouchers, onQuickView, myCardIds, showMyCards, comboMap }: Props) {
  return (
    <div className="sm:hidden space-y-2">
      {vouchers.map((v, i) => {
        const Icon = iconMap[v.category] || Gift;
        const livePlatforms = v.platformRates.filter((p) => p.live).length;
        const hist = v.rateHistory;
        const rateTrend: "up" | "down" | "same" | "new" =
          hist.length < 2 ? "new"
          : hist[hist.length - 1].rate > hist[hist.length - 2].rate ? "up"
          : hist[hist.length - 1].rate < hist[hist.length - 2].rate ? "down"
          : "same";

        const comboResult = comboMap.get(v.id);
        const bestCombo = comboResult
          ? (showMyCards && myCardIds?.length
              ? comboResult.allCombos.find((c) => myCardIds.includes(c.card.id)) || comboResult.bestCombo
              : comboResult.bestCombo)
          : null;

        return (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.25 }}
            onClick={() => onQuickView(v)}
            className="glass-card rounded-xl active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: v.color }} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${v.logo ? "bg-white p-1" : "p-1.5"}`} style={v.logo ? undefined : { backgroundColor: `${v.color}15` }}>
                {v.logo ? (
                  <img src={v.logo} alt={v.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: v.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm truncate">{v.name}</h3>
                  {rateTrend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                  {rateTrend === "down" && <TrendingDown className="w-3 h-3 text-red-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{v.category}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground">{livePlatforms} live</span>
                </div>
                {/* Best Card badge — mobile compact */}
                {bestCombo && (
                  <div className="flex items-center gap-1 mt-1">
                    <Trophy className="w-2.5 h-2.5 text-gold flex-shrink-0" />
                    <span className="text-[9px] text-gold font-medium truncate">
                      {bestCombo.card.name} — {bestCombo.totalValue.toFixed(0)}% value
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gold">{v.bestRate}</p>
                <p className="text-[10px] text-muted-foreground">best rate</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});
