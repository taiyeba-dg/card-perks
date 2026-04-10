import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { QuizStep } from "./quizData";
import { STEPS } from "./quizData";

export default function StepView({
  step,
  stepIndex,
  selected,
  onSelect,
}: {
  step: QuizStep;
  stepIndex: number;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">
        {step.emoji} {step.question}
      </h2>
      <p className="text-sm text-muted-foreground mb-7">Pick one that best fits you.</p>

      <div className="grid grid-cols-2 gap-3">
        {step.options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200 focus:outline-none ${
                isActive
                  ? "border-gold bg-gold/10 shadow-md shadow-gold/15"
                  : "border-border/40 hover:border-gold/30 hover:bg-foreground/[0.03]"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{opt.icon}</span>
              <span className={`font-medium text-sm ${isActive ? "text-gold" : "text-foreground"}`}>
                {opt.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="check"
                  className="ml-auto w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="w-3 h-3 text-background" />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
