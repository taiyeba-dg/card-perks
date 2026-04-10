import { useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Calculator,
  Crown,
  X,
} from "lucide-react";
import CardImage from "@/components/CardImage";
import { getCategoryBySlug, type BestForCategoryDef } from "@/data/best-for/best-for-categories";
import { getTipsForCategory } from "@/data/best-for/best-for-tips";
import {
  buildLeaderboard,
  calcAnnualEarning,
  CATEGORIES,
  type LeaderboardEntry,
} from "@/data/category-leaderboards";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Slider } from "@/components/ui/slider";
import DeepLinkCTA from "@/components/DeepLinkCTA";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────

type SortKey = "rank" | "name" | "rawRate" | "effectiveRate" | "cap" | "fee";
type SortDir = "asc" | "desc";

// ── Sub-components ──────────────────────────────────────────

function FeaturedCardBox({
  entry,
  catLabel,
  isLounge,
}: {
  entry: LeaderboardEntry;
  catLabel: string;
  isLounge?: boolean;
}) {
  const earn10k = calcAnnualEarning(entry, 10000);
  const earn20k = calcAnnualEarning(entry, 20000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-gold/15 mb-10 overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Card image — left column */}
        <div className="w-[240px] shrink-0 bg-secondary/20 flex items-center justify-center p-6">
          {entry.card.image && (
            <div className="w-full aspect-[5/3] rounded-xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/5">
              <CardImage src={entry.card.image} alt={entry.card.name} fallbackColor={entry.card.color} />
            </div>
          )}
        </div>

        {/* Data — right column */}
        <div className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
              #1 for {catLabel}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-1">{entry.card.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">{entry.card.issuer} · {entry.card.network}</p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gold font-mono">
              {isLounge ? `Score: ${Math.round(entry.effectiveRate)}` : `${entry.effectiveRate.toFixed(1)}%`}
            </span>
            <span className="text-sm text-muted-foreground">{isLounge ? "lounge score" : "effective rate"}</span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="glass-card rounded-lg px-4 py-2 text-center border border-border/10">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">At ₹10K/mo</p>
              <p className="font-bold text-gold font-mono text-sm">₹{Math.round(earn10k).toLocaleString("en-IN")}/yr</p>
            </div>
            <div className="glass-card rounded-lg px-4 py-2 text-center border border-border/10">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">At ₹20K/mo</p>
              <p className="font-bold text-gold font-mono text-sm">₹{Math.round(earn20k).toLocaleString("en-IN")}/yr</p>
            </div>
            <div className="glass-card rounded-lg px-4 py-2 text-center border border-border/10">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Fee</p>
              <p className="font-bold text-sm">{entry.card.fee}/yr</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {entry.cap ? (
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20">
                Cap: {entry.cap.toLocaleString()}/{entry.capPeriod}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                No cap
              </span>
            )}
            {entry.hasPortalBoost && (
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold border border-gold/20">Portal boost</span>
            )}
          </div>

          <Link to={`/cards/${entry.card.id}`} className="gold-btn px-5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
            View Card Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function MethodologyBox() {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl p-5 mb-8 text-left border border-border/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>How we rank</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      {open && (
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          Cards are sorted by their effective earning rate for this category (rewards per
          rupee spent). We account for earning caps, portal accelerators, minimum transaction
          requirements, and redemption value.
        </p>
      )}
    </button>
  );
}

// ── Custom Podium ──────────────────────────────────────────

