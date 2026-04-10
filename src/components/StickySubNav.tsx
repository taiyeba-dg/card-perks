import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  id: string;       // matches the HTML element id to scroll to
  label: string;
}

interface StickySubNavProps {
  items: SubNavItem[];
  /** id of the element whose bottom edge triggers the bar to appear */
  triggerRef: React.RefObject<HTMLElement | null>;
  className?: string;
  /** Optional custom click handler. If provided, it's called instead of the default scroll behavior. */
  onItemClick?: (id: string) => void;
}

/**
 * A glass-card sticky sub-navigation bar that:
 * - appears after scrolling past `triggerRef`
 * - highlights the active section via IntersectionObserver
 * - smooth-scrolls to the target section on click
 */
export default function StickySubNav({ items, triggerRef, className, onItemClick }: StickySubNavProps) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const indicatorRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Show/hide based on hero scroll position
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [triggerRef]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionEls = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (!sectionEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          setActive(intersecting[0].target.id);
        }
      },
      { threshold: 0.2, rootMargin: "-80px 0px -40% 0px" }
    );

    sectionEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    if (onItemClick) {
      onItemClick(id);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={cn(
            "fixed top-[64px] left-0 right-0 z-40 flex justify-center px-4",
            className
          )}
        >
          <nav
            className="rounded-2xl border border-border/30 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl bg-background/90 dark:bg-card/80 px-2 py-1.5 flex items-center gap-0.5 overflow-x-auto scrollbar-none max-w-2xl w-full"
            aria-label="Page sections"
          >
            {items.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => { indicatorRefs.current[item.id] = el; }}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "relative flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors duration-200 whitespace-nowrap",
                    isActive
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Gold pill background for active item */}
                  {isActive && (
                    <motion.span
                      layoutId="subnav-active"
                      className="absolute inset-0 rounded-xl bg-gold shadow-sm shadow-gold/30"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
