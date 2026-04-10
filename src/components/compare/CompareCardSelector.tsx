import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type CreditCard } from "@/data/cards";
import CardImage from "@/components/CardImage";

interface CardSelectorProps {
  cards: CreditCard[];
  onSelect: (card: CreditCard) => void;
  selectedIds: string[];
  slotIndex: number;
}

export default function CompareCardSelector({
  cards,
  onSelect,
  selectedIds,
}: CardSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const available = cards.filter(
    (c) =>
      !selectedIds.includes(c.id) &&
      (() => {
        if (!search.trim()) return true;
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        const hay = (c.name + " " + c.issuer).toLowerCase();
        return words.every(w => hay.includes(w));
      })()
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative w-48" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-32 rounded-xl bg-surface-1 dark:bg-[hsl(225,15%,11%)] border border-dashed border-border/30 dark:border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/50 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 dark:bg-white/5 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary font-label">
          Add Card
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 glass-card-v2 rounded-xl p-3 max-h-72 overflow-auto w-72 shadow-2xl"
          >
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search 180+ cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="space-y-0.5">
              {available.slice(0, 20).map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    onSelect(card);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary/50 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-6 rounded overflow-hidden shrink-0 shadow-sm">
                    {card.image ? (
                      <CardImage src={card.image} alt="" fallbackColor={card.color} />
                    ) : (
                      <div className="w-full h-full" style={{ background: card.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block text-xs text-foreground">{card.name}</span>
                    <span className="text-[10px] text-muted-foreground">{card.issuer}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-primary">
                    <Star className="w-2.5 h-2.5 fill-primary" />
                    {card.rating}
                  </div>
                </button>
              ))}
              {available.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No cards found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
