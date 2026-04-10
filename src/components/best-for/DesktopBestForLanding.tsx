import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Crown, TrendingUp } from "lucide-react";
import { BEST_FOR_CATEGORIES, getSeasonalFeatured, getCategoryBySlug } from "@/data/best-for/best-for-categories";
import { getBentoLayout, findMultiCategoryWinners } from "@/data/best-for/best-for-mappings";
import { buildLeaderboard, calcAnnualEarning } from "@/data/category-leaderboards";
import CardImage from "@/components/CardImage";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import DeepLinkCTA from "@/components/DeepLinkCTA";

function useTileData() {
  return useMemo(() => {
    const tiles = getBentoLayout();
    let totalCards = 0;
    const enriched = tiles.map((tile) => {
      const lb = buildLeaderboard(tile.category.slug);
      const top = lb[0];
      totalCards += lb.length;
      return { ...tile, topCard: top?.card.name ?? "\u2014", topCardImage: top?.card.image, topCardColor: top?.card.color, bestRate: top?.effectiveRate ?? 0, cardCount: lb.length };
    });
    return { tiles: enriched, totalCards };
  }, []);
}

function useMultiCategoryWinners() {
  return useMemo(() => {
    const leaderboards: Record<string, { cardId: string; cardName: string; rate: number }[]> = {};
    for (const cat of BEST_FOR_CATEGORIES) {
      const lb = buildLeaderboard(cat.slug);
      leaderboards[cat.slug] = lb.map((e) => ({ cardId: e.card.id, cardName: e.card.name, rate: e.effectiveRate }));
    }
    return findMultiCategoryWinners(leaderboards);
  }, []);
}

function useFeaturedData() {
  return useMemo(() => {
    const cat = getSeasonalFeatured();
    const lb = buildLeaderboard(cat.slug);
    const top3 = lb.slice(0, 3);
    const winner = top3[0];
    const earning15k = winner ? calcAnnualEarning(winner, 15000) : 0;
    return { cat, top3, winner, earning15k };
  }, []);
}

/* ── Hero ── */
function HeroSection({ totalCards, featured }: { totalCards: number; featured: ReturnType<typeof useFeaturedData> }) {
  const { cat, top3, winner } = featured;

  return (
    <section className="relative pt-8 pb-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-15" style={{ background: "radial-gradient(circle at 70% 40%, hsl(var(--gold)) 0%, transparent 45%)", filter: "blur(100px)" }} />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight">
            Best Credit Card for{" "}
            <span className="gold-gradient">Every Category</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Data-powered rankings across {BEST_FOR_CATEGORIES.length} spending categories.{" "}
            <span className="text-foreground font-semibold"><AnimatedCounter value={totalCards} suffix="+" className="text-foreground font-semibold text-lg" /></span>{" "}
            cards analyzed.
          </p>
          <Link to={`/best-for/${cat.slug}`} className="gold-btn px-7 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            Explore {cat.label} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured top 3 preview */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-2xl p-5 border border-gold/10">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Featured: {cat.label}</span>
            </div>
            <div className="space-y-3">
              {top3.map((entry, i) => (
                <Link key={entry.card.id} to={`/cards/${entry.card.id}`} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-secondary/30 transition-colors group">
                  <span className={`text-xs font-mono font-bold w-5 ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>{i + 1}</span>
                  <div className="w-14 h-[34px] rounded-lg overflow-hidden ring-1 ring-white/10 shadow-md shrink-0">
                    <CardImage src={entry.card.image ?? ""} alt="" fallbackColor={entry.card.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-gold transition-colors">{entry.card.name}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.card.issuer}</p>
                  </div>
                  <span className={`text-sm font-bold font-mono ${i === 0 ? "text-gold" : "text-foreground"}`}>{entry.effectiveRate.toFixed(1)}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Category Grid ── */
function CategoryGrid({ tiles }: { tiles: ReturnType<typeof useTileData>["tiles"] }) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-1">All Categories</h2>
            <p className="text-sm text-muted-foreground">Find the best card for every type of spending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile, i) => (
            <motion.div key={tile.category.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/best-for/${tile.category.slug}`} className="group block glass-card rounded-xl p-5 border border-border/20 hover:border-gold/30 transition-all h-full">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{tile.category.emoji}</span>
                  {tile.topCardImage && (
                    <div className="w-14 h-[34px] rounded-lg overflow-hidden ring-1 ring-white/10 shadow-md opacity-60 group-hover:opacity-100 transition-opacity">
                      <CardImage src={tile.topCardImage} alt="" fallbackColor={tile.topCardColor || "#0D0D0D"} />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-gold transition-colors">{tile.category.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{tile.category.shortDescription}</p>
                <div className="flex items-center justify-between">
                  {tile.cardCount > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gold text-xs font-bold">{tile.bestRate.toFixed(1)}%</span>
                      <span className="text-[10px] text-muted-foreground">{tile.cardCount} cards</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Multi-Category Winners ── */
function MultiCategoryWinners({ winners }: { winners: ReturnType<typeof useMultiCategoryWinners> }) {
  if (winners.length === 0) return null;

  return (
    <section className="py-12 max-w-7xl mx-auto px-6">
      <div className="glass-card rounded-2xl p-6 border border-gold/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-Category Champions</h2>
            <p className="text-xs text-muted-foreground">These cards rank #1 in multiple categories</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {winners.map((winner) => {
            const catDefs = winner.categories.map((slug) => getCategoryBySlug(slug)).filter(Boolean);
            return (
              <Link key={winner.cardId} to={`/cards/${winner.cardId}`} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/10 hover:border-gold/20 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-2 group-hover:text-gold transition-colors">{winner.cardName}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {catDefs.map((cat) => (
                      <span key={cat!.slug} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold">{cat!.emoji} {cat!.label}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-gold transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Main ── */
export default function DesktopBestForLanding() {
  const { tiles, totalCards } = useTileData();
  const featured = useFeaturedData();
  const multiWinners = useMultiCategoryWinners();

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground pt-8 mb-2 px-6 max-w-7xl mx-auto">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-foreground">Best Cards by Category</span>
      </nav>

      <HeroSection totalCards={totalCards} featured={featured} />
      <CategoryGrid tiles={tiles} />
      <MultiCategoryWinners winners={multiWinners} />

      <section className="pb-16 px-6 max-w-5xl mx-auto">
        <DeepLinkCTA to="/find-my-card" icon={TrendingUp} title="Can't decide? Take our Card Finder Quiz" subtitle="Get personalized credit card recommendations based on your spending." />
      </section>
    </div>
  );
}
