import { motion } from "framer-motion";

export default function MatchRing({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r={r} stroke="hsl(var(--border))" strokeWidth="3.5" />
        <motion.circle
          cx="24" cy="24" r={r}
          stroke="hsl(var(--gold))"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.1, delay, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        className="text-[11px] font-bold text-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        {pct}%
      </motion.span>
    </div>
  );
}