function StitchPodium({ entries, isLounge }: { entries: LeaderboardEntry[]; isLounge?: boolean }) {
  if (entries.length < 3) return null;

  const [second, first, third] = [entries[1], entries[0], entries[2]];

  const PodiumCard = ({
    entry,
    place,
  }: {
    entry: LeaderboardEntry;
    place: 1 | 2 | 3;
  }) => {
    const isWinner = place === 1;
    const placeLabels = { 1: "Winner", 2: "Runner Up", 3: "3rd Place" } as const;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: place === 1 ? 0 : place === 2 ? 0.1 : 0.2 }}
        className={cn(
          "relative flex flex-col items-center text-center",
          isWinner && "md:-translate-y-12",
        )}
      >
        {isWinner && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-8 py-2 rounded-full font-label font-bold text-sm uppercase tracking-wider z-10 whitespace-nowrap">
            {placeLabels[place]}
          </span>
        )}

        <div
          className={cn(
            "w-full rounded-2xl flex flex-col items-center",
            isWinner
              ? "bg-surface-2 dark:bg-[hsl(225,15%,14%)] p-10 border-2 border-primary shadow-[0_0_50px_hsl(var(--gold)/0.15)]"
              : place === 2
                ? "bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-8 rounded-xl border-t border-secondary/20"
                : "bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-8 rounded-xl border-t border-orange-900/30",
          )}
        >
          {!isWinner && (
            <span className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              {placeLabels[place]}
            </span>
          )}

          {entry.card.image && (
            <div className={cn("rounded-xl overflow-hidden shadow-lg shadow-black/20 ring-1 ring-white/5 mb-4", isWinner ? "w-36 aspect-[5/3]" : "w-28 aspect-[5/3]")}>
              <CardImage src={entry.card.image} alt={entry.card.name} fallbackColor={entry.card.color} />
            </div>
          )}

          <h4
            className={cn(
              "font-serif italic mb-1",
              isWinner ? "text-xl" : "text-base",
            )}
          >
            {entry.card.name}
          </h4>

          <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            {entry.card.issuer}
          </p>

          <p
            className={cn(
              "font-bold text-primary font-mono",
              isWinner ? "text-4xl" : "text-2xl",
            )}
            style={isWinner ? { textShadow: "0 0 20px hsl(var(--gold) / 0.3)" } : undefined}
          >
            {isLounge ? Math.round(entry.effectiveRate) : `${entry.effectiveRate.toFixed(1)}%`}
          </p>

          <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mt-1 mb-4">
            {isLounge ? "Lounge Score" : "Effective Rate"}
          </p>

          {!entry.cap ? (
            <span className="px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
              No cap
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-orange-900/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">
              Cap: {entry.cap.toLocaleString()}/{entry.capPeriod}
            </span>
          )}

          <Link
            to={`/cards/${entry.card.id}`}
            className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline font-label uppercase tracking-widest font-bold"
          >
            Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-serif font-bold text-center mb-12">
        Top <span className="gold-gradient">Contenders</span>
      </h2>
      <div className="grid grid-cols-10 gap-6 items-end max-w-5xl mx-auto">
        <div className="col-span-3">
          <PodiumCard entry={second} place={2} />
        </div>
        <div className="col-span-4">
          <PodiumCard entry={first} place={1} />
        </div>
        <div className="col-span-3">
          <PodiumCard entry={third} place={3} />
        </div>
      </div>
    </section>
  );
}

