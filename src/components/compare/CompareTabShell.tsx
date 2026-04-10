import { motion } from "framer-motion";
import type { CompareCard } from "./CompareUtils";
import CardImage from "@/components/CardImage";

export const compareContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const compareRowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

interface CompareRowProps {
  label: string;
  icon?: string;
  values: { cardId: string; display: React.ReactNode; isWinner: boolean }[];
  className?: string;
}

export function CompareRow({
  label,
  icon,
  values,
  className = "",
}: CompareRowProps) {
  const hasWinner = values.some((v) => v.isWinner);

  return (
    <motion.div
      variants={compareRowVariants}
      className={`flex border-b last:border-b-0 border-border/20 transition-opacity ${
        !hasWinner ? "compare-row-same" : ""
      } ${className}`}
    >
      <div className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 border-r border-border/20 bg-secondary/5 sticky left-0 z-10">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">
          {label}
        </span>
      </div>
      {values.map((v) => (
        <div
          key={v.cardId}
          className={`flex-1 min-w-[120px] sm:min-w-[150px] flex items-center gap-1.5 px-3 sm:px-4 py-3 border-r last:border-r-0 border-border/20 ${
            v.isWinner
              ? "bg-primary/[0.06]"
              : !hasWinner
                ? "opacity-60"
                : ""
          }`}
        >
          <div className="text-xs sm:text-sm flex-1">{v.display}</div>
          {v.isWinner && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground shrink-0"
              style={{ boxShadow: "0 0 8px hsla(43, 80%, 50%, 0.2)" }}
            >
              Best
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}

export function CompareColumnHeaders({
  compareCards,
}: {
  compareCards: CompareCard[];
}) {
  return (
    <div className="flex border-b border-border/30 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
      <div className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] flex-shrink-0 border-r border-border/20 sticky left-0 z-30 bg-background/95 backdrop-blur-sm" />
      {compareCards.map(({ card }) => (
        <div
          key={card.id}
          className="flex-1 min-w-[120px] sm:min-w-[150px] p-3 border-r last:border-r-0 border-border/20 text-center"
        >
          <div className="relative w-[80px] sm:w-[100px] aspect-[5/3] rounded-lg overflow-hidden shadow-lg shadow-black/30 mx-auto mb-2">
            {card.image ? (
              <CardImage
                src={card.image}
                alt={card.name}
                fallbackColor={card.color}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}88)`,
                }}
              />
            )}
          </div>
          <p className="text-[10px] sm:text-xs font-semibold truncate">
            {card.name}
          </p>
          <p className="text-[9px] text-muted-foreground">{card.fee}/yr</p>
        </div>
      ))}
    </div>
  );
}

export function CompareRowsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={compareContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function CompareTableWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/30 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">{children}</div>
    </div>
  );
}
