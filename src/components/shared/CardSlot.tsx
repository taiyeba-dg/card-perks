import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDisplayName } from "@/lib/card-display";

export interface CardSlotCard {
  id: string;
  name: string;
  bank?: string;
  image?: string;
}

interface CardSlotProps {
  card?: CardSlotCard | null;
  onAdd?: () => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { wrapper: "w-36", container: "p-3", img: "aspect-[1.6/1]", text: "text-xs" },
  md: { wrapper: "w-48", container: "p-4", img: "aspect-[1.6/1]", text: "text-sm" },
  lg: { wrapper: "w-60", container: "p-5", img: "aspect-[1.6/1]", text: "text-base" },
};

export function CardSlot({
  card,
  onAdd,
  onRemove,
  size = "md",
  className,
}: CardSlotProps) {
  const s = sizes[size];

  return (
    <div className={cn("relative", s.wrapper, className)}>
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative w-full rounded-xl border border-white/10 dark:border-white/10 border-border",
              "flex flex-col items-center overflow-hidden group",
              "bg-surface-1 dark:bg-[hsl(225,15%,9%)]",
              s.container
            )}
          >
            {card.image && (
              <div className={cn("w-full rounded-lg overflow-hidden mb-3 shadow-2xl ring-1 ring-white/10 dark:ring-white/10 ring-border/20", s.img)}>
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="text-center w-full">
              <h4 className={cn("font-bold text-center truncate px-2", s.text)}>
                {getDisplayName({ name: card.name, issuer: card.bank })}
              </h4>
              {card.bank && (
                <p className="text-[10px] text-muted-foreground/50 text-center mt-0.5 truncate">
                  {card.bank}
                </p>
              )}
            </div>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-black/80 dark:bg-black/80 bg-destructive backdrop-blur-md flex items-center justify-center text-white hover:text-red-400 transition-colors border border-white/10 dark:border-white/10 border-border/20"
                aria-label={`Remove ${card.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onAdd}
            className={cn(
              "w-full rounded-xl",
              "bg-surface-1 dark:bg-[hsl(225,15%,11%)] border border-white/10 dark:border-white/10 border-border/20",
              "flex flex-col items-center justify-center gap-2",
              "transition-all hover:border-primary/50 group cursor-pointer",
              s.container,
              "min-h-[120px]",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-white/5 dark:bg-white/5 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary font-label">
              Add Card
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
