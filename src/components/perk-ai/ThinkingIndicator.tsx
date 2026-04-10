import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";

interface Props {
  thinkingText: string;
  isActive: boolean;
}

export default function ThinkingIndicator({ thinkingText, isActive }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-2 py-1">
      <button
        onClick={() => !isActive && setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors group"
      >
        {isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Clock className="w-3.5 h-3.5" />
          </motion.div>
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        <span className={isActive ? "animate-pulse" : ""}>{thinkingText}</span>
        {!isActive && (
          <ChevronRight
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </button>
    </div>
  );
}
