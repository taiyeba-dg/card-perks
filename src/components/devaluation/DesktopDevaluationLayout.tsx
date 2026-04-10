import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CreditCard,
  Lightbulb,
  Shield,
  Zap,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ValueChange, BankSummary } from "@/data/devaluation-data";
import { detectPatterns } from "@/data/devaluation/devaluation-mappings";
import { SparklineChart } from "@/components/devaluation/SparklineChart";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { FilterBar } from "@/components/devaluation/FilterBar";
import { BankIntelCards } from "@/components/devaluation/BankIntelCard";
import { ChangeCard } from "@/components/devaluation/ChangeCard";
import { ReportChangeDrawer } from "@/components/devaluation/ReportChangeDrawer";
import { cn } from "@/lib/utils";

// ── Props ───────────────────────────────────────────────────

interface Props {
  changes: ValueChange[];
  bankSummaries: BankSummary[];
  filters: { type: string; bank: string; category: string; impact: string; time: string };
  setFilter: (key: string, value: string) => void;
  myCardsOnly: boolean;
  setMyCardsOnly: (v: boolean) => void;
  hasMyCards: boolean;
  myCardChangesCount: number;
}

// ── Smart Alert (Intelligence Pulse) ───────────────────────

const DISMISSED_KEY = "cardperks-dismissed-alerts";

function getDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function dismissAlert(id: string) {
  const d = getDismissed();
  d.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...d]));
}

