import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CardV3Data } from "@/data/card-v3-types";
import { getCardById } from "@/data/cards";
import CardImage from "@/components/CardImage";

interface Props {
  v3: CardV3Data;
  currentCardId: string;
}

export default function UpgradePathSection({ v3, currentCardId }: Props) {
  const [open, setOpen] = useState(false);

  if (v3.upgradePath.length <= 1) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Card Upgrade Path</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="px-5 pb-5 border-t border-border/20 mt-4">
              {/* Desktop: horizontal timeline */}
              <div className="hidden sm:flex items-center gap-0 overflow-x-auto pb-2">
                {v3.upgradePath.map((step, i) => {
                  const isCurrent = step.cardId === currentCardId;
                  const card = getCardById(step.cardId);
                  return (
                    <div key={step.cardId} className="flex items-center flex-shrink-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {isCurrent ? (
                          <div className="flex flex-col items-center">
                            <div className={`rounded-xl p-3 border-2 border-gold bg-gold/5 relative`}>
                              <div className="w-16 aspect-[5/3] rounded-lg overflow-hidden">
                                {card?.image ? (
                                  <CardImage src={card.image} alt={step.cardName} fallbackColor={card?.color || "#333"} />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5" />
                                )}
                              </div>
                              <p className="text-[10px] font-semibold text-center mt-1.5 max-w-[80px] truncate">{step.cardName}</p>
                            </div>
                            <span className="text-[9px] text-gold font-semibold mt-1">↑ YOU ARE HERE</span>
                          </div>
                        ) : (
                          <Link to={`/cards/${step.cardId}`} className="group flex flex-col items-center">
                            <div className="rounded-xl p-3 border border-border/30 hover:border-gold/30 transition-colors">
                              <div className="w-16 aspect-[5/3] rounded-lg overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                                {card?.image ? (
                                  <CardImage src={card.image} alt={step.cardName} fallbackColor={card?.color || "#333"} />
                                ) : (
                                  <div className="w-full h-full bg-secondary/30" />
                                )}
                              </div>
                              <p className="text-[10px] font-medium text-center mt-1.5 text-muted-foreground group-hover:text-foreground max-w-[80px] truncate">{step.cardName}</p>
                            </div>
                          </Link>
                        )}
                      </motion.div>
                      {i < v3.upgradePath.length - 1 && (
                        <div className="flex flex-col items-center mx-2 flex-shrink-0">
                          <div className="w-8 h-px bg-border/40" />
                          <span className="text-[8px] text-muted-foreground/50 mt-0.5">{v3.upgradePath[i + 1].condition}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: vertical list */}
              <div className="sm:hidden space-y-3">
                {v3.upgradePath.map((step, i) => {
                  const isCurrent = step.cardId === currentCardId;
                  const card = getCardById(step.cardId);
                  return (
                    <motion.div
                      key={step.cardId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      {isCurrent ? (
                        <div className="flex items-center gap-3 rounded-xl p-3 border-2 border-gold bg-gold/5">
                          <div className="w-12 aspect-[5/3] rounded-lg overflow-hidden flex-shrink-0">
                            {card?.image ? <CardImage src={card.image} alt={step.cardName} fallbackColor={card?.color || "#333"} /> : <div className="w-full h-full bg-gold/10" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{step.cardName}</p>
                            <p className="text-[10px] text-gold font-semibold">↑ You are here</p>
                          </div>
                        </div>
                      ) : (
                        <Link to={`/cards/${step.cardId}`} className="flex items-center gap-3 rounded-xl p-3 border border-border/30 hover:border-gold/30 transition-colors">
                          <div className="w-12 aspect-[5/3] rounded-lg overflow-hidden flex-shrink-0 opacity-70">
                            {card?.image ? <CardImage src={card.image} alt={step.cardName} fallbackColor={card?.color || "#333"} /> : <div className="w-full h-full bg-secondary/30" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{step.cardName}</p>
                            <p className="text-[10px] text-muted-foreground/50">{step.condition}</p>
                          </div>
                        </Link>
                      )}
                      {i < v3.upgradePath.length - 1 && (
                        <div className="flex items-center gap-1.5 pl-6 py-1">
                          <div className="w-px h-3 bg-border/30" />
                          <span className="text-[8px] text-muted-foreground/40">{v3.upgradePath[i + 1].condition}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
