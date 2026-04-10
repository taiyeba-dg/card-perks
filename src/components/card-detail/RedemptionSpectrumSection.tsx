import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BarChart3, Trophy, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

import type { CardV3Data } from "@/data/card-v3-types";

function formatCurrency(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function getBadge(idx: number, total: number) {
  if (idx === 0) return { label: "🏆 BEST", cls: "bg-gold/15 text-gold" };
  if (idx === 1 && total > 2) return { label: "✅ GOOD", cls: "bg-green-500/15 text-green-400" };
  if (idx === total - 1) return { label: "❌ POOR", cls: "bg-red-500/15 text-red-400" };
  return { label: "⚠️ AVG", cls: "bg-amber-500/15 text-amber-400" };
}

interface Props {
  v3: CardV3Data;
  cardId: string;
}

export default function RedemptionSpectrumSection({ v3, cardId }: Props) {
  const [open, setOpen] = useState(false);
  const { redemption } = v3;
  const isCashback = redemption.type === "cashback";

  if (isCashback) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
          <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-green-400" />
          </div>
          <span className="font-serif font-semibold text-base flex-1">Redemption Value</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
              <div className="px-5 pb-5 border-t border-border/20 mt-2">
                <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-4">
                  <p className="text-sm font-medium">💚 Cashback cards give 1:1 value</p>
                  <p className="text-xs text-muted-foreground mt-1">₹1 earned = ₹1 in your pocket. No complicated redemption needed.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const options = [...redemption.options].sort((a, b) => b.value - a.value);
  const best = options[0];
  const worst = options[options.length - 1];
  const gap = worst.value > 0 ? (best.value / worst.value).toFixed(1) : "∞";
  const gapValue50k = (best.value - worst.value) * 50000;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Redemption Value Spectrum</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="px-5 pb-5 border-t border-border/20 space-y-4 mt-4">
              {/* Gradient bar */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>₹{worst.value.toFixed(2)}/pt</span>
                  <span>₹{best.value.toFixed(2)}/pt</span>
                </div>
                <div className="h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-60% to-green-400 relative">
                  <div className="absolute -top-0.5 right-0 w-3.5 h-3.5 rounded-full bg-gold border-2 border-background shadow-md" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-0.5">
                  <span>← Worst</span>
                  <span>Best →</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {options.map((opt, i) => {
                  const badge = getBadge(i, options.length);
                  return (
                    <motion.div
                      key={opt.type}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/15"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
                        <span className="text-sm font-medium truncate">{opt.type}</span>
                      </div>
                      <span className="text-sm font-semibold text-gold flex-shrink-0">₹{opt.value.toFixed(2)}/pt</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Gap info */}
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                <p className="text-xs font-medium text-amber-400">
                  Gap: {gap}x → Don't leave {formatCurrency(gapValue50k)} on the table
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">(assuming 50,000 {redemption.pointCurrency})</p>
              </div>

              {/* CTA */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
