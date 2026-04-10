import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useMyCards } from "@/hooks/use-my-cards";
import CardImage from "@/components/CardImage";

export default function NavMyCardsIndicator() {
  const { count, myCardObjects, clearAll } = useMyCards();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => count > 0 ? setOpen(!open) : window.location.href = "/my-cards"}
        className="relative p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50"
        aria-label="My Cards"
        aria-expanded={open}
      >
        <Wallet className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-background text-[9px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 glass-card rounded-xl overflow-hidden py-1 z-50 border border-border/40 shadow-xl"
              onMouseLeave={() => setOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border/20">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">MY CARDS ({count})</p>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {myCardObjects.map((entry) => (
                  <Link
                    key={entry.cardId}
                    to={`/cards/${entry.cardId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
                      {entry.card.image ? (
                        <CardImage src={entry.card.image} alt="" fallbackColor={entry.card.color} />
                      ) : (
                        <div className="w-full h-full" style={{ background: entry.card.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{entry.card.name}</p>
                      <p className="text-[9px] text-muted-foreground">{entry.card.issuer}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-border/20 px-3 py-2 space-y-1">
                <Link
                  to="/my-cards"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-xs text-gold hover:text-gold/80 transition-colors font-medium py-1"
                >
                  <Wallet className="w-3 h-3" /> My Cards Dashboard →
                </Link>
                <Link
                  to="/cards"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <Plus className="w-3 h-3" /> Add Another Card
                </Link>
                <button
                  onClick={() => { clearAll(); setOpen(false); }}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors py-1 w-full text-left"
                >
                  <Trash2 className="w-3 h-3" /> Clear My Cards
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
