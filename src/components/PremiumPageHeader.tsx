import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Search, X, LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { playSound } from "@/lib/sounds";

interface StatPill {
  icon: LucideIcon;
  text: string;
  /** Render a custom element instead of an icon (e.g. pulse dot) */
  customIcon?: ReactNode;
}

interface FilterChip {
  label: string;
  count: number;
  value?: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface FooterAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface PremiumPageHeaderProps {
  accentLabel: string;
  title: ReactNode;
  subtitle: string;
  stats: StatPill[];
  /** Rendered between stats and search — e.g. tab switcher */
  afterStats?: ReactNode;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterChip[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  resultCount: number;
  resultLabel: string;
  /** Extra text after the count, e.g. filter/search context */
  resultSuffix?: ReactNode;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  footerAction?: FooterAction;
  /** Rendered between search and filter chips — e.g. Platform/Category toggle */
  beforeFilters?: ReactNode;
  /** When true, hides search bar, filter chips, sort, count, and footer action */
  hideControls?: boolean;
}

export default function PremiumPageHeader({
  accentLabel,
  title,
  subtitle,
  stats,
  afterStats,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  resultCount,
  resultLabel,
  resultSuffix,
  sortValue,
  onSortChange,
  sortOptions,
  footerAction,
  beforeFilters,
  hideControls,
}: PremiumPageHeaderProps) {
  return (
    <div className="space-y-6 mb-6">
      {/* Glass container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl p-4 sm:p-8 lg:p-10 overflow-hidden border border-border/30 backdrop-blur-xl"
        style={{ background: "hsl(var(--glass) / 0.5)" }}
      >
        {/* Decorative layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-transparent to-gold/[0.03] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gold/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-2 sm:space-y-6">
          {/* Accent label */}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-gold"
          >
            {accentLabel}
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-xl sm:text-4xl lg:text-5xl font-bold leading-tight"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-base text-muted-foreground max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3"
          >
            {stats.map((stat) => (
              <span
                key={stat.text}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-medium text-muted-foreground whitespace-nowrap transition-all duration-150 cursor-default border border-border/30 hover:border-gold/20"
                style={{ background: "hsl(var(--foreground) / 0.03)" }}
              >
                {stat.customIcon ?? (
                  <stat.icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                )}
                {stat.text}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* After-stats slot (e.g. tab switcher) */}
      {afterStats}

      {/* Controls: Search + Filters + Footer — hidden when hideControls is true */}
      {!hideControls && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-4"
      >
        {/* Search bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 h-11 text-sm rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-150"
            style={{ background: "hsl(var(--foreground) / 0.03)" }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {beforeFilters}

        {/* Filter chips */}
        <div className="scroll-fade-container flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((chip) => {
            const filterValue = chip.value ?? chip.label;
            const isActive = activeFilter === filterValue;
            return (
              <button
                key={filterValue}
                onClick={() => { playSound("switch"); onFilterChange(filterValue); }}
                className={`text-xs px-4 py-[7px] rounded-[20px] whitespace-nowrap transition-all duration-150 font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer hover:-translate-y-px ${
                  isActive
                    ? "bg-gold text-background shadow-md shadow-gold/20 font-semibold"
                    : "border border-border/40 hover:bg-secondary/60 hover:border-gold/20 text-muted-foreground hover:text-foreground"
                }`}
                style={!isActive ? { background: "hsl(var(--foreground) / 0.03)" } : undefined}
              >
                {chip.label}
                <span className={`text-[10px] ${isActive ? "text-background/70" : "text-muted-foreground/50"}`}>
                  ({chip.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <p className="text-sm font-medium text-muted-foreground">
            {resultCount} {resultLabel}
            {resultSuffix}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Sort:</span>
              <Select value={sortValue} onValueChange={onSortChange}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-secondary/40 border-border/40 rounded-[10px] hover:border-gold/30 transition-colors duration-150 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {footerAction && (
              footerAction.href ? (
                <a
                  href={footerAction.href}
                  className="gold-btn px-5 py-2 rounded-[10px] text-xs flex items-center gap-1.5 font-semibold shadow-lg shadow-gold/15 hover:shadow-gold/25 transition-all duration-150 no-underline"
                >
                  {footerAction.icon} {footerAction.label}
                </a>
              ) : (
                <button
                  onClick={footerAction.onClick}
                  className="gold-btn px-5 py-2 rounded-[10px] text-xs flex items-center gap-1.5 font-semibold shadow-lg shadow-gold/15 hover:shadow-gold/25 transition-all duration-150"
                >
                  {footerAction.icon} {footerAction.label}
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
