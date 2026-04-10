import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Check } from "lucide-react";
import type { CardV3 } from "@/data/card-v3-unified-types";

interface Props {
  card: CardV3;
}

export default function LifestylePerksSection({ card }: Props) {
  const [open, setOpen] = useState(false);

  const dining = card.features.dining;
  const entertainment = card.features.entertainment;
  const golf = card.features.golf;
  const memberships = card.features.memberships;
  const concierge = card.features.concierge;
  const movies = card.features.movies;

  // Only show if at least one lifestyle perk exists
  const hasDining = dining && (dining.culinaryTreats || dining.acceleratedDining);
  const hasEntertainment = entertainment && typeof entertainment === "object";
  const hasGolf = golf && typeof golf === "object" && golf.included;
  const hasMemberships = memberships && (Array.isArray(memberships) ? memberships.length > 0 : typeof memberships === "string");
  const hasConcierge = concierge && (concierge === true || (typeof concierge === "object" && concierge.included));
  const hasMovies = movies && typeof movies === "object" && movies.included;

  if (!hasDining && !hasEntertainment && !hasGolf && !hasMemberships && !hasConcierge && !hasMovies) {
    return null;
  }

  const perks: { icon: string; title: string; description: string }[] = [];

  if (hasDining && dining) {
    perks.push({
      icon: "🍽️",
      title: "Dining",
      description: dining.culinaryTreatsText || dining.acceleratedDiningText || "Dining privileges included",
    });
  }

  if (hasGolf && golf && typeof golf === "object") {
    perks.push({
      icon: "⛳",
      title: "Golf",
      description: golf.text || "Complimentary golf access",
    });
  }

  if (hasMovies && movies && typeof movies === "object") {
    perks.push({
      icon: "🎬",
      title: "Movies",
      description: movies.text || `${movies.platform || "Movie"} benefits`,
    });
  }

  if (hasEntertainment && entertainment && typeof entertainment === "object") {
    const ent = entertainment as Record<string, unknown>;
    if (ent.bookMyShow && typeof ent.bookMyShow === "object") {
      const bms = ent.bookMyShow as { offer?: string };
      if (bms.offer) {
        perks.push({ icon: "🎭", title: "BookMyShow", description: bms.offer });
      }
    }
  }

  if (hasConcierge) {
    const text = typeof concierge === "object" && concierge !== null && "text" in concierge
      ? (concierge as { text?: string }).text || "24/7 Concierge service"
      : "24/7 Concierge service";
    perks.push({ icon: "🛎️", title: "Concierge", description: text });
  }

  if (hasMemberships && memberships) {
    const mList = Array.isArray(memberships)
      ? memberships.map((m) => m.name).join(", ")
      : typeof memberships === "string" ? memberships : "";
    if (mList) {
      perks.push({ icon: "🏷️", title: "Memberships", description: mList });
    }
  }

  if (perks.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base font-semibold">Lifestyle Perks</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">{perks.length}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
              {perks.map((perk) => (
                <div key={perk.title} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                  <span className="text-lg flex-shrink-0">{perk.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{perk.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{perk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
