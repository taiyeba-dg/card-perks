import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart, Search, ChevronDown, Sun, Moon, X, UserCircle, ScanLine,
  Landmark, GitCompareArrows, QrCode,
  LogOut, Layers, Trophy, Calculator,
  TrendingDown, Coffee, CreditCard, Sparkles, BookOpen, Wallet,
  Settings, User, Shield, Volume2,
} from "lucide-react";
import NavMyCardsIndicator from "@/components/NavMyCardsIndicator";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { isSoundEnabled, setSoundEnabled, playSound } from "@/lib/sounds";
import logo from "@/assets/cardperks-logo.png";

const UniversalSearch = lazy(() => import("@/components/UniversalSearch"));

/* ── Desktop top-level nav links ── */
const navLinks = [
  { label: "Home", shortLabel: "Home", href: "/" },
  { label: "Vouchers", shortLabel: "Vouchers", href: "/vouchers", matchPaths: ["/vouchers"] },
  { label: "Know Your Cards", shortLabel: "Cards", href: "/cards", matchPaths: ["/cards"] },
  { label: "Banking", shortLabel: "Banking", href: "/banking", matchPaths: ["/banking"] },
  { label: "Perk AI", shortLabel: "Perk AI", href: "/perk-ai", matchPaths: ["/perk-ai"] },
  { label: "My Cards", shortLabel: "My Cards", href: "/my-cards", matchPaths: ["/my-cards"] },
  { label: "Guides Hub", shortLabel: "Guides", href: "/guides", matchPaths: ["/guides"] },
];

