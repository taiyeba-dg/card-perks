import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so it doesn't flash during initial paint
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-20 left-4 right-4 z-[60] flex justify-center pointer-events-none lg:bottom-4"
        >
          <div className="glass-card rounded-2xl border border-border/40 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-2xl w-full pointer-events-auto">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4 text-gold" />
            </div>

            {/* Text */}
            <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience. By continuing, you agree to our{" "}
              <Link to="/privacy" className="text-gold hover:underline font-medium" onClick={accept}>
                Privacy Policy
              </Link>
              .
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={dismiss}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground border border-border/40 hover:border-gold/30 hover:text-foreground transition-all duration-150"
              >
                Manage Preferences
              </button>
              <button
                onClick={accept}
                className="flex-1 sm:flex-none gold-btn px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Accept
              </button>
            </div>

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
