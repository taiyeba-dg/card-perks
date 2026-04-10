import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FINDER_PRIORITIES } from "./finderTypes";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PrioritiesStep({ selected, onToggle }: Props) {
  return (
    <div className="w-full">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2">Step 1 of 3</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">What matters most to you?</h2>
      <p className="text-sm text-muted-foreground mb-6">Pick up to 3 priorities</p>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {FINDER_PRIORITIES.map((p) => {
          const isActive = selected.includes(p.id);
          const isFull = selected.length >= 3 && !isActive;
          return (
            <motion.button
              key={p.id}
              variants={itemVariants}
              onClick={() => !isFull && onToggle(p.id)}
              disabled={isFull}
              className={`group relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-200 focus:outline-none ${
                isActive
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/15 scale-[1.02]"
                  : isFull
                    ? "border-border/20 opacity-40 cursor-not-allowed"
                    : "border-border/40 hover:border-primary/30 hover:bg-foreground/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{p.icon}</span>
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </motion.span>
                )}
              </div>
              <div>
                <p className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>{p.label}</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{p.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <p className="text-center text-xs text-muted-foreground mt-5">
        {selected.length}/3 selected{selected.length === 0 && " \u2014 pick at least 1"}
      </p>
    </div>
  );
}