// ── Sortable Leaderboard ────────────────────────────────────

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={cn(
        "py-4 px-5 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-left cursor-pointer select-none hover:text-foreground transition-colors",
        className,
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          currentDir === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

function LeaderboardTable({ entries, isLounge }: { entries: LeaderboardEntry[]; isLounge?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "rank" ? "asc" : "desc");
      }
    },
    [sortKey],
  );

  const sorted = useMemo(() => {
    const indexed = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    return [...indexed].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "name":
          cmp = a.card.name.localeCompare(b.card.name);
          break;
        case "rawRate":
          cmp = a.rawRate - b.rawRate;
          break;
        case "effectiveRate":
          cmp = a.effectiveRate - b.effectiveRate;
          break;
        case "cap":
          cmp = (a.cap ?? Infinity) - (b.cap ?? Infinity);
          break;
        case "fee":
          cmp = a.v3.fees.annual - b.v3.fees.annual;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    }).slice(0, 10);
  }, [entries, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl bg-surface-1 dark:bg-[hsl(225,15%,11%)] border border-border/10 mb-12">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] border-b border-border/20">
          <tr>
            <SortHeader label="#" sortKey="rank" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="w-14 !px-4" />
            <SortHeader label="Card" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-[260px]" />
            <SortHeader label="Raw Rate" sortKey="rawRate" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortHeader label="Eff. Rate" sortKey="effectiveRate" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortHeader label="Cap" sortKey="cap" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <th className="py-4 px-5 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-left">Best Redeem</th>
            <SortHeader label="Fee" sortKey="fee" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => {
            const origIdx = entry.rank - 1;
            const isExpanded = expandedId === entry.card.id;
            return (
              <AnimatePresence key={entry.card.id}>
                <tr
                  className={cn(
                    "border-b border-border/10 hover:bg-surface-2 dark:hover:bg-[hsl(225,15%,14%)] transition-colors cursor-pointer group",
                    origIdx === 0 && "bg-primary/[0.04] border-l-2 border-l-primary",
                    origIdx > 0 && origIdx < 3 && "border-l-2 border-l-muted-foreground/20",
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : entry.card.id)}
                >
                  <td className="py-5 px-4 text-center">
                    {origIdx < 3 ? (
                      <span className="font-mono text-sm font-bold text-primary">{origIdx + 1}</span>
                    ) : (
                      <span className="font-label text-[10px] text-muted-foreground font-mono">{entry.rank}</span>
                    )}
                  </td>
                  <td className="py-4 px-5 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      {entry.card.image && (
                        <div className="w-16 h-10 rounded-lg overflow-hidden shadow-md ring-1 ring-white/10 shrink-0">
                          <CardImage src={entry.card.image} alt="" fallbackColor={entry.card.color} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold group-hover:text-gold transition-colors truncate">{entry.card.name}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.card.issuer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-sm">{entry.rawLabel}</td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-gold text-lg font-mono">
                      {isLounge ? Math.round(entry.effectiveRate) : `${entry.effectiveRate.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {entry.cap ? (
                      <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20">
                        {entry.cap.toLocaleString()}/{entry.capPeriod}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                        None
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-sm text-muted-foreground">
                    {entry.bestRedemptionLabel}
                  </td>
                  <td className="py-4 px-5 text-sm">
                    <span>{entry.card.fee}</span>
                    {entry.v3.fees.waivedOn && (
                      <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                        Waived at {(entry.v3.fees.waivedOn / 100000).toFixed(0)}L
                      </p>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 py-6 bg-surface-2/50 dark:bg-[hsl(225,15%,14%)]/50 border-t border-border/10">
                          <div className="flex items-start gap-8">
                            {entry.card.image && (
                              <img
                                src={entry.card.image}
                                alt={entry.card.name}
                                className="w-36 h-22 object-contain rounded-xl shadow-lg shadow-black/10 shrink-0"
                                loading="lazy"
                              />
                            )}
                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <p className="font-serif italic text-lg">{entry.card.name}</p>
                                <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground">
                                  {entry.card.issuer} &middot; {entry.card.network}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Raw rate: </span>
                                  <span className="font-mono font-medium">{entry.rawLabel}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{isLounge ? "Score: " : "Effective: "}</span>
                                  <span className="font-mono font-bold text-primary">{isLounge ? Math.round(entry.effectiveRate) : `${entry.effectiveRate.toFixed(1)}%`}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Redemption: </span>
                                  <span className="font-mono">{entry.bestRedemptionLabel}</span>
                                </div>
                              </div>

                              {entry.hasPortalBoost && (
                                <div className="text-sm px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 inline-block">
                                  <span className="text-muted-foreground">Portal: </span>
                                  <span className="text-primary font-semibold">
                                    {entry.portalRate?.toFixed(1)}% via {entry.portalName}
                                  </span>
                                  <span className="text-muted-foreground"> on {entry.portalMerchant}</span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {entry.cap ? (
                                  <span className="px-3 py-1 rounded-full bg-orange-900/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">
                                    Cap: {entry.cap.toLocaleString()}/{entry.capPeriod}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                    No cap
                                  </span>
                                )}
                                {entry.minTxn && (
                                  <span className="px-3 py-1 rounded-full bg-surface-1 dark:bg-[hsl(225,15%,11%)] text-muted-foreground text-[10px] font-bold uppercase tracking-widest border border-border/20">
                                    Min txn: {entry.minTxn.toLocaleString()}
                                  </span>
                                )}
                                {entry.note && (
                                  <span className="text-sm text-muted-foreground">{entry.note}</span>
                                )}
                              </div>
                            </div>

                            <Link
                              to={`/cards/${entry.card.id}`}
                              className="text-xs text-primary font-label uppercase tracking-widest font-bold hover:underline flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Card <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Portal Boosts ──────────────────────────────────────────

function PortalBoosts({ entries }: { entries: LeaderboardEntry[] }) {
  const portals = entries.filter((e) => e.hasPortalBoost);
  if (portals.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-xl border border-border/20">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <span>🚀</span> Portal Boosts
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Route purchases through your bank portal for extra rewards:
      </p>
      <div className="space-y-3">
        {portals.map((entry) => (
          <div
            key={entry.card.id}
            className="flex items-center gap-3 text-sm p-3.5 rounded-lg bg-surface-2/50 dark:bg-[hsl(225,15%,14%)]/50 border border-border/10"
          >
            <span className="font-semibold truncate">{entry.card.name}</span>
            <span className="text-muted-foreground shrink-0">
              {entry.effectiveRate.toFixed(1)}% &rarr;{" "}
              <span className="text-primary font-bold font-mono">
                {entry.portalRate?.toFixed(1)}%
              </span>
            </span>
            <span className="text-muted-foreground truncate ml-auto">
              via {entry.portalName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Insights Section ───────────────────────────────────────

function InsightsSection({ categorySlug, entries }: { categorySlug: string; entries: LeaderboardEntry[] }) {
  const tips = getTipsForCategory(categorySlug);
  if (!tips) return null;

  const hasPortals = entries.some((e) => e.hasPortalBoost);

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-serif font-bold mb-8">Insights & <span className="gold-gradient">Tips</span></h2>

      <div className={cn(
        "grid gap-8",
        hasPortals ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-3",
      )}>
        {/* Pro Tips */}
        <div className="glass-card p-6 rounded-xl border border-border/20 border-l-4 border-l-gold/60">
          <h3 className="flex items-center gap-2 font-label uppercase tracking-widest text-sm font-bold mb-6">
            <Lightbulb className="w-4 h-4 text-primary" /> Pro Tips
          </h3>
          <ul className="space-y-6 text-muted-foreground leading-relaxed text-sm">
            {tips.proTips.map((tip, i) => (
              <li key={i} className="pl-5 relative">
                <span className="absolute left-0 top-0 text-primary font-bold">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="glass-card p-6 rounded-xl border border-border/20 border-l-4 border-l-destructive/60">
          <h3 className="flex items-center gap-2 font-label uppercase tracking-widest text-sm font-bold mb-6">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Common Mistakes
          </h3>
          <ul className="space-y-6 text-muted-foreground leading-relaxed text-sm">
            {tips.commonMistakes.map((m, i) => (
              <li key={i} className="pl-5 relative">
                <span className="absolute left-0 top-0 text-destructive font-bold">&bull;</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* When to Switch */}
        <div className="glass-card p-6 rounded-xl border border-border/20 border-l-4 border-l-blue-400/60">
          <h3 className="flex items-center gap-2 font-label uppercase tracking-widest text-sm font-bold mb-6">
            <RefreshCw className="w-4 h-4 text-blue-400" /> When to Switch
          </h3>
          <ul className="space-y-6 text-muted-foreground leading-relaxed text-sm">
            {tips.switchSignals.map((s, i) => (
              <li key={i} className="pl-5 relative">
                <span className="absolute left-0 top-0 text-blue-400 font-bold">&bull;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Portal boosts as a full-width row below the 3-col grid when present */}
      {hasPortals && (
        <div className="mt-8">
          <PortalBoosts entries={entries} />
        </div>
      )}
    </section>
  );
}

// ── Floating Spending Calculator ────────────────────────────

const SPEND_STORAGE_KEY = "cardperks-monthly-spend";

function SpendingCalculator({
  entries,
  catLabel,
}: {
  entries: LeaderboardEntry[];
  catLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [monthlySpend, setMonthlySpend] = useState(() => {
    const stored = localStorage.getItem(SPEND_STORAGE_KEY);
    return stored ? Number(stored) : 15000;
  });

  useEffect(() => {
    localStorage.setItem(SPEND_STORAGE_KEY, String(monthlySpend));
  }, [monthlySpend]);

  const top5 = entries.slice(0, 5);

  const calculations = useMemo(
    () =>
      top5.map((entry) => ({
        name: entry.card.name,
        annual: calcAnnualEarning(entry, monthlySpend),
      })),
    [top5, monthlySpend],
  );

  const maxVal = Math.max(...calculations.map((c) => c.annual), 1);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-surface-2/95 dark:bg-[hsl(225,15%,14%)]/95 backdrop-blur-xl rounded-xl p-6 mb-2 border border-border/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif italic text-lg">Spending Calculator</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              How much do you spend on {catLabel}?
            </p>

            <div className="flex items-center gap-3 mb-5">
              <Slider
                value={[monthlySpend]}
                onValueChange={(v) => setMonthlySpend(v[0])}
                min={0}
                max={50000}
                step={1000}
                className="flex-1"
              />
              <span className="text-sm font-bold font-mono w-24 text-right tabular-nums">
                {monthlySpend.toLocaleString("en-IN")}/mo
              </span>
            </div>

            <div className="space-y-2.5">
              {calculations.map((calc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] w-24 truncate font-label",
                      i === 0 ? "font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {calc.name}
                  </span>
                  <div className="flex-1 h-4 rounded-full bg-surface-1 dark:bg-[hsl(225,15%,11%)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(calc.annual / maxVal) * 100}%` }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className={cn(
                        "h-full rounded-full",
                        i === 0 ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[10px] w-16 text-right tabular-nums",
                      i === 0 ? "text-primary font-bold" : "text-muted-foreground",
                    )}
                  >
                    {Math.round(calc.annual).toLocaleString("en-IN")}/yr
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-surface-2/95 dark:bg-[hsl(225,15%,14%)]/95 backdrop-blur-xl rounded-xl px-5 py-3.5 border border-border/20 shadow-2xl flex items-center gap-2 text-sm font-medium hover:border-primary/30 transition-colors"
        >
          <Calculator className="w-4 h-4 text-primary" />
          <span className="font-label uppercase tracking-wider text-xs">Calculator</span>
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {monthlySpend.toLocaleString("en-IN")}/mo
          </span>
        </button>
      )}
    </div>
  );
}

