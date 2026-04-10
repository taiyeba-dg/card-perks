import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Rocket, ExternalLink, AlertTriangle } from "lucide-react";
import type { CardV3Data } from "@/data/card-v3-types";

interface Props {
  v3: CardV3Data;
}

export default function PortalEarningSection({ v3 }: Props) {
  const [open, setOpen] = useState(false);

  if (v3.portals.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Earn More via Bank Portals</span>
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
            <div className="px-5 pb-5 border-t border-border/20 space-y-4 mt-4">
              {v3.portals.map((portal, pi) => {
                const hasWarning = portal.note?.toLowerCase().includes("deval");
                return (
                  <motion.div
                    key={portal.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pi * 0.1 }}
                    className="rounded-xl border border-border/30 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-secondary/20">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚀</span>
                        <span className="font-semibold text-sm">{portal.name}</span>
                      </div>
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Merchants */}
                    <div className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        {portal.merchants.map((m) => (
                          <div key={m.name} className="flex items-center justify-between bg-secondary/10 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium">{m.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-bold">{m.multiplier}</span>
                              <span className="text-[10px] text-green-400 font-medium">({m.effectiveRate}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cap & tips */}
                      <div className="mt-3 space-y-1.5">
                        {portal.cap && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span>📊</span> Monthly Cap: <span className="font-medium text-foreground">{portal.cap}</span>
                          </p>
                        )}
                        <div className="rounded-lg bg-gold/5 border border-gold/10 px-3 py-2">
                          <p className="text-xs text-gold flex items-center gap-1.5">
                            <span>💡</span> {portal.pointValueLabel}
                          </p>
                        </div>
                        {hasWarning && portal.note && (
                          <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-400">{portal.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
