import { motion } from "framer-motion";
import { X } from "lucide-react";
import { type CreditCard } from "@/data/cards";
import CardImage from "@/components/CardImage";

interface StickyHeaderProps {
  selected: CreditCard[];
  onRemove: (id: string) => void;
  visible: boolean;
}

export default function CompareStickyHeader({
  selected,
  onRemove,
  visible,
}: StickyHeaderProps) {
  if (!visible || selected.length < 2) return null;
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-16 sm:top-20 left-0 right-0 z-30 glass-card-v2 shadow-lg shadow-background/50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {selected.map((card) => (
            <div key={card.id} className="flex items-center gap-2">
              <div className="w-10 h-[26px] rounded-lg overflow-hidden shadow-sm shrink-0">
                {card.image ? (
                  <CardImage
                    src={card.image}
                    alt={card.name}
                    fallbackColor={card.color}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: card.color }}
                  />
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-[120px]">
                {card.name}
              </span>
              <button
                onClick={() => onRemove(card.id)}
                className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