// ── Related Categories ──────────────────────────────────────

function RelatedCategories({ slugs }: { slugs: string[] }) {
  const related = slugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter(Boolean) as typeof CATEGORIES;

  if (related.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="font-serif italic text-2xl mb-6">Also See</h3>
      <div className="flex gap-3 flex-wrap">
        {related.map((cat) => (
          <Link
            key={cat.slug}
            to={`/best-for/${cat.slug}`}
            className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl px-5 py-3 font-label text-xs uppercase tracking-[0.15em] hover:border-primary/30 border border-border/10 transition-colors flex items-center gap-2"
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function DesktopBestForCategory({
  category,
}: {
  category: string;
}) {
  const catDef = getCategoryBySlug(category) as BestForCategoryDef;
  const entries = useMemo(() => buildLeaderboard(category), [category]);
  const tips = getTipsForCategory(category);
  const winner = entries[0];
  const isLounge = catDef.isSpecial === "lounge";

  return (
    <div className="container mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-muted-foreground pt-16 mb-10">
        <Link to="/best-for" className="hover:text-primary transition-colors">
          All Categories
        </Link>
        <span className="text-border">/</span>
        <span className="text-foreground">{catDef.label}</span>
      </nav>

      {/* Header Section */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{catDef.emoji}</span>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Best Credit Cards for
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold">
              <span className="gold-gradient">{catDef.label}</span>
            </h1>
          </div>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mt-6 mb-6">
          {catDef.longDescription}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-4 py-1.5 bg-surface-1 dark:bg-[hsl(225,15%,11%)] text-primary font-label text-xs uppercase tracking-[0.15em] border border-border/30 rounded">
            {entries.length} Cards Ranked
          </span>
          {catDef.searchKeywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="px-4 py-1.5 bg-surface-1 dark:bg-[hsl(225,15%,11%)] text-primary font-label text-xs uppercase tracking-[0.15em] border border-border/30 rounded"
            >
              {kw}
            </span>
          ))}
        </div>

        {tips && (
          <blockquote className="text-lg italic text-muted-foreground border-l-2 border-primary/30 pl-6 max-w-2xl leading-relaxed">
            &ldquo;{tips.editorialVerdict}&rdquo;
          </blockquote>
        )}
      </section>

      {/* Featured Card Box */}
      {winner && <FeaturedCardBox entry={winner} catLabel={catDef.label} isLounge={isLounge} />}

      {/* Methodology */}
      <MethodologyBox />

      {/* Podium Section */}
      <StitchPodium entries={entries} isLounge={isLounge} />

      {/* Ranking Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-serif font-bold mb-6">Full <span className="gold-gradient">Rankings</span></h2>
        <LeaderboardTable entries={entries} isLounge={isLounge} />
      </section>

      {/* Insights Section (Pro Tips + Common Mistakes + When to Switch in 3-col grid + Portal Boosts) */}
      <InsightsSection categorySlug={category} entries={entries} />

      {/* Related Categories */}
      <RelatedCategories slugs={catDef.relatedSlugs} />

      {/* Footer CTA */}
      <section className="pb-20">
        <DeepLinkCTA
          to="/find-my-card"
          emoji="&#128241;"
          title="Not sure which card is right?"
          subtitle="Take the Card Finder Quiz for personalized recommendations"
        />
      </section>

      {/* Floating Calculator */}
      <SpendingCalculator entries={entries} catLabel={catDef.label} />
    </div>
  );
}
