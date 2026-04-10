import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, UtensilsCrossed, ShoppingCart, ShoppingBag, Plane, Fuel,
  Film, Pill, Smartphone, GraduationCap, Home, Banknote, CreditCard,
} from "lucide-react";
import { SpendingSlider } from "@/components/shared/SpendingSlider";
import { FINDER_CATEGORIES, FINDER_PRESETS, type FinderSpending } from "./finderTypes";
import type { LucideIcon } from "lucide-react";

const CAT_ICONS: Record<string, LucideIcon> = {
  dining: UtensilsCrossed,
  groceries: ShoppingCart,
  online: ShoppingBag,
  travel: Plane,
  fuel: Fuel,
  entertainment: Film,
  pharmacy: Pill,
  telecom: Smartphone,
  education: GraduationCap,
  utilities: Home,
  rent: Banknote,
  other: CreditCard,
};

const PRIMARY_CATS = ["dining", "groceries", "online", "travel", "fuel", "entertainment"];
const ADVANCED_CATS = ["pharmacy", "telecom", "education", "utilities", "rent", "other"];

import { PRIORITY_TO_V3_CATEGORIES } from "@/data/category-config";

interface Props {
  spending: FinderSpending;
  onChange: (spending: FinderSpending) => void;
  priorities: string[];
}

export default function SpendingStep({ spending, onChange, priorities }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const total = Object.values(spending).reduce((a, b) => a + b, 0);

  const updateCategory = (id: keyof FinderSpending, value: number) => {
    setActivePreset(null);
    onChange({ ...spending, [id]: value });
  };

  const applyPreset = (preset: (typeof FINDER_PRESETS)[0]) => {
    setActivePreset(preset.id);
    onChange(preset.values);
  };

  const estimatedAnnualValue = Math.round(total * 12 * 0.02);

  const boosted = new Set<string>();
  priorities.forEach((p) => {
    (PRIORITY_TO_V3_CATEGORIES[p] || []).forEach((c) => boosted.add(c));
  });
  const sortedPrimary = [...PRIMARY_CATS].sort((a, b) => (boosted.has(a) ? 0 : 1) - (boosted.has(b) ? 0 : 1));

  const advancedHasValues = ADVANCED_CATS.some((id) => spending[id as keyof FinderSpending] > 0);

  return (
    <div className="w-full">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2">Step 2 of 3</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">How much do you spend each month?</h2>
      <p className="text-sm text-muted-foreground mb-5">Rough estimates work great &mdash; or pick a preset</p>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6 -mx-1 px-1">
        {FINDER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={`shrink-0 text-xs px-4 py-2 rounded-full border font-medium transition-all ${
              activePreset === preset.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {preset.emoji} {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-4">
        {sortedPrimary.map((catId) => {
          const cat = FINDER_CATEGORIES.find((c) => c.id === catId)!;
          const Icon = CAT_ICONS[catId] || CreditCard;
          return (
            <SpendingSlider
              key={cat.id}
              icon={Icon}
              label={cat.label}
              value={spending[cat.id]}
              onChange={(v) => updateCategory(cat.id, v)}
              max={cat.id === "rent" ? 100000 : 50000}
              step={1000}
            />
          );
        })}
      </div>

      <div className="border-t border-border/20 pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 w-full"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {showAdvanced ? "Hide" : "Show"} more categories
          {advancedHasValues && !showAdvanced && <span className="text-primary text-[10px]">(has values)</span>}
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pb-2">
                {ADVANCED_CATS.map((catId) => {
                  const cat = FINDER_CATEGORIES.find((c) => c.id === catId)!;
                  const Icon = CAT_ICONS[catId] || CreditCard;
                  return (
                    <SpendingSlider
                      key={cat.id}
                      icon={Icon}
                      label={cat.label}
                      value={spending[cat.id]}
                      onChange={(v) => updateCategory(cat.id, v)}
                      max={cat.id === "rent" ? 100000 : 50000}
                      step={1000}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 pt-4 border-t border-border/20 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total monthly: <span className="text-primary font-bold text-base">{"\u20B9"}{total.toLocaleString("en-IN")}</span>
          </p>
          {total < 5000 && total > 0 && <p className="text-[10px] text-destructive">Min {"\u20B9"}5,000</p>}
        </div>
        {total >= 5000 && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-muted-foreground">
            Based on your spending, you could earn <span className="text-primary font-semibold">{"\u20B9"}{estimatedAnnualValue.toLocaleString("en-IN")}+/year</span> in rewards
          </motion.p>
        )}
      </div>
    </div>
  );
}
