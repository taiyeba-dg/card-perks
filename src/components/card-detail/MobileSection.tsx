import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface MobileSectionProps {
  id?: string;
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentColor?: string;
}

export default function MobileSection({
  id,
  icon: Icon,
  title,
  defaultOpen = false,
  children,
  accentColor,
}: MobileSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="glass-card rounded-2xl overflow-hidden mb-4 sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ touchAction: "manipulation" }}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor ? `${accentColor}18` : "hsl(var(--gold) / 0.1)" }}
        >
          <Icon className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-border/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
