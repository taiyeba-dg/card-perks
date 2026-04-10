import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, Table2 } from "lucide-react";
import type { CardV3Data, CategoryRate, RewardExclusion } from "@/data/card-v3-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CATEGORY_ICONS, CATEGORY_NAMES, CAP_PERIOD_COLORS } from "@/data/category-config";
import { getCardExclusions } from "@/data/exclusions-registry";

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface Props {
  v3: CardV3Data;
  cardId?: string;
}

export default function CategoryRewardsSection({ v3, cardId }: Props) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(v3.categories);
  const maxRate = Math.max(...entries.map(([, c]) => c.rate));

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Table2 className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Category-wise Rewards</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 border-t border-border/20">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Earning Rate</th>
                      <th className="pb-2 font-medium">Cap</th>
                      <th className="pb-2 font-medium">Cap Period</th>
                      <th className="pb-2 font-medium">Min Txn</th>
                      <th className="pb-2 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([key, cat], i) => {
                      const isBest = cat.rate === maxRate && cat.rate > 0;
                      const capLikely = cat.cap !== null && cat.cap < 30000 * (cat.rate / 100);
                      return (
                        <motion.tr
                          key={key}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`border-b border-border/10 ${isBest ? "border-l-2 border-l-gold" : ""}`}
                        >
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_ICONS[key] || "💳"}</span>
                              <span className="font-medium">{CATEGORY_NAMES[key] || key}</span>
                              {isBest && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">⭐ Best</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-muted-foreground">{cat.label}</span>
                            <span className="text-gold font-semibold ml-2">{cat.rate}%</span>
                          </td>
                          <td className="py-3 pr-3">
                            {cat.cap ? (
                              <span>
                                {formatCurrency(cat.cap)}
                                {capLikely && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Cap likely</span>}
                              </span>
                            ) : (
                              <span className="text-green-400 text-xs font-medium">Unlimited</span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            {cat.capPeriod ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAP_PERIOD_COLORS[cat.capPeriod] || ""}`}>
                                {cat.capPeriod}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {cat.minTxn ? formatCurrency(cat.minTxn) : "—"}
                          </td>
                          <td className="py-3">
                            {cat.note && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs max-w-[200px]">{cat.note}</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <MobileCategoryList entries={entries} maxRate={maxRate} />

              {/* Exclusions */}
              {(v3.exclusions.length > 0 || (cardId && getCardExclusions(cardId).length > 0)) && (
                <div className="mt-5 pt-4 border-t border-border/20">
                  <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">❌ No Rewards</p>
                  <div className="space-y-1.5">
                    {cardId
                      ? getCardExclusions(cardId).map((ex, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                            <span className="flex-shrink-0 mt-0.5">—</span>
                            <span>
                              {ex.displayName}
                              {ex.mccCodes.length > 0 && <span className="text-muted-foreground/40"> — MCC {ex.mccCodes.join(", ")}</span>}
                              {" — "}{ex.description}
                            </span>
                          </div>
                        ))
                      : v3.exclusions.map((exc, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                            <span className="flex-shrink-0 mt-0.5">—</span>
                            <span>
                              {exc.category}
                              {exc.mccCodes && <span className="text-muted-foreground/40"> — MCC {exc.mccCodes}</span>}
                              {" — "}{exc.note}
                            </span>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileCategoryList({ entries, maxRate }: { entries: [string, CategoryRate][]; maxRate: number }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="sm:hidden space-y-2 mt-4">
      {entries.map(([key, cat], i) => {
        const isBest = cat.rate === maxRate && cat.rate > 0;
        const isOpen = expandedIdx === i;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-xl bg-secondary/20 overflow-hidden ${isBest ? "border-l-2 border-l-gold" : ""}`}
          >
            <button
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
            >
              <span className="text-lg">{CATEGORY_ICONS[key] || "💳"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{CATEGORY_NAMES[key] || key}</span>
                  {isBest && <span className="text-[8px] px-1 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">⭐ Best</span>}
                </div>
              </div>
              <span className="text-gold font-semibold text-sm">{cat.rate}%</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-3.5 pb-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Earning</span><span>{cat.label}</span></div>
                    <div className="flex justify-between"><span>Cap</span><span>{cat.cap ? formatCurrency(cat.cap) : <span className="text-green-400">Unlimited</span>}</span></div>
                    {cat.capPeriod && <div className="flex justify-between"><span>Period</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAP_PERIOD_COLORS[cat.capPeriod]}`}>{cat.capPeriod}</span></div>}
                    {cat.minTxn && <div className="flex justify-between"><span>Min Txn</span><span>{formatCurrency(cat.minTxn)}</span></div>}
                    {cat.note && <p className="text-muted-foreground/60 italic pt-1">ℹ️ {cat.note}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
