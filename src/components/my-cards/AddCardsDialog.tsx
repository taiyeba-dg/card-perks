import { useState, useMemo } from "react";
import { CreditCard, Star, Plus, Check, Search } from "lucide-react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cards } from "@/data/cards";

interface Props {
  isMyCard: (id: string) => boolean;
  toggleMyCard: (id: string) => void;
}

export default function AddCardsDialogContent({ isMyCard, toggleMyCard }: Props) {
  const [search, setSearch] = useState("");
  const filtered = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer.toLowerCase().includes(search.toLowerCase())
  );

  const issuerGroups = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((card) => {
      if (!groups[card.issuer]) groups[card.issuer] = [];
      groups[card.issuer].push(card);
    });
    return Object.entries(groups);
  }, [filtered]);

  return (
    <DialogContent className="max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="font-serif text-xl">Add Cards to Wallet</DialogTitle>
      </DialogHeader>
      <div className="relative mt-2 mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or issuer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary/30 border-border/20 text-sm h-10"
        />
      </div>
      <div className="space-y-4 overflow-y-auto flex-1 min-h-0 -mx-6 px-6 pb-2" role="listbox" aria-label="Available credit cards">
        {issuerGroups.map(([issuer, issuerCards]) => (
          <div key={issuer}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
              {issuer}
            </p>
            <div className="space-y-1.5">
              {issuerCards.map((card) => {
                const added = isMyCard(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleMyCard(card.id)}
                    role="option"
                    aria-selected={added}
                    aria-label={card.name}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      added
                        ? "border-gold/40 bg-gold/5"
                        : "border-border/30 hover:border-border/60 bg-secondary/10"
                    }`}
                    style={{ borderLeftWidth: 3, borderLeftColor: card.color }}
                  >
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0">
                      {card.image ? (
                        <img src={card.image} alt={`${card.name} credit card`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: card.color + "22" }}>
                          <CreditCard className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{card.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{card.fee}/yr</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                          {card.rating}
                        </span>
                        <span>{card.rewards}</span>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        added ? "bg-gold text-background" : "bg-secondary/40"
                      }`}
                    >
                      {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {issuerGroups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No cards match "{search}"</p>
        )}
      </div>
    </DialogContent>
  );
}
