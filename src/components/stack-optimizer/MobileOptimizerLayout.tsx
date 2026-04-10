import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, SlidersHorizontal } from "lucide-react";
import type { OptimizerResult } from "./optimizerEngine";

interface Props {
  inputPanel: React.ReactNode;
  resultPanel: React.ReactNode;
  result: OptimizerResult | null;
}

export default function MobileOptimizerLayout({
  inputPanel,
  resultPanel,
  result,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <>
      {/* Segmented Toggle */}
      <div className="flex bg-surface-2 dark:bg-[hsl(225,15%,14%)] p-1 rounded-xl mb-8">
        <button
          onClick={() => setStep(1)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
            step === 1
              ? "bg-surface-1 dark:bg-[hsl(225,15%,9%)] text-primary shadow-lg border border-border/10"
              : "text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Setup
        </button>
        <button
          onClick={() => result && setStep(2)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
            step === 2
              ? "bg-surface-1 dark:bg-[hsl(225,15%,9%)] text-primary shadow-lg border border-border/10"
              : "text-muted-foreground"
          } ${!result ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Results
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {inputPanel}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {resultPanel}
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-surface-1/95 dark:bg-[hsl(225,15%,9%)]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-t border-border/10 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-label">
              Optimized Value
            </p>
            <p
              className="text-sm font-bold text-primary font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {"\u20B9"}
              {result.totalOptimized.toLocaleString("en-IN")}/yr
            </p>
          </div>
          <button
            onClick={() => setStep(step === 1 ? 2 : 1)}
            className="text-[10px] text-primary-foreground font-bold px-4 py-2 rounded-lg bg-primary uppercase tracking-widest"
          >
            {step === 1 ? "View Results \u2192" : "\u2190 Edit Stack"}
          </button>
        </div>
      )}
    </>
  );
}
