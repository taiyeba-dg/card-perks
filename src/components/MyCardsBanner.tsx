import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, CreditCard, ArrowRight } from "lucide-react";
import { useMyCards } from "@/hooks/use-my-cards";

const DISMISSED_KEY = "cardperks-insights-banner-dismissed";

export function MyCardsBanner() {
  const { count } = useMyCards();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === "true"; } catch { return false; }
  });

  if (count > 0 || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(false);
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-gold/[0.06] border-b border-gold/15">
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CreditCard className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-xs text-foreground">
                <span className="hidden sm:inline">💳 Add your cards to get personalized insights across CardPerks.</span>
                <span className="sm:hidden">Add your cards for personalized insights.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/my-cards"
                className="text-xs text-gold font-semibold hover:text-gold/80 transition-colors flex items-center gap-1"
              >
                Add My Cards <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