/* ── Mega menu tool groups ── */
const megaMenuGroups = [
  {
    label: "Calculators",
    items: [
      { label: "Rewards Calculator", href: "/tools/rewards-calculator", icon: Calculator, desc: "Estimate your annual rewards by spend category" },
      { label: "Redemption Calculator", href: "/tools/redemption-calculator", icon: Sparkles, desc: "Find the best way to redeem your points" },
      { label: "Fee Worth Calculator", href: "/tools/fee-worth-calculator", icon: Wallet, desc: "Is your card's annual fee justified?" },
    ],
  },
  {
    label: "Compare & Find",
    items: [
      { label: "Compare Cards", href: "/compare", icon: GitCompareArrows, desc: "Side-by-side comparison of any 2-3 cards" },
      { label: "Find My Card", href: "/find-my-card", icon: Search, desc: "Take a quiz to discover your ideal card" },
      { label: "Stack Optimizer", href: "/optimize-stack", icon: Layers, desc: "Analyze your card stack for coverage gaps" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Best by Category", href: "/best-for", icon: Trophy, desc: "Top cards for dining, travel, fuel & more" },
      { label: "Devaluation Tracker", href: "/devaluation-tracker", icon: TrendingDown, desc: "Monitor reward program changes over time" },
    ],
  },
];

const allToolPaths = megaMenuGroups.flatMap((g) => g.items.map((i) => i.href));

/* ── User avatar dropdown (desktop) ── */
function UserDropdown({ initials, displayName, email, onSignOut, theme, toggleTheme }: {
  initials: string; displayName: string; email: string; onSignOut: () => void; theme: string; toggleTheme: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { if (timeout.current) clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 200); };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { icon: User, label: "Dashboard", href: "/dashboard" },
    { icon: CreditCard, label: "My Cards", href: "/my-cards" },
    { icon: Heart, label: "Favorites", href: "/favorites" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Shield, label: "Privacy", href: "/privacy" },
  ];

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
          {initials}
        </div>
        <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{displayName}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 z-[60] rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden"
          >
            {/* User info header */}
            <div className="px-4 py-3.5 border-b border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 hover:text-gold transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Quick toggles */}
            <div className="border-t border-border/20 px-4 py-2.5 space-y-2">
              <button
                onClick={() => { toggleTheme(); }}
                className="flex items-center justify-between w-full text-sm text-foreground hover:text-gold transition-colors"
              >
                <span className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
                <span className="text-[10px] text-muted-foreground">{theme === "dark" ? "On" : "Off"}</span>
              </button>
              <button
                onClick={() => {
                  const next = !soundOn;
                  setSoundOn(next);
                  setSoundEnabled(next);
                  if (next) playSound("pop");
                }}
                className="flex items-center justify-between w-full text-sm text-foreground hover:text-gold transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  Sounds
                </span>
                <span className={`text-[10px] ${soundOn ? "text-gold" : "text-muted-foreground"}`}>{soundOn ? "On" : "Off"}</span>
              </button>
            </div>

            {/* Sign out */}
            <div className="border-t border-border/20 py-1.5">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const isActive = (href: string, matchPaths?: string[]) => {
    if (href === "/") return location.pathname === "/";
    const paths = matchPaths ?? [href];
    return paths.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));
  };

  const isToolsActive = allToolPaths.some((p) => isActive(p));

  /* ── Scroll handler ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mega on navigation ── */
  useEffect(() => {
    setMegaOpen(false);
  }, [location.pathname]);

  /* ── Keyboard shortcut for search ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Mega menu hover helpers ── */
  const openMega = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setSearchOpen(false); // Close search when opening mega menu
    setMegaOpen(true);
  }, []);
  const closeMegaDelayed = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl ${
          scrolled
            ? "bg-background/80 border-b border-border/50 shadow-lg shadow-background/50"
            : "bg-background/30"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center h-16 px-4 lg:px-8 w-full">
          <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="CardPerks Home">
            <img src={logo} alt="CardPerks" className="h-9 w-auto rounded-lg" />
          </Link>

          {/* ══════ Desktop nav links ══════ */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 2xl:gap-6 min-w-0 flex-shrink ml-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-tour={link.href === "/vouchers" ? "vouchers" : link.href === "/cards" ? "know-your-cards" : undefined}
                className={`px-2 xl:px-3 2xl:px-4 py-2 text-xs xl:text-sm font-medium transition-colors relative group rounded-lg whitespace-nowrap ${
                  isActive(link.href, link.matchPaths) ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-gold"
                }`}
                aria-current={isActive(link.href, link.matchPaths) ? "page" : undefined}
              >
                <span className="hidden 2xl:inline">{link.label}</span>
                <span className="2xl:hidden">{link.shortLabel}</span>
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold transition-all duration-300 ${
                  isActive(link.href, link.matchPaths) ? "w-3/4" : "w-0 group-hover:w-3/4"
                }`} />
              </Link>
            ))}

            {/* ── Tools mega menu trigger ── */}
            <div
              className="relative"
              onMouseEnter={openMega}
              onMouseLeave={closeMegaDelayed}
            >
              <button
                onClick={() => { if (megaOpen) setMegaOpen(false); else openMega(); }}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                aria-label="Tools navigation menu"
                className={`px-2 xl:px-3 2xl:px-4 py-2 text-xs xl:text-sm font-medium transition-colors flex items-center gap-1 rounded-lg relative group whitespace-nowrap ${
                  isToolsActive ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-gold"
                }`}
              >
                Tools <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold transition-all duration-300 ${
                  isToolsActive ? "w-3/4" : "w-0 group-hover:w-3/4"
                }`} />
              </button>
            </div>
          </div>

          {/* ── Mega menu backdrop + panel (rendered outside relative container) ── */}
          <AnimatePresence>
            {megaOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 top-16 z-40 bg-black/40"
                  onClick={() => setMegaOpen(false)}
                  aria-hidden="true"
                />
                {/* Panel */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="fixed left-4 right-4 top-16 z-50 mt-1 mx-auto max-w-[880px]"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMegaDelayed}
                  role="menu"
                >
                  <div className="bg-[#1a1a22] dark:bg-[#1a1a22] bg-white border border-white/10 dark:border-white/10 border-border/20 rounded-xl shadow-2xl shadow-black/50 p-4 lg:p-6">
                    <div className="grid grid-cols-3 gap-4 lg:gap-8">
                      {megaMenuGroups.map((group, gi) => (
                        <div key={group.label} className={gi < megaMenuGroups.length - 1 ? "border-r border-border/30 pr-6" : ""}>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-4">
                            {group.label}
                          </h3>
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const active = isActive(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  role="menuitem"
                                  onClick={() => setMegaOpen(false)}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-all group/item ${
                                    active ? "bg-gold/10" : "hover:bg-secondary/50"
                                  }`}
                                >
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                    active
                                      ? "bg-gold/20 text-gold"
                                      : "bg-secondary/50 text-muted-foreground group-hover/item:bg-gold/15 group-hover/item:text-gold"
                                  }`}>
                                    <item.icon className="w-[18px] h-[18px]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-medium ${active ? "text-gold" : "text-foreground"}`}>{item.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ══════ Desktop right actions ══════ */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-shrink-0 ml-auto">
            <button data-tour="search-btn" onClick={() => { setMegaOpen(false); setSearchOpen(true); }} aria-label="Search" className="flex items-center gap-1.5 p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50">
              <Search className="w-4 h-4" />
              <kbd className="hidden 2xl:inline text-[10px] font-mono text-muted-foreground/60 bg-secondary/60 border border-border/50 rounded px-1.5 py-0.5">⌘K</kbd>
            </button>
            <button data-tour="theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/qr-scanner" aria-label="QR Scanner" className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50" title="QR Scanner">
              <QrCode className="w-4 h-4" />
            </Link>
            <Link to="/favorites" aria-label="Favorites" className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50">
              <Heart className="w-4 h-4" />
            </Link>
            <NavMyCardsIndicator />
            {user ? (
              <UserDropdown
                initials={initials}
                displayName={displayName}
                email={user.email || ""}
                onSignOut={async () => { await signOut(); navigate("/"); }}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <>
                {/* Support Us: icon-only at <1440px, full button at >=1440px */}
                <Link to="/support" className="hidden 2xl:inline-flex ml-1 px-4 py-2 text-sm font-medium gold-outline-btn rounded-lg items-center gap-1.5" title="Support Us">
                  <Coffee className="w-3.5 h-3.5" /> Support Us
                </Link>
                <Link to="/support" className="2xl:hidden p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-secondary/50" aria-label="Support Us" title="Support Us">
                  <Coffee className="w-4 h-4" />
                </Link>
                <Link to="/login" className="ml-1 px-4 xl:px-5 py-2 text-xs xl:text-sm font-medium gold-outline-btn rounded-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* ══════ Mobile: Quick-action icons + Search + Profile ══════ */}
          <div className="lg:hidden flex items-center flex-1 justify-end gap-1">
            {/* Quick action icons */}
            <div className="flex items-center gap-0.5">
              {[
                { href: "/my-cards", icon: CreditCard, label: "My Cards" },
                { href: "/qr-scanner", icon: ScanLine, label: "QR Scanner" },
                { href: "/favorites", icon: Heart, label: "Favorites" },
                { href: "/support-us", icon: Coffee, label: "Support Us" },
              ].map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-label={item.label}
                    title={item.label}
                    className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
                    style={{ touchAction: "manipulation" }}
                  >
                    <item.icon size={18} className={active ? "text-[#C9A44A]" : "text-white/60"} />
                  </Link>
                );
              })}
            </div>

            {/* Search + Profile */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
                style={{ touchAction: "manipulation" }}
              >
                <Search size={18} className="text-white/60" />
              </button>
              {user ? (
                <Link
                  to="/dashboard"
                  aria-label="Dashboard"
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ touchAction: "manipulation" }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border border-[#C9A44A]/50" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#C9A44A]/20 border border-[#C9A44A]/50 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-[#C9A44A]">{initials.charAt(0)}</span>
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign in"
                  className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
                  style={{ touchAction: "manipulation" }}
                >
                  <UserCircle size={20} className="text-white/60" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <Suspense fallback={null}>
          <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
