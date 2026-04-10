import { TrendingDown, TrendingUp, RefreshCw, XCircle } from "lucide-react";

// -- Type Styling Config --
export const CHANGE_TYPE_CONFIG = {
  devaluation: {
    icon: TrendingDown,
    label: "DEVALUATION",
    color: "text-red-400",
    borderColor: "border-l-red-500",
    bg: "bg-red-500/10",
    badge: "bg-red-500/15 text-red-400",
    ringColor: "#ef4444",
  },
  improvement: {
    icon: TrendingUp,
    label: "IMPROVEMENT",
    color: "text-emerald-400",
    borderColor: "border-l-emerald-500",
    bg: "bg-emerald-500/10",
    badge: "bg-emerald-500/15 text-emerald-400",
    ringColor: "#10b981",
  },
  modification: {
    icon: RefreshCw,
    label: "MODIFICATION",
    color: "text-amber-400",
    borderColor: "border-l-amber-500",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/15 text-amber-400",
    ringColor: "#f59e0b",
  },
  discontinued: {
    icon: XCircle,
    label: "DISCONTINUED",
    color: "text-muted-foreground",
    borderColor: "border-l-muted-foreground",
    bg: "bg-secondary/30",
    badge: "bg-secondary/40 text-muted-foreground",
    ringColor: "#6b7280",
  },
} as const;

// -- Impact Level Config --
export const IMPACT_CONFIG = {
  high: { label: "High Impact", shortLabel: "High", dot: "bg-red-500", badge: "bg-red-500/15 text-red-400" },
  medium: { label: "Medium Impact", shortLabel: "Medium", dot: "bg-amber-500", badge: "bg-amber-500/15 text-amber-400" },
  low: { label: "Low Impact", shortLabel: "Low", dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" },
} as const;

// -- Filter Definitions --
export const FILTER_DEFINITIONS = {
  type: {
    key: "type",
    label: "Change Type",
    options: [
      { value: "all", label: "All Types", emoji: "" },
      { value: "devaluation", label: "Devaluations", emoji: "\u{1F4C9}" },
      { value: "improvement", label: "Improvements", emoji: "\u{1F4C8}" },
      { value: "modification", label: "Modifications", emoji: "\u{1F504}" },
    ],
  },
  bank: {
    key: "bank",
    label: "Bank",
    options: [
      { value: "all", label: "All Banks", emoji: "" },
      { value: "hdfc", label: "HDFC", emoji: "" },
      { value: "axis", label: "Axis", emoji: "" },
      { value: "sbi", label: "SBI", emoji: "" },
      { value: "icici", label: "ICICI", emoji: "" },
      { value: "other", label: "Other Banks", emoji: "" },
    ],
  },
  category: {
    key: "category",
    label: "Category",
    options: [
      { value: "all", label: "All Categories", emoji: "" },
      { value: "redemption", label: "Redemption", emoji: "\u{1F4B3}" },
      { value: "portal", label: "Portal", emoji: "\u{1F6D2}" },
      { value: "lounge", label: "Lounge", emoji: "\u2708\uFE0F" },
      { value: "fee", label: "Fee", emoji: "\u{1F4B0}" },
      { value: "milestone", label: "Milestone", emoji: "\u{1F3C6}" },
      { value: "earning-rate", label: "Earning Rate", emoji: "\u{1F4CA}" },
    ],
  },
  impact: {
    key: "impact",
    label: "Impact",
    options: [
      { value: "all", label: "All Impact", emoji: "" },
      { value: "high", label: "High", emoji: "\u{1F534}" },
      { value: "medium", label: "Medium", emoji: "\u{1F7E1}" },
      { value: "low", label: "Low", emoji: "\u{1F7E2}" },
    ],
  },
  time: {
    key: "time",
    label: "Time Period",
    options: [
      { value: "all", label: "All Time", emoji: "" },
      { value: "30d", label: "Last 30 Days", emoji: "" },
      { value: "3m", label: "Last 3 Months", emoji: "" },
      { value: "6m", label: "Last 6 Months", emoji: "" },
    ],
  },
} as const;

// -- Bank Chart Colors (for trend visualizations) --
export const BANK_CHART_COLORS: Record<string, string> = {
  hdfc: "#004B87",
  axis: "#97144D",
  sbi: "#22409A",
  icici: "#F58220",
  other: "#6B7280",
};
