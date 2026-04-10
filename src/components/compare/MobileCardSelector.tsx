import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type CreditCard } from "@/data/cards";
import CardImage from "@/components/CardImage";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const popularCardNames = [
  "HDFC Infinia",
  "Axis Magnus",
  "AMEX Platinum",
  "SBI Elite",
  "HDFC Diners Black",
];

interface MobileCardSelectorProps {
  cards: CreditCard[];
  onSelect: (card: CreditCard) => void;
  selectedIds: string[];
  slotIndex: number;
}

export default function MobileCardSelector({
  cards,
  onSelect,
  selectedIds,
}: MobileCardSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  if (!isMobile) return null;

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

  const popularCards = cards.filter(
    (c) =>
      popularCardNames.some((name) =>
        c.name.toLowerCase().includes(name.toLowerCase())
      ) && !selectedIds.includes(c.id)
  );

  const grouped = available.reduce(
    (acc, card) => {
      const key = card.issuer;
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    },
    {} as Record<string, CreditCard[]>
  );

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="w-[calc(50%-0.5rem)] h-24 rounded-xl border border-dashed border-border/30 dark:border-white/10 bg-surface-1 dark:bg-[hsl(225,15%,11%)] flex flex-col items-center justify-center gap-1.5 transition-all hover:border-primary/50 group cursor-pointer p-2"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Plus className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
        </motion.div>
        <span className="text-xs text-muted-foreground">Add Card</span>
      </motion.button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Select a Card</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 text-sm rounded-xl"
              />
            </div>
          </div>

          {!search && popularCards.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Popular
              </p>
              <div className="flex flex-wrap gap-2">
                {popularCards.slice(0, 5).map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      onSelect(card);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-xs text-primary font-medium hover:bg-primary/10 transition-colors"
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {search
              ? available.map((card) => (
                  <CardListItem
                    key={card.id}
                    card={card}
                    disabled={selectedIds.includes(card.id)}
                    onSelect={() => {
                      onSelect(card);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))
              : Object.entries(grouped)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([bank, bankCards]) => (
                    <div key={bank} className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
                        {bank}
                      </p>
                      {bankCards.map((card) => (
                        <CardListItem
                          key={card.id}
                          card={card}
                          disabled={selectedIds.includes(card.id)}
                          onSelect={() => {
                            onSelect(card);
                            setOpen(false);
                            setSearch("");
                          }}
                        />
                      ))}
                    </div>
                  ))}
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No cards found
              </p>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function CardListItem({
  card,
  disabled,
  onSelect,
}: {
  card: CreditCard;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className="w-full text-left py-3 px-3 rounded-xl flex items-center gap-3 hover:bg-secondary/50 transition-colors disabled:opacity-40 mb-0.5"
    >
      <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
        {card.image ? (
          <CardImage src={card.image} alt="" fallbackColor={card.color} />
        ) : (
          <div
            className="w-full h-full rounded"
            style={{ background: card.color }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{card.name}</p>
        <p className="text-xs text-muted-foreground">
          {card.issuer} &middot; {card.network}
        </p>
      </div>
      <div className="flex items-center gap-0.5 text-xs text-primary">
        <Star className="w-3 h-3 fill-primary" />
        {card.rating}
      </div>
    </button>
  );
}
