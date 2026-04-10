import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Calculator,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getCategoryBySlug, type BestForCategoryDef } from "@/data/best-for/best-for-categories";
import { getTipsForCategory } from "@/data/best-for/best-for-tips";
import {
  buildLeaderboard,
  calcAnnualEarning,
  CATEGORIES,
  type LeaderboardEntry,
} from "@/data/category-leaderboards";
import { Slider } from "@/components/ui/slider";
import DeepLinkCTA from "@/components/DeepLinkCTA";
import { cn } from "@/lib/utils";

// ── Accordion helper ────────────────────────────────────────

function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-2xl overflow-hidden border border-border/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 font-label text-[11px] font-bold uppercase tracking-widest">
          {icon} {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/10 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Champion Hero Section ───────────────────────────────────

function ChampionHero({
  winner,
  catDef,
  entries,
  tips,
  isLounge,
}: {
  winner: LeaderboardEntry;
  catDef: BestForCategoryDef;
  entries: LeaderboardEntry[];
  tips: ReturnType<typeof getTipsForCategory>;
  isLounge?: boolean;
}) {
  const earn10k = calcAnnualEarning(winner, 10000);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-6 mb-6"
    >
      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, hsl(var(--gold) / 0.05) 0%, transparent 50%)",
        }}
      />

      <div className="relative">
        {/* Label */}
        <p className="font-label text-primary text-[10px] uppercase tracking-[0.2em] mb-2">
          Best for {catDef.label}
        </p>

        {/* Title */}
        <h1 className="font-serif text-4xl font-bold leading-tight mb-4">
          {winner.card.name}
        </h1>

        {/* Metric badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] px-3 py-1 rounded-full font-label text-[11px] text-muted-foreground uppercase tracking-wider">
            {isLounge ? `Score: ${Math.round(winner.effectiveRate)}` : `${winner.effectiveRate.toFixed(1)}% Eff. Rate`}
          </span>
          <span className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] px-3 py-1 rounded-full font-label text-[11px] text-muted-foreground uppercase tracking-wider">
            {entries.length} Cards Ranked
          </span>
          {!winner.cap ? (
            <span className="bg-emerald-500/10 px-3 py-1 rounded-full font-label text-[11px] text-emerald-500 uppercase tracking-wider">
              No Cap
            </span>
          ) : (
            <span className="bg-amber-500/10 px-3 py-1 rounded-full font-label text-[11px] text-amber-500 uppercase tracking-wider">
              Cap: {winner.cap.toLocaleString()}/{winner.capPeriod}
            </span>
          )}
        </div>

        {/* Featured card image with glow */}
        {winner.card.image && (
          <div className="relative flex justify-center mb-3">
            {/* Glow effect */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-48 h-32 bg-primary/15 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <img
                src={winner.card.image}
                alt={winner.card.name}
                className="w-44 h-28 object-contain rounded-xl shadow-xl shadow-black/20 relative z-10"
                loading="lazy"
              />
              {/* RANKED #1 badge */}
              <span className="absolute -bottom-4 -right-2 bg-primary text-primary-foreground px-4 py-2 font-bold text-xs rounded-lg shadow-lg z-20 font-label tracking-wider">
                RANKED #1
              </span>
            </div>
          </div>
        )}

        {/* Issuer and earning info */}
        <div className="mt-6 text-center">
          <p className="font-label text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            {winner.card.issuer} / {winner.card.network}
          </p>
          <p className="text-[11px] text-muted-foreground">
            At 10K/mo earn{" "}
            <span className="text-primary font-bold font-mono">
              {Math.round(earn10k).toLocaleString("en-IN")}/yr
            </span>
          </p>
        </div>

        {/* Editorial verdict */}
        {tips && tips.editorialVerdict && (
          <p className="text-[11px] italic text-muted-foreground mt-4 text-center leading-relaxed font-serif">
            "{tips.editorialVerdict}"
          </p>
        )}
      </div>
    </motion.section>
  );
}

// ── Podium (Vertical Stack) ────────────────────────────────

