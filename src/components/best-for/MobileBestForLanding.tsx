import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { BEST_FOR_CATEGORIES, getSeasonalFeatured, getCategoryBySlug } from "@/data/best-for/best-for-categories";
import { findMultiCategoryWinners } from "@/data/best-for/best-for-mappings";
import { buildLeaderboard, calcAnnualEarning } from "@/data/category-leaderboards";
import DeepLinkCTA from "@/components/DeepLinkCTA";
import { cn } from "@/lib/utils";

// ── Data ────────────────────────────────────────────────────

function useTileData() {
  return useMemo(() => {
    let totalCards = 0;
    const tiles = BEST_FOR_CATEGORIES.map((cat) => {
      const lb = buildLeaderboard(cat.slug);
      const top = lb[0];
      totalCards += lb.length;
      return {
        slug: cat.slug,
        label: cat.label,
        emoji: cat.emoji,
        gradient: cat.gradient,
        topCard: top?.card.name ?? "\u2014",
        bestRate: top?.effectiveRate ?? 0,
        cardCount: lb.length,
      };
    });
    return { tiles, totalCards };
  }, []);
}

function useFeaturedData() {
  return useMemo(() => {
    const cat = getSeasonalFeatured();
    const lb = buildLeaderboard(cat.slug);
    const winner = lb[0];
    const earning15k = winner ? calcAnnualEarning(winner, 15000) : 0;
    return { cat, winner, earning15k };
  }, []);
}

function useMultiCategoryWinners() {
  return useMemo(() => {
    const leaderboards: Record<string, { cardId: string; cardName: string; rate: number }[]> = {};
    for (const cat of BEST_FOR_CATEGORIES) {
      const lb = buildLeaderboard(cat.slug);
      leaderboards[cat.slug] = lb.map((e) => ({
        cardId: e.card.id,
        cardName: e.card.name,
        rate: e.effectiveRate,
      }));
    }
    return findMultiCategoryWinners(leaderboards);
  }, []);
}

// ── Component ───────────────────────────────────────────────

export default function MobileBestForLanding() {
  const { tiles, totalCards } = useTileData();
  const { cat: featuredCat, winner, earning15k } = useFeaturedData();
  const multiWinners = useMultiCategoryWinners();

  return (
    <div className="px-6">
      {/* Hero Header */}
      <section className="mb-10 pt-6">
        <h2 className="font-serif text-4xl leading-tight mb-4">
          Find the Top Card for Every Type of Spending
        </h2>
        <p className="text-muted-foreground font-light text-lg max-w-xs">
          Curated selections across {BEST_FOR_CATEGORIES.length} categories.
        </p>
      </section>

      {/* Featured Seasonal Card (Bento Style) */}
      {winner && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            to={`/best-for/${featuredCat.slug}`}
            className="block relative overflow-hidden rounded-3xl bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-6 min-h-[18rem]"
          >
            <div className="z-10 relative max-w-[60%]">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-widest rounded-full mb-3 font-label">
                Featured This Season
              </span>
              <h3 className="font-serif text-2xl mb-2">
                {winner.card.name}
              </h3>
              <p className="text-muted-foreground text-sm font-light mb-1">
                {featuredCat.emoji} {featuredCat.label}
              </p>
              <div className="flex items-baseline gap-2 mb-1 mt-3">
                <span className="text-2xl text-primary font-bold font-mono tabular-nums">
                  {winner.effectiveRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground">effective rate</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">
                \u20B9{Math.round(earning15k).toLocaleString("en-IN")}/yr at \u20B915K/mo
              </p>
              <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 active:scale-95 transition-transform">
                See Rankings
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Tilted card image */}
            {winner.card.image && (
              <div className="absolute -right-8 bottom-2 w-52 h-32 transform rotate-[-12deg]">
                <img
                  src={winner.card.image}
                  alt={winner.card.name}
                  className="w-full h-full object-contain rounded-xl shadow-2xl"
                  loading="lazy"
                />
              </div>
            )}
          </Link>
        </motion.section>
      )}

      {/* Category Grid (2-column tiles with icon) */}
      <section className="grid grid-cols-2 gap-4 mb-12">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={`/best-for/${tile.slug}`}
              data-slug={tile.slug}
              className="block bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-2xl p-5 active:scale-[0.96] active:bg-surface-2 dark:active:bg-[hsl(225,15%,14%)] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 mb-6">
                <span className="text-xl">{tile.emoji}</span>
              </div>
              <h4 className="font-medium text-base mb-1 leading-tight">
                {tile.label}
              </h4>
              {tile.cardCount > 0 ? (
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-label">
                  Top {tile.cardCount} Cards
                </p>
              ) : (
                <p className="text-muted-foreground/60 text-[10px] uppercase tracking-wider font-label">
                  Coming soon
                </p>
              )}
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Secondary Banner */}
      <section className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] rounded-3xl p-8 mb-12 border border-border/10">
        <h3 className="font-serif text-2xl mb-3 italic">
          Bespoke Curation
        </h3>
        <p className="text-muted-foreground font-light text-sm leading-relaxed mb-6">
          Every recommendation is backed by live data, reward calculations, and real-world redemption values.
        </p>
        <Link
          to="/find-my-card"
          className="flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase group"
        >
          Take Card Finder Quiz
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Multi-Category Winners */}
      {multiWinners.length > 0 && (
        <section className="mb-6">
          <div className="glass-card rounded-2xl p-5 border border-primary/20">
            <h2 className="font-serif text-base font-bold mb-3 flex items-center gap-2">
              <span className="text-primary text-lg">
                <Trophy className="w-5 h-5" />
              </span>
              Multi-Category Champions
            </h2>
            <div className="space-y-2.5">
              {multiWinners.map((w) => {
                const catDefs = w.categories
                  .map((slug) => getCategoryBySlug(slug))
                  .filter(Boolean);
                return (
                  <Link
                    key={w.cardId}
                    to={`/cards/${w.cardId}`}
                    className="block p-3 rounded-xl bg-secondary/5 border border-border/10 active:scale-[0.98] transition-transform"
                  >
                    <p className="text-xs font-bold mb-1.5">{w.cardName}</p>
                    <div className="flex flex-wrap gap-1">
                      {catDefs.map((cat) => (
                        <span
                          key={cat!.slug}
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                            cat!.iconBg,
                            cat!.accentColor,
                          )}
                        >
                          {cat!.emoji} {cat!.label}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="pb-10">
        <DeepLinkCTA
          to="/find-my-card"
          emoji="\u{1F4F1}"
          title="Not sure which card is right?"
          subtitle="Take the Card Finder Quiz"
          compact
        />
      </section>
    </div>
  );
}