function IntelligenceBrief({ changes }: { changes: ValueChange[] }) {
  const [dismissed, setDismissed] = useState(getDismissed);
  const alert = changes
    .filter((c) => c.impactLevel === "high" && c.changeType === "devaluation")
    .find((c) => !dismissed.has(c.id));

  if (!alert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="mb-24 relative"
    >
      <div className="intelligence-pulse relative bg-surface-1 dark:bg-[hsl(225,15%,9%)] border border-primary/10 p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <h4 className="text-primary font-serif italic font-bold tracking-[0.1em] text-sm mb-2 uppercase">
            Impact Intelligence
          </h4>
          <p className="text-foreground text-lg font-medium tracking-tight">
            Your {alert.cardName}: {alert.estimatedAnnualImpact} impact
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1 font-mono uppercase tracking-wider">
            {alert.title}
          </p>
        </div>
        <div className="flex items-center gap-6 z-10">
          <button
            onClick={() => {
              dismissAlert(alert.id);
              setDismissed(new Set([...dismissed, alert.id]));
            }}
            className="text-[9px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest hover:text-foreground transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Addressed
          </button>
          <Link
            to={`/cards/${alert.cardId}`}
            className="px-6 py-2.5 bg-primary/5 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all rounded-sm"
          >
            {alert.recommendation.split(".")[0].slice(0, 30)}... →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Executive Summary (Event Cards) ────────────────────────

function ExecutiveSummary({ changes }: { changes: ValueChange[] }) {
  const patterns = useMemo(() => detectPatterns(changes), [changes]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="font-serif text-lg font-bold mb-1">No changes found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.6em] mb-8 text-center">
        EXECUTIVE SUMMARY
      </h3>
      {changes.map((change, i) => (
        <ChangeCard
          key={change.id}
          change={change}
          pattern={patterns.get(change.id)}
          isExpanded={expandedCards.has(change.id)}
          onToggle={() => toggleExpand(change.id)}
          variant="desktop"
        />
      ))}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function DesktopDevaluationLayout({
  changes,
  bankSummaries,
  filters,
  setFilter,
  myCardsOnly,
  setMyCardsOnly,
  hasMyCards,
  myCardChangesCount,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);

  // Stats
  const devalCount = changes.filter((c) => c.changeType === "devaluation").length;
  const improvCount = changes.filter((c) => c.changeType === "improvement").length;

  // Monthly frequency for sparkline (last 6 months)
  const monthlyFrequency = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return changes.filter((c) => c.effectiveDate.startsWith(key)).length;
    });
  }, [changes]);

  const handleStatClick = useCallback(
    (type: string) => {
      if (type === "devaluation") setFilter("type", filters.type === "devaluation" ? "all" : "devaluation");
      else if (type === "improvement") setFilter("type", filters.type === "improvement" ? "all" : "improvement");
    },
    [setFilter, filters.type],
  );

  const quickFilters = useMemo(
    () => [
      {
        key: "impact",
        value: "high",
        label: "High Impact",
        icon: <Zap className="w-3.5 h-3.5" />,
      },
      {
        key: "time",
        value: "30d",
        label: "Last 30 Days",
        icon: <Shield className="w-3.5 h-3.5" />,
      },
      ...(hasMyCards
        ? [
            {
              key: "myCards" as string,
              value: "true",
              label: `My Cards (${myCardChangesCount})`,
              icon: <CreditCard className="w-3.5 h-3.5" />,
            },
          ]
        : []),
    ],
    [hasMyCards, myCardChangesCount],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "myCards") {
        setMyCardsOnly(value === "true" ? !myCardsOnly : false);
      } else {
        setFilter(key, value);
      }
    },
    [setFilter, setMyCardsOnly, myCardsOnly],
  );

  // Merge myCardsOnly into filters for FilterBar display
  const displayFilters = useMemo(
    () => ({
      ...filters,
      myCards: myCardsOnly ? "true" : "all",
    }),
    [filters, myCardsOnly],
  );

  return (
    <div className="hidden md:block max-w-[1440px] mx-auto">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-mono text-primary uppercase tracking-[0.6em] mb-4">
              DEVALUATION TRACKER
            </h2>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
              Stay Ahead of <span className="gold-gradient">Point Value Changes</span>
            </h1>
            <p className="text-muted-foreground/80 font-light max-w-xl text-lg leading-relaxed">
              Systematic monitoring of rewards, redemption rates, and membership benefits across premium card portfolios.
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <div className="flex flex-col items-end gap-2">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">
                Changes / month
              </span>
              <SparklineChart
                data={monthlyFrequency}
                width={200}
                height={56}
                color="hsl(var(--primary))"
                showDots
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* KPI Glance Cards (Glassmorphic) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        <button
          onClick={() => handleStatClick("")}
          className="glass-card p-5 border-t-[1.5px] border-t-muted-foreground/40 flex flex-col justify-between h-28 transition-all hover:bg-surface-2/60 dark:hover:bg-[hsl(225,15%,11%)]/60 hover:-translate-y-1 group text-left"
        >
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] group-hover:text-foreground transition-colors">
            Total Changes
          </span>
          <AnimatedCounter
            value={changes.length}
            prefix=""
            className="text-3xl font-bold leading-none"
          />
        </button>
        <button
          onClick={() => handleStatClick("devaluation")}
          className={cn(
            "glass-card p-5 border-t-[1.5px] border-t-red-400/60 flex flex-col justify-between h-28 transition-all hover:bg-surface-2/60 dark:hover:bg-[hsl(225,15%,11%)]/60 hover:-translate-y-1 group text-left",
            filters.type === "devaluation" && "ring-1 ring-red-500/30",
          )}
        >
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] group-hover:text-foreground transition-colors">
            Devaluations
          </span>
          <AnimatedCounter
            value={devalCount}
            prefix=""
            className="text-3xl font-bold leading-none"
          />
        </button>
        <button
          onClick={() => handleStatClick("improvement")}
          className={cn(
            "glass-card p-5 border-t-[1.5px] border-t-primary/40 flex flex-col justify-between h-28 transition-all hover:bg-surface-2/60 dark:hover:bg-[hsl(225,15%,11%)]/60 hover:-translate-y-1 group text-left",
            filters.type === "improvement" && "ring-1 ring-emerald-500/30",
          )}
        >
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] group-hover:text-foreground transition-colors">
            Improvements
          </span>
          <AnimatedCounter
            value={improvCount}
            prefix=""
            className={cn(
              "text-5xl font-bold leading-none",
              improvCount === 0 && "text-foreground/20",
            )}
          />
        </button>
        <div className="glass-card p-5 border-t-[1.5px] border-t-primary/70 flex flex-col justify-between h-28 transition-all hover:bg-surface-2/60 dark:hover:bg-[hsl(225,15%,11%)]/60 hover:-translate-y-1 group">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] group-hover:text-foreground transition-colors">
            Your Exposure
          </span>
          <AnimatedCounter
            value={myCardChangesCount}
            prefix=""
            className="text-3xl font-bold leading-none text-primary"
          />
        </div>
      </motion.div>

      {/* Intelligence Brief */}
      {hasMyCards && <IntelligenceBrief changes={changes} />}

      {/* Bank Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] mb-10 text-center">
          BANK INTELLIGENCE METRICS
        </h3>
        <BankIntelCards
          bankSummaries={bankSummaries}
          onBankClick={(bankId) => setFilter("bank", bankId)}
          activeBank={filters.bank}
        />
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <FilterBar
          filters={displayFilters}
          onFilterChange={handleFilterChange}
          quickFilters={quickFilters}
        />
      </motion.div>

      {/* Executive Summary */}
      <ExecutiveSummary changes={changes} />

      {/* Report FAB */}
      <button
        onClick={() => setReportOpen(true)}
        className="fixed bottom-10 right-10 z-40 flex items-center gap-4 gold-btn px-8 py-4 rounded-full font-bold shadow-[0_20px_40px_rgba(250,204,21,0.2)] hover:scale-105 transition-all"
      >
        <Send className="w-4 h-4" />
        <span className="text-[11px] font-mono uppercase tracking-[0.2em]">Report a Change</span>
      </button>

      {/* Report Drawer */}
      <ReportChangeDrawer open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