function MobilePodium({ entries, isLounge }: { entries: LeaderboardEntry[]; isLounge?: boolean }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 2) return null;

  const rankLabels = [
    { rank: "01", label: "Champion", accent: "text-primary" },
    { rank: "02", label: "Runner Up", accent: "text-muted-foreground" },
    { rank: "03", label: "Bronze Tier", accent: "text-muted-foreground" },
  ];

  return (
    <section className="mb-6">
      <h2 className="font-serif text-2xl italic mb-4">Top Contenders</h2>

      <div className="space-y-3">
        {top3.map((entry, i) => {
          const isFirst = i === 0;
          const { rank, label, accent } = rankLabels[i];

          return (
            <motion.div
              key={entry.card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/cards/${entry.card.id}`}
                className={cn(
                  "block rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform",
                  isFirst
                    ? "bg-surface-2 dark:bg-[hsl(225,15%,14%)] border border-primary/40 scale-105 my-2 shadow-[0_0_30px_hsl(var(--gold)/0.1)]"
                    : "bg-surface-1 dark:bg-[hsl(225,15%,11%)] border border-border/20",
                )}
              >
                {/* Subtle glow for 1st place */}
                {isFirst && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative flex items-start gap-4">
                  {/* Card image */}
                  {entry.card.image && (
                    <img
                      src={entry.card.image}
                      alt=""
                      className={cn(
                        "object-contain rounded-lg shadow-sm shrink-0",
                        isFirst ? "w-20 h-12" : "w-16 h-10",
                      )}
                      loading="lazy"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Rank label */}
                    <p className={cn("font-bold text-[10px] tracking-widest uppercase mb-1", accent)}>
                      {rank} / {label}
                    </p>

                    {/* Card name */}
                    <h3 className={cn(
                      "font-serif font-bold leading-snug truncate",
                      isFirst ? "text-xl" : "text-base",
                    )}>
                      {entry.card.name}
                    </h3>

                    {/* Issuer */}
                    <p className="font-label text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      {entry.card.issuer}
                    </p>
                  </div>

                  {/* Rate */}
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-serif font-bold tabular-nums",
                      isFirst ? "text-3xl text-primary" : "text-2xl",
                    )}>
                      {isLounge ? Math.round(entry.effectiveRate) : (
                        <>{entry.effectiveRate.toFixed(1)}<span className={cn("font-label", isFirst ? "text-lg" : "text-sm")}>%</span></>
                      )}
                    </p>
                    <p className="font-label text-[9px] text-muted-foreground uppercase tracking-wider">
                      {isLounge ? "lounge score" : "eff. rate"}
                    </p>
                  </div>
                </div>

                {/* First place details button */}
                {isFirst && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {entry.hasPortalBoost && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label text-[9px] uppercase tracking-wider">
                          Portal Boost
                        </span>
                      )}
                      <span className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] px-2 py-0.5 rounded-full font-label text-[9px] text-muted-foreground uppercase tracking-wider">
                        {entry.card.fee}/yr
                      </span>
                    </div>
                    <span className="bg-primary text-primary-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg font-label">
                      Details
                    </span>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ── Market Insights Section ─────────────────────────────────

function MarketInsights({
  entries,
  catLabel,
  tips,
  isLounge,
}: {
  entries: LeaderboardEntry[];
  catLabel: string;
  tips: ReturnType<typeof getTipsForCategory>;
  isLounge?: boolean;
}) {
  const avgRate = entries.length
    ? entries.reduce((sum, e) => sum + e.effectiveRate, 0) / entries.length
    : 0;
  const uncappedCount = entries.filter((e) => !e.cap).length;
  const portalCount = entries.filter((e) => e.hasPortalBoost).length;

  return (
    <section className="mb-6">
      <h2 className="font-serif text-2xl italic mb-4">Market Insights</h2>

      <div className="space-y-3">
        {/* Spending insight */}
        <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-6 rounded-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl font-bold mb-1">Category Landscape</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {entries.length} cards compete for {catLabel}. The top {isLounge ? "score" : "rate"} is{" "}
                <span className="text-primary font-bold font-mono">
                  {isLounge ? Math.round(entries[0]?.effectiveRate ?? 0) : `${entries[0]?.effectiveRate.toFixed(1)}%`}
                </span>
                , while the average sits at{" "}
                <span className="font-mono font-semibold">
                  {isLounge ? Math.round(avgRate) : `${avgRate.toFixed(1)}%`}
                </span>.
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] p-5 rounded-2xl">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-label text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Uncapped
                </p>
                <p className="font-serif text-2xl font-bold">{uncappedCount}</p>
                <p className="font-label text-[10px] text-muted-foreground uppercase tracking-wider">
                  of {entries.length} cards
                </p>
              </div>
            </div>
          </div>
          <div className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] p-5 rounded-2xl">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-label text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Portal Boost
                </p>
                <p className="font-serif text-2xl font-bold">{portalCount}</p>
                <p className="font-label text-[10px] text-muted-foreground uppercase tracking-wider">
                  cards eligible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict insight */}
        {tips && tips.editorialVerdict && (
          <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl font-bold mb-1">Our Verdict</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  "{tips.editorialVerdict}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Ranking Table (horizontal scroll) ───────────────────────

function RankingTable({ entries, isLounge }: { entries: LeaderboardEntry[]; isLounge?: boolean }) {
  if (entries.length === 0) return null;

  const top10 = entries.slice(0, 10);

  return (
    <section className="mb-6">
      <h2 className="font-serif text-2xl italic mb-4">Full Rankings</h2>

      <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-surface-2 dark:bg-[hsl(225,15%,14%)] border-b border-border/10">
                <th className="p-4 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-left w-10">
                  #
                </th>
                <th className="p-4 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-left">
                  Card
                </th>
                <th className="p-4 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                  Eff. Rate
                </th>
                <th className="p-4 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                  Cap
                </th>
                <th className="p-4 font-label text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody>
              {top10.map((entry, i) => {
                const rank = i + 1;
                return (
                  <tr
                    key={entry.card.id}
                    className={cn(
                      "border-b border-border/5 transition-colors",
                      i === 0 && "bg-primary/[0.04]",
                    )}
                  >
                    <td className="p-4">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/cards/${entry.card.id}`}
                        className="flex items-center gap-3 active:opacity-70 transition-opacity"
                      >
                        {entry.card.image ? (
                          <img
                            src={entry.card.image}
                            alt=""
                            className="w-10 h-6 object-contain bg-surface-2 dark:bg-[hsl(225,15%,14%)] rounded border border-border/20 shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-6 bg-surface-2 dark:bg-[hsl(225,15%,14%)] rounded border border-border/20 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{entry.card.name}</p>
                          <p className="font-label text-[9px] text-muted-foreground uppercase tracking-wider">
                            {entry.card.issuer}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-sm text-primary tabular-nums">
                        {isLounge ? Math.round(entry.effectiveRate) : `${entry.effectiveRate.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-label text-[10px] text-muted-foreground uppercase tracking-wider">
                        {entry.cap
                          ? `${entry.cap.toLocaleString()}/${entry.capPeriod}`
                          : "None"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-label text-[10px] text-muted-foreground">
                        {entry.card.fee}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Bottom Sheet Calculator ─────────────────────────────────

const SPEND_STORAGE_KEY = "cardperks-monthly-spend";

function BottomSheetCalculator({
  entries,
  catLabel,
}: {
  entries: LeaderboardEntry[];
  catLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const dragControls = useDragControls();
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
      top5.map((e) => ({
        name: e.card.name,
        annual: calcAnnualEarning(e, monthlySpend),
      })),
    [top5, monthlySpend],
  );

  const maxVal = Math.max(...calculations.map((c) => c.annual), 1);

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-50 bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl px-4 py-3 border border-border/20 shadow-lg shadow-black/15 flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-widest"
        >
          <Calculator className="w-4 h-4 text-primary" />
          Calculate Earnings
          <span className="ml-auto text-[10px] text-muted-foreground font-mono normal-case tracking-normal">
            {monthlySpend.toLocaleString("en-IN")}/mo
          </span>
        </motion.button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-t-2xl border-t border-border/20 shadow-xl shadow-black/20 max-h-[70vh] overflow-auto"
            >
              {/* Drag handle */}
              <div
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-5 pb-6">
                <p className="font-label text-[10px] text-primary uppercase tracking-[0.2em] mb-1">
                  Spending Calculator
                </p>
                <h4 className="font-serif font-bold text-lg mb-0.5">Estimate Your Earnings</h4>
                <p className="font-label text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
                  How much on {catLabel}?
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
                    {monthlySpend.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {calculations.map((calc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-label text-[10px] w-24 truncate uppercase tracking-wider",
                          i === 0 ? "font-bold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {calc.name}
                      </span>
                      <div className="flex-1 h-5 rounded-full bg-surface-2 dark:bg-[hsl(225,15%,14%)] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(calc.annual / maxVal) * 100}%` }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className={cn(
                            "h-full rounded-full",
                            i === 0 ? "bg-primary" : "bg-muted-foreground/30",
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "font-mono text-xs w-16 text-right tabular-nums",
                          i === 0 ? "text-primary font-bold" : "text-muted-foreground",
                        )}
                      >
                        {Math.round(calc.annual).toLocaleString("en-IN")}/yr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function MobileBestForCategory({
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
    <div className="px-4 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 font-label text-[10px] text-muted-foreground uppercase tracking-widest pt-6 mb-4">
        <Link to="/best-for" className="hover:text-primary transition-colors">
          All Categories
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">{catDef.label}</span>
      </nav>

      {/* Champion Hero Section */}
      {winner && (
        <ChampionHero winner={winner} catDef={catDef} entries={entries} tips={tips} isLounge={isLounge} />
      )}

      {/* Podium (Vertical Stack) */}
      <MobilePodium entries={entries} isLounge={isLounge} />

      {/* Market Insights */}
      <MarketInsights entries={entries} catLabel={catDef.label} tips={tips} isLounge={isLounge} />

      {/* Ranking Table (horizontal scroll) */}
      <RankingTable entries={entries} isLounge={isLounge} />

      {/* Collapsible Sections */}
      <div className="space-y-3 mb-6">
        {/* Portal Boosts */}
        {entries.some((e) => e.hasPortalBoost) && (
          <Accordion title="Portal Boosts" icon={<span>🚀</span>}>
            <div className="space-y-2">
              {entries
                .filter((e) => e.hasPortalBoost)
                .map((entry) => (
                  <div
                    key={entry.card.id}
                    className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 dark:bg-[hsl(225,15%,14%)]"
                  >
                    <span className="font-label text-[10px] font-bold truncate flex-1 uppercase tracking-wider">
                      {entry.card.name}
                    </span>
                    <span className="font-label text-[10px] text-muted-foreground shrink-0 uppercase tracking-wider">
                      {entry.effectiveRate.toFixed(1)}%{" "}
                      <span className="text-muted-foreground/40 mx-0.5">&rarr;</span>{" "}
                      <span className="text-primary font-bold font-mono normal-case tracking-normal">
                        {entry.portalRate?.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </Accordion>
        )}

        {/* Pro Tips */}
        {tips && (
          <Accordion
            title="Pro Tips"
            icon={<Lightbulb className="w-4 h-4 text-primary" />}
          >
            <ul className="space-y-2.5 mb-4">
              {tips.proTips.map((tip, i) => (
                <li
                  key={i}
                  className="text-[11px] text-muted-foreground leading-relaxed pl-4 relative"
                >
                  <span className="absolute left-0 text-primary font-bold">+</span>
                  {tip}
                </li>
              ))}
            </ul>

            {tips.commonMistakes.length > 0 && (
              <>
                <p className="flex items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Avoid
                </p>
                <ul className="space-y-2 mb-4">
                  {tips.commonMistakes.map((m, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-muted-foreground leading-relaxed pl-4 relative"
                    >
                      <span className="absolute left-0 text-amber-500 font-bold">-</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tips.switchSignals.length > 0 && (
              <>
                <p className="flex items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest mb-2">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-500" /> When to Switch
                </p>
                <ul className="space-y-2">
                  {tips.switchSignals.map((s, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-muted-foreground leading-relaxed pl-4 relative"
                    >
                      <span className="absolute left-0 text-sky-500 font-bold">~</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Accordion>
        )}
      </div>

      {/* Related Categories -- horizontal scroll */}
      {catDef.relatedSlugs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-serif text-2xl italic mb-3">Also See</h3>
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
            {catDef.relatedSlugs
              .map((s) => CATEGORIES.find((c) => c.slug === s))
              .filter(Boolean)
              .map((cat) => (
                <Link
                  key={cat!.slug}
                  to={`/best-for/${cat!.slug}`}
                  className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl px-4 py-2.5 font-label text-[10px] font-bold uppercase tracking-widest border border-border/20 shrink-0 flex items-center gap-2 active:scale-[0.97] transition-transform"
                >
                  <span className="text-sm">{cat!.emoji}</span>
                  {cat!.label}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <DeepLinkCTA
        to="/find-my-card"
        emoji="📱"
        title="Not sure which card is right?"
        subtitle="Take the Card Finder Quiz"
        compact
      />

      {/* Bottom Sheet Calculator */}
      <BottomSheetCalculator entries={entries} catLabel={catDef.label} />
    </div>
  );
}
