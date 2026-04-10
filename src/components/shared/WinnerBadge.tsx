import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WinnerBadgeProps {
  label?: string;
  className?: string;
}

export function WinnerBadge({ label = "Best", className }: WinnerBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.2 }}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        "bg-primary text-primary-foreground",
        className
      )}
      style={{ boxShadow: "0 0 12px hsla(43, 80%, 50%, 0.3)" }}
    >
      {label}
    </motion.span>
  );
}
