import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Tag, CreditCard, Sparkles, LayoutGrid,
  ArrowLeftRight, QrCode, Landmark, BookOpen,
  Search, BarChart3, Trophy, TrendingDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setNavDirection } from "@/hooks/use-navigation-direction";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sounds";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Vouchers", href: "/vouchers", icon: Tag },
  { label: "Tools", href: "#tools-sheet", icon: LayoutGrid, isSheet: true },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Perk AI", href: "/perk-ai", icon: Sparkles },
];

const toolsSheetItems = [
  { label: "Compare Cards", href: "/compare", icon: ArrowLeftRight },
  { label: "Find My Card", href: "/find-my-card", icon: Search },
  { label: "Stack Optimizer", href: "/optimize-stack", icon: BarChart3 },
  { label: "Best by Category", href: "/best-for", icon: Trophy },
  { label: "Devaluation", href: "/devaluation-tracker", icon: TrendingDown },
  { label: "QR Scanner", href: "/qr-scanner", icon: QrCode },
  { label: "Banking", href: "/banking", icon: Landmark },
  { label: "Guides Hub", href: "/guides", icon: BookOpen },
  { label: "My Cards", href: "/my-cards", icon: CreditCard },
];

// Sub-paths that should highlight a specific tab
const TAB_CHILD_ROUTES: Record<string, string> = {
  "/banking": "/cards",
  "/compare": "/cards",
  "/find-my-card": "/cards",
  "/optimize-stack": "/cards",
  "/best-for": "/cards",
  "/devaluation-tracker": "/cards",
  "/guides": "/cards",
  "/tools": "/cards",
};

function getTabIndex(pathname: string): number {
  if (pathname === "/") return 0;
  // Direct match first
  const directIdx = tabs.findIndex((t) => !t.isSheet && t.href !== "/" && pathname.startsWith(t.href));
  if (directIdx !== -1) return directIdx;
  // Child route match — check if a parent maps to a tab
  for (const [prefix, tabHref] of Object.entries(TAB_CHILD_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      const parentIdx = tabs.findIndex((t) => t.href === tabHref);
      if (parentIdx !== -1) return parentIdx;
    }
  }
  return -1;
}

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastScrollY = useRef(0);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    // Direct prefix match
    if (location.pathname.startsWith(href)) return true;
    // Map sub-routes to parent tabs
    const mapped = TAB_CHILD_ROUTES[location.pathname] ??
      Object.entries(TAB_CHILD_ROUTES).find(([prefix]) => location.pathname.startsWith(prefix))?.[1];
    return mapped === href;
  };

  // Tools sheet items used for the bottom sheet grid

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setVisible(true);
      else if (currentY > lastScrollY.current + 10) setVisible(false);
      else if (currentY < lastScrollY.current - 10) setVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sheet on navigation
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Tools Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300, duration: 0.25 }}
              className="fixed bottom-0 left-0 right-0 z-[65] lg:hidden"
            >
              <div className="bg-[#1a1a22] rounded-t-2xl border-t border-white/10 pb-[calc(80px+env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-auto">
                {/* Drag handle */}
                <div className="flex justify-center mt-3 mb-4">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                {/* Grid */}
                <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                  {toolsSheetItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          haptic("light");
                          navigate(item.href);
                          setSheetOpen(false);
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 aspect-square rounded-xl border transition-colors ${
                          active
                            ? "bg-gold/15 border-[#C9A44A]/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 active:bg-gold/15"
                        }`}
                      >
                        <item.icon className={`w-[22px] h-[22px] ${active ? "text-gold" : "text-gold"}`} />
                        <span className={`text-xs text-center leading-tight line-clamp-2 ${
                          active ? "text-gold" : "text-white/70"
                        }`}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <motion.nav
        initial={false}
        animate={{ y: visible ? 0 : 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ pointerEvents: visible ? "auto" : "none" }}
        className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="bg-background/95 backdrop-blur-md border-t border-border/50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center h-16">
            {tabs.map((tab) => {
              const active = tab.isSheet ? sheetOpen : isActive(tab.href);
              return tab.isSheet ? (
                <button
                  key="tools-sheet"
                  onClick={() => {
                    haptic("light");
                    playSound("tap");
                    setSheetOpen((p) => !p);
                  }}
                  style={{ touchAction: "manipulation" }}
                  className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 rounded-xl transition-colors active:scale-90"
                  aria-label="Tools"
                >
                  <div className="relative pointer-events-none">
                    <tab.icon className={`w-5 h-5 transition-colors duration-200 ${active ? "text-gold stroke-[2.5]" : "text-muted-foreground/60"}`} />
                    {active && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-gold font-semibold" : "text-muted-foreground/60"}`}>
                    {tab.label}
                  </span>
                </button>
              ) : (
                <Link
                  key={tab.href}
                  to={tab.href}
                  style={{ touchAction: "manipulation" }}
                  onClick={() => {
                    const fromIdx = getTabIndex(location.pathname);
                    const toIdx = tabs.indexOf(tab);
                    if (fromIdx !== toIdx) {
                      haptic("light");
                      playSound("tap");
                      setNavDirection(toIdx > fromIdx ? 1 : -1);
                    }
                    setSheetOpen(false);
                  }}
                  className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 rounded-xl transition-colors active:scale-90"
                  aria-current={active ? "page" : undefined}
                  aria-label={tab.label}
                >
                  <div className="relative pointer-events-none">
                    <tab.icon className={`w-5 h-5 transition-colors duration-200 ${active ? "text-gold stroke-[2.5]" : "text-muted-foreground/60"}`} />
                    {active && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-gold font-semibold" : "text-muted-foreground/60"}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
