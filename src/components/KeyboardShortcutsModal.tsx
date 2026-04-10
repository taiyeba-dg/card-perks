import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const groups = [
  {
    label: "Navigation",
    shortcuts: [
      { keys: ["H"],       description: "Go to Home" },
      { keys: ["V"],       description: "Go to Vouchers" },
      { keys: ["C"],       description: "Go to Cards" },
    ],
  },
  {
    label: "Actions",
    shortcuts: [
      { keys: ["⌘", "K"],  description: "Open search" },
      { keys: ["T"],       description: "Toggle theme" },
      { keys: ["?"],       description: "Show this help" },
      { keys: ["Esc"],     description: "Close modals" },
    ],
  },
];

function Key({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-bold bg-gold/10 text-gold border border-gold/25 font-mono leading-none select-none">
      {label}
    </kbd>
  );
}

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="kbd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="kbd-panel"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-[81] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="glass-card rounded-2xl border border-gold/20 shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_0_1px_hsl(var(--gold)/0.12)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold leading-tight">Keyboard Shortcuts</h2>
                    <p className="text-[10px] text-muted-foreground">Press <span className="text-gold font-medium">?</span> anytime to toggle</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcut groups */}
              <div className="px-5 py-4 space-y-5">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                      {group.label}
                    </p>
                    <div className="space-y-1.5">
                      {group.shortcuts.map((s) => (
                        <div key={s.description} className="flex items-center justify-between gap-4 py-1">
                          <span className="text-sm text-foreground/80">{s.description}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s.keys.map((k) => <Key key={k} label={k} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="px-5 pb-4">
                <div className="h-px bg-border/20 mb-3" />
                <p className="text-[10px] text-muted-foreground text-center">
                  Shortcuts are disabled while typing in inputs
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
